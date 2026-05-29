<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  /** 图片地址 */
  src: string
  /** 图片 alt / 预览标题 */
  alt?: string
  /** 缩略图宽度，数字按 px 处理，默认撑满父容器 */
  width?: number | string
  /** 缩略图高度，数字按 px 处理，默认撑满父容器 */
  height?: number | string
  /** 缩略图填充模式（object-fit） */
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}>(), {
  alt: '预览图片',
  width: '100%',
  height: '100%',
  fit: 'cover'
})

const show = ref(false)

const boxStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

function openPreview() {
  if (props.src) show.value = true
}
</script>

<template>
  <div class="image-thumb" :style="boxStyle" @click.stop="openPreview">
    <img
      class="image-thumb__img"
      :src="src"
      :alt="alt"
      :style="{ objectFit: fit }"
      draggable="false"
    />
    <span class="image-thumb__zoom" aria-hidden="true">
      <i class="ri-zoom-in-line"></i>
    </span>
    <ImagePreview v-model:show="show" :src="src" :alt="alt" />
  </div>
</template>

<style scoped lang="scss">
.image-thumb {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: zoom-in;

  &:hover .image-thumb__zoom {
    opacity: 1;
  }

  &__img {
    width: 100%;
    height: 100%;
    display: block;
  }

  &__zoom {
    position: absolute;
    right: 5px;
    bottom: 1px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;

    i {
      font-size: 17px;
      color: #fff;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.75);
    }
  }
}
</style>
