<script setup lang="ts">
import { NSelect } from 'naive-ui'
import { formatJson } from '~/utils/tools/json'

const plainSample = JSON.stringify({ name: 'JSON 格式化', items: [1, true, null], note: '保留数字字符串 001 和普通文本' })
const escapedSample = JSON.stringify({
  taskType: 'ExampleInterface',
  context: JSON.stringify({
    businessCode: 'DEMO',
    items: [{ id: '001', amount: '2280.90' }],
    metadata: JSON.stringify({ source: 'demo', tags: ['中文', '嵌套 JSON'] })
  }),
  requireCallback: false
})
const input = ref(escapedSample)
const expandNested = ref(true)
const compact = ref(false)
const fileName = ref('')
const downloadName = computed(() => {
  const name = fileName.value.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/[. ]+$/g, '') || 'formatted'
  return /\.json$/i.test(name) ? name : `${name}.json`
})
const indent = ref<2 | 4 | '\t'>(2)
const indentOptions = [{ label: '2 个空格', value: 2 }, { label: '4 个空格', value: 4 }, { label: 'Tab 缩进', value: '\t' }]
const result = computed(() => {
  if (!input.value.trim()) return { text: '', expandedCount: 0, error: '' }
  try {
    return { ...formatJson(input.value, { expandNested: expandNested.value, compact: compact.value, indent: indent.value }), error: '' }
  } catch (error) {
    return { text: '', expandedCount: 0, error: error instanceof Error ? error.message : '格式化失败，请检查 JSON。' }
  }
})
const { labels, copy } = useToolClipboard()

function exportResult() {
  if (!result.value.text) return
  const url = URL.createObjectURL(new Blob([result.value.text], { type: 'application/json;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = downloadName.value
  try {
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
</script>

<template>
  <section class="tool-panel">
    <div class="panel-heading"><h2>格式选项</h2><span class="privacy-note"><i class="ri-shield-check-line" aria-hidden="true" /> 仅在浏览器本地处理</span></div>
    <div class="mode-buttons">
      <button type="button" class="tool-button" :class="{ active: !compact }" :aria-pressed="!compact" @click="compact = false">格式化</button>
      <button type="button" class="tool-button" :class="{ active: compact }" :aria-pressed="compact" @click="compact = true">压缩</button>
      <NSelect v-model:value="indent" class="indent-select" :options="indentOptions" :disabled="compact" aria-label="JSON 缩进" :theme-overrides="{ peers: { InternalSelection: { heightMedium: '36px', fontSizeMedium: '14px' } } }" />
      <label class="expand-option"><input v-model="expandNested" type="checkbox" /> 递归展开 JSON 字符串</label>
    </div>
    <p class="tool-note">自动识别 context 等字段中转义的对象或数组，也支持整段被多次转义的 JSON。普通文本、数字字符串保持原样。</p>
    <p v-if="expandNested" class="tool-note type-note">展开后，JSON 字符串会变成对象或数组。需要保留接口原始字段类型时，请关闭此选项。</p>
  </section>

  <div class="json-editors">
    <section class="tool-panel">
      <div class="panel-heading">
        <h2>输入 JSON</h2>
        <div class="tool-actions">
          <button type="button" class="tool-button" @click="input = plainSample">普通示例</button>
          <button type="button" class="tool-button" @click="input = escapedSample">转义示例</button>
          <button type="button" class="tool-button" @click="input = ''">清空</button>
        </div>
      </div>
      <textarea v-model="input" aria-label="待格式化的 JSON" :aria-invalid="!!result.error" :aria-describedby="result.error ? 'json-error' : undefined" placeholder="粘贴 JSON 或包含转义 JSON 字符串的内容，自动格式化" spellcheck="false" autocapitalize="off" autocomplete="off" />
      <p class="tool-note">{{ input.length.toLocaleString() }} 个字符</p>
    </section>

    <section class="tool-panel">
      <div class="panel-heading"><h2>{{ compact ? '压缩结果' : '格式化结果' }}</h2><button type="button" class="tool-button" :disabled="!result.text" @click="copy(result.text)">{{ labels.default || '复制结果' }}</button></div>
      <p v-if="result.error" id="json-error" class="tool-error" role="alert">{{ result.error }}</p>
      <textarea :value="result.text" aria-label="JSON 格式化结果" readonly spellcheck="false" placeholder="格式化结果显示在这里" />
      <p class="tool-note" role="status">{{ result.text ? `${result.text.length.toLocaleString()} 个字符 · ${result.text.split('\n').length.toLocaleString()} 行 · 已展开 ${result.expandedCount} 层 JSON 字符串` : '等待有效的 JSON 输入' }}</p>
      <div class="json-export">
        <label for="json-export-filename" class="field-label">导出文件名（可选）</label>
        <div class="export-controls">
          <input id="json-export-filename" v-model="fileName" class="tool-input" type="text" placeholder="留空时使用 formatted.json" maxlength="120" spellcheck="false" autocomplete="off" aria-describedby="json-export-hint" />
          <button type="button" class="tool-button" :disabled="!result.text" @click="exportResult">导出 JSON</button>
        </div>
        <p id="json-export-hint" class="tool-note">自动补全 .json 后缀，导出内容与当前结果一致。</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.indent-select { width: 132px; flex: 0 0 132px; }
.expand-option { display: inline-flex; align-items: center; gap: 8px; margin-left: 8px; color: var(--text-secondary); font-size: 14px; cursor: pointer; }
.expand-option input { width: 16px; height: 16px; margin: 0; accent-color: var(--accent); }
.privacy-note { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; }
.tool-panel .type-note { margin-top: 4px; }
.json-editors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.json-editors .tool-panel { display: flex; flex-direction: column; }
.json-editors .panel-heading { min-height: 36px; }
.json-editors .tool-panel textarea { flex: 1; min-height: 480px; tab-size: 4; white-space: pre; overflow: auto; }
.json-editors .tool-error { margin: 0 0 12px; }
.json-export { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color); }
.export-controls { display: flex; align-items: center; gap: 8px; }
.export-controls .tool-input { flex: 1; }
.export-controls .tool-button { align-self: stretch; flex-shrink: 0; }
@media (max-width: 1000px) { .json-editors { grid-template-columns: minmax(0, 1fr); gap: 0; }.json-editors .tool-panel textarea { min-height: 320px; } }
@media (max-width: 700px) { .expand-option { width: 100%; margin: 6px 0 0; }.json-editors .tool-panel textarea { min-height: 280px; } }
</style>
