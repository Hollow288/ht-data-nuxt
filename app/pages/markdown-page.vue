<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { BaseAPI } from '~/utils/api'
import { markdownHeadingId, markdownHeadingText } from '~/utils/markdown'
import type { BlogPost, BlogPostRes } from '~/types/blog'

const route = useRoute()
const articleId = computed(() => typeof route.query.articleId === 'string' ? route.query.articleId : '')
const post = ref<BlogPost | null>(null)
const loading = ref(true)
const failed = ref(false)
const notFound = ref(false)
const activeHeading = ref('')
const md = new MarkdownIt()
let version = 0
let scrollFrame = 0
const content = computed(() => {
  const raw = post.value?.content ?? ''
  const lines = raw.split('\n')
  if (lines[0]?.replace(/^#\s+/, '').trim() === post.value?.title.trim()) return lines.slice(1).join('\n')
  return raw
})
const toc = computed(() => {
  const tokens = md.parse(content.value, {})
  const counts = new Map<string, number>()
  return tokens.flatMap((token, index) => {
    if (token.type !== 'heading_open') return []
    const title = markdownHeadingText(tokens[index + 1])
    return [{ title, id: markdownHeadingId(title, counts), level: Number(token.tag.slice(1)) }]
  })
})
const readingTime = computed(() => Math.max(1, Math.ceil((post.value?.content.length ?? 0) / 450)))
const postTags = computed(() => (post.value?.tags ?? '').split(',').map(tag => tag.trim()).filter(Boolean))
useSeoMeta({ title: () => post.value ? post.value.title + ' · Hollow’s Space' : '阅读 · Hollow’s Space', description: () => post.value?.summary ?? 'Hollow 的文章与记录。' })

async function loadPost() {
  const current = ++version
  loading.value = true
  failed.value = false
  notFound.value = false
  post.value = null
  if (!articleId.value) { loading.value = false; notFound.value = true; return }
  try {
    const res = await BaseAPI.apiGet<BlogPostRes>('blog/' + encodeURIComponent(articleId.value))
    if (current !== version) return
    if (!res.data) { notFound.value = true; return }
    post.value = res.data
  } catch (error: any) {
    if (current === version) {
      notFound.value = error?.statusCode === 404 || error?.status === 404
      failed.value = !notFound.value
    }
  } finally {
    if (current === version) {
      loading.value = false
      await nextTick()
      let targetId = route.hash.slice(1)
      try { targetId = decodeURIComponent(targetId) } catch { /* Keep literal percent signs in manually entered hashes. */ }
      const target = targetId ? document.getElementById(targetId) : null
      target?.scrollIntoView({ behavior: 'instant', block: 'start' })
      updateHeading()
    }
  }
}
function updateHeading() {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(() => {
    activeHeading.value = toc.value[0]?.id ?? ''
    for (const heading of toc.value) {
      const node = document.getElementById(heading.id)
      if (node && node.getBoundingClientRect().top <= 145) activeHeading.value = heading.id
    }
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      activeHeading.value = toc.value.at(-1)?.id ?? ''
    }
    scrollFrame = 0
  })
}
watch(articleId, loadPost)
onMounted(() => { loadPost(); window.addEventListener('scroll', updateHeading, { passive: true }) })
onUnmounted(() => { version++; window.removeEventListener('scroll', updateHeading); cancelAnimationFrame(scrollFrame) })
</script>

<template>
  <div class="reader-page site-width">
    <NuxtLink to="/blog-page" class="reader-back"><i class="ri-arrow-left-line" aria-hidden="true" />回到文章</NuxtLink>
    <div v-if="loading" class="reader-loading" role="status" aria-label="正在加载文章"><div class="skeleton-line" /><div class="skeleton-line" /><div v-for="n in 5" :key="n" class="skeleton-line" /></div>
    <div v-else-if="failed || notFound" class="reader-error empty-state" role="status"><i class="ri-file-search-line" aria-hidden="true" /><h1>{{ notFound ? '这一页，似乎不在这里。' : '这一页，暂时没能打开。' }}</h1><p>{{ notFound ? '文章可能已被移动，去文章列表找找其他记录吧。' : '请稍后再试，文字不会走远。' }}</p><button v-if="failed" class="secondary-button" @click="loadPost"><i class="ri-refresh-line" aria-hidden="true" />重新加载</button><NuxtLink v-else to="/blog-page" class="primary-button">浏览文章<i class="ri-arrow-right-line" aria-hidden="true" /></NuxtLink></div>
    <template v-else-if="post">
      <div class="reader-layout">
        <div class="reading-content">
          <header class="reader-heading"><span class="eyebrow">A PAGE FROM MY JOURNAL</span><h1>{{ post.title }}</h1><div class="reader-meta"><span>Hollow</span><span>·</span><time :datetime="post.createdAt">{{ post.createdAt.slice(0, 10).replaceAll('-', '.') }}</time><span>·</span><span>约 {{ readingTime }} 分钟阅读</span></div><p v-if="post.summary">{{ post.summary }}</p><div v-if="postTags.length" class="reader-tags"><NuxtLink v-for="tag in postTags" :key="tag" :to="{ path: '/blog-page', query: { tag } }"># {{ tag }}</NuxtLink></div></header>
          <details v-if="toc.length" class="mobile-toc"><summary><i class="ri-list-check" aria-hidden="true" /> 本文目录<span>{{ toc.length }}</span></summary><nav aria-label="本文目录"><a v-for="heading in toc" :key="heading.id" :href="'#' + encodeURIComponent(heading.id)" :style="{ paddingLeft: Math.max(0, heading.level - 2) * 12 + 'px' }">{{ heading.title }}</a></nav></details>
          <MarkdownContent :content="content" />
          <div class="reader-end"><i class="ri-sparkling-2-line" aria-hidden="true" /><p>谢谢你，读到这里。</p><NuxtLink to="/blog-page" class="text-link">再读一篇 <i class="ri-arrow-right-line" aria-hidden="true" /></NuxtLink></div>
        </div>
        <aside v-if="toc.length" class="reader-toc"><p>本文目录<span>ON THIS PAGE</span></p><nav aria-label="本文目录"><a v-for="heading in toc" :key="heading.id" :href="'#' + encodeURIComponent(heading.id)" :class="{ active: activeHeading === heading.id }" :aria-current="activeHeading === heading.id ? 'location' : undefined" :style="{ paddingLeft: 15 + Math.max(0, heading.level - 2) * 12 + 'px' }">{{ heading.title }}</a></nav><span class="toc-footnote">记录，让日常有迹可循。</span></aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.reader-page { width: min(1000px, calc(100% - 96px)); padding-top: 34px; }
.reader-back { display: inline-flex; align-items: center; gap: 8px; color: var(--accent); font-size: 12px; }
.reader-layout { display: grid; grid-template-columns: minmax(0, 1fr) 200px; gap: 60px; }
.reading-content { min-width: 0; }
.reader-heading { padding: 32px 0 28px; margin-bottom: 32px; border-bottom: 1px solid var(--border-color); }
.reader-heading > h1 { margin-top: 15px; font-size: clamp(27px, 3.2vw, 34px); font-weight: 600; line-height: 1.55; letter-spacing: -.035em; overflow-wrap: anywhere; }
.reader-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; color: var(--text-muted); font-size: 11px; margin-top: 17px; }
.reader-meta > span:first-child { color: var(--text-secondary); }
.reader-heading > p { color: var(--text-secondary); margin-top: 22px; font-size: 14px; line-height: 1.95; }
.reader-tags { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 18px; font-size: 11px; color: var(--accent); }
.reader-tags a:hover { text-decoration: underline; }
.reader-toc { position: sticky; top: 110px; align-self: start; max-height: calc(100vh - 150px); overflow-y: auto; padding: 38px 0 20px; }
.reader-toc > p { display: flex; align-items: baseline; gap: 10px; font-size: 12px; font-weight: 600; color: var(--text-secondary); }
.reader-toc > p > span { font-size: 8px; font-weight: 400; color: var(--text-muted); letter-spacing: .04em; }
.reader-toc nav { margin-top: 18px; border-left: 1px solid var(--border-color); }
.reader-toc nav a { display: block; padding-block: 6px; font-size: 12px; color: var(--text-muted); border-left: 2px solid transparent; margin-left: -1px; line-height: 1.65; overflow-wrap: anywhere; }
.reader-toc nav a.active { color: var(--accent); border-color: var(--accent); }
.reader-toc nav a:hover { color: var(--accent); }
.toc-footnote { display: block; margin-top: 30px; font-size: 10px; color: var(--text-muted); }
.mobile-toc { display: none; }
.reader-end { text-align: center; border-top: 1px solid var(--border-color); padding: 36px 0 15px; margin-top: 48px; }
.reader-end > i { font-size: 20px; color: var(--accent); }
.reader-end > p { font-size: 12px; margin: 10px 0 18px; color: var(--text-muted); }
.reader-end .text-link { font-size: 12px; }
.reader-error { padding: 85px 0; }
.reader-error h1 { font-size: 27px; font-weight: 550; margin-bottom: 18px; }
.reader-error p { font-size: 13px; margin-bottom: 25px; }
.reader-loading { padding-top: 50px; min-height: 500px; }
.reader-loading > div { margin-bottom: 23px; width: 70%; }
.reader-loading > div:first-child { height: 30px; width: 50%; }
.reader-loading > div:nth-child(2) { width: 25%; margin-bottom: 55px; }
@media (max-width: 900px) {
  .reader-layout { grid-template-columns: minmax(0, 1fr) 170px; gap: 30px; }
  .reader-toc > p > span { display: none; }
}
@media (max-width: 700px) {
  .reader-page { width: calc(100% - 40px); padding-top: 25px; }
  .reader-heading { padding-top: 28px; margin-bottom: 26px; }
  .reader-heading h1 { font-size: 27px; }
  .reader-heading > p { font-size: 13px; }
  .reader-meta { gap: 9px; font-size: 10px; }
  .reader-layout { grid-template-columns: minmax(0, 1fr); }
  .reader-toc { display: none; }
  .mobile-toc { display: block; border-bottom: 1px solid var(--border-color); padding: 0 0 16px; margin-bottom: 25px; color: var(--text-secondary); }
  .mobile-toc summary { display: flex; align-items: center; cursor: pointer; list-style: none; font-size: 12px; }
  .mobile-toc summary::-webkit-details-marker { display: none; }
  .mobile-toc summary > i { color: var(--accent); margin-right: 7px; }
  .mobile-toc summary > span { margin-left: auto; color: var(--text-muted); font-size: 10px; }
  .mobile-toc summary::after { content: '+'; margin-left: 12px; color: var(--accent); }
  .mobile-toc[open] summary::after { content: '−'; }
  .mobile-toc nav { display: grid; gap: 11px; padding-top: 18px; font-size: 12px; }
  .reader-error h1 { font-size: 23px; }
}
</style>
