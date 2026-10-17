<script setup lang="ts">
import { BaseAPI } from '~/utils/api'
import { links } from '~/data/links'
import type { BlogDateMenuRes, BlogDateListRes, BlogItem } from '~/types/blog'
useSeoMeta({ title: 'Hollow’s Space · 在这里，慢慢生长', description: '你好，我是 Hollow。这里记录开发与生活，分享实用小工具，也收藏幻塔世界里的探索。' })
const articles = ref<BlogItem[]>([])
const loading = ref(true)
const failed = ref(false)
const socialLinks = computed(() => links.filter(link => ['GitHub', 'Bilibili', '邮箱'].includes(link.name) && !link.url.includes('example.com')))
const sections = [
  { number: '01', title: '文字，留住思考', english: 'THE JOURNAL', icon: 'ri-quill-pen-line', description: '开发里的灵光一现，生活里的细碎片刻。\n让思考有迹可循，让记录慢慢积累。', link: '翻翻我的文章', to: '/blog-page', tags: '开发记录 / 学习笔记 / 日常' },
  { number: '02', title: '工具，化繁为简', english: 'THE TOOLBOX', icon: 'ri-tools-line', description: '为日常的小麻烦，做一些顺手的小工具。\n从图片识字开始，让重复的事简单一点。', link: '发现小工具', to: '/tools', tags: 'OCR / 图片识别 / 效率' },
  { number: '03', title: '在艾达星，再出发', english: 'TOWER OF FANTASY', icon: 'ri-planet-line', description: '整理冒险途中遇见的数据与知识。\n武器、意志、食谱，给探索多一点准备。', link: '打开幻塔查询', to: '/hotta-page', tags: '武器 / 意志 / 源器 / 食谱' }
]
async function loadArticles() {
  loading.value = true
  failed.value = false
  try {
    const menu = await BaseAPI.apiGet<BlogDateMenuRes>('blog/blog-date-menu')
    const latest = [...(menu.data ?? [])].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))[0]
    if (!latest) { articles.value = []; return }
    const response = await BaseAPI.apiGet<BlogDateListRes>('blog/blog-date-list/' + encodeURIComponent(latest.yearMonth))
    articles.value = [...(response.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)
  } catch { failed.value = true }
  finally { loading.value = false }
}
onMounted(loadArticles)
</script>

<template>
  <div class="home-page site-width">
    <section class="hero" aria-labelledby="hello-heading">
      <div class="hero-copy">
        <div class="hero-eyebrow"><span class="hello-dot" /> A SMALL CORNER OF THE INTERNET</div>
        <h1 id="hello-heading">Hi, I’m <span>Hollow<span class="title-period">.</span></span><span class="hello-wave" aria-hidden="true">✳</span></h1>
        <p class="hero-subtitle">我本微末凡尘，但也心向天空。</p>
        <p class="hero-description">欢迎来到我的数字小天地。<br />在代码与日常之间，记录所学，折腾所爱，<br class="desktop-break" />也为每一个微小的灵感，留一个位置。</p>
        <div class="hero-actions"><NuxtLink to="/blog-page" class="primary-button">读读我的文字 <i class="ri-arrow-right-line" aria-hidden="true" /></NuxtLink><a href="#explore" class="hero-explore">随便逛逛 <i class="ri-arrow-down-line" aria-hidden="true" /></a></div>
        <div class="hero-socials"><a v-for="link in socialLinks" :key="link.name" :href="link.url" :target="link.url.startsWith('mailto:') ? undefined : '_blank'" rel="noopener noreferrer"><i :class="link.icon" aria-hidden="true" />{{ link.name }}<i class="ri-arrow-right-up-line social-arrow" aria-hidden="true" /></a><span class="social-note">保持好奇，保持热爱。</span></div>
      </div>
      <ProfileOrbit />
      <div class="hero-bottom"><span>PERSONAL NOTES & LITTLE EXPLORATIONS</span><span>向下探索 <i class="ri-arrow-down-line" aria-hidden="true" /></span></div>
    </section>

    <section id="explore" class="explore-section" aria-labelledby="explore-title">
      <div class="section-heading"><h2 id="explore-title">一些记录，一些热爱<span>EXPLORE MY SPACE</span></h2><span class="section-side-note">生活不止一种打开方式</span></div>
      <div class="explore-grid">
        <NuxtLink v-for="section in sections" :key="section.to" :to="section.to" class="explore-item">
          <div class="explore-top"><i :class="section.icon" aria-hidden="true" /><span>{{ section.number }} / {{ section.english }}</span></div>
          <h3>{{ section.title }}</h3><p>{{ section.description }}</p><span class="explore-tags">{{ section.tags }}</span><span class="text-link">{{ section.link }}<i class="ri-arrow-right-line" aria-hidden="true" /></span>
        </NuxtLink>
      </div>
    </section>

    <div class="home-bottom">
      <section class="recent-section" aria-labelledby="recent-title">
        <div class="section-heading"><h2 id="recent-title">最近写下<span>RECENT NOTES</span></h2><NuxtLink to="/blog-page" class="text-link">全部文章<i class="ri-arrow-right-line" aria-hidden="true" /></NuxtLink></div>
        <div v-if="loading" class="recent-loading" role="status" aria-label="正在加载文章"><div v-for="n in 3" :key="n" class="loading-row"><span class="skeleton-line" /><span class="skeleton-line" /></div></div>
        <div v-else-if="failed" class="recent-empty"><i class="ri-quill-pen-line" aria-hidden="true" /><div><p>文字正在路上，稍后再来看看。</p><button class="quiet-button" @click="loadArticles">重新加载 <i class="ri-refresh-line" aria-hidden="true" /></button></div></div>
        <div v-else-if="!articles.length" class="recent-empty"><i class="ri-quill-pen-line" aria-hidden="true" /><p>空白也有无限可能。第一篇记录，敬请期待。</p></div>
        <ArticleList v-else :articles="articles" compact />
      </section>
      <aside class="now-section" aria-labelledby="now-title">
        <div class="section-heading"><h2 id="now-title">此刻<span>NOW & HERE</span></h2><span class="now-dot" /></div>
        <p>写一点代码，学一点新东西，<br />把喜欢的事情，慢慢做成日常。</p><div class="now-tags"><span><i class="ri-code-s-slash-line" aria-hidden="true" /> 持续折腾中</span><span><i class="ri-gamepad-line" aria-hidden="true" /> 艾达星漫游</span></div>
        <div class="little-quote"><span aria-hidden="true">“</span><p>不必走得太快，<br />每一步都算数。</p><svg width="49" height="48" viewBox="0 0 49 48" fill="none" aria-hidden="true"><path d="M24 44V20M24 33C9 34 6 21 8 13C18 13 25 20 24 33ZM24 25C24 10 34 4 43 6C44 17 38 26 24 25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg></div>
      </aside>
    </div>
    <div class="home-signoff"><span class="signoff-line" /><i class="ri-sparkling-2-line" aria-hidden="true" /><span>很高兴，在这里遇见你。</span><span class="signoff-line" /></div>
  </div>
