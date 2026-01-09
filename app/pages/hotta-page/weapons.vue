<script setup lang="ts">

import {NButton, NPopover, NText, NVirtualList} from "naive-ui";
import {ref} from "vue";
import type {Weapons, WeaponsListDto, WeaponsListDtoRes, WeaponsRes} from "~/types/weapons";
import {onMounted} from 'vue'
import { watch } from 'vue'
import {getImgUrl, replaceTagWithColor, returnTrueFilePathByName} from "~/utils/common";
import {BaseAPI} from "~/utils/api";

const searchText = ref<string>('')
const thisShowKey = ref<string | undefined>()
const popoverVisible = ref(false)
const popoverVisibleMobile = ref(false)
const loading = ref(false)
const items = ref<WeaponsListDto[]>([])
const allItems = ref<WeaponsListDto[]>([])
const thisWeaponsInfo = ref<Weapons>()
const showDrawer = ref(false)
// weapons filter
const weaponRarity = ref<string>('')

const changeWeaponsRarity = async (rarity: string) => {
  if (weaponRarity.value === rarity) {
    weaponRarity.value = ''
  } else {
    weaponRarity.value = rarity
  }
  await queryWeaponsList()
}

const onInputWeaponsSearch = () => {
  if (searchText.value == '') {
    items.value = allItems.value
  } else {
    items.value = allItems.value.filter(n => n.weaponName.indexOf(searchText.value) > -1)
  }
}

const queryWeaponsList = async () => {
  const weaponsList: WeaponsListDtoRes = await BaseAPI.apiGet("weapons/search",{'weaponRarity':encodeURIComponent(weaponRarity.value)})
  allItems.value = weaponsList.data
  onInputWeaponsSearch()
}

const findWeaponsInfoByKey = async () => {
  try {
    loading.value = true
    const weaponsRes: WeaponsRes = await BaseAPI.apiGet(`weapons/${thisShowKey.value}`)
    thisWeaponsInfo.value = weaponsRes.data
  } finally {
    loading.value = false
  }
}

const showThisWeaponsInfo = async (weaponKey: string) => {
  thisShowKey.value = weaponKey
  await findWeaponsInfoByKey()
  // 核心：在移动端点击后，自动关闭抽屉
  showDrawer.value = false
}

