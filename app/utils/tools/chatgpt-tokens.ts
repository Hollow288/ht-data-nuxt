// Browser-only data conversion, adapted from the single-file converter audited on 2026-11-05.
// CPA schema checked against router-for-me/CLIProxyAPI v8.0.57 (c2f402b45643).
type JsonObject = Record<string, unknown>
export type TokenMode = 'normalize' | 'to-cpa' | 'to-sub'
export interface TokenOptions { compatibilityClaims?: boolean; now?: Date }
export interface TokenOutput { text: string; parts: BlobPart[]; name: string; mime: string; summary: string }
export interface TokenConversion {
  output: TokenOutput
  shape: string
  count: number
  backfilled: number
  duplicates: number
  warnings: string[]
}

interface ClaimsArgs {
  idToken: string; accountId: string; userId: string; organizationId: string
  projectId: string; email: string; planType: string; clientId: string
}

const CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann'
const AUTH = 'https://api.openai.com/auth'
const PROFILE = 'https://api.openai.com/profile'
const encoder = new TextEncoder()
const decoder = new TextDecoder()
const object = (value: unknown): JsonObject => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {}
const text = (...values: unknown[]) => values.map(value => typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '').find(Boolean) || ''
const bool = (value: unknown) => value === true || value === 1 || value === '1' || (typeof value === 'string' && value.trim().toLowerCase() === 'true')

function timestamp(value: unknown): number {
  const raw = text(value)
  if (!raw) return 0
  let seconds: number
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const numeric = Number(raw)
    seconds = numeric > 1e12 ? numeric / 1000 : numeric
  } else {
    // Also accept the old converter's "2026-11-05 18:00:00 +0800" output.
    const legacy = raw.replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/, '$1T$2$3:$4')
    const normalized = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(legacy) ? legacy.replace(' ', 'T') + 'Z' : legacy
    seconds = Date.parse(normalized) / 1000
  }
  return Number.isFinite(seconds) && seconds > 0 && seconds <= 8640000000000 ? Math.trunc(seconds) : 0
}

function firstTimestamp(...values: unknown[]) {
  return values.map(timestamp).find(value => value > 0) || 0
}

function iso(value: number) { return value ? new Date(value * 1000).toISOString() : '' }

function base64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function encodeJson(value: unknown) { return base64Url(encoder.encode(JSON.stringify(value))) }

function jwtPayload(token: string): JsonObject {
  try {
    const part = token.split('.')[1] || ''
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
    return object(JSON.parse(decoder.decode(Uint8Array.from(binary, char => char.charCodeAt(0)))))
  } catch { return {} }
}

function accountFromAuth(auth: JsonObject) {
  return text(auth.chatgpt_account_id, auth.account_id) || text(auth.chatgpt_account_user_id).split('__').slice(1).pop() || ''
}

function organizationFromAuth(idAuth: JsonObject, accessAuth: JsonObject) {
  const organizations = Array.isArray(idAuth.organizations) ? idAuth.organizations.map(object) : []
  return text(idAuth.organization_id, accessAuth.organization_id, (organizations.find(org => org.is_default) || organizations[0])?.id)
}

function compatibleToken(args: ClaimsArgs, now: Date) {
  if (!args.accountId) return args.idToken
  const payload = jwtPayload(args.idToken)
  const hasPayload = Object.keys(payload).length > 0
  const auth = { ...object(payload[AUTH]) }
  if (text(auth.chatgpt_account_id) && text(auth.account_id)) return args.idToken
  const accountId = text(auth.chatgpt_account_id, auth.account_id, args.accountId)
  auth.chatgpt_account_id = text(auth.chatgpt_account_id, accountId)
  auth.account_id = text(auth.account_id, accountId)
  if (args.userId) {
    auth.chatgpt_user_id = text(auth.chatgpt_user_id, auth.user_id, args.userId)
    auth.user_id = text(auth.user_id, auth.chatgpt_user_id, args.userId)
  }
  if (args.organizationId && !text(auth.organization_id)) auth.organization_id = args.organizationId
  if (args.projectId && !text(auth.project_id)) auth.project_id = args.projectId
  if (!text(auth.chatgpt_plan_type)) auth.chatgpt_plan_type = args.planType
  if (!hasPayload) {
    const seconds = Math.trunc(now.getTime() / 1000)
    Object.assign(payload, { aud: [args.clientId], email: args.email, iat: seconds, exp: seconds + 3600, iss: 'https://auth.openai.com', sub: args.userId || accountId })
  }
  const parts = args.idToken.split('.')
  // Compatibility data only: changing claims cannot produce a valid OAuth signature.
  const header = hasPayload && parts[0] ? parts[0] : encodeJson({ alg: 'RS256', typ: 'JWT', kid: 'compat' })
  const signature = hasPayload && parts[2] ? parts[2] : base64Url(encoder.encode('local_compat_signature'))
  return `${header}.${encodeJson({ ...payload, [AUTH]: auth })}.${signature}`
}

