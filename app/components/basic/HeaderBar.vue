<template>
  <header class="header-container">
    <!-- 1. 返回按钮 -->
    <button class="back-btn" @click="goBack" aria-label="返回">
      <i class="ri-arrow-left-line"></i>
    </button>

    <!-- 2. 移动端菜单切换按钮 -->
    <button
        ref="toggleBtnRef"
        class="mobile-menu-toggle"
        @click="toggleMobileMenu"
        aria-label="菜单"
    >
      <i :class="isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'"></i>
    </button>

  <div class="header-img">
    <img  width="40" src="https://avatars.githubusercontent.com/u/87030922?v=4" alt="头像" class="avatar"/>
  </div>

    <!-- 3. 主导航 -->
    <!-- 注意：这里的 CSS 会控制它从左侧滑出来 -->
    <nav ref="navRef" class="main-nav" :class="{ 'mobile-active': isMobileMenuOpen }">
      <ul class="main-menu">
        <li @click="closeMobileMenu">
          <NuxtLink to="/" active-class="active-link">首页</NuxtLink>
        </li>
        <li @click="closeMobileMenu">
          <NuxtLink to="/blog-page" active-class="active-link">文章</NuxtLink>
        </li>

        <!-- Hotta 下拉菜单 -->
        <li
            @mouseenter="isDesktop ? showSubmenu() : null"
            @mouseleave="isDesktop ? hideSubmenu() : null"
            class="has-submenu"
        >
          <div class="menu-label-wrapper" @click="handleSubmenuClick">
            <NuxtLink  active-class="active-link" class="menu-link-txt">
              Hotta
            <div class="arrow-icon" :class="{ 'rotated': isSubmenuVisible }">
              <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 512 512" style="width: 10px; height: 10px;">
                <path fill="currentColor"
                      d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
              </svg>
            </div>
            </NuxtLink>
          </div>

          <transition name="fade-slide">
            <ul v-show="isSubmenuVisible" class="submenu">
              <li @click="closeMobileMenu">
                <NuxtLink class="submenu-li" to="/hotta-page/artifact" active-class="active-link">
                  <i class="ri-box-3-line" style="font-size: 14px"></i>
                  <span style="margin-left: 10px">源器</span>
                </NuxtLink>
              </li>
              <li @click="closeMobileMenu">
                <NuxtLink class="submenu-li" to="/hotta-page/food" active-class="active-link">
                  <i class="ri-cake-3-line" style="font-size: 14px"></i>
                  <span style="margin-left: 10px">食物</span>
                </NuxtLink>
              </li>
              <li @click="closeMobileMenu">
                <NuxtLink class="submenu-li" to="/hotta-page/recipes" active-class="active-link">
                  <i class="ri-book-2-line" style="font-size: 14px"></i>
                  <span style="margin-left: 10px">食谱</span>
                </NuxtLink>
              </li>
            </ul>
          </transition>
        </li>
      </ul>
    </nav>

    <!-- 4. 搜索框 (桌面显示/移动隐藏) -->
    <div class="search-container">
      <input
          ref="searchInputRef"
          type="text"
          placeholder="请输入"
          v-model="searchText"
          @blur="handleBlur"
          @focus="handleFocus"
          @input="searchBlog"
      />
      <div @click="handleIconClick">
        <i class="ri-search-line search-icon"></i>
      </div>
    </div>

    <!-- 5. 搜索结果 -->
    <transition name="fade-slide">
      <div v-show="showDropdown" class="dropdown-box" @mousedown.prevent>
        <div class="search-results-list">
          <div v-show="!isLoading">
            <div v-for="item in articles" :key="item.blogId" class="search-item"
                 @click="navigateToArticle(item.blogId)">
              <div class="search-item-content">
                <div class="search-item-header">
                  <n-highlight
                      :highlight-style="{color: '#E19EBA', backgroundColor: 'transparent'}"
                      class="search-title"
                      :text="item.title"
                      :patterns="[searchText]"
                  />
                  <span class="search-date"># {{ item.createdAt.substring(0, 10) }}</span>
                </div>
                <n-highlight
                    :highlight-style="{color: '#E19EBA', backgroundColor: 'transparent'}"
                    class="search-summary"
                    :text="item.summary.replace(/[\r\n]+/g, '')"
                    :patterns="[searchText]"
                />
              </div>
            </div>
          </div>
          <div v-show="isLoading">
            <n-skeleton round :style="{ height: '20px', width: '150px', borderRadius : '10px', marginTop : '13px' }"/>
            <n-skeleton round :style="{ height: '20px', width: '460px', borderRadius : '10px', marginTop : '13px' }"/>
            <n-skeleton round :style="{ height: '20px', width: '460px', borderRadius : '10px', marginTop : '13px' }"/>
            <n-skeleton round :style="{ height: '20px', width: '460px', borderRadius : '10px', marginTop : '13px' }"/>
            <n-skeleton round :style="{ height: '20px', width: '150px', borderRadius : '10px', marginTop : '13px' }"/>
            <n-skeleton round :style="{ height: '20px', width: '460px', borderRadius : '10px', marginTop : '13px' }"/>
            <n-skeleton round :style="{ height: '20px', width: '460px', borderRadius : '10px', marginTop : '13px' }"/>
            <n-skeleton round :style="{ height: '20px', width: '460px', borderRadius : '10px', marginTop : '13px' }"/>
            <n-skeleton round :style="{ height: '20px', width: '150px', borderRadius : '10px', marginTop : '13px' }"/>
            <n-skeleton round :style="{ height: '20px', width: '460px', borderRadius : '10px', marginTop : '13px' }"/>
            <n-skeleton round :style="{ height: '20px', width: '460px', borderRadius : '10px', marginTop : '13px' }"/>
            <n-skeleton round :style="{ height: '20px', width: '460px', borderRadius : '10px', marginTop : '13px' }"/>
          </div>
        </div>
      </div>
    </transition>

    <ProgressBar/>
  </header>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted, watch} from 'vue'
