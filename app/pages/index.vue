<script setup lang="ts">
import { BaseAPI } from '~/utils/api'
import { links } from '~/data/links'
import type { BlogDateMenuRes, BlogDateListRes, BlogItem } from '~/types/blog'
useSeoMeta({ title: 'Hollow’s Space', description: '你好，我是 Hollow。这里记录开发与生活，分享实用小工具，也收藏幻塔世界里的探索。' })
const articles = ref<BlogItem[]>([])
const loading = ref(true)
const failed = ref(false)
const socialLinks = computed(() => links.filter(link => ['GitHub', 'Bilibili', '邮箱', '探针'].includes(link.name) && !link.url.includes('example.com')))
const sections = [
  { title: '文章与笔记', icon: 'ri-quill-pen-line', description: '开发实践、学习记录，还有生活里值得留下的片刻。', link: '浏览文章', to: '/blog-page' },
  { title: '实用小工具', icon: 'ri-tools-line', description: '文字识别、编码转换和开发小帮手，让重复的事情简单一点。', link: '打开工具箱', to: '/tools' },
  { title: '幻塔资料库', icon: 'ri-planet-line', description: '查询武器、意志、源器与烹饪资料，为探索做好准备。', link: '查阅资料', to: '/hotta-page' }
]
async function loadArticles() {
  loading.value = true
  failed.value = false
  try {
    const menu = await BaseAPI.apiGet<BlogDateMenuRes>('blog/blog-date-menu')
    const latestMonths = [...(menu.data ?? [])].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth)).slice(0, 3)
    if (!latestMonths.length) { articles.value = []; return }
    const responses = await Promise.all(latestMonths.map(month => BaseAPI.apiGet<BlogDateListRes>('blog/blog-date-list/' + encodeURIComponent(month.yearMonth))))
    articles.value = responses.flatMap(response => response.data ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
  } catch { failed.value = true }
  finally { loading.value = false }
}
onMounted(loadArticles)
</script>

<template>
  <div class="home-page site-width">
    <section class="hero" aria-labelledby="hello-heading">
      <div class="hero-heading">
        <p class="hero-eyebrow">HOLLOW’S SPACE <span>个人主页</span></p>
        <h1 id="hello-heading">你好，我是 <span>Hollow<span class="title-period">。</span></span></h1>
        <p class="hero-subtitle">我本微末凡尘，但也心向天空。</p>
      </div>
      <ProfileOrbit />
      <p class="hero-description">记录开发与学习，分享用得上的小工具。<br />也在这里，收藏艾达星的探索与日常。</p>
      <div class="hero-socials"><a v-for="link in socialLinks" :key="link.name" :href="link.url" :target="link.url.startsWith('mailto:') ? undefined : '_blank'" rel="noopener noreferrer"><i :class="link.icon" aria-hidden="true" />{{ link.name }}<i class="ri-arrow-right-up-line social-arrow" aria-hidden="true" /></a></div>
    </section>

    <section id="explore" class="explore-section" aria-labelledby="explore-title">
      <div class="section-heading"><h2 id="explore-title">从这里开始</h2><span class="section-side-note">记录 · 工具 · 探索</span></div>
      <div class="explore-grid">
        <NuxtLink v-for="section in sections" :key="section.to" :to="section.to" class="explore-item">
          <i :class="section.icon" class="explore-icon" aria-hidden="true" />
          <div class="explore-copy"><h3>{{ section.title }}</h3><p>{{ section.description }}</p><span class="text-link">{{ section.link }}<i class="ri-arrow-right-line" aria-hidden="true" /></span></div>
        </NuxtLink>
      </div>
    </section>

    <div class="home-bottom">
      <section class="recent-section" aria-labelledby="recent-title">
        <div class="section-heading"><h2 id="recent-title">最近更新</h2><NuxtLink to="/blog-page" class="text-link">更多文章<i class="ri-arrow-right-line" aria-hidden="true" /></NuxtLink></div>
        <div v-if="loading" class="recent-loading" role="status" aria-label="正在加载文章"><div v-for="n in 3" :key="n" class="loading-row"><span class="skeleton-line" /><span class="skeleton-line" /></div></div>
        <div v-else-if="failed" class="recent-empty"><i class="ri-quill-pen-line" aria-hidden="true" /><div><p>文字正在路上，稍后再来看看。</p><button class="quiet-button" @click="loadArticles">重新加载 <i class="ri-refresh-line" aria-hidden="true" /></button></div></div>
        <div v-else-if="!articles.length" class="recent-empty"><i class="ri-quill-pen-line" aria-hidden="true" /><p>空白也有无限可能。第一篇记录，敬请期待。</p></div>
        <ArticleList v-else :articles="articles" compact />
      </section>
      <aside class="now-section" aria-labelledby="now-title">
        <div class="section-heading"><h2 id="now-title">关于这里</h2><i class="ri-cup-line" aria-hidden="true" /></div>
        <p>一个开发者的个人空间。把解决过的问题、学到的知识和喜欢的事情，整理成可以再次翻阅的记录。</p><div class="now-tags"><span><i class="ri-code-s-slash-line" aria-hidden="true" /> 开发与学习</span><span><i class="ri-gamepad-line" aria-hidden="true" /> 幻塔与日常</span></div>
        <p class="little-quote">保持好奇，慢慢积累。</p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.hero { display: grid; grid-template-columns: minmax(0, 1fr) 320px; column-gap: 64px; row-gap: 14px; align-items: start; padding: 36px 12px 32px; border-bottom: 1px solid var(--border-color); }
