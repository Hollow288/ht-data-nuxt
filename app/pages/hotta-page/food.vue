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
        <!-- 优化了内联样式为 class，以便移动端适配 -->
        <div class="food-info-wrapper">
          <img width="100" :src="thisFoodInfo?.foodIcon" :alt="thisFoodInfo?.foodName" loading="lazy"/>
          <div class="food-name">
            {{ thisFoodInfo?.foodName }}
          </div>
          <div class="food-desc">
            {{ thisFoodInfo?.foodDes == '' ? '//**无基本介绍**//' : thisFoodInfo?.foodDes }}
          </div>
          <div class="food-source">
            {{ thisFoodInfo?.source == '' ? '//**无来源介绍**//' : thisFoodInfo?.source }}
          </div>
          <div class="food-detail-html"
               v-html="(thisFoodInfo?.useDescription == '' ? '' : replaceTagWithColor(replaceTagWithColor(thisFoodInfo?.useDescription,'shuzhi','C94F4F'),'ComLblGreen','4C9717') + '<br>') + replaceTagWithColor(replaceTagWithColor(thisFoodInfo?.buffs,'shuzhi','C94F4F'),'ComLblGreen','4C9717')"></div>
        </div>

        <!-- 底部占位/装饰条 -->
        <div style="background-color: #9eb4ed;height: 30px;width: 100%; margin-top: auto;">
          <div style="background-color: #e19eba;height: 30px;width:30%"></div>
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
                  <span class="task-title">{{ item.foodName }}</span>
                  <span class="task-cat">{{ item.foodKey }}</span>
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
                      <span class="task-title">{{ item.foodName }}</span>
                      <span class="task-cat">{{ item.foodKey }}</span>
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
  gap: 20px;
  width: 100%;
  max-width: 1000px;
}

/* 主内容区域 */
.gallery-container {
  min-height: calc(100vh - 100px);
  overflow-y: auto;
  /* width: clamp(300px, 60%, 1000px); 不需要 clamp，交由 flex 控制 */
  flex: 1; /* 自适应宽度 */
  max-width: 1000px;
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
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

/* 详情内容样式 */
.food-info-wrapper {
  height: 100%;
  width: 60%; /* PC 端宽度 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  justify-content: center;
  padding: 40px 20px;
}

.food-name {
  color: rgb(84, 47, 19);
  font-size: 24px;
}

.food-desc, .food-source {
  color: #c4c8cB;
  font-size: 14px;
}

/* Sidebar 样式 */
.sidebar {
  flex: 0 0 25vw;
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

  /* 移动端详情宽度占满 */
  .food-info-wrapper {
    width: 90%;
    padding: 20px 10px;
  }
}

@media (max-height: 600px) {
  .search-panel__header {
    /* 矮屏适配 */
    padding: 15px 20px;
  }
}
</style>