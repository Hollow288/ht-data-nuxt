import { select } from 'd3-selection'
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom'

const MIN_SCALE = 0.1
const MAX_SCALE = 3
const ZOOM_STEP = 1.25

interface DiagramView {
  viewport: HTMLElement
  svg: SVGSVGElement
  toolbar: HTMLElement
  gesture: ZoomBehavior<HTMLElement, unknown>
  transform: ZoomTransform
  width: number
  height: number
  mode: 'fit' | 'manual'
  viewportWidth: number
  viewportHeight: number
}

/** D3 handles pointer-anchored wheel zoom and the transition between touch pan and pinch. */
export function createDiagramZoom(root: HTMLElement) {
  const views = new Map<HTMLElement, DiagramView>()
  let drag: { view: DiagramView; pointerId: number; x: number; y: number } | null = null
  const fitScale = (view: DiagramView) => Math.min(1, view.viewport.clientWidth / view.width)
  const extent = (view: DiagramView): [[number, number], [number, number]] =>
    [[0, 16], [view.viewport.clientWidth, view.viewport.clientHeight - 16]]

  function findView(target: EventTarget | null) {
    if (!(target instanceof Element)) return
    const block = target.closest<HTMLElement>('.mermaid-block')
    const view = block && views.get(block)
    return view && view.viewport.contains(target) ? view : undefined
  }

  function paint(view: DiagramView, transform: ZoomTransform) {
    view.transform = transform
    view.svg.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`
    const pannable = view.width * transform.k > view.viewport.clientWidth + 1
      || view.height * transform.k > view.viewport.clientHeight - 32 + 1
    view.viewport.classList.toggle('is-pannable', pannable)
    view.toolbar.querySelector('output')!.textContent = `${Math.round(transform.k * 100)}%`
  }

  function fit(view: DiagramView) {
    const scale = fitScale(view)
    const x = (view.viewport.clientWidth - view.width * scale) / 2
    const y = Math.max(16, (view.viewport.clientHeight - view.height * scale) / 2)
    select(view.viewport).call(view.gesture.transform, zoomIdentity.translate(x, y).scale(scale))
    view.mode = 'fit'
  }

  function resize(view: DiagramView) {
    if (!view.viewport.clientWidth) return
    const center = view.transform.invert([view.viewportWidth / 2, view.viewportHeight / 2])
    view.viewport.style.setProperty('--diagram-view-height', `${Math.max(200, view.height * fitScale(view) + 32)}px`)
    view.viewportWidth = view.viewport.clientWidth
    view.viewportHeight = view.viewport.clientHeight
    view.gesture.scaleExtent([Math.min(MIN_SCALE, fitScale(view)), MAX_SCALE])
    if (view.mode === 'fit') fit(view)
    else {
      const scale = Math.max(Math.min(MIN_SCALE, fitScale(view)), view.transform.k)
      const transform = zoomIdentity
        .translate(view.viewportWidth / 2 - center[0] * scale, view.viewportHeight / 2 - center[1] * scale)
        .scale(scale)
      const constrained = view.gesture.constrain()(transform, extent(view), [[0, 0], [view.width, view.height]])
      select(view.viewport).call(view.gesture.transform, constrained)
    }
  }

  const observer = new ResizeObserver(entries => {
    for (const { target } of entries) {
      const view = findView(target)
      if (view && (view.viewport.clientWidth !== view.viewportWidth || view.viewport.clientHeight !== view.viewportHeight)) resize(view)
    }
  })

  function stopDrag() {
    const current = drag
    if (!current) return
    drag = null
    current.view.viewport.classList.remove('is-dragging')
    if (current.view.viewport.hasPointerCapture(current.pointerId)) current.view.viewport.releasePointerCapture(current.pointerId)
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'touch' || event.button !== 0 || !event.isPrimary) return
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('a, button, input, select, textarea, [contenteditable="true"]')) return
    const view = findView(target)
    if (!view?.viewport.classList.contains('is-pannable')) return
    stopDrag()
    event.preventDefault()
    view.viewport.focus({ preventScroll: true })
    view.viewport.setPointerCapture(event.pointerId)
    view.viewport.classList.add('is-dragging')
    view.mode = 'manual'
    drag = { view, pointerId: event.pointerId, x: event.clientX, y: event.clientY }
  }

  function onPointerMove(event: PointerEvent) {
    if (!drag || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    select(drag.view.viewport).call(drag.view.gesture.translateBy,
      (event.clientX - drag.x) / drag.view.transform.k,
      (event.clientY - drag.y) / drag.view.transform.k)
    drag.x = event.clientX
    drag.y = event.clientY
  }

  function onPointerEnd(event: PointerEvent) {
    if (drag?.pointerId === event.pointerId) stopDrag()
  }

  function onWheel(event: WheelEvent) {
    // Contain wheel input at the zoom limits too, where D3 would otherwise scroll the article.
    if (event.deltaY && findView(event.target)) event.preventDefault()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') { stopDrag(); return }
    const view = findView(event.target)
    if (!view || event.ctrlKey || event.metaKey || event.altKey) return
    const selection = select(view.viewport)
    const direction: Record<string, [number, number]> = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }
    const delta = direction[event.key]
    if (delta || ['+', '=', '-', '0'].includes(event.key)) {
      event.preventDefault()
      view.mode = 'manual'
      if (delta) selection.call(view.gesture.translateBy, delta[0] / view.transform.k, delta[1] / view.transform.k)
      else if (event.key === '0') fit(view)
      else selection.call(view.gesture.scaleBy, event.key === '-' ? 1 / ZOOM_STEP : ZOOM_STEP)
    }
  }

  function onClick(event: MouseEvent) {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('[data-diagram-action]')
    const block = button?.closest<HTMLElement>('.mermaid-block')
    const view = block && views.get(block)
    if (!view || !button) return
    if (button.dataset.diagramAction === 'fit') fit(view)
    else if (button.dataset.diagramAction === 'reset') {
      select(view.viewport).call(view.gesture.scaleTo, 1)
      view.mode = 'manual'
    }
  }

  root.addEventListener('click', onClick)
  root.addEventListener('pointerdown', onPointerDown)
  root.addEventListener('pointermove', onPointerMove)
  root.addEventListener('pointerup', onPointerEnd)
  root.addEventListener('pointercancel', onPointerEnd)
  root.addEventListener('lostpointercapture', onPointerEnd)
  root.addEventListener('keydown', onKeyDown)
  root.addEventListener('wheel', onWheel, { capture: true, passive: false })
  window.addEventListener('blur', stopDrag)

  function clear() {
    stopDrag()
    observer.disconnect()
    for (const view of views.values()) select(view.viewport).on('.zoom', null)
    views.clear()
  }

  return {
    register(block: HTMLElement, svg: SVGSVGElement) {
      const { width, height } = svg.viewBox.baseVal
      const toolbar = block.querySelector<HTMLElement>('.mermaid-toolbar')!
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) { toolbar.hidden = true; return }
      const previous = views.get(block)
      if (drag?.view === previous) stopDrag()
      // Reuse the gesture while replacing a themed SVG, including an active wheel/pinch.
      const view: DiagramView = previous ?? {
        viewport: block.querySelector<HTMLElement>('.mermaid-output')!, svg, toolbar,
        gesture: zoom<HTMLElement, unknown>(), transform: zoomIdentity,
        width, height, mode: 'fit', viewportWidth: 0, viewportHeight: 0,
      }
      view.svg = svg
      view.width = width
      view.height = height
      view.gesture.extent(() => extent(view)).translateExtent([[0, 0], [width, height]])
        .touchable(() => true)
        .filter(event => event.type === 'wheel' || event.type.startsWith('touch'))
        .on('zoom', event => {
          if (event.sourceEvent && (event.transform.k !== view.transform.k
            || event.transform.x !== view.transform.x || event.transform.y !== view.transform.y)) view.mode = 'manual'
          paint(view, event.transform)
        })
      svg.style.width = `${width}px`
      svg.style.height = `${height}px`
      views.set(block, view)
      select(view.viewport).call(view.gesture).on('dblclick.zoom', null)
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
      root.removeEventListener('wheel', onWheel, true)
      window.removeEventListener('blur', stopDrag)
    },
  }
}
