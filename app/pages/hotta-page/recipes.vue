<script setup lang="ts">

import {NButton, NPopover, NText, NVirtualList} from "naive-ui";
import {ref, onMounted} from "vue";
import { watch } from 'vue'
import type {Recipes, RecipesListDto, RecipesListDtoRes, RecipesRes} from "~/types/recipes";
import {BaseAPI} from "~/utils/api";
import {replaceTagWithColor} from "~/utils/common";

const searchText = ref<string>('')
const thisShowKey = ref<string | undefined>()
const popoverVisible = ref(false)
const popoverVisibleMobile = ref(false) // 新增：移动端筛选弹窗状态
const loading = ref(false)
const items = ref<RecipesListDto[]>([])
const allItems = ref<RecipesListDto[]>([])
const thisRecipesInfo = ref<Recipes>()
const showDrawer = ref(false) // 新增：抽屉显示状态

// recipes filter
const recipesCategories = ref<string>('')

const categoriesList = ref<string[]>(['治疗', '耐力回复', '饱食度', '潜泳加速', '持续治疗', '解毒', '冰攻提高', '物攻提高', '火攻提高', '雷攻提高', '冰抗提高', '物抗提高', '火抗提高', '雷抗提高'])

const changeRecipesCategories = async (categories: string) => {
  if (recipesCategories.value === categories) {
    recipesCategories.value = ''
  } else {
    recipesCategories.value = categories
  }
  await queryRecipesList()
}

const onInputRecipesSearch = () => {
  if (searchText.value == '') {
    items.value = allItems.value
  } else {
    items.value = allItems.value.filter(n => n.recipesName.indexOf(searchText.value) > -1)
  }
}

const queryRecipesList = async () => {
  const recipesList: RecipesListDtoRes = await BaseAPI.apiGet("recipes/search", {'categories': recipesCategories.value})
  allItems.value = recipesList.data
  onInputRecipesSearch()
}

const findRecipesInfoByKey = async () => {
  try {
    loading.value = true
    const recipesRes: RecipesRes = await BaseAPI.apiGet(`recipes/how-make/${thisShowKey.value}`)
    thisRecipesInfo.value = recipesRes.data
  } finally {
    loading.value = false
  }
}

const showThisRecipesInfo = async (recipesKey: string) => {
  thisShowKey.value = recipesKey
  await findRecipesInfoByKey()
  // 新增：移动端点击后关闭抽屉
  showDrawer.value = false
}

const initializePage = async () => {
  await queryRecipesList()
  if (allItems.value.length > 0) {
    thisShowKey.value = allItems.value[0]?.recipesKey
  }
  await findRecipesInfoByKey()
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
        <div class="recipes-info-wrapper">
          <img width="100" :src="thisRecipesInfo?.recipesIcon" :alt="thisRecipesInfo?.recipesName" loading="lazy"/>
          <div class="recipes-name">
            {{ thisRecipesInfo?.recipesName }}
          </div>
          <div class="recipes-des">
            {{ thisRecipesInfo?.recipesDes == '' ? '//**无基本介绍**//' : thisRecipesInfo?.recipesDes }}
          </div>
          <div class="recipes-categories">
            {{ thisRecipesInfo?.categories == '' ? '//**无分类介绍**//' : thisRecipesInfo?.categories }}
          </div>
          <div class="recipes-buffs-description"
               v-html="(thisRecipesInfo?.useDescription == '' ? '' : replaceTagWithColor(replaceTagWithColor(thisRecipesInfo?.useDescription,'shuzhi','C94F4F'),'ComLblGreen','4C9717') + '<br>') + replaceTagWithColor(replaceTagWithColor(thisRecipesInfo?.buffs,'shuzhi','C94F4F'),'ComLblGreen','4C9717')"></div>

          <div class="details with-line">
            制 作 方 式
          </div>

          <div class="ingredients-list">
            <div v-for="item in thisRecipesInfo?.ingredientsList" :key="item.ingredientName" class="ingredient-item">
              <div class="img-container">
                <img :src="item.ingredientIcon"
                     :alt="item.ingredientName" class="item-image"/>
                <div class="ingredient-name">{{ item.ingredientName }}</div>
                <div class="quantity">{{ item.ingredientNum }}</div>
              </div>
            </div>
          </div>

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
            <n-popover
                trigger="click"
                placement="bottom"
                v-model:show="popoverVisible"
                :arrow-style="{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }"
                style="max-width: 400px; background-color: var(--white-black-50);box-sizing: border-box;padding:0"
            >
              <template #trigger>
                <i class="ri-filter-3-line" :class="{ 'active': popoverVisible }"></i>
              </template>
              <template #header>
                <n-text style="color:var(--text-main)" strong depth="1">Type filter</n-text>
              </template>
              <div class="filter-group">
                <p style="color:var(--text-main)">类别:</p>
                <div class="button-group">
                  <div v-for="item in categoriesList" :key="item">
                    <NButton color="#9E8BA8" :dashed="recipesCategories!==item" size="tiny"
                             @click="changeRecipesCategories(item)">{{ item }}
                    </NButton>
                  </div>
                </div>
              </div>
            </n-popover>
            <input type="text" name="filter" id="filter" v-model="searchText" @input="onInputRecipesSearch()"
                   placeholder="Search"/>
          </div>
        </header>
        <div class="search-panel__content">
          <n-virtual-list style="height: 100%" :item-size="50" :items="items">
            <template #default="{ item }">
              <div :key="item.recipesKey" class="result-item" :class="{'active': thisShowKey === item.recipesKey}"
                   @click="showThisRecipesInfo(item.recipesKey)">
                <img :key="item.recipesKey" decoding="async" class="result-item__avatar"
                     :src="item.recipesIcon" alt="">
                <div class="result-item__details">
                  <span class="task-title">{{ item.recipesName }}</span>
                  <span class="task-cat">{{ item.recipesKey }}</span>
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
                    <p style="color:var(--text-main)">类别:</p>
                    <div class="button-group">
                      <div v-for="item in categoriesList" :key="item">
                        <NButton color="#9E8BA8" :dashed="recipesCategories!==item" size="tiny"
                                 @click="changeRecipesCategories(item)">{{ item }}
                        </NButton>
                      </div>
                    </div>
                  </div>
                </n-popover>
                <input type="text" v-model="searchText" @input="onInputRecipesSearch" placeholder="Search"/>
              </div>
            </header>

            <!-- 抽屉列表 -->
            <div class="drawer-body">
              <n-virtual-list style="height: 100%;" :item-size="50" :items="items">
                <template #default="{ item }">
                  <div
                      :key="item.recipesKey"
                      class="result-item"
                      :class="{ active: thisShowKey === item.recipesKey }"
                      @click="showThisRecipesInfo(item.recipesKey)"
                  >
                    <img :key="item.recipesKey" decoding="async" class="result-item__avatar" :src="item.recipesIcon" alt=""/>
                    <div class="result-item__details">
                      <span class="task-title">{{ item.recipesName }}</span>
                      <span class="task-cat">{{ item.recipesKey }}</span>
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
  justify-content: center;
  gap: 20px;
  width: 100%;
}

