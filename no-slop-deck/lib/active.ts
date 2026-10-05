import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

// True while this slide is the one on screen, so loops and timers only run
// when someone can see them.
export function useIsActive() {
  const { $slidev, $page, $renderContext } = useSlideContext()
  return computed(() =>
    $slidev?.nav?.currentPage === $page.value
    && ['slide', 'presenter'].includes($renderContext.value as string),
  )
}

export function prefersReducedMotion() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Elapsed seconds since `running` became true. Resets when it turns false.
export function useClock(running: () => boolean) {
  const t = ref(0)
  let raf = 0
  let start = 0
  const tick = (now: number) => {
    t.value = (now - start) / 1000
    raf = requestAnimationFrame(tick)
  }
  watch(running, (on) => {
    cancelAnimationFrame(raf)
    if (on) {
      start = performance.now()
      t.value = 0
      raf = requestAnimationFrame(tick)
    }
    else {
      t.value = 0
    }
  }, { immediate: true })
  onBeforeUnmount(() => cancelAnimationFrame(raf))
  return t
}
