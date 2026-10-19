<script setup lang="ts">
import { siteNav } from '~/data/site'
import { links } from '~/data/links'
import SiteSearch from '~/components/SiteSearch.vue'
const route = useRoute()
const colorMode = useColorMode()
const searchRef = ref<InstanceType<typeof SiteSearch> | null>(null)
const mobileMenuDialog = ref<HTMLDialogElement | null>(null)
const mobileMenuOpen = ref(false)
let mobileMenuViewport: MediaQueryList | undefined
let previousBodyOverflow: string | null = null
const githubLink = computed(() => links.find(link => link.name === 'GitHub'))
function isActive(to: string) {
  if (to === '/') return route.path === '/'
  if (to === '/blog-page') return ['/blog-page', '/markdown-page'].includes(route.path)
  if (to === '/tools') return route.path === '/tools' || route.path.startsWith('/tools/') || route.path === '/ocr-page'
  return route.path.startsWith(to)
}
function toggleTheme() { colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark' }
function resetMobileMenu() {
  mobileMenuOpen.value = false
  if (previousBodyOverflow !== null) {
    document.body.style.overflow = previousBodyOverflow
    previousBodyOverflow = null
  }
}
function closeMobileMenu() {
  mobileMenuDialog.value?.close()
  resetMobileMenu()
}
function openMobileMenu() {
  const dialog = mobileMenuDialog.value
  if (!dialog || dialog.open || !mobileMenuViewport?.matches) return
  dialog.showModal()
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  mobileMenuOpen.value = true
}
function onMenuViewportChange(event: MediaQueryListEvent) {
  if (!event.matches) closeMobileMenu()
}
watch(() => route.fullPath, closeMobileMenu)
onMounted(() => {
  mobileMenuViewport = window.matchMedia('(max-width: 700px)')
  mobileMenuViewport.addEventListener('change', onMenuViewportChange)
})
onUnmounted(() => {
  closeMobileMenu()
  mobileMenuViewport?.removeEventListener('change', onMenuViewportChange)
})
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
        <button class="header-icon theme-trigger" aria-label="切换明暗主题" title="切换明暗主题" @click="toggleTheme">
          <ClientOnly><i :class="colorMode.value === 'dark' ? 'ri-moon-line' : 'ri-sun-line'" aria-hidden="true" /><template #fallback><i class="ri-sun-line" aria-hidden="true" /></template></ClientOnly>
        </button>
        <a v-if="githubLink" :href="githubLink.url" class="header-icon github-link" target="_blank" rel="noopener noreferrer" aria-label="访问我的 GitHub"><i class="ri-github-line" aria-hidden="true" /></a>
        <button type="button" class="header-icon mobile-menu-trigger" aria-label="打开网站菜单" aria-haspopup="dialog" aria-controls="mobile-site-menu" :aria-expanded="mobileMenuOpen" @click="openMobileMenu"><i class="ri-menu-line" aria-hidden="true" /></button>
      </div>
    </div>
    <dialog id="mobile-site-menu" ref="mobileMenuDialog" class="mobile-menu-dialog" aria-labelledby="mobile-menu-title" @close="resetMobileMenu" @click="event => { if (event.target === event.currentTarget) closeMobileMenu() }">
      <div class="mobile-menu-panel">
        <div class="mobile-menu-heading">
          <h2 id="mobile-menu-title">网站导航</h2>
          <button type="button" class="header-icon" aria-label="关闭网站菜单" autofocus @click="closeMobileMenu"><i class="ri-close-line" aria-hidden="true" /></button>
        </div>
        <nav class="mobile-menu-nav" aria-label="移动端主导航">
          <NuxtLink v-for="item in siteNav" :key="item.to" :to="item.to" :class="{ 'is-active': isActive(item.to) }" :aria-current="isActive(item.to) ? 'page' : undefined" @click="closeMobileMenu">
            <i :class="item.icon" aria-hidden="true" /><span class="mobile-menu-copy"><span>{{ item.label }}</span><small>{{ item.description }}</small></span><i class="ri-arrow-right-s-line" aria-hidden="true" />
          </NuxtLink>
        </nav>
        <div class="mobile-menu-tools">
          <button type="button" class="mobile-menu-tool" aria-label="切换明暗主题" @click="toggleTheme"><ClientOnly><i :class="colorMode.value === 'dark' ? 'ri-moon-line' : 'ri-sun-line'" aria-hidden="true" /><template #fallback><i class="ri-sun-line" aria-hidden="true" /></template></ClientOnly><span>切换主题</span></button>
          <a v-if="githubLink" :href="githubLink.url" class="mobile-menu-tool" target="_blank" rel="noopener noreferrer" aria-label="访问我的 GitHub"><i class="ri-github-line" aria-hidden="true" /><span>GitHub</span><i class="ri-arrow-right-up-line" aria-hidden="true" /></a>
        </div>
      </div>
    </dialog>
    <ClientOnly><ProgressBar /></ClientOnly>
    <SiteSearch ref="searchRef" />
  </header>
</template>

<style scoped>
.site-header { position: sticky; top: 0; z-index: 100; background: var(--bg-overlay); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border-color); }
.header-inner { display: flex; align-items: center; min-height: 72px; gap: 32px; }
.site-brand { display: flex; align-items: center; gap: 10px; white-space: nowrap; font-size: 20px; font-weight: 700; letter-spacing: -.5px; }
.brand-mark, .brand-dot { color: var(--accent); }
.brand-light { font-weight: 500; }
.brand-dot { margin-left: 2px; }
.site-nav { display: flex; align-items: stretch; gap: 28px; align-self: stretch; margin-left: auto; }
.site-nav a { display: flex; align-items: center; position: relative; color: var(--text-secondary); font-size: 15px; font-weight: 500; white-space: nowrap; }
.site-nav a.is-active { font-weight: 600; }
.site-nav a:hover, .site-nav a.is-active { color: var(--accent); }
.site-nav a.is-active::after { position: absolute; content: ''; bottom: 0; left: 0; right: 0; height: 2px; border-radius: 2px; background: var(--accent); }
.header-actions { display: flex; align-items: center; gap: 14px; }
.header-icon { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 40px; font-size: 21px; border: 0; border-radius: 8px; padding: 0; background: none; color: var(--text-secondary); }
.header-icon:hover { color: var(--accent); }
.search-trigger { display: flex; align-items: center; gap: 9px; background: var(--bg-soft); border: 1px solid var(--border-color); border-radius: 8px; padding: 6px 12px; color: var(--text-secondary); font-size: 14px; }
.search-trigger > i { font-size: 17px; }
kbd { margin-left: 3px; font-size: 12px; border: 1px solid var(--border-color); padding: 1px 4px; border-radius: 3px; }
.action-divider { height: 16px; width: 1px; background: var(--border-color); }
.mobile-menu-trigger { display: none; }
.mobile-menu-dialog { position: fixed; inset: 0 0 0 auto; width: min(360px, 88vw); height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 0; overflow: hidden; border: 0; border-left: 1px solid var(--border-color); background: var(--bg-body); color: var(--text-main); box-shadow: -10px 0 40px #0002; opacity: 0; transform: translateX(100%); transition: opacity .25s ease, transform .25s ease, display .25s allow-discrete, overlay .25s allow-discrete; }
.mobile-menu-dialog[open] { opacity: 1; transform: translateX(0); }
.mobile-menu-dialog::backdrop { background: #0006; backdrop-filter: blur(2px); }
@starting-style { .mobile-menu-dialog[open] { opacity: 0; transform: translateX(100%); } }
.mobile-menu-panel { display: flex; flex-direction: column; height: 100%; }
.mobile-menu-heading { display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 12px; padding: max(18px, env(safe-area-inset-top, 0px)) 20px 18px; border-bottom: 1px solid var(--border-color); }
.mobile-menu-heading h2 { font-size: 21px; font-weight: 600; }
.mobile-menu-heading .header-icon { flex-shrink: 0; font-size: 25px; }
.mobile-menu-nav { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 10px 20px; }
.mobile-menu-nav a { display: grid; grid-template-columns: 24px minmax(0, 1fr) 16px; align-items: center; gap: 13px; padding: 10px 8px 10px 13px; border-left: 2px solid transparent; }
.mobile-menu-nav a:hover { background: var(--bg-soft); }
.mobile-menu-nav a.is-active { border-left-color: var(--accent); color: var(--accent); }
.mobile-menu-nav a > i:first-child { color: var(--accent); font-size: 23px; }
.mobile-menu-nav a > i:last-child { color: var(--text-muted); font-size: 20px; }
.mobile-menu-copy { display: flex; flex-direction: column; gap: 1px; min-width: 0; font-size: 17px; line-height: 1.5; }
.mobile-menu-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-muted); font-size: 13px; line-height: 1.5; }
.mobile-menu-tools { display: flex; flex-shrink: 0; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; margin-inline: 20px; padding: 14px 0 max(18px, env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--border-color); }
.mobile-menu-tool { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0; border: 0; background: none; color: var(--text-secondary); font-size: 14px; }
.mobile-menu-tool > i { font-size: 20px; }
.mobile-menu-tool:hover { color: var(--accent); }
@media (max-width: 1100px) { .header-inner { gap: 24px; } .site-nav { gap: 22px; } .search-trigger span, kbd, .github-link { display: none; } .header-actions { gap: 8px; } .search-trigger { justify-content: center; width: 38px; height: 40px; padding: 0; } }
@media (max-width: 700px) {
  .header-inner { min-height: 65px; justify-content: space-between; gap: 8px; }
  .site-brand { min-width: 0; font-size: 18px; gap: 8px; }
  .brand-mark { width: 23px; }
  .site-nav, .theme-trigger, .action-divider { display: none; }
  .header-actions { flex-shrink: 0; gap: 6px; }
  .mobile-menu-trigger { display: inline-flex; width: 40px; height: 40px; font-size: 25px; }
}
</style>
