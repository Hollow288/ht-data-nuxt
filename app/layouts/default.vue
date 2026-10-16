<script setup lang="ts">
import HeaderBar from '~/components/basic/HeaderBar.vue'
import FooterBar from '~/components/basic/FooterBar.vue'
const showBackToTop = ref(false)
function updateScroll() { showBackToTop.value = window.scrollY > 500 }
function backToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
onMounted(() => window.addEventListener('scroll', updateScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', updateScroll))
</script>

<template>
  <div class="site-layout">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <HeaderBar />
    <main id="main-content" class="site-main" tabindex="-1"><slot /></main>
    <FooterBar />
    <Transition name="back-top">
      <button v-if="showBackToTop" class="back-to-top" aria-label="回到顶部" @click="backToTop"><i class="ri-arrow-up-line" aria-hidden="true" /></button>
    </Transition>
  </div>
</template>

<style scoped>
.site-layout { min-height: 100vh; display: flex; flex-direction: column; }
.site-main { flex: 1; outline: none; }
.skip-link { position: fixed; top: -80px; left: 20px; z-index: 200; padding: 10px 18px; color: var(--bg-body); background: var(--accent); border-radius: 5px; }
.skip-link:focus { top: 14px; }
.back-to-top { position: fixed; bottom: 28px; right: 25px; width: 38px; height: 38px; z-index: 50; border: 1px solid var(--border-color); border-radius: 50%; background: var(--bg-body); color: var(--text-secondary); font-size: 19px; }
.back-to-top:hover { color: var(--accent); border-color: var(--accent); transform: translateY(-3px); }
.back-top-enter-active, .back-top-leave-active { transition: opacity .2s, transform .2s; }
.back-top-enter-from, .back-top-leave-to { opacity: 0; transform: translateY(6px); }
@media (max-width: 700px) { .back-to-top { right: 15px; bottom: 20px; } }
</style>
