<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { NButton, NRadio, NRadioGroup, NSlider, NSpin, NTag, NEmpty } from 'naive-ui'
import { BaseAPI } from '~/utils/api'
import type { OcrMode, OcrStatus, OcrSubmitRes, OcrResultRes, OcrTask } from '~/types/ocr'

const ACCEPT_EXT = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'heic', 'heif', 'pdf']
const MAX_FILE_SIZE = 50 * 1024 * 1024
const POLL_INTERVAL = 1500
const MAX_POLLS = 240

const file = ref<File | null>(null)
const previewUrl = ref<string>('')
const mode = ref<OcrMode>('detail')
const minConfidence = ref<number>(0)
const isDragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const submitting = ref(false)
const polling = ref(false)
const task = ref<OcrTask | null>(null)
const errorMsg = ref<string>('')
const copied = ref(false)

let pollTimer: ReturnType<typeof setTimeout> | null = null
let pollCount = 0

const isImageFile = computed(() => {
  if (!file.value) return false
  return file.value.type.startsWith('image/')
})

const fileSizeText = computed(() => {
  if (!file.value) return ''
  const size = file.value.size
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
})

const statusLabel = computed<Record<OcrStatus, string>>(() => ({
  PENDING: '排队中',
  PROCESSING: '识别中',
  SUCCESS: '完成',
  FAILED: '失败'
}))

const statusType = computed<Record<OcrStatus, 'default' | 'info' | 'success' | 'error'>>(() => ({
  PENDING: 'info',
  PROCESSING: 'info',
  SUCCESS: 'success',
  FAILED: 'error'
}))

const isWorking = computed(() => submitting.value || polling.value)

function pickFile() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const f = target.files?.[0]
  if (f) setFile(f)
  target.value = ''
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) setFile(f)
}

function setFile(f: File) {
  errorMsg.value = ''
  const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ACCEPT_EXT.includes(ext)) {
    errorMsg.value = `不支持的文件类型，仅支持 ${ACCEPT_EXT.join(' / ').toUpperCase()}`
    return
  }
  if (f.size > MAX_FILE_SIZE) {
    errorMsg.value = '文件不能超过 50MB'
    return
  }
  file.value = f
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = f.type.startsWith('image/') ? URL.createObjectURL(f) : ''
  resetTask()
}

function clearFile() {
  file.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  resetTask()
}

function resetTask() {
  stopPolling()
  task.value = null
  errorMsg.value = ''
  copied.value = false
}

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
  polling.value = false
  pollCount = 0
}

async function handleSubmit() {
  if (!file.value || isWorking.value) return
  resetTask()
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('file', file.value)
    const params = new URLSearchParams()
    params.set('mode', mode.value)
    if (minConfidence.value > 0) {
      params.set('minConfidence', String(minConfidence.value))
    }
    const url = `ocr/submit?${params.toString()}`
    const res = await BaseAPI.apiPost<OcrSubmitRes>(url, formData)
    if (res.code !== 200) {
      errorMsg.value = res.msg || '提交失败'
      return
    }
    task.value = res.data
    pollResult(res.data.taskId)
  } catch (err: any) {
    errorMsg.value = err?.data?.msg || err?.message || '提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

async function pollResult(taskId: string) {
  polling.value = true
  pollCount = 0
  const tick = async () => {
    pollCount++
    try {
      const res = await BaseAPI.apiGet<OcrResultRes>(`ocr/result/${taskId}`)
      if (res.code !== 200) {
        errorMsg.value = res.msg || '查询任务失败'
        stopPolling()
        return
      }
      task.value = res.data
      if (res.data.status === 'SUCCESS' || res.data.status === 'FAILED') {
        stopPolling()
        return
      }
    } catch (err: any) {
      errorMsg.value = err?.data?.msg || err?.message || '查询任务失败'
      stopPolling()
      return
    }
    if (pollCount >= MAX_POLLS) {
      errorMsg.value = '识别超时，请稍后重试'
      stopPolling()
      return
    }
    pollTimer = setTimeout(tick, POLL_INTERVAL)
  }
  pollTimer = setTimeout(tick, POLL_INTERVAL)
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // ignore
  }
}

function formatConfidence(c: number) {
  return `${(c * 100).toFixed(1)}%`
}