.hero-heading { grid-column: 1; grid-row: 1; }
.hero > :deep(.profile-orbit) { grid-column: 2; grid-row: 1 / span 3; align-self: center; }
.hero-eyebrow { display: flex; align-items: center; gap: 12px; color: var(--accent); font-size: 12px; font-weight: 700; letter-spacing: .08em; }
.hero-eyebrow span { padding-left: 12px; border-left: 1px solid var(--border-color); color: var(--text-muted); font-size: 13px; font-weight: 400; letter-spacing: 0; }
.hero h1 { margin-top: 14px; font-size: clamp(36px, 3.6vw, 46px); line-height: 1.25; font-weight: 750; letter-spacing: -.04em; }
.hero h1 > span { color: var(--accent); white-space: nowrap; }
.title-period { color: var(--text-main); }
.hero-subtitle { margin-top: 12px; font-size: 20px; font-weight: 500; line-height: 1.5; }
.hero-description { grid-column: 1; grid-row: 2; color: var(--text-secondary); font-size: 16px; line-height: 1.65; }
.hero-socials { grid-column: 1; grid-row: 3; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 20px; margin-top: 3px; }
.hero-socials a { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--text-secondary); }
.hero-socials a > i:first-child { font-size: 17px; }
.hero-socials a:hover { color: var(--accent); }
.social-arrow { color: var(--text-muted); font-size: 13px; }
.explore-section { padding-top: 28px; scroll-margin-top: var(--sticky-top); }
.section-side-note { color: var(--text-muted); font-size: 13px; }
.explore-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.explore-item { display: flex; align-items: start; gap: 16px; min-width: 0; padding: 24px; }
.explore-icon { display: grid; place-items: center; width: 42px; height: 42px; flex-shrink: 0; color: var(--accent); font-size: 23px; }
.explore-copy { min-width: 0; }
.explore-copy h3 { font-size: 20px; font-weight: 700; line-height: 1.4; }
.explore-copy p { margin-top: 8px; font-size: 16px; line-height: 1.65; color: var(--text-secondary); }
.explore-copy .text-link { margin-top: 16px; }
.explore-item:hover h3 { color: var(--accent); }
.explore-item:hover .ri-arrow-right-line { transform: translateX(3px); }
.home-bottom { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 24px; margin-top: 28px; align-items: start; }
.recent-section, .now-section { min-width: 0; padding: 24px; }
.recent-section :deep(.article-row) { background: transparent; }
.recent-section :deep(.article-tags span) { background: transparent; }
.home-bottom .section-heading { margin-bottom: 6px; padding-bottom: 14px; border-bottom: 1px solid var(--border-color); }
.now-section .section-heading > i { color: var(--accent); font-size: 22px; }
.recent-empty { display: flex; align-items: center; gap: 16px; min-height: 150px; font-size: 15px; color: var(--text-secondary); }
.recent-empty > i { font-size: 26px; color: var(--accent); }
.recent-empty button { margin-top: 10px; font-size: 14px; }
.loading-row { display: flex; flex-direction: column; gap: 12px; padding: 20px 0; border-bottom: 1px solid var(--border-color); }
.loading-row > span:first-child { width: 65%; height: 15px; }
.loading-row > span:last-child { width: 30%; }
.now-section > p { margin-top: 16px; color: var(--text-secondary); font-size: 16px; line-height: 1.7; }
.now-tags { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 16px; font-size: 13px; color: var(--text-secondary); }
.now-tags i { color: var(--accent); }
.now-section > .little-quote { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); color: var(--text-muted); font-size: 14px; }
@media (max-width: 1100px) { .hero { column-gap: 32px; grid-template-columns: minmax(0, 1fr) 280px; padding-inline: 0; }.explore-item { gap: 12px; padding: 20px; }.explore-icon { width: 36px; height: 36px; font-size: 21px; }.explore-copy h3 { font-size: 18px; }.home-bottom { grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 20px; } }
@media (max-width: 850px) { .explore-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; }.explore-copy .text-link { margin-top: 10px; }.explore-item { gap: 16px; }.home-bottom { grid-template-columns: minmax(0, 1fr); }.hero h1 { font-size: 36px; } }
@media (max-width: 700px) {
  .hero { grid-template-columns: minmax(0, 1fr) 80px; column-gap: 14px; row-gap: 16px; padding: 26px 0 24px; }
  .hero > :deep(.profile-orbit) { grid-column: 2; grid-row: 1; align-self: start; margin-top: 8px; }
  .hero h1 { margin-top: 12px; font-size: clamp(27px, 6.5vw, 34px); line-height: 1.3; }
  .hero-eyebrow { font-size: 11px; letter-spacing: .04em; }.hero-eyebrow span { display: none; }
  .hero-subtitle { font-size: 17px; line-height: 1.6; margin-top: 10px; }
  .hero-description, .hero-socials { grid-column: 1 / -1; }
  .hero-description { font-size: 16px; }.hero-socials { gap: 10px 18px; margin: 0; }
  .explore-section { padding-top: 24px; }.section-side-note { display: none; }.explore-item { padding: 20px; }
  .home-bottom { margin-top: 24px; gap: 20px; }.recent-section, .now-section { padding: 20px; }.home-bottom .section-heading { gap: 10px; }.recent-section .text-link { font-size: 13px; }
}
</style>
