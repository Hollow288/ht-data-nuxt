<script setup lang="ts">
import { hottaCategories } from '~/data/site'
const route = useRoute()
const activeCategory = computed(() => hottaCategories.find(item => route.path === '/hotta-page/' + item.slug))
useSeoMeta({ title: () => (activeCategory.value ? activeCategory.value.name + '查询' : '幻塔查询') + ' · Hollow’s Space', description: '艾达星探索手册。查阅幻塔武器、意志、源器、食物与食谱资料。' })
</script>

<template>
  <div class="hotta-page site-width">
    <header class="page-heading hotta-heading"><div><span class="eyebrow"><i class="ri-planet-line" aria-hidden="true" /> TOWER OF FANTASY</span><h1 class="page-title">给下一场冒险，一点准备<span>。</span></h1><p class="page-description">属于艾达星的探索手册。查阅资料，搭配灵感，然后继续出发。</p></div><svg class="planet-drawing" width="126" height="106" viewBox="0 0 126 106" fill="none" aria-hidden="true"><circle cx="63" cy="53" r="32" stroke="currentColor" stroke-width="1.2" /><ellipse cx="63" cy="53" rx="61" ry="16" transform="rotate(-26 63 53)" stroke="currentColor" stroke-width="1.2" /><path d="M35 39c11 7 25 10 35 7M58 78c5-11 14-17 31-17M93 10v9m-4-4h9M19 87v7m-3-4h7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" /><circle cx="107" cy="71" r="2" fill="currentColor" /></svg></header>
    <nav class="hotta-tabs" aria-label="幻塔资料分类"><NuxtLink to="/hotta-page" :class="{ active: !activeCategory }" :aria-current="!activeCategory ? 'page' : undefined"><i class="ri-compass-3-line" aria-hidden="true" />探索手册</NuxtLink><NuxtLink v-for="item in hottaCategories" :key="item.slug" :to="'/hotta-page/' + item.slug" :class="{ active: activeCategory?.slug === item.slug }" :aria-current="activeCategory?.slug === item.slug ? 'page' : undefined"><i :class="item.icon" aria-hidden="true" />{{ item.name }}</NuxtLink></nav>
    <section v-if="!activeCategory" class="hotta-overview" aria-label="选择查询分类">
      <div class="overview-intro"><span class="eyebrow">CHOOSE YOUR NEXT DISCOVERY</span><h2>从哪里开始探索？</h2><p>将散落在游戏里的信息，<br />整理成触手可及的资料。</p><a href="https://github.com/Hollow288/hotta-data-builder" class="text-link" target="_blank" rel="noopener noreferrer"><i class="ri-github-line" aria-hidden="true" />数据项目<i class="ri-arrow-right-up-line" aria-hidden="true" /></a><div class="overview-coordinate">AIDA / EXPLORER’S FIELD NOTES<br /><span>保持探索，总有新的发现。</span></div></div>
      <div class="category-list"><NuxtLink v-for="(item, index) in hottaCategories" :key="item.slug" :to="'/hotta-page/' + item.slug" class="category-row"><span class="category-number">0{{ index + 1 }}</span><i :class="item.icon" class="category-icon" aria-hidden="true" /><div><h3>{{ item.name }}<span>{{ item.english }}</span></h3><p>{{ item.description }}</p></div><i class="ri-arrow-right-line category-arrow" aria-hidden="true" /></NuxtLink></div>
    </section>
    <section v-else class="hotta-detail" :aria-label="activeCategory.name + '查询'">
      <div class="detail-caption"><span>{{ activeCategory.english.toUpperCase() }} / {{ activeCategory.name }}档案</span><span>选择条目，查看详细资料</span></div>
      <NuxtErrorBoundary :key="activeCategory.slug"><NuxtPage /><template #error="{ clearError }"><div class="empty-state" role="status"><i class="ri-planet-line" aria-hidden="true" /><p>这份探索资料暂时无法读取。</p><small>请稍后重试，或换个分类继续看看。</small><button class="secondary-button" @click="clearError"><i class="ri-refresh-line" aria-hidden="true" />重新加载</button></div></template></NuxtErrorBoundary>
    </section>
    <div class="hotta-note"><i class="ri-information-line" aria-hidden="true" />资料仅供探索与参考，游戏内容请以实际版本为准。</div>
  </div>
</template>

