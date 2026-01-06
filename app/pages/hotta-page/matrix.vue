<script setup lang="ts">

import {NButton, NPopover, NText, NVirtualList} from "naive-ui";
import {ref} from "vue";
import type {Matrix, MatrixListDto, MatrixListDtoRes, MatrixRes} from "~/types/matrix";
import {onMounted} from 'vue'
import { watch } from 'vue'
import {replaceTagWithColor} from "~/utils/common";
import {BaseAPI} from "~/utils/api";

const searchText = ref<string>('')
const thisShowKey = ref<string | undefined>()
const popoverVisible = ref(false)
const popoverVisibleMobile = ref(false)
const loading = ref(false)
const items = ref<MatrixListDto[]>([])
const allItems = ref<MatrixListDto[]>([])
const thisMatrixInfo = ref<Matrix>()
const showDrawer = ref(false)
// matrix filter
const matrixRarity = ref<string>('')

const changeMatrixRarity = async (rarity: string) => {
  if (matrixRarity.value === rarity) {
    matrixRarity.value = ''
  } else {
    matrixRarity.value = rarity
  }
  await queryMatrixList()
}

const onInputMatrixSearch = () => {
  if (searchText.value == '') {
    items.value = allItems.value
  } else {
    items.value = allItems.value.filter(n => n.matrixName.indexOf(searchText.value) > -1)
  }
}

const queryMatrixList = async () => {
  const matrixList: MatrixListDtoRes = await BaseAPI.apiGet("matrix/search",{'matrixRarity':encodeURIComponent(matrixRarity.value)})
  allItems.value = matrixList.data
  onInputMatrixSearch()
}

const findMatrixInfoByKey = async () => {
  try {
    loading.value = true
    const matrixRes: MatrixRes = await BaseAPI.apiGet(`matrix/${thisShowKey.value}`)
    thisMatrixInfo.value = matrixRes.data
  } finally {
    loading.value = false
  }
}

const showThisMatrixInfo = async (matrixKey: string) => {
  thisShowKey.value = matrixKey
  await findMatrixInfoByKey()
  // 核心：在移动端点击后，自动关闭抽屉
  showDrawer.value = false
}

const initializePage = async () => {
  await queryMatrixList()
  if (allItems.value.length > 0) {
    thisShowKey.value = allItems.value[0]?.matrixKey
  }
  await findMatrixInfoByKey()
};

