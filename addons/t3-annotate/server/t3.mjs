// Talks to the T3 Code server on this machine through its MCP endpoint (/mcp).
//
// The addon signs in as an "outside agent", the same way `claude mcp login` does:
// it registers an OAuth client and approves the sign-in with a one-time pairing
// code from `t3 auth pairing create`. Sign-in happens on first use and the token
// lives only in this process, never on disk or in a page. The session is revoked
// when the dev server stops or after two idle hours, and sessions left by a
// crashed server are revoked by the next one that signs in.
import { execFile, execFileSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)
const MCP_PROTOCOL = '2025-06-18'
const REDIRECT_URI = 'http://127.0.0.1/slidev-t3-annotate/callback'
const ACCESS = 'full-access'
// The scopes a pairing code must carry to approve full-access sign-in.
const PAIRING_SCOPES = ['orchestration:read', 'orchestration:operate', 'settings:write', 'source-control:write']
// T3 labels the session with the client name. The pid tells a live server's session from a stale one.
const LABEL_PREFIX = 'Slidev annotate · pid '
const LABEL = `${LABEL_PREFIX}${process.pid}`
// A dev server left running should not hold a live session. The open tray polls, so it counts as use.
const IDLE_MS = 2 * 60 * 60 * 1000

const t3Home = () => process.env.T3CODE_HOME || join(homedir(), '.t3')

/** T3's own settings, read for the composer's favourite models and default selection. */
export function t3Settings() {
  try { return JSON.parse(readFileSync(join(t3Home(), 'userdata', 'settings.json'), 'utf8')) } catch { return {} }
}

export function t3Origin() {
  if (process.env.T3_ANNOTATE_URL) return process.env.T3_ANNOTATE_URL.replace(/\/+$/, '')
  const runtime = join(t3Home(), 'userdata', 'server-runtime.json')
  if (!existsSync(runtime)) throw new Error(`T3 Code is not running on this machine (no ${runtime}).`)
  const { port } = JSON.parse(readFileSync(runtime, 'utf8'))
  // The OAuth issuer and token audience follow the request host, so always use one form.
  return `http://127.0.0.1:${port}`
}

function t3Cli() {
  if (process.env.T3CODE_CLI_PATH) return process.env.T3CODE_CLI_PATH
  const shim = join(t3Home(), 'bin', 't3')
  return existsSync(shim) ? shim : 't3'
}

