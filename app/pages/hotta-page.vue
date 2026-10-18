<script setup lang="ts">
import { hottaCategories } from '~/data/site'
const route = useRoute()
const activeCategory = computed(() => hottaCategories.find(item => route.path === '/hotta-page/' + item.slug))
const categoryMenuOpen = ref(false)
const categoryMenuButton = ref<HTMLButtonElement | null>(null)
watch(() => route.path, () => { categoryMenuOpen.value = false })
function closeCategoryMenu() {
  categoryMenuOpen.value = false
  categoryMenuButton.value?.focus()
}
useSeoMeta({ title: () => (activeCategory.value ? activeCategory.value.name + '查询' : '幻塔查询') + ' · Hollow’s Space', description: '艾达星探索手册。查阅幻塔武器、意志、源器、食物与食谱资料。' })
</script>

<template>
  <div class="hotta-page site-width">
    <div class="hotta-layout">
      <aside class="hotta-navigation">
        <button ref="categoryMenuButton" class="category-menu-toggle" type="button" aria-controls="hotta-category-nav" :aria-expanded="categoryMenuOpen" @click="categoryMenuOpen = !categoryMenuOpen">
          <i :class="activeCategory?.icon ?? 'ri-compass-3-line'" aria-hidden="true" /><span>{{ activeCategory?.name ?? '资料分类' }}</span><span class="category-menu-hint">切换分类</span><i :class="categoryMenuOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'" aria-hidden="true" />
        </button>
        <nav id="hotta-category-nav" class="hotta-category-nav" :class="{ 'is-open': categoryMenuOpen }" aria-label="幻塔资料分类" @keydown.esc.prevent="closeCategoryMenu">
          <NuxtLink v-for="item in hottaCategories" :key="item.slug" :to="'/hotta-page/' + item.slug" :class="{ active: activeCategory?.slug === item.slug }" :aria-current="activeCategory?.slug === item.slug ? 'page' : undefined" @click="categoryMenuOpen = false"><i :class="item.icon" aria-hidden="true" /><span class="category-nav-copy"><span>{{ item.name }}</span><small>{{ item.english }}</small></span></NuxtLink>
        </nav>
        <a href="https://github.com/Hollow288/hotta-data-builder" class="hotta-data-project" target="_blank" rel="noopener noreferrer"><i class="ri-github-line" aria-hidden="true" /><span>数据项目</span><i class="ri-arrow-right-up-line" aria-hidden="true" /></a>
      </aside>
      <div class="hotta-content">
        <section v-if="!activeCategory" class="hotta-overview" aria-label="选择查询分类">
          <div class="overview-intro"><h2>资料分类</h2><p>选择一个分类，查阅武器、意志、源器与烹饪资料。</p></div>
          <div class="category-list"><NuxtLink v-for="(item, index) in hottaCategories" :key="item.slug" :to="'/hotta-page/' + item.slug" class="category-row"><span class="category-number">0{{ index + 1 }}</span><i :class="item.icon" class="category-icon" aria-hidden="true" /><div><h3>{{ item.name }}<span>{{ item.english }}</span></h3><p>{{ item.description }}</p></div><i class="ri-arrow-right-line category-arrow" aria-hidden="true" /></NuxtLink></div>
        </section>
        <section v-else class="hotta-detail" :aria-label="activeCategory.name + '查询'">
          <div class="detail-caption">{{ activeCategory.name }}档案</div>
          <NuxtErrorBoundary :key="activeCategory.slug"><NuxtPage /><template #error="{ clearError }"><div class="empty-state" role="status"><i class="ri-planet-line" aria-hidden="true" /><p>这份探索资料暂时无法读取。</p><small>请稍后重试，或换个分类继续看看。</small><button class="secondary-button" @click="clearError"><i class="ri-refresh-line" aria-hidden="true" />重新加载</button></div></template></NuxtErrorBoundary>
        </section>
        <div class="hotta-note"><i class="ri-information-line" aria-hidden="true" />资料仅供探索与参考，游戏内容请以实际版本为准。</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hotta-page { padding-top: 24px; }
