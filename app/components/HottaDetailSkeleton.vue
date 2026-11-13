<script setup lang="ts">
const props = defineProps<{ variant: 'weapons' | 'matrix' | 'artifact' | 'food' | 'recipes' }>()
const equipment = computed(() => props.variant === 'weapons' || props.variant === 'matrix')
</script>

<template>
  <div class="hotta-detail-skeleton" :class="{ 'is-equipment': equipment }" role="status" aria-label="正在加载资料">
    <div aria-hidden="true">
      <div class="skeleton-header">
        <span class="skeleton-line skeleton-image" />
        <div class="skeleton-summary">
          <span class="skeleton-line skeleton-title" />
          <div class="skeleton-meta"><span v-for="n in 3" :key="n" class="skeleton-line" /></div>
          <div v-if="equipment" class="skeleton-copy"><span v-for="width in [100, 90, 68]" :key="width" class="skeleton-line" :style="{ width: width + '%' }" /></div>
        </div>
      </div>
      <div v-for="n in equipment ? 3 : 2" :key="n" class="skeleton-section">
        <span class="skeleton-line skeleton-label" />
        <div v-if="equipment && n === 2" class="skeleton-tabs"><span v-for="tab in 3" :key="tab" class="skeleton-line" /></div>
        <div class="skeleton-copy"><span v-for="width in [100, 94, 82, 60]" :key="width" class="skeleton-line" :style="{ width: width + '%' }" /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hotta-detail-skeleton { width: 100%; min-width: 0; padding-top: 8px; }
.skeleton-line { display: block; flex-shrink: 0; height: 13px; max-width: 100%; background: var(--border-color); opacity: .65; }
.skeleton-header { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px 0 24px; border-bottom: 1px solid var(--border-color); }
.skeleton-image { width: 132px; height: 132px; border-radius: 6px; }
.skeleton-summary { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; min-width: 0; }
.skeleton-title { width: 200px; height: 28px; }
.skeleton-meta { display: flex; justify-content: center; gap: 10px; width: 100%; }
.skeleton-meta > span { width: 48px; height: 16px; }
.skeleton-section { display: flex; flex-direction: column; gap: 20px; padding: 24px 0; border-bottom: 1px solid var(--border-color); }
.skeleton-label { width: 88px; height: 19px; }
.skeleton-copy { display: flex; flex-direction: column; gap: 14px; width: 100%; }
.skeleton-tabs { display: flex; gap: 12px; }
.skeleton-tabs > span { width: 72px; height: 28px; }
.is-equipment .skeleton-header { flex-direction: row; align-items: flex-start; gap: 24px; padding: 18px 0; }
.is-equipment .skeleton-image { width: 150px; height: 150px; }
.is-equipment .skeleton-summary { flex: 1; align-items: flex-start; }
.is-equipment .skeleton-meta { justify-content: flex-start; }
@media (max-width: 700px) {
  .skeleton-image { width: 104px; height: 104px; }
  .is-equipment .skeleton-header { flex-direction: column; gap: 20px; }
  .is-equipment .skeleton-image { width: 100px; height: 100px; }
  .is-equipment .skeleton-summary { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .skeleton-line { animation: none; } }
</style>
