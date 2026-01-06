<template>
  <div class="page-layout">

    <div
        class="mobile-mask"
        v-if="showMobileToc"
        @click="showMobileToc = false"
    ></div>

    <!-- 侧边栏：添加 ref -->
    <aside class="sidebar" ref="sidebarRef" :class="{ 'mobile-open': showMobileToc }">

      <div class="mobile-sidebar-header">
        <span>目录</span>
        <span @click="showMobileToc = false"><i class="ri-close-line"></i></span>
      </div>

      <div class="menu-wrapper">
        <ul>
          <li
              v-for="item in visibleToc"
              :key="item.id"
              :id="'toc-item-' + item.id"
              :style="{ paddingLeft: item.relativeLevel * 15 + 'px' }"
              :class="{ 'active': item.id === activeTocId }"
          >
            <!-- 折叠箭头 -->
            <span
                class="toc-arrow"
                :class="{ 'is-collapsed': collapsedIds.has(item.id), 'hidden': !item.hasChildren }"
                @click.stop="toggleCollapse(item.id)"
            >
               <svg viewBox="0 0 1024 1024" width="10" height="10">
                <path d="M85.333333 256l426.666667 426.666667 426.666667-426.666667z" fill="currentColor"></path>
              </svg>
            </span>

            <!-- 标题内容 -->
            <span class="toc-text" @click="scrollTo(item.id)">
              {{ item.content }}
            </span>
          </li>
        </ul>
      </div>
    </aside>

    <!-- 主体内容 -->
    <main class="content">
      <MarkdownContent :content="markdown" />
    </main>

    <button class="toc-toggle-btn" @click="showMobileToc = true" aria-label="目录">
      <i class="ri-list-check"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownContent from '~/components/MarkdownContent.vue'
import MarkdownIt from 'markdown-it'
import { BaseAPI } from '~/utils/api'
import type { BlogPostRes } from "~/types/blog";

// 路由参数
const route = useRoute()
const articleId = computed(() => route.query.articleId || '')
const showMobileToc = ref(false)
const markdown = ref<string>(`# 加载中...\n\n请稍等...`)
const md = new MarkdownIt()
const sidebarRef = ref<HTMLElement | null>(null) // 获取侧边栏DOM
const isClickScrolling = ref(false) // 标记是否正在进行点击跳转引起的滚动

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-')
}

// === TOC 生成逻辑 ===
const toc = computed(() => {
  const tokens: any[] = md.parse(markdown.value, {})
  const headings = tokens
      .filter(t => t.type === 'heading_open')
      .map(t => {
        const level = Number(t.tag.slice(1))
        const content = tokens[tokens.indexOf(t) + 1].content
        const id = slugify(content)
        return { level, content, id }
      })

  const uniqueLevels = [...new Set(headings.map(h => h.level))].sort((a, b) => a - b)

  return headings.map((h, index) => {
    const nextHeading = headings[index + 1]
    const hasChildren = nextHeading && nextHeading.level > h.level
    return {
      ...h,
      relativeLevel: uniqueLevels.indexOf(h.level),
      hasChildren
    }
  })
})

// === 折叠状态管理 ===
const collapsedIds = ref(new Set<string>())

function toggleCollapse(id: string) {
  const isCollapsed = collapsedIds.value.has(id)
  if (isCollapsed) {
    collapsedIds.value.delete(id)
  } else {
    collapsedIds.value.add(id)
    const index = toc.value.findIndex(item => item.id === id)
    if (index === -1) return
    const currentItem = toc.value[index]
    if (!currentItem) return // 如果是 undefined 直接返回，消除 TS 报错
    const currentLevel = currentItem.level
    for (let i = index + 1; i < toc.value.length; i++) {
      const item = toc.value[i]
      if (!item) continue
      if (item.level <= currentLevel) break
      collapsedIds.value.add(item.id)
    }
  }
}

// === 可见性计算 ===
const visibleToc = computed(() => {
  const list = toc.value
  const result = []
  const stack: { level: number; isCollapsed: boolean }[] = []

  for (const item of list) {
    while (stack.length > 0 && stack[stack.length - 1]!.level >= item.level) {
      stack.pop()
    }
    const isParentCollapsed = stack.some(s => s.isCollapsed)
    if (!isParentCollapsed) {
      result.push(item)
    }
    stack.push({
      level: item.level,
      isCollapsed: collapsedIds.value.has(item.id)
    })
  }
  return result
})

