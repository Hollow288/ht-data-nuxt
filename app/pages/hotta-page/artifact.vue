<script setup lang="ts">

import {NButton, NPopover, NText, NVirtualList} from "naive-ui";
import {ref} from "vue";
import type {Artifact, ArtifactListDto, ArtifactListDtoRes, ArtifactRes} from "~/types/artifact";
import {onMounted} from 'vue'
import { watch } from 'vue'
import {replaceTagWithColor} from "~/utils/common";
import {BaseAPI} from "~/utils/api";

const searchText = ref<string>('')
const thisShowKey = ref<string | undefined>()
const popoverVisible = ref(false)
const popoverVisibleMobile = ref(false)
const loading = ref(false)
const items = ref<ArtifactListDto[]>([])
const allItems = ref<ArtifactListDto[]>([])
const thisArtifactInfo = ref<Artifact>()
const showDrawer = ref(false)
// artifact filter
const artifactRarity = ref<string>('')

const changeArtifactRarity = async (rarity: string) => {
  if (artifactRarity.value === rarity) {
    artifactRarity.value = ''
  } else {
    artifactRarity.value = rarity
  }
  await queryArtifactList()
}

const onInputArtifactSearch = () => {
  if (searchText.value == '') {
    items.value = allItems.value
  } else {
    items.value = allItems.value.filter(n => n.artifactName.indexOf(searchText.value) > -1)
  }
}

const queryArtifactList = async () => {
  const artifactList: ArtifactListDtoRes = await BaseAPI.apiGet("artifact/search",{'artifactRarity':encodeURIComponent(artifactRarity.value)})
  allItems.value = artifactList.data
  onInputArtifactSearch()
}

const findArtifactInfoByKey = async () => {
  try {
    loading.value = true
    const artifactRes: ArtifactRes = await BaseAPI.apiGet(`artifact/${thisShowKey.value}`)
    thisArtifactInfo.value = artifactRes.data
  } finally {
    loading.value = false
  }
}

const showThisArtifactInfo = async (artifactKey: string) => {
  thisShowKey.value = artifactKey
  await findArtifactInfoByKey()
  // 核心：在移动端点击后，自动关闭抽屉
  showDrawer.value = false
}

const initializePage = async () => {
  await queryArtifactList()
  if (allItems.value.length > 0) {
    thisShowKey.value = allItems.value[0]?.artifactKey
  }
  await findArtifactInfoByKey()
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
        <div class="artifact-hero">
          <img class="artifact-hero__icon" :src="thisArtifactInfo?.artifactIcon" :alt="thisArtifactInfo?.artifactName" loading="lazy"/>
          <span v-if="thisArtifactInfo?.artifactRarity" class="artifact-hero__tag">{{ thisArtifactInfo?.artifactRarity }}</span>
          <h2 class="artifact-hero__name">{{ thisArtifactInfo?.artifactName }}</h2>
        </div>

        <div class="artifact-body">
          <div v-if="thisArtifactInfo?.useDescription" class="artifact-section">
            <div class="artifact-section__label">效果</div>
            <div class="artifact-section__content"
                 v-html="replaceTagWithColor(thisArtifactInfo?.useDescription,'shuzhi','C94F4F')"></div>
          </div>

          <div v-if="thisArtifactInfo?.artifactDetail?.length" class="artifact-section">
            <div class="artifact-section__label">星级效果</div>
            <div class="artifact-rank-list">
              <div v-for="(item, index) in thisArtifactInfo?.artifactDetail" :key="`${thisShowKey}-${index}`" class="artifact-rank-item">
                <div class="artifact-rank-item__stars">{{ '⭐'.repeat(index + 1) }}</div>
                <div class="artifact-rank-item__desc" v-html="replaceTagWithColor(item,'shuzhi','C94F4F')"></div>
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
                  <NButton color="#9E8BA8" :dashed="artifactRarity!=='SSR'" size="tiny"
                           @click="changeArtifactRarity('SSR')">SSR
                  </NButton>
                  <NButton color="#9E8BA8" :dashed="artifactRarity!=='SR'" size="tiny"
                           @click="changeArtifactRarity('SR')">SR
                  </NButton>
                </div>
              </div>
            </n-popover>
            <input type="text" v-model="searchText" @input="onInputArtifactSearch()" placeholder="Search"/>
          </div>
        </header>
        <div class="search-panel__content">
          <n-virtual-list style="height: 100%" :item-size="50" :items="items">
            <template #default="{ item }">
              <div :key="item.artifactKey" class="result-item" :class="{'active': thisShowKey === item.artifactKey}"
                   @click="showThisArtifactInfo(item.artifactKey)">
                <img :key="item.artifactKey" decoding="async" class="result-item__avatar" :src="item.artifactThumbnail" alt="">
                <div class="result-item__details">
                  <span class="result-item__title">{{ item.artifactName }}</span>
                  <span class="result-item__meta">{{ item.artifactRarity }}</span>
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
                    <p style="color:var(--text-main)">Rarity:</p>
                    <div class="button-group">
                      <NButton color="#9E8BA8" :dashed="artifactRarity !== 'SSR'" size="tiny" @click="changeArtifactRarity('SSR')">SSR</NButton>
                      <NButton color="#9E8BA8" :dashed="artifactRarity !== 'SR'" size="tiny" @click="changeArtifactRarity('SR')">SR</NButton>
                    </div>
                  </div>
                </n-popover>
                <input type="text" v-model="searchText" @input="onInputArtifactSearch" placeholder="Search"/>
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
                      :key="item.artifactKey"
                      class="result-item"
                      :class="{ active: thisShowKey === item.artifactKey }"
                      @click="showThisArtifactInfo(item.artifactKey)"
                  >
                    <img :key="item.artifactKey" decoding="async" class="result-item__avatar" :src="item.artifactThumbnail" alt=""/>
                    <div class="result-item__details">
                      <span class="result-item__title">{{ item.artifactName }}</span>
                      <span class="result-item__meta">{{ item.artifactRarity }}</span>
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
  justify-content: flex-start;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
  max-width: 1000px;
}

