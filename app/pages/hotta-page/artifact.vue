<script setup lang="ts">

import {NButton, NPopover, NText, NVirtualList} from "naive-ui";
import {ref} from "vue";
import type {ImageInfo} from "~/types/api";
import type {Artifact, ArtifactListDto, ArtifactListDtoRes, ArtifactRes} from "~/types/artifact";
import { onMounted } from 'vue'

const searchText = ref<string>('')
const thisShowKey = ref<string | undefined>()
const images = ref<ImageInfo[]>([])
const popoverVisible = ref(false)
const loading = ref(false)
const items = ref<ArtifactListDto[]>([])
const allItems = ref<ArtifactListDto[]>([])
const thisArtifactInfo = ref<Artifact>()
const artifactRes = ref<ArtifactRes>()

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
  if(searchText.value == '') {
    items.value = allItems.value
  }else{
    items.value = allItems.value.filter(n=>n.artifactName.indexOf(searchText.value) > -1)
  }
}


const queryArtifactList = async() =>{
  const artifactList : ArtifactListDtoRes  = await apiFetch(
      `http://127.0.0.1:5777/api/v1/artifact/search?artifactRarity=${encodeURIComponent(artifactRarity.value)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'AIzaSyBWlLk7GqJ-6sNOjFY2ZKWy2IJd7evlhAY'
        }
      }
  );
  allItems.value = artifactList.data

  onInputArtifactSearch()
}

const findArtifactInfoByKey = async() =>{
  const artifactRes : ArtifactRes = await apiFetch(
      `http://127.0.0.1:5777/api/v1/artifact/${thisShowKey.value}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'AIzaSyBWlLk7GqJ-6sNOjFY2ZKWy2IJd7evlhAY'
        }
      }
  );

  thisArtifactInfo.value = artifactRes.data

  debugger
}

const showThisArtifactInfo = async (artifactKey : string) => {
  debugger
  thisShowKey.value = artifactKey
}

const initializePage = async() => {
  await queryArtifactList()
  if (allItems.value.length > 0) {
    thisShowKey.value = allItems.value[0]?.artifactKey
  }
  await findArtifactInfoByKey()
};

onMounted(async () => {
  await initializePage();
});

</script>

<template>
  <div class="gallery-container">
    <div v-if="loading" class="gallery-container__status">{{ '加载中...' }}</div>
    <div v-else class="gallery-container__content">
      <div class="gallery-container__content__left">
          <img width="150" :src="thisArtifactInfo?.artifactIcon" :alt="thisArtifactInfo?.artifactName" class="gallery-card__image" loading="lazy"/>
          <div class="level">{{thisArtifactInfo?.artifactRarity}}</div>
          <div class="name">{{thisArtifactInfo?.artifactName}}</div>
          <div class="description">
            &nbsp;{{thisArtifactInfo?.useDescription}}
          </div>


      </div>
      <div style="width: 60%;background-color: #eab429">

      </div>
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
              style="max-width: 200px; background-color: rgba(255, 255, 255, 0.5);box-sizing: border-box;padding:0"
          >
            <template #trigger>
              <i class="ri-filter-3-line" :class="{ 'active': popoverVisible }"></i>
            </template>
            <template #header>
              <n-text strong depth="1">Type filter</n-text>
            </template>
            <div class="filter-group">
              <p>Rarity:</p>
              <div class="button-group">
                <NButton color="#9E8BA8" :dashed="artifactRarity!=='SSR'" size="tiny" @click="changeArtifactRarity('SSR')">SSR</NButton>
                <NButton color="#9E8BA8" :dashed="artifactRarity!=='SR'" size="tiny" @click="changeArtifactRarity('SR')">SR</NButton>
              </div>
            </div>
          </n-popover>
          <input type="text" name="filter" id="filter" v-model="searchText" @input="onInputArtifactSearch()" placeholder="Search"/>
        </div>
      </header>
      <div class="search-panel__content">
        <n-virtual-list style="height: 100%" :item-size="50" :items="items">
          <template #default="{ item }">
            <div :key="item.artifactKey" class="result-item" :class="{'active': thisShowKey === item.artifactKey}" @click="showThisArtifactInfo(item.artifactKey)">
              <img loading="lazy" decoding="async" class="result-item__avatar" :src="item.artifactThumbnail" alt="">
              <div class="result-item__details">
                <span class="task-title">{{ item.artifactName }}</span>
                <span class="task-cat">{{ item.artifactRarity }}</span>
              </div>
            </div>
          </template>
        </n-virtual-list>
      </div>
    </div>
  </aside>
</template>

<style scoped  lang="scss">
.sidebar {
  flex: 0 0 25%;
  min-height: calc(100vh - 160px);
  max-height: calc(100vh - 160px);
  min-width: 180px;
  max-width: 300px;
  box-sizing: border-box;
  position: sticky;
  top: 80px;
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
  min-height: calc(100vh - 160px);
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
    text-align: center;
    color: #999;
    margin-top: 50px;
    font-size: 1rem;
  }

  &__content {
    display: flex;
    height: 100%;

    &__left {
      width: 40%; display: flex; justify-content: center; align-items: center; flex-direction: column; height: 100%;


      .level {
        text-transform: uppercase;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 3px;
        color: #EC9B3B;
      }

      .name {
        font-size: 26px;
        color: black;
        font-weight: 900;
        margin-bottom: 5px;
      }

      .description {
        position: relative;
        padding: 20px 20px 15px;
      }
    }


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

  &.active{
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

  &__title { margin: 0; }
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
      &:focus { outline: none; }
    }

    i {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.7);
      font-size: 18px;
      cursor: pointer;
      &:hover, &.active { color: #FFF; }
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