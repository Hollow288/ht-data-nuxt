import MarkdownIt from 'markdown-it'
import markdownKatex from '@vscode/markdown-it-katex'
import cjkFriendly from 'markdown-it-cjk-friendly'

// The plugin publishes a CommonJS default; support both Node SSR and Vite interop.
const katexPlugin = 'default' in markdownKatex ? markdownKatex.default as typeof markdownKatex : markdownKatex

const alertTypes = {
  NOTE: { title: '注意', icon: 'ri-information-line' },
  TIP: { title: '提示', icon: 'ri-lightbulb-line' },
  IMPORTANT: { title: '重要', icon: 'ri-chat-quote-line' },
  WARNING: { title: '警告', icon: 'ri-alert-line' },
  CAUTION: { title: '危险', icon: 'ri-error-warning-line' },
} as const

const diagramToolbar = `<div class="mermaid-toolbar" role="toolbar" aria-label="流程图缩放" hidden>
<span class="mermaid-label">流程图</span>
<button type="button" data-diagram-action="out" aria-label="缩小流程图" title="缩小流程图"><i class="ri-zoom-out-line" aria-hidden="true"></i></button>
<output class="mermaid-zoom" aria-label="流程图缩放比例" aria-live="polite">100%</output>
<button type="button" data-diagram-action="in" aria-label="放大流程图" title="放大流程图"><i class="ri-zoom-in-line" aria-hidden="true"></i></button>
<button type="button" data-diagram-action="fit" aria-label="流程图适应宽度" title="适应宽度" aria-pressed="true"><i class="ri-expand-width-line" aria-hidden="true"></i></button>
<button type="button" data-diagram-action="reset" aria-label="流程图恢复原始大小" title="原始大小（100%）"><i class="ri-refresh-line" aria-hidden="true"></i></button>
</div>`

/** Recognize GitHub alert markers only on the first line of a blockquote. */
function githubAlerts(md: MarkdownIt) {
  md.core.ruler.after('block', 'github_alerts', state => {
    const { tokens } = state
    for (let index = 0; index < tokens.length; index++) {
      const opening = tokens[index]!
      const paragraph = tokens[index + 1]
      const inline = tokens[index + 2]
      if (opening.type !== 'blockquote_open' || paragraph?.type !== 'paragraph_open' || inline?.type !== 'inline') continue
      const marker = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\n|$)/.exec(inline.content)
      if (!marker) continue
      const closing = tokens.find((token, position) => position > index && token.type === 'blockquote_close' && token.level === opening.level)
      if (!closing) continue

      const type = marker[1] as keyof typeof alertTypes
      const { title, icon } = alertTypes[type]
      opening.tag = closing.tag = 'div'
      opening.attrJoin('class', `article-alert article-alert-${type.toLowerCase()}`)
      opening.attrSet('role', 'note')
      const heading = new state.Token('html_block', '', 0)
      heading.block = true
      heading.level = paragraph.level
      heading.content = `<p class="article-alert-title"><i class="${icon}" aria-hidden="true"></i>${title}</p>\n`

      // Run before inline parsing so emphasis, links, math and lists stay intact.
      inline.content = inline.content.slice(marker[0].length)
      if (!inline.content) tokens.splice(index + 1, 3, heading)
      else tokens.splice(index + 1, 0, heading)
    }
  })
}

/** Use the same syntax rules for article content and its directory. */
export function createArticleMarkdown() {
  // Articles preserve author-entered line breaks, including inside list items.
  const md = new MarkdownIt({ html: true, linkify: true, breaks: true })
    .use(githubAlerts)
    .use(cjkFriendly)
    .use(katexPlugin, { throwOnError: false, trust: false, strict: 'ignore' })
  const defaultFence = md.renderer.rules.fence!
  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index]!
    if (token.info.trim().split(/\s+/)[0]?.toLowerCase() !== 'mermaid') {
      return defaultFence(tokens, index, options, env, self)
    }
    // Hide source from the first paint while the client loads the diagram renderer.
    return `<div class="mermaid-block" aria-busy="true">${diagramToolbar}<div class="mermaid-loading" role="status" aria-label="正在加载流程图"><span class="skeleton-line" aria-hidden="true"></span><span class="skeleton-line" aria-hidden="true"></span><span class="skeleton-line" aria-hidden="true"></span></div><div class="mermaid-output" role="region" aria-label="文章流程图" tabindex="0" hidden></div><div class="mermaid-error" role="status" hidden>流程图加载失败，请刷新页面重试。</div><pre class="mermaid-source" hidden><code>${md.utils.escapeHtml(token.content)}</code></pre></div>\n`
  }
  return md
}
