import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

// One place for the three questions every animated component asks: should
// this run at all, is the slide on screen, and how should it move.
//
// `still` renders the end state at once. It covers the overview, print and
// export, the presenter's next-slide preview, reduced motion, and the layout
// check (which loads slides with ?embedded=true).
export function useStage() {
  const { $slidev, $page, $renderContext } = useSlideContext()
  const embedded = typeof location !== 'undefined' && new URLSearchParams(location.search).has('embedded')
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const still = computed(() => embedded || reduced || !['slide', 'presenter'].includes($renderContext.value as string))
  const active = computed(() => !still.value && $slidev?.nav?.currentPage === $page.value)

  // Stays true through the page turn on leaving, so nothing plays backwards
  // while the slide is still visible.
  const entered = ref(still.value || active.value)
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(active, (on) => {
    clearTimeout(timer)
    if (on) entered.value = true
    else if (!still.value) timer = setTimeout(() => { entered.value = false }, 900)
  })
  watch(still, (on) => { if (on) entered.value = true })
  onBeforeUnmount(() => clearTimeout(timer))

  const spring = (over: Record<string, unknown> = {}) =>
    still.value ? { duration: 0 } : { type: 'spring', visualDuration: 0.5, bounce: 0.18, ...over }
  const ease = (duration = 0.6, over: Record<string, unknown> = {}) =>
    still.value ? { duration: 0 } : { duration, ease: [0.16, 1, 0.3, 1], ...over }
  // For reveals the audience follows from end to end. `ease` is mostly over in the first third.
  const sweep = (duration = 2, over: Record<string, unknown> = {}) =>
    still.value ? { duration: 0 } : { duration, ease: [0.45, 0, 0.55, 1], ...over }

  return { still, active, entered, spring, ease, sweep }
}

// Drag along an element to get a 0 to 1 position. Measures on screen, so it holds
// at any slide scale, and tells the deck's other windows, so a drag in the
// presenter view also moves the audience window.
export function useScrub(name: string, axis: 'x' | 'y', apply: (position: number) => void) {
  const { still } = useStage()
  const bus = typeof BroadcastChannel === 'undefined' ? undefined : new BroadcastChannel(`hill-climb-${name}`)
  if (bus) bus.onmessage = (e: MessageEvent<number>) => { if (!still.value) apply(e.data) }
  onBeforeUnmount(() => bus?.close())

  const dragging = ref(false)
  function move(e: PointerEvent) {
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const along = axis === 'x' ? (e.clientX - box.left) / box.width : (e.clientY - box.top) / box.height
    const position = Math.min(1, Math.max(0, along))
    apply(position)
    bus?.postMessage(position)
  }
  const on = {
    onPointerdown(e: PointerEvent) {
      e.stopPropagation() // Otherwise a touch drag also counts as a slide swipe.
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      dragging.value = true
      move(e)
    },
    onPointermove(e: PointerEvent) { if (dragging.value) move(e) },
    onPointerup() { dragging.value = false },
    onPointercancel() { dragging.value = false },
  }
  return { on, dragging }
}

// Files in public/, with the deck's base path.
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

// Runs fn every `ms` while `running()` is true. Stops by itself on unmount.
export function useTicker(running: () => boolean, ms: number, fn: () => void) {
  let id: ReturnType<typeof setInterval> | undefined
  const stop = () => { clearInterval(id); id = undefined }
  watch(running, (on) => {
    stop()
    if (on) id = setInterval(fn, ms)
  }, { immediate: true })
  onBeforeUnmount(stop)
}