const activeTocId = ref('')

// === 辅助函数：展开指定ID的所有父级 ===
// 修改 script setup 中的 expandParents 函数
function expandParents(id: string) {
  const index = toc.value.findIndex(item => item.id === id)
  if (index === -1) return

  // 1. 自身去折叠：不管有没有子集，先确保自己不是折叠状态
  // 这解决了之前因为 toggleCollapse 把所有子孙都加入折叠列表导致的副作用
  if (collapsedIds.value.has(id)) {
    collapsedIds.value.delete(id)
  }

  const currentItem = toc.value[index]
  if (!currentItem) return
  let checkLevel = currentItem.level

  // 2. 向上回溯查找父级
  for (let i = index - 1; i >= 0; i--) {
    const prevItem = toc.value[i]
    if (!prevItem) continue

    // 关键逻辑：只要找到层级比当前参考层级小的，它就是父级（或祖先级）
    if (prevItem.level < checkLevel) {
      collapsedIds.value.delete(prevItem.id) // 移除折叠状态
      checkLevel = prevItem.level // 更新参考层级，继续向上找爷爷级
    }
  }
}

function scrollTo(id: string) {
  // 1. 标记正在进行点击滚动
  isClickScrolling.value = true

  // 新增：如果是移动端，点击跳转后自动关闭目录抽屉
  showMobileToc.value = false

  // ... 原有的跳转逻辑 ...
  activeTocId.value = id
  expandParents(id)

  const el = document.getElementById(id)
  if (el) {
    const rect = el.getBoundingClientRect()
    // 移动端头部可能有遮挡，偏移量可以稍微调大一点
    const offsetTop = window.scrollY + rect.top - 80
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  }

  setTimeout(() => {
    isClickScrolling.value = false
  }, 1500)
}

// ... 数据获取和 scroll 事件监听部分保持不变 ...
const selectDate = async () => {
  try {
    const res: BlogPostRes = await BaseAPI.apiGet(`blog/${articleId.value}`)
    markdown.value = res.data.content
  } catch (error) {
    console.error('获取文章失败', error)
    markdown.value = '# 获取文章失败'
  }
}

const handleScroll = () => {
  if (toc.value.length === 0) return;

  // 增加一个偏移量，让人眼的聚焦位置（屏幕上方约100-150px处）作为判定点
  const offset = 120;

  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 20;
  if (atBottom) {
    const lastTocItem = toc.value[toc.value.length - 1];
    if (lastTocItem) activeTocId.value = lastTocItem.id;
    return;
  }

  // 获取所有标题的位置信息
  const headings = toc.value
      .map(item => {
        const el = document.getElementById(item.id)
        return el ? { id: item.id, top: el.getBoundingClientRect().top } : null
      })
      .filter((item): item is { id: string, top: number } => item !== null);

  if (headings.length === 0) return;

  // 查找逻辑：找到第一个 top 值大于 offset 的元素，那它的"前一个"就是当前应该高亮的
  const index = headings.findIndex(h => h.top > offset);

  if (index === -1) {
    // 所有标题都在 offset 上方，说明在看最后一部分
    activeTocId.value = headings[headings.length - 1]!.id;
  } else if (index > 0) {
    // 正常情况，高亮前一个
    activeTocId.value = headings[index - 1]!.id;
  } else {
    // 第一个标题就在 offset 下方，说明刚开始滚动，高亮第一个
    activeTocId.value = headings[0]!.id;
  }
}

