<template>
  <div class="page-layout">

    <aside class="sidebar sidebar--left">
      <div class="menu-panel">
        <div class="menu-panel__overlay"></div>
        <div class="profile-card">
          <div class="profile-card__nav">
            <p>Hotta</p>
          </div>
          <div class="profile-card__user">
            <img src="/favicon.ico" class="profile-card__avatar">
            <div class="profile-card__details">
              <h4>Tower of Fantasy</h4>
              <a href="https://github.com/Hollow288/hotta-data-builder" target="_blank">Hollow288/hotta-data-builder</a>
            </div>
          </div>
        </div>

        <div class="menu">
          <div class="menu__header">
            <h3>MENU</h3>
            <small>Updated: 8,2025</small>
          </div>
          <ul class="menu__list">
            <li class="menu__item menu__item--red" @click="toCorrespondingPage('artifact')">
              <span class="task-title">源器</span>
              <span class="task-cat">图片、星级效果</span>
            </li>
            <li class="menu__item menu__item--red">
              <span class="task-title">Catch up with Brian</span>
              <span class="task-cat">Mobile Project</span>
            </li>
            <li class="menu__item menu__item--green">
              <span class="task-title">Design Explorations</span>
              <span class="task-cat">Company Web site</span>
            </li>
            <li class="menu__item menu__item--green">
              <span class="task-title">Team Meeting</span>
              <span class="task-cat">Hangouts</span>
            </li>
            <li class="menu__item menu__item--green">
              <span class="task-title">Team Meeting</span>
              <span class="task-cat">Hangouts</span>
            </li>
            <li class="menu__item menu__item--green">
              <span class="task-title">Team Meeting</span>
              <span class="task-cat">Hangouts</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <div class="gallery-container">
      <div v-if="loading" class="gallery-container__status">{{ '加载中...' }}</div>
      <div v-else class="gallery-grid">
        <div v-for="img in images" :key="img.name" class="gallery-card">
          <img :src="img.url" :alt="img.name" class="gallery-card__image" loading="lazy"/>
          <div class="gallery-card__caption">{{ img.name }}</div>
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
            <input type="text" name="filter" id="filter" placeholder="Search"/>
          </div>
        </header>
        <div class="search-panel__content">
          <n-virtual-list style="height: 100%" :item-size="50" :items="items">
            <template #default="{ item }">
              <div :key="item.artifactKey" class="result-item" >
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
  </div>
</template>

<script setup lang="ts">
import {NButton, NPopover, NText, NVirtualList} from 'naive-ui'
// import {apiFetch} from "~/utils/apiFetch"; // 假设的 API 调用
// import type {ImageInfo} from "~/types/api"; // 假设的类型
import { ref } from 'vue'
import type {BlogDateMenuItem, BlogDateMenuRes} from "~/types/api";

// 假设的类型定义
interface ImageInfo {
  name: string;
  url: string;
}

// n-popover是否打开
const popoverVisible = ref(false)
const loading = ref(false)
const thisPageName = ref<string>('artifact')
const images = ref<ImageInfo[]>([])
const items = ref([])
// artifact filter
const artifactRarity = ref<string>('')

const toCorrespondingPage = async (pageName: string) => {
  thisPageName.value = pageName
debugger
  loading.value = true
  try {
    const artifactList: BlogDateMenuRes = await apiFetch('http://127.0.0.1:5777/api/v1/artifact', {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'AIzaSyBWlLk7GqJ-6sNOjFY2ZKWy2IJd7evlhAY'
      }
    })
    items.value = artifactList.data




  } catch (error) {
    console.error('获取日期数据失败', error)
  } finally {
    loading.value = false
  }

}

const changeArtifactRarity = async (rarity: string) => {
  if (artifactRarity.value === rarity) {
    artifactRarity.value = ''
  } else {
    artifactRarity.value = rarity
  }
}


</script>


<style scoped lang="scss">

.page-layout {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px;
  flex-direction: row;
}

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

/* Reusable text styles */
.task-title {
  font-size: 13px;
  display: inline-block;
}

.task-cat {
  font-size: 10px;
  display: block;
  color: #888;
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
}

.menu-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  &__overlay {
    background: url() no-repeat top / contain;
    position: absolute;
    inset: 0;

    &:after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(71, 32, 84, 0.5);
    }
  }
}

.profile-card {
  position: relative;
  min-height: 200px;
  max-height: 200px;
  padding: 15px;
  color: #fff;
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    top: 170px;
    background: #fff;
    left: -22px;
    height: 60px;
    transform: rotate(10deg);
    width: 388px;
    z-index: 2;
  }

  &__nav p {
    margin: 2px 0 0 0;
    display: inline-block;
    vertical-align: bottom;
  }

  &__user {
    margin-left: 10px;
  }

  &__avatar {
    height: 45px;
    width: 45px;
    border-radius: 50%;
    float: left;
    margin-right: 24px;
    margin-top: 19px;
  }

  &__details {
    float: left;
    vertical-align: bottom;
    h4 { font-size: 18px; }
    a {
      font-size: 11px;
      color: white;
      &:hover { color: #4da6ff; }
    }
  }
}

.menu {
  background-color: #fff;
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 1;
  position: relative;
  color: #222;
  min-height: 0;
  height: 100%;

  &__header {
    h3 {
      font-size: 22px;
      margin-bottom: 5px;
      margin-left: 35px;
    }
    small {
      font-size: 10px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-left: 35px;
    }
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    padding: 0 0 20px 0;
    margin: 0;
    list-style: none;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      height: 90%;
      width: 1px;
      background: #eee;
      left: 20px;
      top: 30px;
    }
  }

  &__item {
    padding: 8px 12px 8px 35px;
    position: relative;
    z-index: 8;
    cursor: pointer;
    transition: background 0.3s;

    &:hover { background-color: rgba(128, 128, 128, 0.1); }

    &:after {
      content: '';
      position: absolute;
      left: 17px;
      top: 24px;
      height: 8px;
      width: 8px;
      border-radius: 50%;
    }

    &--red:after { background: #FF3163; }
    &--green:after { background: #54D6C7; }
    &--yellow:after { background: #EAB429; }
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

.result-item {
  display: flex;
  align-items: center;
  height: 50px;
  box-sizing: border-box;

  &:hover {
    background-color: rgba(128, 128, 128, 0.1);
    cursor: pointer;
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


@media (max-height: 600px) {
  .profile-card {
    display: none;
  }
}
</style>