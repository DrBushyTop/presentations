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
// The screen share and the camera go through Cloudflare Realtime: the
// presenter's browser pushes them to an SFU session, and each viewer pulls
// them into its own. The tracks each kind may have:
const SFU = 'https://rtc.live.cloudflare.com/v1/apps'
const MEDIA = { screen: ['screen'], camera: ['camera', 'voice'] }
const MAX_SDP = 64 * 1024
const MEDIA_ID = /^[\w-]{8,64}$/
// Realtime calls are paid for by the app, so anonymous viewers get budgets
// per minute: for the whole audience by step, for one public IP opening
// connections (a venue's Wi-Fi is one IP for everyone), and for one viewer's
// connection. A whole audience opens connections over a minute or so, then
// pulls the screen, the camera and maybe the voice within a few seconds.
const BUDGET = { connect: 2000, pull: 3000, answer: 6000, close: 3000 }
const MAX_CONNECTS_PER_IP = 400
const MAX_STEPS_PER_VIEWER = 40
// A viewer's token outlives any talk.
const TOKEN_TTL = 12 * 3600_000
// Shares ended before their publish arrived, remembered so it cannot revive
// them, and published shares waiting for their `on`.
const MAX_CANCELLED = 20
const MAX_STAGED = 4

const ROUTES = ['/viewer', '/publish', '/stop', '/status', '/build', '/media', '/watch']
// Open to anyone. Everything else needs the publish key.
const PUBLIC = ['/viewer', '/watch']
const POST = ['/stop', '/build', '/media', '/watch']
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

// Each viewer keeps one SFU session for the whole talk, set up in steps:
// `connect` opens the session with only the SFU's server-events data
// channel, `pull` adds tracks of the screen or camera on stage to it (the
// voice only when the viewer asks to listen), `close` drops tracks of a share
// that ended, and `answer` passes the viewer's SDP answer on after a pull.
// Connections open as people open the page, spread out, so starting a share
// only renegotiates them. The token is signed: a viewer can only ever use the
// session made for it. The SFU calls run here, not in the stage, which has a
// limit on outgoing requests a whole audience would pass; the stage only
// admits each step first.
async function watch(request, env, stage) {
  if (!sfuReady(env)) return json({ error: 'Realtime is not set up' }, 501)
  const body = await request.json().catch(() => ({}))
  const step = new URL(request.url).searchParams.get('step')
  if (!Object.hasOwn(BUDGET, step)) return json({ error: 'Unknown step' }, 400)
  const session = step === 'connect' ? '' : await verify(env, body.token)
  if (session === undefined) return json({ error: 'Bad token' }, 400)
  const params = { step, session, ip: request.headers.get('cf-connecting-ip') ?? '' }
  if (step === 'pull') {
    const tracks = body.tracks
    const valid = Object.hasOwn(MEDIA, body.kind) && Array.isArray(tracks) && tracks.length >= 1
      && new Set(tracks).size === tracks.length && tracks.every(name => MEDIA[body.kind].includes(name))
    if (!valid) return json({ error: 'Bad pull' }, 400)
    Object.assign(params, { kind: body.kind, tracks: tracks.join(',') })
  }
  const sdp = typeof body.sdp === 'string' && body.sdp.length <= MAX_SDP ? body.sdp : undefined
  const mids = Array.isArray(body.mids) && body.mids.length >= 1 && body.mids.length <= 8
    && body.mids.every(mid => typeof mid === 'string' && mid.length <= 16) ? body.mids : undefined
  if (step === 'answer' && !sdp) return json({ error: 'Bad answer' }, 400)
  if (step === 'close' && !(sdp && mids)) return json({ error: 'Bad close' }, 400)
  // The stage admits the step, and for a pull names its source. Never sent
  // to viewers.
  const admitted = await stage.fetch(`https://stage/admit?${new URLSearchParams(params)}`)
  if (!admitted.ok) return json(await admitted.json(), admitted.status)
  try {
    if (step === 'connect') {
      const { sessionId } = await sfu(env, '/sessions/new', 'POST')
      const opened = await sfu(env, `/sessions/${sessionId}/datachannels/establish`, 'POST', {
        dataChannel: { location: 'remote', dataChannelName: 'server-events' },
      })
      return json({ token: await sign(env, sessionId, Date.now() + TOKEN_TTL), sdp: opened.sessionDescription.sdp })
    }
    if (step === 'answer') {
      await sfu(env, `/sessions/${session}/renegotiate`, 'PUT', { sessionDescription: { type: 'answer', sdp } })
      return json({ ok: true })
    }
    if (step === 'close') {
      const closed = await sfu(env, `/sessions/${session}/tracks/close`, 'PUT', {
        tracks: mids.map(mid => ({ mid })),
        sessionDescription: { type: 'offer', sdp },
        force: false,
      })
      return json({ sdp: closed.sessionDescription?.sdp })
    }
    const media = await admitted.json()
    const pulled = await sfu(env, `/sessions/${session}/tracks/new`, 'POST', {
      tracks: media.tracks.map(trackName => ({ location: 'remote', sessionId: media.sfu, trackName })),
    })
    return json({
      id: media.id,
      sdp: pulled.sessionDescription.sdp,
      tracks: (pulled.tracks ?? []).map(({ mid, trackName }) => ({ mid, trackName })),
    })
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

// A viewer's token: its SFU session and when the token expires, signed.
async function sign(env, session, expires) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.REALTIME_APP_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`watch:${session}:${expires}`)))
  return `${session}.${expires}.${btoa(String.fromCharCode(...mac)).replace(/=+$/, '')}`
}

