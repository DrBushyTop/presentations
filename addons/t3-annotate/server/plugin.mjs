// Vite dev-server routes under /__t3-annotate/ that the presenter UI calls.
// The browser never sees the T3 token: these routes call T3 from Node.
import { execFile } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import { promisify } from 'node:util'
import MarkdownIt from 'markdown-it'
import { buildPrompt, userText } from './prompt.mjs'
import { closeRenderer, renderSlide } from './render.mjs'
import * as t3 from './t3.mjs'

const run = promisify(execFile)
const PREFIX = '/__t3-annotate/'
const SHOTS = join(tmpdir(), 'slidev-t3-annotate')
const SHOT_ID = /^[a-f0-9]{16}$/
const MAX_ATTACHMENTS = 8
// Screenshots stay around so the chat can show them next to the message they went with.
const KEEP_SHOTS_MS = 14 * 24 * 60 * 60 * 1000
const SENT_INDEX = join(SHOTS, 'sent.json')
// Agent replies are rendered here so the page only gets HTML that cannot carry markup of its own.
const markdown = new MarkdownIt({ html: false, linkify: true, breaks: true })
// Agents embed screenshots by local path. `env.localImage` turns such a path into a
// URL this server serves, or null, and then the reply shows the alt text instead.
const renderImage = markdown.renderer.rules.image
markdown.renderer.rules.image = (tokens, i, options, env, self) => {
  const src = tokens[i].attrGet('src') || ''
  const url = /^https?:/i.test(src) ? src : env.localImage?.(src)
  const alt = markdown.utils.escapeHtml(tokens[i].content || '')
  if (!url) return `<em>[${alt || 'image'}]</em>`
  tokens[i].attrSet('src', url)
  // Like T3's own chat: the image as a card, its alt text as the caption.
  const caption = alt ? `<span class="tc-caption">${alt}</span>` : ''
  return `<span class="tc-figure">${renderImage(tokens, i, options, env, self)}${caption}</span>`
}
// Reply images the browser may load: raster files under the repository, T3's data or the temp directory.
const IMAGE_TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' }
const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const BUSY = new Set(['starting', 'preparing', 'running', 'queued'])

// Loopback, or a Tailscale address (100.64.0.0/10, fd7a:115c:a1e0::/48). The
// decks bind 0.0.0.0, so anything else on the LAN must not reach these routes.
function trustedAddress(raw = '') {
  const ip = raw.replace(/^::ffff:/, '')
  if (ip === '127.0.0.1' || ip === '::1') return true
  const [a, b] = ip.split('.').map(Number)
  if (a === 100 && b >= 64 && b <= 127) return true
  return ip.toLowerCase().startsWith('fd7a:115c:a1e0:')
}

function allowed(req) {
  if (!trustedAddress(req.socket.remoteAddress)) return false
  if (req.method === 'GET') return true
  // A custom header forces a CORS preflight, which Vite does not grant to other sites.
  if (req.headers['x-t3-annotate'] !== '1') return false
  try {
    return !req.headers.origin || new URL(req.headers.origin).host === req.headers.host
  } catch { return false }
}

async function readBody(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > 2_000_000) throw new Error('Request too large.')
    chunks.push(chunk)
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(body))
}

const git = async (cwd, ...args) => (await run('git', args, { cwd })).stdout.trim()

const messageKey = (text) => createHash('sha256').update(text.trim()).digest('hex').slice(0, 24)

/** Maps a sent message to the notes and screenshots it carried. */
function readSentIndex() {
  try { return JSON.parse(readFileSync(SENT_INDEX, 'utf8')) } catch { return {} }
}

function pruneShots() {
  if (!existsSync(SHOTS)) return
  const cutoff = Date.now() - KEEP_SHOTS_MS
  for (const name of readdirSync(SHOTS)) {
    if (name.endsWith('.png') && statSync(join(SHOTS, name)).mtimeMs < cutoff) rmSync(join(SHOTS, name), { force: true })
  }
  const index = readSentIndex()
  for (const [key, entry] of Object.entries(index)) if (entry.at < cutoff) delete index[key]
  writeFileSync(SENT_INDEX, JSON.stringify(index))
}

