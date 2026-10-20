import { DurableObject } from 'cloudflare:workers'

// One stage for every deck: the site shows one talk at a time. The presenter's
// dev server publishes over /publish and every viewer reads over /viewer.
// Viewers can never write: any message from them closes their socket.
//
// The latest presentation started wins. A publisher may claim the stage only
// in the first minutes after it starts; after that it can only resume. A
// session that was replaced is remembered and never gets the stage back, so
// a dev server forgotten somewhere cannot retake it, not even by retrying a
// claim whose answer it never saw.

const DECK = /^[a-z0-9-]{1,40}$/
const SESSION = /^[\w-]{8,64}$/
// Durable Object storage takes up to 2 MB per value; the snapshot stays well
// under it.
const MAX_MESSAGE = 1024 * 1024
const MAX_DRAWINGS = 1024 * 1024
const MAX_SYNCED = 256 * 1024
const MAX_SYNCED_KEYS = 200
// A talk has about 200 viewers. The cap keeps a flood of sockets bounded.
const MAX_VIEWERS = 2000
// Replaced sessions remembered, newest first.
const MAX_RETIRED = 100
// Screen sharing goes through Cloudflare Realtime: the presenter's browser
// pushes the screen to an SFU session, and each viewer pulls it into its own.
const SFU = 'https://rtc.live.cloudflare.com/v1/apps'
const TRACK = /^[\w-]{1,32}$/
const MAX_SDP = 64 * 1024
// Viewers joining a share per minute. A whole audience joins in a few seconds.
const MAX_WATCHES = 1000

const ROUTES = ['/viewer', '/publish', '/stop', '/status', '/build', '/screen', '/watch']
// Open to anyone. Everything else needs the publish key.
const PUBLIC = ['/viewer', '/watch']
const POST = ['/stop', '/build', '/screen', '/watch']
// The viewer page is on another origin.
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const route = url.pathname
    if (!ROUTES.includes(route))
      return new Response('Not found', { status: 404 })
    if (route === '/watch' && request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: CORS })
    if (!PUBLIC.includes(route) && !(await authorized(request, env)))
      return new Response('Forbidden', { status: 403 })
    if (['/viewer', '/publish'].includes(route) && request.headers.get('Upgrade')?.toLowerCase() !== 'websocket')
      return new Response('Expected a WebSocket upgrade', { status: 426 })
    if (POST.includes(route) && request.method !== 'POST')
      return new Response('Method not allowed', { status: 405 })
    const stage = env.ROOM.get(env.ROOM.idFromName('stage'))
    if (route !== '/watch') return stage.fetch(request)
    const response = await watch(request, env, stage)
    for (const [name, value] of Object.entries(CORS)) response.headers.set(name, value)
    return response
  },
}

// Each viewer keeps one SFU session for the whole talk, set up in three
// steps: `connect` opens the session with only the SFU's server-events data
// channel, `pull` adds the share on stage to it, and `answer` passes the
// viewer's SDP answer on after either. Connections open as people open the
// page, spread out, so starting a share only renegotiates them. The token
// is signed: a viewer can only ever use the session made for it. The SFU
// calls run here, not in the stage, which has a limit on outgoing requests
// a whole audience would pass.
async function watch(request, env, stage) {
  if (!sfuReady(env)) return json({ error: 'Screen sharing is not set up' }, 501)
  const body = await request.json().catch(() => ({}))
  const step = new URL(request.url).searchParams.get('step')
  try {
    if (step === 'connect') {
      const { sessionId } = await sfu(env, '/sessions/new', 'POST')
      const opened = await sfu(env, `/sessions/${sessionId}/datachannels/establish`, 'POST', {
        dataChannel: { location: 'remote', dataChannelName: 'server-events' },
      })
      return json({ token: await sign(env, sessionId), sdp: opened.sessionDescription.sdp })
    }
    const session = await verify(env, body.token)
    if (!session) return json({ error: 'Bad token' }, 400)
    if (step === 'answer') {
      if (typeof body.sdp !== 'string' || body.sdp.length > MAX_SDP) return json({ error: 'Bad answer' }, 400)
      await sfu(env, `/sessions/${session}/renegotiate`, 'PUT', { sessionDescription: { type: 'answer', sdp: body.sdp } })
      return json({ ok: true })
    }
    if (step !== 'pull') return json({ error: 'Unknown step' }, 400)
    // The share on stage, with its SFU session. Never sent to viewers.
    const found = await stage.fetch('https://stage/screen-source')
    if (!found.ok) return json(await found.json(), found.status)
    const screen = await found.json()
    const pulled = await sfu(env, `/sessions/${session}/tracks/new`, 'POST', {
      tracks: screen.tracks.map(trackName => ({ location: 'remote', sessionId: screen.sfu, trackName })),
    })
    return json({ id: screen.id, sdp: pulled.sessionDescription.sdp })
  }
  catch (error) {
    return json({ error: String(error.message ?? error) }, 502)
  }
}

