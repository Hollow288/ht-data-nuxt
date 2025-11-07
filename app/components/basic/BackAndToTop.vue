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
</style>
