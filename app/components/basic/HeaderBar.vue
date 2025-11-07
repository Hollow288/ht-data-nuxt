<template>
  <header class="header-container">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack" aria-label="返回">
      <i class="ri-arrow-left-line"></i>
    </button>

    <!-- 主导航 -->
    <nav class="main-nav">
      <ul class="main-menu">
        <li>
          <NuxtLink to="/" active-class="active-link">首页</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/blog-page" active-class="active-link">文章</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/hotta-page" active-class="active-link">Hotta</NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- 搜索框 -->
    <div class="search-container">
      <input
          type="text"
          placeholder="请输入"
          v-model="searchText"
          @blur="handleBlur"
          @focus="handleFocus"
          @input="searchBlog"
      />
      <div @click="searchBlog">
        <i class="ri-search-line search-icon"></i>
      </div>
    </div>

    <!-- 搜索结果下拉框 (保持在 header 下以维持原始定位) -->
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
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import type {BlogDateListRes, BlogItem} from "~/types/blog";
import {BaseAPI} from "~/utils/api";
import {NSkeleton} from "naive-ui";
import { debounce } from 'lodash-es';

const router = useRouter()
const searchText = ref('')
const showDropdown = ref(false)
const articles = ref<BlogItem[]>([])
const isLoading = ref<boolean>(false)

const goBack = () => {
  router.back()
}

// 搜索文章
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

const searchBlog = debounce(performSearch, 500);

// 导航到文章（占位函数）
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
    showDropdown.value = false
    return
  }
  setTimeout(() => {
    showDropdown.value = true
  }, 150)
}
</script>

<style scoped>
/* --- 1. 头部容器 --- */
.header-container {
  position: sticky;
  top: -60px; /* 原始样式 */
  left: 0;
  z-index: 10;
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
  cursor: default;
}

/* --- 2. 返回按钮 --- */
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  margin-right: 1rem;
  margin-left: 30px;
  font-size: 1.5rem;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #4da6ff;
}

/* --- 3. 导航菜单 --- */
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
  padding-bottom: 1em;
  font-size: 1em;
  color: white;
  text-decoration: none;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s;
}

.main-menu li a:hover {
  color: #4da6ff;
}

.main-menu li a.active-link {
  color: #4da6ff;
}

.main-menu li a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0.1875em;
  background-color: #4da6ff;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
}

.main-menu li a:hover::after {
  transform: scaleX(1);
}

/* --- 4. 搜索区域 --- */
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
  color: #999;
}

/* --- 5. 搜索结果下拉框 --- */
.dropdown-box {
  position: absolute;
  top: 65px;
  right: 20px;
  z-index: 20;
  width: 500px;
  height: 430px;
  padding: 15px 3px;
  color: black;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-results-list {
  width: 100%;
  height: 100%;
  padding: 0 15px;
  overflow-y: auto;
}

/* --- 6. 搜索结果条目 --- */
.search-item {
  width: 100%;
  padding: 10px 0;
  transition: background 0.2s ease;
}

.search-item:hover {
  background-color: rgba(225, 158, 186, 0.5);
  border-radius: 10px;
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
}

.search-item:hover .search-title {
  color: #DF1C5F;
}

.search-date {
  font-size: 12px;
  color: #666666;
}

.search-summary {
  font-size: 13px;
  color: #00000080;
  letter-spacing: 0.01em;
  word-break: break-all;
}

/* --- 7. 下拉框滚动条样式 --- */
.search-results-list::-webkit-scrollbar {
  width: 6px;
}

.search-results-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.search-results-list::-webkit-scrollbar-thumb {
  background-color: #b8b6b6;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-results-list::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}

/* --- 8. 过渡动画 --- */
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
</style>