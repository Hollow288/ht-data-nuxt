<script setup lang="ts">
import { siteNav, hottaCategories } from '~/data/site'
import { tools } from '~/data/tools'
import { BaseAPI } from '~/utils/api'
import type { BlogDateListRes, BlogItem } from '~/types/blog'

const dialog = ref<HTMLDialogElement | null>(null)
const query = ref('')
const articles = ref<BlogItem[]>([])
const loading = ref(false)
const failed = ref(false)
const route = useRoute()
const destinations = [
  ...siteNav,
  ...tools.map(tool => ({ label: tool.name, to: `/tools/${tool.id}`, icon: tool.icon, description: tool.description, keywords: tool.keywords.join(' ') })),
  ...hottaCategories.map(item => ({ label: `幻塔 · ${item.name}`, to: `/hotta-page/${item.slug}`, icon: item.icon, description: item.description }))
]
const matches = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return destinations.filter(item => `${item.label} ${item.description} ${'keywords' in item ? item.keywords : ''}`.toLowerCase().includes(keyword))
})
function open() { if (!dialog.value?.open) dialog.value?.showModal() }
function close() { dialog.value?.close() }
function onKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    dialog.value?.open ? close() : open()
  }
}
watch(() => route.fullPath, close)
watch(query, (value, _old, onCleanup) => {
  articles.value = []
  failed.value = false
  const keyword = value.trim()
  if (!keyword) { loading.value = false; return }
  loading.value = true
  let cancelled = false
  const timer = setTimeout(async () => {
    try {
      const res = await BaseAPI.apiGet<BlogDateListRes>(`blog/search/${encodeURIComponent(keyword)}`)
      if (!cancelled) articles.value = res.data ?? []
    } catch { if (!cancelled) failed.value = true }
    finally { if (!cancelled) loading.value = false }
  }, 300)
  onCleanup(() => { cancelled = true; clearTimeout(timer) })
})
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" class="search-dialog" aria-label="搜索本站" @click="event => { if (event.target === dialog) close() }">
    <form class="search-form" @submit.prevent>
      <i class="ri-search-line" aria-hidden="true" />
      <input v-model="query" autofocus aria-label="搜索文章、工具或幻塔资料" placeholder="搜索文章、工具或幻塔资料…" />
      <button type="button" aria-label="关闭搜索" @click="close"><kbd>ESC</kbd></button>
    </form>
    <div class="search-body">
      <p v-if="matches.length" class="search-caption">{{ query ? '相关页面' : '快速前往' }}</p>
      <NuxtLink v-for="item in matches" :key="item.to" :to="item.to" class="search-result" @click="close">
        <i :class="item.icon" aria-hidden="true" /><span>{{ item.label }}<small>{{ item.description }}</small></span><i class="ri-arrow-right-up-line" aria-hidden="true" />
      </NuxtLink>
      <template v-if="query.trim()">
        <p class="search-caption">文章</p>
        <p v-if="loading" class="search-status" role="status">正在寻找相关记录…</p>
        <p v-else-if="failed" class="search-status" role="status">文章暂时无法搜索，请稍后重试。</p>
        <p v-else-if="!articles.length" class="search-status">没有找到相关文章，换个关键词试试。</p>
        <NuxtLink v-for="article in articles" :key="article.blogId" :to="{ path: '/markdown-page', query: { articleId: article.blogId } }" class="search-result" @click="close">
          <i class="ri-file-text-line" aria-hidden="true" /><span>{{ article.title }}<small>{{ article.summary }}</small></span><i class="ri-arrow-right-line" aria-hidden="true" />
        </NuxtLink>
      </template>
    </div>
    <div class="search-footer"><span>在这个小小的空间里，找点感兴趣的东西。</span><span>Ctrl / ⌘ K</span></div>
  </dialog>
</template>

<style scoped>
.search-dialog { position: fixed; top: min(16vh, 140px); width: min(800px, calc(100% - 32px)); max-width: none; max-height: 75vh; margin: 0 auto; padding: 0; border: 1px solid var(--border-color); border-radius: 12px; color: var(--text-main); background: var(--bg-body); box-shadow: 0 20px 80px #0002; }
.search-dialog::backdrop { background: #1d1e2166; backdrop-filter: blur(5px); }
.search-form { display: flex; align-items: center; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--border-color); }
.search-form > i { font-size: 22px; color: var(--accent); }
.search-form input { width: 100%; min-width: 0; border: none; outline: none; background: none; color: var(--text-main); font-size: 16px; }
.search-form button { border: none; padding: 0; background: none; color: var(--text-muted); }
kbd { font: 13px/1.5 monospace; border: 1px solid var(--border-color); border-radius: 3px; padding: 3px 5px; }
.search-body { padding: 14px; max-height: 48vh; overflow: auto; }
.search-caption { padding: 7px 9px 10px; color: var(--text-muted); font-size: 14px; }
.search-result { display: flex; align-items: center; gap: 14px; padding: 10px; border-radius: 5px; }
.search-result:hover { background: var(--bg-soft); }
.search-result > i:first-child { color: var(--accent); font-size: 19px; }
.search-result span { flex: 1; min-width: 0; font-size: 16px; font-weight: 600; line-height: 1.5; }
.search-result small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-muted); font-size: 14px; font-weight: 400; margin-top: 3px; }
.search-result > i:last-child { color: var(--text-muted); font-size: 16px; }
.search-status { padding: 12px 10px 20px; color: var(--text-secondary); font-size: 16px; }
.search-footer { display: flex; justify-content: space-between; gap: 10px; padding: 12px 22px; border-top: 1px solid var(--border-color); font-size: 13px; color: var(--text-muted); }
</style>
