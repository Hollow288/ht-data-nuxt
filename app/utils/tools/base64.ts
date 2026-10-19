export function stripBase64Prefix(raw: string) {
  const trimmed = raw.trim()
  const match = trimmed.match(/^data:[^,]*;base64,/i)
  return (match ? trimmed.slice(match[0].length) : trimmed).replace(/\s+/g, '')
}

export function encodeText(text: string) {
  const bytes = new TextEncoder().encode(text)
  const parts: string[] = []
  for (let i = 0; i < bytes.length; i += 0x8000) parts.push(String.fromCharCode(...bytes.subarray(i, i + 0x8000)))
  return btoa(parts.join(''))
}

export function decodeText(raw: string) {
  const binary = atob(stripBase64Prefix(raw))
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, char => char.charCodeAt(0)))
}

export function imageDataUrl(raw: string) {
  const base64 = stripBase64Prefix(raw)
  const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0))
  const prefix = Array.from(bytes.subarray(0, 12))
  let mime = raw.trim().match(/^data:(image\/[\w.+-]+);base64,/i)?.[1]?.toLowerCase()
  if (!mime) {
    if (prefix[0] === 0xff && prefix[1] === 0xd8) mime = 'image/jpeg'
    else if (prefix[0] === 0x47 && prefix[1] === 0x49 && prefix[2] === 0x46) mime = 'image/gif'
    else if (prefix[0] === 0x52 && prefix[8] === 0x57 && prefix[9] === 0x45) mime = 'image/webp'
    else if (prefix[0] === 0x42 && prefix[1] === 0x4d) mime = 'image/bmp'
    else mime = 'image/png'
  }
  if (!bytes.length) throw new Error('图片数据为空')
  return `data:${mime};base64,${base64}`
}
