<template>
  <div class="page-layout">
    <!-- 左侧栏 -->
    <aside class="basic-aside">
      <div style="display: flex;flex-direction: column;height: 100%">
        <div class="left-sidebar-name">
        <p class="title">Tags</p>
        <div style="display: flex;margin-bottom: 5px;flex-wrap: wrap;">
          <div v-for="item in tagList" style="margin: 3px">
            <n-tag class="custom-tag" :class="{ active: activeTag === item }" round size="small" :bordered="false" @click="handleTagClick(item)">
              # {{ item }}
            </n-tag>
          </div>
        </div>

        </div>
        <div class="left-sidebar">
          <ul class="menu-wrapper">
            <li v-for="year in Object.keys(groupedDates).sort((a, b) => Number(b) - Number(a))" :key="year" class="year-group">
              <div class="year-header" @click="toggleYear(year)">
                <span>{{ year }}</span>
                <span class="arrow" :class="{ expanded: expandedYears.includes(year) }"> <svg aria-hidden="true"
                                                                                              focusable="false"
                                                                                              data-prefix="fas"
                                                                                              data-icon="chevron-left"
                                                                                              role="img"
                                                                                              xmlns="http://www.w3.org/2000/svg"
                                                                                              viewBox="0 0 512 512"
                                                                                              style="width: 8px; height: 8px;"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
                    d="M169.4 297.4C156.9 309.9 156.9 330.2 169.4 342.7L361.4 534.7C373.9 547.2 394.2 547.2 406.7 534.7C419.2 522.2 419.2 501.9 406.7 489.4L237.3 320L406.6 150.6C419.1 138.1 419.1 117.8 406.6 105.3C394.1 92.8 373.8 92.8 361.3 105.3L169.3 297.3z"/></svg> </span>
              </div>
              <ul v-show="expandedYears.includes(year)" class="date-list">
                <li v-for="item in groupedDates[year]" :key="item.yearMonth"
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
      <div v-if="loading" class="loading">
<!--        {{ loading ? '加载中...' : '该日期没有文章' }}-->
        <n-skeleton round :style="{ height: '20px', width: '30%', borderRadius : '10px', marginTop : '13px' }"/>
        <n-skeleton round :style="{ height: '20px', width: '100%', borderRadius : '10px', marginTop : '13px' }"/>
        <n-skeleton round :style="{ height: '20px', width: '100%', borderRadius : '10px', marginTop : '13px' }"/>
        <n-skeleton round :style="{ height: '20px', width: '30%', borderRadius : '10px', marginTop : '13px' }"/>
        <n-skeleton round :style="{ height: '20px', width: '100%', borderRadius : '10px', marginTop : '13px' }"/>
        <n-skeleton round :style="{ height: '20px', width: '100%', borderRadius : '10px', marginTop : '13px' }"/>
      </div>
      <div v-else class="loading">
        该日期没有文章
      </div>
    </div>
    <div v-else class="cards-grid">
      <div v-for="article in articles" :key="article.blogId" class="card-item">
        <div style="display: flex; justify-content: space-between; align-items: stretch;">
          <div style="flex: 1;">
            <p class="title">{{ article.title }}</p>
            <div class="date"><i class="ri-calendar-2-line" ></i>{{ formatDate(article.createdAt) }}</div>
            <p class="summary">{{ article.summary }}</p>

            <div style="display: flex;margin-bottom: 5px">
            <div v-for="item in (article.tags == null || article.tags == '') ? []: article.tags.split(',')" style="margin-right: 10px">
              <n-tag round :bordered="false" size="small" type="warning">
                # {{ item }}
              </n-tag>
            </div>
            </div>

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
import {NSkeleton} from "naive-ui";
import type {BaseRes} from "~/types/api";

const route = useRoute()
const router = useRouter()
const date = computed(() => route.query.date as string || '')

// ===================== 数据状态 =====================
const articles = ref<BlogItem[]>([])
const dateList = ref<BlogDateMenuItem[]>([])
const tagList = ref<string[]>([])
const groupedDates = ref<Record<string, BlogDateMenuItem[]>>({})
const loading = ref(false)

