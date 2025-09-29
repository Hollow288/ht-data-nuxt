<template>
  <div v-if="!ready" class="loading-screen">
    <div class="loading-content">
      <div class="loading-dot">QaQ正在准备中<span class="dots"></span></div>
    </div>
  </div>
  <div class="layout" v-else>

    <HeaderBar/>

    <div class="body-wrapper">
      <Transition name="fade-scale" mode="out-in">
        <slot/> <!-- 页面内容会渲染到这里 -->
      </Transition>
    </div>

    <FooterBar/>
    <FanMenu/>
    <PaintClickEffect />
    <ProgressBar />
  </div>
</template>

<script setup>
import HeaderBar from '~/components/basic/HeaderBar.vue'
import FooterBar from '~/components/basic/FooterBar.vue'
import FanMenu from '~/components/basic/FanMenu.vue'
import { ref, onMounted, nextTick } from "vue"
// 页面准备好状态
const ready = ref(false)

onMounted(async () => {
  // 等待 DOM 渲染完成
  await nextTick()

  // 如果有关键数据加载，可以在这里 await
  // await $fetch('/api/initial-data')

  ready.value = true
})

</script>

<style scoped>
/* 你的样式照搬即可 */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.body-wrapper {
  box-sizing: border-box;
  background-color: transparent;
  width: 100%;
  min-height: calc(100vh - 100px); /* 给个基础高度 */
}


.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}


.loading-screen {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #9eb4ed; /* 背景颜色和你的 Header 配色一致 */
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

/* 呼吸动画 */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

/* 文字后面的小点动画 */
.loading-dot .dots::after {
  content: '.';
  animation: dots 1.5s steps(3, end) infinite;
}

@keyframes dots {
  0%, 20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%, 100% { content: '...'; }
}

</style>