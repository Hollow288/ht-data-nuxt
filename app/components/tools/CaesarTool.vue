<script setup lang="ts">
import { caesarShift } from '~/utils/tools/text'
const sample = 'Khoor Zruog! Wklv lv d vhfuhw phvvdjh.'
const input = ref(sample)
const filter = ref('')
const results = computed(() => input.value.trim() ? Array.from({ length: 25 }, (_, index) => ({ shift: index + 1, text: caesarShift(input.value, index + 1) })) : [])
const filtered = computed(() => results.value.filter(item => item.text.toLowerCase().includes(filter.value.trim().toLowerCase())))
const { labels, copy } = useToolClipboard()
</script>

<template>
  <section class="tool-panel"><div class="panel-heading"><h2>输入密文</h2><div class="tool-actions"><button class="tool-button" @click="input = sample">示例</button><button class="tool-button" @click="input = ''">清空</button></div></div><textarea v-model="input" aria-label="凯撒密文" placeholder="粘贴密文，自动枚举全部 25 种位移" spellcheck="false" /></section>
  <section class="tool-panel"><div class="panel-heading"><h2>全部位移结果</h2><span class="tool-note">{{ filtered.length }} / {{ results.length }} 种</span></div><input v-model="filter" type="search" class="tool-input" aria-label="过滤位移结果" placeholder="过滤结果，如 hello" /><div class="caesar-results"><button v-for="item in filtered" :key="item.shift" type="button" class="caesar-result" title="点击复制" @click="copy(item.text, String(item.shift))"><span>+{{ item.shift }} <small>{{ labels[item.shift] || '点击复制' }}</small></span><p class="mono">{{ item.text }}</p></button></div><p v-if="!filtered.length" class="tool-note">{{ input.trim() ? '没有匹配的结果，换个关键词试试。' : '输入密文后即可查看位移结果。' }}</p></section>
</template>

<style scoped>
.caesar-results { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
.caesar-result { min-width: 0; padding: 15px; border: 1px solid var(--border-color); border-radius: 7px; text-align: left; background: var(--bg-soft); }
.caesar-result:hover { border-color: var(--accent); }.caesar-result > span { display: flex; justify-content: space-between; gap: 10px; color: var(--accent); font-size: 14px; }.caesar-result small { color: var(--text-muted); }.caesar-result p { margin-top: 10px; font-size: 14px; line-height: 1.7; }
@media (max-width: 700px) { .caesar-results { grid-template-columns: minmax(0, 1fr); } }
</style>
