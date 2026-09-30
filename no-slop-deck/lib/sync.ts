import { onBeforeUnmount, ref, watch } from 'vue'
import type { Ref } from 'vue'

// Keeps a small piece of interactive state in step between the presenter
// window and the audience window when both run in the same browser.
export function useSynced<T>(key: string, init: T): Ref<T> {
  const value = ref(init) as Ref<T>
  if (typeof BroadcastChannel === 'undefined') return value
  const channel = new BroadcastChannel('no-slop-sync')
  let applying = false
  channel.onmessage = (event) => {
    if (event.data?.key !== key) return
    applying = true
    value.value = event.data.value
    queueMicrotask(() => { applying = false })
  }
  watch(value, (next) => {
    if (!applying) channel.postMessage({ key, value: JSON.parse(JSON.stringify(next)) })
  }, { deep: true })
  onBeforeUnmount(() => channel.close())
  return value
}
