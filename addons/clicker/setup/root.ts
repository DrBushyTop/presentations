import { sharedState, useNav } from '@slidev/client'
import { syncDirections } from '@slidev/client/state/storage.ts'
import { defineRootSetup } from '@slidev/types'
import { watch } from 'vue'
import { START_LOCATION } from 'vue-router'

// Slidev takes positions from play views only on these hosts.
const TRUSTED_HOSTS = ['localhost', '127.0.0.1']

export default defineRootSetup(() => {
  if (!import.meta.env.DEV) return
  const { router, slides, isPresenter, isPlaying, currentSlideNo, clicks, next, prev, go } = useNav()
  const at = (page: number, c: number) => page === currentSlideNo.value && c === clicks.value

  // Phone clicker presses (server/plugin.mjs). Every tab that may report a
  // position and is on the step the phone saw takes it; they all land on the
  // same step. Page 0: nobody has moved since the dev server started.
  const drives = () => isPresenter.value || (isPlaying.value && TRUSTED_HOSTS.includes(location.hostname))
  import.meta.hot?.on('slidev-clicker:press', ({ dir, page, clicks: c }) => {
    if (!drives() || (page && !at(page, c))) return
    if (dir === 'next') next()
    else prev()
  })

  // The phone's clock button drives Slidev's timer, the one in the presenter
  // view, as its own buttons do (composables/useTimer.ts). The phone asks for
  // the state it wants, so two tabs taking the same press agree.
  import.meta.hot?.on('slidev-clicker:timer', ({ op }) => {
    if (!drives()) return
    const timer = sharedState.timer
    const now = Date.now()
    if (op === 'start' && timer.status !== 'running') {
      timer.startedAt = timer.status === 'paused' ? now - (timer.pausedAt - timer.startedAt) : now
      timer.status = 'running'
    }
    else if (op === 'pause' && timer.status === 'running') {
      timer.pausedAt = now
      timer.status = 'paused'
    }
    else if (op === 'reset' && timer.status !== 'stopped') {
      sharedState.timer = { status: 'stopped', slides: {}, startedAt: 0, pausedAt: 0 }
    }
  })

  // Slidev's presenter views ignore each other's moves: they follow play views
  // only. A second one, such as a phone, moved the audience but not the
  // laptop, and the laptop's next step pulled everyone back. Follow them too.
  watch(() => sharedState.lastUpdate, (update) => {
    if (!isPresenter.value || update?.type !== 'presenter' || !syncDirections.value.presenterReceive) return
    const page = Number(sharedState.page)
    const c = Number(sharedState.clicks)
    if (slides.value[page - 1] && !at(page, c)) go(page, c)
  })

  // A presenter view that loads mid-talk reports the slide in its URL, which
  // after a reload is stale, and everyone jumps there. Join the talk instead.
  router.beforeEach((to, from) => {
    if (from !== START_LOCATION || to.name !== 'presenter' || !sharedState.lastUpdate || !syncDirections.value.presenterReceive) return
    const page = Number(sharedState.page)
    const c = Number(sharedState.clicks)
    const no = String(to.params.no)
    const target = slides.value.find(s => String(s.no) === no || s.meta.slide?.frontmatter.routeAlias === no)?.no
    if (!slides.value[page - 1] || (target === page && Number(to.query.clicks ?? 0) === c)) return
    return { path: `/presenter/${page}`, query: { ...to.query, clicks: c ? String(c) : undefined }, replace: true }
  })
})
