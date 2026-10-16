<script setup lang="ts">
import { siteNav } from '~/data/site'
import { links } from '~/data/links'
import SiteSearch from '~/components/SiteSearch.vue'
const route = useRoute()
const colorMode = useColorMode()
const searchRef = ref<InstanceType<typeof SiteSearch> | null>(null)
const githubLink = computed(() => links.find(link => link.name === 'GitHub'))
function isActive(to: string) {
  if (to === '/') return route.path === '/'
  if (to === '/blog-page') return ['/blog-page', '/markdown-page'].includes(route.path)
  if (to === '/tools') return ['/tools', '/ocr-page'].includes(route.path)
  return route.path.startsWith(to)
}
function toggleTheme() { colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark' }
</script>

<template>
  <header class="site-header">
    <div class="header-inner site-width">
      <NuxtLink to="/" class="site-brand" aria-label="Hollow’s Space 首页">
        <svg class="brand-mark" width="26" height="30" viewBox="0 0 28 32" fill="none" aria-hidden="true"><path d="M14 27V12M14 20C4 21 3 12 4 7C11 7 15 12 14 20ZM14 15C14 6 20 3 25 4C26 11 22 16 14 15Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <span>Hollow<span class="brand-light">’s Space</span><span class="brand-dot">.</span></span>
      </NuxtLink>
      <nav class="site-nav" aria-label="主导航">
        <NuxtLink v-for="item in siteNav" :key="item.to" :to="item.to" :class="{ 'is-active': isActive(item.to) }" :aria-current="isActive(item.to) ? 'page' : undefined">{{ item.label }}</NuxtLink>
      </nav>
      <div class="header-actions">
        <button class="search-trigger" aria-label="搜索本站（Ctrl K）" @click="searchRef?.open()"><i class="ri-search-line" aria-hidden="true" /><span>搜索</span><kbd>⌘ K</kbd></button>
        <span class="action-divider" />
        <button class="header-icon" aria-label="切换明暗主题" title="切换明暗主题" @click="toggleTheme">
          <ClientOnly><i :class="colorMode.value === 'dark' ? 'ri-moon-line' : 'ri-sun-line'" aria-hidden="true" /><template #fallback><i class="ri-sun-line" aria-hidden="true" /></template></ClientOnly>
        </button>
        <a v-if="githubLink" :href="githubLink.url" class="header-icon github-link" target="_blank" rel="noopener noreferrer" aria-label="访问我的 GitHub"><i class="ri-github-line" aria-hidden="true" /></a>
      </div>
    </div>
    <ClientOnly><ProgressBar /></ClientOnly>
    <SiteSearch ref="searchRef" />
  </header>
</template>

<style scoped>
.site-header { position: sticky; top: 0; z-index: 100; background: var(--bg-overlay); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border-color); }
.header-inner { display: flex; align-items: center; min-height: 78px; gap: 38px; }
.site-brand { display: flex; align-items: center; gap: 11px; white-space: nowrap; font-size: 19px; font-weight: 650; letter-spacing: -.65px; }
.brand-mark, .brand-dot { color: var(--accent); }
.brand-light { font-weight: 400; }
.brand-dot { margin-left: 2px; }
.site-nav { display: flex; align-items: stretch; gap: 28px; align-self: stretch; margin-left: auto; }
.site-nav a { display: flex; align-items: center; position: relative; color: var(--text-secondary); font-size: 13px; white-space: nowrap; }
.site-nav a:hover, .site-nav a.is-active { color: var(--accent); }
.site-nav a.is-active::after { position: absolute; content: ''; bottom: 17px; left: calc(50% - 2px); width: 4px; height: 4px; border-radius: 50%; background: var(--accent); }
.header-actions { display: flex; align-items: center; gap: 14px; }
.header-icon { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 30px; font-size: 19px; border: 0; padding: 0; background: none; color: var(--text-secondary); }
.header-icon:hover { color: var(--accent); }
.search-trigger { display: flex; align-items: center; gap: 7px; background: none; border: 0; padding: 4px 0; color: var(--text-muted); font-size: 12px; }
.search-trigger > i { font-size: 17px; }
kbd { margin-left: 3px; font-size: 10px; border: 1px solid var(--border-color); padding: 1px 4px; border-radius: 3px; }
.action-divider { height: 16px; width: 1px; background: var(--border-color); }
@media (max-width: 1000px) { .header-inner { gap: 24px; } .site-nav { gap: 22px; } .search-trigger span, kbd, .github-link { display: none; } .header-actions { gap: 12px; } }
@media (max-width: 700px) {
  .header-inner { min-height: 0; flex-wrap: wrap; justify-content: space-between; gap: 0; }
  .site-brand { font-size: 18px; min-height: 65px; }
  .brand-mark { width: 23px; }
  .site-nav { order: 3; width: 100%; margin: 0; justify-content: space-between; gap: 20px; height: 43px; }
  .site-nav a { font-size: 13px; padding-bottom: 10px; }
  .site-nav a.is-active::after { bottom: 6px; }
  .header-actions { gap: 15px; }
  .action-divider { display: none; }
}
</style>