function sfuReady(env) {
  return !!(env.REALTIME_APP_ID && env.REALTIME_APP_SECRET)
}

async function sfu(env, path, method, body) {
  const res = await fetch(`${SFU}/${env.REALTIME_APP_ID}${path}`, {
    method,
    headers: { 'authorization': `Bearer ${env.REALTIME_APP_SECRET}`, 'content-type': 'application/json' },
    body: body && JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  })
  const result = await res.json().catch(() => ({}))
  const failed = result.errorCode || result.tracks?.find(t => t.errorCode)
  if (!res.ok || failed) throw new Error(`SFU ${path.replace(/[\w-]{20,}/g, ':id')}: ${res.status} ${failed?.errorDescription ?? failed?.errorCode ?? ''}`.trim())
  return result
}

async function sign(env, session) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.REALTIME_APP_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`watch:${session}`)))
  return `${session}.${btoa(String.fromCharCode(...mac)).replace(/=+$/, '')}`
}

async function verify(env, token) {
  if (typeof token !== 'string' || token.length > 300) return undefined
  const dot = token.lastIndexOf('.')
  const session = token.slice(0, dot)
  if (dot < 1 || !/^[\w-]+$/.test(session)) return undefined
  const a = new TextEncoder().encode(await sign(env, session))
  const b = new TextEncoder().encode(token)
  return a.length === b.length && crypto.subtle.timingSafeEqual(a, b) ? session : undefined
}

// The publisher sends the raw key. The Worker only stores its SHA-256, so the
// key itself never sits in Cloudflare.
async function authorized(request, env) {
  const expected = env.PUBLISH_KEY_SHA256
  const key = request.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!expected || !key) return false
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)))
  const want = hexBytes(expected)
  return want.length === digest.length && crypto.subtle.timingSafeEqual(digest, want)
}

function hexBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

