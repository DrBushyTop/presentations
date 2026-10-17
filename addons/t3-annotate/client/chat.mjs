// The conversation with the deck's agent thread. The dev server owns it, so every
// tab on that server shows the same chat and a restarted server starts a new one.
// Module scope so the nav button can show progress while the chat panel is closed.
import { reactive, watch } from 'vue'
import { api, ui } from './store.mjs'

export const chat = reactive({
  conversation: { threadId: '', chats: [] }, // this server's open thread and earlier chats
  data: null, // { thread, messages, activity } for the open thread, null for a new chat
  error: '',
  sending: null, // the message on its way, shown until the thread has it
  unread: false, // the agent answered while the panel was closed
})

const FAST_MS = 1200
const SLOW_MS = 4000
let timer = null
let fastUntil = 0

function apply({ conversation, ...data }) {
  const was = chat.data?.thread
  chat.conversation = conversation
  chat.data = data.thread ? data : null
  chat.error = ''
  if (chat.sending && data.messages.filter((m) => m.role === 'user').length > chat.sending.userCount) chat.sending = null
  if (was?.busy && data.thread?.id === was.id && !data.thread.busy && !ui.trayOpen) chat.unread = true
}

async function load() {
  try { apply(await api('chat')) }
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

/** Switches this server's conversation to another thread, or to a new chat with ''. */
export async function openChat(threadId) {
  chat.data = null
  chat.conversation = { ...chat.conversation, threadId }
  try { chat.conversation = await api('conversation', { threadId }) }
  catch (e) { chat.error = e.message }
  await refreshChat()
}

watch(() => ui.trayOpen, (open) => {
  if (open) chat.unread = false
  refreshChat()
})
refreshChat() // the agent may be working on this server's chat already
