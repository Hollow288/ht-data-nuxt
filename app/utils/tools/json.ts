export interface JsonFormatOptions {
  expandNested?: boolean
  indent?: 2 | 4 | '\t'
  compact?: boolean
}

export interface JsonFormatResult {
  text: string
  expandedCount: number
}

export class JsonFormatError extends Error {
  line?: number
  column?: number

  constructor(message: string, line?: number, column?: number) {
    super(message)
    this.name = 'JsonFormatError'
    this.line = line
    this.column = column
  }
}

// Some engines omit the offset for unexpected values. Track grammar states to
// locate those errors without depending on the browser's error-message format.
function findErrorOffset(source: string) {
  type State = 'value' | 'array-start' | 'object-start' | 'key' | 'colon' | 'array-end' | 'object-end' | 'end'
  const parents: State[] = []
  let state: State = 'value'
  const tokens = source.matchAll(/"(?:\\(?:["\\/bfnrt]|u[\da-fA-F]{4})|[^"\\\u0000-\u001f])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[^\x20\t\r\n]/g)
  const close = () => { parents.pop(); state = parents[parents.length - 1] ?? 'end' }
  for (const match of tokens) {
    const token = match[0]
    switch (state as State) {
      case 'value':
      case 'array-start':
        if (state === 'array-start' && token === ']') { close(); break }
        if (token === '{' || token === '[') {
          parents.push(token === '{' ? 'object-end' : 'array-end')
          state = token === '{' ? 'object-start' : 'array-start'
        } else if (/^(?:"[\s\S]*"|-?\d[\s\S]*|true|false|null)$/.test(token)) {
          state = parents[parents.length - 1] ?? 'end'
        } else return match.index
        break
      case 'object-start':
      case 'key':
        if (state === 'object-start' && token === '}') { close(); break }
        if (token.startsWith('"') && token.length >= 2) state = 'colon'
        else return match.index
        break
      case 'colon':
        if (token !== ':') return match.index
        state = 'value'
        break
      case 'array-end':
      case 'object-end':
        if (token === (state === 'array-end' ? ']' : '}')) close()
        else if (token === ',') state = state === 'array-end' ? 'value' : 'key'
        else return match.index
        break
      case 'end': return match.index
    }
  }
  return source.length
}

function validateJson(source: string) {
  try {
    JSON.parse(source)
  } catch (error) {
    const message = error instanceof Error ? error.message : '无效的 JSON'
    const position = message.match(/\bposition (\d+)\b/)
    const offset = position ? Number(position[1]) : findErrorOffset(source)
    const before = source.slice(0, offset).split(/\r\n|\r|\n/)
    const line = before.length
    const column = before[before.length - 1]!.length + 1
    throw new JsonFormatError(`JSON 格式错误（第 ${line} 行，第 ${column} 列）：${message}`, line, column)
  }
}

// Only unwrap strings that ultimately contain an object or array. Values such as
// "001", "false" and "null" must keep their original types and content.
function unwrapContainer(token: string) {
  let source = token
  let layers = 0
  while (layers < 64) {
    let value: unknown
    try { value = JSON.parse(source) } catch { return undefined }
    if (value !== null && typeof value === 'object') return { source, layers }
    if (typeof value !== 'string') return undefined
    source = value.trim()
    if (!['{', '[', '"'].includes(source[0] ?? '')) return undefined
    layers++
  }
  throw new JsonFormatError('JSON 字符串的转义层数超过 64 层，请减少嵌套后重试。')
}

export function formatJson(input: string, options: JsonFormatOptions = {}): JsonFormatResult {
  const source = input.replace(/^\uFEFF/, '')
  if (!source.trim()) throw new JsonFormatError('请先输入 JSON。')
  validateJson(source)

  let expandedCount = 0
  function tokenize(text: string, level: number): string[] {
    // Keep the original number tokens instead of serializing parsed JS numbers,
    // so long IDs, decimals, exponent notation and -0 remain lossless.
    const tokens = text.match(/"(?:\\[\s\S]|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],:]/g)!
    if (options.expandNested === false) return tokens
    const result: string[] = []
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index]!
      // Object keys are never transformed, even when they resemble JSON.
      const nested = token.startsWith('"') && tokens[index + 1] !== ':' ? unwrapContainer(token) : undefined
      if (!nested) {
        result.push(token)
        continue
      }
      if (level >= 64) throw new JsonFormatError('JSON 字符串嵌套超过 64 层，请减少嵌套后重试。')
      expandedCount += nested.layers
      for (const child of tokenize(nested.source, level + 1)) result.push(child)
    }
    return result
  }

  const tokens = tokenize(source, 0)
  if (options.compact) return { text: tokens.join(''), expandedCount }

  const unit = options.indent === '\t' ? '\t' : ' '.repeat(options.indent ?? 2)
  const output: string[] = []
  let depth = 0
  const newline = () => output.push('\n', unit.repeat(depth))
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!
    if (token === '{' || token === '[') {
      output.push(token)
      depth++
      if (tokens[index + 1] !== (token === '{' ? '}' : ']')) newline()
    } else if (token === '}' || token === ']') {
      depth--
      if (tokens[index - 1] !== (token === '}' ? '{' : '[')) newline()
      output.push(token)
    } else if (token === ',') {
      output.push(token)
      newline()
    } else if (token === ':') {
      output.push(': ')
    } else {
      output.push(token)
    }
  }
  return { text: output.join(''), expandedCount }
}
