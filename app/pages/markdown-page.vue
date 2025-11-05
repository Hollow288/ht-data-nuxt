<template>
  <div class="page-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="menu-wrapper">
        <ul>
          <li
              v-for="item in toc"
              :key="item.id"
              :style="{ marginLeft: item.relativeLevel * 5 + 'px' }"
              :class="{ 'active': item.id === activeTocId }"
              @click="scrollTo(item.id)"
          >
            {{ item.content }}
          </li>
        </ul>
      </div>
    </aside>

    <!-- 主体内容 -->
    <main class="content">
      <MarkdownContent :content="markdown" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from '#vue-router'
import MarkdownContent from '~/components/MarkdownContent.vue'
import MarkdownIt from 'markdown-it'
import {BaseAPI} from '~/utils/api'
import type {BlogPostRes} from "~/types/blog";

// 路由参数
const route = useRoute()
const articleId = computed(() => route.query.articleId || '')

// markdown 内容用 ref
const markdown = ref<string>(`
# 加载中...

请稍等，正在获取文章 ID: ${articleId.value}
`)

const md = new MarkdownIt()

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-')
}

// 目录（从 markdown 里解析出来）
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

  return headings.map(h => ({
    ...h,
    relativeLevel: uniqueLevels.indexOf(h.level)
  }))

})

const activeTocId = ref('')

function scrollTo(id: string) {

  activeTocId.value = id

  const el = document.getElementById(id)
  if (el) {
    const rect = el.getBoundingClientRect()
    const offsetTop = window.scrollY + rect.top - 100
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  }
}


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

  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5;

  if (atBottom) {
    const lastTocItem = toc.value[toc.value.length - 1];
    if (lastTocItem) {
      activeTocId.value = lastTocItem.id;
    }
    return;
  }

  const headings = toc.value
      .map(item => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

  const activeHeading = headings
      .reverse()
      .find(el => el.getBoundingClientRect().top <= 101);

  if (activeHeading) {
    activeTocId.value = activeHeading.id;
  } else {
    activeTocId.value = '';
  }
}


onMounted(() => {
  selectDate()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(articleId, selectDate)
</script>

<style scoped lang="scss">
.page-layout {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px;
  flex-direction: row;
}

/* 侧边栏 */
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }

  .menu-wrapper {
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 100%;

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      padding: 5px;
      font-size: 0.85rem;
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
        background: rgba(225, 158, 186, 0.05);
        color: #df1c5f;
        font-weight: bold;
      }
    }
  }
}

/* 主内容区 */
.content {
  min-height: calc(100vh - 140px);
  overflow-y: auto;
  width: clamp(300px, 60%, 1000px);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  backdrop-filter: blur(8px);
  border-radius: 10px;
}

.content:hover{
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}
</style>