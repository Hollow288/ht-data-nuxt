<template>
  <div class="page-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="menu-wrapper">
        <ul>
          <li
              v-for="item in toc"
              :key="item.id"
              :style="{ marginLeft: (item.level - 1) * 12 + 'px' }"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from '#vue-router'
import MarkdownContent from '~/components/MarkdownContent.vue'
import MarkdownIt from 'markdown-it'
import type { BlogPostRes } from '~/types/api'
import { apiFetch } from '~/utils/apiFetch'

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
  const tokens = md.parse(markdown.value, {})
  return tokens
      .filter(t => t.type === 'heading_open')
      .map(t => {
        const level = Number(t.tag.slice(1))
        const content = tokens[tokens.indexOf(t) + 1].content
        const id = slugify(content)
        return { level, content, id }
      })
})

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 请求文章内容
const selectDate = async () => {
  try {
    const res: BlogPostRes = await apiFetch(`http://127.0.0.1:5777/api/v1/blog/${articleId.value}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'AIzaSyBWlLk7GqJ-6sNOjFY2ZKWy2IJd7evlhAY'
      }
    })
    markdown.value = res.data.content  // ✅ 更新响应式变量
  } catch (error) {
    console.error('获取文章失败', error)
    markdown.value = '# 获取文章失败'
  }
}

// 首次挂载 & 监听文章 ID 变化
onMounted(selectDate)
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
  top: 80px;
  max-height: calc(100vh - 140px);

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
      padding: 6px 8px;
      font-size: 0.95rem;
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
    }

  }
}

/* 主内容区 */
.content {
  min-height: calc(100vh - 140px);
  overflow-y: auto;
  width: clamp(300px, 60%, 1000px);

}
</style>
