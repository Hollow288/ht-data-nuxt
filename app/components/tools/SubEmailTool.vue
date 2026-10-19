<script setup lang="ts">
import { NSelect } from 'naive-ui'
import { parseEmail, generateSubEmails } from '~/utils/tools/email'
const email = ref('aaa@gmail.com')
const count = ref(10)
const mode = ref<'sequence' | 'random'>('sequence')
const modeOptions = [
  { label: '顺序（a、b、c…）', value: 'sequence' },
  { label: '随机', value: 'random' }
]
const randomLength = ref(6)
const generated = ref<string[]>([])
const error = computed(() => email.value.trim() && !parseEmail(email.value) ? '邮箱格式不正确，示例：aaa@gmail.com' : '')
const { labels, copy } = useToolClipboard()
const lastCopied = ref('')
function generate() { generated.value = generateSubEmails(email.value, Number(count.value), mode.value, Number(randomLength.value)) }
watch([email, count, mode, randomLength], generate, { immediate: true })
function reset() { email.value = 'aaa@gmail.com'; count.value = 10; mode.value = 'sequence'; randomLength.value = 6; lastCopied.value = '' }
async function copyOne(value: string, index: number) { await copy(value, String(index)); if (labels.value[index] === '已复制') lastCopied.value = value }
</script>

<template>
  <section class="tool-panel">
    <div class="panel-heading">
      <h2>生成参数</h2>
      <div class="tool-actions">
        <button v-if="mode === 'random'" class="tool-button" :disabled="!!error || !generated.length" @click="generate">重新随机</button>
        <button class="tool-button" @click="reset">重置</button>
      </div>
    </div>
    <div class="tool-fields">
      <label><span class="field-label">邮箱</span><input v-model="email" type="email" class="tool-input" placeholder="aaa@gmail.com" autocomplete="off" spellcheck="false" /></label>
      <label><span class="field-label">数量（1 ~ 1000）</span><input v-model.number="count" type="number" class="tool-input" min="1" max="1000" /></label>
      <div>
        <span class="field-label">生成方式</span>
        <NSelect
          v-model:value="mode"
          :options="modeOptions"
          aria-label="生成方式"
          :theme-overrides="{ peers: { InternalSelection: { heightMedium: '50px', fontSizeMedium: '14px' } } }"
        />
      </div>
      <label v-if="mode === 'random'"><span class="field-label">随机长度（2 ~ 16）</span><input v-model.number="randomLength" type="number" class="tool-input" min="2" max="16" /></label>
    </div>
    <p v-if="error" class="tool-error" role="alert">{{ error }}</p>
    <p class="tool-note">使用邮箱的 + 别名功能，邮件仍进入原邮箱。请确认你的邮箱服务支持此功能。</p>
  </section>
  <section class="tool-panel"><div class="panel-heading"><h2>生成结果 <span class="result-count">{{ generated.length }} 个</span></h2><button class="tool-button" :disabled="!generated.length" @click="copy(generated.join('\n'), 'all')">{{ labels.all || '复制全部' }}</button></div><p v-if="lastCopied" class="tool-note last-copied">上次复制：<span class="mono">{{ lastCopied }}</span></p><div class="email-results"><button v-for="(value, index) in generated" :key="value" type="button" class="email-result" title="点击复制" @click="copyOne(value, index)"><span class="email-index">{{ index + 1 }}</span><span class="mono">{{ value }}</span><small>{{ labels[index] || '复制' }}</small></button></div><p v-if="!generated.length" class="tool-note">输入有效邮箱和数量后即可生成。</p></section>
</template>

<style scoped>.result-count { margin-left: 8px; color: var(--text-muted); font-size: 13px; font-weight: 400; }.email-results { display: grid; gap: 6px; max-height: 520px; overflow-y: auto; }.email-result { display: flex; align-items: center; gap: 14px; width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-soft); text-align: left; font-size: 14px; }.email-result:hover { border-color: var(--accent); }.email-result .mono { min-width: 0; flex: 1; }.email-index { min-width: 25px; color: var(--text-muted); }.email-result small { flex-shrink: 0; color: var(--accent); }.last-copied { margin: 0 0 16px; }</style>
