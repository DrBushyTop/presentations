import { onBeforeUnmount, ref, watch } from 'vue'
import type { Ref } from 'vue'

// Identifies this tab's changes, so the live addon keeps them in order.
const from = Math.random().toString(36).slice(2)
let seq = 0

// Keeps a small piece of interactive state in step between the presenter
// window and the audience window when both run in the same browser. The live
// addon (addons/live) relays this channel to remote viewers.
export function useSynced<T>(key: string, init: T): Ref<T> {
  const value = ref(init) as Ref<T>
  if (typeof BroadcastChannel === 'undefined') return value
  const channel = new BroadcastChannel('slidev-live-sync')
  let applying = false
  channel.onmessage = (event) => {
    if (event.data?.key !== key || event.data.request) return
    applying = true
    value.value = event.data.value
    queueMicrotask(() => { applying = false })
  }
  watch(value, (next) => {
    if (!applying) channel.postMessage({ key, value: JSON.parse(JSON.stringify(next)), from, seq: seq++ })
  }, { deep: true })
  // A live viewer that mounts this slide late asks for the current value.
  channel.postMessage({ key, request: true })
  onBeforeUnmount(() => channel.close())
  return value
}