.hotta-layout { display: grid; grid-template-columns: 208px minmax(0, 1fr); align-items: start; gap: 36px; }
.hotta-navigation { position: sticky; top: var(--sticky-top); display: flex; flex-direction: column; min-height: 0; max-height: calc(100dvh - var(--sticky-top) - 24px); padding-right: 24px; border-right: 1px solid var(--border-color); }
.category-menu-toggle { display: none; }
.hotta-category-nav { display: grid; gap: 5px; min-height: 0; overflow-y: auto; overscroll-behavior-y: contain; }
.hotta-category-nav > a { display: flex; align-items: center; gap: 12px; padding: 9px 12px; border-left: 2px solid transparent; border-radius: 0 6px 6px 0; color: var(--text-secondary); }
.hotta-category-nav > a > i { flex-shrink: 0; font-size: 22px; }
.category-nav-copy { display: flex; flex-direction: column; gap: 1px; min-width: 0; font-size: 16px; font-weight: 600; line-height: 1.5; }
.category-nav-copy small { font-size: 12px; font-weight: 400; color: var(--text-muted); letter-spacing: .03em; }
.hotta-category-nav > a:hover { color: var(--accent); background: var(--bg-soft); }
.hotta-category-nav > a.active { color: var(--accent); border-left-color: var(--accent); background: var(--accent-soft); }
.hotta-category-nav > a.active .category-nav-copy > span { font-weight: 600; }
.hotta-data-project { display: flex; flex-shrink: 0; align-items: center; gap: 9px; margin-top: 20px; padding: 18px 14px 4px; border-top: 1px solid var(--border-color); color: var(--accent); font-size: 13px; }
.hotta-data-project > i:first-child { font-size: 16px; }
.hotta-data-project > i:last-child { margin-left: auto; font-size: 14px; }
.hotta-data-project:hover { color: var(--accent-hover); }
.hotta-content { min-width: 0; }
.hotta-overview { padding-top: 8px; }
.overview-intro { padding-bottom: 20px; border-bottom: 1px solid var(--border-color); }
.overview-intro h2 { font-size: 26px; font-weight: 700; letter-spacing: -.025em; }
.overview-intro p { font-size: 16px; color: var(--text-secondary); line-height: 1.65; margin-top: 10px; }
.category-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 32px; }
.category-number { align-self: flex-start; padding-top: 6px; }
.category-row:last-child { grid-column: 1 / -1; }
.category-row { display: flex; align-items: center; gap: 15px; padding: 26px 0; border-bottom: 1px solid var(--border-color); }.category-number { font-size: 13px; color: var(--text-muted); }.category-icon { font-size: 27px; color: var(--accent); }.category-row > div { flex: 1; min-width: 0; }.category-row h3 { display: flex; align-items: baseline; flex-wrap: wrap; gap: 0 10px; font-size: 20px; font-weight: 700; }.category-row h3 span { font-size: 13px; font-weight: 400; color: var(--text-muted); }.category-row p { font-size: 15px; color: var(--text-secondary); margin-top: 6px; line-height: 1.65; }.category-arrow { color: var(--text-muted); font-size: 21px; transition: transform .2s; }.category-row:hover h3, .category-row:hover .category-arrow { color: var(--accent); }.category-row:hover .category-arrow { transform: translateX(4px); }
.detail-caption { padding: 4px 0 14px; color: var(--text-main); font-size: 16px; font-weight: 700; }
.hotta-detail { display: grid; grid-template-columns: minmax(0, 1fr) clamp(280px, 25vw, 360px); grid-template-rows: auto 1fr; column-gap: 35px; align-items: start; }
.detail-caption { grid-column: 1; grid-row: 1; }
.hotta-detail > .empty-state { grid-column: 1 / -1; }
.hotta-note { display: flex; align-items: center; gap: 7px; padding-top: 24px; font-size: 13px; color: var(--text-muted); }
.hotta-detail :deep(.page-container-wrapper) { display: contents; }
.hotta-detail :deep(.gallery-container) { grid-column: 1; grid-row: 2; width: 100%; min-width: 0; max-width: none; background: transparent; box-shadow: none; backdrop-filter: none; min-height: 500px; overflow: visible; }
.hotta-detail :deep(.sidebar.sidebar--right) { grid-column: 2; grid-row: 1 / span 2; width: 100%; min-width: 0; max-width: none; border-left: 1px solid var(--border-color); background: transparent; box-shadow: none; backdrop-filter: none; top: var(--sticky-top); height: calc(100dvh - var(--sticky-top) - 24px); padding-left: 23px; }
.hotta-detail :deep(.search-panel__header) { padding: 0 0 16px; color: var(--text-main); background: transparent; }
.hotta-detail :deep(.search-panel__subtitle) { display: block; font-size: 13px; line-height: 1.6; color: var(--text-muted); margin: 0 0 12px; }
.hotta-detail :deep(.search-panel__input-wrapper input) { border-radius: 5px; padding: 9px 35px 9px 12px; border: 1px solid var(--border-color); background: var(--bg-soft); color: var(--text-main); font-size: 15px; }
.hotta-detail :deep(.search-panel__input-wrapper i) { color: var(--accent); right: 11px; font-size: 16px; }
.hotta-detail :deep(.query-filter-trigger) { position: absolute; right: 7px; top: 50%; transform: translateY(-50%); display: grid; place-items: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 4px; background: transparent; color: var(--accent); cursor: pointer; }
.hotta-detail :deep(.search-panel__input-wrapper .query-filter-trigger > i) { position: static; transform: none; color: inherit; font-size: 18px; }
.hotta-detail :deep(.query-filter-trigger:hover), .hotta-detail :deep(.query-filter-trigger.active) { background: var(--accent-soft); }
.hotta-detail :deep(.result-item.active) { background: var(--accent-soft); color: var(--accent); border-radius: 4px; }
.hotta-detail :deep(.result-item:hover) { background: var(--bg-soft); }
.hotta-detail :deep(.result-item__avatar) { border-radius: 4px; }
.hotta-detail :deep(.result-item__title) { font-size: 15px; font-weight: 600; }.hotta-detail :deep(.result-item__meta) { font-size: 13px; color: var(--text-muted); }
.hotta-detail :deep(.query-no-results) { color: var(--text-muted); text-align: center; padding: 28px 0; font-size: 15px; }
.hotta-detail :deep(.artifact-section), .hotta-detail :deep(.food-section), .hotta-detail :deep(.recipes-section) { background: transparent; border: 0; border-bottom: 1px solid var(--border-color); border-radius: 0; padding: 18px 0; }
.hotta-detail :deep(.artifact-rank-item) { background: transparent; border: none; border-top: 1px solid var(--border-color); border-radius: 0; padding: 15px 0; }
.hotta-detail :deep(.artifact-body), .hotta-detail :deep(.recipes-body), .hotta-detail :deep(.food-body) { padding: 16px 0 0; gap: 16px; }
.hotta-detail :deep(.artifact-hero), .hotta-detail :deep(.recipes-hero), .hotta-detail :deep(.food-hero) { padding: 20px; border: 0; border-bottom: 1px solid var(--border-color); border-radius: 0; background: transparent; box-shadow: none; }
.hotta-detail :deep(.artifact-hero__icon), .hotta-detail :deep(.recipes-hero__icon), .hotta-detail :deep(.food-hero__icon) { background: transparent; border-radius: 0; box-shadow: none; }
.hotta-detail :deep(.artifact-hero__name), .hotta-detail :deep(.recipes-hero__name), .hotta-detail :deep(.food-hero__name), .hotta-detail :deep(.gallery-container .name) { font-weight: 700; font-size: 26px; line-height: 1.35; }
.hotta-detail :deep(.gallery-container .description), .hotta-detail :deep(.gallery-container .desc) { color: var(--text-secondary); }
.hotta-detail :deep(.gallery-container__row) { min-width: 0; padding: 18px 0; margin-bottom: 16px; border: 0; border-bottom: 1px solid var(--border-color); border-radius: 0; background: transparent; line-height: 1.7; }
.hotta-detail :deep(.gallery-container__row > *) { min-width: 0; }
.hotta-detail :deep(.gallery-container__suit) { padding: 16px 0; margin-top: 16px; border: 0; border-radius: 0; }
.hotta-detail :deep(.gallery-container__suit__details) { padding: 16px 0; }
.hotta-detail :deep(.gallery-container__left), .hotta-detail :deep(.gallery-container__right) { padding: 16px; line-height: 1.7; }
.hotta-detail :deep(.matrix-summary) { padding: 8px 0 24px; border: 0; border-bottom: 1px solid var(--border-color); border-radius: 0; background: transparent; box-shadow: none; }
.hotta-detail :deep(.artifact-section__label), .hotta-detail :deep(.food-section__label), .hotta-detail :deep(.recipes-section__label) { font-weight: 700; font-size: 16px; letter-spacing: 0; }
.hotta-detail :deep(.artifact-section__content), .hotta-detail :deep(.food-section__content), .hotta-detail :deep(.recipes-section__content) { font-size: 16px; line-height: 1.7; }
.hotta-detail :deep(.ingredient-item) { background: transparent; box-shadow: none; border-radius: 0; }
.hotta-detail :deep(.item-image) { background: transparent; border: 0; border-radius: 0; }
.hotta-detail :deep(.toc-toggle-btn) { color: var(--accent); border-radius: 50%; width: 44px; height: 44px; min-width: 44px; min-height: 44px; box-shadow: none; border: 1px solid var(--border-color); background: var(--bg-body); }
@media (max-width: 1150px) {
  .hotta-layout { grid-template-columns: 184px minmax(0, 1fr); gap: 28px; }
  .hotta-navigation { padding-right: 18px; }
  .hotta-detail { grid-template-columns: minmax(0, 1fr); }
  .hotta-detail :deep(.pc-sidebar) { display: none; }
  .hotta-detail :deep(.toc-toggle-btn) { display: grid; place-items: center; }
}
@media (max-width: 1000px) { .category-list { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 850px) { .hotta-detail :deep(.page-container-wrapper) { width: 100%; }.hotta-detail :deep(.gallery-container) { width: 100%; min-height: 300px; } }
@media (max-width: 700px) {
  .hotta-page { padding-top: 20px; }
  .hotta-layout { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .hotta-navigation { top: var(--header-height); z-index: 10; max-height: calc(100dvh - var(--header-height) - 16px); padding: 0; border-right: 0; background: var(--bg-body); }
  .category-menu-toggle { display: flex; flex-shrink: 0; align-items: center; gap: 10px; width: 100%; padding: 0 0 14px; border: 0; border-bottom: 1px solid var(--border-color); background: transparent; text-align: left; color: var(--text-main); font-size: 16px; }
  .category-menu-toggle > i { font-size: 21px; color: var(--accent); }
  .category-menu-hint { margin-left: auto; color: var(--text-muted); font-size: 14px; }
  .hotta-category-nav { display: none; margin-top: 12px; }
  .hotta-category-nav.is-open { display: grid; }
  .hotta-category-nav > a { padding-block: 9px; }
  .hotta-data-project { margin-top: 0; padding: 12px 0; border-top: 0; }
  .hotta-overview { padding-top: 0; }
  .overview-intro { padding-bottom: 20px; }
  .overview-intro h2 { font-size: 23px; }
  .overview-intro p { font-size: 15px; }
  .category-row { gap: 14px; padding: 24px 0; }.category-row h3 { font-size: 18px; }.category-row p { font-size: 14px; }
  .detail-caption { padding-top: 0; font-size: 16px; }
  .hotta-detail :deep(.gallery-container__row), .hotta-detail :deep(.artifact-section), .hotta-detail :deep(.food-section), .hotta-detail :deep(.recipes-section) { padding: 16px 0; }
  .hotta-detail :deep(.gallery-container__content) { max-width: 100%; }
  .hotta-detail :deep(.gallery-container .name) { font-size: 23px; }
  .hotta-note { align-items: flex-start; font-size: 13px; }.hotta-note > i { flex-shrink: 0; }
}
@media (max-width: 480px) {
  .hotta-detail :deep(.gallery-container__row:first-child) { flex-direction: column; gap: 14px; }
  .hotta-detail :deep(.gallery-container__row:first-child > *) { width: 100%; }
  .hotta-detail :deep(.gallery-card__image) { width: 100px; }
}
</style>

<style>
.hotta-drawer.custom-drawer-panel { background: var(--bg-body); box-shadow: -10px 0 40px #0001; }
.hotta-drawer.custom-drawer-panel .drawer-layout { position: relative; }
.hotta-drawer.custom-drawer-panel .drawer-close { position: absolute; top: 15px; right: 16px; z-index: 2; border: 0; background: none; color: var(--text-secondary); font-size: 23px; }
.hotta-drawer.custom-drawer-panel .search-panel__header { background: var(--bg-soft); color: var(--text-main); padding: 24px 20px; }
.hotta-drawer.custom-drawer-panel .search-panel__subtitle { color: var(--text-muted); font-size: 14px; }
.hotta-drawer.custom-drawer-panel .search-panel__input-wrapper input { background: var(--bg-body); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 5px; }
.hotta-drawer.custom-drawer-panel .search-panel__input-wrapper i { color: var(--accent); }
.hotta-drawer.custom-drawer-panel .query-filter-trigger { position: absolute; right: 7px; top: 50%; transform: translateY(-50%); display: grid; place-items: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 4px; background: transparent; color: var(--accent); cursor: pointer; }
.hotta-drawer.custom-drawer-panel .search-panel__input-wrapper .query-filter-trigger > i { position: static; transform: none; color: inherit; font-size: 18px; }
.hotta-drawer.custom-drawer-panel .query-filter-trigger:hover, .hotta-drawer.custom-drawer-panel .query-filter-trigger.active { background: var(--accent-soft); }
.hotta-drawer.custom-drawer-panel .result-item.active { background: var(--accent-soft); color: var(--accent); }
.hotta-drawer.custom-drawer-panel .query-no-results { color: var(--text-muted); text-align: center; padding: 28px 0; font-size: 15px; }
</style>
