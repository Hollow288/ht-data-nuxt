<script setup lang="ts">
import type { EditorView } from '@codemirror/view'
import { DEFAULT_CODE, FETCH_CODE, RUN_TIMEOUT, buildSandboxDocument } from '~/utils/tools/runner'
type LogLevel = 'log' | 'info' | 'warn' | 'error'
const colorMode = useColorMode()
const code = ref(DEFAULT_CODE)
const logs = ref<{ id: number, level: LogLevel, text: string }[]>([])
const running = ref(false)
const editorContainer = ref<HTMLDivElement | null>(null)
const editorReady = ref(false)
const sandbox = ref<HTMLIFrameElement | null>(null)
const srcdoc = ref('')
const runId = ref('')
let view: EditorView | undefined
let timer: ReturnType<typeof setTimeout> | undefined
let destroyed = false
let updateTheme: (() => void) | undefined
let logId = 0
function append(level: LogLevel, text: string) { if (logs.value.length < 501) logs.value.push({ id: ++logId, level, text: text.slice(0, 20000) }) }
function stop(announce = true) {
  sandbox.value?.contentWindow?.postMessage({ kind: 'stop', runId: runId.value }, '*')
  clearTimeout(timer); timer = undefined
  runId.value = ''; srcdoc.value = ''; running.value = false
  if (announce) append('warn', '已手动停止')
}
function run() {
  if (running.value || !code.value.trim()) return
  stop(false); logs.value = []
  runId.value = crypto.randomUUID()
  running.value = true
  srcdoc.value = buildSandboxDocument(code.value, runId.value)
  timer = setTimeout(() => { stop(false); append('error', `执行超过 ${RUN_TIMEOUT / 1000} 秒，已终止。`) }, RUN_TIMEOUT)
}
function onMessage(event: MessageEvent) {
  if (event.source !== sandbox.value?.contentWindow || !runId.value) return
  const data = event.data
  if (!data || data.source !== 'hollow-js-runner' || data.runId !== runId.value) return
  if (data.kind === 'log' && ['log', 'info', 'warn', 'error'].includes(data.level) && typeof data.text === 'string') append(data.level, data.text)
  if (data.kind === 'done') stop(false)
}
function replaceCode(value: string) {
  code.value = value
  view?.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
}
watch(() => colorMode.value, () => updateTheme?.())
onMounted(async () => {
  window.addEventListener('message', onMessage)
  try {
    const [editor, language, theme, state, editorView] = await Promise.all([import('codemirror'), import('@codemirror/lang-javascript'), import('@codemirror/theme-one-dark'), import('@codemirror/state'), import('@codemirror/view')])
    if (destroyed || !editorContainer.value) return
    const compartment = new state.Compartment()
    view = new editor.EditorView({
      doc: code.value,
      extensions: [editorView.keymap.of([{ key: 'Mod-Enter', preventDefault: true, run: () => { run(); return true } }]),
        editor.basicSetup, language.javascript(), compartment.of(colorMode.value === 'dark' ? theme.oneDark : []),
        editorView.EditorView.contentAttributes.of({ 'aria-label': 'JavaScript 代码编辑器' }),
        editorView.EditorView.updateListener.of(update => { if (update.docChanged) code.value = update.state.doc.toString() }),
        editorView.EditorView.theme({ '&': { fontSize: '14px', backgroundColor: 'var(--bg-soft)' }, '.cm-content': { fontFamily: 'Consolas, monospace', padding: '12px 0' }, '.cm-scroller': { minHeight: '300px', maxHeight: '520px', overflow: 'auto' }, '.cm-gutters': { backgroundColor: 'var(--bg-soft)', borderColor: 'var(--border-color)' }, '&.cm-focused': { outline: 'none' } })],
      parent: editorContainer.value
    })
    updateTheme = () => view?.dispatch({ effects: compartment.reconfigure(colorMode.value === 'dark' ? theme.oneDark : []) })
    editorReady.value = true
  } catch { editorReady.value = false }
})
onUnmounted(() => { destroyed = true; stop(false); window.removeEventListener('message', onMessage); view?.destroy() })
</script>

<template>
  <section class="tool-panel"><div class="panel-heading"><h2>代码</h2><div class="tool-actions"><button class="tool-button" :disabled="running" @click="replaceCode(DEFAULT_CODE)">示例</button><button class="tool-button" :disabled="running" @click="replaceCode(FETCH_CODE)">Fetch 示例</button><button class="tool-button" :disabled="running" @click="replaceCode('')">清空</button><button v-if="running" class="tool-button active" @click="stop()">停止</button><button v-else class="tool-button active" :disabled="!code.trim()" @click="run">运行</button></div></div><div ref="editorContainer" class="js-editor" :class="{ ready: editorReady }" /><textarea v-if="!editorReady" v-model="code" aria-label="JavaScript 代码编辑器" spellcheck="false" @keydown.ctrl.enter.prevent="run" @keydown.meta.enter.prevent="run" /><p class="tool-note">Ctrl / ⌘ + Enter 运行。支持 await 和 fetch，代码在独立沙箱中执行，最长运行 5 秒。</p></section>
  <section class="tool-panel"><div class="panel-heading"><h2>控制台输出</h2><div class="tool-actions"><span v-if="running" class="tool-note" role="status">运行中…</span><button class="tool-button" :disabled="!logs.length" @click="logs = []">清空输出</button></div></div><div class="js-output" role="log" aria-label="JavaScript 控制台输出"><p v-if="!logs.length" class="tool-note">运行代码后，console 输出和错误会显示在这里。</p><div v-for="entry in logs" :key="entry.id" class="log-entry" :class="entry.level"><span class="log-level">{{ entry.level }}</span><pre>{{ entry.text }}</pre></div></div><p class="tool-note">可请求允许跨域（CORS）的接口；运行代码无法访问本站页面、登录状态或存储。最多显示 500 条输出。</p></section>
  <iframe v-if="srcdoc" :key="runId" ref="sandbox" :srcdoc="srcdoc" sandbox="allow-scripts" title="JavaScript 运行沙箱" hidden aria-hidden="true" />
</template>

<style scoped>
.js-editor:focus-within { border-color: var(--accent); }
.js-editor { display: none; overflow: hidden; border: 1px solid var(--border-color); border-radius: 7px; }.js-editor.ready { display: block; }.js-output { min-height: 150px; max-height: 520px; overflow: auto; border: 1px solid var(--border-color); border-radius: 7px; background: var(--bg-soft); padding: 10px 14px; }.log-entry { display: flex; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 14px; }.log-entry:last-child { border-bottom: 0; }.log-level { flex-shrink: 0; width: 38px; color: var(--text-muted); font-size: 12px; }.log-entry pre { flex: 1; min-width: 0; margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font: 14px/1.7 Consolas, monospace; }.log-entry.error { color: #c44b4b; }.log-entry.warn { color: #b07823; }.log-entry.info { color: var(--accent); }
</style>