.gallery-container {
  min-height: calc(100vh - 104px);
  overflow-y: auto;
  background: var(--bg-card);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  flex: 1;
  width: 0;

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
    flex-direction: column;
  }
}

.artifact-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 30px 24px 24px;
  border-bottom: 1px solid var(--border-color);

  &__icon {
    width: 132px;
    height: 132px;
    object-fit: contain;
    border-radius: 24px;
    background: var(--markdown-body-table-tr-2);
    padding: 16px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  }

  &__tag {
    display: inline-block;
    margin-top: 14px;
    padding: 4px 14px;
    border-radius: 999px;
    background: rgba(236, 155, 59, 0.14);
    color: #EC9B3B;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.4px;
  }

  &__name {
    margin: 12px 0 0;
    color: var(--text-main);
    font-size: 26px;
    font-weight: 800;
    line-height: 1.3;
  }
}

.artifact-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.artifact-section {
  background: var(--markdown-body-table-tr-2);
  border-radius: 10px;
  padding: 16px 20px;

  &__label {
    margin-bottom: 10px;
    color: var(--custom-tag);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  &__content {
    color: var(--text-main);
    font-size: 13px;
    line-height: 1.7;
    word-break: break-word;
  }
}

.artifact-rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.artifact-rank-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);

  &__stars {
    flex: 0 0 72px;
    color: #EC9B3B;
    font-size: 12px;
    line-height: 1.5;
    user-select: none;
  }

  &__desc {
    flex: 1;
    color: var(--text-main);
    font-size: 13px;
    line-height: 1.7;
    word-break: break-word;
  }
}

/* PC Sidebar 样式 */
.sidebar {
  flex: 0 0 25vw;
  height: calc(100vh - 104px);
  min-width: 180px;
  max-width: 300px;
  box-sizing: border-box;
  position: sticky;
  top: 84px;
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

.result-item__title {
  font-size: 13px;
  display: inline-block;
}

.result-item__meta {
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
@media screen and (max-width: 850px) {

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

  .artifact-hero {
    padding: 24px 16px 20px;

    &__icon {
      width: 104px;
      height: 104px;
      border-radius: 20px;
      padding: 14px;
    }

    &__name {
      font-size: 22px;
    }
  }

  .artifact-body {
    padding: 16px;
    gap: 12px;
  }

  .artifact-section {
    padding: 14px 16px;
  }

  .artifact-rank-item {
    flex-direction: column;
    gap: 8px;

    &__stars {
      flex-basis: auto;
    }
  }
}
</style>
