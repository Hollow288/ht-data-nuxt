<template>
  <div class="page-layout">
    <!-- 左侧栏 -->
    <aside class="left-sidebar">
      <div class="muck-up">
        <div class="overlay"></div>
        <div class="top">
          <div class="nav">
            <p>Hotta</p>
          </div>
          <div class="user-profile">
            <img src="/favicon.ico">
            <div class="user-details">
              <h4>Tower of Fantasy</h4>
              <a href="https://github.com/Hollow288/hotta-data-builder" target="_blank">Hollow288/hotta-data-builder</a>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="title">
            <h3>MENU</h3>
            <small>Updated: 8,2025</small>
          </div>
          <ul class="tasks">
            <li class="one red" @click="toCorrespondingPage('artifact')">
              <span class="task-title">源器</span>
              <span class="task-cat">图片、星级效果</span>

            </li>
            <li class="one red">
              <span class="task-title">Catch up with Brian</span>
              <span class="task-cat">Mobile Project</span>

            </li>
            <li class="two green">
              <span class="task-title">Design Explorations</span>
              <span class="task-cat">Company Web site</span>

            </li>
            <li class="tow green">
              <span class="task-title">Team Meeting</span>
              <span class="task-cat">Hangouts</span>
            </li>
            <li class="tow green">
              <span class="task-title">Team Meeting</span>
              <span class="task-cat">Hangouts</span>
            </li>
            <li class="tow green">
              <span class="task-title">Team Meeting</span>
              <span class="task-cat">Hangouts</span>
            </li>



          </ul>
        </div>
      </div>
    </aside>


    <div class="card-container" v-if="loading">
      <div v-if="loading" class="loading">{{'加载中...'}}</div>
    </div>
    <div v-else class="card-container">
      <div v-for="img in images" :key="img.name" class="card">
        <img :src="img.url" :alt="img.name" loading="lazy" />
        <div class="caption">{{ img.name }}</div>
      </div>
    </div>
    <aside class="left-sidebar">
      <div class="right-main">
        <header class="header">
          <h4 class="title">Search</h4>
          <small class="subtitle">Search by name and/or type</small>
          <div class="input-wrapper">

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

              <template #header >
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
            <input type="text" name="filter" id="filter" placeholder="Search" />
          </div>
        </header>
        <div class="bottom">
          <n-virtual-list style="max-height: 240px" :item-size="42" :items="items">
            <template #default="{ item }">
              <div :key="item.key" class="item" style="height: 42px">
                <img class="avatar" :src="item.avatar" alt="">
                <span> {{ item.value }}</span>
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
import {apiFetch} from "~/utils/apiFetch";
import type {ImageInfo} from "~/types/api";
import { ref } from 'vue'

// n-popover是否打开
const popoverVisible = ref(false)
const loading = ref(false)
const thisPageName = ref<string>('artifact')
const images = ref<ImageInfo[]>([])
// artifact filter
const artifactRarity = ref<string>('')

const toCorrespondingPage = async (pageName: string) => {
  thisPageName.value = pageName
  console.log(thisPageName.value)

  images.value = await apiFetch('/api/artifacts')
  debugger
}

const changeArtifactRarity = async (rarity: string) => {
  if (artifactRarity.value === rarity) {
    artifactRarity.value = ''
  }else{
    artifactRarity.value = rarity
  }
}


const avatars = [
  'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
  'https://avatars.githubusercontent.com/u/20943608?s=60&v=4',
  'https://avatars.githubusercontent.com/u/46394163?s=60&v=4',
  'https://avatars.githubusercontent.com/u/39197136?s=60&v=4',
  'https://avatars.githubusercontent.com/u/19239641?s=60&v=4'
]

const items = Array.from({ length: 10000 }, (_, i) => ({
  key: `${i}`,
  value: i,
  avatar: avatars[i % avatars.length]
}))



</script>

<style scoped lang="scss">