const activeDate = ref('')
const activeTag = ref('')
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
  activeTag.value = ''
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

// ===================== 点击标签加载文章 =====================
const handleTagClick = async (tagName: string) => {
  console.log('点击了标签:', tagName)
  activeDate.value = ''
  activeTag.value = tagName
  // 这里可以写跳转逻辑，例如：
  // router.push({ path: '/tags', query: { tag: tagName } })
  const res: BlogDateListRes = await BaseAPI.apiGet(`blog/blog-tag/${tagName}`)
  articles.value = res.data
}

// ===================== 数据请求 =====================
const fetchArticles = async () => {
  loading.value = true
  try {
    const resDate: BlogDateMenuRes = await BaseAPI.apiGet('blog/blog-date-menu')
    const resTags: BaseRes<string[]> = await BaseAPI.apiGet('blog/blog-date-tags')

    dateList.value = resDate.data
    tagList.value = resTags.data

    // 按年份分组
    const grouped: Record<string, BlogDateMenuItem[]> = {}
    dateList.value.forEach(item => {
      const year = item.yearMonth.split('-')[0] ?? '其他'
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(item)
    })
    groupedDates.value = grouped

    // 自动选中第一个分组的第一个日期
    const years =  Object.keys(grouped).sort((a, b) => Number(b) - Number(a))
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
  align-items: flex-start;
  gap: 20px;
  margin: 20px;
  flex-direction: row;
}


.card-item {
  margin-bottom: 20px;
  background: var(--bg-card-glass-95);
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 12px 15px;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 10px;

  //&:hover {
  //  transform: translateY(-2px);
  //  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  //}

  .title {
    margin-top: 5px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 4px;
    line-height: 1.4;

    &::before {
      content: "";
      display: inline-block;
      width: 5px;
      height: 1.25em;
      background: #6e4040;

      margin-top: 0.15em;
      flex-shrink: 0;
      border-radius: 2px;
    }
  }

  .summary {
    font-size: 0.95rem;
    color: #666;
    margin: 5px 0 10px;
  }

  .date {
    font-size: 0.85rem;
    color: #999;
    display: flex;
    align-items: center;

    i {
      font-size: 1.3rem;
      margin-right: 10px;
    }

  }
}

.basic-aside {
  flex: 0 0 25vw;
  min-width: 180px;
  max-width: 300px;
  box-sizing: border-box;
  position: sticky;
  top: 84px;
  height: calc(100vh - 104px);
  user-select: none;
  cursor: default;
}

.left-sidebar-name {
  min-height: 100px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 5px 15px 15px 15px;
  box-sizing: border-box;
  position: sticky;
  top: 20px;
  background: var(--bg-card-glass-95);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 10px;
  flex-wrap: wrap;

  .title {
    margin-top: 5px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 4px;
    line-height: 1.4;

    &::before {
      content: "";
      display: inline-block;
      width: 5px;
      height: 1.25em;
      background: #6e4040;

      margin-top: 0.15em;
      flex-shrink: 0;
      border-radius: 2px;
    }
  }

  //.twelve h2 {
  //  font-size: 26px;
  //  font-weight: 700;
  //  letter-spacing: 1px;
  //  text-transform: uppercase;
  //  width: 160px;
  //  text-align: center;
  //  margin: auto;
  //  white-space: nowrap;
  //  padding-bottom: 13px;
  //  position: relative;
  //}
  //
  //.twelve h2:before {
  //  background-color: #9eb4ed;
  //  content: '';
  //  display: block;
  //  height: 3px;
  //  width: 75px;
  //  margin-bottom: 5px;
  //}
  //
  //.twelve h2:after {
  //  background-color: var(--right-btn);
  //  content: '';
  //  display: block;
  //  position: absolute;
  //  right: 0;
  //  bottom: 0;
  //  height: 3px;
  //  width: 75px;
  //  margin-bottom: 0.25em;
  //}

  //&:hover {
  //  transform: translateY(-4px);
  //  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  //}
}

.custom-tag {
  cursor: pointer;
  background-color: var(--border-color);
  color: var(--custom-tag);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 12px;
  user-select: none;

  &:hover {
    background-color: #e19eba;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(225, 158, 186, 0.4);
  }

  &.active {
    transform: translateY(0);
    background-color: var(--right-btn);
    color: white;
  }
}


.left-sidebar {
  margin-top: 20px;
  flex: 1;
  max-height: calc(100vh - 174px);
  padding: 15px;
  box-sizing: border-box;
  position: sticky;
  background: var(--bg-card-glass-95);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 10px;

  //&:hover {
  //  transform: translateY(-4px);
  //  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  //}

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
        color: var(--text-main);
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.25s;

        &:hover {
          background: var(--border-color);
        }

        .arrow {
          font-size: 0.9em;
          transition: transform 0.3s;

          &.expanded {
            transform: rotate(-90deg);
          }
        }
      }

      .date-list {
        margin-top: 6px;
        padding-left: 8px;

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
            color: var(--right-btn-hover);
          }

          &.active {
            background: rgba(225, 158, 186, 0.1);
            font-weight: 600;
            color: var(--menu-wrapper--li);
            position: relative;

            &::before {
              content: "";
              position: absolute;
              left: -8px;
              top: 4px;
              bottom: 4px;
              width: 3px;
              background: var(--right-btn);
              border-radius: 2px;
            }
          }

          .count {
            font-size: 10px;
            color: #888;
            display: flex;
            align-items: center;
            justify-content: center;
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

  background: var(--bg-card-glass-95);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 10px;

  //&:hover {
  //  transform: translateY(-4px);
  //  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  //}


  .loading, .empty {
    text-align: center;
    color: #999;
    margin: 30px;
    font-size: 1rem;
  }

}


.right-btn {
  width: 100%;
  height: 100%;
  background-color: var(--right-btn);
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
    background-color: var(--right-btn-hover);
    color: #fff;
  }

  i {
    transition: color 0.25s ease;
  }
}


