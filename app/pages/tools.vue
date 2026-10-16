<script setup lang="ts">
import { links } from '~/data/links'
useSeoMeta({ title: '小工具 · Hollow’s Space', description: '把重复的事情变简单。OCR 图片与 PDF 文字识别，以及一些日常用得上的工具。' })
const externalTools = computed(() => links.filter(link => link.name === '工具' || link.name === '探针'))
</script>

<template>
  <div class="tools-page site-width">
    <header class="page-heading"><span class="eyebrow"><i class="ri-tools-line" aria-hidden="true" /> THE TOOLBOX</span><h1 class="page-title">小工具，大一点的方便<span>。</span></h1><p class="page-description">把重复的事情交给工具，把时间留给喜欢的事。</p></header>
    <section class="featured-tool" aria-labelledby="ocr-title">
      <div class="tool-number">01 / BUILT FOR EVERYDAY</div>
      <div class="tool-copy"><div class="tool-label"><i class="ri-scan-2-line" aria-hidden="true" /><span>文字与效率</span></div><h2 id="ocr-title">让图片里的文字，<br />自由一点。</h2><p>截图、扫描件、PDF 文档，一次上传，提取其中的文字。<br class="desktop-break" />支持文本复制、置信度筛选与识别位置查看。</p><NuxtLink to="/ocr-page" class="primary-button">打开 OCR 文字识别<i class="ri-arrow-right-line" aria-hidden="true" /></NuxtLink><div class="tool-formats">JPG · PNG · WEBP · HEIC · PDF <span>最大 50 MB</span></div></div>
      <div class="ocr-illustration" aria-hidden="true"><div class="scan-document"><div class="doc-top"><i class="ri-file-text-line" /><span>一页日常</span><span>01</span></div><span class="doc-line long" /><span class="doc-line" /><span class="scan-text">记录值得留下的文字。</span><span class="doc-line long" /><span class="doc-line short" /><div class="scan-line" /><i class="corner tl" /><i class="corner tr" /><i class="corner bl" /><i class="corner br" /></div><span class="scan-complete"><i class="ri-check-line" /> 让灵感不再停留在图片里</span></div>
    </section>
    <section v-if="externalTools.length" class="other-tools"><div class="section-heading"><h2>顺手的入口 <span>QUICK LINKS</span></h2></div><a v-for="tool in externalTools" :key="tool.name" :href="tool.url" target="_blank" rel="noopener noreferrer" class="tool-link"><i :class="tool.icon" aria-hidden="true" /><div><h3>{{ tool.name }}</h3><p>{{ tool.desc }}</p></div><i class="ri-arrow-right-up-line" aria-hidden="true" /></a></section>
    <p class="tools-footnote"><i class="ri-seedling-line" aria-hidden="true" /> 工具不必很多，好用就好。这个小角落会慢慢生长。</p>
  </div>
</template>

<style scoped>
.page-title > span { color: var(--accent); }
.featured-tool { position: relative; display: grid; grid-template-columns: 1.2fr 1fr; gap: 50px; padding: 68px 0 52px; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
.tool-number { position: absolute; top: 20px; left: 0; font-size: 10px; letter-spacing: .12em; color: var(--text-muted); }
.tool-label { display: flex; align-items: center; gap: 8px; color: var(--accent); font-size: 12px; }
.tool-label i { font-size: 21px; }
.tool-copy h2 { margin-top: 15px; font-size: 33px; line-height: 1.55; font-weight: 550; letter-spacing: -.03em; }
.tool-copy > p { margin: 19px 0 28px; color: var(--text-secondary); font-size: 13px; line-height: 2; }
.tool-formats { margin-top: 17px; font-size: 10px; color: var(--text-muted); letter-spacing: .03em; }
.tool-formats span { margin-left: 15px; }
.ocr-illustration { position: relative; align-self: center; justify-self: center; display: grid; place-items: center; width: 300px; height: 310px; background-image: radial-gradient(var(--border-color) 1px, transparent 1px); background-size: 17px 17px; }
.scan-document { position: relative; width: 216px; padding: 26px 22px 34px; border: 1px solid var(--border-color); background: var(--bg-body); transform: rotate(4deg); }
.doc-top { display: flex; align-items: center; gap: 7px; padding-bottom: 16px; color: var(--text-muted); font-size: 10px; border-bottom: 1px solid var(--border-color); }
.doc-top i { color: var(--accent); font-size: 18px; }
.doc-top span:last-child { margin-left: auto; }
.doc-line { display: block; margin-top: 14px; height: 5px; width: 73%; background: var(--border-color); }
.doc-line.long { width: 100%; }.doc-line.short { width: 52%; }
.scan-text { display: block; margin: 16px -5px; padding: 8px 5px; background: var(--accent-soft); border: 1px dashed var(--accent); color: var(--accent); font-size: 12px; white-space: nowrap; }
.corner { position: absolute; width: 13px; height: 13px; border-color: var(--accent); border-style: solid; }
.tl { top: -7px; left: -7px; border-width: 2px 0 0 2px; }.tr { top: -7px; right: -7px; border-width: 2px 2px 0 0; }.bl { bottom: -7px; left: -7px; border-width: 0 0 2px 2px; }.br { bottom: -7px; right: -7px; border-width: 0 2px 2px 0; }
.scan-line { position: absolute; top: 51%; left: -25px; right: -25px; height: 1px; background: var(--accent); opacity: .5; }
.scan-complete { position: absolute; bottom: 0; left: 30px; color: var(--accent); font-size: 11px; transform: rotate(-4deg); }
.other-tools { margin-top: 40px; }
.tool-link { display: inline-flex; align-items: center; width: calc(50% - 20px); gap: 20px; padding: 22px 0; margin-right: 20px; border-bottom: 1px solid var(--border-color); }
.tool-link > i:first-child { color: var(--accent); font-size: 23px; }.tool-link h3 { font-size: 15px; font-weight: 500; }.tool-link p { margin-top: 3px; color: var(--text-muted); font-size: 12px; }.tool-link > i:last-child { margin-left: auto; color: var(--text-muted); }.tool-link:hover { color: var(--accent); }
.tools-footnote { margin-top: 42px; color: var(--text-muted); font-size: 12px; }.tools-footnote i { margin-right: 6px; color: var(--accent); }
@media (max-width: 700px) { .featured-tool { grid-template-columns: 1fr; gap: 30px; padding: 60px 0 35px; }.tool-copy h2 { font-size: 29px; }.ocr-illustration { width: 270px; height: 280px; }.tool-link { width: 100%; margin: 0; }.desktop-break { display: none; } }
</style>
