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
  const fitScale = (view: DiagramView) => Math.min(1, view.viewport.clientWidth / view.width)
  const minScale = (view: DiagramView) => Math.min(MIN_SCALE, fitScale(view))

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

  function clear() {
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
    },
  }
}
