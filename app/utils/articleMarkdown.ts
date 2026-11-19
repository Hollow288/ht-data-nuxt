import MarkdownIt from 'markdown-it'
import markdownKatex from '@vscode/markdown-it-katex'
import cjkFriendly from 'markdown-it-cjk-friendly'

// The plugin publishes a CommonJS default; support both Node SSR and Vite interop.
const katexPlugin = 'default' in markdownKatex ? markdownKatex.default as typeof markdownKatex : markdownKatex

/** Use the same syntax rules for article content and its directory. */
export function createArticleMarkdown() {
  const md = new MarkdownIt({ html: true, linkify: true })
    .use(cjkFriendly)
    .use(katexPlugin, { throwOnError: false, trust: false, strict: 'ignore' })
  const defaultFence = md.renderer.rules.fence!
  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index]!
    if (token.info.trim().split(/\s+/)[0]?.toLowerCase() !== 'mermaid') {
      return defaultFence(tokens, index, options, env, self)
    }
    // Keep escaped source as a usable fallback if the diagram cannot be rendered.
    return `<div class="mermaid-block"><div class="mermaid-output" role="img" aria-label="文章流程图" tabindex="0" hidden></div><pre class="mermaid-source"><code>${md.utils.escapeHtml(token.content)}</code></pre></div>\n`
  }
  return md
}