function normalizeRecord(value: unknown, options: TokenOptions, now: Date) {
  const item = object(value)
  const tokens = object(item.tokens)
  const credentials = object(item.credentials)
  const extra = object(item.extra)
  const user = object(item.user)
  const account = object(item.account)
  const provider = object(item.providerSpecificData)
  const accessToken = text(item.access_token, item.accessToken, credentials.access_token, credentials.accessToken, tokens.access_token, tokens.accessToken)
  const refreshToken = text(item.refresh_token, item.refreshToken, credentials.refresh_token, credentials.refreshToken, tokens.refresh_token, tokens.refreshToken)
  const sessionToken = text(item.session_token, item.sessionToken, credentials.session_token, credentials.sessionToken, tokens.session_token, tokens.sessionToken)
  const idToken = text(item.id_token, item.idToken, credentials.id_token, credentials.idToken, tokens.id_token, tokens.idToken)
  const siwc = object(item.siwc)
  if (!accessToken && !refreshToken && !sessionToken && !text(siwc.access_token, siwc.access, siwc.refresh_token)) return null
  const isSubAccount = item.type === 'oauth' && Object.keys(credentials).length > 0 && (!text(item.platform) || ['openai', 'chatgpt'].includes(text(item.platform)))
  if (text(item.type) && item.type !== 'codex' && !isSubAccount) throw new Error(`不支持凭证类型 ${text(item.type)}，此工具只转换 ChatGPT / Codex 凭证。`)
  const idPayload = jwtPayload(idToken)
  const accessPayload = jwtPayload(accessToken)
  const idAuth = object(idPayload[AUTH])
  const accessAuth = object(accessPayload[AUTH])
  const profile = object(accessPayload[PROFILE])
  const accountId = text(item.chatgpt_account_id, item.chatgptAccountId, item.account_id, account.id, provider.chatgptAccountId, provider.chatgpt_account_id, credentials.chatgpt_account_id, credentials.account_id, tokens.account_id, accountFromAuth(idAuth), accountFromAuth(accessAuth))
  const userId = text(item.chatgpt_user_id, item.chatgptUserId, user.id, provider.chatgptUserId, provider.chatgpt_user_id, credentials.chatgpt_user_id, idAuth.chatgpt_user_id, idAuth.user_id, accessAuth.chatgpt_user_id, accessAuth.user_id)
  const email = text(item.email, user.email, extra.email, credentials.email, provider.email, idPayload.email, profile.email, item.name, accountId, 'unknown-account')
  const organizationId = text(item.organization_id, credentials.organization_id, organizationFromAuth(idAuth, accessAuth))
  const projectId = text(item.project_id, credentials.project_id, item.workspace_id, credentials.workspace_id, idAuth.project_id, accessAuth.project_id)
  const planType = text(item.plan_type, item.planType, account.plan_type, account.planType, provider.chatgpt_plan_type, provider.chatgptPlanType, credentials.plan_type, idAuth.chatgpt_plan_type, accessAuth.chatgpt_plan_type, 'free')
  const clientId = text(item.client_id, credentials.client_id, CLIENT_ID)
  const cpaMetadata = { ...object(item.cpa_metadata), ...(item.type === 'codex' ? item : {}) }
  for (const key of ['type', 'id_token', 'access_token', 'refresh_token', 'session_token', 'account_id', 'last_refresh', 'email', 'expired', 'expires_at', 'plan_type', 'disabled', 'use_siwc', 'siwc', 'cpa_metadata']) delete cpaMetadata[key]
  const record = {
    version: Number.parseInt(text(item.version, 1), 10) || 1,
    platform: text(item.platform, 'chatgpt'), email,
    password: text(item.password), login_identity: text(item.login_identity), phone: text(item.phone),
    access_token: accessToken, refresh_token: refreshToken, session_token: sessionToken,
    id_token: options.compatibilityClaims ? compatibleToken({ idToken, accountId, userId, organizationId, projectId, email, planType, clientId }, now) : idToken,
    client_id: clientId, chatgpt_account_id: accountId, chatgpt_user_id: userId,
    organization_id: organizationId, project_id: projectId, workspace_id: text(item.workspace_id, projectId),
    created_at: timestamp(item.created_at), last_used: timestamp(item.last_used),
    expired: firstTimestamp(item.expired, item.expires_at, item.expires, item.expiresAt, credentials.expires_at, accessPayload.exp),
    last_refresh: iso(firstTimestamp(item.last_refresh, item.lastRefresh, item.last_refreshed_at, item.lastRefreshedAt, tokens.last_refresh, credentials.last_refresh)),
    status: text(item.status), source: text(item.source, item.notes, item.accessToken ? 'chatgpt_web_session' : item.tokens ? 'codex_input' : item.credentials ? 'sub_bundle_input' : ''),
    disabled: bool(item.disabled), auth_provider: text(item.auth_provider, item.authProvider),
    account_claims_email: text(item.account_claims_email, extra.email, idPayload.email, profile.email, email),
    plan_type: planType, privacy_mode: text(item.privacy_mode, extra.privacy_mode, 'training_off'),
    openai_oauth_responses_websockets_v2_enabled: bool(item.openai_oauth_responses_websockets_v2_enabled ?? extra.openai_oauth_responses_websockets_v2_enabled),
    openai_oauth_responses_websockets_v2_mode: text(item.openai_oauth_responses_websockets_v2_mode, extra.openai_oauth_responses_websockets_v2_mode, 'off'),
    ...(item.use_siwc !== undefined ? { use_siwc: bool(item.use_siwc) } : {}),
    ...(Object.keys(siwc).length ? { siwc: { ...siwc } } : {}),
    ...(Object.keys(cpaMetadata).length ? { cpa_metadata: cpaMetadata } : {})
  }
  if (record.login_identity && !record.phone && !record.login_identity.includes('@')) record.phone = record.login_identity
  return { record, changed: record.id_token !== idToken }
}

