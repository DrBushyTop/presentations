// Agents add, remove and reorder slides while notes wait to be sent. Slidev
// hot-reloads the deck but keeps the slide number on screen, so a slide added
// above shifts everything after it. Keep notes on the slide they describe.
import { effectScope, watch } from 'vue'
import { draft, hasPending, pending } from './store.mjs'

const slideKey = (route) => `${route.meta?.slide?.frontmatterRaw ?? ''}\n${route.meta?.slide?.content ?? ''}`

/** Where slide `no` went, or null if it changed, vanished or has an identical twin. */
function moved(no, before, now) {
  const key = before[no - 1]
  if (key === undefined || now[no - 1] === key) return null
  const at = now.indexOf(key)
  return at >= 0 && now.indexOf(key, at + 1) < 0 ? at + 1 : null
}

let started = false

/** Starts once per page, outside any component, so remounted nav controls do not remap twice. */
export function followSlides(nav) {
  if (started) return
  started = true
  effectScope(true).run(() => watch(() => nav.slides.value.map(slideKey), (now, before) => {
    for (const a of draft.value.annotations) {
      const to = moved(a.slide.no, before, now)
      if (to) a.slide.no = to
    }
    // A note being written follows its slide, and the view goes with it.
    if (pending.slide && (hasPending() || pending.wholeSlide)) {
      const to = moved(pending.slide.no, before, now)
      if (to) {
        pending.slide = { ...pending.slide, no: to }
        nav.go(to, pending.slide.clicks)
      }
    }
  }))
}
