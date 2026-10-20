import type { RouteLocationNormalized } from 'vue-router'
import { drawingState, lockShortcuts, onDrawingUpdate, onSharedUpdate, useNav } from '@slidev/client'
import { createStatus } from './status'
import { SYNC_CHANNEL } from './bridge'

declare const __SLIDEV_LIVE_RELAY__: string
declare const __SLIDEV_LIVE_DECK__: string

interface Nav { page: number, clicks: number }
interface Message {
  t: 'snapshot' | 'live' | 'nav' | 'cursor' | 'drawings' | 'synced' | 'presenter'
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
}

// Timestamps for scripts/live-latency.mjs. Bounded, so it costs nothing.
interface Trace { ts?: number, recv: number, page: number, clicks: number, painted?: number }
const trace: Trace[] = []

// Read-only viewer: follows the relay and never lets the audience move away.
export function startFollower() {
  const { slides, go, currentSlideNo, clicks } = useNav()
  const status = createStatus()
  const synced = new Map<string, unknown>()
  const channel = new BroadcastChannel(SYNC_CHANNEL)
  let target: Nav | undefined
  let following = false

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

  function follow(nav: Nav, entry?: Trace) {
    target = nav
    const painted = () => requestAnimationFrame(() => { if (entry) entry.painted = Date.now() })
    onSharedUpdate({
      page: nav.page,
      clicks: nav.clicks,
      lastUpdate: { id: 'live', type: 'presenter', time: Date.now() },
    })
    if (currentSlideNo.value === nav.page && clicks.value === nav.clicks) return painted()
    following = true
    go(nav.page, nav.clicks).finally(() => {
      following = false
      painted()
    })
  }

  function setDrawings(next: Record<string, string> = {}) {
    // Slidev merges drawing updates; cleared pages have to be blanked explicitly.
    const patch: Record<string, string> = { ...next }
    for (const page of Object.keys(drawingState)) {
      if (!(page in next)) patch[page] = ''
    }
    onDrawingUpdate(patch as any)
  }

  function setSynced(key: string, value: unknown) {
    synced.set(key, value)
    channel.postMessage({ key, value })
  }

  function handle(msg: Message) {
    switch (msg.t) {
      case 'snapshot':
        status.presenter(msg.presenter !== false)
        for (const [key, value] of Object.entries(msg.synced ?? {})) setSynced(key, value)
        if (msg.drawings) setDrawings(msg.drawings)
        if (msg.cursor !== undefined) onSharedUpdate({ cursor: msg.cursor ?? undefined })
        if (msg.nav) follow(msg.nav)
        status.live(!!msg.live && !!msg.nav)
        break
      case 'live':
        status.live(!!msg.on && !!target)
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

  const url = `${__SLIDEV_LIVE_RELAY__.replace(/\/$/, '')}/viewer/${__SLIDEV_LIVE_DECK__}`
  let ws: WebSocket | undefined
  let retry = 500
  let reconnect: ReturnType<typeof setTimeout> | undefined

  function connect() {
    clearTimeout(reconnect)
    const socket = new WebSocket(url)
    ws = socket
    let ping: ReturnType<typeof setInterval> | undefined
    socket.onopen = () => {
      retry = 500
      ping = setInterval(() => socket.readyState === WebSocket.OPEN && socket.send('ping'), 30_000)
    }
    socket.onmessage = (event) => {
      if (event.data === 'pong') return
      try {
        handle(JSON.parse(event.data))
      }
      catch (error) {
        console.error('[live] bad message', error)
      }
    }
    socket.onclose = () => {
      clearInterval(ping)
      if (ws !== socket) return
      status.connecting()
      // Jitter, so a relay restart does not bring every viewer back at once.
      reconnect = setTimeout(connect, retry * (0.5 + Math.random()))
      retry = Math.min(retry * 2, 10_000)
    }
  }

  // Phones suspend background sockets. Reconnect as soon as the tab is back.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ws?.readyState !== WebSocket.OPEN && ws?.readyState !== WebSocket.CONNECTING) {
      retry = 500
      connect()
    }
  })

  connect()
}