import {useRouter} from 'vue-router'
import type {BlogDateListRes, BlogItem} from "~/types/blog";
import {BaseAPI} from "~/utils/api";
import {NSkeleton, NHighlight} from "naive-ui";
import {debounce} from 'lodash-es';

const router = useRouter()
const searchText = ref('')
const showDropdown = ref(false)
const articles = ref<BlogItem[]>([])
const isLoading = ref<boolean>(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

// 菜单相关
const isSubmenuVisible = ref(false)
const isMobileMenuOpen = ref(false)
const isDesktop = ref(true)

const navRef = ref<HTMLElement | null>(null) // 新增：用于绑定菜单DOM
const toggleBtnRef = ref<HTMLElement | null>(null) // 新增：用于绑定按钮DOM

const handleClickOutside = (event: MouseEvent) => {
  if (isDesktop.value || !isMobileMenuOpen.value) return

  const target = event.target as Node
  // 如果点击的不是菜单内部，也不是切换按钮，则关闭菜单
  if (navRef.value && !navRef.value.contains(target) &&
      toggleBtnRef.value && !toggleBtnRef.value.contains(target)) {
    isMobileMenuOpen.value = false
    isSubmenuVisible.value = false // 同时折叠子菜单
  }
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  window.addEventListener('click', handleClickOutside) // 新增监听
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkScreenSize)
    window.removeEventListener('click', handleClickOutside) // 移除监听
    // document.body.style.overflow = '' // 这句也不需要了
  }
})

const checkScreenSize = () => {
  if (typeof window !== 'undefined') {
    isDesktop.value = window.innerWidth > 768
    if (isDesktop.value) {
      isMobileMenuOpen.value = false
      isSubmenuVisible.value = false
    }
  }
}

// 禁止背景滚动
watch(isMobileMenuOpen, (val) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkScreenSize)
    document.body.style.overflow = ''
  }
})

const goBack = () => {
  router.back()
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (!isMobileMenuOpen.value) {
    isSubmenuVisible.value = false
  }
}

const closeMobileMenu = () => {
  if (!isDesktop.value) {
    isMobileMenuOpen.value = false
    isSubmenuVisible.value = false
  }
}

const performSearch = async () => {
  if (!searchText.value.trim()) {
    showDropdown.value = false
    return
  }
  try {
    isLoading.value = true
    showDropdown.value = true
    const res: BlogDateListRes = await BaseAPI.apiGet(`blog/search/${searchText.value}`)
    articles.value = res.data
  } finally {
    isLoading.value = false
  }
}