export class LiveRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env)
    // Keepalive pings are answered without waking the object.
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'))
    ctx.blockConcurrencyWhile(async () => {
      // session, startedAt and host are never sent to viewers.
      this.stage = (await ctx.storage.get('stage')) ?? {}
      this.snapshot = (await ctx.storage.get('snapshot')) ?? { live: false, synced: {} }
    })
  }

  async fetch(request) {
    const url = new URL(request.url)
    switch (url.pathname) {
      case '/viewer': return this.viewer()
      case '/publish': return this.publish(url.searchParams)
      case '/stop': return this.stop(url.searchParams)
      case '/build': return this.setBuild(url.searchParams)
      case '/screen': return this.screen(url.searchParams, request)
      case '/screen-source': return this.screenSource()
      case '/status': {
        const { session, host, startedAt, stopped, retired = [] } = this.stage
        return json({ ...this.public(), session, host, startedAt, stopped: !!stopped, connected: this.hasPublisher(), retired, screenReady: sfuReady(this.env) })
      }
    }
  }

  viewer() {
    if (this.ctx.getWebSockets('viewer').length >= MAX_VIEWERS)
      return new Response('Too many viewers', { status: 503 })
    const { 0: client, 1: server } = new WebSocketPair()
    this.ctx.acceptWebSocket(server, ['viewer'])
    server.send(JSON.stringify({ t: 'snapshot', ...this.public() }))
    return new Response(null, { status: 101, webSocket: client })
  }

  publish(params) {
    const session = params.get('session') ?? ''
    const deck = params.get('deck') ?? ''
    const claim = params.get('claim') === '1'
    if (!SESSION.test(session) || !DECK.test(deck))
      return new Response('Bad publisher', { status: 400 })

    const { 0: client, 1: server } = new WebSocketPair()
    const stage = this.stage
    const current = session === stage.session
    // Refused: a stopped session, a replaced one, or a resume of a session
    // that never held the stage. Tell it why and close it.
    const refusal = current
      ? stage.stopped && 'Stopped'
      : (!claim || stage.retired?.includes(session))
          && (stage.session ? `Taken over by ${stage.deck} on ${stage.host}` : 'Not on stage')
    if (refusal) {
      this.ctx.acceptWebSocket(server, ['refused'])
      this.dismiss(server, 4000, refusal)
      return new Response(null, { status: 101, webSocket: client })
    }
    if (!current) {
      this.takeOver({
        session,
        deck,
        startedAt: Date.now(),
        build: (params.get('build') ?? '').slice(0, 40),
        host: (params.get('host') ?? 'another machine').slice(0, 40),
      })
    }
    // The same session reconnecting: drop any half-dead socket it left behind.
    // Only the newest connection may write.
    for (const old of this.ctx.getWebSockets('publisher')) this.dismiss(old, 4002, 'Replaced by a newer connection')
    const conn = crypto.randomUUID()
    this.stage.conn = conn
    this.save('stage')
    server.serializeAttachment({ session, conn })
    this.ctx.acceptWebSocket(server, ['publisher'])
    this.broadcast(JSON.stringify({ t: 'presenter', connected: true }))
    return new Response(null, { status: 101, webSocket: client })
  }

  takeOver(next) {
    for (const old of this.ctx.getWebSockets('publisher')) this.dismiss(old, 4000, `Taken over by ${next.deck} on ${next.host}`)
    // A new talk starts clean: the old one's slide, drawings and interactive
    // state do not apply, even for the same deck.
    this.snapshot = { live: false, synced: {} }
    const retired = [this.stage.session, ...(this.stage.retired ?? [])].filter(Boolean).slice(0, MAX_RETIRED)
    this.stage = { ...next, retired }
    this.save('stage', 'snapshot')
    // Viewers start over from the new stage: a viewer on another deck reloads.
    this.broadcast(JSON.stringify({ t: 'snapshot', ...this.public() }))
  }

  // Ends the talk. `session` stops only that presentation (Ctrl+C), so a
  // forgotten server never ends the one that replaced it. `deck` stops the
  // stage only if it shows that deck. With neither, whatever is live stops.
  stop(params) {
    const stage = this.stage
    const session = params.get('session')
    const deck = params.get('deck')
    const match = !stage.stopped && stage.session
      && (session ? session === stage.session : deck ? deck === stage.deck : true)
    if (!match) return json({ stopped: false, ...this.public(), host: stage.host })
    stage.stopped = true
    this.snapshot.live = false
    this.setScreen(undefined)
    this.save('stage', 'snapshot')
    for (const ws of this.ctx.getWebSockets('publisher')) this.dismiss(ws, 4000, 'Stopped')
    this.broadcast(JSON.stringify({ t: 'live', on: false }))
    return json({ stopped: true, deck: stage.deck, host: stage.host })
  }

  // The build viewers should run. `npm run live` sets it once the site has
  // its build, or falls back to the build the site already has.
  setBuild(params) {
    const stage = this.stage
    if (params.get('session') !== stage.session || stage.stopped) return json({ ok: false }, 409)
    stage.build = (params.get('build') ?? '').slice(0, 40)
    this.save('stage')
    this.broadcast(JSON.stringify({ t: 'snapshot', ...this.public() }))
    return json({ ok: true })
  }

  // The presenter's screen share, in three steps from its dev server:
  // `publish` pushes the browser's tracks to a new SFU session and answers its
  // offer; `on` shows it to viewers once the browser is connected; `off` ends
  // it. The SFU session stays here: a viewer who knew it could renegotiate it.
  async screen(params, request) {
    const stage = this.stage
    if (params.get('session') !== stage.session || stage.stopped) return json({ error: 'Not on stage' }, 409)
    const action = params.get('action')
    const body = await request.json().catch(() => ({}))
    // A tab ends only its own share, not a newer one from another tab.
    if (action === 'off') {
      if (stage.screen && body.id === stage.screen.id) this.setScreen(undefined)
      return json({ ok: true })
    }
    if (action === 'on') {
      if (!stage.screen || body.id !== stage.screen.id) return json({ error: 'Not this share' }, 409)
      this.setScreen(stage.screen)
      return json({ ok: true })
    }
    if (action !== 'publish') return json({ error: 'Unknown action' }, 400)
    if (!sfuReady(this.env)) return json({ error: 'Screen sharing is not set up on the relay' }, 501)
    const tracks = Array.isArray(body.tracks) ? body.tracks : []
    const valid = typeof body.sdp === 'string' && body.sdp.length <= MAX_SDP && tracks.length >= 1 && tracks.length <= 2
      && tracks.every(t => typeof t?.mid === 'string' && t.mid.length <= 16 && TRACK.test(t.trackName ?? ''))
    if (!valid) return json({ error: 'Bad share' }, 400)
    try {
      const { sessionId } = await sfu(this.env, '/sessions/new', 'POST')
      const pushed = await sfu(this.env, `/sessions/${sessionId}/tracks/new`, 'POST', {
        sessionDescription: { type: 'offer', sdp: body.sdp },
        tracks: tracks.map(({ mid, trackName }) => ({ location: 'local', mid, trackName })),
      })
      // The session can have changed while the SFU answered.
      if (params.get('session') !== this.stage.session || this.stage.stopped) return json({ error: 'Not on stage' }, 409)
      const id = crypto.randomUUID()
      this.stage.screen = { id, sfu: sessionId, tracks: tracks.map(t => t.trackName) }
      this.save('stage')
      return json({ id, sdp: pushed.sessionDescription.sdp })
    }
    catch (error) {
      return json({ error: String(error.message ?? error) }, 502)
    }
  }

  // Shows a share to viewers, or ends it (undefined).
  setScreen(screen) {
    const visible = screen ? { id: screen.id } : null
    if (!screen) delete this.stage.screen
    if ((this.snapshot.screen?.id ?? null) === (visible?.id ?? null)) return
    this.snapshot.screen = visible
    this.save('stage', 'snapshot')
    this.broadcast(JSON.stringify({ t: 'screen', screen: visible }))
  }

  // For the Worker's `/watch`: the share on stage, if any. Only the Worker
  // can ask; it is not a public route.
  screenSource() {
    const screen = this.stage.screen
    if (!screen || this.snapshot.screen?.id !== screen.id || this.stage.stopped) return json({ error: 'No screen share' }, 409)
    const minute = Math.floor(Date.now() / 60_000)
    if (this.watches?.minute !== minute) this.watches = { minute, count: 0 }
    if (++this.watches.count > MAX_WATCHES) return json({ error: 'Too many viewers joining' }, 503)
    return json(screen)
  }

  // Closes a publisher. The reason also goes as a message first: the closing
  // handshake can take seconds to reach the other side.
  dismiss(ws, code, reason) {
    reason = reason.slice(0, 120)
    try {
      ws.send(JSON.stringify({ t: 'closing', code, reason }))
      ws.close(code, reason)
    }
    catch {}
  }

  // What viewers may see. `since` tells them a new talk started.
  public() {
    const { deck, build, startedAt: since } = this.stage
    return { ...this.snapshot, deck, build, since, presenter: this.hasPublisher() }
  }

  save(...keys) {
    const entries = Object.fromEntries(keys.map(key => [key, key === 'stage' ? this.stage : this.snapshot]))
    // A failed write only costs late joiners the latest state.
    this.ctx.storage.put(entries).catch(error => console.error('storage', error))
  }

  webSocketMessage(ws, message) {
    const tags = this.ctx.getTags(ws)
    if (tags.includes('refused')) return
    if (!tags.includes('publisher')) {
      ws.close(1008, 'Viewers are read-only')
      return
    }
    // A closing socket can still deliver messages: only the newest
    // connection of the current session writes.
    const { session, conn } = ws.deserializeAttachment() ?? {}
    if (session !== this.stage.session || conn !== this.stage.conn || this.stage.stopped) return
    const text = typeof message === 'string' ? message : new TextDecoder().decode(message)
    if (text.length > MAX_MESSAGE) return
    let msg
    try {
      msg = JSON.parse(text)
    }
    catch {
      return
    }
    const s = this.snapshot
    switch (msg?.t) {
      case 'live':
        s.live = msg.on === true
        break
      case 'nav':
        if (!validNav(msg.nav)) return
        s.nav = { page: msg.nav.page, clicks: msg.nav.clicks }
        break
      case 'cursor':
        if (!validCursor(msg.cursor)) return
        s.cursor = msg.cursor
        break
      case 'drawings':
        if (!validDrawings(msg.drawings)) return
        s.drawings = msg.drawings
        break
      case 'synced': {
        if (typeof msg.key !== 'string' || msg.key.length > 200) return
        const synced = { ...s.synced, [msg.key]: msg.value ?? null }
        if (Object.keys(synced).length > MAX_SYNCED_KEYS || JSON.stringify(synced).length > MAX_SYNCED) return
        s.synced = synced
        break
      }
      default: return
    }
    // Viewers get the publisher's message verbatim, so it is serialised once.
    this.broadcast(text)
    // The cursor moves too often to store; everything else survives hibernation.
    if (msg.t !== 'cursor') this.save('snapshot')
  }

  webSocketClose(ws, code, reason) {
    // Finish the closing handshake now, or the other side waits for it.
    try {
      ws.close(code, reason)
    }
    catch {}
    if (this.ctx.getTags(ws).includes('publisher') && !this.hasPublisher(ws))
      this.broadcast(JSON.stringify({ t: 'presenter', connected: false }))
  }

  webSocketError(ws) {
    this.webSocketClose(ws, 1011, 'WebSocket error')
  }

  hasPublisher(except) {
    return this.ctx.getWebSockets('publisher').some(ws => ws !== except && ws.readyState === WebSocket.OPEN)
  }

  broadcast(text) {
    for (const ws of this.ctx.getWebSockets('viewer')) {
      try {
        ws.send(text)
      }
      catch {}
    }
  }
}

function validNav(nav) {
  return Number.isInteger(nav?.page) && nav.page >= 1 && nav.page <= 10_000
    && Number.isInteger(nav.clicks) && nav.clicks >= 0 && nav.clicks <= 10_000
}

function validCursor(cursor) {
  return cursor === null || (typeof cursor === 'object'
    && Number.isFinite(cursor.x) && Number.isFinite(cursor.y)
    && (cursor.style === undefined || cursor.style === 'cursor' || cursor.style === 'laser'))
}

// Page number to SVG markup. Viewers sanitise the markup before drawing it.
function validDrawings(drawings) {
  if (!drawings || typeof drawings !== 'object' || Array.isArray(drawings)) return false
  let size = 0
  for (const [page, svg] of Object.entries(drawings)) {
    if (!/^\d{1,5}$/.test(page) || typeof svg !== 'string') return false
    size += svg.length
  }
  return size <= MAX_DRAWINGS
}
