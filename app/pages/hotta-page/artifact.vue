<script setup lang="ts">

import {NButton, NPopover, NText, NVirtualList} from "naive-ui";
import {ref} from "vue";
import type {Artifact, ArtifactListDto, ArtifactListDtoRes, ArtifactRes} from "~/types/artifact";
import {onMounted} from 'vue'
import {replaceTagWithColor} from "~/utils/common";
import {BaseAPI} from "~/utils/api";

const searchText = ref<string>('')
const thisShowKey = ref<string | undefined>()
const popoverVisible = ref(false)
const loading = ref(false)
const items = ref<ArtifactListDto[]>([])
const allItems = ref<ArtifactListDto[]>([])
const thisArtifactInfo = ref<Artifact>()

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
  }finally {
    loading.value = false
  }

}

const showThisArtifactInfo = async (artifactKey: string) => {
  thisShowKey.value = artifactKey
  await findArtifactInfoByKey()
}

const initializePage = async () => {
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
        <div class="level">{{ thisArtifactInfo?.artifactRarity }}</div>
        <div class="name">{{ thisArtifactInfo?.artifactName }}</div>
        <div class="description" v-html="replaceTagWithColor(thisArtifactInfo?.useDescription,'shuzhi','C94F4F')"></div>
      </div>
      <div class="gallery-container__content__right">

        <div class="artifact-detail">
          <span class="level">星级效果：</span>
          <div v-for="(items,index) in thisArtifactInfo?.artifactDetail" style="display: flex;margin-bottom: 10px">
            <span class="stars">{{ '⭐'.repeat(index + 1) }}</span>
            <span class="desc" v-html="replaceTagWithColor(items,'shuzhi','C94F4F')"></span>
          </div>
        </div>
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
                <NButton color="#9E8BA8" :dashed="artifactRarity!=='SSR'" size="tiny"
                         @click="changeArtifactRarity('SSR')">SSR
                </NButton>
                <NButton color="#9E8BA8" :dashed="artifactRarity!=='SR'" size="tiny"
                         @click="changeArtifactRarity('SR')">SR
                </NButton>
              </div>
            </div>
          </n-popover>
          <input type="text" name="filter" id="filter" v-model="searchText" @input="onInputArtifactSearch()"
                 placeholder="Search"/>
        </div>
      </header>
      <div class="search-panel__content">
        <n-virtual-list style="height: 100%" :item-size="50" :items="items">
          <template #default="{ item }">
            <div :key="item.artifactKey" class="result-item" :class="{'active': thisShowKey === item.artifactKey}"
                 @click="showThisArtifactInfo(item.artifactKey)">
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
        top: 10%; /* 控制分割线上下的位置 */
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
        color: black;
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

      .artifact-detail {
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
          word-break: break-word;
          align-items: flex-start;
          margin-top: -4px;
        }
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