<script setup lang="ts">
import { BaseAPI } from '~/utils/api'
import type { BlogDateListRes, BlogDateMenuItem, BlogDateMenuRes, BlogItem } from '~/types/blog'
import type { BaseRes } from '~/types/api'
useSeoMeta({ title: '文章 · Hollow’s Space', description: '开发记录、学习笔记与生活碎片。让思考有迹可循，让记录慢慢积累。' })
const route = useRoute()
const router = useRouter()
const articles = ref<BlogItem[]>([])
const dates = ref<BlogDateMenuItem[]>([])
const tags = ref<string[]>([])
const loading = ref(true)
const failed = ref(false)
const loadedMonths = ref(0)
let requestVersion = 0
const selectedDate = computed(() => typeof route.query.date === 'string' ? route.query.date : '')
const selectedTag = computed(() => typeof route.query.tag === 'string' ? route.query.tag : '')
const hasFilter = computed(() => !!(selectedDate.value || selectedTag.value))
const groups = computed(() => {
  const grouped = new Map<string, BlogItem[]>()
  for (const article of [...articles.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const year = article.createdAt.slice(0, 4)
    if (!grouped.has(year)) grouped.set(year, [])
    grouped.get(year)!.push(article)
  }
  return [...grouped].map(([year, posts]) => ({ year, posts }))
})
const resultLabel = computed(() => selectedTag.value ? '# ' + selectedTag.value : selectedDate.value ? selectedDate.value.replace('-', ' 年 ') + ' 月' : '全部记录')

async function loadArticles(append = false) {
  const version = ++requestVersion
  loading.value = true
  failed.value = false
  if (!append) { articles.value = []; loadedMonths.value = 0 }
  try {
    let url = ''
    if (selectedTag.value) url = 'blog/blog-tag/' + encodeURIComponent(selectedTag.value)
    else {
      const date = selectedDate.value || dates.value[append ? loadedMonths.value : 0]?.yearMonth
      if (!date) return
      url = 'blog/blog-date-list/' + encodeURIComponent(date)
    }
    const response = await BaseAPI.apiGet<BlogDateListRes>(url)
    if (version !== requestVersion) return
    const rows = response.data ?? []
    articles.value = append ? [...articles.value, ...rows.filter(row => !articles.value.some(existing => existing.blogId === row.blogId))] : rows
    if (!hasFilter.value) loadedMonths.value += 1
  } catch { if (version === requestVersion) failed.value = true }
  finally { if (version === requestVersion) loading.value = false }
}
async function initialize() {
  loading.value = true
  failed.value = false
  try {
    const [menu, tagResponse] = await Promise.all([
      BaseAPI.apiGet<BlogDateMenuRes>('blog/blog-date-menu'),
      BaseAPI.apiGet<BaseRes<string[]>>('blog/blog-date-tags').catch(() => ({ data: [] as string[] }))
    ])
    dates.value = [...(menu.data ?? [])].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))
    tags.value = (tagResponse.data ?? []).filter(Boolean)
    await loadArticles()
  } catch { failed.value = true; loading.value = false }
}
function filterBy(key?: 'date' | 'tag', value?: string) {
  router.push({ path: '/blog-page', query: key && value ? { [key]: value } : {} })
}
watch(() => route.query, () => { loadArticles() })
onMounted(initialize)
onUnmounted(() => { requestVersion++ })
</script>

<template>
  <div class="journal-page site-width">
    <div class="journal-layout">
      <aside class="journal-sidebar" aria-label="文章筛选">
        <section v-if="tags.length" class="filter-section"><h2>按标签 <span>TOPICS</span></h2><div class="journal-tags"><button v-for="tag in tags" :key="tag" :class="{ selected: selectedTag === tag }" @click="filterBy('tag', tag)"># {{ tag }}</button></div></section>
        <section v-if="dates.length" class="filter-section"><h2>时光归档 <span>ARCHIVE</span></h2><div class="archive-list"><button v-for="date in dates" :key="date.yearMonth" :class="{ selected: selectedDate === date.yearMonth }" @click="filterBy('date', date.yearMonth)"><span>{{ date.yearMonth.replace('-', ' / ') }}</span><span>{{ date.count }}</span></button></div></section>
        <div class="sidebar-note"><i class="ri-seedling-line" aria-hidden="true" /><p>写下来，<br />就不算白白经过。</p></div>
      </aside>
      <section class="journal-content" aria-label="文章列表" :aria-busy="loading">
        <div class="journal-toolbar"><span>{{ resultLabel }}</span><button v-if="hasFilter" class="quiet-button" @click="filterBy()">清除筛选 <i class="ri-close-line" aria-hidden="true" /></button><span v-else>从最近的一页开始 <i class="ri-arrow-down-line" aria-hidden="true" /></span></div>
        <template v-if="groups.length"><div v-for="group in groups" :key="group.year" class="year-group"><h2 class="year-title">{{ group.year }}<span>年间的片段</span></h2><ArticleList :articles="group.posts" /></div></template>
        <div v-if="loading" class="journal-loading" role="status" aria-label="正在加载文章"><div v-for="n in 3" :key="n"><span class="skeleton-line" /><span class="skeleton-line" /><span class="skeleton-line" /></div></div>
        <div v-else-if="failed" class="empty-state" role="status"><i class="ri-cloud-line" aria-hidden="true" /><p>暂时没能取到这些文字。</p><small>请稍后再试，或先逛逛其他地方。</small><button class="secondary-button" @click="dates.length ? loadArticles(articles.length > 0) : initialize()"><i class="ri-refresh-line" aria-hidden="true" />重新加载</button></div>
        <div v-else-if="!articles.length" class="empty-state"><i class="ri-quill-pen-line" aria-hidden="true" /><p>{{ hasFilter ? '这里还没有找到对应的文字。' : '第一篇记录，正在酝酿。' }}</p><button v-if="hasFilter" class="text-link quiet-button" @click="filterBy()">看看全部文章 <i class="ri-arrow-right-line" aria-hidden="true" /></button></div>
        <div v-if="!loading && !failed && !hasFilter && loadedMonths < dates.length" class="load-more"><button class="secondary-button" @click="loadArticles(true)">再翻一页，看看更早的记录 <i class="ri-arrow-down-line" aria-hidden="true" /></button></div>
        <div v-else-if="!loading && !failed && articles.length" class="journal-end"><span />{{ hasFilter ? '这次找到的文字，都在这里了' : '已经翻到最早的一页了' }}<span /></div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.journal-page { padding-top: 32px; }
