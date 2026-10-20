import { createPublisher } from './publisher.mjs'

// Two modes, both off unless `npm run live` sets the environment:
// - dev server with SLIDEV_LIVE_KEY: publish the shared state to the relay.
// - build with SLIDEV_LIVE_VIEWER=1: a read-only follower bundle.
const env = process.env
const viewer = env.SLIDEV_LIVE_VIEWER === '1'
const publishing = !viewer && !!(env.SLIDEV_LIVE_RELAY && env.SLIDEV_LIVE_DECK && env.SLIDEV_LIVE_KEY)

// Slidev restarts the dev server (and reloads this file) on headmatter edits.
// Keep a single relay connection for the whole process.
function publisher() {
  if (!publishing) return undefined
  globalThis.__slidevLivePublisher ??= createPublisher({
    relay: env.SLIDEV_LIVE_RELAY,
    deck: env.SLIDEV_LIVE_DECK,
    key: env.SLIDEV_LIVE_KEY,
  })
  return globalThis.__slidevLivePublisher
}

export function onServerRefChanged(key, data) {
  if (key === 'nav') publisher()?.nav(data)
  else if (key === 'drawings') publisher()?.drawings(data)
}

// Loopback or Tailscale, like the annotate addon. The decks bind 0.0.0.0.
function trustedAddress(raw = '') {
  const ip = raw.replace(/^::ffff:/, '')
  if (ip === '127.0.0.1' || ip === '::1') return true
  const [a, b] = ip.split('.').map(Number)
  if (a === 100 && b >= 64 && b <= 127) return true
  return ip.toLowerCase().startsWith('fd7a:115c:a1e0:')
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
      publisher()
      // The presenter's browser posts its position (before it renders) and
      // interactive slide state (lib/sync.ts in a deck, via BroadcastChannel).
      const routes = {
        nav({ page, clicks, tab, seq }) {
          if (![page, clicks, seq].every(Number.isInteger) || typeof tab !== 'string') return false
          publisher().navHint(page, clicks, tab, seq)
        },
        synced({ key, value }) {
          if (typeof key !== 'string' || key.length > 200) return false
          publisher().synced(key, value)
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
          res.statusCode = route(await readJson(req)) === false ? 400 : 204
        }
        catch {
          res.statusCode = 400
        }
        res.end()
      })
    },
  }
}
