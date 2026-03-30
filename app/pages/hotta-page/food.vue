<script setup lang="ts">

import {NButton, NPopover, NText, NVirtualList} from "naive-ui";
import {ref, onMounted} from "vue";
import { watch } from 'vue'
import type {Food, FoodListDto, FoodListDtoRes, FoodRes} from "~/types/food";
import {BaseAPI} from "~/utils/api";
import {replaceTagWithColor} from "~/utils/common";

const searchText = ref<string>('')
const thisShowKey = ref<string | undefined>()
const loading = ref(false)
const items = ref<FoodListDto[]>([])
const allItems = ref<FoodListDto[]>([])
const thisFoodInfo = ref<Food>()
const showDrawer = ref(false) // 新增：抽屉显示状态

// food filter
const foodRarity = ref<string>('')

const changeFoodRarity = async (rarity: string) => {
  if (foodRarity.value === rarity) {
    foodRarity.value = ''
  } else {
    foodRarity.value = rarity
  }
  await queryFoodList()
}

const onInputFoodSearch = () => {
  if (searchText.value == '') {
    items.value = allItems.value
  } else {
    items.value = allItems.value.filter(n => n.foodName.indexOf(searchText.value) > -1)
  }
}

const queryFoodList = async () => {
  const foodList: FoodListDtoRes = await BaseAPI.apiGet("food/search")
  allItems.value = foodList.data
  onInputFoodSearch()
}

const findFoodInfoByKey = async () => {
  try {
    loading.value = true
    const foodRes: FoodRes = await BaseAPI.apiGet(`food/${thisShowKey.value}`)
    thisFoodInfo.value = foodRes.data
  } finally {
    loading.value = false
  }
}

const showThisFoodInfo = async (foodKey: string) => {
  thisShowKey.value = foodKey
  await findFoodInfoByKey()
  // 新增：移动端点击后关闭抽屉
  showDrawer.value = false
}

const initializePage = async () => {
  await queryFoodList()
  if (allItems.value.length > 0) {
    thisShowKey.value = allItems.value[0]?.foodKey
  }
  await findFoodInfoByKey()
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
        <!-- 顶部展示区：图标 + 名称 + 描述 -->
        <div class="food-hero">
          <img class="food-hero__icon" :src="thisFoodInfo?.foodIcon" :alt="thisFoodInfo?.foodName" loading="lazy"/>
          <h2 class="food-hero__name">{{ thisFoodInfo?.foodName }}</h2>
          <p v-if="thisFoodInfo?.foodDes" class="food-hero__desc">{{ thisFoodInfo?.foodDes }}</p>
        </div>

        <!-- 下方信息区 -->
        <div class="food-body">
          <div v-if="thisFoodInfo?.source" class="food-section">
            <div class="food-section__label">来源</div>
            <div class="food-section__content">{{ thisFoodInfo?.source }}</div>
          </div>

          <div v-if="thisFoodInfo?.useDescription || thisFoodInfo?.buffs" class="food-section">
            <div class="food-section__label">效果</div>
            <div class="food-section__content"
                 v-html="(thisFoodInfo?.useDescription == '' ? '' : replaceTagWithColor(replaceTagWithColor(thisFoodInfo?.useDescription,'shuzhi','C94F4F'),'ComLblGreen','4C9717') + '<br>') + replaceTagWithColor(replaceTagWithColor(thisFoodInfo?.buffs,'shuzhi','C94F4F'),'ComLblGreen','4C9717')"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. PC端侧边栏 (移动端通过 CSS 隐藏) -->
    <aside class="sidebar sidebar--right pc-sidebar">
      <div class="search-panel">
        <header class="search-panel__header">
          <h4 class="search-panel__title">Search</h4>
          <small class="search-panel__subtitle">Search by name and/or type</small>
          <div class="search-panel__input-wrapper">
            <input type="text" v-model="searchText" @input="onInputFoodSearch()" placeholder="Search"/>
          </div>
        </header>
        <div class="search-panel__content">
          <n-virtual-list style="height: 100%" :item-size="50" :items="items">
            <template #default="{ item }">
              <div :key="item.foodKey" class="result-item" :class="{'active': thisShowKey === item.foodKey}"
                   @click="showThisFoodInfo(item.foodKey)">
                <img :key="item.foodKey" decoding="async" class="result-item__avatar" :src="item.foodIcon" alt="">
                <div class="result-item__details">
                  <span class="result-item__title">{{ item.foodName }}</span>
                  <span class="result-item__meta">{{ item.foodKey }}</span>
                </div>
              </div>
            </template>
          </n-virtual-list>
        </div>
      </div>
    </aside>

    <!-- 3. 移动端悬浮按钮 -->
    <button class="toc-toggle-btn" @click="showDrawer = true" aria-label="搜索">
      <i class="ri-search-line"></i>
    </button>

    <!-- 4. 移动端抽屉 -->
    <Teleport to="body">
      <!-- 遮罩层 -->
      <Transition name="fade">
        <div v-if="showDrawer" class="custom-drawer-mask" @click="showDrawer = false"></div>
      </Transition>

      <!-- 抽屉面板 -->
      <Transition name="slide">
        <div v-if="showDrawer" class="custom-drawer-panel">
          <div class="drawer-layout">
            <!-- 抽屉头部 -->
            <header class="search-panel__header drawer-header">
              <h4 class="search-panel__title">Search</h4>
              <small class="search-panel__subtitle">Search by name and/or type</small>
              <div class="search-panel__input-wrapper">
                <input type="text" v-model="searchText" @input="onInputFoodSearch" placeholder="Search"/>
              </div>
            </header>

            <!-- 抽屉列表 -->
            <div class="drawer-body">
              <n-virtual-list style="height: 100%;" :item-size="50" :items="items">
                <template #default="{ item }">
                  <div
                      :key="item.foodKey"
                      class="result-item"
                      :class="{ active: thisShowKey === item.foodKey }"
                      @click="showThisFoodInfo(item.foodKey)"
                  >
                    <img :key="item.foodKey" decoding="async" class="result-item__avatar" :src="item.foodIcon" alt=""/>
                    <div class="result-item__details">
                      <span class="result-item__title">{{ item.foodName }}</span>
                      <span class="result-item__meta">{{ item.foodKey }}</span>
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

/* 全局布局容器 */
.page-container-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
  max-width: 1000px;
}

