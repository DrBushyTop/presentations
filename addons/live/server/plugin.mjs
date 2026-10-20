import { hostname } from 'node:os'
import { createPublisher } from './publisher.mjs'

// Two modes, both off unless `npm run live` sets the environment:
// - dev server with SLIDEV_LIVE_KEY: publish the shared state to the relay.
// - build with SLIDEV_LIVE_VIEWER=1: a read-only follower bundle.
const env = process.env
const viewer = env.SLIDEV_LIVE_VIEWER === '1'
const publishing = !viewer && !!(env.SLIDEV_LIVE_RELAY && env.SLIDEV_LIVE_DECK && env.SLIDEV_LIVE_KEY && env.SLIDEV_LIVE_SESSION)

// Slidev restarts the dev server (and reloads this file) on headmatter edits.
// Keep a single relay connection for the whole process.
function publisher() {
  if (!publishing) return undefined
  globalThis.__slidevLivePublisher ??= createPublisher({
    relay: env.SLIDEV_LIVE_RELAY,
    deck: env.SLIDEV_LIVE_DECK,
    key: env.SLIDEV_LIVE_KEY,
    session: env.SLIDEV_LIVE_SESSION,
    build: env.SLIDEV_LIVE_BUILD,
    host: hostname().split('.')[0],
  })
  return globalThis.__slidevLivePublisher
}

export function onServerRefChanged(key, data) {
  if (key === 'nav') publisher()?.nav(data)
  else if (key === 'drawings') publisher()?.drawings(data)
}

// Loopback or Tailscale, like the annotate addon. The decks bind 0.0.0.0.
// `npm run live -- --trust-lan` adds private LAN addresses.
const trustLan = env.SLIDEV_LIVE_TRUST_LAN === '1'
function trustedAddress(raw = '') {
  const ip = raw.replace(/^::ffff:/, '').toLowerCase()
  if (ip === '127.0.0.1' || ip === '::1') return true
  const [a, b] = ip.split('.').map(Number)
  if (a === 100 && b >= 64 && b <= 127) return true
  if (ip.startsWith('fd7a:115c:a1e0:')) return true
  if (!trustLan) return false
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254)
    || /^f[cd]/.test(ip) || ip.startsWith('fe80:')
}

// Dev tooling that acts on the presenter's machine, whatever the method.
const PRIVILEGED = ['/__mcp', '/__open-in-editor', '/__inspect']

// A page from another site in the presenter's own browser can still post to
// localhost. Browsers say where a request comes from; tools like curl say
// nothing and are judged by address alone.
function crossSite(req) {
  const site = req.headers['sec-fetch-site']
  if (site && site !== 'same-origin' && site !== 'none') return true
  const origin = req.headers.origin
  if (!origin) return false
  try {
    return new URL(origin).host !== req.headers.host
  }
  catch {
    return true
  }
}

// Slidev's dev server accepts state changes from anyone who can reach it:
// slide position and drawings (/@server-ref/), slide edits (/__slidev/) and
// MCP. While live, those reach every viewer, so only trusted addresses, from
// the dev server's own pages, may change anything. Reading (the play view)
// stays open.
export function liveGuardPlugin() {
  return {
    name: 'slidev-addon-live:guard',
    enforce: 'pre',
    configureServer(server) {
      if (!publishing) return
      // Registered before Slidev's own middlewares (enforce: 'pre').
      server.middlewares.use((req, res, next) => {
        // Connect mounts match any case and also end at a dot, so anything
        // that starts like a privileged path counts as one.
        let path
        try {
          path = decodeURIComponent((req.url ?? '').split('?')[0]).toLowerCase()
        }
        catch {
          path = PRIVILEGED[0]
        }
        const privileged = PRIVILEGED.some(p => path.startsWith(p))
        if (!privileged && ['GET', 'HEAD', 'OPTIONS'].includes(req.method ?? 'GET')) return next()
        if (trustedAddress(req.socket.remoteAddress) && !crossSite(req)) return next()
        res.statusCode = 403
        res.end('Read-only while live. Use localhost or Tailscale, or start with --trust-lan.')
      })
    },
  }
}

async function readJson(req) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > 256_000) throw new Error('Body too large')
  }
  return JSON.parse(body)
}

export function livePlugin() {
  return {
    name: 'slidev-addon-live',
    enforce: 'post',
    config() {
      const define = {
        __SLIDEV_LIVE_VIEWER__: JSON.stringify(viewer),
        __SLIDEV_LIVE_BRIDGE__: JSON.stringify(publishing),
        __SLIDEV_LIVE_RELAY__: JSON.stringify(viewer ? env.SLIDEV_LIVE_RELAY ?? '' : ''),
        __SLIDEV_LIVE_DECK__: JSON.stringify(viewer ? env.SLIDEV_LIVE_DECK ?? '' : ''),
        __SLIDEV_LIVE_BUILD__: JSON.stringify(viewer ? env.SLIDEV_LIVE_BUILD ?? '' : ''),
      }
      // The follower bundle is the plain play view: no presenter, notes
      // routes, recording, exporter or PDF.
      if (viewer) {
        Object.assign(define, {
          __SLIDEV_FEATURE_PRESENTER__: 'false',
          __SLIDEV_FEATURE_PRINT__: 'false',
          __SLIDEV_FEATURE_BROWSER_EXPORTER__: 'false',
          __SLIDEV_FEATURE_RECORD__: 'false',
        })
      }
      return { define }
    },
    configureServer(server) {
      if (!publishing) return
      // Tabs that share a screen or camera stop once it is replaced or the
      // talk no longer publishes from here.
      const notify = data => server.ws.send('slidev-live:media', data)
      publisher().onStop(() => notify({ stopped: true }))
      // The presenter's browser posts its position (before it renders) and
      // interactive slide state (lib/sync.ts in a deck, via BroadcastChannel).
      const routes = {
        nav({ page, clicks, tab, seq }) {
          if (![page, clicks, seq].every(Number.isInteger) || typeof tab !== 'string') return false
          publisher().navHint(page, clicks, tab, seq)
        },
        synced({ key, value, from, seq }) {
          if (typeof key !== 'string' || key.length > 200 || typeof from !== 'string' || !Number.isInteger(seq)) return false
          publisher().synced(key, value, from, seq)
        },
        // The screen share and the camera. Answers with the relay's reply.
        async media({ kind, action, ...body }) {
          if (!['screen', 'camera'].includes(kind) || !['publish', 'on', 'off'].includes(action)) return false
          const result = await publisher().media(kind, action, body)
          if (action === 'on' && result.status === 200) notify({ kind, id: body.id })
          return result
        },
      }
      server.middlewares.use('/__slidev-live/', async (req, res) => {
        const route = routes[req.url?.split('?')[0].slice(1)]
        const ok = route
          && req.method === 'POST'
          && trustedAddress(req.socket.remoteAddress)
          && req.headers['x-slidev-live'] === '1'
        if (!ok) {
          res.statusCode = 403
          return res.end()
        }
        try {
          const result = await route(await readJson(req))
          if (result && typeof result === 'object') {
            res.statusCode = result.status
            res.setHeader('content-type', 'application/json')
            return res.end(JSON.stringify(result.body))
          }
          res.statusCode = result === false ? 400 : 204
        }
        catch {
          res.statusCode = 400
        }
        res.end()
      })
    },
  }
}