.journal-layout { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 44px; }
.journal-sidebar { padding-top: 12px; min-width: 0; align-self: start; }
.filter-section { margin-top: 30px; }.filter-section h2 { display: flex; align-items: baseline; gap: 10px; margin-bottom: 13px; color: var(--text-secondary); font-weight: 500; font-size: 15px; }.filter-section h2 span { font-size: 13px; color: var(--text-muted); letter-spacing: .08em; }
.filter-section:first-child { margin-top: 0; }
.journal-tags { display: flex; flex-wrap: wrap; gap: 7px; }.journal-tags button { border: 1px solid var(--border-color); background: none; border-radius: 4px; padding: 3px 7px; font-size: 13px; color: var(--text-secondary); }.journal-tags button:hover, .journal-tags button.selected { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.archive-list { max-height: 310px; overflow-y: auto; }.archive-list button { display: flex; justify-content: space-between; padding: 6px 10px; width: 100%; border: 0; background: none; color: var(--text-secondary); font-size: 15px; border-radius: 4px; }.archive-list button > span:last-child { font-size: 13px; color: var(--text-muted); }.archive-list button:hover, .archive-list button.selected { color: var(--accent); background: var(--bg-soft); }
.sidebar-note { padding-top: 35px; margin-top: 30px; border-top: 1px solid var(--border-color); color: var(--text-muted); }.sidebar-note > i { color: var(--accent); font-size: 24px; opacity: .65; }.sidebar-note p { font-size: 15px; margin-top: 9px; line-height: 2; }
.journal-content { min-width: 0; min-height: 430px; }.journal-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 15px; min-height: 59px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 15px; }.journal-toolbar > :last-child { color: var(--text-muted); font-size: 13px; }.journal-toolbar .quiet-button { color: var(--accent); }
.year-title { display: flex; align-items: baseline; gap: 14px; padding-top: 28px; font-size: 30px; font-weight: 450; letter-spacing: -.06em; color: var(--text-secondary); }.year-title > span { font-size: 13px; letter-spacing: .05em; color: var(--text-muted); }.year-group :deep(.article-row:last-child) { border-bottom: 1px solid var(--border-color); }
.journal-loading > div { padding: 25px 0; border-bottom: 1px solid var(--border-color); }.journal-loading .skeleton-line { display: block; margin-bottom: 16px; }.journal-loading .skeleton-line:first-child { width: 55%; height: 16px; }.journal-loading .skeleton-line:nth-child(2) { width: 90%; }.journal-loading .skeleton-line:last-child { width: 25%; margin: 0; }
.load-more { padding: 30px 0; text-align: center; }.load-more button { font-size: 14px; }.journal-end { display: flex; align-items: center; justify-content: center; gap: 16px; padding-top: 38px; font-size: 13px; color: var(--text-muted); }.journal-end > span { width: 25px; height: 1px; background: var(--border-color); }
@media (max-width: 1000px) { .journal-layout { grid-template-columns: 250px minmax(0, 1fr); gap: 28px; } }
@media (max-width: 700px) { .journal-page { padding-top: 24px; }.journal-layout { grid-template-columns: 1fr; gap: 20px; }.journal-sidebar { padding-top: 0; }.filter-section { margin-top: 18px; }.filter-section h2 { margin-bottom: 10px; }.archive-list { display: flex; gap: 8px; overflow: auto; max-height: none; padding-bottom: 8px; }.archive-list button { width: auto; flex-shrink: 0; gap: 15px; padding: 4px 8px; font-size: 14px; }.sidebar-note { display: none; }.journal-tags { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 6px; }.journal-tags button { flex-shrink: 0; }.journal-toolbar { min-height: 48px; }.journal-content { min-height: 300px; }.year-title { padding-top: 23px; font-size: 27px; } }
</style>
