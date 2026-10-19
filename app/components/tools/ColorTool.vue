<script setup lang="ts">
import { parseColorInput, rgbToHex, rgbToHsl, formatRgb, formatHsl } from '~/utils/tools/color'
const input = ref('#3182ce')
const rgb = computed(() => parseColorInput(input.value))
const hex = computed(() => rgb.value ? rgbToHex(rgb.value) : '#000000')
const formats = computed(() => rgb.value ? [{ label: 'HEX', value: hex.value }, { label: 'RGB', value: formatRgb(rgb.value) }, { label: 'HSL', value: formatHsl(rgbToHsl(rgb.value)) }] : [])
const { labels, copy } = useToolClipboard()
</script>

<template>
  <section class="tool-panel"><div class="panel-heading"><h2>输入颜色</h2><div class="tool-actions"><button class="tool-button" @click="input = '#3182ce'">示例</button><button class="tool-button" @click="input = ''">清空</button></div></div><div class="color-inputs"><input v-model="input" class="tool-input mono" aria-label="颜色值" placeholder="#ff6600、rgb(255, 102, 0)、hsl(24, 100%, 50%)" spellcheck="false" /><input type="color" :value="hex" aria-label="拾色器" @input="input = ($event.target as HTMLInputElement).value" /></div><p v-if="input && !rgb" class="tool-error" role="alert">无法识别的颜色格式，请输入有效的 HEX、RGB 或 HSL 色值。</p></section>
  <section v-if="rgb" class="tool-panel"><div class="panel-heading"><h2>转换结果</h2></div><div class="color-preview" :style="{ backgroundColor: hex }" :aria-label="`颜色预览 ${hex}`" /><div class="result-list"><div v-for="format in formats" :key="format.label" class="result-row"><strong>{{ format.label }}</strong><code>{{ format.value }}</code><button class="tool-button" @click="copy(format.value, format.label)">{{ labels[format.label] || '复制' }}</button></div></div></section>
</template>

<style scoped>.color-inputs { display: flex; align-items: center; gap: 12px; }.color-inputs input[type=color] { width: 50px; height: 46px; flex-shrink: 0; padding: 3px; border: 1px solid var(--border-color); border-radius: 7px; background: none; cursor: pointer; }.color-preview { height: 110px; margin-bottom: 20px; border: 1px solid var(--border-color); border-radius: 7px; }.result-row strong { min-width: 38px; font-size: 14px; }</style>