const showSubmenu = () => {
  if (isDesktop.value) isSubmenuVisible.value = true
}
const hideSubmenu = () => {
  if (isDesktop.value) isSubmenuVisible.value = false
}

const handleSubmenuClick = (e: Event) => {
  if (!isDesktop.value) {
    e.preventDefault()
    isSubmenuVisible.value = !isSubmenuVisible.value
  }
}

const handleIconClick = () => {
  searchInputRef.value?.focus();
}
const searchBlog = debounce(performSearch, 500);

const navigateToArticle = (articleId: number) => {
  showDropdown.value = false;
  router.push(`/markdown-page?articleId=${articleId}`)
}

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 150)
}
const handleFocus = () => {
  if (!searchText.value.trim()) {
    showDropdown.value = false;
    return
  }
  setTimeout(() => {
    showDropdown.value = true
  }, 150)
}
</script>


<style scoped>
/* --- 1. Header 基础样式 --- */
.header-container {
  position: sticky;
  top: -60px; /* 原始样式 */
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  padding: 0 50px;
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  user-select: none;
  transition: all 0.3s;
}

/* --- 2. 按钮样式 --- */
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 102; /* 确保在最上层 */
}

.back-btn:hover {
  color: #4da6ff;
}

/* 移动端菜单开关按钮 */
.mobile-menu-toggle {
  display: none; /* 桌面端隐藏 */
  background: none;
  border: none;
  font-size: 24px;
  color: white; /* 这里建议用白色以适配深色 Header 背景，或者根据你的主题调整 */
  cursor: pointer;
  z-index: 102;
}

/* --- 3. 导航菜单 (默认桌面端样式) --- */
.main-nav {
  margin: 0 auto;
}

.main-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.main-menu li {
  display: inline-block;
  padding: 0.75em 1.875em;
}

