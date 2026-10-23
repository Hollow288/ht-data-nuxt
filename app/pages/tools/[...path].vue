<script setup lang="ts">
import { tools } from '~/data/tools'
import TwoFaTool from '~/components/tools/TwoFaTool.vue'
import OneLineTool from '~/components/tools/OneLineTool.vue'
import CaesarTool from '~/components/tools/CaesarTool.vue'
import Base64ImageTool from '~/components/tools/Base64ImageTool.vue'
import EncodeTool from '~/components/tools/EncodeTool.vue'
import ColorTool from '~/components/tools/ColorTool.vue'
import SubEmailTool from '~/components/tools/SubEmailTool.vue'
import JsRunnerTool from '~/components/tools/JsRunnerTool.vue'
import JsonTool from '~/components/tools/JsonTool.vue'

definePageMeta({
  validate: route => {
    const parts = (Array.isArray(route.params.path) ? route.params.path : [route.params.path]).filter(Boolean)
    return tools.some(tool => tool.id !== 'ocr' && tool.id === parts[0]) && (parts.length === 1 || (parts[0] === 'twofa' && parts.length === 2))
  }
})
const route = useRoute()
const parts = computed(() => (Array.isArray(route.params.path) ? route.params.path : [route.params.path]).filter(Boolean))
const currentTool = computed(() => tools.find(tool => tool.id === parts.value[0])!)
const components = { twofa: TwoFaTool, 'one-line': OneLineTool, json: JsonTool, caesar: CaesarTool, 'base64-image': Base64ImageTool, encode: EncodeTool, color: ColorTool, 'sub-email': SubEmailTool, 'js-runner': JsRunnerTool }
const activeComponent = computed(() => components[currentTool.value.id as keyof typeof components])
const initialInput = computed(() => typeof route.query.input === 'string' ? route.query.input : parts.value[1])
useSeoMeta({ title: () => `${currentTool.value.name} · Hollow’s Space`, description: () => currentTool.value.description })
</script>

<template>
  <div class="tool-detail site-width">
    <header class="page-heading"><NuxtLink to="/tools" class="text-link"><i class="ri-arrow-left-line" aria-hidden="true" /> 返回小工具</NuxtLink><h1 class="page-title">{{ currentTool.name }}</h1><p class="page-description">{{ currentTool.description }}</p></header>
    <div class="tool-workspace"><component :is="activeComponent" :key="route.fullPath" v-bind="currentTool.id === 'twofa' ? { initialInput } : {}" /></div>
  </div>
</template>

<style scoped>
.tool-detail { padding-bottom: 36px; }
.tool-workspace { min-width: 0; }
.tool-workspace :deep(.tool-panel) { min-width: 0; margin-bottom: 20px; padding: 24px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-card); }
.tool-workspace :deep(.panel-heading) { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.tool-workspace :deep(h2) { font-size: 18px; }
.tool-workspace :deep(.tool-actions), .tool-workspace :deep(.mode-buttons) { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.tool-workspace :deep(.tool-button) { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 6px 12px; border: 1px solid var(--border-color); border-radius: 6px; background: transparent; color: var(--text-secondary); font-size: 14px; }
.tool-workspace :deep(.tool-button:hover), .tool-workspace :deep(.tool-button.active) { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.tool-workspace :deep(.tool-button:disabled) { opacity: .5; }
.tool-workspace :deep(textarea), .tool-workspace :deep(.tool-input), .tool-workspace :deep(select) { display: block; width: 100%; max-width: 100%; min-width: 0; padding: 12px; border: 1px solid var(--border-color); border-radius: 7px; background: var(--bg-soft); color: var(--text-main); font-size: 14px; line-height: 1.7; }
.tool-workspace :deep(:is(input, textarea, select, [contenteditable]):focus) { outline: none; box-shadow: none; }
.tool-workspace :deep(:is(textarea, .tool-input, select):focus) { border-color: var(--accent); }
.tool-workspace :deep(textarea) { min-height: 160px; resize: vertical; font-family: Consolas, 'Cascadia Code', monospace; }
.tool-workspace :deep(textarea[readonly]) { background: var(--bg-body); }
.tool-workspace :deep(.tool-note) { margin-top: 12px; color: var(--text-muted); font-size: 13px; line-height: 1.7; }
.tool-workspace :deep(.tool-error) { margin-top: 12px; padding: 10px 12px; border: 1px solid #c55b5b66; border-radius: 6px; color: #c44b4b; background: #c55b5b0a; font-size: 14px; overflow-wrap: anywhere; }
.tool-workspace :deep(.mono) { font-family: Consolas, 'Cascadia Code', monospace; overflow-wrap: anywhere; }
.tool-workspace :deep(.field-label) { display: block; margin-bottom: 8px; color: var(--text-secondary); font-size: 14px; }
.tool-workspace :deep(.tool-fields) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.tool-workspace :deep(.result-list) { display: grid; gap: 10px; }
.tool-workspace :deep(.result-row) { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; padding: 12px; border: 1px solid var(--border-color); border-radius: 7px; background: var(--bg-soft); }
.tool-workspace :deep(.result-row code) { flex: 1; min-width: 0; overflow-wrap: anywhere; }
@media (max-width: 700px) { .tool-workspace :deep(.tool-panel) { padding: 18px; }.tool-workspace :deep(.tool-fields) { grid-template-columns: minmax(0, 1fr); }.tool-workspace :deep(.panel-heading) { align-items: flex-start; }.tool-workspace :deep(.result-row) { flex-wrap: wrap; }.tool-workspace :deep(.result-row code) { flex-basis: 65%; } }
</style>
