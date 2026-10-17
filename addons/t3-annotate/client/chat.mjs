// The conversation with the deck's agent thread. Module scope so the nav button
// can show progress while the chat panel is closed.
import { reactive, watch } from 'vue'
import { api, draft, ui } from './store.mjs'

export const chat = reactive({
  threadId: '', // the thread `data` belongs to
  data: null, // { thread, messages, activity } from the chat route
  error: '',
  sending: null, // the message on its way, shown until the thread has it
  unread: false, // the agent answered while the panel was closed
})

const FAST_MS = 1200
const SLOW_MS = 4000
let timer = null
let fastUntil = 0

async function load() {
  const id = draft.value.threadId
  if (!id) {
    Object.assign(chat, { threadId: '', data: null })
    return
  }
  const wasBusy = chat.threadId === id && chat.data?.thread.busy
  try {
    const data = await api(`chat?threadId=${encodeURIComponent(id)}`)
    if (draft.value.threadId !== id) return
    Object.assign(chat, { threadId: id, data, error: '' })
    if (chat.sending && data.messages.filter((m) => m.role === 'user').length > chat.sending.userCount) chat.sending = null
    if (wasBusy && !data.thread.busy && !ui.trayOpen) chat.unread = true
  }
  catch (e) { chat.error = e.message }
}

function schedule() {
  clearTimeout(timer)
  timer = null
  const busy = chat.data?.thread.busy || chat.sending || Date.now() < fastUntil
  if (!busy && !ui.trayOpen) return
  timer = setTimeout(async () => { await load(); schedule() }, busy ? FAST_MS : SLOW_MS)
}

/** Reloads now and keeps polling while the panel is open or the agent works. */
export async function refreshChat({ fast = false } = {}) {
  if (fast) fastUntil = Date.now() + 15_000 // a new turn takes a moment to show as running
  await load()
  schedule()
}

watch(() => ui.trayOpen, (open) => {
  if (open) chat.unread = false
  refreshChat()
})
watch(() => draft.value.threadId, () => refreshChat())