onUnmounted(() => {
  stopPolling()
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <div class="ocr-page">
    <div class="ocr-card">
      <header class="ocr-card__header">
        <h2 class="ocr-card__title">OCR 文字识别</h2>
        <small class="ocr-card__subtitle">上传图片或 PDF，自动识别其中文字</small>
      </header>

      <!-- 上传区 -->
      <section class="ocr-section">
        <div
          class="dropzone"
          :class="{ 'dropzone--active': isDragOver, 'dropzone--has-file': !!file }"
          @click="!file && pickFile()"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="onDrop"
        >
          <input
            ref="fileInputRef"
            type="file"
            class="dropzone__input"
            :accept="ACCEPT_EXT.map(e => '.' + e).join(',')"
            @change="onFileChange"
          />
          <template v-if="!file">
            <i class="ri-upload-cloud-2-line dropzone__icon"></i>
            <div class="dropzone__title">点击或拖拽文件到此处</div>
            <div class="dropzone__hint">支持 JPG / PNG / WEBP / BMP / HEIC / HEIF / PDF · 最大 50MB</div>
          </template>
          <template v-else>
            <div class="file-card">
              <div class="file-card__preview">
                <img v-if="isImageFile && previewUrl" :src="previewUrl" alt="preview" />
                <i v-else class="ri-file-pdf-2-line"></i>
              </div>
              <div class="file-card__info">
                <div class="file-card__name" :title="file.name">{{ file.name }}</div>
                <div class="file-card__meta">{{ fileSizeText }}</div>
              </div>
              <button class="file-card__close" @click.stop="clearFile" aria-label="移除文件">
                <i class="ri-close-line"></i>
              </button>
            </div>
          </template>
        </div>
      </section>

      <!-- 选项 -->
      <section class="ocr-section">
        <div class="option-row">
          <div class="option-row__label">返回模式</div>
          <div class="option-row__control">
            <n-radio-group v-model:value="mode" size="small">
              <n-radio value="detail">Detail（含坐标 / 置信度）</n-radio>
              <n-radio value="list">List（文本数组）</n-radio>
              <n-radio value="text">Text（拼接为整段）</n-radio>
            </n-radio-group>
          </div>
        </div>

        <div class="option-row">
          <div class="option-row__label">最小置信度</div>
          <div class="option-row__control option-row__control--slider">
            <n-slider v-model:value="minConfidence" :min="0" :max="1" :step="0.05" :tooltip="false" />
            <span class="confidence-value">{{ minConfidence === 0 ? '不过滤' : formatConfidence(minConfidence) }}</span>
          </div>
        </div>
      </section>

      <!-- 操作 -->
      <section class="ocr-section ocr-actions">
        <n-button
          type="primary"
          :loading="isWorking"
          :disabled="!file || isWorking"
          @click="handleSubmit"
        >
          <template #icon>
            <i class="ri-scan-2-line"></i>
          </template>
          {{ isWorking ? '识别中...' : '开始识别' }}
        </n-button>
        <span v-if="errorMsg" class="ocr-error">
          <i class="ri-error-warning-line"></i> {{ errorMsg }}
        </span>
      </section>

      <!-- 状态/结果 -->
      <section v-if="task" class="ocr-section result-section">
        <div class="result-header">
          <n-tag :type="statusType[task.status]" round :bordered="false">
            {{ statusLabel[task.status] }}
          </n-tag>
          <span class="result-meta">任务 ID：{{ task.taskId }}</span>
          <span v-if="task.elapseSeconds != null" class="result-meta">
            耗时 {{ task.elapseSeconds.toFixed(2) }}s
          </span>
          <span v-if="task.pages != null" class="result-meta">页数 {{ task.pages }}</span>
        </div>

        <!-- 进行中 -->
        <div v-if="task.status === 'PENDING' || task.status === 'PROCESSING'" class="result-pending">
          <n-spin size="small" />
          <span>{{ task.status === 'PENDING' ? '已入队，等待识别...' : '识别中，请稍候...' }}</span>
        </div>

        <!-- 失败 -->
        <div v-else-if="task.status === 'FAILED'" class="result-failed">
          <i class="ri-close-circle-line"></i>
          <span>{{ task.errorMsg || '识别失败' }}</span>
        </div>

        <!-- 成功 - detail -->
        <div v-else-if="task.status === 'SUCCESS' && task.mode === 'detail'" class="result-detail">
          <n-empty v-if="!task.results?.length" description="未识别到文字" />
          <table v-else class="result-table">
            <thead>
              <tr>
                <th class="col-idx">#</th>
                <th>文本</th>
                <th class="col-conf">置信度</th>
                <th v-if="task.pages" class="col-page">页码</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in task.results" :key="idx">
                <td class="col-idx">{{ idx + 1 }}</td>
                <td class="col-text">{{ item.text }}</td>
                <td class="col-conf">{{ formatConfidence(item.confidence) }}</td>
                <td v-if="task.pages" class="col-page">{{ item.page ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 成功 - list -->
        <div v-else-if="task.status === 'SUCCESS' && task.mode === 'list'" class="result-list">
          <n-empty v-if="!task.textList?.length" description="未识别到文字" />
          <ol v-else>
            <li v-for="(t, idx) in task.textList" :key="idx">{{ t }}</li>
          </ol>
        </div>

        <!-- 成功 - text -->
        <div v-else-if="task.status === 'SUCCESS' && task.mode === 'text'" class="result-text">
          <div class="result-text__toolbar">
            <button class="copy-btn" @click="copyText(task.fullText || '')" :disabled="!task.fullText">
              <i :class="copied ? 'ri-check-line' : 'ri-file-copy-line'"></i>
              {{ copied ? '已复制' : '复制' }}
            </button>
          </div>
          <pre v-if="task.fullText">{{ task.fullText }}</pre>
          <n-empty v-else description="未识别到文字" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ocr-page {
  display: flex;
  justify-content: center;
  padding: 30px 20px;
  width: 100%;
}

.ocr-card {
  width: 100%;
  max-width: 900px;
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 28px 32px 32px;
  box-sizing: border-box;

  &__header {
    margin-bottom: 22px;
  }

  &__title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: var(--text-main);
    position: relative;
    padding-left: 14px;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 4px;
      border-radius: 2px;
      background: #9eb4ed;
    }
  }

  &__subtitle {
    display: block;
    margin-top: 6px;
    color: var(--summary-50);
    font-size: 13px;
  }
}

.ocr-section {
  margin-bottom: 22px;

  &:last-child {
    margin-bottom: 0;
  }
}

/* dropzone */
.dropzone {
  position: relative;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 36px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  background: var(--markdown-body-table-tr-2);

  &:hover {
    border-color: #9eb4ed;
  }

  &--active {
    border-color: #9eb4ed;
    background-color: rgba(158, 180, 237, 0.08);
  }

  &--has-file {
    cursor: default;
    padding: 16px;

    &:hover {
      border-color: var(--border-color);
    }
  }

  &__input {
    display: none;
  }

  &__icon {
    font-size: 44px;
    color: #9eb4ed;
    display: block;
    margin-bottom: 8px;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 6px;
  }

  &__hint {
    font-size: 12px;
    color: var(--summary-50);
  }
}

.file-card {
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;

  &__preview {
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    i {
      font-size: 32px;
      color: #e19eba;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    margin-top: 4px;
    font-size: 12px;
    color: var(--summary-50);
  }

  &__close {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 50%;
    color: var(--text-main);
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background-color: rgba(225, 158, 186, 0.15);
      color: #df1c5f;
    }
  }
}

/* options */
.option-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0;

  &__label {
    flex: 0 0 90px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-main);
  }

  &__control {
    flex: 1;
    min-width: 0;

    &--slider {
      display: flex;
      align-items: center;
      gap: 14px;
    }
  }
}

