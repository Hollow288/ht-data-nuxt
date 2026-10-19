<script setup lang="ts">
import { parse2faInput } from '~/utils/tools/parse2fa'
import { generateHotpCode, generateTotpCode } from '~/utils/tools/otp'
const props = defineProps<{ initialInput?: string }>()
const sample = 'otpauth://totp/Hollow:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Hollow&algorithm=SHA1&digits=6&period=30'
const input = ref(props.initialInput ?? sample)
const result = computed(() => parse2faInput(input.value))
const data = computed(() => result.value.ok ? result.value.data : null)
const now = ref<number | null>(null)
const code = ref('')
const error = ref('')
const showSecret = ref(false)
const remaining = computed(() => data.value?.type === 'totp' && now.value !== null ? data.value.period - now.value % data.value.period : null)
const slice = computed(() => data.value?.type === 'totp' && now.value !== null ? Math.floor(now.value / data.value.period) : data.value?.counter)
const progress = computed(() => data.value?.type === 'totp' && remaining.value !== null ? 100 * (data.value.period - remaining.value) / data.value.period : 0)
const formattedCode = computed(() => code.value.length === 6 ? `${code.value.slice(0, 3)} ${code.value.slice(3)}` : code.value || '------')
const fields = computed(() => data.value ? [ ['Issuer', data.value.issuer], ['账号', data.value.accountName], ['标签', data.value.label], ['算法', data.value.algorithm], ['位数', String(data.value.digits)], [data.value.type === 'totp' ? '周期（秒）' : 'Counter', String(data.value.type === 'totp' ? data.value.period : data.value.counter)] ] : [])
const { labels, copy } = useToolClipboard()
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { now.value = Math.floor(Date.now() / 1000); timer = setInterval(() => { now.value = Math.floor(Date.now() / 1000) }, 1000) })
onUnmounted(() => clearInterval(timer))
watch(input, () => { showSecret.value = false }, { flush: 'sync' })
watch([data, slice, () => now.value === null], async (_, _old, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true })
  code.value = ''; error.value = ''
  const current = data.value
  if (!current || now.value === null) return
  try {
    const generated = current.type === 'totp' ? await generateTotpCode({ ...current, timestamp: now.value }) : await generateHotpCode(current)
    if (!cancelled) code.value = generated
  } catch (cause) { if (!cancelled) error.value = cause instanceof Error ? cause.message : '动态码生成失败' }
}, { immediate: true })
</script>

<template>
  <section class="tool-panel"><div class="panel-heading"><h2>输入内容</h2><div class="tool-actions"><button class="tool-button" @click="input = sample">URI 示例</button><button class="tool-button" @click="input = 'N52OMYHX2GRTRVURAUYGIJ4D4ZUBNUSK'">密钥示例</button><button class="tool-button" @click="input = ''">清空</button></div></div><textarea v-model="input" aria-label="otpauth 链接或 2FA 密钥" spellcheck="false" autocomplete="off" placeholder="输入 otpauth:// 链接或 Base32 密钥" /><p class="tool-note">密钥仅在当前浏览器中计算，不会上传或保存。</p></section>
  <section class="tool-panel"><div class="panel-heading"><h2>解析结果</h2><span v-if="data" class="tool-note">{{ data.type.toUpperCase() }}</span></div><p v-if="!result.ok" class="tool-error" role="alert">{{ result.error }}</p><template v-if="data"><div class="otp-card"><p class="tool-note">当前动态码</p><p class="otp-code mono" aria-label="当前动态验证码">{{ formattedCode }}</p><div class="tool-actions"><button class="tool-button" :disabled="!code" @click="copy(code)">{{ labels.default || '复制验证码' }}</button><span class="tool-note">{{ data.type === 'totp' ? `${remaining ?? '--'} 秒后刷新` : 'HOTP 按计数器生成，不按时间刷新' }}</span></div><div v-if="data.type === 'totp'" class="otp-progress" aria-hidden="true"><span :style="{ width: `${progress}%` }" /></div></div><p v-if="error" class="tool-error" role="alert">{{ error }}</p><p v-if="data.inferred" class="tool-note">纯密钥默认使用 TOTP：SHA1 / 6 位 / 30 秒。</p><div class="tool-fields otp-fields"><div v-for="field in fields" :key="field[0]"><span class="field-label">{{ field[0] }}</span><p class="mono">{{ field[1] }}</p></div></div><div class="secret-block"><div class="panel-heading"><h2>Secret</h2><button class="tool-button" @click="showSecret = !showSecret">{{ showSecret ? '隐藏' : '显示' }}</button></div><p class="mono">{{ showSecret ? data.secret.replace(/(.{4})/g, '$1 ').trim() : '•'.repeat(Math.max(data.secret.length, 12)) }}</p></div></template></section>
</template>

<style scoped>
.otp-card { padding: 22px; border-radius: 8px; background: var(--accent-soft); }.otp-code { margin: 12px 0 18px; color: var(--accent); font-size: clamp(32px, 5vw, 48px); font-weight: 700; letter-spacing: .12em; }.otp-progress { height: 4px; margin-top: 18px; border-radius: 4px; overflow: hidden; background: var(--border-color); }.otp-progress span { display: block; height: 100%; background: var(--accent); transition: width .3s linear; }.otp-fields { margin-top: 24px; }.otp-fields > div { padding: 14px; border-radius: 6px; background: var(--bg-soft); }.secret-block { margin-top: 22px; padding-top: 22px; border-top: 1px solid var(--border-color); }.secret-block > p { color: var(--text-secondary); }
</style>
