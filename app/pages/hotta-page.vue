<template>
  <div class="page-layout" v-cloak>

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


            <NuxtLink to="/hotta-page/artifact" active-class="active-link">
              <li class="menu__item menu__item--red">
                <span class="task-title">源器</span>
                <span class="task-cat">图片、星级效果</span>
              </li>
            </NuxtLink>

            <NuxtLink to="/hotta-page/food" active-class="active-link">
              <li class="menu__item menu__item--green">
                <span class="task-title">食物</span>
                <span class="task-cat">非烹饪的食物来源、效果</span>
              </li>
            </NuxtLink>


            <li class="menu__item menu__item--red">
              <span class="task-title">食谱</span>
              <span class="task-cat">待制作...</span>
            </li>
            <li class="menu__item menu__item--green">
              <span class="task-title">武器</span>
              <span class="task-cat">待制作...</span>
            </li>
            <li class="menu__item menu__item--green">
              <span class="task-title">意志</span>
              <span class="task-cat">待制作...</span>
            </li>
            <li class="menu__item menu__item--green">
              <span class="task-title">点了也没用</span>
              <span class="task-cat">no yong...</span>
            </li>
            <li class="menu__item menu__item--green">
              <span class="task-title">点了也没用</span>
              <span class="task-cat">no yong...</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <NuxtPage/>

  </div>
</template>

<script setup lang="ts">

import {onMounted} from "vue";

const initializePage = ()=> {
  navigateTo('/hotta-page/artifact')
}

onMounted(() => {
  initializePage();
});
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


.menu-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  &__overlay {
    /*background: url() no-repeat top / contain;*/
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

    h4 {
      font-size: 18px;
    }

    a {
      font-size: 11px;
      color: white;

      &:hover {
        color: #4da6ff;
      }
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

    a {
      display: block;
      color: inherit;
      text-decoration: none;
    }

    .active-link {
      background-color: rgba(128, 128, 128, 0.1);
    }
  }

  &__item {
    padding: 8px 12px 8px 35px;
    position: relative;
    z-index: 8;
    cursor: pointer;
    transition: background 0.3s;

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

    &--red:after {
      background: #FF3163;
    }

    &--green:after {
      background: #54D6C7;
    }

    &--yellow:after {
      background: #EAB429;
    }
  }
}


@media (max-height: 600px) {
  .profile-card {
    display: none;
  }
}
</style>