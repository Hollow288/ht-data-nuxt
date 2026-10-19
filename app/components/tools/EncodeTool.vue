<script setup lang="ts">
import { NSelect } from 'naive-ui'
import { unicodeEncode, unicodeDecode } from '~/utils/tools/text'
type Mode = 'url' | 'unicode'
type Direction = 'encode' | 'decode'
const mode = ref<Mode>('url')
const direction = ref<Direction>('encode')
const directionOptions = [
  { label: '编码', value: 'encode' },
  { label: '解码', value: 'decode' }
]
const samples = { url: { encode: 'https://example.com/搜索?q=你好 世界&lang=zh', decode: 'https%3A%2F%2Fexample.com%2F%E6%90%9C%E7%B4%A2%3Fq%3D%E4%BD%A0%E5%A5%BD%20%E4%B8%96%E7%95%8C%26lang%3Dzh' }, unicode: { encode: '你好世界 Hello! 🌍', decode: '\\u4f60\\u597d\\u4e16\\u754c Hello! \\u{1f30d}' } }
const input = ref(samples.url.encode)
const result = computed(() => {
  try {
    const convert = mode.value === 'url' ? (direction.value === 'encode' ? encodeURIComponent : decodeURIComponent) : (direction.value === 'encode' ? unicodeEncode : unicodeDecode)
    return { text: convert(input.value), error: '' }
  } catch { return { text: '', error: '转换失败，请检查输入的编码或转义格式。' } }
})
const { labels, copy } = useToolClipboard()
function swap() {
  if (result.value.error) return
  input.value = result.value.text
  direction.value = direction.value === 'encode' ? 'decode' : 'encode'
}
</script>

<template>
  <section class="tool-panel">
    <div class="panel-heading"><h2>转换方式</h2></div>
    <div class="mode-buttons">
      <button v-for="item in (['url', 'unicode'] as const)" :key="item" class="tool-button" :class="{ active: mode === item }" :aria-pressed="mode === item" @click="mode = item">{{ item === 'url' ? 'URL' : 'Unicode' }}</button>
      <NSelect
        v-model:value="direction"
        class="direction-select"
        :options="directionOptions"
        aria-label="编码或解码"
        :theme-overrides="{ peers: { InternalSelection: { heightMedium: '36px', fontSizeMedium: '14px' } } }"
      />
      <button class="tool-button" :disabled="!!result.error" @click="swap">交换输入与结果</button>
    </div>
  </section>
  <section class="tool-panel"><div class="panel-heading"><h2>输入</h2><div class="tool-actions"><button class="tool-button" @click="input = samples[mode][direction]">示例</button><button class="tool-button" @click="input = ''">清空</button></div></div><textarea v-model="input" aria-label="待转换文本" spellcheck="false" placeholder="输入要转换的文本" /></section>
  <section class="tool-panel"><div class="panel-heading"><h2>结果</h2><button class="tool-button" :disabled="!result.text" @click="copy(result.text)">{{ labels.default || '复制结果' }}</button></div><p v-if="result.error" class="tool-error" role="alert">{{ result.error }}</p><textarea :value="result.text" aria-label="转换结果" readonly placeholder="转换结果显示在这里" /></section>
</template>

<style scoped>
.direction-select { width: 110px; flex: 0 0 110px; }
</style>
