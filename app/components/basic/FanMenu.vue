<template>
  <div
      class="menu"
      :class="{ active: isActive }"
      ref="menuRef"
      @mousedown="onMouseDown"
  >
    <!-- trigger 按钮 -->
    <div class="btn trigger" @click="toggleMenu">
      <img src="../../assets/images/icons8-shark-96.png" alt="菜单" :style="{ opacity: isActive ? 1 : 0.5 }" />
    </div>

    <!-- 菜单图标 -->
    <div class="icons">
      <div class="rotater" v-for="(item, i) in menuItems" :key="i">
        <NuxtLink
            v-if="item.to"
            :to="item.to"
            class="btn-icon"
        >
          <span class="label">{{ item.label }}</span>
        </NuxtLink>

        <div
            v-else
            class="btn-icon"
            @click="item.action && item.action()"
        >
          <span class="label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isActive = ref(false)
const toggleMenu = () => isActive.value = !isActive.value

const menuItems = [
  { to: '/', icon: 'ri-home-9-line', label: 'Index' },
  { to: '/blog-page', icon: 'ri-blogger-line', label: 'Blog' },
  { action: () => router.back(), icon: 'ri-arrow-left-line', label: 'Back' }
]

// 拖拽逻辑
const menuRef = ref<HTMLElement | null>(null)
const dragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)

const onMouseDown = (e: MouseEvent) => {
  if (!menuRef.value) return
  dragging.value = true

  // 读取 style.left/top 而不是 getBoundingClientRect
  offsetX.value = parseFloat(menuRef.value.style.left || '0')
  offsetY.value = parseFloat(menuRef.value.style.top || '0')

  startX.value = e.clientX
  startY.value = e.clientY

  e.preventDefault()
}

const onMouseMove = (e: MouseEvent) => {
  if (!dragging.value || !menuRef.value) return

  const dx = e.clientX - startX.value
  const dy = e.clientY - startY.value

  // 新位置
  let newX = offsetX.value + dx
  let newY = offsetY.value + dy

  // 获取菜单尺寸
  const menuRect = menuRef.value.getBoundingClientRect()
  const menuWidth = menuRect.width
  const menuHeight = menuRect.height

  // 获取窗口尺寸
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  const marginTop = 100
  const marginRight = 100
  const marginBottom = 100
  const marginLeft = 60 // 如果左边也想限制，可以改这里

  // 限制拖拽范围
  newX = Math.min(Math.max(marginLeft, newX), windowWidth - menuWidth - marginRight)
  newY = Math.min(Math.max(marginTop, newY), windowHeight - menuHeight - marginBottom)

  // 应用位置
  menuRef.value.style.left = newX + 'px'
  menuRef.value.style.top = newY + 'px'
}

const onMouseUp = () => {
  dragging.value = false
}

const adjustMenuPosition = () => {
  if (!menuRef.value) return

  const menuRect = menuRef.value.getBoundingClientRect()
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  let left = menuRect.left
  let top = menuRect.top

  const marginRight = 100
  const marginBottom = 100
  const marginLeft = 20
  const marginTop = 100

  if (left + menuRect.width + marginRight > windowWidth) {
    left = windowWidth - menuRect.width - marginRight
  }
  if (top + menuRect.height + marginBottom > windowHeight) {
    top = windowHeight - menuRect.height - marginBottom
  }
  if (left < marginLeft) left = marginLeft
  if (top < marginTop) top = marginTop

  menuRef.value.style.left = left + 'px'
  menuRef.value.style.top = top + 'px'
}




onMounted(() => {
  // 初始化 left/top
  if (menuRef.value) {
    const menu = menuRef.value
    const rect = menu.getBoundingClientRect()

    // 把 right/bottom 转成 left/top
    menu.style.left = rect.left + 'px'
    menu.style.top = rect.top + 'px'
    menu.style.right = 'auto'
    menu.style.bottom = 'auto'
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('resize', adjustMenuPosition)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('resize', adjustMenuPosition)
})
</script>

<style lang="scss" scoped>

@import url('https://fonts.googleapis.com/css2?family=Bungee&family=Sour+Gummy:ital,wght@0,100..900;1,100..900&display=swap');

.bungee-regular {
  font-family: "Bungee", sans-serif;
  font-weight: 400;
  font-style: normal;
}


*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.menu {
  position: fixed;
  bottom: 120px;
  right: 150px;
  width: 3em;
  height: 3em;
  z-index: 1000;

  .btn {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.3s;

    &.trigger {
      z-index: 100;
      transform: scale(0.8);
      &:hover { transform: scale(0.9); }
    }
  }

  .rotater {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    transform-origin: 50% 50%;
  }

  .btn-icon {
    opacity: 0;
    z-index: -10;
    align-items: center;     // 垂直居中
    justify-content: flex-start; // 从左到右
    gap: 6px;                // 图标和文字之间的间距
    display: flex;
    width: auto;
    min-width: 4em;
    height: 2.5em;
    flex-direction: row;  // 横向排列
    padding: 0 0.8em;
    border-radius: 1.5em;
    color: #888787;
    font-weight: normal;
    text-decoration: none;
    background: transparent;
    cursor: pointer;
    transition: transform 0.5s, opacity 0.5s, color 0.3s;

    &:hover {
      color: #4da6ff;
    }

    .label {
      display: inline-block;       // 保证文字在一行
      writing-mode: horizontal-tb; // 强制水平方向
      white-space: nowrap;         // 不换行
      font-family: "Bungee", sans-serif;
    }


  }

  &.active {
    .btn-icon { opacity: 1; z-index: 50; }
  }

}

$icon-count: 5;
$distance: 70px;

@for $i from 1 through $icon-count {
  $deg: calc(360deg / $icon-count) * ($i - 1);

  .rotater:nth-child(#{$i}) {
    transform: rotate($deg);
  }

  .menu.active .rotater:nth-child(#{$i}) .btn-icon {
    transform: translateY(-#{$distance}) rotate(-#{$deg});
  }
}
</style>
