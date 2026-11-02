<script setup lang="ts">
const props = defineProps<{ active: boolean; slow: boolean }>()
const emit = defineEmits<{ skip: [] }>()
const writingCycle = ref(0)
let replayTimer: ReturnType<typeof setTimeout> | undefined

// Pen strokes, rather than font outlines, let each letter be written naturally.
let delay = 120
const strokes = [
  { d: 'M29 113C36 90 46 55 52 36', duration: 180 },
  { d: 'M26 82C44 77 64 73 82 74', duration: 80 },
  { d: 'M90 35C80 63 68 93 70 109C71 119 81 109 89 98', duration: 220 },
  { d: 'M110 81C99 76 88 88 88 101C87 114 98 118 108 108C118 98 121 81 113 80C107 79 108 91 119 91C124 91 126 88 130 85', duration: 180 },
  { d: 'M123 100C136 83 153 50 149 38C146 27 139 36 135 47C126 71 119 105 128 112C133 116 141 108 147 100', duration: 210 },
  { d: 'M147 100C160 83 177 50 173 38C170 27 163 36 159 47C150 71 143 105 152 112C157 116 165 108 171 100', duration: 200 },
  { d: 'M192 81C181 76 170 88 170 101C169 114 180 118 190 108C200 98 203 81 195 80C189 79 190 91 201 91C206 91 210 87 214 83', duration: 180 },
  { d: 'M214 83C208 97 205 109 212 112C220 116 231 96 236 83C230 103 228 116 238 112C251 107 265 91 264 82C263 76 259 83 262 90C267 101 277 96 281 91', duration: 240 },
  { d: 'M292 57C292 65 288 72 283 76', duration: 80 },
  { d: 'M322 83C315 76 300 80 300 88C300 94 320 97 320 104C319 116 301 119 294 110C292 105 300 102 309 104C318 108 329 108 339 99', duration: 200 },
  { d: 'M436 48C427 29 393 39 389 58C385 76 423 78 424 95C425 115 391 124 379 109C373 101 377 94 385 95', duration: 280 },
  { d: 'M454 83C449 105 442 132 440 145', duration: 100 },
  { d: 'M451 99C461 79 477 76 478 90C479 105 463 120 453 108C461 115 476 110 486 100', duration: 180 },
  { d: 'M516 84C505 75 489 87 487 101C484 116 497 117 508 103L519 83C514 95 509 112 516 113C521 113 527 105 533 99', duration: 190 },
  { d: 'M562 84C553 75 537 85 534 99C529 116 546 119 562 104L570 97', duration: 160 },
  { d: 'M569 98C584 101 598 85 590 81C581 76 568 92 570 104C572 119 590 116 605 103C611 99 617 97 623 98', duration: 220 }
].map(({ d, duration }) => {
  const stroke = { d, style: { '--stroke-delay': `${delay}ms`, '--stroke-duration': `${duration}ms` } }
  delay += duration + 12
  return stroke
})

function replay() {
  clearTimeout(replayTimer)
  if (!props.active) return
  // Hold the completed signature briefly, then start a fresh set of strokes.
  replayTimer = setTimeout(() => {
    if (props.active) writingCycle.value++
  }, 900)
}

watch(() => props.active, active => {
  if (!active) clearTimeout(replayTimer)
})
onBeforeUnmount(() => clearTimeout(replayTimer))

async function skip() {
  emit('skip')
  await nextTick()
  document.getElementById('main-content')?.focus({ preventScroll: true })
}
</script>

<template>
  <Transition name="splash">
    <div v-if="active" class="site-splash" aria-label="网站正在加载">
      <div class="splash-content">
        <svg class="splash-wordmark" viewBox="0 0 656 176" fill="none" aria-hidden="true">
          <g :key="writingCycle">
            <path v-for="(stroke, index) in strokes" :key="index" :d="stroke.d" :style="stroke.style" pathLength="1" @animationend="index === strokes.length - 1 && replay()" />
          </g>
        </svg>
        <p class="splash-status" role="status" aria-live="polite" aria-atomic="true">{{ slow ? '加载比平时慢一些，可以跳过等待' : '正在加载 Hollow’s Space' }}</p>
        <button v-if="slow" class="splash-skip" type="button" @click="skip">
          先进去看看
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12H19M14 7L19 12L14 17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.site-splash {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  overflow: hidden;
  min-height: 100svh;
  background: var(--bg-body);
  color: var(--accent);
}
.splash-content { position: relative; width: min(500px, calc(100% - 48px)); }
.splash-wordmark { display: block; width: 100%; height: auto; overflow: visible; }
.splash-wordmark path { stroke: currentColor; stroke-width: 2.8; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; animation: splash-write var(--stroke-duration) ease-in-out var(--stroke-delay) both; }
.splash-status { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.splash-skip { position: absolute; top: calc(100% - 4px); right: 5%; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 8px 0; border: 0; background: transparent; color: var(--text-muted); font: 12px var(--font-sans); white-space: nowrap; transition: color .2s; }
.splash-skip:hover { color: var(--accent); }
.splash-skip svg { flex-shrink: 0; }
.splash-leave-active { transition: opacity .4s ease, visibility .4s; }
.splash-leave-to { opacity: 0; visibility: hidden; pointer-events: none; }
@keyframes splash-write { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) {
  .splash-wordmark path { animation: none; stroke-dashoffset: 0; }
  .splash-leave-active { transition-duration: .01ms; }
}
</style>

<style>
html:has(.site-splash) { overflow: hidden; scrollbar-gutter: stable; }
</style>
