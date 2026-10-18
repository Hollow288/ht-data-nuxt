<script setup lang="ts">
import type { BlogItem } from '~/types/blog'
defineProps<{ articles: BlogItem[]; compact?: boolean }>()
function dateLabel(date: string) { return date?.slice(0, 10).replaceAll('-', '.') ?? '' }
function tags(value: string) { return (value ?? '').split(',').map(item => item.trim()).filter(Boolean) }
</script>

<template>
  <div class="article-list" :class="{ compact }">
    <NuxtLink v-for="article in articles" :key="article.blogId" :to="{ path: '/markdown-page', query: { articleId: article.blogId } }" class="article-row">
      <div class="article-copy">
        <h3>{{ article.title }}</h3>
        <p v-if="article.summary && !compact">{{ article.summary }}</p>
        <div class="article-meta"><time :datetime="article.createdAt" class="article-date"><i class="ri-calendar-line" aria-hidden="true" />{{ dateLabel(article.createdAt) }}</time><div v-if="tags(article.tags).length" class="article-tags"><span v-for="tag in tags(article.tags)" :key="tag">{{ tag }}</span></div></div>
      </div>
      <i class="ri-arrow-right-up-line article-arrow" aria-hidden="true" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.article-list { display: grid; gap: 12px; }
.article-row { display: flex; align-items: start; gap: 20px; padding: 22px; border-bottom: 1px solid var(--border-color); background: transparent; }
.article-copy { flex: 1; min-width: 0; }
.article-copy h3 { font-size: 20px; font-weight: 700; line-height: 1.4; overflow-wrap: anywhere; transition: color .2s; }
.article-copy > p { margin-top: 10px; color: var(--text-secondary); font-size: 16px; line-height: 1.65; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.article-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; margin-top: 14px; font-size: 13px; color: var(--text-muted); }
.article-date { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.article-date > i { font-size: 14px; }
.article-tags { display: flex; flex-wrap: wrap; gap: 12px; }
.article-tags span { padding: 2px 0; color: var(--text-secondary); font-size: 13px; line-height: 1.5; }
.article-arrow { margin-top: 3px; color: var(--text-muted); font-size: 20px; transition: color .2s, transform .2s; }
.article-row:hover h3, .article-row:hover .article-arrow { color: var(--accent); }.article-row:hover .article-arrow { transform: translate(2px, -2px); }
.compact { gap: 0; }.compact .article-row { padding: 16px 0; border: 0; border-bottom: 1px solid var(--border-color); border-radius: 0; box-shadow: none; }.compact .article-row:last-child { border-bottom: 0; padding-bottom: 0; }
.compact .article-copy h3 { font-size: 18px; font-weight: 600; }.compact .article-meta { margin-top: 8px; gap: 6px 12px; }.compact .article-tags { gap: 6px; }.compact .article-tags span { padding: 1px 6px; }
@media (max-width: 700px) { .article-row { padding: 18px; gap: 12px; }.article-copy h3 { font-size: 19px; }.article-meta { gap: 8px 12px; margin-top: 12px; }.compact .article-copy h3 { font-size: 17px; } }
</style>
