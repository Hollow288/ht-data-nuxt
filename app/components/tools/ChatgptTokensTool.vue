<script setup lang="ts">
import { NSelect } from 'naive-ui'
import { convertTokens, createTokenDemo } from '~/utils/tools/chatgpt-tokens'
import type { TokenConversion, TokenMode } from '~/utils/tools/chatgpt-tokens'

const input = ref('')
const mode = ref<TokenMode>('to-cpa')
const compatibilityClaims = ref(false)
const result = shallowRef<TokenConversion | null>(null)
const error = ref('')
const loading = ref(false)
const fileInput = ref<HTMLInputElement>()
const { labels, copy } = useToolClipboard()
const modes = [
  { label: 'CPA 凭证 JSON', value: 'to-cpa' },
  { label: 'sub2api bundle', value: 'to-sub' },
  { label: '标准化 JSONL', value: 'normalize' }
]
let fileReadId = 0
watch([input, mode, compatibilityClaims], () => { result.value = null; error.value = '' }, { flush: 'sync' })
onUnmounted(() => { fileReadId++ })

function convert() {
  error.value = ''
  result.value = null
  try { result.value = convertTokens(input.value, mode.value, { compatibilityClaims: compatibilityClaims.value }) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '转换失败，请检查输入格式。' }
}