onMounted(() => {
  selectDate()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(showMobileToc, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

watch(activeTocId, async (newId) => {
  if (!newId) return

  // 1. 第一步：先修改数据，展开父级
  // 必须在 nextTick 之前执行，这样 Vue 才能在下一次 DOM 更新时渲染出隐藏的菜单项
  if (!isClickScrolling.value) {
    expandParents(newId)
  }

  // 2. 第二步：等待 DOM 更新完成
  // 此时 visibleToc 已经重新计算，隐藏的 li 元素已经渲染到页面上
  await nextTick()

  // 3. 第三步：处理侧边栏滚动
  if (sidebarRef.value) {

    const activeEl = document.getElementById(`toc-item-${newId}`) as HTMLElement

    if (activeEl) {
      const container = sidebarRef.value
      const top = activeEl.offsetTop
      const height = activeEl.clientHeight
      const containerHeight = container.clientHeight

      const targetScrollTop = top - containerHeight / 2 + height / 2

      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })
    }
  }
})
</script>

<style scoped lang="scss">

.markdown-body{
  color: var(--text-main);
}

/* 样式保持不变 */
.page-layout {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px;
  flex-direction: row;
}

.sidebar {
  flex: 0 0 25%;
  min-width: 180px;
  max-width: 300px;
  padding: 15px;
  box-sizing: border-box;
  position: sticky;
  top: 40px;
  max-height: calc(100vh - 100px);
  border-radius: 10px;
  background: var(--bg-card);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: auto; /* 确保这里是 auto */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  scrollbar-width: none;
  -ms-overflow-style: none;

  /* 为了平滑滚动效果 */
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .menu-wrapper {
    margin: 0;
    padding: 0;
    list-style: none;

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      display: flex;
      align-items: center;
      padding: 5px;
      font-size: 0.85rem;
      border-radius: 4px;
      transition: all 0.2s;
      color: var(--text-main);
      word-wrap: break-word;
      white-space: normal;

      .toc-arrow {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        margin-right: 4px;
        cursor: pointer;
        transition: transform 0.2s ease;
        color: #999;

        &:hover {
          color: #df1c5f;
        }
      }

      .toc-arrow.is-collapsed {
        transform: rotate(-90deg);
      }

      .toc-arrow.hidden {
        visibility: hidden;
        pointer-events: none;
      }

      .toc-text {
        flex: 1;
        cursor: pointer;
        &:hover {
          color: #df1c5f;
        }
      }

      &:hover {
        background: rgba(225, 158, 186, 0.05);
      }

      &.active {
        background: rgba(225, 158, 186, 0.05);
        .toc-text {
          color: #df1c5f;
          font-weight: bold;
        }
      }
    }
  }
}

.content {
  min-height: calc(100vh - 140px);
  overflow-y: auto;
  width: clamp(300px, 60%, 1000px);
  padding: 20px;
  background: var(--bg-card);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  backdrop-filter: blur(8px);
  border-radius: 10px;
}


@media screen and (max-width: 768px) {
  .page-layout {
    flex-direction: column;
    margin: 10px;
    gap: 0;
  }

  .content {
    width: 100%;
    max-width: 100%;
    min-height: auto;
    padding: 15px;
  }

  /* === 侧边栏改为 Flex 布局，解决高度和对齐问题 === */
  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 280px;
    height: 100vh;      /* 占满全屏 */
    max-height: none;

    /* 关键改动：使用 Flex 布局 */
    display: flex;
    flex-direction: column;

    background: var(--bg-card);
    z-index: 2000;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    transform: translateX(120%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0;
    margin: 0;
    padding: 0;

    /* 禁止外层滚动 */
    overflow: hidden;

    &.mobile-open {
      transform: translateX(0);
    }

    /* 头部：固定高度，不被压缩 */
    .mobile-sidebar-header {
      flex: 0 0 auto; /* 禁止缩放 */
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px; /* 增加一点内边距更好看 */
      border-bottom: 1px solid var(--border-color);
      font-weight: bold;
      font-size: 1.1rem;
      color: var(--text-main);
      background: var(--bg-card); /* 确保背景色 */

      span:last-child {
        cursor: pointer;
        font-size: 1.5rem;
        color: var(--text-main);
        display: flex; /* 让关闭图标垂直居中 */
      }
    }

    /* 列表容器：自动填满剩余空间，并处理滚动条 */
    .menu-wrapper {
      flex: 1; /* 自动占据头部剩下的所有高度 */
      height: auto; /* 取消固定的 height */
      overflow-y: auto;
      padding: 10px 15px 50px 15px; /* 顶部留点空隙，底部留出空间防遮挡 */

      /* === 隐藏滚动条的核心代码 === */
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */

      &::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        display: none !important; /* Chrome/Safari */
      }

      /* 修复列表可能的默认 margin 导致的错位 */
      ul {
        margin-top: 0;
        padding-top: 5px;
      }
    }
  }

  /* 遮罩层 */
  .mobile-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1999;
    backdrop-filter: blur(2px);
    animation: fadeIn 0.3s;
  }

  /* 悬浮按钮 */
  .toc-toggle-btn {
    display: flex;
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
}

/* PC端默认隐藏这些移动端元素 */
@media screen and (min-width: 769px) {
  .mobile-mask,
  .mobile-sidebar-header,
  .toc-toggle-btn {
    display: none;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>