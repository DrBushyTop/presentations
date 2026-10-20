import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { isIP } from 'node:net'
import { networkInterfaces } from 'node:os'
import { renderUnicodeCompact } from 'uqr'

const PAGE = readFileSync(new URL('./clicker.html', import.meta.url), 'utf8')

// Loopback or Tailscale, like the live and annotate addons. The decks bind
// 0.0.0.0. `npm run live -- --trust-lan` adds private LAN addresses.
const trustLan = process.env.SLIDEV_LIVE_TRUST_LAN === '1'
const tailscaleAddress = (ip) => {
  const [a, b] = ip.split('.').map(Number)
  return (a === 100 && b >= 64 && b <= 127) || ip.startsWith('fd7a:115c:a1e0:')
}
function trustedAddress(raw = '') {
  const ip = raw.replace(/^::ffff:/, '').toLowerCase()
  if (ip === '127.0.0.1' || ip === '::1' || tailscaleAddress(ip)) return true
  if (!trustLan) return false
  const [a, b] = ip.split('.').map(Number)
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254)
    || /^f[cd]/.test(ip) || ip.startsWith('fe80:')
}

// This machine's name on the tailnet (MagicDNS), such as m4.example.ts.net.
// Only the tailnet resolves it.
function tailscaleName() {
  for (const cli of ['tailscale', '/Applications/Tailscale.app/Contents/MacOS/Tailscale']) {
    try {
      const status = JSON.parse(execFileSync(cli, ['status', '--json'], { encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }))
      if (status.BackendState !== 'Running') return undefined
      return status.Self?.DNSName?.replace(/\.$/, '').toLowerCase() || undefined
    }
    catch {}
  }
}

// Only the clicker page itself. The custom header forces a CORS preflight, so
// another site needs the same origin, and the host must be an IP, localhost
// or this machine's tailnet name, which rules out a site that points its own
// name at this machine (DNS rebinding).
function fromClicker(req, tailnetName) {
  if (req.headers['x-slidev-clicker'] !== '1') return false
  const host = req.headers.host ?? ''
  const name = host.replace(/:\d+$/, '').replace(/^\[(.*)\]$/, '$1').toLowerCase()
  if (name !== 'localhost' && name !== tailnetName && !isIP(name)) return false
  try {
    return !req.headers.origin || new URL(req.headers.origin).host === host
  }
  catch {
    return false
  }
}

async function readJson(req) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > 1000) throw new Error('Body too large')
  }
  return JSON.parse(body)
}

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)

// Where a phone can press from: the tailnet name (or this machine's Tailscale
// IP without one), and the LAN with --trust-lan.
function clickerUrls(port, tailnetName) {
  const addresses = Object.values(networkInterfaces()).flat()
    .filter(i => i && !i.internal && String(i.family).endsWith('4') && trustedAddress(i.address))
    .map(i => i.address)
  const tailnet = tailnetName ? [tailnetName] : addresses.filter(tailscaleAddress)
  return [...tailnet, ...addresses.filter(a => !tailscaleAddress(a))].map(host => `http://${host}:${port}/clicker`)
}

export default function clickerPlugin(options) {
  const tailnetName = tailscaleName()
  return {
    name: 'slidev-addon-clicker',
    apply: 'serve',
    // Vite answers only IPs and localhost unless told otherwise.
    config: () => tailnetName ? { server: { allowedHosts: [tailnetName] } } : undefined,
    configureServer(server) {
      // A plain page, not a Slidev route: Slidev tabs on localhost report
      // their position, and on a page without a slide that is slide 1.
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' || !['/clicker', '/clicker/'].includes(req.url?.split('?')[0])) return next()
        const title = escapeHtml(options.data.config.title ?? 'Slides')
        res.setHeader('content-type', 'text/html; charset=utf-8')
        res.setHeader('cache-control', 'no-store')
        res.end(PAGE.replaceAll('%TITLE%', () => title).replace('%TOTAL%', String(options.data.slides.length)))
      })

      // A press goes to the presenter's tabs, which take the step themselves
      // (setup/root.ts), so clicks and transitions match the arrow keys.
      server.middlewares.use('/__slidev-clicker', async (req, res) => {
        if (req.method !== 'POST' || !trustedAddress(req.socket.remoteAddress) || !fromClicker(req, tailnetName)) {
          res.statusCode = 403
          return res.end()
        }
        try {
          const { dir, page, clicks } = await readJson(req)
          if (!['next', 'prev'].includes(dir) || ![page, clicks].every(Number.isInteger)) throw new Error('Bad press')
          server.ws.send('slidev-clicker:press', { dir, page, clicks })
          res.statusCode = 204
        }
        catch {
          res.statusCode = 400
        }
        res.end()
      })

      // Phones reach the deck only when it listens beyond localhost (`--remote`).
      server.httpServer?.once('listening', () => {
        const host = server.config.server.host
        if (!host || host === 'localhost' || host === '127.0.0.1') return
        const urls = clickerUrls(server.httpServer.address().port, tailnetName)
        // After Slidev's own banner.
        setTimeout(() => {
          if (!urls.length) return console.log('\n  phone clicker       > connect this machine to Tailscale to use it\n')
          console.log(`\n  phone clicker       > ${urls.join('  ')}\n`)
          console.log(`${renderUnicodeCompact(urls[0]).split('\n').map(line => `  ${line}`).join('\n')}\n`)
        }, 1500)
      })
    },
  }
}
