<template>
  <transition name="fade">
    <div v-if="visible" class="back-container">
      <button class="back-btn" @click="scrollToTop" aria-label="回到顶部">
        <i class="ri-arrow-up-s-line"></i>
      </button>
      <button class="back-btn" @click="goBack" aria-label="返回上一页">
        <i class="ri-arrow-left-s-line"></i>
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const visible = ref(false)
const router = useRouter()

const handleScroll = () => {
  visible.value = window.scrollY > 50
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-container {
  position: fixed;
  right: 20px;
  bottom: 70px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 1000;
}

/* 公共按钮样式 */
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  min-width: 50px;
  min-height: 50px;
  background-color: #fff;
  color: #BBCCF6;
  border: none;
  cursor: pointer;
  font-size: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: background 0.1s, transform 0.1s;
}

.back-btn span {
  display: inline-block;
}

/* 悬浮效果 */
.back-btn:hover {
  background-color: #fcf7f8;
}



/* 淡入淡出过渡 */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}


@media screen and (max-width: 768px) {
  .back-container {
    right: 15px; /* 靠右边近一点 */
    bottom: 30px; /* 稍微往下放一点，离拇指更近 */
  }

  /* 隐藏“返回上一页”按钮 */
  /* 假设你在 template 里给返回按钮加个特定的 class 或者用 :nth-child */
  /* 为了方便，建议修改 template 给两个按钮分别加 class，见下方 HTML 修改建议 */

  /* 如果不想改 HTML，可以用 nth-child(2) 选择第二个按钮 (goBack) */
  .back-btn:nth-child(2) {
    display: none;
  }

  /* 调整移动端按钮样式 */
  .back-btn {
    width: 40px; /* 稍微做小一点点 */
    height: 40px;
    font-size: 20px;
    opacity: 0.8; /* 稍微透明，避免遮挡文字太严重 */
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  /* 滚动时稍微透明，停止时恢复 (如果想做高级点可以加 JS，这里简单处理保持半透明即可) */
}

/* 动画部分保持不变 */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>
