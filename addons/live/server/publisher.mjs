// Forwards the dev server's shared Slidev state to the live relay. Whatever
// moves the deck locally (presenter view, phone remote, a trusted play tab)
// goes through the dev server, so viewers follow all of them.

const CURSOR_INTERVAL = 33
const DRAWINGS_INTERVAL = 50
const HINT_WINDOW = 800

export function createPublisher({ relay, deck, key, log = console }) {
  const url = `${relay.replace(/\/$/, '')}/publish/${deck}`
  const last = { nav: undefined, cursor: undefined, drawings: undefined, synced: {} }
  let ws
  let retry = 500
  let stopped = false
  let keepalive

  function connect() {
    ws = new WebSocket(url, { headers: { authorization: `Bearer ${key}` } })
    ws.addEventListener('open', () => {
      retry = 500
      log.info(`[live] publishing ${deck} to ${relay}`)
      send({ t: 'live', on: true })
      // A reconnect may have missed changes, so resend everything.
      if (last.nav) send({ t: 'nav', nav: JSON.parse(last.nav) })
      if (last.cursor) send({ t: 'cursor', cursor: JSON.parse(last.cursor) })
      if (last.drawings) send({ t: 'drawings', drawings: JSON.parse(last.drawings) })
      for (const [k, v] of Object.entries(last.synced)) send({ t: 'synced', key: k, value: JSON.parse(v) })
      clearInterval(keepalive)
      keepalive = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send('ping'), 30_000)
    })
    ws.addEventListener('message', () => {})
    ws.addEventListener('close', (event) => {
      clearInterval(keepalive)
      if (stopped) return
      if (event.code === 4000) {
        stopped = true
        log.warn('[live] another machine took over this deck; this one stopped publishing')
        return
      }
      log.warn(`[live] relay connection closed (${event.code || 'no code'}), retrying in ${retry} ms`)
      setTimeout(connect, retry)
      retry = Math.min(retry * 2, 10_000)
    })
    ws.addEventListener('error', () => {})
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
    synced(k, value) {
      const v = JSON.stringify(value ?? null)
      if (last.synced[k] === v) return
      last.synced[k] = v
      send({ t: 'synced', key: k, value: JSON.parse(v) })
    },
  }
}
