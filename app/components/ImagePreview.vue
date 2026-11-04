<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  /** 是否显示预览（配合 v-model:show 使用） */
  show: boolean
  /** 图片地址 */
  src: string
  /** 图片 alt */
  alt?: string
  /** 最小缩放倍数 */
  minScale?: number
  /** 最大缩放倍数 */
  maxScale?: number
  /** 按钮单次缩放步长 */
  step?: number
  /** 确认后将当前旋转角度应用到源文件。 */
  applyRotation?: (degrees: number) => Promise<void>
  rotationDisabled?: boolean
}>(), {
  alt: '预览大图',
  minScale: 0.5,
  maxScale: 5,
  step: 0.25
})

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}>()

const scale = ref(1)
const x = ref(0)
const y = ref(0)
const rotate = ref(0)
const dragging = ref(false)
const confirming = ref(false)
const confirmationError = ref('')

let didDrag = false
let dragStartX = 0
let dragStartY = 0
let dragOriginX = 0
let dragOriginY = 0

function close() {
  if (confirming.value) return
  emit('update:show', false)
  emit('close')
}

function resetTransform() {
  scale.value = 1
  x.value = 0
  y.value = 0
  rotate.value = 0
  confirmationError.value = ''
}

async function confirmRotation() {
  if (!props.applyRotation || props.rotationDisabled || confirming.value) return
  confirming.value = true
  confirmationError.value = ''
  try {
    await props.applyRotation(((rotate.value % 360) + 360) % 360)
    confirming.value = false
    close()
  } catch (error) {
    confirmationError.value = error instanceof Error ? error.message : '调整图片方向失败，请重试'
  } finally {
    confirming.value = false
  }
}

function clampScale(s: number) {
  return Math.min(props.maxScale, Math.max(props.minScale, Math.round(s * 100) / 100))
}

function zoomIn() {
  scale.value = clampScale(scale.value + props.step)
}

function zoomOut() {
  scale.value = clampScale(scale.value - props.step)
  if (scale.value <= 1) {
    x.value = 0
    y.value = 0
  }
}

function rotateLeft() {
  rotate.value -= 90
}

function rotateRight() {
  rotate.value += 90
}

function onWheel(e: WheelEvent) {
  if (confirming.value) return
  const next = clampScale(scale.value + (e.deltaY > 0 ? -0.2 : 0.2))
  scale.value = next
  if (next <= 1) {
    x.value = 0
    y.value = 0
  }
}

function onImgDown(e: MouseEvent) {
  if (confirming.value || scale.value <= 1) return
  dragging.value = true
  didDrag = false
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragOriginX = x.value
  dragOriginY = y.value
}

function onMove(e: MouseEvent) {
  if (!dragging.value) return
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true
  x.value = dragOriginX + dx
  y.value = dragOriginY + dy
}

function onUp() {
  dragging.value = false
}

function onMaskDown() {
  didDrag = false
}

function onMaskClick() {
  // 拖拽结束的那次 click 不应关闭预览
  if (didDrag) {
    didDrag = false
    return
  }
  close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) close()
}

// 每次打开时重置变换
watch(() => props.show, (val) => {
  if (val) resetTransform()
})

watch(() => props.src, () => {
  if (!confirming.value) resetTransform()
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="preview-fade">
      <div
        v-if="show"
        class="image-preview"
        :class="{ 'image-preview--editable': !!applyRotation }"
        :aria-busy="confirming"
        @click="onMaskClick"
        @mousedown.self="onMaskDown"
        @mousemove="onMove"
        @mouseup="onUp"
        @mouseleave="onUp"
        @wheel.prevent="onWheel"
      >
        <img
          class="image-preview__img"
          :class="{ 'image-preview__img--dragging': dragging }"
          :src="src"
          :alt="alt"
          draggable="false"
          :style="{
            transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
            cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default'
          }"
          @click.stop
          @mousedown.stop.prevent="onImgDown"
        />
        <div class="image-preview__controls" @click.stop>
          <div class="image-preview__toolbar">
            <button class="image-preview__btn" :disabled="confirming || scale <= minScale" aria-label="缩小" @click="zoomOut">
              <i class="ri-subtract-line"></i>
            </button>
            <span class="image-preview__scale">{{ Math.round(scale * 100) }}%</span>
            <button class="image-preview__btn" :disabled="confirming || scale >= maxScale" aria-label="放大" @click="zoomIn">
              <i class="ri-add-line"></i>
            </button>
            <span class="image-preview__divider"></span>
            <button class="image-preview__btn" :disabled="confirming" aria-label="向左旋转" @click="rotateLeft">
              <i class="ri-anticlockwise-2-line"></i>
            </button>
            <button class="image-preview__btn" :disabled="confirming" aria-label="向右旋转" @click="rotateRight">
              <i class="ri-clockwise-2-line"></i>
            </button>
            <span class="image-preview__divider"></span>
            <button class="image-preview__btn" :disabled="confirming" aria-label="重置" @click="resetTransform">
              <i class="ri-refresh-line"></i>
            </button>
            <template v-if="applyRotation">
              <span class="image-preview__divider"></span>
              <button
                type="button"
                class="image-preview__btn image-preview__btn--confirm"
                aria-label="确认并应用"
                title="确认并应用"
                :disabled="confirming || rotationDisabled"
                @click="confirmRotation"
              >
                <i class="ri-check-line" aria-hidden="true"></i>
                <span>{{ confirming ? '应用中' : '确认' }}</span>
              </button>
            </template>
          </div>
          <template v-if="applyRotation">
            <p v-if="confirmationError" class="image-preview__error" role="alert">{{ confirmationError }}</p>
            <p v-else class="image-preview__hint">{{ rotationDisabled ? '识别中，暂时无法调整方向' : '确认后将按当前方向识别图片' }}</p>
          </template>
        </div>
        <button class="image-preview__close" :disabled="confirming" @click="close" aria-label="关闭预览">
          <i class="ri-close-line"></i>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.image-preview {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  box-sizing: border-box;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.8);
  cursor: zoom-out;

  &__img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 6px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
    transform-origin: center center;
    transition: transform 0.15s ease;
    will-change: transform;
    user-select: none;
    -webkit-user-drag: none;

    &--dragging {
      transition: none;
    }
  }

  &--editable &__img {
    max-height: calc(90vh - 110px);
  }

  &__controls {
    position: absolute;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    max-width: calc(100vw - 24px);
    cursor: default;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    cursor: default;
  }

  &__hint,
  &__error {
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    text-align: center;
    line-height: 1.5;
  }

  &__error {
    color: #ffb5b5;
  }

  &__scale {
    min-width: 46px;
    text-align: center;
    color: #fff;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    user-select: none;
  }

  &__divider {
    width: 1px;
    height: 18px;
    margin: 0 2px;
    background: rgba(255, 255, 255, 0.25);
  }

  &__btn,
  &__close {
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  &__btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: transparent;
    font-size: 18px;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &--confirm {
      width: auto;
      gap: 4px;
      padding: 0 10px;
      border-radius: 999px;
      font: inherit;
      font-size: 13px;
      white-space: nowrap;

      i {
        font-size: 18px;
      }
    }
  }

  &__close {
    position: absolute;
    top: 20px;
    right: 24px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    font-size: 22px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

@media (max-width: 380px) {
  .image-preview__toolbar { gap: 2px; padding: 5px 6px; }
  .image-preview__btn { width: 28px; }
  .image-preview__btn--confirm { width: auto; padding: 0 8px; }
  .image-preview__scale { min-width: 40px; }
  .image-preview__divider { margin: 0 1px; }
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.2s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}
</style>
