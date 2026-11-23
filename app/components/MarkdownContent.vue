<script setup lang="ts">
import { computed, onMounted, onUnmounted, onUpdated, ref, useId, watch } from 'vue'
import Prism from 'prismjs'
import { createArticleMarkdown } from '~/utils/articleMarkdown'
import { markdownHeadingId, markdownHeadingText } from '~/utils/markdown'
import 'github-markdown-css/github-markdown.css'
import 'katex/dist/katex.min.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-nginx'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-mongodb'
import 'prismjs/components/prism-matlab'
import 'prismjs/components/prism-powershell'

const props = defineProps<{ content: string }>()
const markdownRoot = ref<HTMLDivElement | null>(null)
const md = createArticleMarkdown()
const diagramId = useId().replace(/[^\w-]/g, '')
let diagramVersion = 0
let mounted = false
const languageNames: Record<string, string> = {
  js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript',
  json: 'JSON', html: 'HTML', xml: 'XML', markup: 'HTML', css: 'CSS',
  python: 'Python', py: 'Python', java: 'Java', bash: 'Bash', sh: 'Shell',
  sql: 'SQL', mongodb: 'MongoDB', nginx: 'Nginx', matlab: 'Matlab', powershell: 'PowerShell',
}
const languageAliases: Record<string, string> = { js: 'javascript', ts: 'typescript', py: 'python', sh: 'bash', html: 'markup', xml: 'markup' }

const renderFence = md.renderer.rules.fence!
md.renderer.rules.fence = (tokens, index, options, env, self) => {
  const token = tokens[index]!
  const requested = (token.info.trim().split(/\s+/)[0] ?? '').toLowerCase()
  if (requested === 'mermaid') return renderFence(tokens, index, options, env, self)
  const language = /^[\w+-]+$/.test(requested) ? requested : 'text'
  const grammar = Prism.languages[languageAliases[language] ?? language]
  const code = token.content.replace(/\n$/, '')
  const highlighted = grammar ? Prism.highlight(code, grammar, language) : md.utils.escapeHtml(code)
  const lineCount = code.split('\n').length
  const lines = Array.from({ length: lineCount }, (_, line) => `<span>${line + 1}</span>`).join('')
  return `<div class="code-block"><div class="code-toolbar"><span>${md.utils.escapeHtml(languageNames[language] ?? language)}</span><button type="button" class="code-copy" aria-label="复制代码"><i class="ri-file-copy-line" aria-hidden="true"></i><span aria-live="polite">复制</span></button></div><div class="code-scroll" role="region" aria-label="${md.utils.escapeHtml(languageNames[language] ?? language)} 代码" tabindex="0"><div class="code-lines" aria-hidden="true">${lines}</div><pre><code class="language-${language}">${highlighted}</code></pre></div></div>\n`
}
md.renderer.rules.heading_open = (tokens, index, options, env, self) => {
  const token = tokens[index]!
  token.attrSet('id', markdownHeadingId(markdownHeadingText(tokens[index + 1]), env.headingCounts))
  return self.renderToken(tokens, index, options)
}
md.renderer.rules.heading_close = (tokens, index, options, _env, self) => {
  const id = tokens[index - 2]?.attrGet('id') ?? ''
  const title = markdownHeadingText(tokens[index - 1])
  return `<a class="heading-anchor" href="#${encodeURIComponent(id)}" aria-label="跳转到${md.utils.escapeHtml(title)}">#</a>${self.renderToken(tokens, index, options)}`
}
md.renderer.rules.table_open = () => '<div class="table-container" role="region" aria-label="文章表格" tabindex="0"><table>'
md.renderer.rules.table_close = () => '</table></div>'

const rendered = computed(() => md.render(props.content, { headingCounts: new Map<string, number>() }))
let themeObserver: MutationObserver | undefined

function setDiagramState(block: HTMLElement, state: 'loading' | 'ready' | 'error') {
  block.setAttribute('aria-busy', String(state === 'loading'))
  block.querySelector<HTMLElement>('.mermaid-loading')!.hidden = state !== 'loading'
  block.querySelector<HTMLElement>('.mermaid-output')!.hidden = state !== 'ready'
  block.querySelector<HTMLElement>('.mermaid-error')!.hidden = state !== 'error'
}

