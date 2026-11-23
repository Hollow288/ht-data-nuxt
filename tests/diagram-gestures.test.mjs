import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { zoomTransform } from 'd3-zoom'
import { createArticleMarkdown } from '../app/utils/articleMarkdown.ts'
import { createDiagramZoom } from '../app/utils/diagramZoom.ts'

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} should equal ${expected}`)

function setup(t, count = 1) {
  const source = Array(count).fill('```mermaid\nflowchart TD\nA --> B\n```').join('\n\n')
  const dom = new JSDOM(`<main>${createArticleMarkdown().render(source)}</main>`)
  const observers = []
  const globals = { window: dom.window, Element: dom.window.Element, ResizeObserver: class {
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe() {}
    disconnect() {}
  } }
  const saved = Object.fromEntries(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, value })
  const root = dom.window.document.querySelector('main')
  const controller = createDiagramZoom(root)
  t.after(() => {
    controller.destroy()
    dom.window.close()
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  })
  const views = [...root.querySelectorAll('.mermaid-block')].map(block => {
    const viewport = block.querySelector('.mermaid-output')
    const size = { width: 800, height: 200 }
    // jsdom has no layout engine; use fixed geometry to check gesture focus mathematically.
    Object.defineProperties(viewport, {
      clientWidth: { get: () => size.width }, clientHeight: { get: () => size.height },
      getBoundingClientRect: { value: () => ({ left: 100, top: 200, width: size.width, height: size.height }) },
    })
    const svg = dom.window.document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    Object.defineProperty(svg, 'viewBox', { value: { baseVal: { width: 2000, height: 400 } } })
    viewport.append(svg)
    viewport.hidden = false
    block.querySelector('.mermaid-toolbar').hidden = false
    controller.register(block, svg)
    return { block, viewport, svg, size }
  })
  function wheel(target, deltaY, clientX = 500, clientY = 300) {
    const event = new dom.window.WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY, clientX, clientY })
    target.dispatchEvent(event)
    return event
  }
  function touch(type, points, changed = points) {
    const event = new dom.window.Event(type, { bubbles: true, cancelable: true })
    Object.defineProperties(event, { touches: { value: points }, changedTouches: { value: changed } })
    views[0].viewport.dispatchEvent(event)
    return event
  }
  return { root, views, controller, wheel, touch, observers, window: dom.window }
}

test('ordinary wheel zoom keeps the pointer focus and updates the displayed percentage', t => {
  const { views: [{ viewport, block }], wheel } = setup(t)
  const initial = zoomTransform(viewport)
  const focus = initial.invert([400, 100])
  assert.equal(initial.k, 0.4)
  assert.ok(wheel(viewport, -100).defaultPrevented)
  const enlarged = zoomTransform(viewport)
  assert.ok(enlarged.k > initial.k)
  const anchored = enlarged.apply(focus)
  near(anchored[0], 400)
  near(anchored[1], 100)
  assert.equal(block.querySelector('output').textContent, `${Math.round(enlarged.k * 100)}%`)
  wheel(viewport, 100)
  near(zoomTransform(viewport).k, initial.k)
})

test('wheel input stays inside the diagram at both limits and leaves outside scrolling alone', t => {
  const { root, views: [{ viewport }], wheel } = setup(t)
  wheel(viewport, -100000)
  assert.equal(zoomTransform(viewport).k, 3)
  assert.ok(wheel(viewport, -100).defaultPrevented)
  wheel(viewport, 100000)
  assert.equal(zoomTransform(viewport).k, 0.1)
  assert.ok(wheel(viewport, 100).defaultPrevented)
  assert.ok(!wheel(root, 100).defaultPrevented)
})

test('two-finger pinch scales around the midpoint instead of zooming the article', t => {
  const { views: [{ viewport }], touch } = setup(t)
  const initial = zoomTransform(viewport)
  const focus = initial.invert([400, 100])
  const start = [{ identifier: 0, clientX: 400, clientY: 300 }, { identifier: 1, clientX: 600, clientY: 300 }]
  const spread = [{ identifier: 0, clientX: 300, clientY: 300 }, { identifier: 1, clientX: 700, clientY: 300 }]
  touch('touchstart', start)
  assert.ok(touch('touchmove', spread).defaultPrevented)
  const pinched = zoomTransform(viewport)
  near(pinched.k, initial.k * 2)
  const anchored = pinched.apply(focus)
  near(anchored[0], 400)
  near(anchored[1], 100)
  touch('touchend', [], spread)
})

test('lifting one finger resumes single-finger panning without a scale or position jump', t => {
  const { views: [{ viewport }], touch } = setup(t)
  const start = [{ identifier: 0, clientX: 400, clientY: 300 }, { identifier: 1, clientX: 600, clientY: 300 }]
  const spread = [{ identifier: 0, clientX: 300, clientY: 300 }, { identifier: 1, clientX: 700, clientY: 300 }]
  touch('touchstart', start)
  touch('touchmove', spread)
  const pinched = zoomTransform(viewport)
  touch('touchend', [spread[0]], [spread[1]])
  const moved = { identifier: 0, clientX: 250, clientY: 300 }
  assert.ok(touch('touchmove', [moved]).defaultPrevented)
  const panned = zoomTransform(viewport)
  near(panned.k, pinched.k)
  near(panned.x, pinched.x - 50)
  touch('touchend', [], [moved])
})

test('the fit control resets only its own diagram and keeps fit mode after resizing', t => {
  const { views: [first, second], wheel, observers } = setup(t, 2)
  wheel(first.viewport, -100)
  assert.ok(zoomTransform(first.viewport).k > 0.4)
  assert.equal(zoomTransform(second.viewport).k, 0.4)
  first.block.querySelector('[data-diagram-action="fit"]').click()
  near(zoomTransform(first.viewport).k, 0.4)
  first.size.width = 400
  observers[0].callback([{ target: first.viewport }])
  near(zoomTransform(first.viewport).k, 0.2)
  assert.equal(first.block.querySelector('output').textContent, '20%')
  assert.equal(zoomTransform(second.viewport).k, 0.4)
})

test('original size is 100 percent and remains distinct from fitting the diagram width', t => {
  const { views: [{ block, viewport, size }], observers } = setup(t)
  block.querySelector('[data-diagram-action="reset"]').click()
  near(zoomTransform(viewport).k, 1)
  assert.equal(block.querySelector('output').textContent, '100%')
  size.width = 400
  observers[0].callback([{ target: viewport }])
  near(zoomTransform(viewport).k, 1)
  block.querySelector('[data-diagram-action="fit"]').click()
  near(zoomTransform(viewport).k, 0.2)
  assert.equal(block.querySelector('output').textContent, '20%')
})

test('keyboard zoom and panning stay available without magnifier buttons', t => {
  const { views: [{ viewport }], window } = setup(t)
  const key = value => viewport.dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }))
  key('+')
  const enlarged = zoomTransform(viewport)
  near(enlarged.k, 0.5)
  key('ArrowRight')
  near(zoomTransform(viewport).x, enlarged.x - 40)
  key('0')
  near(zoomTransform(viewport).k, 0.4)
})

test('replacing a themed SVG during wheel zoom preserves the gesture and paints the new SVG', t => {
  const { views: [{ viewport, block, svg }], controller, wheel } = setup(t)
  wheel(viewport, -100)
  const enlarged = zoomTransform(viewport).k
  const replacement = svg.cloneNode(true)
  Object.defineProperty(replacement, 'viewBox', { value: { baseVal: { width: 2000, height: 400 } } })
  viewport.replaceChildren(replacement)
  controller.register(block, replacement)
  near(zoomTransform(viewport).k, enlarged)
  const before = replacement.style.transform
  wheel(viewport, -100)
  assert.notEqual(replacement.style.transform, before)
  assert.ok(zoomTransform(viewport).k > enlarged)
})

test('destroy removes gesture handlers and stops intercepting wheel input', t => {
  const { views: [{ viewport }], controller, wheel } = setup(t)
  const initial = zoomTransform(viewport)
  controller.destroy()
  assert.ok(!wheel(viewport, -100).defaultPrevented)
  assert.equal(zoomTransform(viewport), initial)
})
