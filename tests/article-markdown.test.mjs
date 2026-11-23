import assert from 'node:assert/strict'
import test from 'node:test'
import { createArticleMarkdown } from '../app/utils/articleMarkdown.ts'
import { markdownHeadingId, markdownHeadingText } from '../app/utils/markdown.ts'

test('renders all five GitHub alerts with a title and formatted content', () => {
  const md = createArticleMarkdown()
  for (const [type, title] of Object.entries({ NOTE: '注意', TIP: '提示', IMPORTANT: '重要', WARNING: '警告', CAUTION: '危险' })) {
    const html = md.render(`> [!${type}]\n> **问题**\n> 包含 \`code\` 和 [链接](https://example.com)。\n>\n> - 列表内容`)
    assert.match(html, new RegExp(`class="article-alert article-alert-${type.toLowerCase()}" role="note"`))
    assert.ok(html.includes(`aria-hidden="true"></i>${title}</p>`))
    assert.ok(!html.includes(`[!${type}]`))
    assert.match(html, /<strong>问题<\/strong><br>\n包含 <code>code<\/code>/)
    assert.match(html, /<a href="https:\/\/example.com">链接<\/a>/)
    assert.match(html, /<ul>\n<li>列表内容<\/li>\n<\/ul>\n<\/div>/)
  }
})

test('alert-only marker paragraphs do not leave empty paragraphs or breaks', () => {
  const html = createArticleMarkdown().render('> [!TIP]  \n>\n> 下一段\n\n> [!NOTE]')
  assert.equal((html.match(/class="article-alert /g) ?? []).length, 2)
  assert.match(html, /<p>下一段<\/p>/)
  assert.ok(!html.includes('<p></p>'))
  assert.ok(!html.includes('<br>'))
})

test('alerts support nested quotes and list items without swallowing following content', () => {
  const html = createArticleMarkdown().render('> [!TIP]\n> 外层\n>\n> > [!WARNING]\n> > 内层\n\n- 列表\n\n  > [!NOTE]\n  > 列表提示\n\n后续正文')
  assert.equal((html.match(/class="article-alert /g) ?? []).length, 3)
  assert.equal((html.match(/<div /g) ?? []).length, (html.match(/<\/div>/g) ?? []).length)
  assert.match(html, /内层<\/p>\n<\/div>\n<\/div>/)
  assert.match(html, /列表提示<\/p>\n<\/div>\n<\/li>/)
  assert.ok(html.endsWith('<p>后续正文</p>\n'))
})

test('ordinary quotes, unknown markers and literal alert examples stay unchanged', () => {
  const md = createArticleMarkdown()
  for (const source of [
    '> 普通引用', '> [!UNKNOWN]\n> 正文', '> 先有正文\n> [!TIP]',
    '> [!TIP] 同一行的普通文本', '> \\[!TIP]\n> 正文', '> `[!TIP]`\n> 正文',
    '```markdown\n> [!TIP]\n> 原始示例\n```', '[!TIP]\n普通正文',
  ]) {
    assert.ok(!md.render(source).includes('article-alert'), source)
  }
  assert.match(md.render('> 普通引用'), /^<blockquote>\n<p>普通引用<\/p>\n<\/blockquote>/)
})

test('source newlines render in paragraphs, quotes and numbered list items', () => {
  const html = createArticleMarkdown().render('第一行\n第二行\n\n1. **锁分离为什么能提升并发？**\n   在 `ArrayBlockingQueue` 里。\n2. **第二问**  \n   回答\n\n> **问题**\n> 解释')
  assert.match(html, /<p>第一行<br>\n第二行<\/p>/)
  assert.match(html, /<li><strong>锁分离为什么能提升并发？<\/strong><br>\n在 <code>ArrayBlockingQueue<\/code> 里。<\/li>/)
  assert.match(html, /<li><strong>第二问<\/strong><br>\n回答<\/li>/)
  assert.match(html, /<blockquote>\n<p><strong>问题<\/strong><br>\n解释<\/p>/)
})

test('preserving prose line breaks does not insert breaks into code or diagrams', () => {
  const html = createArticleMarkdown().render('```java\nline1();\nline2();\n```\n\n`literal code`\n\n```mermaid\nflowchart LR\nA --> B\n```')
  assert.match(html, /line1\(\);\nline2\(\);/)
  assert.match(html, /flowchart LR\nA --&gt; B/)
  assert.ok(!html.includes('<br>'))
})

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
  assert.match(html, /class="mermaid-toolbar"[^>]* hidden/)
  assert.equal((html.match(/data-diagram-action=/g) ?? []).length, 4)
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
