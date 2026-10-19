export const toOneLine = (text: string) => text.replace(/\s+/g, ' ').trim()

export function caesarShift(text: string, shift: number) {
  return text.replace(/[a-zA-Z]/g, char => {
    const base = char >= 'a' ? 97 : 65
    return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base)
  })
}

export function unicodeEncode(text: string) {
  return Array.from(text).map(char => {
    const code = char.codePointAt(0)!
    if (code > 0xffff) return `\\u{${code.toString(16)}}`
    return code > 0x7e || code < 0x20 ? `\\u${code.toString(16).padStart(4, '0')}` : char
  }).join('')
}

export function unicodeDecode(text: string) {
  return text.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_, extended, basic) => String.fromCodePoint(parseInt(extended ?? basic, 16)))
}
