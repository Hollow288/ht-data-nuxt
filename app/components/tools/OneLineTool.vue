<script setup lang="ts">
import { toOneLine } from '~/utils/tools/text'
const sample = '第一行示例文本。\n第二行包含\t制表符和   多余空格。\n第三行用于测试换行压缩。'
const input = ref(sample)
const output = computed(() => toOneLine(input.value))
const { labels, copy } = useToolClipboard()
</script>

<template>
  <section class="tool-panel"><div class="panel-heading"><h2>输入文本</h2><div class="tool-actions"><button type="button" class="tool-button" @click="input = sample">示例</button><button type="button" class="tool-button" @click="input = ''">清空</button></div></div><textarea v-model="input" aria-label="输入多行文本" placeholder="粘贴任意多行文本，自动合并为一行" spellcheck="false" /></section>
  <section class="tool-panel"><div class="panel-heading"><h2>压缩结果</h2><button type="button" class="tool-button" :disabled="!output" @click="copy(output)">{{ labels.default || '复制结果' }}</button></div><textarea :value="output" aria-label="压缩结果" readonly placeholder="压缩结果显示在这里" /><p class="tool-note">{{ input.length }} 个字符 → {{ output.length }} 个字符</p></section>
</template>
