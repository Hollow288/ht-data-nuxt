<script setup lang="ts">
import type { BlogItem } from '~/types/blog'
defineProps<{ articles: BlogItem[]; compact?: boolean }>()
function dateLabel(date: string) { return date?.slice(0, 10).replaceAll('-', '.') ?? '' }
function tags(value: string) { return (value ?? '').split(',').map(item => item.trim()).filter(Boolean) }
</script>

<template>
  <div class="article-list" :class="{ compact }">
    <NuxtLink v-for="article in articles" :key="article.blogId" :to="{ path: '/markdown-page', query: { articleId: article.blogId } }" class="article-row">
      <time :datetime="article.createdAt" class="article-date">{{ dateLabel(article.createdAt) }}</time>
      <div class="article-copy">
        <h3>{{ article.title }}</h3>
        <p v-if="article.summary && !compact">{{ article.summary }}</p>
        <div v-if="tags(article.tags).length" class="article-tags"><span v-for="tag in tags(article.tags)" :key="tag"># {{ tag }}</span></div>
      </div>
      <i class="ri-arrow-right-up-line article-arrow" aria-hidden="true" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.article-row { display: flex; align-items: baseline; gap: 28px; padding: 26px 0; border-bottom: 1px solid var(--border-color); }
.article-date { flex: 0 0 88px; font-size: 11px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
.article-copy { flex: 1; min-width: 0; }
.article-copy h3 { font-size: 17px; font-weight: 550; letter-spacing: -.02em; line-height: 1.6; transition: color .2s; overflow-wrap: anywhere; }
.article-copy p { margin-top: 10px; color: var(--text-secondary); font-size: 13px; line-height: 1.9; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.article-tags { display: flex; flex-wrap: wrap; gap: 7px 14px; margin-top: 11px; color: var(--text-muted); font-size: 11px; }
.article-arrow { color: var(--text-muted); font-size: 19px; transition: color .2s, transform .2s; }
.article-row:hover h3, .article-row:hover .article-arrow { color: var(--accent); }
.article-row:hover .article-arrow { transform: translate(2px, -2px); }
.compact .article-row { padding: 21px 0; gap: 22px; }
.compact .article-copy h3 { font-size: 14px; }
.compact .article-tags { margin-top: 5px; font-size: 10px; }
@media (max-width: 700px) { .article-row { flex-wrap: wrap; gap: 8px 14px; } .article-date { flex-basis: 100%; } .article-copy h3 { font-size: 16px; } .compact .article-row { gap: 7px 14px; } }
</style>