<style scoped>
.page-title > span { color: var(--accent); }.hotta-heading { display: flex; justify-content: space-between; align-items: center; gap: 30px; }.planet-drawing { flex-shrink: 0; margin-right: 20px; color: var(--accent); opacity: .6; transform: rotate(5deg); }
.hotta-tabs { display: flex; gap: 32px; border-block: 1px solid var(--border-color); overflow-x: auto; }.hotta-tabs a { position: relative; flex-shrink: 0; padding: 17px 0; display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); }.hotta-tabs i { font-size: 17px; }.hotta-tabs a:hover, .hotta-tabs a.active { color: var(--accent); }.hotta-tabs a.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--accent); }
.hotta-overview { display: grid; grid-template-columns: 1fr 1.9fr; gap: 65px; padding: 40px 0 15px; }.overview-intro { padding-top: 20px; }.overview-intro .eyebrow { font-size: 9px; letter-spacing: .1em; }.overview-intro h2 { font-size: 24px; font-weight: 550; letter-spacing: -.04em; margin-top: 18px; }.overview-intro p { font-size: 13px; color: var(--text-secondary); line-height: 2; margin: 17px 0 25px; }.overview-intro .text-link { font-size: 12px; }.overview-coordinate { margin-top: 65px; font-size: 9px; color: var(--text-muted); letter-spacing: .08em; line-height: 2.5; }.overview-coordinate span { letter-spacing: .04em; font-size: 11px; }
.category-row { display: flex; align-items: center; gap: 23px; padding: 25px 0; border-bottom: 1px solid var(--border-color); }.category-number { font-size: 10px; color: var(--text-muted); }.category-icon { font-size: 27px; color: var(--accent); }.category-row > div { flex: 1; }.category-row h3 { display: flex; align-items: baseline; gap: 13px; font-size: 18px; font-weight: 550; }.category-row h3 span { font-size: 11px; font-weight: 400; color: var(--text-muted); }.category-row p { font-size: 12px; color: var(--text-secondary); margin-top: 6px; }.category-arrow { color: var(--text-muted); font-size: 21px; transition: transform .2s; }.category-row:hover h3, .category-row:hover .category-arrow { color: var(--accent); }.category-row:hover .category-arrow { transform: translateX(4px); }
.detail-caption { display: flex; justify-content: space-between; gap: 16px; padding: 22px 0; color: var(--text-muted); font-size: 10px; letter-spacing: .05em; }
.hotta-note { display: flex; align-items: center; gap: 7px; padding-top: 35px; font-size: 11px; color: var(--text-muted); }
.hotta-detail :deep(.page-container-wrapper) { max-width: none; gap: 35px; }
.hotta-detail :deep(.gallery-container) { background: transparent; box-shadow: none; backdrop-filter: none; min-height: 500px; overflow: visible; }
.hotta-detail :deep(.sidebar.sidebar--right) { flex-basis: 260px; min-width: 220px; max-width: 260px; border-left: 1px solid var(--border-color); background: transparent; box-shadow: none; backdrop-filter: none; top: 96px; height: calc(100vh - 125px); padding-left: 23px; }
.hotta-detail :deep(.search-panel__header) { padding: 10px 0 20px; color: var(--text-main); background: transparent; }
.hotta-detail :deep(.search-panel__title) { font-size: 15px; font-weight: 550; }
.hotta-detail :deep(.search-panel__subtitle) { font-size: 10px; color: var(--text-muted); margin: 5px 0 15px; }
.hotta-detail :deep(.search-panel__input-wrapper input) { border-radius: 5px; padding: 9px 35px 9px 12px; border: 1px solid var(--border-color); background: var(--bg-soft); color: var(--text-main); font-size: 12px; }
.hotta-detail :deep(.search-panel__input-wrapper i) { color: var(--accent); right: 11px; font-size: 16px; }
.hotta-detail :deep(.result-item.active) { background: var(--accent-soft); color: var(--accent); border-radius: 4px; }
.hotta-detail :deep(.result-item:hover) { background: var(--bg-soft); }
.hotta-detail :deep(.result-item__avatar) { border-radius: 4px; }
.hotta-detail :deep(.result-item__title) { font-size: 12px; }.hotta-detail :deep(.result-item__meta) { font-size: 9px; color: var(--text-muted); }
.hotta-detail :deep(.query-no-results) { color: var(--text-muted); text-align: center; padding: 28px 0; font-size: 12px; }
.hotta-detail :deep(.artifact-section), .hotta-detail :deep(.food-section), .hotta-detail :deep(.recipes-section) { background: transparent; border-radius: 0; padding: 12px 0 20px; border-bottom: 1px solid var(--border-color); }
.hotta-detail :deep(.artifact-rank-item) { background: transparent; border: none; border-top: 1px solid var(--border-color); border-radius: 0; padding: 15px 0; }
.hotta-detail :deep(.artifact-body), .hotta-detail :deep(.recipes-body), .hotta-detail :deep(.food-body) { padding: 20px 0; }
.hotta-detail :deep(.artifact-hero), .hotta-detail :deep(.recipes-hero), .hotta-detail :deep(.food-hero) { padding-top: 18px; }
.hotta-detail :deep(.artifact-hero__name), .hotta-detail :deep(.recipes-hero__name), .hotta-detail :deep(.food-hero__name), .hotta-detail :deep(.gallery-container .name) { font-weight: 550; font-size: 27px; }
.hotta-detail :deep(.gallery-container .description), .hotta-detail :deep(.gallery-container .desc) { color: var(--text-secondary); }
.hotta-detail :deep(.gallery-container__row) { padding-inline: 0; }
.hotta-detail :deep(.gallery-container__suit) { padding-inline: 0; }
.hotta-detail :deep(.ingredient-item) { background: transparent; box-shadow: none; border-radius: 0; }
.hotta-detail :deep(.toc-toggle-btn) { color: var(--accent); border-radius: 50%; width: 44px; height: 44px; min-width: 44px; min-height: 44px; box-shadow: none; border: 1px solid var(--border-color); background: var(--bg-body); }
@media (max-width: 850px) { .hotta-detail :deep(.page-container-wrapper) { width: 100%; }.hotta-detail :deep(.gallery-container) { width: 100%; min-height: 300px; }.hotta-tabs { gap: 24px; }.hotta-tabs a { font-size: 11px; padding: 14px 0; } }
@media (max-width: 700px) { .planet-drawing { width: 65px; height: 65px; margin: 0; opacity: .45; }.hotta-heading { gap: 5px; align-items: flex-start; }.hotta-heading .page-title { font-size: 28px; }.hotta-heading .page-description { font-size: 12px; }.hotta-tabs { gap: 22px; }.hotta-tabs a { gap: 5px; }.hotta-overview { grid-template-columns: 1fr; gap: 14px; padding-top: 15px; }.overview-intro { padding-top: 10px; }.overview-intro h2 { font-size: 21px; margin-top: 12px; }.overview-intro p { margin: 10px 0; }.overview-intro p br { display: none; }.overview-coordinate { display: none; }.category-row { gap: 16px; padding: 22px 0; }.category-row h3 { font-size: 17px; }.category-row p { font-size: 11px; }.detail-caption { font-size: 9px; }.detail-caption > span:last-child { display: none; }.hotta-detail :deep(.gallery-container__content) { max-width: 100%; }.hotta-note { font-size: 10px; } }
</style>

