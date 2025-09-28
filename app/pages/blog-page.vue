<template>
  <div class="card-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div v-if="articles.length === 0" class="empty">该日期没有文章</div>

      <div v-for="article in articles" :key="article.id" class="article-item" @click="toMarkdownPage(article.id)">
        <h3 class="title">{{ article.title }}</h3>
        <p class="summary">{{ article.summary }}</p>
        <div class="date">{{ formatDate(article.date) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebar } from '~/stores/sidebar'

// 激活左侧侧边栏
useSidebar('SidebarBlogMenu', {})

const route = useRoute()
const date = computed(() => route.query.date || '')
import { useRouter } from 'vue-router'

const router = useRouter()
// 文章列表
const articles = ref<Array<{ id: number, title: string, summary: string, date: string }>>([])
const allArticles = [
  { id: 1, title: 'Vue 3 新特性详解', summary: 'Vue 3 带来了 Composition API、Teleport、Suspense 等新特性……', date: '2025-09-28' },
  { id: 2, title: 'Nuxt 3 入门指南', summary: 'Nuxt 3 支持全新的 server engine、Nitro、Vue 3 特性……', date: '2025-09-28' },
  { id: 3, title: 'TypeScript 基础语法', summary: 'TypeScript 是 JavaScript 的超集，支持静态类型检查……', date: '2025-09-27' },
  { id: 4, title: 'Pinia 状态管理实战', summary: 'Pinia 是 Vue 官方推荐的新一代状态管理工具……', date: '2025-09-27' },
  { id: 5, title: 'Markdown 高级用法', summary: '通过 markdown-it 可以实现自定义渲染、代码高亮……', date: '2025-09-26' }
]


const loading = ref(false)

// 模拟 API 请求
const fetchArticles = async () => {
  if (!date.value) return
  loading.value = true
  // 这里替换成你的真实 API
  // const res = await $fetch(`/api/articles?date=${date.value}`)
  articles.value = allArticles
  loading.value = false
}

// 初次加载
onMounted(fetchArticles)

// 监听日期变化刷新列表
watch(date, fetchArticles)

// 日期格式化
const formatDate = (d: string) => {
  const dt = new Date(d)
  return dt.toLocaleDateString()
}

const toMarkdownPage = (articleId: string) => {
  router.push({ path: '/markdown-page', query: { articleId } })
}

</script>

<style scoped lang="scss">
.card-container {
  margin-bottom: 15px;
  padding: 20px;
  min-height: calc(100vh - 130px);
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }
}

.loading, .empty {
  text-align: center;
  color: #999;
  margin-top: 50px;
  font-size: 1rem;
}

.article-item {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;

  &:hover {
    background: rgba(77, 166, 255, 0.05);
  }

  .title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
  }

  .summary {
    font-size: 0.95rem;
    color: #666;
    margin-bottom: 8px;
  }

  .date {
    font-size: 0.85rem;
    color: #999;
  }
}
</style>
