<template>
  <header class="header-container">
    <!-- 1. 返回按钮 -->
    <button class="back-btn" @click="goBack" aria-label="返回">
      <i class="ri-arrow-left-line"></i>
    </button>

    <!-- 2. 移动端菜单切换按钮 -->
    <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="菜单">
      <i :class="isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'"></i>
    </button>

    <!-- 3. 主导航 -->
    <!-- 注意：这里的 CSS 会控制它从左侧滑出来 -->
    <nav class="main-nav" :class="{ 'mobile-active': isMobileMenuOpen }">
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
            <NuxtLink to="/hotta-page" active-class="active-link" class="menu-link-txt">
              Hotta
            </NuxtLink>
            <div class="arrow-icon" :class="{ 'rotated': isSubmenuVisible }">
              <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 512 512" style="width: 10px; height: 10px;">
                <path fill="currentColor"
                      d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
              </svg>
            </div>
          </div>

          <transition name="fade-slide">
            <ul v-show="isSubmenuVisible" class="submenu">
              <li @click="closeMobileMenu">
                <NuxtLink to="/hotta-page/artifact" active-class="active-link">
                  <i class="ri-box-3-line" style="font-size: 14px"></i>
                  <span style="margin-left: 10px">源器</span>
                </NuxtLink>
              </li>
              <li @click="closeMobileMenu">
                <NuxtLink to="/hotta-page/food" active-class="active-link">
                  <i class="ri-cake-3-line" style="font-size: 14px"></i>
                  <span style="margin-left: 10px">食物</span>
                </NuxtLink>
              </li>
              <li @click="closeMobileMenu">
                <NuxtLink to="/hotta-page/recipes" active-class="active-link">
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

/* =========================================
   移动端适配 (核心修复)
   ========================================= */
@media screen and (max-width: 768px) {
  /* 1. Header 调整 */
  .header-container {
    padding: 0 20px;
    background-color: rgba(255, 255, 255, 0.9);
  }

  .back-btn{
    display: none;
  }

  /* 2. 按钮颜色适配 */
  .mobile-menu-toggle {
    color: #333; /* 浅色背景用深色图标 */
  }

  .mobile-menu-toggle {
    display: block;
  }

  /* 3. 隐藏搜索 */
  .search-container, .dropdown-box {
    display: none !important;
  }

  /* 4. 侧滑菜单 (从左侧滑出) */
  .main-nav {
    position: fixed;
    top: 60px; /* 在 Header 下方 */
    left: 0;
    width: 100%;
    height: calc(100vh - 60px);
    background-color: white; /* 确保背景不透明 */
    padding: 20px 0;
    overflow-y: auto;
    overflow-x: hidden;

    /* 核心修改：改为从左侧(-100%)滑入，解决右侧空白问题 */
    transform: translateX(-100%);
    visibility: hidden;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s linear 0.3s;
    box-shadow: none;
  }

  .main-nav.mobile-active {
    transform: translateX(0);
    visibility: visible;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0s linear 0s;
  }

  /* 5. 菜单项调整 */
  .main-menu {
    flex-direction: column;
    width: 100%;
    align-items: flex-start;
  }

  .main-menu li {
    display: block;
    width: 100%;
    padding: 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .main-menu li a, .menu-label-wrapper {
    padding: 16px 24px;
    width: 100%;
    font-size: 16px;
    justify-content: space-between;
    color: #333;
  }

  /* 6. 子菜单调整 */
  .submenu {
    position: static;
    transform: none;
    box-shadow: none;
    background-color: #fafafa;
    width: 100%;
    border-radius: 0;
    padding: 0;
  }

  .submenu li a {
    padding-left: 48px;
    font-size: 14px;
    color: #666;
  }

  .arrow-icon.rotated {
    transform: rotate(180deg);
  }
}
</style>