const cli = async (...args) => (await run(t3Cli(), args, { timeout: 30_000 })).stdout
const parseCliJson = (stdout) => JSON.parse(stdout.slice(stdout.search(/[[{]/)))
const base64url = (buf) => buf.toString('base64url')

async function postJson(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  const text = await res.text()
  if (!res.ok) throw new Error(`${new URL(url).pathname} failed with HTTP ${res.status}: ${text.slice(0, 300)}`)
  return text ? JSON.parse(text) : {}
}

/** @type {{ origin: string, token: string, sessionIds: string[] } | null} */
let signedIn = null
let signingIn = null
let session = null // Promise<McpSession> tagged with the token and origin it was opened for

function pidAlive(pid) {
  try { process.kill(pid, 0); return true } catch (error) { return error.code === 'EPERM' }
}

async function addonSessions() {
  return parseCliJson(await cli('auth', 'session', 'list', '--json'))
    .filter((s) => s.subject === 'mcp-client' && s.client?.label?.startsWith(LABEL_PREFIX))
}

/** Revokes sessions whose dev server is gone (crashed or killed before it could clean up). */
async function revokeStale() {
  for (const s of await addonSessions()) {
    const pid = Number(s.client.label.slice(LABEL_PREFIX.length))
    if (pid !== process.pid && !pidAlive(pid)) await cli('auth', 'session', 'revoke', s.sessionId).catch(() => {})
  }
}

async function signIn() {
  const origin = t3Origin()
  await revokeStale().catch(() => {})
  const pairing = parseCliJson(await cli(
    'auth', 'pairing', 'create', '--json', '--ttl', '2m', '--label', `${LABEL} sign-in`,
    ...PAIRING_SCOPES.flatMap((s) => ['--scope', s]),
  ))

  const client = await postJson(`${origin}/oauth/mcp/register`, {
    client_name: LABEL,
    redirect_uris: [REDIRECT_URI],
    token_endpoint_auth_method: 'none',
  })
  const verifier = base64url(randomBytes(32))
  const state = base64url(randomBytes(16))
  const authorization = {
    response_type: 'code',
    client_id: client.client_id,
    redirect_uri: REDIRECT_URI,
    code_challenge: base64url(createHash('sha256').update(verifier).digest()),
    code_challenge_method: 'S256',
    state,
    resource: `${origin}/mcp`,
  }
  const { redirectTo } = await postJson(`${origin}/oauth/mcp/decision`, {
    authorization,
    decision: { _tag: 'pairing-code', access: ACCESS, code: pairing.credential },
  })
  const redirect = new URL(redirectTo, origin)
  if (redirect.searchParams.get('error')) throw new Error(`T3 refused the sign-in: ${redirect.searchParams.get('error_description') || redirect.searchParams.get('error')}`)
  if (redirect.searchParams.get('state') !== state) throw new Error('T3 sign-in returned a mismatched state.')

  const res = await fetch(`${origin}/oauth/mcp/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: redirect.searchParams.get('code'),
      redirect_uri: REDIRECT_URI,
      client_id: client.client_id,
      code_verifier: verifier,
      resource: `${origin}/mcp`,
    }),
  })
  const token = await res.json()
  if (!res.ok) throw new Error(`Token exchange failed: ${token.error_description || res.status}`)
  // The token response has no session id; find it by label so shutdown can revoke it.
  const mine = (await addonSessions().catch(() => [])).filter((s) => s.client.label === LABEL)
  signedIn = { origin, token: token.access_token, sessionIds: mine.map((s) => s.sessionId) }
  watchShutdown()
}

/** Signs in on first use. Concurrent callers share one sign-in. */
async function ensureSignedIn() {
  if (stopping) throw new Error('The dev server is shutting down.')
  lastUsed = Date.now()
  if (signedIn && signedIn.origin === t3Origin()) return signedIn
  signingIn ??= signIn().finally(() => { signingIn = null })
  await signingIn
  return signedIn
}

export const isSignedIn = () => Boolean(signedIn)

/** Revokes this server's T3 session. Safe to call more than once. */
export async function signOut() {
  const ids = signedIn?.sessionIds || []
  signedIn = null
  session = null
  for (const id of ids) await cli('auth', 'session', 'revoke', id).catch(() => {})
}

function signOutSync() {
  const ids = signedIn?.sessionIds || []
  signedIn = null
  for (const id of ids) {
    try { execFileSync(t3Cli(), ['auth', 'session', 'revoke', id], { timeout: 10_000, stdio: 'ignore' }) } catch {}
  }
}

let watching = false
let stopping = false
let lastUsed = 0
function watchShutdown() {
  if (watching) return
  watching = true
  setInterval(() => {
    if (signedIn && Date.now() - lastUsed > IDLE_MS) signOut()
  }, 60_000).unref()
  // 'exit' covers process.exit (Slidev's quit shortcut and Ctrl-C in its terminal).
  // Signals skip 'exit', so revoke first. Listening for a signal cancels its default
  // action, so re-raise it afterwards. Other listeners get a moment to exit their own
  // way first (Vite closes the server on SIGTERM), while signal-exit's listener only
  // acts once it is the last one left.
  process.once('exit', signOutSync)
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    const onSignal = () => {
      stopping = true
      signOutSync()
      process.removeListener(signal, onSignal)
      if (process.listenerCount(signal) === 0) process.kill(process.pid, signal)
      else setTimeout(() => process.kill(process.pid, signal), 500).unref()
    }
    process.on(signal, onSignal)
  }
}

async function mcpPayloads(res) {
  const text = await res.text()
  if (!(res.headers.get('content-type') || '').includes('text/event-stream')) return text ? [JSON.parse(text)] : []
  return text.split(/\r?\n\r?\n/).flatMap((event) => {
    const data = event.split(/\r?\n/).filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trimStart()).join('\n')
    return data ? [JSON.parse(data)] : []
  })
}

class McpSession {
  constructor(origin, token) {
    this.origin = origin
    this.token = token
    this.sessionId = null
    this.nextId = 1
  }

  async send(message) {
    const res = await fetch(`${this.origin}/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        authorization: `Bearer ${this.token}`,
        ...(this.sessionId ? { 'mcp-session-id': this.sessionId, 'mcp-protocol-version': MCP_PROTOCOL } : {}),
      },
      body: JSON.stringify(message),
    })
    this.sessionId = res.headers.get('mcp-session-id') || this.sessionId
    if (res.status === 401 || res.status === 403) {
      await res.text()
      throw Object.assign(new Error('T3 rejected the sign-in.'), { unauthorized: true })
    }
    if (!res.ok) throw new Error(`T3 MCP responded with HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
    return mcpPayloads(res)
  }

  async request(method, params) {
    const id = this.nextId++
    const payloads = await this.send({ jsonrpc: '2.0', id, method, params })
    const reply = payloads.find((p) => p.id === id)
    if (!reply) throw new Error(`T3 MCP gave no reply to ${method}.`)
    if (reply.error) throw new Error(`T3 MCP ${method} failed: ${reply.error.message || JSON.stringify(reply.error)}`)
    return reply.result
  }

  async open() {
    await this.request('initialize', {
      protocolVersion: MCP_PROTOCOL,
      capabilities: {},
      clientInfo: { name: 'slidev-t3-annotate', version: '1.0.0' },
    })
    await this.send({ jsonrpc: '2.0', method: 'notifications/initialized' })
  }
}


/** Calls one T3 MCP tool and returns its structured result. */
export async function callTool(name, args = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { origin, token } = await ensureSignedIn()
    let mcp
    try {
      // Concurrent calls share one session and wait for it to finish opening.
      if (!session || session.token !== token || session.origin !== origin) {
        const fresh = new McpSession(origin, token)
        session = Object.assign(fresh.open().then(() => fresh), { token, origin })
      }
      mcp = session
      const result = await (await mcp).request('tools/call', { name, arguments: args })
      const text = result.content?.find((c) => c.type === 'text')?.text
      if (result.isError) throw Object.assign(new Error(`${name}: ${text || 'failed'}`), { toolError: true })
      if (result.structuredContent) return result.structuredContent
      try { return JSON.parse(text) } catch { return text }
    } catch (error) {
      if (session === mcp) session = null
      if (error.toolError || attempt > 0) throw error
      // Revoked or expired: sign in again. A restarted T3 server forgets MCP sessions: open a new one.
      if (error.unauthorized) await signOut()
    }
  }
}

/** Uploads one image and returns the attachment reference T3 expects. */
export async function uploadImage(name, bytes, mimeType = 'image/png') {
  const prepared = await callTool('t3_attachment_prepare_upload', {
    upload: { type: 'image', name, mimeType, sizeBytes: bytes.length },
  })
  const url = prepared.relativeUrl || prepared.upload?.relativeUrl
  const id = prepared.attachmentId || prepared.id || prepared.attachment?.id
  if (!url || !id) throw new Error(`Unexpected upload reply: ${JSON.stringify(prepared).slice(0, 300)}`)
  const res = await fetch(new URL(url, t3Origin()), {
    method: 'POST',
    headers: { 'content-type': mimeType, 'content-length': String(bytes.length) },
    body: bytes,
  })
  if (!res.ok) throw new Error(`Image upload failed with HTTP ${res.status}`)
  return { type: 'image', id, name, mimeType, sizeBytes: bytes.length }
}