/* 主内容区域 */
.gallery-container {
  min-height: calc(100vh - 104px);
  overflow-y: visible;
  flex: 1;
  width: 0;
  max-width: 1000px;
  background: var(--bg-card);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  //padding: 40px 20px;

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

/* =========================================
   食物内容区样式
   ========================================= */

/* 顶部展示区 */
.food-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 30px 24px 24px;
  border-bottom: 1px solid var(--border-color);

  &__icon {
    width: 88px;
    height: 88px;
    object-fit: contain;
    border-radius: 16px;
    background: var(--markdown-body-table-tr-2);
    padding: 10px;
  }

  &__name {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-main);
    margin: 14px 0 0;
    line-height: 1.3;
  }

  &__desc {
    margin: 12px 0 0;
    font-size: 13px;
    color: var(--summary-50);
    line-height: 1.6;
    max-width: 420px;
  }
}

/* 下方信息区 */
.food-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 通用 section */
.food-section {
  background: var(--markdown-body-table-tr-2);
  border-radius: 10px;
  padding: 16px 20px;

  &__label {
    font-size: 11px;
    font-weight: 600;
    color: var(--custom-tag);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  &__content {
    color: var(--text-main);
    font-size: 13px;
    line-height: 1.7;
  }
}

/* Sidebar 样式 */
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

/* =========================================
   移动端抽屉与按钮 (Mobile Drawer & FAB)
   ========================================= */

.toc-toggle-btn {
  display: none; /* 默认隐藏，在 media query 中显示 */
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

.custom-drawer-mask {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 998;
  backdrop-filter: blur(2px);
}

.custom-drawer-panel {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 85%;
  max-width: 340px;
  z-index: 999;
  box-shadow: -4px 0 15px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.drawer-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.drawer-header {
  flex-shrink: 0;
}

.drawer-body {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: var(--bg-card);
}

/* 动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }



/* =========================================
   移动端适配 (Mobile Adaptation)
   ========================================= */
@media screen and (max-width: 850px) {
  .pc-sidebar {
    display: none !important;
  }

  .toc-toggle-btn {
    display: flex;
  }

  .gallery-container {
    width: 100%;
    margin: 0;
    height: auto;
    min-height: auto;
  }

  .food-hero {
    padding: 24px 16px 20px;

    &__icon {
      width: 72px;
      height: 72px;
    }

    &__name {
      font-size: 20px;
    }
  }

  .food-body {
    padding: 16px;
    gap: 12px;
  }

  .food-section {
    padding: 14px 16px;
  }
}

@media (max-height: 600px) {
  .search-panel__header {
    /* 矮屏适配 */
    padding: 15px 20px;
  }
}
</style>