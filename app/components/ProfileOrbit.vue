<script setup lang="ts">
const avatarFailed = ref(false)
</script>

<template>
  <div class="profile-orbit" aria-label="Hollow 的头像与小小星球">
    <div class="orbit-dots" aria-hidden="true" />
    <div class="orbit-ring orbit-ring-outer" aria-hidden="true" />
    <div class="orbit-ring orbit-ring-inner" aria-hidden="true" />
    <span class="orbit-star star-one" aria-hidden="true">✳</span>
    <span class="orbit-star star-two" aria-hidden="true">+</span>
    <span class="orbit-dot" aria-hidden="true" />
    <div class="portrait">
      <img v-if="!avatarFailed" src="https://avatars.githubusercontent.com/u/87030922?v=4" alt="Hollow 的头像" width="212" height="212" fetchpriority="high" @error="avatarFailed = true" />
      <span v-else class="portrait-fallback">H.</span>
    </div>
    <span class="orbit-note">a little space, a little me.</span>
    <span class="orbit-status"><span /> 永远对世界保持好奇</span>
  </div>
</template>

<style scoped>
.profile-orbit { position: relative; display: grid; place-items: center; width: 320px; aspect-ratio: 1; max-width: 100%; justify-self: center; }
.orbit-dots { position: absolute; inset: -15px; background-image: radial-gradient(var(--accent) .7px, transparent .7px); background-size: 17px 17px; opacity: .17; mask-image: radial-gradient(ellipse, #000 10%, transparent 68%); }
.orbit-ring { position: absolute; border: 1px solid var(--border-color); border-radius: 50%; }
.orbit-ring-outer { width: 87%; height: 87%; border-style: dashed; }
.orbit-ring-inner { width: 74%; height: 74%; border-color: var(--accent); opacity: .25; }
.portrait { position: relative; width: 60.5%; aspect-ratio: 1; overflow: hidden; border-radius: 50%; background: var(--accent-soft); transform: rotate(-5deg); outline: 8px solid var(--bg-body); }
.portrait img { display: block; width: 100%; height: 100%; object-fit: cover; filter: saturate(.7); transition: transform .6s, filter .6s; }
.profile-orbit:hover .portrait img { transform: scale(1.05) rotate(5deg); filter: saturate(1); }
.portrait-fallback { display: grid; place-items: center; height: 100%; font: italic 80px Georgia, serif; color: var(--accent); }
.orbit-star { position: absolute; color: var(--accent); background: var(--bg-body); line-height: 1; }
.star-one { top: 8.7%; right: 14.1%; font-size: 32px; font-weight: 300; transform: rotate(15deg); }
.star-two { bottom: 19%; left: 7.2%; font-size: 25px; color: #b3a37b; }
.orbit-dot { position: absolute; top: 22.6%; left: 9.7%; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); opacity: .55; }
.orbit-note { position: absolute; bottom: 7.7%; right: 1%; font: italic 14px Georgia, serif; color: var(--text-muted); transform: rotate(-8deg); }
.orbit-status { position: absolute; left: 50%; bottom: 17%; transform: translateX(-50%); z-index: 1; display: flex; align-items: center; gap: 8px; padding: 7px 14px; font-size: 14px; white-space: nowrap; background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 24px; color: var(--text-secondary); }
.orbit-status > span { width: 5px; height: 5px; background: var(--accent); border-radius: 50%; }
@media (max-width: 700px) {
  .profile-orbit { width: 80px; }.portrait { width: 78%; outline-width: 3px; }.portrait-fallback { font-size: 32px; }
  .orbit-ring-outer { width: 100%; height: 100%; }.orbit-ring-inner { width: 90%; height: 90%; }
  .orbit-dots, .orbit-star, .orbit-dot, .orbit-note, .orbit-status { display: none; }
}
</style>
