<template>
  <div class="layout">
    <!-- Header -->
    <HeaderBar/>

    <!-- 中间内容区域 -->
    <div class="body-wrapper">
      <aside class="left-sidebar">
<!--        左侧栏-->
        <slot name="sidebar">默认内容</slot>
      </aside>

      <main class="main-content">
        <Transition name="fade-scale" mode="out-in">
          <NuxtPage />
        </Transition>
      </main>

      <aside class="right-sidebar">
<!--        右侧栏-->
      </aside>
    </div>
    <FanMenu/>

    <!-- Footer -->
    <FooterBar/>
  </div>
</template>

<script setup>
import HeaderBar from '~/components/HeaderBar.vue'
import FooterBar from '~/components/FooterBar.vue'
import FanMenu from '~/components/FanMenu.vue'
</script>

<style scoped>
/* 整体布局 */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden; /* 整体不滚动，滚动交给 body-wrapper */


  /* 背景图片全屏显示 */
  background-image: url('~/assets/images/img0.jpg'); /* 修改为你的图片路径 */
  background-size: cover;       /* 铺满屏幕，高宽按比例，可能裁剪图片 */
  background-position: center;  /* 居中显示裁剪部分 */
  background-repeat: no-repeat;

}

/* Header 固定 */



/* 中间滚动区域 */
.body-wrapper {
  flex: 1;
  display: flex;
  padding-top: 60px; /* header 高度 */
  padding-bottom: 40px; /* footer 高度 */
  min-height: 0;
  overflow-y: scroll; /* 始终显示滚动条 */


}

/* 左右栏固定 */
.left-sidebar,
.right-sidebar {
  width: 200px;
  padding: 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: calc(100vh - 100px); /* 随内容高度 */
}

/* 中间内容自适应 */
.main-content {
  flex: 1;
  padding: 20px;
  box-sizing: border-box;
}

/* 滚动条美化 */
.body-wrapper::-webkit-scrollbar {
  width: 8px;
}

.body-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.body-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

/* 卡片切换动画 */
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
</style>
