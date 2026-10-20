import type { RouteLocationNormalized } from 'vue-router'
import { drawingState, lockShortcuts, onDrawingUpdate, onSharedUpdate, useNav } from '@slidev/client'
import { createStatus } from './status'
import { SYNC_CHANNEL } from './bridge'
import { sanitizeDrawing } from './sanitize'
import { createMedia, type Shown } from './media'

declare const __SLIDEV_LIVE_RELAY__: string
declare const __SLIDEV_LIVE_DECK__: string
declare const __SLIDEV_LIVE_BUILD__: string

interface Nav { page: number, clicks: number }
interface Message {
  t: 'snapshot' | 'live' | 'nav' | 'cursor' | 'drawings' | 'synced' | 'presenter' | 'media'
  ts?: number
  live?: boolean
  on?: boolean
  presenter?: boolean
  connected?: boolean
  nav?: Nav
  cursor?: { x: number, y: number, style?: 'cursor' | 'laser' } | null
  drawings?: Record<string, string>
  synced?: Record<string, unknown>
  key?: string
  value?: unknown
  deck?: string
  build?: string
  since?: number
  media?: Shown
}

const SITE_POLL = 10_000
const RELOAD_GUARD = 'slidev-live-reloaded'
// The relay answers every ping. Silence this long means a dead connection.
const PING_INTERVAL = 10_000
const PING_DEADLINE = 35_000

// Timestamps for scripts/live-latency.mjs. Bounded, so it costs nothing.
interface Trace { ts?: number, recv: number, page: number, clicks: number, painted?: number }
const trace: Trace[] = []

