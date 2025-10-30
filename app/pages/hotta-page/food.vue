<script setup lang="ts">

import {NButton, NPopover, NText, NVirtualList} from "naive-ui";
import {ref} from "vue";
import type {Food, FoodListDto, FoodListDtoRes, FoodRes} from "~/types/food";
import {onMounted} from 'vue'
import {BaseAPI} from "~/utils/api";
import {replaceTagWithColor} from "~/utils/common";

const searchText = ref<string>('')
const thisShowKey = ref<string | undefined>()
const popoverVisible = ref(false)
const loading = ref(false)
const items = ref<FoodListDto[]>([])
const allItems = ref<FoodListDto[]>([])
const thisFoodInfo = ref<Food>()

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
  }finally {
    loading.value = false
  }

}

const showThisFoodInfo = async (foodKey: string) => {
  thisShowKey.value = foodKey
  await findFoodInfoByKey()
}

const initializePage = async () => {
  await queryFoodList()
  if (allItems.value.length > 0) {
    thisShowKey.value = allItems.value[0]?.foodKey
  }
  await findFoodInfoByKey()
};

onMounted(async () => {
  await initializePage();
});

</script>

<template>
  <div class="gallery-container">
    <div v-if="loading" class="gallery-container__status">{{ '加载中...' }}</div>
    <div v-else class="gallery-container__content">
      <div style="height:100%;width: 50%;display:flex;flex-direction: column;align-items: center;gap: 10px;text-align: center;    align-items: center;justify-content: center;">
        <img width="100" :src="thisFoodInfo?.foodIcon" :alt="thisFoodInfo?.foodName" loading="lazy"/>
        <div style="color: rgb(84, 47, 19);font-size: 24px;">
          {{ thisFoodInfo?.foodName }}
        </div>
        <div style="color: #c4c8cB;font-size: 14px;">
          {{ thisFoodInfo?.foodDes == '' ? '//**无基本介绍**//' : thisFoodInfo?.foodDes }}
        </div>
        <div style="color: #c4c8cB;font-size: 14px;">
          {{ thisFoodInfo?.source == '' ? '//**无来源介绍**//' : thisFoodInfo?.source }}
        </div>
        <div
             v-html="(thisFoodInfo?.useDescription == '' ? '' : replaceTagWithColor(replaceTagWithColor(thisFoodInfo?.useDescription,'shuzhi','C94F4F'),'ComLblGreen','4C9717') + '<br>') + replaceTagWithColor(replaceTagWithColor(thisFoodInfo?.buffs,'shuzhi','C94F4F'),'ComLblGreen','4C9717')"></div>

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
          <input type="text" name="filter" id="filter" v-model="searchText" @input="onInputFoodSearch()"
                 placeholder="Search"/>
        </div>
      </header>
      <div class="search-panel__content">
        <n-virtual-list style="height: 100%" :item-size="50" :items="items">
          <template #default="{ item }">
            <div :key="item.foodKey" class="result-item" :class="{'active': thisShowKey === item.foodKey}"
                 @click="showThisFoodInfo(item.foodKey)">
              <img :key="item.foodKey" loading="lazy" decoding="async" class="result-item__avatar" :src="item.foodIcon" alt="">
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

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }
}


.gallery-container {
  min-height: calc(100vh - 100px);
  overflow-y: auto;
  width: clamp(300px, 60%, 1000px);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }

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


@media (max-height: 600px) {
  .search-panel__header {
    display: none;
  }
}

</style>