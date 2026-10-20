import { useNav } from '@slidev/client'

// Decks keep interactive slide state on this BroadcastChannel (see
// no-slop-deck/lib/sync.ts).
export const SYNC_CHANNEL = 'slidev-live-sync'

function post(route: string, body: unknown) {
  fetch(`/__slidev-live/${route}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-slidev-live': '1' },
    body: JSON.stringify(body),
  }).catch(() => {})
}

// Runs in every dev tab while `npm run live` publishes.
export function startBridge() {
  const { router, slides } = useNav()

  // Slidev reports the presenter's position after a 10 ms debounce that also
  // waits for the presenter view to render. Report it from the router first;
  // the dev server reconciles with Slidev's state right after.
  const tab = Math.random().toString(36).slice(2)
  let seq = 0
  router.afterEach((to, from, failure) => {
    if (failure || to.name !== 'presenter') return
    const no = String(to.params.no ?? '')
    const page = slides.value.find(s => String(s.no) === no || s.meta.slide?.frontmatter.routeAlias === no)?.no
    if (page) post('nav', { page, clicks: Number(to.query.clicks ?? 0), tab, seq: seq++ })
  })

  // Forward interactive slide state to the dev server, which relays it.
  const channel = new BroadcastChannel(SYNC_CHANNEL)
  channel.onmessage = (event) => {
    const { key, value, request, from, seq } = event.data ?? {}
    if (!request && typeof key === 'string' && typeof from === 'string') post('synced', { key, value, from, seq })
  }
}
