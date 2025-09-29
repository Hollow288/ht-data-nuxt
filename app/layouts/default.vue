<template>

  <div class="layout">

    <HeaderBar/>

    <div class="body-wrapper">
      <Transition name="fade-scale" mode="out-in">
        <slot/> <!-- 页面内容会渲染到这里 -->
      </Transition>
    </div>

    <FooterBar/>
    <FanMenu/>

  </div>
</template>

<script setup>
import HeaderBar from '~/components/basic/HeaderBar.vue'
import FooterBar from '~/components/basic/FooterBar.vue'
import FanMenu from '~/components/basic/FanMenu.vue'
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

</style>