<template>
  <div class="layout">
    <HeaderBar />

    <div class="body-wrapper">
      <aside class="left-sidebar">
        <div class="side">
<!--          <Transition name="fade-scale" mode="out-in">-->
          <component
              v-if="currentComponent"
              :is="currentComponent"
              v-bind="sidebar.componentProps"
              :key="sidebar.current"
          />
<!--          </Transition>-->
        </div>
        <!-- 左侧栏插槽，默认文字是“默认” -->

      </aside>

      <main class="main-content">
        <div class="main">
          <Transition name="fade-scale" mode="out-in">
            <slot /> <!-- 页面内容会渲染到这里 -->
          </Transition>
        </div>
      </main>

      <aside class="right-sidebar"></aside>
    </div>

    <FanMenu />
    <FooterBar />
  </div>
</template>

<script setup>
import HeaderBar from '~/components/basic/HeaderBar.vue'
import FooterBar from '~/components/basic/FooterBar.vue'
import FanMenu from '~/components/basic/FanMenu.vue'
import {useSidebarStore} from "~/stores/sidebar.ts";
import {SidebarMarkdownMenu, SidebarIndex} from "#components";
import {computed, ref} from "vue";
const sidebar = useSidebarStore()


// 动态计算要渲染的组件
debugger
const currentComponent = computed(() => {
  const curr = sidebar.current  // 存到普通变量
  if (curr === 'SidebarMarkdownMenu') return SidebarMarkdownMenu
  if (curr === 'SidebarIndex') return SidebarIndex
  return null
})

</script>

<style scoped>
/* 你的样式照搬即可 */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden; /* 防止 layout 自带滚动 */

  /*

  background-image: url('~/assets/images/img0.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

   */
}

.body-wrapper {
  flex: 1;
  display: flex;
  justify-content: center; /* 水平居中整个三列布局 */
  min-height: 0;
  overflow-y: auto;
}


.left-sidebar,
.right-sidebar {
  flex: 0 0 25%;    /* 占整个容器的 15% */
  min-width: 180px; /* 最小宽度 */
  max-width: 300px; /* 最小宽度 */
  padding: 15px;
  box-sizing: border-box;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  max-height: calc(100vh - 130px);
}

.main-content {
  flex: 1; /* 中间自适应 */
  max-width: 1000px;
  min-width: 600px;
  margin: 15px;
  box-sizing: border-box;
  display: flex;
  justify-content: center; /* 水平居中 card */
  align-items: flex-start;
  max-height: calc(100vh - 130px);
  background-color: transparent;
}


.main {
  width: 100%;
  min-height: calc(100vh - 130px);  /* 给个基础高度 */
}

.side{
  width: 100%;
  height: calc(100vh - 130px);  /* 给个基础高度 */
}


::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
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