</template>

<style scoped>
.hero { position: relative; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); align-items: center; gap: 40px; padding: 58px 32px 76px; border-bottom: 1px solid var(--border-color); }
.hero-eyebrow { display: flex; align-items: center; gap: 9px; color: var(--text-muted); font-size: 13px; letter-spacing: .15em; }
.hello-dot, .now-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; }
.hero h1 { display: flex; align-items: baseline; gap: 13px; position: relative; isolation: isolate; margin-top: 23px; font-size: clamp(44px, 4.5vw, 68px); line-height: 1.2; font-weight: 600; letter-spacing: -.055em; white-space: nowrap; }
.hero h1 > span:first-child { color: var(--accent); position: relative; }
.hero h1 > span:first-child::after { content: ''; position: absolute; left: 0; right: 0; bottom: 4px; z-index: -1; height: 10px; background: var(--accent-soft); transform: rotate(-2deg); }
.title-period { color: var(--text-main); }
.hero h1 .hello-wave { margin-left: 3px; align-self: center; font-size: 35px; font-weight: 400; color: #b9aa84; transform: rotate(-12deg); }
.hero-subtitle { margin-top: 22px; font-size: 23px; line-height: 1.6; font-weight: 450; letter-spacing: .015em; }
.hero-description { margin-top: 17px; font-size: 16px; line-height: 2; color: var(--text-secondary); }
.hero-actions { margin-top: 29px; display: flex; align-items: center; gap: 24px; }
.hero-explore { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--text-secondary); }
.hero-explore:hover { color: var(--accent); }
.hero-socials { margin-top: 28px; display: flex; align-items: center; flex-wrap: wrap; gap: 12px 21px; }
.hero-socials a { display: inline-flex; align-items: center; gap: 5px; font-size: 14px; color: var(--text-secondary); }
.hero-socials a > i:first-child { font-size: 15px; }
.hero-socials a:hover { color: var(--accent); }
.social-arrow { font-size: 13px; color: var(--text-muted); }
.social-note { font-size: 13px; color: var(--text-muted); padding-left: 17px; border-left: 1px solid var(--border-color); }
.hero-bottom { position: absolute; bottom: 19px; left: 0; right: 0; display: flex; justify-content: space-between; color: var(--text-muted); font-size: 12px; letter-spacing: .08em; }
.hero-bottom > span:last-child { display: flex; align-items: center; gap: 9px; letter-spacing: .05em; }
.explore-section { padding-top: 38px; scroll-margin-top: 100px; }
.section-side-note { color: var(--text-muted); font-size: 14px; }
.explore-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.explore-item { min-width: 0; display: flex; flex-direction: column; padding: 27px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--bg-card); }
.explore-item:hover { border-color: var(--accent); background: var(--bg-soft); transform: translateY(-3px); }
.explore-top { display: flex; align-items: center; gap: 12px; }
.explore-top > i { display: grid; place-items: center; flex-shrink: 0; width: 42px; height: 42px; border-radius: 10px; background: var(--accent-soft); font-size: 23px; color: var(--accent); }
.explore-top > span { color: var(--text-muted); font-size: 12px; letter-spacing: .07em; }
.explore-item h3 { margin-top: 18px; font-size: 21px; font-weight: 550; letter-spacing: -.04em; }
.explore-item > p { flex: 1; margin-top: 11px; font-size: 16px; color: var(--text-secondary); line-height: 1.95; white-space: pre-line; }
.explore-tags { display: block; margin-top: 15px; color: var(--text-muted); font-size: 13px; }
.explore-item > .text-link { margin-top: 23px; font-size: 15px; }
.explore-item:hover h3 { color: var(--accent); }.explore-item:hover .ri-arrow-right-line { transform: translateX(4px); }
.home-bottom { display: grid; grid-template-columns: minmax(0, 1.9fr) minmax(0, 1fr); gap: 44px; padding-top: 42px; }
.now-section { padding: 25px 27px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--bg-soft); align-self: start; }
.home-bottom .section-heading { margin-bottom: 10px; }
.recent-empty { min-height: 156px; display: flex; align-items: center; gap: 18px; color: var(--text-muted); border-bottom: 1px solid var(--border-color); font-size: 15px; }
.recent-empty > i { font-size: 28px; color: var(--accent); opacity: .6; }.recent-empty button { margin-top: 12px; font-size: 14px; }
.loading-row { display: flex; gap: 25px; padding: 25px 0; border-bottom: 1px solid var(--border-color); }.loading-row > span:first-child { width: 75px; }.loading-row > span:last-child { width: 65%; }
.now-dot { width: 5px; height: 5px; margin-right: 3px; }
.now-section > p { padding-top: 14px; color: var(--text-secondary); font-size: 15px; line-height: 2; }
.now-tags { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 15px; font-size: 13px; color: var(--text-muted); }.now-tags i { margin-right: 3px; color: var(--accent); }
.little-quote { position: relative; margin-top: 24px; padding: 17px 0 0 17px; border-top: 1px solid var(--border-color); }.little-quote > span { position: absolute; top: 6px; left: 0; color: var(--accent); opacity: .45; font: 42px Georgia, serif; }.little-quote p { font-size: 15px; line-height: 2; color: var(--text-secondary); }.little-quote svg { position: absolute; right: 6px; bottom: 2px; color: var(--accent); opacity: .55; transform: rotate(15deg); }
.home-signoff { display: flex; align-items: center; justify-content: center; gap: 13px; padding-top: 66px; color: var(--text-muted); font-size: 13px; letter-spacing: .08em; }.home-signoff i { color: var(--accent); }.signoff-line { height: 1px; width: 45px; background: var(--border-color); }
@media (max-width: 1100px) { .hero h1 { font-size: 48px; }.hero { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); padding-inline: 0; gap: 20px; }.social-note { display: none; }.explore-grid { gap: 14px; }.explore-item { padding: 22px; }.explore-item > p { white-space: normal; }.explore-top { flex-direction: column; align-items: flex-start; gap: 12px; }.home-bottom { gap: 30px; }.section-heading h2 { flex-wrap: wrap; gap: 5px 12px; } }
@media (max-width: 700px) {
  .hero { grid-template-columns: minmax(0, 1fr); gap: 18px; padding: 36px 0 52px; }
  .hero h1 { margin-top: 18px; gap: 8px; font-size: clamp(34px, 8.7vw, 52px); }.hero h1 .hello-wave { font-size: 24px; }
  .hero-eyebrow { font-size: 12px; letter-spacing: .04em; }.hero-subtitle { font-size: 20px; margin-top: 18px; }
  .hero-description { font-size: 16px; }.hero-actions { margin-top: 23px; }.hero-socials { margin-top: 23px; }.desktop-break { display: none; }
  .hero-bottom { font-size: 12px; letter-spacing: .03em; }.hero-bottom > span:first-child { display: none; }.hero-bottom > span:last-child { margin-left: auto; font-size: 13px; }
  .section-side-note { display: none; }.explore-section { padding-top: 30px; }.section-heading h2 { flex-wrap: wrap; gap: 5px 10px; }.section-heading h2 span { font-size: 12px; }
  .explore-top { flex-direction: row; align-items: center; flex-wrap: wrap; }.explore-grid { grid-template-columns: minmax(0, 1fr); gap: 14px; }.explore-item { padding: 23px; }.explore-item h3 { margin-top: 14px; }.explore-item > p { font-size: 16px; }.explore-item > .text-link { margin-top: 16px; }
  .home-bottom { grid-template-columns: minmax(0, 1fr); gap: 30px; padding-top: 32px; }.recent-empty { min-height: 130px; }.now-section { padding: 23px; }.now-section > p { font-size: 16px; }.little-quote { margin-top: 20px; }.home-signoff { padding-top: 34px; }
}
</style>