.confidence-value {
  flex-shrink: 0;
  min-width: 56px;
  font-size: 13px;
  color: var(--summary-50);
  font-variant-numeric: tabular-nums;
}

/* actions */
.ocr-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.ocr-error {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #d4564f;

  i {
    font-size: 16px;
  }
}

/* result */
.result-section {
  border-top: 1px solid var(--border-color);
  padding-top: 22px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.result-meta {
  font-size: 12px;
  color: var(--summary-50);
  word-break: break-all;
}

.result-pending {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px;
  background: var(--markdown-body-table-tr-2);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-main);
}

.result-failed {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: rgba(212, 86, 79, 0.08);
  border-radius: 10px;
  color: #d4564f;
  font-size: 13px;

  i {
    font-size: 18px;
  }
}

.result-detail {
  background: var(--markdown-body-table-tr-2);
  border-radius: 10px;
  overflow-x: auto;
  padding: 4px;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: var(--text-main);

  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  thead th {
    font-weight: 600;
    color: var(--summary-50);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background-color: rgba(158, 180, 237, 0.06);
  }

  .col-idx {
    width: 40px;
    color: var(--summary-50);
    font-variant-numeric: tabular-nums;
  }

  .col-text {
    word-break: break-word;
  }

  .col-conf {
    width: 90px;
    font-variant-numeric: tabular-nums;
  }

  .col-page {
    width: 60px;
    font-variant-numeric: tabular-nums;
  }
}

.result-list {
  background: var(--markdown-body-table-tr-2);
  border-radius: 10px;
  padding: 16px 20px;

  ol {
    margin: 0;
    padding-left: 22px;
    color: var(--text-main);
    font-size: 13px;
    line-height: 1.8;

    li {
      word-break: break-word;
    }
  }
}

.result-text {
  background: var(--markdown-body-table-tr-2);
  border-radius: 10px;
  padding: 12px 16px;

  &__toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 13px;
    line-height: 1.7;
    color: var(--text-main);
    font-family: inherit;
  }
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--text-main);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;

  &:hover:not(:disabled) {
    color: #5b9bd5;
    border-color: rgba(91, 155, 213, 0.4);
    background-color: rgba(91, 155, 213, 0.06);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  i {
    font-size: 14px;
  }
}

@media screen and (max-width: 850px) {
  .ocr-page {
    padding: 16px 12px;
  }

  .ocr-card {
    padding: 20px 16px 24px;
  }

  .option-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    &__label {
      flex: none;
    }

    &__control {
      width: 100%;
    }
  }

  .dropzone {
    padding: 28px 14px;

    &__icon {
      font-size: 36px;
    }
  }

  .result-table {
    font-size: 12px;

    th, td {
      padding: 8px 10px;
    }
  }
}
</style>