// Summaries of what the agent is doing, for the status line under the chat.
function activityLabel(item) {
  if (item.type === 'reasoning') return 'Thinking'
  const firstLine = (item.text || '').split('\n').find((l) => l.trim() && !l.startsWith('$ Preparing')) || ''
  if (item.type === 'command_execution') return item.title && item.title !== 'Command' ? item.title : `Running ${clipText(firstLine.replace(/^\$\s*/, ''), 60)}`
  return item.title || item.type.replace(/_/g, ' ')
}
const clipText = (text, max) => (text.length > max ? `${text.slice(0, max)}…` : text)

export default function t3AnnotatePlugin(options) {
  let devUrl = null
  // The chat belongs to this dev server, not to the browser: every tab on it shares one
  // conversation, and a restarted or different server starts a new one.
  const conversation = { threadId: '', chats: [] } // chats: [{ id, title }], newest first
  const briefed = new Set() // threads this server has described the deck to
  let checkout = null

  async function resolveCheckout() {
    if (checkout) return checkout
    const root = await git(options.userRoot, 'rev-parse', '--show-toplevel')
    const common = await git(options.userRoot, 'rev-parse', '--path-format=absolute', '--git-common-dir')
    const branch = await git(options.userRoot, 'branch', '--show-current').catch(() => '')
    checkout = { root, mainRoot: common.replace(/\/\.git\/?$/, ''), branch }
    return checkout
  }

  async function resolveProject() {
    const { root, mainRoot, branch } = await resolveCheckout()
    const { projects } = await t3.callTool('t3_project_list', { limit: 100 })
    const live = projects.filter((p) => !p.deletedAt)
    const exact = live.find((p) => p.workspaceRoot === root)
    if (exact) return { project: exact, workspaceStrategy: { type: 'root' } }
    // A deck served from a git worktree belongs to the project of the main checkout.
    const main = live.find((p) => p.workspaceRoot === mainRoot || p.repositoryIdentity?.rootPath === mainRoot)
    if (main) return { project: main, workspaceStrategy: { type: 'existing_worktree', worktreePath: root, branch: branch || null } }
    throw new Error(`No T3 project for ${root}. Add it in T3 Code first.`)
  }

  // Images in replies are served by an id, so the browser only reaches files a reply showed.
  const replyImages = new Map() // id -> real path
  function localImage(src) {
    try {
      let path = decodeURI(src.replace(/^file:\/\//i, '')).split(/[?#]/)[0]
      if (path.startsWith('~/')) path = join(homedir(), path.slice(2))
      const base = checkout?.root || options.userRoot
      const file = realpathSync(isAbsolute(path) ? path : resolve(base, path))
      const type = IMAGE_TYPES[extname(file).toLowerCase()]
      const roots = [base, checkout?.mainRoot, join(homedir(), '.t3'), tmpdir()].filter((r) => r && existsSync(r)).map((r) => realpathSync(r))
      const inside = roots.some((root) => { const r = relative(root, file); return r && !r.startsWith('..') && !isAbsolute(r) })
      const stat = statSync(file)
      if (!type || !inside || !stat.isFile() || stat.size > MAX_IMAGE_BYTES) return null
      const id = createHash('sha256').update(file).digest('hex').slice(0, 16)
      replyImages.set(id, file)
      return `${PREFIX}image/${id}${extname(file).toLowerCase()}`
    } catch {
      return null // missing or unreadable
    }
  }

  // A slide's own module is `<file>.md__slidev_<n>.md`. Its number goes stale when slides
  // move, and the note already names the slide, so keep just the file.
  const rel = (path) => {
    if (!path) return ''
    const file = path.replace(/(\.md)__slidev_\d+\.md$/, '$1').split('?')[0]
    return checkout && file.startsWith(checkout.root) ? relative(checkout.root, file) : file
  }

  function slideInfo(no) {
    const s = options.data.slides[no - 1]
    if (!s) return null
    return { file: s.source.filepath, start: s.source.start, end: s.source.end, title: s.title || s.frontmatter?.title }
  }

  const deckTitle = () => options.data.config.title || rel(options.entry)

  // Where the deck's parts live, so the agent can go straight to the right file.
  function deckPlaces() {
    const dir = dirname(options.entry)
    const sources = [...new Set(options.data.slides.map((s) => s.source.filepath))]
    const places = [{ label: sources.length > 1 ? 'slide sources' : 'slides', paths: sources }]
    for (const [label, names] of [['deck styles', ['style.css', 'styles']], ['deck components', ['components']], ['layouts', ['layouts']], ['setup', ['setup']], ['static assets', ['public']]]) {
      const paths = names.map((n) => join(dir, n)).filter(existsSync)
      if (paths.length) places.push({ label, paths })
    }
    const theme = options.themeRoots?.[0]
    if (theme) places.push({ label: `theme "${options.data.config.theme}", shared with the repo's other decks`, paths: [realpathSync(theme)] })
    return places.map(({ label, paths }) => ({ label, paths: paths.map(rel) }))
  }

  const deckInfo = () => ({
    entry: options.entry,
    title: options.data.config.title,
    devUrl,
    canvas: canvas(),
    places: deckPlaces(),
    count: options.data.slides.length,
    slides: slideInfo,
  })

  function canvas() {
    const width = options.data.config.canvasWidth || 980
    return { width, height: Math.round(width / (options.data.config.aspectRatio || 16 / 9)) }
  }

  // The same models as T3's composer (it already leaves out hidden ones), with its
  // favourites and its default selection for new threads.
  async function catalog() {
    const caps = await t3.callTool('orchestrator_capabilities')
    const settings = t3.t3Settings()
    const favorites = new Set((settings.favorites || []).map((f) => `${f.provider}|${f.model}`))
    const providers = caps.providers.filter((p) => !p.constraints?.length && p.models?.length)
    const seen = new Set()
    const models = providers
      .flatMap((p) => p.models.map((m) => {
        const effort = m.options?.find((o) => o.type === 'select' && ['effort', 'reasoningEffort', 'variant'].includes(o.id))
        return {
          instanceId: p.providerInstanceId,
          provider: p.displayName,
          model: m.id,
          // Several providers offer the same model, so name the provider when a label repeats.
          label: seen.has(m.label) ? `${m.label} · ${p.displayName}` : (seen.add(m.label), m.label),
          favorite: favorites.has(`${p.providerInstanceId}|${m.id}`),
          effort: effort && {
            id: effort.id,
            choices: effort.options.map((o) => ({ id: o.id, label: o.label })),
            default: effort.currentValue || effort.options.find((o) => o.isDefault)?.id || null,
          },
        }
      }))
    return { models, defaultSelection: settings.defaultModelSelection || null, runtimeMode: caps.runtimeMode }
  }

  // Changes the model of this server's open chat. It applies from the next message on.
  async function setModel({ threadId, modelSelection: m }) {
    if (!threadId || threadId !== conversation.threadId) throw new Error('That chat is not open here.')
    const text = (v) => typeof v === 'string' && /^[\w:./-]{1,200}$/.test(v)
    const options = Array.isArray(m?.options) ? m.options.filter((o) => text(o?.id) && text(o?.value)) : []
    if (!text(m?.instanceId) || !text(m?.model)) throw new Error('Pick a model from the list.')
    await t3.callTool('t3_thread_configure', { threadId, modelSelection: { instanceId: m.instanceId, model: m.model, options } })
    return {}
  }

  async function threads() {
    const { project } = await resolveProject()
    const list = await t3.callTool('t3_thread_list', { projectId: project.id, limit: 25, settled: false })
    return list.threads
      .filter((t) => !t.parentThreadId)
      .map((t) => ({ id: t.threadId, title: t.title, status: t.status, model: t.model, updatedAt: t.updatedAt }))
  }

  async function shot(body) {
    const { slide, marks } = body
    const png = await renderSlide(devUrl, { no: Number(slide.no), clicks: Number(slide.clicks) || 0 }, canvas(), marks)
    const id = randomBytes(8).toString('hex')
    mkdirSync(SHOTS, { recursive: true })
    writeFileSync(join(SHOTS, `${id}.png`), png)
    return { id }
  }

  async function send(body) {
    const { message = '', annotations = [], model, current } = body
    const { threadId } = conversation
    if (!message.trim() && !annotations.length) throw new Error('Nothing to send.')
    const { project, workspaceStrategy } = await resolveProject()

    const attachments = []
    const withShots = annotations.map((a, i) => {
      const file = SHOT_ID.test(a.shotId || '') && join(SHOTS, `${a.shotId}.png`)
      if (!file || !existsSync(file) || attachments.length >= MAX_ATTACHMENTS) return { ...a, shotName: null }
      const name = `slide-${a.slide.no}-note-${i + 1}.png`
      attachments.push({ name, file })
      return { ...a, shotName: name }
    })
    const uploaded = []
    for (const a of attachments) uploaded.push(await t3.uploadImage(a.name, readFileSync(a.file)))

    const prompt = buildPrompt({ message, annotations: withShots, current, first: !briefed.has(threadId), deck: deckInfo(), rel })
    const index = readSentIndex()
    index[messageKey(prompt)] = {
      at: Date.now(),
      notes: annotations.map((a) => ({ shotId: SHOT_ID.test(a.shotId || '') ? a.shotId : null, slide: a.slide, comment: a.comment })),
    }
    mkdirSync(SHOTS, { recursive: true })
    writeFileSync(SENT_INDEX, JSON.stringify(index))

    if (threadId) {
      if (uploaded.length) await t3.callTool('t3_thread_send_attachments', { threadId, message: prompt, attachments: uploaded })
      else await t3.callTool('t3_thread_send', { threadId, message: prompt, mode: 'auto' })
      briefed.add(threadId)
      return { threadId }
    }
    const first = (message || annotations[0]?.comment || 'Slide notes').replace(/\s+/g, ' ').trim()
    const title = `${deckTitle()}: ${clipText(first, 60)}`
    const launched = await t3.callTool('t3_thread_launch', {
      projectId: project.id,
      title,
      ...(model?.instanceId && model?.model ? { modelSelection: model } : {}),
      runtimeMode: 'full-access',
      interactionMode: 'default',
      workspaceStrategy,
      message: prompt,
      ...(uploaded.length ? { attachments: uploaded } : {}),
    })
    const id = launched.threadId || launched.thread?.threadId
    briefed.add(id)
    conversation.chats.unshift({ id, title })
    conversation.threadId = id
    return { threadId: id, title }
  }

  function openConversation({ threadId = '' }) {
    if (typeof threadId !== 'string' || !/^[\w:.-]{0,200}$/.test(threadId)) throw new Error('Bad thread id.')
    conversation.threadId = threadId
    return conversation
  }

  /** This server's open conversation, with the context the addon added hidden again. */
  async function chat() {
    const { threadId } = conversation
    if (!threadId) return { conversation, thread: null, messages: [], activity: [] }
    // The model and effort T3 will use for the next message, which may have changed in T3 itself.
    const configuration = t3.callTool('t3_thread_configuration', { threadId }).catch(() => null)
    const items = []
    let thread = null
    let afterPosition = null
    for (let page = 0; page < 10; page++) {
      const read = await t3.callTool('t3_thread_read', { threadId, view: 'activity', limit: 100, maxCharsPerItem: 50000, ...(afterPosition === null ? {} : { afterPosition }) })
      thread ??= read.thread
      items.push(...read.items)
      if (!read.hasMore) break
      afterPosition = read.nextPosition
    }
    const index = readSentIndex()
    const messages = []
    let activity = []
    for (const item of items) {
      if (item.type === 'user_message') {
        const entry = index[messageKey(item.text || '')]
        messages.push({ id: item.itemId, role: 'user', text: userText(item.text || ''), notes: entry?.notes || [], at: item.updatedAt })
        activity = []
      } else if (item.type === 'assistant_message') {
        messages.push({ id: item.itemId, role: 'assistant', html: markdown.render(item.text || '', { localImage }), streaming: item.status !== 'completed', at: item.updatedAt })
      } else if (item.type !== 'checkpoint') {
        const label = activityLabel(item).replaceAll(`${checkout?.root}/`, '')
        activity.push({ label, done: item.status === 'completed' })
      }
    }
    const busy = BUSY.has(thread.status)
    const known = conversation.chats.find((c) => c.id === threadId)
    if (known) known.title = thread.title
    return {
      conversation,
      thread: {
        id: thread.threadId, title: thread.title, status: thread.status, busy,
        model: thread.model, instanceId: thread.providerInstanceId, selection: (await configuration)?.modelSelection || null,
        pending: thread.pendingRequestCount || 0,
      },
      messages,
      // What the agent did since the last message, shown only while it works.
      activity: busy ? activity.slice(-4) : [],
    }
  }

  const routes = {
    'GET status': async () => ({ signedIn: t3.isSignedIn() }),
    'GET catalog': catalog,
    'GET threads': async () => ({ threads: await threads() }),
    'POST shot': shot,
    'POST send': send,
    'GET chat': chat,
    'POST conversation': openConversation,
    'POST model': setModel,
  }

  return {
    name: 'slidev-t3-annotate',
    apply: 'serve',
    configureServer(server) {
      pruneShots()
      server.httpServer?.once('listening', () => {
        devUrl = `http://localhost:${server.httpServer.address().port}`
      })
      // Slidev's restart shortcut closes this server and builds a new one, so clean up here too.
      server.httpServer?.once('close', () => { closeRenderer(); t3.signOut() })
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(PREFIX)) return next()
        if (!allowed(req)) return sendJson(res, 403, { error: 'Forbidden.' })
        const path = req.url.slice(PREFIX.length).split('?')[0]

        const shotMatch = req.method === 'GET' && path.match(/^shot\/([a-f0-9]{16})\.png$/)
        if (shotMatch) {
          const file = join(SHOTS, `${shotMatch[1]}.png`)
          if (!existsSync(file)) return sendJson(res, 404, { error: 'Not found.' })
          res.setHeader('content-type', 'image/png')
          res.setHeader('cache-control', 'private, max-age=86400')
          return res.end(readFileSync(file))
        }

        const imageMatch = req.method === 'GET' && path.match(/^image\/([a-f0-9]{16})\.\w+$/)
        if (imageMatch) {
          const file = replyImages.get(imageMatch[1])
          if (!file || !existsSync(file)) return sendJson(res, 404, { error: 'Not found.' })
          res.setHeader('content-type', IMAGE_TYPES[extname(file).toLowerCase()])
          res.setHeader('cache-control', 'private, max-age=86400')
          return res.end(readFileSync(file))
        }

        const handler = routes[`${req.method} ${path}`]
        if (!handler) return sendJson(res, 404, { error: 'Not found.' })
        try {
          sendJson(res, 200, await handler(req.method === 'POST' ? await readBody(req) : {}))
        } catch (error) {
          server.config.logger.error(`[t3-annotate] ${error.message}`)
          sendJson(res, 500, { error: error.message })
        }
      })
    },
  }
}
