/** Keep reader navigation and rendered Markdown anchors in sync, including repeated headings. */
export function markdownHeadingId(text: string, counts: Map<string, number>) {
  const base = text.toLowerCase().replace(/\s+/g, '-') || 'section'
  let count = counts.get(base) ?? 0
  let id = count ? `${base}-${count}` : base
  while (counts.has(`used:${id}`)) id = `${base}-${++count}`
  counts.set(base, count + 1)
  counts.set(`used:${id}`, 1)
  return id
}

export function markdownHeadingText(token?: { content: string; children: { type: string; content: string }[] | null }) {
  if (!token) return ''
  if (!token.children) return token.content
  return token.children.map(child => {
    if (['text', 'code_inline', 'image'].includes(child.type)) return child.content
    if (['softbreak', 'hardbreak'].includes(child.type)) return ' '
    return ''
  }).join('')
}
