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
              <p >Hollow288/hotta-data-builder</p>
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
    </aside>
  </div>
</template>

<script setup lang="ts">


import {apiFetch} from "~/utils/apiFetch";
import type {ImageInfo} from "~/types/api";

const loading = ref(false)
const thisPageName = ref<string>('artifact')
const images = ref<ImageInfo[]>([])

const toCorrespondingPage = async (pageName: string) => {
  thisPageName.value = pageName
  console.log(thisPageName.value)

  images.value = await apiFetch('/api/artifacts')
  debugger
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

    p {
      font-size: 11px;
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

@media (max-height: 600px) {
  .muck-up > .top {
    display: none;
  }
}

</style>
