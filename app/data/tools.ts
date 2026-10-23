export interface ToolDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: '文字与编码' | '开发与安全' | '日常效率'
  keywords: string[]
}

export const tools: ToolDefinition[] = [
  { id: 'ocr', name: 'OCR 文字识别', description: '从图片或 PDF 中提取文字，支持置信度筛选与识别位置查看。', icon: 'ri-scan-2-line', category: '文字与编码', keywords: ['图片', 'pdf', '识别', '扫描'] },
  { id: 'twofa', name: '2FA 动态码', description: '输入 otpauth 链接或密钥，生成 TOTP / HOTP 验证码。', icon: 'ri-shield-keyhole-line', category: '开发与安全', keywords: ['otp', 'totp', 'hotp', '验证码', '密钥'] },
  { id: 'one-line', name: '文本压一行', description: '将多行文本合并为一行，自动折叠换行、制表符和多余空格。', icon: 'ri-text-wrap', category: '文字与编码', keywords: ['text', 'line', '压缩', '空白', '换行'] },
  { id: 'json', name: 'JSON 格式化', description: '格式化与压缩 JSON，支持递归展开嵌套、多层转义的 JSON 字符串。', icon: 'ri-braces-line', category: '开发与安全', keywords: ['json', 'format', '格式化', '压缩', '转义', '嵌套', '解析', 'context'] },
  { id: 'caesar', name: '凯撒密码破解', description: '枚举全部 25 种字母位移，过滤并复制可能的明文。', icon: 'ri-lock-unlock-line', category: '开发与安全', keywords: ['caesar', 'rot', '位移', '加密', '解密'] },
  { id: 'base64-image', name: 'Base64 / 图片 / 文字互转', description: '预览与下载 Base64 图片，也能转换图片和 UTF-8 文本。', icon: 'ri-image-2-line', category: '文字与编码', keywords: ['base64', 'image', 'utf-8', 'png', 'jpg', '编码', '解码'] },
  { id: 'encode', name: '编码 / 解码', description: 'URL 编码解码与 Unicode 转义互转，实时查看转换结果。', icon: 'ri-code-s-slash-line', category: '文字与编码', keywords: ['url', 'unicode', 'encode', 'decode', '转义', 'percent'] },
  { id: 'color', name: '颜色转换', description: 'HEX / RGB / HSL 色值互转，提供颜色预览与拾色器。', icon: 'ri-palette-line', category: '开发与安全', keywords: ['color', 'hex', 'rgb', 'hsl', '拾色器', '色值'] },
  { id: 'sub-email', name: '子邮箱批量生成', description: '使用 + 地址按顺序或随机生成邮箱别名，支持批量复制。', icon: 'ri-mail-add-line', category: '日常效率', keywords: ['email', 'plus', 'alias', '邮箱', '别名', '随机'] },
  { id: 'js-runner', name: 'JS 在线运行', description: '编辑并运行 JavaScript，支持 await、fetch 与控制台输出。', icon: 'ri-javascript-line', category: '开发与安全', keywords: ['javascript', 'playground', 'console', '脚本', '调试', '沙箱'] }
]

export function matchesToolQuery(tool: ToolDefinition, query: string) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const text = [tool.id, tool.name, tool.description, tool.category, ...tool.keywords].join(' ').toLowerCase()
  return words.every(word => text.includes(word))
}