const initializePage = async () => {
  await queryWeaponsList()
  if (allItems.value.length > 0) {
    thisShowKey.value = allItems.value[20]?.weaponKey
  }
  await findWeaponsInfoByKey()
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
        <div class="gallery-container__content__row">
            <div >
              <img width="180" :src="thisWeaponsInfo?.weaponIcon" :alt="thisWeaponsInfo?.weaponName" class="gallery-card__image" loading="lazy"/>
            </div>
            <div>
              <div style="display: flex;align-items: flex-end;">
                <div class="name">{{ thisWeaponsInfo?.weaponName }}</div>
                <div class="level">{{ thisWeaponsInfo?.weaponRarity }}</div>
              </div>
              <div style="display: flex;align-items: flex-end;">
                <div >破防： {{ thisWeaponsInfo?.armorBroken }} 破防： {{ thisWeaponsInfo?.armorBroken }}</div>
              </div>
              <span class="task-cat">
                        <img  :src="getImgUrl(returnTrueFilePathByName(thisWeaponsInfo?.weaponElement?.weaponElementType))"  :alt="thisWeaponsInfo?.weaponElement?.weaponElementType"/>
                        <img  :src="getImgUrl(returnTrueFilePathByName(thisWeaponsInfo?.weaponCategory))"  :alt="thisWeaponsInfo?.weaponCategory"/>
                      </span>
              <div class="description" v-html="replaceTagWithColor(thisWeaponsInfo?.description,'shuzhi','C94F4F')"></div>
            </div>
        </div>
        <div class="gallery-container__content__row">
          <div class="weapons-detail">
            <span class="level">特质：</span>
            <div>
              <span>{{thisWeaponsInfo?.weaponElement?.weaponElementName}}</span><span>{{thisWeaponsInfo?.weaponElement?.weaponElementDesc}}</span>
            </div>
<!--            <div v-for="(items,index) in thisWeaponsInfo?.weaponDetail" style="display: flex;margin-bottom: 10px">-->
<!--              <span class="stars">{{ '⭐'.repeat(index + 1) }}</span>-->
<!--              <span class="desc" v-html="replaceTagWithColor(items,'shuzhi','C94F4F')"></span>-->
<!--            </div>-->

          </div>
        </div>
        <div class="gallery-container__content__row">
          <div class="weapons-detail">
            <span class="level">专属：</span>
            <div>
              <span style="white-space: pre-line">{{thisWeaponsInfo?.remouldDetail}}</span>
            </div>
            <!--            <div v-for="(items,index) in thisWeaponsInfo?.weaponDetail" style="display: flex;margin-bottom: 10px">-->
            <!--              <span class="stars">{{ '⭐'.repeat(index + 1) }}</span>-->
            <!--              <span class="desc" v-html="replaceTagWithColor(items,'shuzhi','C94F4F')"></span>-->
            <!--            </div>-->

          </div>
        </div>

        <div class="gallery-container__content__row">
          <div class="weapons-detail">
            <n-tabs type="segment" animated>
              <n-tab-pane name="chap1" tab="星级效果">
                <div v-for="(items,index) in thisWeaponsInfo?.weaponUpgradeStarPack" style="display: flex;margin-bottom: 10px">
                  <span class="stars">{{ '⭐'.repeat(index + 1) }}</span>
                  <span class="desc" v-html="replaceTagWithColor(items,'shuzhi','C94F4F')"></span>
                </div>
              </n-tab-pane>
              <n-tab-pane name="chap2" tab="通感效果" v-if="(thisWeaponsInfo?.weaponSensualityLevelData || []).length > 0">
                <div v-for="(items,index) in thisWeaponsInfo?.weaponSensualityLevelData" style="display: flex;margin-bottom: 10px">
                  <span class="stars">{{ '⭐'.repeat(index + 1) }}</span>
                  <span class="desc" v-html="replaceTagWithColor(items,'shuzhi','C94F4F')"></span>
                </div>
              </n-tab-pane>
            </n-tabs>


          </div>
        </div>
        <div class="gallery-container__content__row">
          <n-tabs type="segment" animated>
            <n-tab-pane name="chap1" tab="普攻">
              我这辈子最疯狂的事，发生在我在 Amazon
              当软件工程师的时候，故事是这样的：<br><br>
              那时我和女朋友住在一起，正在家里远程工作。忽然同事给我发来了紧急消息：”我们的服务出现了
              SEV 2 级别的故障！需要所有的人马上协助！“我们组的应用全挂掉了。<br><br>
              当我还在费力的寻找修复方法的时候，忽然闻到隔壁房间的的焦味，防火报警器开始鸣叫。
            </n-tab-pane>
            <n-tab-pane name="chap2" tab="闪避">
              “威尔！着火了！快来帮忙！”我听到女朋友大喊。现在一个难题在我面前——是恢复一个重要的
              Amazon 服务，还是救公寓的火。<br><br>
              我的脑海中忽然出现了 Amazon
              著名的领导力准则”客户至上“，有很多的客户还依赖我们的服务，我不能让他们失望！所以着火也不管了，女朋友喊我也无所谓，我开始
              debug 这个线上问题。
            </n-tab-pane>
            <n-tab-pane name="chap3" tab="技能">
              但是忽然，公寓的烟味消失，火警也停了。我的女朋友走进了房间，让我震惊的是，她摘下了自己的假发，她是
              Jeff Bezos（Amazon 老板）假扮的！<br><br>
              “我对你坚持顾客至上的原则感到十分骄傲”，说完，他递给我一张五美金的亚马逊礼品卡，从我家窗户翻了出去，跳上了一辆
              Amazon 会员服务的小货车，一溜烟离开了。<br><br>虽然现在我已不在 Amazon
              工作，但我还是非常感激在哪里学的到的经验，这些经验我终身难忘。你们同意么？
            </n-tab-pane>
            <n-tab-pane name="chap4" tab="联携">
              但是忽然，公寓的烟味消失，火警也停了。我的女朋友走进了房间，让我震惊的是，她摘下了自己的假发，她是
              Jeff Bezos（Amazon 老板）假扮的！<br><br>
              “我对你坚持顾客至上的原则感到十分骄傲”，说完，他递给我一张五美金的亚马逊礼品卡，从我家窗户翻了出去，跳上了一辆
              Amazon 会员服务的小货车，一溜烟离开了。<br><br>虽然现在我已不在 Amazon
              工作，但我还是非常感激在哪里学的到的经验，这些经验我终身难忘。你们同意么？
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>
    </div>

    <!-- 2. PC端侧边栏 (移动端隐藏) -->
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
                :arrow-style="{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }"
                style="max-width: 200px; background-color: var(--white-black-50);box-sizing: border-box;padding:0;"
            >
              <template #trigger>
                <i class="ri-filter-3-line" :class="{ 'active': popoverVisible }"></i>
              </template>
              <template #header>
                <n-text style="color:var(--text-main)" strong depth="1">Type filter</n-text>
              </template>
              <div class="filter-group">
                <p style="color:var(--text-main)">Rarity:</p>
                <div class="button-group">
                  <NButton color="#9E8BA8" :dashed="weaponRarity!=='SSR'" size="tiny"
                           @click="changeWeaponsRarity('SSR')">SSR
                  </NButton>
                  <NButton color="#9E8BA8" :dashed="weaponRarity!=='SR'" size="tiny"
                           @click="changeWeaponsRarity('SR')">SR
                  </NButton>
                </div>
              </div>
            </n-popover>
            <input type="text" v-model="searchText" @input="onInputWeaponsSearch()" placeholder="Search"/>
          </div>
        </header>
        <div class="search-panel__content">
          <n-virtual-list style="height: 100%" :item-size="50" :items="items">
            <template #default="{ item }">
              <div :key="item.weaponKey" class="result-item" :class="{'active': thisShowKey === item.weaponKey}"
                   @click="showThisWeaponsInfo(item.weaponKey)">
                <img :key="item.weaponKey" decoding="async" class="result-item__avatar" :src="item.weaponIcon" alt="">
                <div class="result-item__details">
                  <span class="task-title">{{ item.weaponName }}</span>
                  <span class="task-cat">
                        <img :key="item.weaponElementType" :src="getImgUrl(returnTrueFilePathByName(item.weaponElementType))"  :alt="item.weaponElementType"/>
                        <img :key="item.weaponCategory" :src="getImgUrl(returnTrueFilePathByName(item.weaponCategory))"  :alt="item.weaponCategory"/>
                        <img :key="item.weaponRarity" :src="getImgUrl(returnTrueFilePathByName(item.weaponRarity))"
                          :alt="item.weaponRarity"
                          :style="{
                            marginLeft: item.weaponRarity === 'R' ? '-10px' :
                                        item.weaponRarity === 'SR' ? '-3px' : '0px'
                          }"
                    />
                  </span>
                </div>
              </div>
            </template>
          </n-virtual-list>
        </div>
      </div>
    </aside>

    <!-- 3. 移动端悬浮按钮 (PC端隐藏) -->