// Read-only viewer: follows the relay and never lets the audience move away.
export function startFollower() {
  const { slides, go, currentSlideNo, clicks } = useNav()
  const status = createStatus()
  const media = createMedia(__SLIDEV_LIVE_RELAY__)
  const synced = new Map<string, unknown>()
  const channel = new BroadcastChannel(SYNC_CHANNEL)
  let target: Nav | undefined
  let following = false
  // The deck and build on stage. The site holds one deck; when the presenter
  // starts another one (or a newer build), this page reloads once the site
  // has it.
  let stage: { deck?: string, build?: string, since?: number } = {}
  let stageLive = false
  // A new talk of this deck started since this page loaded.
  let restarted = false
  const onStage = () => !stage.deck || stage.deck === __SLIDEV_LIVE_DECK__
  const current = () => onStage() && (!stage.build || !__SLIDEV_LIVE_BUILD__ || stage.build === __SLIDEV_LIVE_BUILD__)

  ;(window as any).__slidevLive = { trace, current: () => ({ page: currentSlideNo.value, clicks: clicks.value }) }
  lockShortcuts()
  document.documentElement.classList.add('slidev-live-viewer')

  // A component that mounts after its state arrived asks for it.
  channel.onmessage = (event) => {
    const { key, request } = event.data ?? {}
    if (request && synced.has(key)) channel.postMessage({ key, value: synced.get(key) })
  }

  const routeNo = (to: RouteLocationNormalized) => {
    const no = String(to.params.no ?? '')
    return slides.value.find(s => String(s.no) === no || s.meta.slide?.frontmatter.routeAlias === no)?.no
  }

  // Swipes, nav buttons and links all go through the router, so this is
  // the single place that keeps viewers on the presenter's slide.
  useNav().router.beforeEach((to) => {
    if (!target || following) return true
    return routeNo(to) === target.page && Number(to.query.clicks ?? 0) === target.clicks
  })

  // The first frame with the target slide in the DOM. Slide components load
  // on their own, after the router has finished.
  function painted(nav: Nav, entry?: Trace, tries = 0) {
    if (!entry) return
    requestAnimationFrame(() => {
      if (target !== nav) return
      const shown = currentSlideNo.value === nav.page && clicks.value === nav.clicks
        && document.querySelector(`.slidev-page-${nav.page}`)
      if (shown) entry.painted = Date.now()
      else if (tries < 120) painted(nav, entry, tries + 1)
    })
  }

  function follow(nav: Nav, entry?: Trace) {
    target = nav
    onSharedUpdate({
      page: nav.page,
      clicks: nav.clicks,
      lastUpdate: { id: 'live', type: 'presenter', time: Date.now() },
    })
    if (currentSlideNo.value === nav.page && clicks.value === nav.clicks) return painted(nav, entry)
    following = true
    go(nav.page, nav.clicks).finally(() => {
      following = false
      painted(nav, entry)
    })
  }

  function setDrawings(next: Record<string, string> = {}) {
    // Drawings are SVG markup that Slidev puts in the page as is. Anyone who
    // could reach the presenter's dev server could have written them.
    // Slidev merges drawing updates; cleared pages have to be blanked explicitly.
    const patch: Record<string, string> = {}
    for (const [page, svg] of Object.entries(next)) patch[page] = sanitizeDrawing(svg)
    for (const page of Object.keys(drawingState)) {
      if (!(page in next)) patch[page] = ''
    }
    onDrawingUpdate(patch as any)
  }

  function setSynced(key: string, value: unknown) {
    synced.set(key, value)
    channel.postMessage({ key, value })
  }

  // A reload starts clean: right for a new deck, a new build, or a new talk.
  // At most one a minute, in case the site serves an older page; a reload
  // held back by that runs once the minute is up.
  let pendingReload: ReturnType<typeof setTimeout> | undefined
  function reload() {
    const wait = Number(sessionStorage.getItem(RELOAD_GUARD) ?? 0) + 60_000 - Date.now()
    if (wait > 0) {
      clearTimeout(pendingReload)
      pendingReload = setTimeout(reload, wait)
      return false
    }
    sessionStorage.setItem(RELOAD_GUARD, String(Date.now()))
    location.reload()
    return true
  }

  let polling: ReturnType<typeof setTimeout> | undefined
  function waitForSite() {
    clearTimeout(polling)
    if (current() || !stageLive) return
    polling = setTimeout(async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}live.json`, { cache: 'no-store' })
        const site = await res.json()
        const ready = site.deck === stage.deck && (!stage.build || site.build === stage.build)
        if (ready && !current() && reload()) return
      }
      catch {}
      waitForSite()
    }, SITE_POLL * (0.5 + Math.random()))
  }

  function handle(msg: Message) {
    if (msg.t === 'snapshot') {
      // A new talk of this same deck and build: drop the old one's drawings
      // and interactive state by starting over. For another build, the reload
      // waits for the site to have it (below).
      if (stage.since !== undefined && msg.since !== stage.since && msg.deck === __SLIDEV_LIVE_DECK__) {
        restarted = true
        // Until the reload runs, at least late-mounting slides get no old state.
        synced.clear()
      }
      stage = { deck: msg.deck, build: msg.build, since: msg.since }
      if (restarted && current() && reload()) return
    }
    if (msg.t === 'snapshot' || msg.t === 'live') {
      stageLive = msg.t === 'snapshot' ? !!msg.live : !!msg.on
      waitForSite()
    }
    // Another deck, or another build of this one (slide numbers can differ),
    // means nothing here. While it is live, this page waits for the site to
    // have it.
    if (!current()) {
      media.active(false)
      status.live(false)
      status.switching(stageLive ? (onStage() ? 'build' : 'deck') : false)
      return
    }
    status.switching(false)
    switch (msg.t) {
      case 'snapshot':
        status.presenter(msg.presenter !== false)
        for (const [key, value] of Object.entries(msg.synced ?? {})) setSynced(key, value)
        setDrawings(msg.drawings)
        if (msg.cursor !== undefined) onSharedUpdate({ cursor: msg.cursor ?? undefined })
        if (msg.nav) follow(msg.nav)
        status.live(!!msg.live && !!msg.nav)
        media.active(!!msg.live)
        media.show(msg.media)
        break
      case 'media':
        media.show(msg.media)
        break
      case 'live':
        status.live(!!msg.on && !!target)
        media.active(!!msg.on)
        break
      case 'nav':
        if (!msg.nav) return
        const entry: Trace = { ts: msg.ts, recv: Date.now(), page: msg.nav.page, clicks: msg.nav.clicks }
        trace.push(entry)
        if (trace.length > 500) trace.shift()
        follow(msg.nav, entry)
        status.live(true)
        break
      case 'cursor':
        onSharedUpdate({ cursor: msg.cursor ?? undefined })
        break
      case 'drawings':
        setDrawings(msg.drawings)
        break
      case 'synced':
        if (msg.key) setSynced(msg.key, msg.value)
        break
      case 'presenter':
        status.presenter(!!msg.connected)
        break
    }
  }

  const url = `${__SLIDEV_LIVE_RELAY__.replace(/\/$/, '')}/viewer`
  let ws: WebSocket | undefined
  let retry = 500
  let reconnect: ReturnType<typeof setTimeout> | undefined
  let lastSeen = 0
  let retireCurrent = () => {}

  function connect() {
    clearTimeout(reconnect)
    const socket = new WebSocket(url)
    ws = socket
    let ping: ReturnType<typeof setInterval> | undefined
    // Drops this socket without waiting for its closing handshake, which can
    // take minutes on a dead network, and connects again.
    const retire = () => {
      clearInterval(ping)
      if (ws !== socket) return
      ws = undefined
      socket.onclose = null
      try {
        socket.close()
      }
      catch {}
      status.connecting()
      // Jitter, so a relay restart does not bring every viewer back at once.
      reconnect = setTimeout(connect, retry * (0.5 + Math.random()))
      retry = Math.min(retry * 2, 10_000)
    }
    socket.onopen = () => {
      retry = 500
      lastSeen = Date.now()
      ping = setInterval(() => {
        if (Date.now() - lastSeen > PING_DEADLINE) return retire()
        if (socket.readyState === WebSocket.OPEN) socket.send('ping')
      }, PING_INTERVAL)
    }
    socket.onmessage = (event) => {
      if (ws !== socket) return
      lastSeen = Date.now()
      if (event.data === 'pong') return
      try {
        handle(JSON.parse(event.data))
      }
      catch (error) {
        console.error('[live] bad message', error)
      }
    }
    socket.onclose = retire
    retireCurrent = () => {
      retry = 500
      retire()
    }
  }

  // Phones suspend background tabs, and a socket can look open long after its
  // network went away. On return, check that the relay still answers.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    const socket = ws
    // Waiting to reconnect: do it now.
    if (!socket) {
      retry = 500
      return connect()
    }
    if (socket.readyState !== WebSocket.OPEN) {
      if (socket.readyState !== WebSocket.CONNECTING) retireCurrent()
      return
    }
    const asked = Date.now()
    socket.send('ping')
    setTimeout(() => {
      if (ws === socket && lastSeen < asked) retireCurrent()
    }, 3000)
  })

  connect()
}
