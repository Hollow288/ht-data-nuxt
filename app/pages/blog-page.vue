<template>
  <div class="page-layout" >
    <!-- 左侧栏 -->
    <aside class="left-sidebar">
      <ul class="menu-wrapper">
        <li v-for="(items, year) in groupedDates" :key="year" class="year-group">
          <div class="year-header" @click="toggleYear(year)">
            <span>{{ year }}</span>
            <span class="arrow" :class="{ expanded: expandedYears.includes(year) }">▶</span>
          </div>
          <ul v-show="expandedYears.includes(year)" class="date-list">
            <li v-for="item in items" :key="item.date"
                :class="{ active: activeDate === item.date }"
                @click="selectDate(item.date)">
              {{ item.date }} <span class="count">({{ item.count }})</span>
            </li>
          </ul>
        </li>
      </ul>
    </aside>

    <!-- 文章区域 -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const date = computed(() => route.query.date || '')

// 文章列表
const articles = ref<Array<{ id: number, title: string, summary: string, date: string }>>([])
const allArticles = [
  { id: 1, title: 'Vue 3 新特性详解', summary: 'Vue 3 带来了 Composition API、Teleport、Suspense 等新特性……', date: '2025-09-28' },
  { id: 2, title: 'Nuxt 3 入门指南', summary: 'Nuxt 3 支持全新的 server engine、Nitro、Vue 3 特性……', date: '2025-09-28' },
  { id: 3, title: 'TypeScript 基础语法', summary: 'TypeScript 是 JavaScript 的超集，支持静态类型检查……', date: '2025-09-27' },
  { id: 4, title: 'Pinia 状态管理实战', summary: 'Pinia 是 Vue 官方推荐的新一代状态管理工具……', date: '2025-09-27' },
  { id: 5, title: 'Markdown 高级用法', summary: '通过 markdown-it 可以实现自定义渲染、代码高亮……', date: '2025-09-26' },
  { id: 6, title: 'Markdown 高级用法', summary: '通过 markdown-it 可以实现自定义渲染、代码高亮……', date: '2025-09-26' },
  { id: 7, title: 'Markdown 高级用法', summary: '通过 markdown-it 可以实现自定义渲染、代码高亮……', date: '2025-09-26' },
  { id: 8, title: 'Markdown 高级用法', summary: '通过 markdown-it 可以实现自定义渲染、代码高亮……', date: '2025-09-26' }
]

const loading = ref(false)
const fetchArticles = async () => {
  if (!date.value) return
  loading.value = true
  // 模拟 API
  articles.value = allArticles
  loading.value = false
}

onMounted(fetchArticles)
watch(date, fetchArticles)

const formatDate = (d: string) => {
  const dt = new Date(d)
  return dt.toLocaleDateString()
}

const toMarkdownPage = (articleId: string) => {
  router.push({ path: '/markdown-page', query: { articleId } })
}

// 模拟日期数据
const dateList = [
  { date: '2025-09-26', count: 5 }, { date: '2025-09-27', count: 2 },
  { date: '2025-09-28', count: 1 }, { date: '2024-08-01', count: 4 }
]

// 按年份分组
const groupedDates = dateList.reduce((acc, item) => {
  const year = item.date.split('-')[0]
  if (!acc[year]) acc[year] = []
  acc[year].push(item)
  return acc
}, {} as Record<string, { date: string, count: number }[]>)

const activeDate = ref('')
const expandedYears = ref<string[]>([])

const selectDate = (date: string) => {
  debugger
  activeDate.value = date
  articles.value = allArticles.filter(n=>n.date === date);
}

const toggleYear = (year: string) => {
  if (expandedYears.value.includes(year)) {
    expandedYears.value = expandedYears.value.filter(y => y !== year)
  } else {
    expandedYears.value.push(year)
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

.left-sidebar {
  flex: 0 0 25%;
  min-width: 180px;
  max-width: 300px;
  padding: 15px;
  box-sizing: border-box;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 140px);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }

  .menu-wrapper {
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 100%;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    .year-group {
      margin-bottom: 12px;

      .year-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 10px;
        font-weight: 600;
        color: #333;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.25s;

        &:hover { background: #eaeaea; }

        .arrow {
          font-size: 0.9em;
          transition: transform 0.3s;

          &.expanded { transform: rotate(90deg); }
        }
      }

      .date-list {
        margin-top: 6px;
        padding-left: 8px;
        border-left: 2px solid #eaeaea;

        li {
          display: flex;
          justify-content: space-between;
          padding: 6px 8px;
          font-size: 0.9em;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          color: #555;
          word-wrap: break-word;
          white-space: normal;

          &:hover {
            background: rgba(0, 123, 255, 0.05);
            color: #007bff;
          }

          &.active {
            background: rgba(0, 123, 255, 0.1);
            font-weight: 600;
            color: #007bff;
            position: relative;

            &::before {
              content: "";
              position: absolute;
              left: -8px;
              top: 4px;
              bottom: 4px;
              width: 3px;
              background: #007bff;
              border-radius: 2px;
            }
          }

          .count { font-size: 0.8em; color: #888; }
        }
      }
    }
  }
}

.card-container {
  min-height: calc(100vh - 140px);
  overflow-y: auto;
  // clamp(最小值, 理想值, 最大值)
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

  .article-item {
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    transition: background 0.2s;

    &:hover { background: rgba(77, 166, 255, 0.05); }

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
}
</style>
