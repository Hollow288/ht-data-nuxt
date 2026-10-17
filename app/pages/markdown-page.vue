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
const mobileTocDialog = ref<HTMLDialogElement | null>(null)
const mobileTocOpen = ref(false)
const md = new MarkdownIt()
let version = 0
let scrollFrame = 0
let previousBodyOverflow: string | null = null
let mobileTocViewport: MediaQueryList | undefined
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

function resetMobileToc() {
  mobileTocOpen.value = false
  if (previousBodyOverflow !== null) {
    document.body.style.overflow = previousBodyOverflow
    previousBodyOverflow = null
  }
}
function closeMobileToc() {
  mobileTocDialog.value?.close()
  resetMobileToc()
}
async function openMobileToc() {
  const dialog = mobileTocDialog.value
  if (!dialog || dialog.open || !mobileTocViewport?.matches) return
  dialog.showModal()
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  mobileTocOpen.value = true
  await nextTick()
  dialog.querySelector('[aria-current="location"]')?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
}
function onTocViewportChange(event: MediaQueryListEvent) {
  if (!event.matches) closeMobileToc()
}
async function selectMobileHeading(id: string) {
  closeMobileToc()
  await navigateTo({ path: route.path, query: route.query, hash: '#' + id })
  await nextTick()
  // Numbered headings are not valid CSS selectors for Nuxt's default hash offset lookup.
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'auto' }))
}
async function loadPost() {
  closeMobileToc()
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
onMounted(() => {
  loadPost()
  window.addEventListener('scroll', updateHeading, { passive: true })
  mobileTocViewport = window.matchMedia('(max-width: 700px)')
  mobileTocViewport.addEventListener('change', onTocViewportChange)
})
onUnmounted(() => {
  version++
  closeMobileToc()
  window.removeEventListener('scroll', updateHeading)
  mobileTocViewport?.removeEventListener('change', onTocViewportChange)
  cancelAnimationFrame(scrollFrame)
})
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
          <MarkdownContent :content="content" />
          <div class="reader-end"><i class="ri-sparkling-2-line" aria-hidden="true" /><p>谢谢你，读到这里。</p><NuxtLink to="/blog-page" class="text-link">再读一篇 <i class="ri-arrow-right-line" aria-hidden="true" /></NuxtLink></div>
        </div>
        <aside v-if="toc.length" class="reader-toc"><p>本文目录<span>ON THIS PAGE</span></p><nav aria-label="本文目录"><a v-for="heading in toc" :key="heading.id" :href="'#' + encodeURIComponent(heading.id)" :class="{ active: activeHeading === heading.id }" :aria-current="activeHeading === heading.id ? 'location' : undefined" :style="{ paddingLeft: 15 + Math.max(0, heading.level - 2) * 12 + 'px' }">{{ heading.title }}</a></nav><span class="toc-footnote">记录，让日常有迹可循。</span></aside>
      </div>
      <template v-if="toc.length">
        <button class="mobile-toc-trigger" type="button" aria-label="打开文章目录" title="本文目录" aria-haspopup="dialog" aria-controls="reader-mobile-toc" :aria-expanded="mobileTocOpen" @click="openMobileToc">
          <i class="ri-list-check" aria-hidden="true" />
        </button>
        <dialog id="reader-mobile-toc" ref="mobileTocDialog" class="mobile-toc-dialog" aria-labelledby="mobile-toc-title" @close="resetMobileToc" @click="event => { if (event.target === event.currentTarget) closeMobileToc() }">
          <div class="mobile-toc-panel">
            <header class="mobile-toc-header">
              <div><h2 id="mobile-toc-title">本文目录<span>ON THIS PAGE</span></h2><p>{{ toc.length }} 个章节 · 点击跳转阅读</p></div>
              <button type="button" class="mobile-toc-close" aria-label="关闭文章目录" autofocus @click="closeMobileToc"><i class="ri-close-line" aria-hidden="true" /></button>
            </header>
            <nav class="mobile-toc-nav" aria-label="文章章节">
              <div class="mobile-toc-links">
                <a v-for="heading in toc" :key="heading.id" :href="'#' + encodeURIComponent(heading.id)" :class="{ active: activeHeading === heading.id }" :aria-current="activeHeading === heading.id ? 'location' : undefined" :style="{ paddingLeft: 16 + Math.max(0, heading.level - 2) * 12 + 'px' }" @click.prevent="selectMobileHeading(heading.id)">{{ heading.title }}</a>
              </div>
            </nav>
          </div>
        </dialog>
      </template>
    </template>
  </div>
</template>

<style scoped>
.reader-page { --site-max-width: 1240px; padding-top: 34px; }
.reader-back { display: inline-flex; align-items: center; gap: 8px; color: var(--accent); font-size: 15px; }
.reader-layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 48px; }
.reading-content { min-width: 0; }
.reader-heading { padding: 32px 0 28px; margin-bottom: 32px; border-bottom: 1px solid var(--border-color); }
.reader-heading > h1 { margin-top: 15px; font-size: clamp(27px, 3.2vw, 34px); font-weight: 600; line-height: 1.55; letter-spacing: -.035em; overflow-wrap: anywhere; }
.reader-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; color: var(--text-muted); font-size: 14px; margin-top: 17px; }
.reader-meta > span:first-child { color: var(--text-secondary); }
.reader-heading > p { color: var(--text-secondary); margin-top: 22px; font-size: 17px; line-height: 1.95; }
.reader-tags { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 18px; font-size: 14px; color: var(--accent); }
.reader-tags a:hover { text-decoration: underline; }
.reader-toc { position: sticky; top: 110px; align-self: start; display: flex; flex-direction: column; max-height: calc(100dvh - 138px); min-height: 0; margin-top: 32px; }
.reader-toc > p { display: flex; flex-shrink: 0; align-items: baseline; gap: 10px; padding-bottom: 18px; font-size: 15px; font-weight: 600; color: var(--text-secondary); }
.reader-toc > p > span { font-size: 12px; font-weight: 400; color: var(--text-muted); letter-spacing: .04em; }
.reader-toc nav { min-height: 0; overflow-y: auto; overscroll-behavior-y: contain; border-left: 1px solid #dedede; }
.reader-toc nav a { display: block; padding-block: 6px; font-size: 15px; color: var(--text-muted); border-left: 2px solid transparent; margin-left: -1px; line-height: 1.65; overflow-wrap: anywhere; }
.reader-toc nav a.active { color: var(--accent); border-color: var(--accent); }
.reader-toc nav a:hover { color: var(--accent); }
.toc-footnote { display: block; flex-shrink: 0; margin-top: 22px; font-size: 13px; color: var(--text-muted); }
.mobile-toc-trigger { display: none; position: fixed; right: 15px; bottom: calc(90px + env(safe-area-inset-bottom, 0px)); z-index: 90; width: 44px; height: 44px; padding: 0; place-items: center; border: 1px solid var(--border-color); border-radius: 50%; background: var(--bg-body); color: var(--accent); font-size: 23px; box-shadow: 0 4px 16px #0001; }
.mobile-toc-trigger:hover { border-color: var(--accent); }
.mobile-toc-dialog { position: fixed; inset: 0 0 0 auto; width: min(360px, 88vw); height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 0; overflow: hidden; border: 0; border-left: 1px solid var(--border-color); background: var(--bg-body); color: var(--text-main); box-shadow: -10px 0 40px #0002; opacity: 0; transform: translateX(100%); transition: opacity .25s ease, transform .25s ease, display .25s allow-discrete, overlay .25s allow-discrete; }
.mobile-toc-dialog[open] { opacity: 1; transform: translateX(0); }
.mobile-toc-dialog::backdrop { background: #0006; backdrop-filter: blur(2px); }
@starting-style { .mobile-toc-dialog[open] { opacity: 0; transform: translateX(100%); } }
.mobile-toc-panel { display: flex; flex-direction: column; height: 100%; }
.mobile-toc-header { display: flex; flex-shrink: 0; align-items: flex-start; justify-content: space-between; gap: 12px; padding: max(22px, env(safe-area-inset-top, 0px)) 20px 20px; border-bottom: 1px solid var(--border-color); }
.mobile-toc-header h2 { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; font-size: 20px; font-weight: 600; }
.mobile-toc-header h2 span { color: var(--text-muted); font-size: 12px; font-weight: 400; letter-spacing: .04em; }
.mobile-toc-header p { margin-top: 7px; color: var(--text-muted); font-size: 14px; }
.mobile-toc-close { display: grid; flex-shrink: 0; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--text-secondary); font-size: 24px; }
.mobile-toc-close:hover { color: var(--accent); background: var(--bg-soft); }
.mobile-toc-nav { flex: 1; min-height: 0; padding: 20px 20px max(24px, env(safe-area-inset-bottom, 0px)); overflow-y: auto; overscroll-behavior: contain; }
.mobile-toc-links { border-left: 1px solid #dedede; }
.mobile-toc-links a { display: block; margin-left: -1px; padding-block: 10px; padding-right: 8px; border-left: 2px solid transparent; color: var(--text-secondary); font-size: 15px; line-height: 1.7; overflow-wrap: anywhere; }
.mobile-toc-links a:hover, .mobile-toc-links a.active { color: var(--accent); }
.mobile-toc-links a.active { border-left-color: var(--accent); }
.reader-end { text-align: center; border-top: 1px solid var(--border-color); padding: 36px 0 15px; margin-top: 48px; }
.reader-end > i { font-size: 20px; color: var(--accent); }
.reader-end > p { font-size: 15px; margin: 10px 0 18px; color: var(--text-muted); }
.reader-end .text-link { font-size: 15px; }
.reader-error { padding: 85px 0; }
.reader-error h1 { font-size: 27px; font-weight: 550; margin-bottom: 18px; }
.reader-error p { font-size: 16px; margin-bottom: 25px; }
.reader-loading { padding-top: 50px; min-height: 500px; }
.reader-loading > div { margin-bottom: 23px; width: 70%; }
.reader-loading > div:first-child { height: 30px; width: 50%; }
.reader-loading > div:nth-child(2) { width: 25%; margin-bottom: 55px; }
@media (max-width: 1100px) {
  .reader-layout { grid-template-columns: minmax(0, 1fr) 260px; gap: 32px; }
}
@media (max-width: 900px) {
  .reader-layout { grid-template-columns: minmax(0, 1fr) 230px; gap: 28px; }
}
@media (max-width: 700px) {
  .reader-page { width: calc(100% - 40px); padding-top: 25px; }
  .reader-heading { padding-top: 28px; margin-bottom: 26px; }
  .reader-heading h1 { font-size: 27px; }
  .reader-heading > p { font-size: 16px; }
  .reader-meta { gap: 9px; font-size: 13px; }
  .reader-layout { grid-template-columns: minmax(0, 1fr); }
  .reader-toc { display: none; }
  .mobile-toc-trigger { display: grid; }
  .reader-error h1 { font-size: 23px; }
}
</style>
