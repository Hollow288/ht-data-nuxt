export function parseEmail(value: string) {
  const match = value.trim().match(/^([A-Za-z0-9._%+\-]+)@([A-Za-z0-9.\-]+\.[A-Za-z]{2,})$/)
  return match ? { local: match[1]!, domain: match[2]! } : null
}

export function toSequenceLabel(index: number): string {
  let result = ''
  for (let num = index; num >= 0; num = Math.floor(num / 26) - 1) result = String.fromCharCode(97 + num % 26) + result
  return result
}

export function generateSubEmails(email: string, count: number, mode: 'sequence' | 'random', length: number) {
  const parsed = parseEmail(email)
  if (!parsed || !Number.isFinite(count) || count <= 0) return []
  const safeCount = Math.min(1000, Math.floor(count))
  const safeLength = Number.isFinite(length) ? Math.max(2, Math.min(16, Math.floor(length))) : 6
  const used = new Set<string>()
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: safeCount }, (_, index) => {
    let label = toSequenceLabel(index)
    if (mode === 'random') {
      do { label = Array.from(crypto.getRandomValues(new Uint32Array(safeLength)), value => alphabet[value % alphabet.length]).join('') } while (used.has(label))
      used.add(label)
    }
    return `${parsed.local}+${label}@${parsed.domain}`
  })
}