/* 主内容区域 */
.gallery-container {
  min-height: calc(100vh - 100px);
  overflow-y: auto;
  flex: 1; /* 自适应宽度 */
  max-width: 1000px; /* 限制最大宽度 */
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
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

/* 食谱详情信息样式 */
.recipes-info-wrapper {
  height: 100%;
  width: 60%; /* PC 端宽度 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  justify-content: center;
  padding: 40px 20px; /* 增加内边距 */
}

.recipes-name {
  color: rgb(84, 47, 19);
  font-size: 24px;
}

.recipes-des, .recipes-categories, .recipes-buffs-description {
  color: #c4c8cB;
  font-size: 14px;
  word-break: break-all; /* 避免长文本溢出 */
}

/* 制作方式标题 */
.details {
  justify-content: center;
  margin-top: 20px; /* 增加上边距 */
  margin-bottom: 15px;
  display: flex;
  padding: 10px;
  border-radius: 5px;
  flex-direction: column;
  font-size: 20px;
  font-weight: bold;
}

.details.with-line::after {
  content: "";
  display: block;
  width: 60px;
  height: 3px;
  margin: 2px auto 0;
  border-radius: 3px;
  font-weight: 900;
  background: linear-gradient(
          90deg,
          #9eb4ed 0%,
          #9eb4ed 30%,
          #e19eba 30%,
          #e19eba 100%
  );
}

/* 食材列表样式 */
.ingredients-list {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  justify-content: center;
  padding: 10px;
  gap: 20px; /* 调整间距 */
  margin-bottom: 15px;
}

.ingredient-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.img-container {
  position: relative;
  display: inline-block;
}

.item-image {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover; /* 确保图片不变形 */
}

.quantity {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: rgba(255, 12, 12, 0.7);
  color: white;
  font-size: 12px;
  width: 15px;
  height: 15px;
  line-height: 15px; /* 垂直居中数字 */
  text-align: center;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ingredient-name {
  font-size: 12px;
  color: var(--text-main);
  padding: 2px 0px;
  width: 80px; /* 确保名称有足够的宽度显示 */
  text-align: center;
  word-break: break-all; /* 允许名称换行 */
  margin-top: 5px; /* 与图片保持一定距离 */
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
  background-color: #fff;
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
  .recipes-info-wrapper {
    width: 90%;
    padding: 20px 10px;
  }

  .ingredients-list {
    flex-direction: row; /* 在小屏幕上横向排列 */
    justify-content: center;
    gap: 15px; /* 调整间距 */
  }

  .ingredient-item {
    min-width: 70px; /* 确保每个食材项有最小宽度 */
    max-width: 80px;
  }

  .ingredient-name {
    width: auto; /* 自动调整宽度 */
  }
}

@media (max-height: 600px) {
  .search-panel__header {
    /* 矮屏适配 */
    padding: 15px 20px;
  }
}
</style>