.page-layout {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px;
  flex-direction: row;
}



.left-sidebar {
  flex: 0 0 25%;
  min-height: calc(100vh - 160px);
  min-width: 180px;
  max-width: 300px;
  box-sizing: border-box;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 160px);
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

.card-container {
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

  .loading, .empty {
    text-align: center;
    color: #999;
    margin-top: 50px;
    font-size: 1rem;
  }
}



.muck-up {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;


  > .top {
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
      right: 0;
      height: 60px;
      transform: rotate(10deg);
      width: 388px;
      z-index: 2;
    }
  }

  .nav p {
    margin: 2px 0 0 0;
    display: inline-block;
    vertical-align: bottom;
  }

  .user-profile {
    margin-left: 10px;

    img {
      height: 45px;
      width: 45px;
      border-radius: 50%;
      float: left;
      margin-right: 24px;
      margin-top: 19px;
    }
  }

  .user-details {
    float: left;
    vertical-align: bottom;

    h4 {
      font-size: 18px;
    }

    a {
      font-size: 11px;
      color: white;
    }

    a:hover{
      color: #4da6ff;;
    }
  }


  .bottom {
    background-color: #fff;
    flex: 1;
    display: flex;
    flex-direction: column;
    z-index: 1;
    position: relative;
    color: #222;
    min-height: 0;
    height: 100%;

    ul, ol {
      list-style: none;
      padding-left: 0;
      margin-left: 0;
    }
  }

  .title {
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


  ul.tasks {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 20px;
    margin: 0;
    padding-left: 0;
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

    .task-title {
      font-size: 13px;
      display: inline-block;
    }

    .task-time {
      float: right;
      font-size: 10px;
      color: #888;
    }

    .task-cat {
      font-size: 10px;
      display: block;
      color: #888;
    }

    li {
      padding: 8px 35px;
      position: relative;
      z-index: 8;
      cursor: pointer;
      transition: background 0.3s;
      flex: 1 1 auto;
      overflow-y: auto;
      padding-right: 12px;
      margin: 0;
      list-style: none;

      &:hover {
        background-color: rgba(128, 128, 128, 0.1);
      }


      &:after {
        content: '';
        position: absolute;
        left: 17px;
        top: 24px;
        height: 8px;
        width: 8px;
        border-radius: 50%;
      }

      &.red:after { background: #FF3163; }
      &.green:after { background: #54D6C7; }
      &.yellow:after { background: #EAB429; }

      &.hang {
        margin-bottom: 48px;

        img {
          float: left;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          margin-right: 8px;
        }
      }
    }
  }


  .overlay {
    background: url() no-repeat top / contain;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;

    &:after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background: rgba(71, 32, 84, 0.5);
    }
  }
}


.right-main{
  display: flex;
  flex-direction: column;
  height: 100%;
}


.title {
  margin: 0;
}

.subtitle {
  display: inline-block;
  margin: 5px 0 20px;
  opacity: 0.8;
}

.header {
  background-color: #9E8BA8;
  color: #fff;
  padding: 30px 20px;
}

.header input {
  background-color: rgba(0, 0, 0, 0.3);
  border: 0;
  border-radius: 50px;
  color: #fff;
  font-size: 14px;
  padding: 10px 15px;
  width: 100%;
}

.header input:focus {
  outline: none;
}




.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper i {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  cursor: pointer;
}

.input-wrapper i:hover{
  color: #FFF;
}


.filter-group {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 8px;
}


.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex: 1;
}


.filter-group p {
  width: 60px;
  margin: 0;
  line-height: 24px;
  font-weight: 500;
}

.input-wrapper i.active {
  color: #fff;
}

.item {
  display: flex;
  align-items: center;
}
.avatar {
  width: 28px;
  border-radius: 50%;
  margin-right: 10px;
}

@media (max-height: 600px) {
  .muck-up > .top {
    display: none;
  }
}

</style>