watch(showDrawer, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(async () => {
  await initializePage();
});

</script>

<template>
  <div class="page-container-wrapper">

    <!-- 1. 主要内容区域 -->
    <div class="gallery-container">
      <div v-if="loading" class="gallery-container__status">{{ '加载中...' }}</div>
      <div v-else class="gallery-container__content">
        <div class="gallery-container__content__left">
          <img width="150" :src="thisMatrixInfo?.matrixIcon" :alt="thisMatrixInfo?.matrixName" class="gallery-card__image" loading="lazy"/>
          <div class="level">{{ thisMatrixInfo?.matrixQuality }}</div>
          <div class="name">{{ thisMatrixInfo?.matrixName }}</div>
<!--          <div class="description" v-html="replaceTagWithColor(thisMatrixInfo?.useDescription,'shuzhi','C94F4F')"></div>-->
        </div>
        <div class="gallery-container__content__right">
          <div class="matrix-detail">

            <div v-for="(items,index) in thisMatrixInfo?.matrixDetail" style="display: flex;margin-bottom: 10px">
              <div style="display: flex;flex-direction: column;">
                <span class="level">{{ items.type }}：</span>
                <!--              <span class="stars">{{ items.type }} : </span>-->
                <span class="desc" v-html="replaceTagWithColor(items.desc,'shuzhi','C94F4F')"></span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. PC端侧边栏 (移动端隐藏) -->
    <aside class="sidebar sidebar--right pc-sidebar">
      <div class="search-panel">
        <header class="search-panel__header">
          <h4 class="search-panel__title">Search</h4>
          <small class="search-panel__subtitle">Search by name and/or type</small>
          <div class="search-panel__input-wrapper">
            <n-popover
                trigger="click"
                placement="bottom"
                v-model:show="popoverVisible"
                :arrow-style="{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }"
                style="max-width: 200px; background-color: var(--white-black-50);box-sizing: border-box;padding:0;"
            >
              <template #trigger>
                <i class="ri-filter-3-line" :class="{ 'active': popoverVisible }"></i>
              </template>
              <template #header>
                <n-text style="color:var(--text-main)" strong depth="1">Type filter</n-text>
              </template>
              <div class="filter-group">
                <p style="color:var(--text-main)">Rarity:</p>
                <div class="button-group">
                  <NButton color="#9E8BA8" :dashed="matrixRarity!=='SSR'" size="tiny"
                           @click="changeMatrixRarity('SSR')">SSR
                  </NButton>
                  <NButton color="#9E8BA8" :dashed="matrixRarity!=='SR'" size="tiny"
                           @click="changeMatrixRarity('SR')">SR
                  </NButton>
                </div>
              </div>
            </n-popover>
            <input type="text" v-model="searchText" @input="onInputMatrixSearch()" placeholder="Search"/>
          </div>
        </header>
        <div class="search-panel__content">
          <n-virtual-list style="height: 100%" :item-size="50" :items="items">
            <template #default="{ item }">
              <div :key="item.matrixKey" class="result-item" :class="{'active': thisShowKey === item.matrixKey}"
                   @click="showThisMatrixInfo(item.matrixKey)">
                <img loading="lazy" decoding="async" class="result-item__avatar" :src="item.matrixIcon" alt="">
                <div class="result-item__details">
                  <span class="task-title">{{ item.matrixName }}</span>
                  <span class="task-cat">{{ item.matrixQuality }}</span>
                </div>
              </div>
            </template>
          </n-virtual-list>
        </div>
      </div>
    </aside>

    <!-- 3. 移动端悬浮按钮 (PC端隐藏) -->
<!--    <div class="mobile-fab" @click="showDrawer = true">-->
<!--      <i class="ri-list-check"></i>-->
<!--      <span>列表</span>-->
<!--    </div>-->

    <button class="toc-toggle-btn" @click="showDrawer = true" aria-label="搜索">
      <i class="ri-search-line"></i>
    </button>

    <!-- 4. 移动端抽屉 (PC端隐藏，内容复用侧边栏逻辑) -->
    <Teleport to="body">
      <!-- 遮罩层 -->
      <Transition name="fade">
        <div v-if="showDrawer" class="custom-drawer-mask" @click="showDrawer = false"></div>
      </Transition>

      <!-- 抽屉面板 -->
      <Transition name="slide">
        <div v-if="showDrawer" class="custom-drawer-panel">
          <!-- 核心布局容器 -->
          <div class="drawer-layout">

            <!-- 固定头部 -->
            <header class="search-panel__header drawer-header">
              <h4 class="search-panel__title">Search</h4>
              <small class="search-panel__subtitle">Search by name and/or type</small>
              <div class="search-panel__input-wrapper">
                <n-popover
                    trigger="click"
                    placement="bottom"
                    v-model:show="popoverVisibleMobile"
                    :arrow-style="{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }"
                    style="max-width: 200px; background-color: var(--white-black-50); box-sizing: border-box; padding: 0; z-index: 1000;"
                >
                  <template #trigger>
                    <i class="ri-filter-3-line" :class="{ active: popoverVisibleMobile }"></i>
                  </template>
                  <template #header>
                    <n-text style="color:var(--text-main)" strong depth="1">Type filter</n-text>
                  </template>
                  <div class="filter-group">
                    <p  style="color:var(--text-main)">Rarity:</p>
                    <div class="button-group">
                      <NButton color="#9E8BA8" :dashed="matrixRarity !== 'SSR'" size="tiny" @click="changeMatrixRarity('SSR')">SSR</NButton>
                      <NButton color="#9E8BA8" :dashed="matrixRarity !== 'SR'" size="tiny" @click="changeMatrixRarity('SR')">SR</NButton>
                    </div>
                  </div>
                </n-popover>
                <input type="text" v-model="searchText" @input="onInputMatrixSearch" placeholder="Search"/>
              </div>
            </header>

            <!-- 滚动列表区域 (Flex: 1) -->
            <div class="drawer-body">
              <n-virtual-list
                  style="height: 100%;"
                  :item-size="50"
                  :items="items"
              >
                <template #default="{ item }">
                  <div
                      :key="item.matrixKey"
                      class="result-item"
                      :class="{ active: thisShowKey === item.matrixKey }"
                      @click="showThisMatrixInfo(item.matrixKey)"
                  >
                    <img loading="lazy" decoding="async" class="result-item__avatar" :src="item.matrixIcon" alt=""/>
                    <div class="result-item__details">
                      <span class="task-title">{{ item.matrixName }}</span>
                      <span class="task-cat">{{ item.matrixQuality }}</span>
                    </div>
                  </div>
                </template>
              </n-virtual-list>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped lang="scss">

/* PC 端布局容器 */
.page-container-wrapper {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.gallery-container {
  min-height: calc(100vh - 100px);
  overflow-y: auto;
  background: var(--bg-card);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &__status {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
    font-size: 1rem;
    min-height: 100%;
  }

  &__content {
    display: flex;
    height: 100%;

    &__left {
      width: 40%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 100%;
      position: relative;
      padding-top: 20px;

      ::after {
        content: "";
        position: absolute;
        top: 10%;
        bottom: 10%;
        right: 0;
        width: 1px;
        background-image: linear-gradient(to bottom, transparent, #ccc, transparent);
      }

      .level {
        text-transform: uppercase;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 3px;
        color: #EC9B3B;
      }

      .name {
        font-size: 26px;
        color: var(--text-main);
        font-weight: 900;
        margin-bottom: 5px;
      }

      .description {
        padding: 20px 20px 30px;
        word-break: break-all;
      }
    }

    &__right {
      width: 60%;
      padding: 20px 20px 15px;
      display: flex;

      .matrix-detail {
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        justify-content: center;

        .level {
          text-transform: uppercase;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #EC9B3B;
        }

        .stars {
          font-size: 12px;
          width: 80px;
          display: inline-block;
          line-height: 1.2;
          user-select: none;
          margin-right: 10px;
        }

        .desc {
          color: #555;
          flex: 1;
          word-break: break-all;
          align-items: flex-start;
          margin-top: -4px;
        }
      }
    }
  }
}

/* PC Sidebar 样式 */
.sidebar {
  flex: 0 0 25%;
  min-height: calc(100vh - 100px);
  max-height: calc(100vh - 100px);
  min-width: 180px;
  max-width: 300px;
  box-sizing: border-box;
  position: sticky;
  top: 40px;
  background: var(--bg-card);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
  cursor: default;
}

/* 搜索面板通用样式 */
.search-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    background-color: var(--search-panel);
    color: #fff;
    padding: 30px 20px;
  }

  &__title {
    margin: 0;
  }

  &__subtitle {
    display: inline-block;
    margin: 5px 0 20px;
    opacity: 0.8;
  }

  &__input-wrapper {
    position: relative;
    width: 100%;

    input {
      background-color: rgba(0, 0, 0, 0.3);
      border: 0;
      border-radius: 50px;
      color: #fff;
      font-size: 14px;
      padding: 10px 15px;
      width: 100%;

      &:focus {
        outline: none;
      }
    }

    i {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.7);
      font-size: 18px;
      cursor: pointer;
      z-index: 10;

      &:hover, &.active {
        color: #FFF;
      }
    }
  }

  &__content {
    flex: 1;
    min-height: 0;
    position: relative;
  }
}