async function verify(env, token) {
  if (typeof token !== 'string' || token.length > 300) return undefined
  const [session, expires, mac, extra] = token.split('.')
  if (extra !== undefined || !mac || !/^[\w-]+$/.test(session) || !/^\d{1,15}$/.test(expires) || Number(expires) < Date.now()) return undefined
  const a = new TextEncoder().encode(await sign(env, session, expires))
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
      case '/media': return this.media(url.searchParams, request)
      case '/admit': return this.admit(url.searchParams)
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
    this.endAllMedia()
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
    this.endAllMedia()
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

  // The presenter's screen share or camera, in three steps from its dev
  // server: `publish` pushes the browser's tracks to a new SFU session and
  // answers its offer; `on` shows them to viewers once the browser is
  // connected, in place of the previous one; `off` ends them. The browser
  // names each attempt, so an attempt ended or replaced before its publish
  // completes cannot come back. The SFU sessions stay here: a viewer who knew
  // one could renegotiate it.
  async media(params, request) {
    const stage = this.stage
    if (params.get('session') !== stage.session || stage.stopped) return json({ error: 'Not on stage' }, 409)
    const kind = params.get('kind')
    if (!Object.hasOwn(MEDIA, kind)) return json({ error: 'Unknown kind' }, 400)
    const action = params.get('action')
    const body = await request.json().catch(() => ({}))
    const id = body.id
    if (typeof id !== 'string' || !MEDIA_ID.test(id)) return json({ error: 'Bad id' }, 400)
    stage.media ??= {}
    // Attempts by id: publishing now (in memory only) and published.
    this.pending ??= new Set()
    const staged = stage.staged = Array.isArray(stage.staged) ? stage.staged : []
    const found = staged.find(m => m.id === id && m.kind === kind)
    // A tab ends only its own share, not a newer one from another tab.
    if (action === 'off') {
      // Also stops a publish still in flight, or not arrived yet.
      stage.cancelled = [id, ...(stage.cancelled ?? [])].slice(0, MAX_CANCELLED)
      this.pending.delete(id)
      if (found) {
        this.revoke(found)
        stage.staged = staged.filter(m => m !== found)
      }
      if (stage.media[kind]?.id === id) this.endMedia(kind)
      this.save('stage')
      return json({ ok: true })
    }
    if (action === 'on') {
      if (stage.media[kind]?.id === id) return json({ ok: true })
      if (!found) return json({ error: 'Not this share' }, 409)
      stage.staged = staged.filter(m => m !== found)
      if (stage.media[kind]) this.revoke(stage.media[kind])
      stage.media[kind] = found
      this.setMedia(kind, found)
      return json({ ok: true })
    }
    if (action !== 'publish') return json({ error: 'Unknown action' }, 400)
    if (!sfuReady(this.env)) return json({ error: 'Realtime is not set up on the relay' }, 501)
    const tracks = Array.isArray(body.tracks) ? body.tracks : []
    const names = tracks.map(t => t?.trackName)
    const valid = typeof body.sdp === 'string' && body.sdp.length <= MAX_SDP && tracks.length >= 1
      && new Set(names).size === names.length && names.every(name => MEDIA[kind].includes(name))
      && tracks.every(t => typeof t.mid === 'string' && t.mid.length <= 16)
    if (!valid) return json({ error: 'Bad share' }, 400)
    if (stage.cancelled?.includes(id) || this.pending.has(id) || found) return json({ error: 'Already ended' }, 409)
    this.pending.add(id)
    let published
    try {
      const { sessionId } = await sfu(this.env, '/sessions/new', 'POST')
      const pushed = await sfu(this.env, `/sessions/${sessionId}/tracks/new`, 'POST', {
        sessionDescription: { type: 'offer', sdp: body.sdp },
        tracks: tracks.map(({ mid, trackName }) => ({ location: 'local', mid, trackName })),
      })
      published = { id, kind, sfu: sessionId, tracks: names, mids: tracks.map(t => t.mid) }
      // The talk, or this tab's mind, can have changed while the SFU answered.
      const current = this.stage === stage && !stage.stopped && this.pending.has(id)
      if (!current) {
        this.revoke(published)
        return json({ error: 'Ended before it started' }, 409)
      }
      // Published shares that never got their `on` are dropped, oldest first.
      stage.staged = [...stage.staged, published]
      for (const old of stage.staged.slice(0, -MAX_STAGED)) this.revoke(old)
      stage.staged = stage.staged.slice(-MAX_STAGED)
      this.save('stage')
      return json({ id, sdp: pushed.sessionDescription.sdp })
    }
    catch (error) {
      return json({ error: String(error.message ?? error) }, 502)
    }
    finally {
      this.pending.delete(id)
    }
  }

  // Shows a share or camera to viewers, or ends it (undefined). Viewers see
  // its id and which tracks it has.
  setMedia(kind, media) {
    const visible = media ? { id: media.id, tracks: media.tracks } : undefined
    const shown = this.snapshot.media ?? {}
    if (shown[kind]?.id === visible?.id) return
    this.snapshot.media = { ...shown, [kind]: visible }
    if (!visible) delete this.snapshot.media[kind]
    this.save('stage', 'snapshot')
    this.broadcast(JSON.stringify({ t: 'media', media: this.snapshot.media }))
  }

  endMedia(kind) {
    const media = this.stage.media?.[kind]
    if (media) this.revoke(media)
    delete this.stage.media?.[kind]
    this.setMedia(kind, undefined)
  }

  // On stop and takeover: nothing of the old talk may keep reaching anyone.
  endAllMedia() {
    for (const kind of Object.keys(MEDIA)) this.endMedia(kind)
    for (const media of Array.isArray(this.stage.staged) ? this.stage.staged : []) this.revoke(media)
    this.stage.staged = []
    this.pending?.clear()
  }

  // Closes a share's tracks at the SFU, so viewers who pulled them stop
  // receiving even if they ignore the relay.
  revoke(media) {
    if (!media?.mids?.length || !sfuReady(this.env)) return
    const closing = sfu(this.env, `/sessions/${media.sfu}/tracks/close`, 'PUT', {
      tracks: media.mids.map(mid => ({ mid })),
      force: true,
    }).catch(error => console.error('revoke', error.message))
    this.ctx.waitUntil?.(closing)
  }

  // For the Worker's `/watch`: admits a viewer's step against the budgets,
  // and for a pull returns what is on stage. Only the Worker can ask; it is
  // not a public route.
  admit(params) {
    const step = params.get('step')
    if (!this.snapshot.live || this.stage.stopped) return json({ error: 'Not live' }, 409)
    const minute = Math.floor(Date.now() / 60_000)
    if (this.budget?.minute !== minute) this.budget = { minute, steps: {}, ips: new Map(), viewers: new Map() }
    const b = this.budget
    const charge = (map, key, max) => {
      const count = (map.get(key) ?? 0) + 1
      map.set(key, count)
      return count <= max
    }
    if (step === 'connect' && !charge(b.ips, params.get('ip'), MAX_CONNECTS_PER_IP)) return json({ error: 'Too many connections from this network' }, 429)
    if (step !== 'connect' && !charge(b.viewers, params.get('session'), MAX_STEPS_PER_VIEWER)) return json({ error: 'Too many requests' }, 429)
    let media
    if (step === 'pull') {
      const kind = params.get('kind')
      media = this.stage.media?.[kind]
      if (!media || this.snapshot.media?.[kind]?.id !== media.id) return json({ error: `No ${kind}` }, 409)
      const tracks = media.tracks.filter(name => params.get('tracks').split(',').includes(name))
      if (!tracks.length) return json({ error: 'No such track' }, 409)
      media = { ...media, tracks }
    }
    b.steps[step] = (b.steps[step] ?? 0) + 1
    if (b.steps[step] > BUDGET[step]) return json({ error: 'Too many viewers joining' }, 503)
    return json(media ?? { ok: true })
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
