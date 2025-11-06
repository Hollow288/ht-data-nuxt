<script setup lang="ts">

import {NButton, NPopover, NText, NVirtualList} from "naive-ui";
import {ref} from "vue";
import type {Recipes, RecipesListDto, RecipesListDtoRes, RecipesRes} from "~/types/recipes";
import {onMounted} from 'vue'
import {BaseAPI} from "~/utils/api";
import {replaceTagWithColor} from "~/utils/common";

const searchText = ref<string>('')
const thisShowKey = ref<string | undefined>()
const popoverVisible = ref(false)
const loading = ref(false)
const items = ref<RecipesListDto[]>([])
const allItems = ref<RecipesListDto[]>([])
const thisRecipesInfo = ref<Recipes>()

// recipes filter
const recipesCategories = ref<string>('')

const categoriesList = ref<string[]>(['治疗','耐力回复','饱食度','潜泳加速','持续治疗','解毒','冰攻提高','物攻提高','火攻提高','雷攻提高','冰抗提高','物抗提高','火抗提高','雷抗提高'])

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
  const recipesList: RecipesListDtoRes = await BaseAPI.apiGet("recipes/search",{'categories':recipesCategories.value})
  allItems.value = recipesList.data
  onInputRecipesSearch()
}

const findRecipesInfoByKey = async () => {
  try {
    loading.value = true
    const recipesRes: RecipesRes = await BaseAPI.apiGet(`recipes/how-make/${thisShowKey.value}`)
    thisRecipesInfo.value = recipesRes.data
  }finally {
    loading.value = false
  }

}

const showThisRecipesInfo = async (recipesKey: string) => {
  thisShowKey.value = recipesKey
  await findRecipesInfoByKey()
}

const initializePage = async () => {
  await queryRecipesList()
  if (allItems.value.length > 0) {
    thisShowKey.value = allItems.value[0]?.recipesKey
  }
  await findRecipesInfoByKey()
};

onMounted(async () => {
  await initializePage();
});

</script>

<template>
  <div class="gallery-container">
    <div v-if="loading" class="gallery-container__status">{{ '加载中...' }}</div>
    <div v-else class="gallery-container__content">
      <div style="height:100%;width: 50%;display:flex;flex-direction: column;align-items: center;gap: 10px;text-align: center;justify-content: center;">
        <img width="100" :src="thisRecipesInfo?.recipesIcon" :alt="thisRecipesInfo?.recipesName" loading="lazy"/>
        <div style="color: rgb(84, 47, 19);font-size: 24px;">
          {{ thisRecipesInfo?.recipesName }}
        </div>
        <div style="color: #c4c8cB;font-size: 14px;">
          {{ thisRecipesInfo?.recipesDes == '' ? '//**无基本介绍**//' : thisRecipesInfo?.recipesDes }}
        </div>
        <div style="color: #c4c8cB;font-size: 14px;">
          {{ thisRecipesInfo?.categories == '' ? '//**无分类介绍**//' : thisRecipesInfo?.categories }}
        </div>
        <div
            v-html="(thisRecipesInfo?.useDescription == '' ? '' : replaceTagWithColor(replaceTagWithColor(thisRecipesInfo?.useDescription,'shuzhi','C94F4F'),'ComLblGreen','4C9717') + '<br>') + replaceTagWithColor(replaceTagWithColor(thisRecipesInfo?.buffs,'shuzhi','C94F4F'),'ComLblGreen','4C9717')"></div>

        <div class="details with-line">
          制 作 方 式
        </div>

        <div class="effect">
          <div v-for="item in thisRecipesInfo?.ingredientsList">
            <div class="img-container">
              <img :src="item.ingredientIcon"
                   alt="Beet with Fiddlehead" class="item-image"/>
              <div class="ingredient-name">{{ item.ingredientName }}</div>
              <div class="quantity">{{ item.ingredientNum }}</div>

            </div>
          </div>



        </div>

      </div>
      <div style="background-color: #9eb4ed;height: 30px;width: 100%">
        <div
            style="background-color: #e19eba;height: 30px;width:30%"
        ></div></div>

    </div>
  </div>

  <aside class="sidebar sidebar--right">
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
              style="max-width: 400px; background-color: rgba(255, 255, 255, 0.8);box-sizing: border-box;padding:0"
          >
            <template #trigger>
              <i class="ri-filter-3-line" :class="{ 'active': popoverVisible }"></i>
            </template>
            <template #header>
              <n-text strong depth="1">Type filter</n-text>
            </template>
            <div class="filter-group">
              <p>类别:</p>
              <div class="button-group">
                <div v-for="item in categoriesList">
                  <NButton color="#9E8BA8" :dashed="recipesCategories!==item" size="tiny"
                           @click="changeRecipesCategories(item)">{{item}}
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
              <img :key="item.recipesKey" loading="lazy" decoding="async" class="result-item__avatar" :src="item.recipesIcon" alt="">
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
</template>

<style scoped lang="scss">
.sidebar {
  flex: 0 0 25%;
  min-height: calc(100vh - 100px);
  max-height: calc(100vh - 100px);
  min-width: 180px;
  max-width: 300px;
  box-sizing: border-box;
  position: sticky;
  top: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
  cursor: default;

  //&:hover {
  //  transform: translateY(-4px);
  //  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  //}
}


.gallery-container {
  min-height: calc(100vh - 100px);
  overflow-y: auto;
  width: clamp(300px, 60%, 1000px);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  //&:hover {
  //  transform: translateY(-4px);
  //  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  //}

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


.search-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__header {
    background-color: #9E8BA8;
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


.effect {
  margin-bottom: 15px;
  display: flex;
  padding: 10px;
  border-radius: 5px;
}

.effect .img-container {
  position: relative;
  display: inline-block;
  margin-right: 20px;

}

.effect .item-image {
  width: 50px;
  height: 50px;
  border-radius: 10px;
}

.effect .quantity {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: rgba(255, 12, 12, 0.7);
  color: white;
  font-size: 12px;
  width: 15px;
  height: 15px;
  padding: 1px 1px 2px 2px;
  text-align: center;
  line-height: 11px;
  border-radius: 50%;
}

.effect .ingredient-name {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #333;
  padding: 2px 5px;
  border-radius: 5px;
  width: 80px;
  text-align: center;
}


.details {
  justify-content: center;
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


@media (max-height: 600px) {
  .search-panel__header {
    display: none;
  }
}

</style>