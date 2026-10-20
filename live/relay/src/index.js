import { DurableObject } from 'cloudflare:workers'

// One stage for every deck: the site shows one talk at a time. The presenter's
// dev server publishes over /publish and every viewer reads over /viewer.
// Viewers can never write: any message from them closes their socket.
//
// The latest presentation started wins: a session's first connection takes
// the stage. A dev server that was forgotten somewhere cannot take it back by
// reconnecting, since a reconnect only resumes the session on stage.

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const route = url.pathname
    if (!['/viewer', '/publish', '/stop', '/status'].includes(route))
      return new Response('Not found', { status: 404 })
    if (route !== '/viewer' && !(await authorized(request, env)))
      return new Response('Forbidden', { status: 403 })
    if (['/viewer', '/publish'].includes(route) && request.headers.get('Upgrade')?.toLowerCase() !== 'websocket')
      return new Response('Expected a WebSocket upgrade', { status: 426 })
    if (route === '/stop' && request.method !== 'POST')
      return new Response('Method not allowed', { status: 405 })
    return env.ROOM.get(env.ROOM.idFromName('stage')).fetch(request)
  },
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
      case '/status': {
        const { session, host, startedAt, stopped } = this.stage
        return json({ ...this.public(), session, host, startedAt, stopped: !!stopped, connected: this.hasPublisher() })
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
    const resume = params.get('resume') === '1'
    if (!SESSION.test(session) || !DECK.test(deck))
      return new Response('Bad publisher', { status: 400 })

    const { 0: client, 1: server } = new WebSocketPair()
    const stage = this.stage
    const current = session === stage.session
    // A stopped session, or a replaced one reconnecting: tell it why and
    // close it. Ordering by arrival, not by the publishers' clocks.
    if (current ? stage.stopped : resume) {
      this.ctx.acceptWebSocket(server, ['refused'])
      this.dismiss(server, 4000, current ? 'Stopped' : `Taken over by ${stage.deck} on ${stage.host}`)
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
    this.stage = next
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
    this.save('stage', 'snapshot')
    for (const ws of this.ctx.getWebSockets('publisher')) this.dismiss(ws, 4000, 'Stopped')
    this.broadcast(JSON.stringify({ t: 'live', on: false }))
    return json({ stopped: true, deck: stage.deck, host: stage.host })
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