@media screen and (max-width: 850px) {
  /* 1. 整体布局改为纵向 */
  .page-layout {
    flex-direction: column-reverse; /* 上下排列 */
    margin: 10px; /* 减小页面边距 */
    gap: 15px; /* 减小模块间距 */
  }

  /* 2. 侧边栏 (标签 & 日期) 调整 */
  .basic-aside {
    flex: none; /* 取消 flex 比例限制 */
    width: 100%; /* 宽度撑满 */
    max-width: 100%;
    min-width: 0;
    height: auto; /* 高度自动 */
    position: static; /* 取消固定定位，随页面滚动 */

    /* 强制重置侧边栏内部那个 inline-style 的 height: 100% */
    & > div {
      height: auto !important;
    }
  }

  /* 3. 标签区域调整 */
  .left-sidebar-name {
    min-height: auto; /* 取消最小高度限制 */
    position: static; /* 取消 sticky */
    margin-bottom: 20px;
    padding: 10px; /* 减小内边距 */
  }

  /* 4. 日期归档区域调整 */
  .left-sidebar {
    margin-top: 0; /* 紧贴标签区域 */
    max-height: 250px; /* 限制高度，防止日期列表太长占满屏幕，强制出现内部滚动条 */
    position: static;
    padding: 10px;
  }

  /* 5. 文章列表容器调整 */
  .cards-grid,
  .card-container {
    width: 100%; /* 覆盖原来的 clamp() 宽度，撑满屏幕 */
    /* clamp(300px, 60%, 1000px) 在手机上可能只有 60% 导致太窄，必须改为 100% */

    /* 骨架屏容器高度适应 */
    min-height: auto;
  }

  /* 6. 单个文章卡片微调 */
  .card-item {
    padding: 10px; /* 稍微减小内边距 */

    .title {
      font-size: 1.1rem; /* 标题字体稍小一点 */
      word-break: break-all; /* 防止长标题撑开 */
    }

    .summary {
      font-size: 0.9rem;
      /* 限制摘要行数，可选 */
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* 调整右侧按钮大小，防止在小屏幕挤压内容 */
    .right-btn {
      width: 35px;
      font-size: 1rem;
    }
  }
}

</style>