function clear() {
  fileReadId++
  loading.value = false
  input.value = ''
  result.value = null
  error.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

function demo() { input.value = createTokenDemo(); convert() }

async function loadFile(file?: File) {
  if (!file) return
  const readId = ++fileReadId
  result.value = null
  error.value = ''
  loading.value = false
  if (fileInput.value) fileInput.value.value = ''
  if (!/\.(txt|json|jsonl)$/i.test(file.name)) { error.value = '请选择 .txt、.json 或 .jsonl 文件。'; return }
  if (file.size > 20 * 1024 * 1024) { error.value = '文件超过 20 MB，请拆分后再转换。'; return }
  loading.value = true
  try {
    const content = await file.text()
    if (readId !== fileReadId) return
    input.value = content
    convert()
  } catch { if (readId === fileReadId) error.value = '本地文件读取失败，请重试。' }
  finally { if (readId === fileReadId) loading.value = false }
}

function download() {
  if (!result.value) return
  const output = result.value.output
  const url = URL.createObjectURL(new Blob(output.parts, { type: output.mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = output.name
  try { document.body.appendChild(link); link.click() }
  finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
}
</script>

<template>
  <section class="tool-panel">
    <div class="panel-heading">
      <h2>转换选项</h2>
    </div>
    <div class="mode-buttons">
      <NSelect v-model:value="mode" class="token-mode" :options="modes" aria-label="凭证输出格式" :theme-overrides="{ peers: { InternalSelection: { heightMedium: '36px', fontSizeMedium: '14px' } } }" />
      <label class="compatibility-option"><input v-model="compatibilityClaims" type="checkbox" /> 补全兼容 id_token</label>
    </div>
    <p class="tool-note privacy-note"><i class="ri-shield-check-line" aria-hidden="true" /> 凭证仅在当前浏览器中转换，不上传或自动保存。</p>
    <p v-if="compatibilityClaims" class="tool-note compatibility-note">补全会生成或改写 id_token 中的账号字段，无法保留有效签名。仅在目标工具明确需要兼容字段时开启。</p>
    <p v-else class="tool-note">默认保留原始 id_token。格式转换不验证登录状态，也不会刷新或延长 token 的有效期。</p>
  </section>

  <div class="token-editors">
    <section class="tool-panel">
      <div class="panel-heading">
        <h2>输入凭证</h2>
        <div class="tool-actions">
          <input ref="fileInput" type="file" accept=".txt,.json,.jsonl,application/json,text/plain" class="file-input" aria-label="选择本地凭证文件" @change="loadFile(($event.target as HTMLInputElement).files?.[0])" />
          <button type="button" class="tool-button" :disabled="loading" @click="fileInput?.click()">{{ loading ? '读取中…' : '读取文件' }}</button>
          <button type="button" class="tool-button" :disabled="loading" @click="demo">虚构示例</button>
          <button type="button" class="tool-button" @click="clear">清空</button>
        </div>
      </div>
      <textarea v-model="input" aria-label="ChatGPT 或 Codex 凭证输入" :aria-invalid="!!error" :aria-describedby="error ? 'token-convert-error' : undefined" placeholder="粘贴 ChatGPT Web session、Codex auth.json、CPA 凭证、sub2api bundle 或 JSONL…" spellcheck="false" autocomplete="off" autocapitalize="off" />
      <div class="input-footer"><span class="tool-note">{{ input.length.toLocaleString() }} 个字符 · 支持 JSON / JSONL，文件最大 20 MB</span><button type="button" class="tool-button active" :disabled="!input.trim() || loading" @click="convert">转换</button></div>
      <p v-if="error" id="token-convert-error" class="tool-error" role="alert">{{ error }}</p>
    </section>

    <section class="tool-panel">
      <div class="panel-heading">
        <h2>转换结果</h2>
        <div class="tool-actions">
          <button type="button" class="tool-button" :disabled="!result" @click="copy(result!.output.text)">{{ labels.default || (result?.output.mime === 'application/x-tar' ? '复制文件列表' : '复制结果') }}</button>
          <button type="button" class="tool-button" :disabled="!result" @click="download">下载结果</button>
        </div>
      </div>
      <div class="conversion-stats" role="status">
        <span>{{ result?.shape || '等待转换' }}</span><span>{{ result?.count || 0 }} 个账号</span><span v-if="result?.backfilled">{{ result.backfilled }} 条兼容补全</span>
      </div>
      <textarea :value="result?.output.text || ''" aria-label="凭证转换结果" readonly spellcheck="false" placeholder="转换结果显示在这里；CPA 多账号模式显示 tar 内的文件列表" />
      <p class="tool-note result-summary" role="status">{{ result?.output.summary || '修改输入或转换选项后，请重新点击转换。' }}</p>
      <ul v-if="result?.warnings.length" class="conversion-warnings"><li v-for="warning in result.warnings" :key="warning">{{ warning }}</li></ul>
    </section>
  </div>
</template>

<style scoped>
.token-mode { width: 218px; flex: 0 0 218px; }
.compatibility-option { display: inline-flex; align-items: center; gap: 8px; margin-left: 8px; color: var(--text-secondary); font-size: 14px; cursor: pointer; }
.compatibility-option input { width: 16px; height: 16px; margin: 0; accent-color: var(--accent); }
.privacy-note { display: flex; align-items: baseline; gap: 6px; }
.tool-panel .compatibility-note { color: #ac7130; }
.tool-panel .tool-button { gap: 6px; }
.token-editors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.token-editors .tool-panel { display: flex; flex-direction: column; }
.token-editors .panel-heading { min-height: 36px; }
.token-editors .tool-panel textarea { flex: 1; min-height: 420px; white-space: pre; overflow: auto; }
.file-input { display: none; }
.input-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
.input-footer .tool-note { margin: 0; }
.input-footer .tool-button { flex-shrink: 0; white-space: nowrap; }
.conversion-stats { display: flex; flex-wrap: wrap; gap: 6px 16px; min-height: 28px; margin-bottom: 10px; color: var(--text-muted); font-size: 13px; }
.conversion-warnings { padding-left: 20px; margin: 12px 0 0; color: var(--text-secondary); font-size: 13px; line-height: 1.8; overflow-wrap: anywhere; }
.result-summary { overflow-wrap: anywhere; }
@media (max-width: 1000px) { .token-editors { grid-template-columns: minmax(0, 1fr); gap: 0; }.token-editors .tool-panel textarea { min-height: 320px; } }
@media (max-width: 700px) { .compatibility-option { margin: 6px 0 0; width: 100%; }.token-editors .tool-panel textarea { min-height: 280px; }.input-footer { align-items: flex-start; } }
</style>
