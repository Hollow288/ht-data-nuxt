<script setup lang="ts">
import { links } from '~/data/links'
useSeoMeta({ title: '小工具 · Hollow’s Space', description: '把重复的事情变简单。OCR 图片与 PDF 文字识别，以及一些日常用得上的工具。' })
const externalTools = computed(() => links.filter(link => link.name === '工具' || link.name === '探针'))
</script>

<template>
  <div class="tools-page site-width">
    <section class="featured-tool" aria-labelledby="ocr-title">
      <div class="tool-copy"><div class="tool-label"><i class="ri-scan-2-line" aria-hidden="true" /><span>文字识别</span></div><h2 id="ocr-title">OCR 图片与 PDF 识别</h2><p>上传截图、扫描件或 PDF，提取可以复制的文字。<br class="desktop-break" />支持置信度筛选、逐行结果与识别位置查看。</p><div class="tool-capabilities"><span>图片识别</span><span>PDF 提取</span><span>结果复制</span></div><NuxtLink to="/ocr-page" class="primary-button">开始使用<i class="ri-arrow-right-line" aria-hidden="true" /></NuxtLink><div class="tool-formats">JPG / PNG / WEBP / HEIC / PDF <span>最大 50 MB</span></div></div>
      <div class="ocr-illustration" aria-hidden="true"><div class="scan-document"><div class="doc-top"><i class="ri-file-text-line" /><span>一页日常</span><span>01</span></div><span class="doc-line long" /><span class="doc-line" /><span class="scan-text">记录值得留下的文字。</span><span class="doc-line long" /><span class="doc-line short" /><div class="scan-line" /><i class="corner tl" /><i class="corner tr" /><i class="corner bl" /><i class="corner br" /></div><span class="scan-complete"><i class="ri-check-line" /> 让灵感不再停留在图片里</span></div>
    </section>
    <section v-if="externalTools.length" class="other-tools"><div class="section-heading"><h2>常用入口</h2></div><a v-for="tool in externalTools" :key="tool.name" :href="tool.url" target="_blank" rel="noopener noreferrer" class="tool-link"><i :class="tool.icon" aria-hidden="true" /><div><h3>{{ tool.name }}</h3><p>{{ tool.desc }}</p></div><i class="ri-arrow-right-up-line" aria-hidden="true" /></a></section>
  </div>
</template>

<style scoped>
.tools-page { padding-top: 24px; }
.featured-tool { display: grid; grid-template-columns: minmax(0, 1fr) 300px; align-items: center; gap: 36px; padding: 32px; border-bottom: 1px solid var(--border-color); }
.tool-label { display: flex; align-items: center; gap: 8px; color: var(--accent); font-size: 14px; font-weight: 600; }.tool-label i { font-size: 21px; }
.tool-copy { min-width: 0; }.tool-copy h2 { margin-top: 12px; font-size: 30px; font-weight: 700; line-height: 1.3; letter-spacing: -.025em; }.tool-copy > p { margin-top: 14px; color: var(--text-secondary); font-size: 16px; line-height: 1.7; }
.tool-capabilities { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }.tool-capabilities > span { padding: 3px 9px; color: var(--text-secondary); font-size: 13px; }
.tool-copy > .primary-button { margin-top: 22px; }.tool-formats { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 12px; font-size: 12px; color: var(--text-muted); }
.ocr-illustration { position: relative; display: grid; place-items: center; justify-self: center; width: 260px; height: 280px; }
.scan-document { position: relative; width: 200px; padding: 20px 18px 26px; border: 1px solid var(--border-color); background: var(--bg-body); }
.doc-top { display: flex; align-items: center; gap: 7px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 12px; }.doc-top i { color: var(--accent); font-size: 18px; }.doc-top span:last-child { margin-left: auto; }
.doc-line { display: block; margin-top: 12px; height: 4px; width: 73%; border-radius: 2px; background: var(--border-color); }.doc-line.long { width: 100%; }.doc-line.short { width: 52%; }
.scan-text { display: block; margin: 16px -5px; padding: 7px 5px; border: 1px dashed var(--accent); border-radius: 3px; background: var(--accent-soft); color: var(--accent); font-size: 14px; white-space: nowrap; }
.corner { position: absolute; width: 10px; height: 10px; border-color: var(--accent); border-style: solid; }.tl { top: -5px; left: -5px; border-width: 2px 0 0 2px; }.tr { top: -5px; right: -5px; border-width: 2px 2px 0 0; }.bl { bottom: -5px; left: -5px; border-width: 0 0 2px 2px; }.br { bottom: -5px; right: -5px; border-width: 0 2px 2px 0; }
.scan-line { position: absolute; top: 51%; left: -14px; right: -14px; height: 1px; background: var(--accent); opacity: .45; }.scan-complete { position: absolute; bottom: 9px; color: var(--text-secondary); font-size: 12px; }.scan-complete > i { color: var(--accent); }
.other-tools { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 28px; }.other-tools .section-heading { grid-column: 1 / -1; margin-bottom: 0; }
.tool-link:nth-of-type(even) { border-left: 1px solid var(--border-color); }
.tool-link { display: flex; align-items: center; gap: 16px; min-width: 0; padding: 22px; }.tool-link > div { min-width: 0; }.tool-link > i:first-child { display: grid; place-items: center; width: 40px; height: 40px; flex-shrink: 0; color: var(--accent); font-size: 22px; }.tool-link h3 { font-size: 18px; font-weight: 700; }.tool-link p { margin-top: 5px; color: var(--text-secondary); font-size: 15px; line-height: 1.6; }.tool-link > i:last-child { margin-left: auto; color: var(--text-muted); }.tool-link:hover h3 { color: var(--accent); }
@media (max-width: 900px) { .featured-tool { grid-template-columns: minmax(0, 1fr) 240px; gap: 24px; padding: 28px; }.ocr-illustration { width: 230px; }.tool-copy h2 { font-size: 27px; }.desktop-break { display: none; } }
@media (max-width: 700px) { .tools-page { padding-top: 20px; }.featured-tool { grid-template-columns: minmax(0, 1fr); gap: 0; padding: 24px; }.tool-copy h2 { font-size: 26px; line-height: 1.4; }.ocr-illustration { display: none; }.other-tools { grid-template-columns: minmax(0, 1fr); margin-top: 24px; }.tool-link { padding: 20px; gap: 14px; }.tool-link:nth-of-type(even) { border-left: 0; }.tool-link + .tool-link { border-top: 1px solid var(--border-color); } }
</style>