<!--    <div class="mobile-fab" @click="showDrawer = true">-->
<!--      <i class="ri-list-check"></i>-->
<!--      <span>列表</span>-->
<!--    </div>-->

    <button class="toc-toggle-btn" @click="showDrawer = true" aria-label="搜索">
      <i class="ri-search-line"></i>
    </button>

    <!-- 4. 移动端抽屉 (PC端隐藏，内容复用侧边栏逻辑) -->
    <Teleport to="body">
      <!-- 遮罩层 -->
      <Transition name="fade">
        <div v-if="showDrawer" class="custom-drawer-mask" @click="showDrawer = false"></div>
      </Transition>

      <!-- 抽屉面板 -->
      <Transition name="slide">
        <div v-if="showDrawer" class="custom-drawer-panel">
          <!-- 核心布局容器 -->
          <div class="drawer-layout">

            <!-- 固定头部 -->
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
                    <p style="color:var(--text-main)">Rarity:</p>
                    <div class="button-group">
                      <NButton color="#9E8BA8" :dashed="weaponRarity !== 'SSR'" size="tiny" @click="changeWeaponsRarity('SSR')">SSR</NButton>
                      <NButton color="#9E8BA8" :dashed="weaponRarity !== 'SR'" size="tiny" @click="changeWeaponsRarity('SR')">SR</NButton>
                    </div>
                  </div>
                </n-popover>
                <input type="text" v-model="searchText" @input="onInputWeaponsSearch" placeholder="Search"/>
              </div>
            </header>

            <!-- 滚动列表区域 (Flex: 1) -->
            <div class="drawer-body">
              <n-virtual-list
                  style="height: 100%;"
                  :item-size="50"
                  :items="items"
              >
                <template #default="{ item }">
                  <div
                      :key="item.weaponKey"
                      class="result-item"
                      :class="{ active: thisShowKey === item.weaponKey }"
                      @click="showThisWeaponsInfo(item.weaponKey)"
                  >
                    <img :key="item.weaponKey" decoding="async" class="result-item__avatar" :src="item.weaponIcon" alt=""/>
                    <div class="result-item__details">
                      <span class="task-title">{{ item.weaponName }}</span>
                      <span class="task-cat">
                        <img :key="item.weaponElementType" :src="getImgUrl(returnTrueFilePathByName(item.weaponElementType))"  :alt="item.weaponElementType"/>
                        <img :key="item.weaponCategory" :src="getImgUrl(returnTrueFilePathByName(item.weaponCategory))"  :alt="item.weaponCategory"/>
                        <img  :key="item.weaponRarity" :src="getImgUrl(returnTrueFilePathByName(item.weaponRarity))"
                             :alt="item.weaponRarity"
                             :style="{
                                  marginLeft: item.weaponRarity === 'R' ? '-7px' :
                                              item.weaponRarity === 'SR' ? '-4px' : '0px'
                             }"
                        />
                      </span>
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

