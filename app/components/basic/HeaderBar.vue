<template>
  <header class="header-container">
    <!-- 1. 返回按钮 (桌面端) -->
    <div class="back-div">
      <button class="back-btn" @click="goBack" aria-label="返回">
        <i class="ri-arrow-left-line"></i>
      </button>
    </div>

    <!-- 2. 移动端：菜单切换 & 主题切换 -->
    <div class="mobile-controls">
      <button
          ref="toggleBtnRef"
          class="mobile-btn"
          @click="toggleMobileMenu"
          aria-label="菜单"
      >
        <i :class="isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'"></i>
      </button>

      <button
          @click="toggleTheme($event)"
          class="mobile-btn"
      >
        <i v-if="colorMode.value === 'dark'" class="ri-moon-clear-fill"></i>
        <i v-else class="ri-sun-fill"></i>
      </button>
    </div>

    <!-- 移动端中间显示的名称 -->
    <div class="header-name">
      <span>Hollow's Space</span>
    </div>

    <!-- 移动端显示的头像 -->
    <div class="header-img">
      <img width="40" src="https://avatars.githubusercontent.com/u/87030922?v=4" alt="头像" class="avatar"/>
    </div>

    <!-- 3. 主导航 -->
    <nav ref="navRef" class="main-nav" :class="{ 'mobile-active': isMobileMenuOpen }">
      <ul class="main-menu">
        <li @click="closeMobileMenu">
          <NuxtLink to="/" active-class="active-link">
            <i class="ri-home-3-line nav-icon"></i>
            <span>首页</span>
            <div class="arrow-icon-right">
              <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor" d="M190.6 469.1l192-192c12.5-12.5 12.5-32.8 0-45.3l-192-192c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L302.7 256 145.3 423.8c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z"></path>
              </svg>
            </div>
          </NuxtLink>
        </li>
        <li @click="closeMobileMenu">
          <NuxtLink to="/blog-page" active-class="active-link">
            <i class="ri-article-line nav-icon"></i>
            <span>文章</span>
            <div class="arrow-icon-right">
              <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor" d="M190.6 469.1l192-192c12.5-12.5 12.5-32.8 0-45.3l-192-192c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L302.7 256 145.3 423.8c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z"></path>
              </svg>
            </div>
          </NuxtLink>
        </li>

        <!-- Hotta 下拉菜单 -->
        <li
            @mouseenter="isDesktop ? showSubmenu() : null"
            @mouseleave="isDesktop ? hideSubmenu() : null"
            class="has-submenu"
        >
          <div class="menu-label-wrapper" @click="handleSubmenuClick">
            <a class="menu-link-txt">
              <i class="ri-gamepad-line nav-icon"></i>
              <span>Hotta</span>
              <div class="arrow-icon" :class="{ 'rotated': isSubmenuVisible }">
                <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path fill="currentColor" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
                </svg>
              </div>
            </a>
          </div>

          <transition name="fade-slide">
            <ul v-show="isSubmenuVisible" class="submenu">
              <li @click="closeMobileMenu">
                <NuxtLink class="submenu-li" to="/hotta-page/artifact" active-class="active-link">
                  <i class="ri-box-3-line" style="font-size: 14px"></i>
                  <span style="margin-left: 15px">源器</span>
                </NuxtLink>
              </li>
              <li @click="closeMobileMenu">
                <NuxtLink class="submenu-li" to="/hotta-page/food" active-class="active-link">
                  <i class="ri-cake-3-line" style="font-size: 14px"></i>
                  <span style="margin-left: 15px">食物</span>
                </NuxtLink>
              </li>
              <li @click="closeMobileMenu">
                <NuxtLink class="submenu-li" to="/hotta-page/recipes" active-class="active-link">
                  <i class="ri-book-2-line" style="font-size: 14px"></i>
                  <span style="margin-left: 15px">食谱</span>
                </NuxtLink>
              </li>
              <li @click="closeMobileMenu">
                <NuxtLink class="submenu-li" to="/hotta-page/weapons" active-class="active-link">
                  <i class="ri-sword-fill" style="font-size: 14px"></i>
                  <span style="margin-left: 15px">武器</span>
                </NuxtLink>
              </li>
              <li @click="closeMobileMenu">
                <NuxtLink class="submenu-li" to="/hotta-page/matrix" active-class="active-link">
                  <i class="ri-aed-line" style="font-size: 14px"></i>
                  <span style="margin-left: 15px">意志</span>
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

    <!-- 右侧功能按钮 (桌面) -->
    <div class="desktop-controls">
      <button @click="toggleTheme($event)" class="icon-btn">
        <i v-if="colorMode.value === 'dark'" class="ri-moon-clear-fill"></i>
        <i v-else class="ri-sun-fill"></i>
      </button>
      <button onclick="window.open('https://github.com/hollow288', '_blank')" class="icon-btn">
        <i class="ri-github-line"></i>
      </button>
    </div>

    <!-- 5. 搜索结果 -->
    <transition name="fade-slide">
      <div v-show="showDropdown" class="dropdown-box" @mousedown.prevent>
        <div class="search-results-list">
          <div v-show="!isLoading">
            <div v-for="item in articles" :key="item.blogId" class="search-item" @click="navigateToArticle(item.blogId)">
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
          <!-- 骨架屏 -->
          <div v-show="isLoading">
            <n-skeleton round :style="{ height: '20px', width: '150px', borderRadius : '10px', marginTop : '13px' }"/>
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
import {ref, onMounted, onUnmounted, watch, nextTick} from 'vue'
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