async function renderDiagrams() {
  const version = ++diagramVersion
  const blocks = [...(markdownRoot.value?.querySelectorAll<HTMLElement>('.mermaid-block') ?? [])]
  if (!mounted || !blocks.length) return
  for (const block of blocks) {
    // Keep an existing diagram visible while refreshing its theme.
    if (block.querySelector('.mermaid-output svg')) block.setAttribute('aria-busy', 'true')
    else setDiagramState(block, 'loading')
  }
  try {
    const { default: mermaid } = await import('mermaid')
    if (!mounted || version !== diagramVersion) return
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'neutral',
      fontFamily: 'Inter, "Microsoft YaHei", sans-serif',
      flowchart: { htmlLabels: false, useMaxWidth: false }
    })
    for (const [index, block] of blocks.entries()) {
      if (!mounted || version !== diagramVersion) return
      const source = block.querySelector<HTMLElement>('.mermaid-source')!
      const output = block.querySelector<HTMLElement>('.mermaid-output')!
      try {
        const { svg } = await mermaid.render(`article-diagram-${diagramId}-${version}-${index}`, source.textContent ?? '')
        if (!mounted || version !== diagramVersion || !block.isConnected) return
        output.innerHTML = svg
        setDiagramState(block, 'ready')
      } catch {
        if (!mounted || version !== diagramVersion || !block.isConnected) return
        setDiagramState(block, 'error')
      }
    }
  } catch {
    if (!mounted || version !== diagramVersion) return
    for (const block of blocks) {
      if (block.isConnected) setDiagramState(block, 'error')
    }
  }
}

watch(rendered, renderDiagrams, { flush: 'post' })

