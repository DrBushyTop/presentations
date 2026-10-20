import { DurableObject } from 'cloudflare:workers'

// One room per deck. The presenter's dev server publishes over /publish/<deck>
// and every viewer reads over /viewer/<deck>. Viewers can never write: any
// message from them closes their socket.

const DECK = /^[a-z0-9-]{1,40}$/

export default {
  async fetch(request, env) {
    const [, role, deck, extra] = new URL(request.url).pathname.split('/')
    if (!['viewer', 'publish'].includes(role) || !DECK.test(deck ?? '') || extra !== undefined)
      return new Response('Not found', { status: 404 })
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket')
      return new Response('Expected a WebSocket upgrade', { status: 426 })

    if (role === 'publish' && !(await authorized(request, env)))
      return new Response('Forbidden', { status: 403 })

    const headers = new Headers(request.headers)
    headers.set('x-live-role', role)
    return env.ROOM.get(env.ROOM.idFromName(deck)).fetch(new Request(request, { headers }))
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

export class LiveRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env)
    // Keepalive pings are answered without waking the object.
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'))
    ctx.blockConcurrencyWhile(async () => {
      this.snapshot = (await ctx.storage.get('snapshot')) ?? { live: false, synced: {} }
    })
  }

  async fetch(request) {
    const { 0: client, 1: server } = new WebSocketPair()
    if (request.headers.get('x-live-role') === 'publish') {
      // One publisher per deck. A newer one (another machine) takes over.
      for (const old of this.ctx.getWebSockets('publisher')) old.close(4000, 'Replaced by another publisher')
      this.ctx.acceptWebSocket(server, ['publisher'])
      this.broadcast(JSON.stringify({ t: 'presenter', connected: true }))
    }
    else {
      this.ctx.acceptWebSocket(server, ['viewer'])
      server.send(JSON.stringify({ t: 'snapshot', presenter: this.hasPublisher(), ...this.snapshot }))
    }
    return new Response(null, { status: 101, webSocket: client })
  }

  webSocketMessage(ws, message) {
    if (!this.ctx.getTags(ws).includes('publisher')) {
      ws.close(1008, 'Viewers are read-only')
      return
    }
    let msg
    try {
      msg = JSON.parse(message)
    }
    catch {
      return
    }
    const s = this.snapshot
    switch (msg.t) {
      case 'live': s.live = !!msg.on; break
      case 'nav': s.nav = msg.nav; break
      case 'cursor': s.cursor = msg.cursor; break
      case 'drawings': s.drawings = msg.drawings; break
      case 'synced': s.synced[msg.key] = msg.value; break
      default: return
    }
    // Viewers get the publisher's message verbatim, so it is serialised once.
    this.broadcast(typeof message === 'string' ? message : new TextDecoder().decode(message))
    // The cursor moves too often to store; everything else survives hibernation.
    if (msg.t !== 'cursor') this.ctx.storage.put('snapshot', s)
  }

  webSocketClose(ws) {
    if (this.ctx.getTags(ws).includes('publisher') && !this.hasPublisher(ws))
      this.broadcast(JSON.stringify({ t: 'presenter', connected: false }))
  }

  webSocketError(ws) {
    this.webSocketClose(ws)
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