const navRef = ref<HTMLElement | null>(null)
const toggleBtnRef = ref<HTMLElement | null>(null)

// 获取 colorMode 实例
const colorMode = useColorMode()

const toggleTheme = (event?: MouseEvent) => {
  const x = event?.clientX ?? window.innerWidth / 2
  const y = event?.clientY ?? window.innerHeight / 2
  const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
  )

  if (!document.startViewTransition) {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    return
  }

  const transition = document.startViewTransition(async () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    await nextTick()
  })

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`
    ]
    const isDark = colorMode.value === 'dark'
    document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath] : [...clipPath].reverse(),
        },
        {
          duration: 400,
          easing: 'ease-in',
          pseudoElement: isDark ? '::view-transition-new(root)' : '::view-transition-old(root)',
        }
    )
  })
}

const handleClickOutside = (event: MouseEvent) => {
  if (isDesktop.value || !isMobileMenuOpen.value) return
  const target = event.target as Node
  if (navRef.value && !navRef.value.contains(target) &&
      toggleBtnRef.value && !toggleBtnRef.value.contains(target)) {
    isMobileMenuOpen.value = false
    isSubmenuVisible.value = false
  }
}

const checkScreenSize = () => {
  if (typeof window !== 'undefined') {
    isDesktop.value = window.innerWidth > 850
    if (isDesktop.value) {
      isMobileMenuOpen.value = false
      isSubmenuVisible.value = false
    }
  }
}

watch(isMobileMenuOpen, (val) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', checkScreenSize)
    window.removeEventListener('click', handleClickOutside)
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
/* =========================================
   1. Layout & Header Container
   ========================================= */
.header-container {
  position: sticky;
  top: -60px;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  padding: 0 10px 0 50px;
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  user-select: none;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.back-div {
  width: 200px;
}

/* Mobile Name & Image (Hidden on Desktop) */
.header-name,
.header-img {
  display: none;
}

.header-name span {
  color: rgba(204, 204, 204, 0.9);
  font-size: 18px;
  font-weight: bold;
}

.header-img img {
  border-radius: 20px;
}

/* =========================================
   2. Buttons (Desktop & Shared)
   ========================================= */
button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  z-index: 102;
}

.back-btn:hover {
  color: #4da6ff;
}

/* Desktop right-side controls */
.desktop-controls {
  width: 100px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: -1px;
  padding-left: 12px;
  gap: 12px;
}

.icon-btn {
  display: flex;
  font-size: 22px;
  color: #999;
  z-index: 102;
}

.icon-btn:hover {
  color: #78c1f3;
}

/* Mobile Controls (Hidden on Desktop) */
.mobile-controls {
  display: none;
}

/* =========================================
   3. Navigation (Desktop)
   ========================================= */
.main-nav {
  margin: 0 auto;
}

.main-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Links & Text */
.main-menu li a,
.menu-link-txt {
  position: relative;
  font-size: 1em;
  color: var(--text-main);
  text-decoration: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.main-menu li a span {
  position: relative;
  z-index: 1;
}

/* Icons */
.nav-icon {
  margin-right: 6px;
  font-size: 18px;
  transition: transform 0.3s ease;
}

/* Arrows */
.arrow-icon,
.arrow-icon-right {
  margin-left: 6px;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  opacity: 0.7;
}

.arrow-icon-right {
  display: none; /* Desktop 默认隐藏右侧箭头 */
}

.arrow-icon svg,
.arrow-icon-right svg {
  width: 10px;
  height: 10px;
}

/* States: Hover & Active */
.main-menu li:hover a:hover,
.menu-link-txt:hover  {
  color: rgb(39, 162, 190);
  background-color: rgba(209, 241, 253, 0.5);
  border-radius: 10px;
}

.main-menu li a.active-link{
  color: rgb(39, 162, 190);
}


.main-menu li a:hover .arrow-icon,
.menu-label-wrapper:hover .arrow-icon {
  opacity: 1;
}

.arrow-icon.rotated {
  transform: rotate(180deg);
}

/* Submenu Wrapper */
.menu-label-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 100%;
}

.has-submenu {
  position: relative;
}

/* =========================================
   4. Submenu (Desktop Dropdown)
   ========================================= */
.submenu {
  position: absolute;
  top: 40px;
  left: 50%;
  width: max-content;
  min-width: 100px;
  margin: 0;
  padding: 0;
  list-style: none;
  background-color: var(--bg-card-glass-95);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 11;
  overflow: hidden;
  text-align: center;
}

.submenu li a {
  display: block;
  padding: 10px 28px;
  font-size: 0.9em;
  color: var(--text-main);
  text-transform: none;
  white-space: nowrap;
}

.submenu li a:hover {
  background-color: rgba(209, 241, 253, 0.5);
}

/* =========================================
   5. Search Bar & Results
   ========================================= */
.search-container {
  position: relative;
  margin-left: 20px;
}

.search-container input {
  width: 150px;
  padding: 5px 20px 5px 0;
  font-size: 14px;
  color: var(--summary-50);
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

.search-icon:hover {
  color: #78c1f3;
}

/* Dropdown Results */
.dropdown-box {
  position: absolute;
  top: 65px;
  right: 20px;
  z-index: 20;
  width: 500px;
  height: 430px;
  padding: 10px 3px;
  color: var(--text-main);
  background-color: var(--bg-card-glass-95);
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
  cursor: pointer;
}

.search-item:hover {
  background-color: rgba(225, 158, 186, 0.5);
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
  color: var(--summary-50);
  letter-spacing: 0.01em;
  word-break: break-all;
}

/* =========================================
   6. Mobile Adaptation (max-width: 850px)
   ========================================= */
@media screen and (max-width: 850px) {

  /* --- Mobile Header Layout --- */
  .header-container {
    padding: 0 20px;
    background-color: var(--bg-card-glass-95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .header-name,
  .header-img {
    display: flex;
    position: absolute;
  }

  .header-name {
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    z-index: 1;
  }

  .header-img {
    right: 20px;
  }

  /* --- Hide Desktop Elements --- */
  .back-btn,
  .back-div,
  .search-container,
  .dropdown-box,
  .desktop-controls {
    display: none !important;
  }

  /* --- Show Mobile Controls --- */
  .mobile-controls {
    display: flex;
  }

  .mobile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: var(--text-main);
    width: 40px;
    height: 40px;
    border-radius: 8px;
    transition: background 0.2s;
    z-index: 102;
  }

  .mobile-btn:active {
    background-color: rgba(0, 0, 0, 0.05);
  }

  /* --- Floating Card Menu (Mobile Nav) --- */
  .main-nav {
    position: absolute;
    top: 70px;
    left: 10px;
    width: 150px;
    height: auto;
    background-color: var(--bg-card-glass-95);
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.05);

    transform-origin: top left;
    transform: scale(0.9) translateY(-10px);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
    z-index: 1000;
  }

  .main-nav.mobile-active {
    transform: scale(1) translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  /* --- Mobile Menu Items --- */
  .main-menu {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
    gap: 2px;
  }

  .main-menu li {
    width: 100%;
  }

  .main-menu li a,
  .menu-label-wrapper {
    font-size: 15px;
    border-radius: 8px;
    justify-content: space-between;
    width: 100%;
    box-shadow: none !important;
  }

  .nav-icon {
    margin-right: 10px;
    font-size: 16px;
  }

  .arrow-icon-right {
    display: flex;
    color: #9ca3af;
  }

  /* Active/Hover states in Mobile */
  .main-menu li:hover a:hover,
  .submenu-li:hover,
  .main-menu li a.active-link {
    background-color: rgba(77, 166, 255, 0.1);
    color: #4da6ff;
  }

  .main-menu li a.active-link,
  .submenu-li.active-link {
    background-color: transparent; /* 移动端选中背景设为透明，避免过重 */
  }

  /* --- Mobile Submenu (Accordion style) --- */
  .submenu {
    position: static;
    transform: none;
    box-shadow: none;
    background: transparent;
    width: 100%;
    border-radius: 0;
    margin: 0;
    overflow: hidden;
    text-align: left;
  }

  .submenu li a {
    padding: 0 12px 0 24px; /* 缩进 */
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    justify-content: flex-start;
  }

  .submenu li a span {
    margin-left: 0;
  }
}
</style>