function blogEmbedOrigin(frame: HTMLIFrameElement) {
  try {
    const url = new URL(frame.src)
    return url.origin === 'https://media.ovovk.com' && url.pathname.startsWith('/blog/') && url.pathname.endsWith('.html')
      ? url.origin : null
  } catch { return null }
}
function measureEmbed(frame: HTMLIFrameElement) {
  if (!blogEmbedOrigin(frame)) return
  frame.contentWindow?.postMessage({
    type: 'blog-embed:measure',
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }, '*')
}
function measureEmbeds() {
  markdownRoot.value?.querySelectorAll<HTMLIFrameElement>('iframe').forEach(measureEmbed)
}
function onEmbedLoad(event: Event) {
  if (event.target instanceof HTMLIFrameElement) measureEmbed(event.target)
}
function resizeEmbed(event: MessageEvent) {
  const data = event.data
  if (!data || data.type !== 'blog-embed:resize' || typeof data.height !== 'number' || !Number.isFinite(data.height) || data.height <= 0) return
  const frame = [...(markdownRoot.value?.querySelectorAll<HTMLIFrameElement>('iframe') ?? [])]
    .find(frame => frame.contentWindow === event.source)
  if (!frame) return
  const origin = blogEmbedOrigin(frame)
  // Script-only sandboxed documents have an opaque origin; verify their exact window as well as the configured URL.
  const opaqueOrigin = event.origin === 'null' && frame.hasAttribute('sandbox') && !frame.sandbox.contains('allow-same-origin')
  if (!origin || (event.origin !== origin && !opaqueOrigin)) return
  frame.style.height = Math.ceil(Math.min(3000, Math.max(120, data.height))) + 'px'
}
onMounted(() => {
  mounted = true
  window.addEventListener('message', resizeEmbed)
  themeObserver = new MutationObserver(() => {
    measureEmbeds()
    renderDiagrams()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  measureEmbeds()
  renderDiagrams()
})
onUpdated(measureEmbeds)

const feedbackTimers = new Set<ReturnType<typeof setTimeout>>()
async function copyCode(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const button = target?.closest<HTMLButtonElement>('.code-copy')
  const code = button?.closest('.code-block')?.querySelector('pre code')
  if (!button || !code || button.disabled) return
  const label = button.querySelector('span')!
  try {
    await navigator.clipboard.writeText(code.textContent ?? '')
    label.textContent = '已复制'
  } catch {
    label.textContent = '请手动选择'
  }
  button.disabled = true
  const timer = setTimeout(() => {
    label.textContent = '复制'
    button.disabled = false
    feedbackTimers.delete(timer)
  }, 1800)
  feedbackTimers.add(timer)
}
onUnmounted(() => {
  mounted = false
  diagramVersion++
  feedbackTimers.forEach(clearTimeout)
  window.removeEventListener('message', resizeEmbed)
  themeObserver?.disconnect()
})
</script>

<template>
  <div ref="markdownRoot" class="markdown-body" @click="copyCode" @load.capture="onEmbedLoad" v-html="rendered" />
</template>

<style>
.markdown-body {
  --color-fg-default: var(--text-main);
  --color-fg-muted: var(--text-secondary);
  --color-canvas-default: transparent;
  --color-canvas-subtle: var(--bg-soft);
  --color-border-default: var(--border-color);
  --color-border-muted: var(--border-color);
  width: 100%; min-width: 0; background: transparent; color: var(--text-main);
  font-family: inherit; font-size: 18px; line-height: 1.75; overflow-wrap: anywhere;
}
.markdown-body h1, .markdown-body h2, .markdown-body h3,
.markdown-body h4, .markdown-body h5, .markdown-body h6 {
  color: var(--text-main); font-weight: 700; line-height: 1.4;
  scroll-margin-top: 18px; border: 0; padding: 0; margin: 32px 0 16px;
}
.markdown-body h1 { font-size: 30px; }
.markdown-body h2 { font-size: 25px; margin-top: 32px; margin-bottom: 14px; }
.markdown-body h3 { font-size: 21px; margin-top: 24px; margin-bottom: 12px; }
.markdown-body h4 { font-size: 19px; }
.markdown-body > :first-child { margin-top: 0; }
.markdown-body p, .markdown-body ul, .markdown-body ol { margin: 0 0 16px; }
.markdown-body li + li { margin-top: 6px; }
.markdown-body li > p { margin-bottom: 8px; }
.markdown-body a { color: var(--accent); text-decoration: underline; text-underline-offset: 4px; }
.markdown-body .heading-anchor { margin-left: .55em; text-decoration: none; font-size: .8em; font-weight: 400; opacity: 0; }
.markdown-body :is(h1,h2,h3,h4,h5,h6):hover .heading-anchor,
.markdown-body .heading-anchor:focus-visible { opacity: 1; }
.markdown-body blockquote { margin: 24px 0; padding: 1px 0 1px 20px; color: var(--text-secondary); border-left: 2px solid var(--accent); }
.markdown-body blockquote > :last-child { margin-bottom: 0; }
.markdown-body .article-alert { margin: 24px 0; padding: 14px 18px; border-left: 4px solid var(--alert-color); background: color-mix(in srgb, var(--alert-color) 6%, var(--bg-body)); color: var(--text-main); }
.markdown-body .article-alert > :last-child { margin-bottom: 0; }
.markdown-body .article-alert .article-alert-title { display: flex; align-items: center; gap: 8px; margin: 0 0 8px; color: var(--alert-color); font-weight: 600; line-height: 1.5; }
.markdown-body .article-alert-title > i { flex-shrink: 0; font-size: 20px; font-weight: 400; line-height: 1; }
.markdown-body .article-alert-note { --alert-color: #0969da; }
.markdown-body .article-alert-tip { --alert-color: #1a7f37; }
.markdown-body .article-alert-important { --alert-color: #8250df; }
.markdown-body .article-alert-warning { --alert-color: #8a6100; }
.markdown-body .article-alert-caution { --alert-color: #cf222e; }
html.dark .markdown-body .article-alert-note { --alert-color: #79b8ff; }
html.dark .markdown-body .article-alert-tip { --alert-color: #7bc98c; }
html.dark .markdown-body .article-alert-important { --alert-color: #c4a7ff; }
html.dark .markdown-body .article-alert-warning { --alert-color: #e3b341; }
html.dark .markdown-body .article-alert-caution { --alert-color: #ff8e94; }
.markdown-body :not(pre) > code { padding: .15em .35em; border-radius: 3px; background: var(--bg-soft); color: var(--accent); font-size: .87em; overflow-wrap: anywhere; }
.markdown-body img { display: block; max-width: 100%; height: auto; margin: 24px auto; border-radius: 4px; background: transparent; }
.markdown-body hr { height: 1px; margin: 36px 0; background: var(--border-color); border: 0; }
.markdown-body .mermaid-block { min-width: 0; max-width: 100%; margin: 24px 0; }
.markdown-body .mermaid-loading { display: flex; align-items: center; justify-content: center; gap: clamp(12px, 3vw, 36px); min-height: 160px; padding: 28px 20px; border-radius: 8px; background: var(--bg-soft); }
.markdown-body .mermaid-loading .skeleton-line { width: 22%; max-width: 140px; height: 44px; background: var(--border-color); }
.markdown-body .mermaid-loading .skeleton-line:nth-child(2) { height: 60px; }
.markdown-body .mermaid-error { padding: 28px 20px; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); text-align: center; font-size: 14px; }
.markdown-body .mermaid-output { max-width: 100%; overflow-x: auto; padding: 8px 0; }
.markdown-body .mermaid-output svg { display: block; max-width: none; margin-inline: auto; }
.markdown-body :is(.mermaid-source, .mermaid-loading, .mermaid-output, .mermaid-error)[hidden] { display: none; }
.markdown-body .katex { font-size: 1.1em; overflow-wrap: normal; }
.markdown-body .katex-block { max-width: 100%; overflow-x: auto; overflow-y: hidden; padding-block: 4px; }
.markdown-body .katex-display { width: max-content; min-width: 100%; margin: .5em 0; }
.markdown-body .code-block { overflow: hidden; margin: 20px 0; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-soft); }
.markdown-body .code-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 8px 16px; border-bottom: 1px solid var(--border-color); font-size: 13px; line-height: 1.7; color: var(--text-secondary); }
.markdown-body .code-toolbar > span { font-weight: 600; }
.markdown-body .code-copy { display: inline-flex; align-items: center; gap: 5px; padding: 2px 0; border: 0; background: none; font-size: 13px; color: var(--text-secondary); }
.markdown-body .code-copy:hover { color: var(--accent); }
.markdown-body .code-scroll { display: flex; max-height: 560px; overflow: auto; padding: 15px 0; font: 14px/1.8 Consolas, 'SFMono-Regular', 'Courier New', monospace; }
.markdown-body .code-lines { position: sticky; left: 0; flex-shrink: 0; min-width: 42px; padding: 0 12px; border-right: 1px solid var(--border-color); background: var(--bg-soft); color: var(--text-muted); text-align: right; user-select: none; }
.markdown-body .code-lines span { display: block; }
.markdown-body pre { margin: 24px 0; padding: 16px; border: 0; border-radius: 5px; background: var(--bg-soft); color: var(--text-main); overflow: auto; font: 14px/1.8 Consolas, 'SFMono-Regular', 'Courier New', monospace; text-shadow: none; }
.markdown-body .code-scroll pre { flex: 1; overflow: visible; margin: 0; padding: 0 18px; border-radius: 0; }
.markdown-body pre code { display: block; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; white-space: pre; word-break: normal; overflow-wrap: normal; tab-size: 2; text-shadow: none; }
.markdown-body .token:is(.comment,.prolog,.doctype,.cdata) { color: var(--text-muted); }
.markdown-body .token:is(.punctuation,.operator) { color: var(--text-secondary); }
.markdown-body .token:is(.property,.tag,.constant,.symbol,.deleted,.number,.boolean) { color: #a56851; }
.markdown-body .token:is(.selector,.attr-name,.string,.char,.builtin,.inserted) { color: #627c42; }
.markdown-body .token:is(.keyword,.atrule,.attr-value) { color: #86729b; }
.markdown-body .token:is(.function,.class-name) { color: #4d7e8a; }
html.dark .markdown-body .token:is(.property,.tag,.constant,.symbol,.deleted,.number,.boolean) { color: #d4a184; }
html.dark .markdown-body .token:is(.selector,.attr-name,.string,.char,.builtin,.inserted) { color: #b3c88e; }
html.dark .markdown-body .token:is(.keyword,.atrule,.attr-value) { color: #bea7ce; }
html.dark .markdown-body .token:is(.function,.class-name) { color: #94bdc4; }
.markdown-body .table-container { max-width: 100%; margin: 24px 0; overflow: auto; }
.markdown-body table { display: table; width: max-content; min-width: 100%; margin: 0; font-size: 15px; }
.markdown-body table tr, .markdown-body table tr:nth-child(2n) { background: transparent; border: 0; }
.markdown-body table th, .markdown-body table td { padding: 12px 16px; border: 0; border-bottom: 1px solid var(--border-color); text-align: left; }
.markdown-body table th { color: var(--text-secondary); font-weight: 600; }
@media (max-width: 700px) {
  .markdown-body { font-size: 17px; }
  .markdown-body h2 { font-size: 23px; }
  .markdown-body h3 { font-size: 18px; }
  .markdown-body .code-toolbar { padding-inline: 12px; }
  .markdown-body .code-lines { min-width: 34px; padding-inline: 9px; }
  .markdown-body .code-scroll pre { padding-inline: 12px; }
  .markdown-body table th, .markdown-body table td { padding: 10px 12px; }
}
</style>
