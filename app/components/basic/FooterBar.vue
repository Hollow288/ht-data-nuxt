<script setup lang="ts">
import { links } from '~/data/links'
const year = new Date().getFullYear()
const githubLink = computed(() => links.find(link => link.name === 'GitHub'))
</script>
<template>
  <footer class="site-footer site-width">
    <div class="footer-top">
      <NuxtLink to="/" class="footer-name">Hollow’s Space<span>.</span></NuxtLink>
      <a v-if="githubLink" :href="githubLink.url" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="ri-github-line" aria-hidden="true" /></a>
    </div>
    <div class="footer-bottom"><span>© {{ year }} Hollow</span></div>
  </footer>
</template>
<style scoped>
.site-footer { margin-top: 48px; padding: 24px 0 20px; border-top: 1px solid var(--border-color); color: var(--text-muted); font-size: 13px; }
.footer-top { display: flex; align-items: center; gap: 24px; }
.footer-name { color: var(--text-main); font-size: 16px; font-weight: 600; letter-spacing: -.3px; }
.footer-name span { color: var(--accent); }
.footer-top > a:last-child { margin-left: auto; font-size: 19px; }
.footer-top a:hover { color: var(--accent); }
.footer-bottom { display: flex; justify-content: space-between; margin-top: 18px; }
@media (max-width: 700px) { .site-footer { margin-top: 32px; } .footer-top { flex-wrap: wrap; gap: 8px 16px; } }
</style>