type TokenRecord = NonNullable<ReturnType<typeof normalizeRecord>>['record']

function parseItems(input: string) {
  const source = input.replace(/^\uFEFF/, '').trim()
  if (!source) throw new Error('请先粘贴凭证 JSON / JSONL，或读取本地文件。')
  const expand = (value: unknown): JsonObject[] => Array.isArray(value) ? value.flatMap(expand) : Array.isArray(object(value).accounts) ? (object(value).accounts as unknown[]).flatMap(expand) : Object.keys(object(value)).length ? [object(value)] : []
  let root: unknown
  try { root = JSON.parse(source) } catch { root = undefined }
  let items: JsonObject[]
  let suffix = 'JSON'
  if (root !== undefined) {
    items = expand(root)
    if (Array.isArray(root)) suffix = 'JSON 数组'
    if (Array.isArray(object(root).accounts)) return { items, shape: 'SUB bundle JSON' }
  } else {
    items = []
    suffix = 'JSONL'
    for (const [index, raw] of source.split(/\r?\n/).entries()) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      try { items.push(...expand(JSON.parse(line))) }
      catch { throw new Error(`第 ${index + 1} 行不是有效 JSON，请检查逗号、引号和换行。`) }
    }
  }
  const first = items[0] || {}
  const kind = first.accessToken ? 'ChatGPT Web session' : first.tokens ? 'Codex' : first.credentials || first.accounts ? 'SUB' : first.type === 'codex' ? 'CPA' : 'Unified'
  return { items, shape: `${kind} ${suffix}` }
}

function cpaPayload(record: TokenRecord): JsonObject {
  return {
    ...record.cpa_metadata,
    type: 'codex', id_token: record.id_token, access_token: record.access_token, refresh_token: record.refresh_token,
    account_id: record.chatgpt_account_id, last_refresh: record.last_refresh, email: record.email,
    expired: iso(record.expired), plan_type: record.plan_type, disabled: record.disabled,
    ...(record.session_token ? { session_token: record.session_token } : {}),
    ...(record.use_siwc !== undefined ? { use_siwc: record.use_siwc } : {}),
    ...(record.siwc ? { siwc: record.siwc } : {})
  }
}

