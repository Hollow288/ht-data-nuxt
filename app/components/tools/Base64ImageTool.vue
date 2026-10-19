<script setup lang="ts">
import { encodeText, decodeText, imageDataUrl } from '~/utils/tools/base64'
type Mode = 'base64-to-image' | 'image-to-base64' | 'text-to-base64' | 'base64-to-text'
const modes: { id: Mode, name: string }[] = [{ id: 'base64-to-image', name: 'Base64 → 图片' }, { id: 'image-to-base64', name: '图片 → Base64' }, { id: 'text-to-base64', name: '文字 → Base64' }, { id: 'base64-to-text', name: 'Base64 → 文字' }]
const mode = ref<Mode>('base64-to-image')
const values = reactive<Record<Mode, string>>({ 'base64-to-image': '', 'image-to-base64': '', 'text-to-base64': '', 'base64-to-text': '' })
const input = computed({ get: () => values[mode.value], set: value => { values[mode.value] = value } })
const output = ref('')
const preview = ref('')
const error = ref('')
const fileName = ref('')
const dragging = ref(false)
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const { labels, copy } = useToolClipboard()
let reader: FileReader | undefined
let version = 0
function invalidate() { version++; reader?.abort(); reader = undefined; loading.value = false; output.value = ''; preview.value = ''; error.value = ''; fileName.value = '' }
watch([mode, input], invalidate, { flush: 'sync' })
onUnmounted(() => { version++; reader?.abort() })
function convert() {
  output.value = ''; preview.value = ''; error.value = ''
  if (!input.value.trim()) return
  try {
    if (mode.value === 'base64-to-image') preview.value = imageDataUrl(input.value)
    else if (mode.value === 'text-to-base64') output.value = encodeText(input.value)
    else if (mode.value === 'base64-to-text') output.value = decodeText(input.value)
  } catch { error.value = '转换失败：请检查 Base64 数据，文字解码需要有效的 UTF-8 编码。' }
}
function processFile(file?: File) {
  if (!file) return
  invalidate()
  if (!file.type.startsWith('image/')) { error.value = '请选择图片文件。'; return }
  if (file.size > 50 * 1024 * 1024) { error.value = '图片大小不能超过 50 MB。'; return }
  fileName.value = file.name; loading.value = true
  const currentVersion = version
  reader = new FileReader()
  reader.onload = () => { if (currentVersion !== version) return; output.value = String(reader?.result ?? ''); preview.value = output.value; loading.value = false }
  reader.onerror = () => { if (currentVersion === version) { error.value = '图片读取失败，请重新选择。'; loading.value = false } }
  reader.readAsDataURL(file)
}
function drop(event: DragEvent) { dragging.value = false; processFile(event.dataTransfer?.files[0]) }
function clear() { input.value = ''; invalidate(); if (fileInput.value) fileInput.value.value = '' }
function sample() { input.value = mode.value === 'text-to-base64' ? '你好 Hollow 🌍' : '5L2g5aW9IEhvbGxvdyDwn4yN'; convert() }
const downloadName = computed(() => {
  const mime = preview.value.match(/^data:image\/([^;]+)/)?.[1] ?? 'png'
  const extension = ({ jpeg: 'jpg', 'svg+xml': 'svg', 'x-icon': 'ico' } as Record<string, string>)[mime] ?? mime.replace(/[^a-z0-9]/gi, '')
  return `image.${extension}`
})
</script>

<template>
  <section class="tool-panel"><div class="panel-heading"><h2>转换方式</h2></div><div class="mode-buttons"><button v-for="item in modes" :key="item.id" class="tool-button" :class="{ active: mode === item.id }" :aria-pressed="mode === item.id" @click="mode = item.id">{{ item.name }}</button></div></section>
  <section class="tool-panel"><div class="panel-heading"><h2>{{ mode === 'image-to-base64' ? '选择图片' : mode === 'text-to-base64' ? '输入文字' : '输入 Base64' }}</h2><div class="tool-actions"><button v-if="mode === 'text-to-base64' || mode === 'base64-to-text'" class="tool-button" @click="sample">示例</button><button class="tool-button" @click="clear">清空</button><button v-if="mode !== 'image-to-base64'" class="tool-button" :disabled="!input" @click="convert">{{ mode === 'base64-to-image' ? '解码预览' : mode === 'text-to-base64' ? '编码' : '解码' }}</button></div></div>
    <template v-if="mode === 'image-to-base64'"><input ref="fileInput" type="file" accept="image/*" class="file-input" aria-label="选择图片文件" @change="processFile(($event.target as HTMLInputElement).files?.[0])" /><button type="button" class="image-drop" :class="{ dragging }" @click="fileInput?.click()" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="drop"><img v-if="preview" :src="preview" alt="上传图片预览" /><i v-else class="ri-image-add-line" aria-hidden="true" /><span>{{ loading ? '正在读取图片…' : fileName || '点击选择图片，或将图片拖到这里' }}</span></button><p class="tool-note">支持常见图片格式，最大 50 MB，图片仅在浏览器中转换。</p></template>
    <textarea v-else v-model="input" :aria-label="mode === 'text-to-base64' ? '输入文字' : '输入 Base64'" spellcheck="false" :placeholder="mode === 'text-to-base64' ? '输入要转成 Base64 的文字，支持中文与 Emoji' : '支持纯 Base64 和带 data: 前缀的数据'" />
    <p v-if="error" class="tool-error" role="alert">{{ error }}</p>
  </section>
  <section class="tool-panel"><div class="panel-heading"><h2>{{ mode === 'base64-to-image' ? '图片预览' : mode === 'base64-to-text' ? '文字结果' : 'Base64 结果' }}</h2><a v-if="mode === 'base64-to-image' && preview && !error" :href="preview" :download="downloadName" class="tool-button">下载图片</a><button v-else-if="mode !== 'base64-to-image'" class="tool-button" :disabled="!output" @click="copy(output)">{{ labels.default || '复制结果' }}</button></div><template v-if="mode === 'base64-to-image'"><div v-if="preview" class="image-preview"><img :src="preview" alt="Base64 解码图片预览" @error="error = '数据不是浏览器可识别的图片，请检查格式。'; preview = ''" /></div><p v-else class="tool-note">输入 Base64 后点击「解码预览」查看图片。</p></template><textarea v-else :value="output" aria-label="转换结果" readonly placeholder="转换结果显示在这里" /></section>
</template>

<style scoped>.file-input { position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; }.image-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; width: 100%; min-height: 180px; padding: 24px; border: 2px dashed var(--border-color); border-radius: 8px; color: var(--text-secondary); background: var(--bg-soft); overflow-wrap: anywhere; }.image-drop.dragging { border-color: var(--accent); background: var(--accent-soft); }.image-drop > i { font-size: 30px; color: var(--accent); }.image-drop img { max-height: 200px; object-fit: contain; }.image-preview { text-align: center; }.image-preview img { max-height: 400px; object-fit: contain; }</style>