<style>
.hotta-drawer.custom-drawer-panel { background: var(--bg-body); box-shadow: -10px 0 40px #0001; }
.hotta-drawer.custom-drawer-panel .drawer-layout { position: relative; }
.hotta-drawer.custom-drawer-panel .drawer-close { position: absolute; top: 15px; right: 16px; z-index: 2; border: 0; background: none; color: var(--text-secondary); font-size: 23px; }
.hotta-drawer.custom-drawer-panel .search-panel__header { background: var(--bg-soft); color: var(--text-main); padding: 24px 20px; }
.hotta-drawer.custom-drawer-panel .search-panel__title { font-weight: 550; font-size: 18px; }
.hotta-drawer.custom-drawer-panel .search-panel__subtitle { color: var(--text-muted); font-size: 11px; }
.hotta-drawer.custom-drawer-panel .search-panel__input-wrapper input { background: var(--bg-body); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 5px; }
.hotta-drawer.custom-drawer-panel .search-panel__input-wrapper i { color: var(--accent); }
.hotta-drawer.custom-drawer-panel .result-item.active { background: var(--accent-soft); color: var(--accent); }
.hotta-drawer.custom-drawer-panel .query-no-results { color: var(--text-muted); text-align: center; padding: 28px 0; font-size: 12px; }
</style>
