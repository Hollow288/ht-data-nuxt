<script setup lang="ts">
import { tools, matchesToolQuery } from '~/data/tools'

useSeoMeta({ title: '小工具 · Hollow’s Space', description: '文字识别、JSON 格式化、编码转换、动态验证码与 JavaScript 运行。把日常重复的小事变简单。' })
const query = ref('')
const category = ref('全部')
const categories = ['全部', '文字与编码', '开发与安全', '日常效率']
const filteredTools = computed(() => tools.filter(tool => (category.value === '全部' || tool.category === category.value) && matchesToolQuery(tool, query.value)))
</script>

<template>
  <div class="tools-page site-width">
    <div class="catalog-controls">
      <div class="category-filters" aria-label="工具分类"><button v-for="item in categories" :key="item" type="button" :aria-pressed="category === item" :class="{ active: category === item }" @click="category = item">{{ item }}</button></div>
      <label class="tool-search"><i class="ri-search-line" aria-hidden="true" /><input v-model="query" type="search" aria-label="搜索工具" placeholder="搜索工具，如 Base64、颜色…" /></label>
    </div>
    <p class="tool-count" role="status">{{ filteredTools.length }} 个工具</p>
    <div class="tools-grid">
      <NuxtLink v-for="tool in filteredTools" :key="tool.id" :to="`/tools/${tool.id}`" class="tool-card">
        <div class="tool-card-top"><i :class="tool.icon" class="tool-icon" aria-hidden="true" /><span>{{ tool.category }}</span></div>
        <h2>{{ tool.name }}</h2><p>{{ tool.description }}</p>
        <span class="text-link">打开工具<i class="ri-arrow-right-line" aria-hidden="true" /></span>
      </NuxtLink>
    </div>
    <div v-if="!filteredTools.length" class="empty-state"><i class="ri-search-line" aria-hidden="true" /><p>没有找到相关工具，试试其他关键词。</p><button type="button" class="quiet-button" @click="query = ''; category = '全部'">查看全部工具</button></div>
  </div>
</template>

<style scoped>
.tools-page { padding-block: 12px 36px; }
.catalog-controls { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; padding: 18px 0; border-bottom: 1px solid var(--border-color); }
.category-filters { display: flex; gap: 8px; flex-wrap: wrap; }
.category-filters button { border: 0; border-radius: 6px; padding: 8px 13px; background: none; font-size: 14px; color: var(--text-secondary); }
.category-filters button:hover, .category-filters button.active { color: var(--accent); background: var(--accent-soft); }
.tool-search { display: flex; align-items: center; gap: 9px; width: 310px; max-width: 100%; padding: 9px 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-soft); color: var(--text-muted); }
.tool-search:focus-within { border-color: var(--accent); }
.tool-search input { width: 100%; min-width: 0; border: none; outline: none; box-shadow: none; background: none; color: var(--text-main); font-size: 14px; }
.tool-count { padding: 18px 0; color: var(--text-muted); font-size: 13px; }
.tools-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.tool-card { display: flex; flex-direction: column; min-width: 0; padding: 24px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-card); }
.tool-card:hover { border-color: var(--accent); background: var(--bg-soft); }
.tool-card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.tool-icon { font-size: 28px; color: var(--accent); }
.tool-card-top > span { color: var(--text-muted); font-size: 12px; }
.tool-card h2 { font-size: 19px; }
.tool-card p { margin-top: 10px; margin-bottom: 22px; color: var(--text-secondary); font-size: 15px; line-height: 1.7; }
.tool-card .text-link { margin-top: auto; }
@media (max-width: 1050px) { .tools-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 700px) { .catalog-controls { align-items: stretch; }.tool-search { width: 100%; }.tools-grid { grid-template-columns: minmax(0, 1fr); gap: 14px; }.tool-card { padding: 22px; }.category-filters { gap: 4px; }.category-filters button { padding-inline: 10px; } }
</style>
