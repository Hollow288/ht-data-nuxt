const MIN_SCALE = 0.1
const MAX_SCALE = 3
const ZOOM_STEP = 1.25

interface DiagramView {
  viewport: HTMLElement
  svg: SVGSVGElement
  toolbar: HTMLElement
  width: number
  height: number
  scale: number
  mode: 'fit' | 'manual'
  viewportWidth: number
}

/** Size the SVG itself so native scrolling and touch gestures follow the zoom. */
export function createDiagramZoom(root: HTMLElement) {
  const views = new Map<HTMLElement, DiagramView>()
  let drag: {
    view: DiagramView
    pointerId: number
    x: number
    y: number
  } | null = null
  const fitScale = (view: DiagramView) => Math.min(1, view.viewport.clientWidth / view.width)
  const minScale = (view: DiagramView) => Math.min(MIN_SCALE, fitScale(view))

  function stopDrag() {
    const current = drag
    if (!current) return
    drag = null
    current.view.viewport.classList.remove('is-dragging')
    if (current.view.viewport.hasPointerCapture(current.pointerId)) {
      current.view.viewport.releasePointerCapture(current.pointerId)
    }
  }

  function onPointerDown(event: PointerEvent) {
    // Touch already pans the native scroll container, including browser pinch zoom.
    if (event.pointerType === 'touch' || event.button !== 0 || !event.isPrimary) return
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('a, button, input, select, textarea, [contenteditable="true"]')) return
    const block = target?.closest<HTMLElement>('.mermaid-block')
    const view = block && views.get(block)
    if (!view || !view.viewport.contains(target) || !view.viewport.classList.contains('is-pannable')) return
    const bounds = view.viewport.getBoundingClientRect()
    // Leave the native scrollbar gutters available for their usual interactions.
    if (event.clientX >= bounds.left + view.viewport.clientWidth || event.clientY >= bounds.top + view.viewport.clientHeight) return

    stopDrag()
    event.preventDefault()
    view.viewport.focus({ preventScroll: true })
    view.viewport.setPointerCapture(event.pointerId)
    view.viewport.classList.add('is-dragging')
    drag = { view, pointerId: event.pointerId, x: event.clientX, y: event.clientY }
  }

  function onPointerMove(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    drag.view.viewport.scrollLeft -= event.clientX - drag.x
    drag.view.viewport.scrollTop -= event.clientY - drag.y
    drag.x = event.clientX
    drag.y = event.clientY
  }

  function onPointerEnd(event: PointerEvent) {
    if (drag?.pointerId === event.pointerId) stopDrag()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') stopDrag()
  }

  function paint(view: DiagramView, scale: number, keepCenter = false) {
    const viewportBounds = view.viewport.getBoundingClientRect()
    const svgBounds = view.svg.getBoundingClientRect()
    const centerX = (viewportBounds.left + view.viewport.clientWidth / 2 - svgBounds.left) / view.scale
    const centerY = (viewportBounds.top + view.viewport.clientHeight / 2 - svgBounds.top) / view.scale
    view.scale = scale
    view.svg.style.width = `${view.width * scale}px`
    view.svg.style.height = `${view.height * scale}px`
    if (keepCenter) {
      const horizontalMargin = Math.max(0, (view.viewport.clientWidth - view.width * scale) / 2)
      view.viewport.scrollLeft = centerX * scale + horizontalMargin - view.viewport.clientWidth / 2
      const verticalMargin = Math.max(16, (view.viewport.clientHeight - view.height * scale) / 2)
      view.viewport.scrollTop = centerY * scale + verticalMargin - view.viewport.clientHeight / 2
    }
    const pannable = view.viewport.scrollWidth > view.viewport.clientWidth + 1 || view.viewport.scrollHeight > view.viewport.clientHeight + 1
    view.viewport.classList.toggle('is-pannable', pannable)
    view.toolbar.querySelector('output')!.textContent = `${Math.round(scale * 100)}%`
    view.toolbar.querySelector<HTMLButtonElement>('[data-diagram-action="out"]')!.disabled = scale <= minScale(view) + 0.0001
    view.toolbar.querySelector<HTMLButtonElement>('[data-diagram-action="in"]')!.disabled = scale >= MAX_SCALE - 0.0001
    view.toolbar.querySelector('[data-diagram-action="fit"]')!.setAttribute('aria-pressed', String(view.mode === 'fit'))
  }

  function resize(view: DiagramView) {
    if (!view.viewport.clientWidth) return
    view.viewportWidth = view.viewport.clientWidth
    const fitted = fitScale(view)
    // Keep the reading layout stable while the reader zooms inside the diagram.
    view.viewport.style.setProperty('--diagram-view-height', `${Math.max(200, view.height * fitted + 32)}px`)
    paint(view, view.mode === 'fit' ? fitted : Math.max(minScale(view), view.scale))
  }

  const observer = new ResizeObserver(entries => {
    for (const { target } of entries) {
      const block = target.closest<HTMLElement>('.mermaid-block')
      const view = block && views.get(block)
      if (view && view.viewport.clientWidth !== view.viewportWidth) resize(view)
    }
  })

  function onClick(event: MouseEvent) {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-diagram-action]')
    const block = button?.closest<HTMLElement>('.mermaid-block')
    const view = block && views.get(block)
    if (!button || button.disabled || !view) return
    const action = button.dataset.diagramAction
    if (action === 'fit') {
      view.mode = 'fit'
      paint(view, fitScale(view))
      view.viewport.scrollTo(0, 0)
    } else if (action === 'reset') {
      view.mode = 'manual'
      paint(view, 1, true)
    } else if (action === 'in' || action === 'out') {
      view.mode = 'manual'
      const scale = view.scale * (action === 'in' ? ZOOM_STEP : 1 / ZOOM_STEP)
      paint(view, Math.min(MAX_SCALE, Math.max(minScale(view), scale)), true)
    }
  }
  root.addEventListener('click', onClick)
  root.addEventListener('pointerdown', onPointerDown)
  root.addEventListener('pointermove', onPointerMove)
  root.addEventListener('pointerup', onPointerEnd)
  root.addEventListener('pointercancel', onPointerEnd)
  root.addEventListener('lostpointercapture', onPointerEnd)
  root.addEventListener('keydown', onKeyDown)
  window.addEventListener('blur', stopDrag)

  function clear() {
    stopDrag()
    observer.disconnect()
    views.clear()
  }

  return {
    register(block: HTMLElement, svg: SVGSVGElement) {
      const { width, height } = svg.viewBox.baseVal
      const toolbar = block.querySelector<HTMLElement>('.mermaid-toolbar')!
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        toolbar.hidden = true
        return
      }
      const previous = views.get(block)
      if (drag?.view === previous) stopDrag()
      const view: DiagramView = {
        viewport: block.querySelector<HTMLElement>('.mermaid-output')!, svg, toolbar,
        width, height, scale: previous?.scale ?? 1, mode: previous?.mode ?? 'fit', viewportWidth: 0,
      }
      views.set(block, view)
      resize(view)
      observer.observe(view.viewport)
    },
    clear,
    destroy() {
      clear()
      root.removeEventListener('click', onClick)
      root.removeEventListener('pointerdown', onPointerDown)
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerup', onPointerEnd)
      root.removeEventListener('pointercancel', onPointerEnd)
      root.removeEventListener('lostpointercapture', onPointerEnd)
      root.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('blur', stopDrag)
    },
  }
}
