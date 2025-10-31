<template>
  <div class="page-layout">
    <!-- 左侧栏 -->
    <aside class="basic-aside">
      <div style="display: flex;flex-direction: column;height: 100%">
        <div class="left-sidebar-name">
          <div class="twelve">
            <h2>
              <span style="color: #9eb4ed;">//</span> 日期 <span style="color: #e19eba;">//</span>
            </h2>
          </div>
        </div>
        <div class="left-sidebar">
          <ul class="menu-wrapper">
            <li v-for="(items, year) in groupedDates" :key="year" class="year-group">
              <div class="year-header" @click="toggleYear(year)">
                <span>{{ year }}</span>
                <span class="arrow" :class="{ expanded: expandedYears.includes(year) }">▶</span>
              </div>
              <ul v-show="expandedYears.includes(year)" class="date-list">
                <li v-for="item in items" :key="item.yearMonth"
                    :class="{ active: activeDate === item.yearMonth }"
                    @click="selectDate(item.yearMonth)">
                  {{ item.yearMonth.split('-')[1] }}月 <span class="count">{{ item.count }}</span>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>


    </aside>

    <!-- 文章区域 -->
    <div class="card-container" v-if="loading || articles.length === 0">
      <div v-if="loading" class="loading">{{ loading ? '加载中...' : '该日期没有文章' }}</div>
    </div>
    <div v-else class="cards-grid">
      <div v-for="article in articles" :key="article.blogId" class="card-item">
        <div style="display: flex; justify-content: space-between; align-items: stretch;">
          <div style="flex: 1;">
            <p class="title">{{ article.title }}</p>
            <p class="summary">{{ article.summary }}</p>
            <div class="date"><i class="ri-calendar-2-line"></i>{{ formatDate(article.createdAt) }}</div>
          </div>


          <div style="width: 40px; margin: 5px;">
            <button class="right-btn" @click="toMarkdownPage(article.blogId)">
              <i class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
// ===================== 路由相关 =====================

import type {BlogDateListRes, BlogDateMenuItem, BlogDateMenuRes, BlogItem} from "~/types/blog";
import {BaseAPI} from "~/utils/api";

const route = useRoute()
const router = useRouter()
const date = computed(() => route.query.date as string || '')

// ===================== 数据状态 =====================
const articles = ref<BlogItem[]>([])
const dateList = ref<BlogDateMenuItem[]>([])
const groupedDates = ref<Record<string, BlogDateMenuItem[]>>({})
const loading = ref(false)

const activeDate = ref('')
const expandedYears = ref<string[]>([])

// ===================== 工具函数 =====================
const formatDate = (d: string) => {
  const dt = new Date(d)
  const yyyy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// ===================== 点击日期加载文章 =====================
const selectDate = async (selectedDate: string) => {
  activeDate.value = selectedDate
  loading.value = true
  try {
    const res: BlogDateListRes = await BaseAPI.apiGet(`blog/blog-date-list/${selectedDate}`)
    articles.value = res.data
  } catch (error) {
    console.error('获取文章列表失败', error)
  } finally {
    loading.value = false
  }
}

// ===================== 数据请求 =====================
const fetchArticles = async () => {
  loading.value = true
  try {
    const res: BlogDateMenuRes = await BaseAPI.apiGet('blog/blog-date-menu')

    dateList.value = res.data

    // 按年份分组
    const grouped: Record<string, BlogDateMenuItem[]> = {}
    dateList.value.forEach(item => {
      const year = item.yearMonth.split('-')[0] ?? '其他'
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(item)
    })
    groupedDates.value = grouped

    // 自动选中第一个分组的第一个日期
    const years = Object.keys(grouped)
    if (years.length > 0) {
      const firstYear = years[0] as string
      const firstGroup = grouped[firstYear]
      if (firstGroup && firstGroup.length > 0) {
        const firstDate = firstGroup[0]!.yearMonth  // 非空断言
        expandedYears.value.push(firstYear)
        await selectDate(firstDate)
      }
    }

  } catch (error) {
    console.error('获取日期数据失败', error)
  } finally {
    loading.value = false
  }
}


// ===================== 年份折叠 =====================
const toggleYear = (year: string) => {
  if (expandedYears.value.includes(year)) {
    expandedYears.value = expandedYears.value.filter(y => y !== year)
  } else {
    expandedYears.value.push(year)
  }
}

// ===================== 跳转文章 =====================
const toMarkdownPage = (articleId: number) => {
  router.push({path: '/markdown-page', query: {articleId}})
}

// ===================== 生命周期 =====================
onMounted(fetchArticles)
watch(date, fetchArticles)
</script>

<style scoped lang="scss">


.page-layout {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px;
  flex-direction: row;
}


.card-item {
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 12px 15px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  }

  .title {
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;

    &::before {
      content: "";
      display: inline-block;
      width: 5px;
      height: 1.25em;
      background: #6e4040;
    }
  }

  .summary {
    font-size: 1rem;
    color: #666;
    margin: 20px 0;
  }

  .date {
    font-size: 0.9rem;
    color: #999;
    margin: 20px 0 10px;
    display: flex;
    align-items: center;

    i {
      font-size: 1.5rem;
      margin-right: 10px;
    }

  }
}

.basic-aside {
  flex: 0 0 25%;
  min-width: 180px;
  max-width: 300px;
  box-sizing: border-box;
  position: sticky;
  top: 40px;
  height: calc(100vh - 100px);
  user-select: none;
  cursor: default;
}

.left-sidebar-name {
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  box-sizing: border-box;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 100px);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  .twelve h2 {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    width: 160px;
    text-align: center;
    margin: auto;
    white-space: nowrap;
    padding-bottom: 13px;
    position: relative;
  }

  .twelve h2:before {
    background-color: #9eb4ed;
    content: '';
    display: block;
    height: 3px;
    width: 75px;
    margin-bottom: 5px;
  }

  .twelve h2:after {
    background-color: #e19eba;
    content: '';
    display: block;
    position: absolute;
    right: 0;
    bottom: 0;
    height: 3px;
    width: 75px;
    margin-bottom: 0.25em;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }
}

.left-sidebar {
  margin-top: 20px;
  flex: 1;
  max-height: calc(100vh - 170px);
  padding: 15px;
  box-sizing: border-box;
  position: sticky;
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
    height: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
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

        &:hover {
          background: #eaeaea;
        }

        .arrow {
          font-size: 0.9em;
          transition: transform 0.3s;

          &.expanded {
            transform: rotate(90deg);
          }
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
            background: rgba(225, 158, 186, 0.05);
            color: #df1c5f;
          }

          &.active {
            background: rgba(225, 158, 186, 0.1);
            font-weight: 600;
            color: #df1c5f;
            position: relative;

            &::before {
              content: "";
              position: absolute;
              left: -8px;
              top: 4px;
              bottom: 4px;
              width: 3px;
              background: #e19eba;
              border-radius: 2px;
            }
          }

          .count {
            font-size: 0.8em;
            color: #888;
          }
        }
      }
    }
  }
}

.cards-grid {
  width: clamp(300px, 60%, 1000px);
  margin-bottom: -20px;
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

}


.right-btn {
  width: 100%;
  height: 100%;
  background-color: #e19eba;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #fff;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background-color: #df1c5f;
    color: #fff;
  }

  i {
    transition: color 0.25s ease;
  }
}

</style>
