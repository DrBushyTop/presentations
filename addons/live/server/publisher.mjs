// Forwards the dev server's shared Slidev state to the live relay. Whatever
// moves the deck locally (presenter view, phone remote, a trusted play tab)
// goes through the dev server, so viewers follow all of them.

const CURSOR_INTERVAL = 33
const DRAWINGS_INTERVAL = 50
const HINT_WINDOW = 800
// The relay answers every ping. Silence this long means a dead connection.
const PING_INTERVAL = 10_000
const PING_DEADLINE = 25_000

// The relay shows one talk at a time. The first connection of a session takes
// the stage; later ones only resume it, so a server that was replaced cannot
// take the stage back.
export function createPublisher({ relay, deck, key, session, build = '', host = '', log = console }) {
  const base = `${relay.replace(/\/$/, '')}/publish?${new URLSearchParams({ session, deck, build, host })}`
  let resume = false
  const last = { nav: undefined, cursor: undefined, drawings: undefined, synced: {} }
  let ws
  let retry = 500
  let stopped = false
  let keepalive
  let lastSeen = 0

  function connect() {
    const socket = new WebSocket(resume ? `${base}&resume=1` : base, { headers: { authorization: `Bearer ${key}` } })
    ws = socket
    socket.addEventListener('open', () => {
      log.info(resume ? '[live] reconnected to the relay' : `[live] publishing ${deck} to ${relay}`)
      resume = true
      retry = 500
      send({ t: 'live', on: true })
      // A reconnect may have missed changes, so resend everything.
      if (last.nav) send({ t: 'nav', nav: JSON.parse(last.nav) })
      if (last.cursor) send({ t: 'cursor', cursor: JSON.parse(last.cursor) })
      if (last.drawings) send({ t: 'drawings', drawings: JSON.parse(last.drawings) })
      for (const [k, v] of Object.entries(last.synced)) send({ t: 'synced', key: k, value: JSON.parse(v) })
      lastSeen = Date.now()
      clearInterval(keepalive)
      keepalive = setInterval(() => {
        if (Date.now() - lastSeen > PING_DEADLINE) return closed(socket, 1006, 'no reply to pings')
        if (socket.readyState === WebSocket.OPEN) socket.send('ping')
      }, PING_INTERVAL)
    })
    // The relay says why before it closes; the close itself can lag.
    socket.addEventListener('message', (event) => {
      lastSeen = Date.now()
      if (typeof event.data !== 'string' || !event.data.startsWith('{')) return
      try {
        const msg = JSON.parse(event.data)
        if (msg.t === 'closing') closed(socket, msg.code, msg.reason)
      }
      catch {}
    })
    socket.addEventListener('close', event => closed(socket, event.code, event.reason))
    socket.addEventListener('error', () => {})
  }

  function closed(socket, code, reason) {
    // An older socket of this session, already replaced.
    if (ws !== socket) return
    ws = undefined
    clearInterval(keepalive)
    try {
      socket.close()
    }
    catch {}
    if (stopped) return
    if (code === 4000) {
      stopped = true
      const why = reason === 'Stopped' ? 'The talk was stopped' : (reason || 'Another presentation took over')
      log.warn(`[live] ${why}. This dev server no longer publishes to the live site.`)
      log.warn('[live] Run `npm run live` again to take the live site back.')
      return
    }
    log.warn(`[live] relay connection lost (${reason || code || 'no code'}), retrying in ${retry} ms`)
    setTimeout(connect, retry)
    retry = Math.min(retry * 2, 10_000)
  }

  function send(msg) {
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ ...msg, ts: Date.now() }))
  }

  // Sends at most once per interval, always with the latest value.
  function throttle(interval, fn) {
    let timer
    let at = 0
    return () => {
      if (timer) return
      const wait = Math.max(0, at + interval - Date.now())
      timer = setTimeout(() => {
        timer = undefined
        at = Date.now()
        fn()
      }, wait)
    }
  }
  const sendCursor = throttle(CURSOR_INTERVAL, () => send({ t: 'cursor', cursor: JSON.parse(last.cursor) }))
  const sendDrawings = throttle(DRAWINGS_INTERVAL, () => send({ t: 'drawings', drawings: JSON.parse(last.drawings) }))

  let serverNav
  let hintUntil = 0
  const hintSeq = {}
  const syncedSeq = new Map()
  let reconcile
  function sendNav(nav) {
    if (!nav) return
    const text = JSON.stringify(nav)
    if (text === last.nav) return
    last.nav = text
    send({ t: 'nav', nav })
  }

  connect()

  return {
    // The presenter tab's own report, sent before it renders. Fastest path.
    navHint(page, clicks, tab, seq) {
      // Separate requests can overtake each other; keep each tab's order.
      if ((hintSeq[tab] ?? -1) >= seq) return
      hintSeq[tab] = seq
      hintUntil = Date.now() + HINT_WINDOW
      clearTimeout(reconcile)
      reconcile = setTimeout(() => sendNav(serverNav), HINT_WINDOW)
      sendNav({ page, clicks })
    },
    // The dev server's shared state: covers the phone remote and every other
    // client. Right after a hint it may still be one step behind (rapid
    // presses), so it only reconciles once the hint window has passed.
    nav(state) {
      if (!state?.page) return
      serverNav = { page: state.page, clicks: state.clicks ?? 0 }
      if (Date.now() >= hintUntil) sendNav(serverNav)
      const cursor = JSON.stringify(state.cursor ?? null)
      if (cursor !== last.cursor) {
        last.cursor = cursor
        sendCursor()
      }
    },
    drawings(state) {
      const drawings = JSON.stringify(state ?? {})
      if (drawings === last.drawings) return
      last.drawings = drawings
      sendDrawings()
    },
    // Every dev tab forwards the same BroadcastChannel message, and separate
    // requests can overtake each other: keep each source tab's order.
    synced(k, value, from, seq) {
      const order = `${from}\0${k}`
      if ((syncedSeq.get(order) ?? -1) >= seq) return
      syncedSeq.set(order, seq)
      const v = JSON.stringify(value ?? null)
      if (last.synced[k] === v) return
      last.synced[k] = v
      send({ t: 'synced', key: k, value: JSON.parse(v) })
    },
  }
}