function subAccount(record: TokenRecord): JsonObject {
  return {
    name: record.email, platform: 'openai', type: 'oauth',
    credentials: {
      access_token: record.access_token, chatgpt_account_id: record.chatgpt_account_id, chatgpt_user_id: record.chatgpt_user_id,
      client_id: record.client_id, email: record.email, expires_at: record.expired,
      id_token: record.id_token, organization_id: record.organization_id, plan_type: record.plan_type,
      refresh_token: record.refresh_token, session_token: record.session_token
    },
    extra: {
      email: record.email, auth_provider: record.auth_provider, source: record.source,
      openai_oauth_responses_websockets_v2_enabled: record.openai_oauth_responses_websockets_v2_enabled,
      openai_oauth_responses_websockets_v2_mode: record.openai_oauth_responses_websockets_v2_mode, privacy_mode: record.privacy_mode
    },
    concurrency: 10, priority: 1, rate_multiplier: 1, auto_pause_on_expired: true
  }
}

function utf8Prefix(value: string, maxBytes: number) {
  let output = ''
  let length = 0
  for (const char of value) {
    length += encoder.encode(char).length
    if (length > maxBytes) break
    output += char
  }
  return output
}

function accountFilename(email: string, index: number) {
  const safe = email.replace(/[\\/:*?"<>|\x00-\x1f]+/g, '_').replace(/\s+/g, '_')
  return `${utf8Prefix(`codex-${index + 1}-${safe || 'account'}`, 94)}.json`
}

function tarArchive(files: { name: string; text: string }[], now: Date): Uint8Array<ArrayBuffer> {
  const blocks: Uint8Array[] = []
  const octal = (value: number, size: number) => Math.trunc(value).toString(8).padStart(size - 1, '0') + '\0'
  for (const file of files) {
    const bytes = encoder.encode(file.text)
    const header = new Uint8Array(512)
    const write = (offset: number, value: string) => header.set(encoder.encode(value), offset)
    write(0, file.name)
    write(100, '0000600\0')
    write(108, '0000000\0')
    write(116, '0000000\0')
    write(124, octal(bytes.length, 12))
    write(136, octal(now.getTime() / 1000, 12))
    write(148, '        ')
    write(156, '0')
    write(257, 'ustar\0')
    write(263, '00')
    write(148, header.reduce((sum, byte) => sum + byte, 0).toString(8).padStart(6, '0') + '\0 ')
    blocks.push(header, bytes)
    if (bytes.length % 512) blocks.push(new Uint8Array(512 - bytes.length % 512))
  }
  blocks.push(new Uint8Array(1024))
  const result = new Uint8Array(blocks.reduce((sum, block) => sum + block.length, 0))
  let offset = 0
  for (const block of blocks) { result.set(block, offset); offset += block.length }
  return result
}

function buildOutput(records: TokenRecord[], mode: TokenMode, now: Date): TokenOutput {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const filename = (ext: string) => `chatgpt_${records.length}_${stamp}.${ext}`
  if (mode === 'normalize') {
    const content = records.map(record => JSON.stringify(record)).join('\n') + '\n'
    return { text: content, parts: [content], name: filename('jsonl'), mime: 'application/x-ndjson;charset=utf-8', summary: `已标准化 ${records.length} 条记录。` }
  }
  if (mode === 'to-cpa') {
    const files = records.map((record, index) => ({ name: accountFilename(record.email, index), text: JSON.stringify(cpaPayload(record), null, 2) }))
    if (files.length === 1) {
      const file = files[0]!
      return { ...file, parts: [file.text], mime: 'application/json;charset=utf-8', summary: '已生成 1 个 CPA Codex 凭证 JSON。' }
    }
    return {
      text: ['CPA .tar 包内文件：', ...files.map(file => `- ${file.name}`)].join('\n'), parts: [tarArchive(files, now)], name: filename('tar'), mime: 'application/x-tar',
      summary: `已生成 ${files.length} 个 CPA JSON 的 tar 包，请解压后导入各个 JSON。`
    }
  }
  if (mode !== 'to-sub') throw new Error('不支持的转换模式。')
  const content = JSON.stringify({ exported_at: now.toISOString(), proxies: [], accounts: records.map(subAccount) }, null, 2)
  return { text: content, parts: [content], name: filename('json'), mime: 'application/json;charset=utf-8', summary: `已生成含 ${records.length} 个账号的 sub2api bundle。` }
}

export function convertTokens(input: string, mode: TokenMode, options: TokenOptions = {}): TokenConversion {
  const now = options.now || new Date()
  const { items, shape } = parseItems(input)
  const records = new Map<string, { record: TokenRecord; changed: boolean }>()
  let duplicates = 0
  let skipped = 0
  for (const item of items) {
    const normalized = normalizeRecord(item, options, now)
    if (!normalized) { skipped++; continue }
    const record = normalized.record
    // Keep separate workspaces under the same email; the original page lost them.
    const key = record.chatgpt_account_id ? `${record.email.toLowerCase()}\0${record.chatgpt_account_id}` : `${record.email.toLowerCase()}\0${record.access_token || record.refresh_token || record.session_token || JSON.stringify(record.siwc)}`
    if (records.has(key)) duplicates++
    records.set(key, normalized)
  }
  const values = [...records.values()]
  if (!values.length) throw new Error('未找到有效凭证。请输入包含 access_token、accessToken、refresh_token 或 sessionToken 等字段的 JSON。')
  const rows = values.map(value => value.record)
  const backfilled = values.filter(value => value.changed).length
  const warnings: string[] = []
  if (duplicates) warnings.push(`合并了 ${duplicates} 条重复凭证，保留最后一条；不同账号 ID 的工作区会分别保留。`)
  if (skipped) warnings.push(`已跳过 ${skipped} 条不含凭证的记录。`)
  if (backfilled) warnings.push(`${backfilled} 条 id_token 已补全兼容字段，补全结果不能通过原始 OAuth 签名验证。`)
  if (rows.some(record => !record.access_token)) warnings.push('部分记录缺少外层 access_token；仅有 session_token 不足以完成 CPA API 认证。')
  if (mode === 'to-cpa') {
    if (rows.some(record => !record.refresh_token)) warnings.push('部分记录没有 refresh_token，外层访问凭证到期后无法用它自动续期；已有 SIWC 凭证由 CPA 独立处理。')
    if (rows.some(record => !record.expired)) warnings.push('部分记录没有可识别的到期时间，expired 将留空；转换不会延长凭证有效期。')
    if (rows.some(record => record.use_siwc && !text(record.siwc?.access_token, record.siwc?.access))) warnings.push('有记录启用了 use_siwc，但缺少 siwc.access_token；请在 CPA 中完成对应授权。')
  }
  if (mode === 'to-sub' && rows.some(record => !record.expired)) warnings.push('部分记录没有到期时间，expires_at 保留为 0；请在目标服务中核实有效期。')
  if (mode === 'to-sub' && rows.some(record => record.siwc || record.use_siwc !== undefined)) warnings.push('sub2api 输出仅映射外层凭证，不包含 CPA 专用的 SIWC 分区；需要保留它时请使用 CPA 或标准化模式。')
  return { output: buildOutput(rows, mode, now), shape, count: rows.length, backfilled, duplicates, warnings }
}

export function createTokenDemo(now = new Date()) {
  const exp = Math.floor(now.getTime() / 1000) + 864000
  const jwt = (payload: JsonObject) => `${encodeJson({ alg: 'RS256', typ: 'JWT', kid: 'demo' })}.${encodeJson(payload)}.demo_signature`
  const access = (index: number) => jwt({ exp, [AUTH]: { chatgpt_account_id: `acc_demo_${index}`, chatgpt_user_id: `user_demo_${index}`, chatgpt_plan_type: 'plus' }, [PROFILE]: { email: `demo${index}@example.com` } })
  return [
    { tokens: { access_token: access(1), refresh_token: 'rt_demo_1', account_id: 'acc_demo_1' }, last_refresh: now.toISOString() },
    { user: { id: 'user_demo_2', email: 'demo2@example.com' }, account: { id: 'acc_demo_2', planType: 'plus' }, accessToken: access(2), sessionToken: 'sess_demo_2', expires: iso(exp) },
    { type: 'codex', email: 'demo3@example.com', account_id: 'acc_demo_3', access_token: access(3), refresh_token: 'rt_demo_3', expired: iso(exp), plan_type: 'plus', use_siwc: true, siwc: { access_token: 'siwc_demo_access', refresh_token: 'siwc_demo_refresh', client_id: 'demo_client', expired: iso(exp), expires_at: iso(exp), last_refresh: now.toISOString() } }
  ].map(item => JSON.stringify(item)).join('\n')
}
