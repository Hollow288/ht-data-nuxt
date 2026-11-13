<template>
  <div class="hotta-list-skeleton" role="status" aria-label="正在加载资料列表">
    <div v-for="n in 8" :key="n" class="skeleton-row" aria-hidden="true">
      <span class="skeleton-line skeleton-icon" />
      <div class="skeleton-lines"><span class="skeleton-line skeleton-name" :style="{ width: n % 2 ? '72%' : '56%' }" /><span class="skeleton-line skeleton-meta" /></div>
    </div>
  </div>
</template>

<style scoped>
.hotta-list-skeleton { width: 100%; max-height: 100%; overflow: hidden; }
.skeleton-row { display: flex; align-items: center; gap: 10px; height: 58px; padding: 8px 10px; }
.skeleton-line { display: block; max-width: 100%; background: var(--border-color); opacity: .65; }
.skeleton-icon { width: 28px; height: 28px; flex-shrink: 0; border-radius: 4px; }
.skeleton-lines { display: flex; flex: 1; flex-direction: column; gap: 8px; min-width: 0; }
.skeleton-name { height: 14px; }
.skeleton-meta { width: 32%; height: 10px; }
@media (prefers-reduced-motion: reduce) { .skeleton-line { animation: none; } }
</style>