.main-menu li a {
  position: relative;
  font-size: 1em;
  color: rgb(39, 39, 42);
  text-decoration: none;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.menu-label-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.arrow-icon {
  margin-left: 8px;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.main-menu li a:hover, .menu-label-wrapper:hover .menu-link-txt {
  color: #78c1f3;
}

.main-menu li a.active-link {
  color: #78c1f3;
}

/* --- 4. 搜索框 --- */
.search-container {
  position: relative;
  margin-left: 20px;
}

.search-container input {
  width: 200px;
  padding: 5px 20px 5px 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
  background: transparent;
  border: none;
  border-bottom: 2px solid #bcb7b7;
  outline: none;
}

.search-container input::placeholder {
  color: #888;
  opacity: 1;
}

.search-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  cursor: pointer;
  color: #999;
}

/* --- 5. 子菜单 (桌面悬浮) --- */
.has-submenu {
  position: relative;
}

.submenu {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  margin: 0;
  list-style: none;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 11;
  padding: 10px 0;
  min-width: 120px;
}

.submenu {
  position: absolute;
  top: 40px;
  left: 100px;
  width: max-content;
  margin: 0;
  list-style: none;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 11;
  padding-inline-start: 0;
  overflow: hidden;
  min-width: 100px;
  text-align: center;
}

.submenu li {
  display: block;
  padding: 0;
}

.submenu li a {
  display: block;
  padding: 10px 20px;
  font-size: 0.9em;
  color: black;
  text-transform: none;
  white-space: nowrap;
}

.submenu li a:hover {
  background-color: rgba(209, 241, 253, 0.5);
  color: rgb(47, 183, 227);
}

/* --- 5. 搜索结果下拉框 --- */
.dropdown-box {
  position: absolute;
  top: 65px;
  right: 20px;
  z-index: 20;
  width: 500px;
  height: 430px;
  padding: 10px 3px;
  color: black;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-results-list {
  width: 100%;
  height: 100%;
  padding: 0 10px;
  overflow-y: auto;
}

.search-item {
  width: 100%;
  padding: 10px 0;
  transition: background 0.2s ease;
  border-radius: 10px;
}

.search-item:hover {
  background-color: rgba(225, 158, 186, 0.5);
  cursor: pointer;
}

.search-item-content {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

.search-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
}

.search-title {
  margin-bottom: 5px;
  font-weight: bold;
  word-break: break-all;
}

.search-item:hover .search-title {
  color: #DF1C5F;
}

.search-date {
  font-size: 12px;
  color: #666666;
  min-width: 80px;
}

.search-summary {
  font-size: 13px;
  color: #00000080;
  letter-spacing: 0.01em;
  word-break: break-all;
}

.header-img{

  display: none;

  img{
    border-radius:20px;
  }
}

/* =========================================
   移动端适配 (核心修复)
   ========================================= */
/* =========================================
   移动端美化适配 (Modern Mobile Style)
   ========================================= */
/* =========================================
   移动端悬浮卡片适配 (Floating Popover Style)
   ========================================= */
@media screen and (max-width: 768px) {

  .header-img{
    border-radius:20px;
    display: block;
  }
  /* 1. Header 调整 */
  .header-container {
    padding: 0 20px;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  .back-btn { display: none; }
  .search-container, .dropdown-box { display: none !important; }

  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: #333;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    transition: background 0.2s;
  }
  .mobile-menu-toggle:active {
    background-color: rgba(0,0,0,0.05);
  }

  /* 2. 主导航 - 悬浮气泡样式 */
  .main-nav {
    position: absolute; /* 绝对定位，不再是 fixed */
    top: 70px;          /* 距离 Header 底部一点距离 */
    left: 10px;        /* 靠右对齐 */
    width: 150px;       /* 固定宽度，做成卡片 */
    height: auto;       /* 高度随内容自适应 */
    background-color: rgba(255,255,255,0.95);
    border-radius: 12px; /* 圆角 */
    padding: 8px;       /* 整体内边距 */

    /* 核心：卡片阴影 */
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(0,0,0,0.05); /* 模拟细边框 */

    /* 动画初始状态：缩放 + 透明 */
    transform-origin: top right; /* 从右上角放大出来 */
    transform: scale(0.9) translateY(-10px);
    opacity: 0;
    pointer-events: none; /* 隐藏时不可点击 */
    transition:
        transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
        opacity 0.2s ease;
    z-index: 1000;
  }

  /* 激活状态 */
  .main-nav.mobile-active {
    transform: scale(1) translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  /* 3. 菜单列表布局 */
  .main-menu {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
  }

  .main-menu li {
    display: block;
    width: 100%;
    padding: 0;
    border: none;
    margin-bottom: 2px;
  }

  /* 菜单链接样式 */
  .main-menu li a, .menu-label-wrapper {
    padding: 10px 12px; /* 紧凑一点的内边距 */
    font-size: 15px;
    font-weight: bold;
    color: #4a4a4a;
    border-radius: 8px; /* 每一项也是圆角 */
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s;
    cursor: pointer;
    width: 100%;
  }

  .menu-label-wrapper{
    padding: 0;
  }

  /* 悬停/激活/点击态 */
  .main-menu li a:hover,
  .submenu-li:hover,
  .menu-label-wrapper:hover {
    background-color: #f3f4f6;
  }

  .main-menu li a.active-link {
    background-color: rgba(77, 166, 255, 0.1); /* 淡蓝背景 */
    color: #4da6ff;
  }

  /* 4. Arrow 图标 */
  .arrow-icon svg {
    width: 10px;
    height: 10px;
    color: #9ca3af; /* 浅灰色箭头 */
  }
  .arrow-icon.rotated {
    transform: rotate(180deg);
  }

  /* 5. 子菜单 (折叠/展开) */
  .submenu {
    position: static;
    transform: none;
    box-shadow: none;
    background: transparent; /* 不需要背景色，直接融入 */
    width: 100%;
    border-radius: 0;
    padding: 0;
    margin-top: 0;
    overflow: hidden;
  }

  .submenu li a {
    padding-left: 24px; /* 简单的缩进 */
    font-size: 14px;
    color: #6b7280;
    height: 36px; /* 子菜单稍微矮一点 */
    line-height: 36px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .submenu li span {
    margin-left: 0;
    margin-right: 30px;
    font-size: 14px;
    height: 36px; /* 子菜单稍微矮一点 */
    line-height: 36px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .main-menu li a:hover, .menu-label-wrapper:hover .menu-link-txt {
    color: #78c1f3;
  }
}
</style>