import assert from 'node:assert/strict'
import test from 'node:test'
import { createArticleMarkdown } from '../app/utils/articleMarkdown.ts'
import { markdownHeadingId, markdownHeadingText } from '../app/utils/markdown.ts'

test('Chinese emphasis works next to full-width punctuation and surrounding words', () => {
  const html = createArticleMarkdown().render('在**特定硬件介质（内存 vs 磁盘）**或**特定访问模式（读写）**下，和**磁盘页（Page）**对齐。')
  assert.equal((html.match(/<strong>/g) ?? []).length, 3)
  assert.ok(!html.includes('**'))
})

test('renders inline and display math, including blockquotes and lists', () => {
  const html = createArticleMarkdown().render(String.raw`黑高 $bh$，最长路径 $2 \times bh$。

> $$h \le 2\log_2(n + 1)$$

- 容量估算：

  $$N \approx (d + 1)^{h - 1} \times L$$`)
  assert.equal((html.match(/class="katex"/g) ?? []).length, 4)
  assert.equal((html.match(/class="katex-block"/g) ?? []).length, 2)
  assert.ok(!html.includes('katex-error'))
})

test('Mermaid starts with an accessible skeleton and hidden escaped source', () => {
  const html = createArticleMarkdown().render('```mermaid\nflowchart LR\n A["<script>alert(1)</script>"]-->B\n```')
  assert.match(html, /class="mermaid-block" aria-busy="true"/)
  assert.match(html, /class="mermaid-loading" role="status" aria-label="正在加载流程图"/)
  assert.match(html, /class="mermaid-output"[^>]* hidden/)
  assert.match(html, /class="mermaid-error"[^>]* hidden/)
  assert.match(html, /class="mermaid-source" hidden/)
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.ok(!html.includes('<script>'))
})

test('ordinary code and inline code preserve literal math and Markdown', () => {
  const html = createArticleMarkdown().render('```java\nString s = "$bh$ **树**";\n```\n\n`$bh$ **树**`')
  assert.match(html, /class="language-java"/)
  assert.ok(html.includes('$bh$ **树**'))
  assert.ok(!html.includes('class="katex"'))
  assert.ok(!html.includes('mermaid-block'))
})

test('malformed math does not stop the article and cannot inject trusted HTML', () => {
  const html = createArticleMarkdown().render(String.raw`$\notARealCommand{x}$

$\href{javascript:alert(1)}{link}$

后续正文`)
  assert.match(html, /后续正文/)
  assert.ok(!html.includes('href="javascript:'))
})

test('heading text is shared with the directory, including formatted math', () => {
  const md = createArticleMarkdown()
  const tokens = md.parse('## **磁盘页（Page）**与 $bh$\n\n## **磁盘页（Page）**与 $bh$', {})
  const counts = new Map()
  const headings = tokens.flatMap((token, index) => token.type === 'heading_open'
    ? [markdownHeadingText(tokens[index + 1])] : [])
  assert.deepEqual(headings, ['磁盘页（Page）与 bh', '磁盘页（Page）与 bh'])
  assert.deepEqual(headings.map(text => markdownHeadingId(text, counts)), ['磁盘页（page）与-bh', '磁盘页（page）与-bh-1'])
})