.result-item {
  display: flex;
  align-items: center;
  height: 50px;
  box-sizing: border-box;

  &:hover {
    background-color: rgba(128, 128, 128, 0.1);
    cursor: pointer;
  }

  &.active {
    background-color: rgba(128, 128, 128, 0.1);
  }

  &__avatar {
    margin-left: 10px;
    width: 28px;
    border-radius: 50%;
    margin-right: 10px;
  }

  &__details {
    display: flex;
    flex-direction: column;
  }
}

.filter-group {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 8px;

  p {
    width: 60px;
    margin: 0;
    line-height: 24px;
    font-weight: 500;
  }
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex: 1;
}

.task-title {
  font-size: 13px;
  display: inline-block;
}

.task-cat {
  font-size: 10px;
  display: block;
  color: #888;
}


.custom-drawer-mask {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 998;
  backdrop-filter: blur(2px);
}

/* 抽屉本体 */
.custom-drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 85%;
  max-width: 340px;
  z-index: 999;
  box-shadow: -4px 0 15px rgba(0,0,0,0.1);
  /* 确保抽屉内部布局占满 */
  display: flex;
  flex-direction: column;
}

/* 抽屉内部 Flex 布局核心 */
.drawer-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.drawer-header {
  flex-shrink: 0; /* 头部不被压缩，高度固定 */
  /* 这里直接复用了 search-panel__header 的样式 */
}

.drawer-body {
  flex: 1; /* 占据剩余高度 */
  overflow: hidden; /* 隐藏溢出，交给内部 Virtual List 处理滚动 */
  position: relative;
  background-color: var(--bg-card);
}

/* =========================================
   Vue 动画 (Transitions)
   ========================================= */

/* Fade 动画 (Mask) */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Slide 动画 (Drawer) */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }


.toc-toggle-btn {
  display: none;
  position: fixed;
  right: 15px;
  bottom: 90px;
  min-width: 50px;
  min-height: 50px;
  background: var(--bg-card);
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: none;
  opacity: 0.8;
  z-index: 900;
  color: #BBCCF6;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.9);
  }

  &:hover {
    background-color: var(--back-btn-hover);
  }
}

:deep(.n-virtual-list) {
  overscroll-behavior: contain;
}

/* =========================================
   移动端适配代码 (Mobile Adaptation)
   ========================================= */
@media screen and (max-width: 768px) {

  /* 1. 隐藏 PC 端侧边栏 */
  .pc-sidebar {
    display: none !important;
  }

  .toc-toggle-btn{
    display: flex;
  }


  .gallery-container {
    width: 100%;
    margin: 0;
    height: auto;
    min-height: auto;
  }
  .gallery-container__content {
    flex-direction: column;
  }
  .gallery-container__content__left {
    width: 100%;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 20px;
  }
  .gallery-container__content__right {
    width: 100%;
    padding: 20px;
  }
}
</style>