/* PC 端布局容器 */
.page-container-wrapper {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.gallery-container {
  min-height: calc(100vh - 100px);
  overflow-y: auto;
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
    display: flex;
    height: 100%;
    flex-direction: column;

    &__row {
      display: flex;
      flex-direction: row;
      position: relative;
      padding-top: 20px;


      .level {
        text-transform: uppercase;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 3px;
        color: #EC9B3B;
      }

      .name {
        font-size: 26px;
        color: var(--text-main);
        font-weight: 900;
        margin-right: 20px;
      }

      .description {
        word-break: break-all;
      }

      .weapons-detail {
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
          color: var(--text-main);
          flex: 1;
          word-break: break-all;
          align-items: flex-start;
          margin-top: -4px;
        }
      }
    }

  }
}

/* PC Sidebar 样式 */
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
  font-size: 12px;
  display: inline-block;
}

.task-cat {
  display: flex;        /* 横向排列 */
  align-items: center;  /* 垂直居中 */
  gap: 7px;             /* 图片间距 */
}

.task-cat img {   /* 自行调整大小 */
  height: 14px;
  object-fit: contain;  /* 防止拉伸变形 */
}


.custom-drawer-mask {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 998;
  backdrop-filter: blur(2px);
}

/* 抽屉本体 */
.custom-drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 85%;
  max-width: 340px;
  z-index: 999;
  box-shadow: -4px 0 15px rgba(0,0,0,0.1);
  /* 确保抽屉内部布局占满 */
  display: flex;
  flex-direction: column;
}

/* 抽屉内部 Flex 布局核心 */
.drawer-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.drawer-header {
  flex-shrink: 0; /* 头部不被压缩，高度固定 */
  /* 这里直接复用了 search-panel__header 的样式 */
}

.drawer-body {
  flex: 1; /* 占据剩余高度 */
  overflow: hidden; /* 隐藏溢出，交给内部 Virtual List 处理滚动 */
  position: relative;
  background-color: var(--bg-card);
}

/* =========================================
   Vue 动画 (Transitions)
   ========================================= */

/* Fade 动画 (Mask) */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Slide 动画 (Drawer) */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }


.toc-toggle-btn {
  display: none;
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

:deep(.n-virtual-list) {
  overscroll-behavior: contain;
}

/* =========================================
   移动端适配代码 (Mobile Adaptation)
   ========================================= */
@media screen and (max-width: 850px) {

  /* 1. 隐藏 PC 端侧边栏 */
  .pc-sidebar {
    display: none !important;
  }

  .toc-toggle-btn{
    display: flex;
  }


  .gallery-container {
    width: 100%;
    margin: 0;
    height: auto;
    min-height: auto;

  }
  .gallery-container__content {
    flex-direction: column;
  }
  .gallery-container__content__left {
    width: 100%;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 20px;
  }
  .gallery-container__content__right {
    width: 100%;
    padding: 20px;
  }
}
</style>