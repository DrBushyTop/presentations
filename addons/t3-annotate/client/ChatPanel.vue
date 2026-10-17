<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useNav } from '@slidev/client'
import { chat, refreshChat } from './chat.mjs'
import { api, draft, modelChoice, ui } from './store.mjs'

const nav = useNav()
const models = ref([])
const threads = ref([])
const signingIn = ref(true)
const signedIn = ref(false)
const error = ref('')
const input = ref(null)
const scroller = ref(null)

const modelKey = m => `${m.instanceId}|${m.model}`
const selectedModel = computed(() => models.value.find(m => m.instanceId === modelChoice.value.instanceId && m.model === modelChoice.value.model))
const otherThreads = computed(() => threads.value.filter(t => !draft.value.chats.some(c => c.id === t.id)))
const providers = computed(() => [...new Set(models.value.map(m => m.provider))])

const data = computed(() => (chat.threadId === draft.value.threadId ? chat.data : null))
const thread = computed(() => data.value?.thread)
const messages = computed(() => data.value?.messages || [])
const threadModel = computed(() => thread.value && models.value.find(m => m.instanceId === thread.value.instanceId && m.model === thread.value.model))
const shotsPending = computed(() => draft.value.annotations.some(a => a.shotState === 'pending'))
const canSend = computed(() => signedIn.value && !chat.sending && !shotsPending.value
  && (draft.value.message.trim() || draft.value.annotations.length))

const statusLabel = s => ({ running: 'working', starting: 'starting', preparing: 'preparing', queued: 'queued', waiting: 'needs you', idle: 'idle', completed: 'done', failed: 'failed', interrupted: 'stopped', cancelled: 'cancelled' }[s] || s)

// The first call signs the slide server in to T3; the session ends when that server stops.
async function loadCatalog() {
  try {
    const [catalog, list] = await Promise.all([api('catalog'), api('threads')])
    models.value = catalog.models
    threads.value = list.threads
    // Keep chat titles current; T3 may rename a thread.
    for (const c of draft.value.chats) c.title = list.threads.find(t => t.id === c.id)?.title || c.title
    if (!selectedModel.value && models.value.length) {
      const m = models.value.find(x => x.instanceId === 'claudeAgent') || models.value[0]
      modelChoice.value = { instanceId: m.instanceId, model: m.model, effort: m.effort?.default || '' }
    }
    signedIn.value = true
    error.value = ''
  }
  catch (e) { error.value = e.message }
  finally { signingIn.value = false }
}

async function signOut() {
  await api('sign-out', {}).catch(() => {})
  signedIn.value = false
  ui.trayOpen = false
}

function pickModel(key) {
  const m = models.value.find(x => modelKey(x) === key)
  if (m) modelChoice.value = { instanceId: m.instanceId, model: m.model, effort: m.effort?.default || '' }
}

function openChat(id) {
  draft.value.threadId = id
  error.value = ''
  nextTick(() => input.value?.focus())
}

async function send() {
  if (!canSend.value) return
  const { message, annotations, threadId } = draft.value
  const m = selectedModel.value
  const body = {
    message,
    annotations,
    threadId: threadId || null,
    current: { no: nav.currentSlideNo.value, clicks: nav.clicks.value, clicksTotal: nav.clicksTotal.value },
    model: !threadId && m && {
      instanceId: m.instanceId,
      model: m.model,
      ...(m.effort && modelChoice.value.effort ? { options: [{ id: m.effort.id, value: modelChoice.value.effort }] } : {}),
    },
  }
  // Show the message right away; it is replaced once the thread has it.
  chat.sending = {
    text: message.trim(),
    notes: annotations.map(a => ({ shotId: a.shotId, slide: a.slide, comment: a.comment })),
    userCount: threadId ? messages.value.filter(x => x.role === 'user').length : 0,
  }
  draft.value.message = ''
  draft.value.annotations = []
  error.value = ''
  scrollToEnd(true)
  try {
    const result = await api('send', body)
    if (!threadId) {
      draft.value.chats = [{ id: result.threadId, title: result.title }, ...draft.value.chats].slice(0, 20)
      draft.value.threadId = result.threadId
    }
    await refreshChat({ fast: true })
  }
  catch (e) {
    error.value = e.message
    chat.sending = null
    draft.value.message = message
    draft.value.annotations = annotations
  }
}

function removeNote(id) {
  draft.value.annotations = draft.value.annotations.filter(a => a.id !== id)
}

function onKey(e) {
  if (e.key === 'Escape') ui.trayOpen = false
}

function onInputKey(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send() }
}

// Grow the composer with its text, up to a limit.
function autosize() {
  const el = input.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`
}
watch(() => draft.value.message, () => nextTick(autosize))

// Follow new output unless the presenter has scrolled up to read.
function scrollToEnd(force = false) {
  nextTick(() => {
    const el = scroller.value
    if (el && (force || el.scrollHeight - el.scrollTop - el.clientHeight < 120)) el.scrollTop = el.scrollHeight
  })
}
watch(() => [messages.value.length, messages.value.at(-1)?.html?.length, data.value?.activity?.length, chat.sending], () => scrollToEnd())
watch(() => draft.value.threadId, () => scrollToEnd(true))

onMounted(() => {
  loadCatalog()
  refreshChat().then(() => scrollToEnd(true))
  input.value?.focus()
  autosize()
})
</script>

<template>
  <aside data-t3-annotate-ui class="tc-panel" aria-label="Chat with the deck's agent" @keydown.stop="onKey">
    <header class="tc-head">
      <select class="tc-picker" :value="draft.threadId" aria-label="Chat" @change="openChat($event.target.value)">
        <option value="">New chat</option>
        <optgroup v-if="draft.chats.length" label="This deck">
          <option v-for="c in draft.chats" :key="c.id" :value="c.id">{{ c.title }}</option>
        </optgroup>
        <optgroup v-if="otherThreads.length" label="Other open threads">
          <option v-for="t in otherThreads" :key="t.id" :value="t.id">{{ t.title }}</option>
        </optgroup>
      </select>
      <span v-if="thread" class="tc-status" :class="{ busy: thread.busy, wait: thread.status === 'waiting' }">{{ statusLabel(thread.status) }}</span>
      <button type="button" class="tc-icon" title="Close (Esc)" aria-label="Close" @click="ui.trayOpen = false">✕</button>
    </header>

    <div ref="scroller" class="tc-log" aria-live="polite">
      <div v-if="!draft.threadId && !chat.sending" class="tc-empty">
        <p><strong>Chat about this deck.</strong> The agent gets the deck file and the slide you are on with every message, and edits the sources directly. The dev server shows its changes as they land.</p>
        <p>Use <button type="button" class="tc-link" @click="ui.active = true">Annotate</button> to point at things on a slide. Each note attaches a screenshot.</p>
        <p v-if="signingIn" class="tc-dim">Signing in to T3 Code…</p>
      </div>

      <template v-for="m in messages" :key="m.id">
        <div v-if="m.role === 'user'" class="tc-msg user">
          <div v-if="m.notes.length" class="tc-notes-sent">
            <button v-for="(n, i) in m.notes" :key="i" type="button" class="tc-sent-note" :title="`Go to slide ${n.slide.no}`" @click="nav.go(n.slide.no, n.slide.clicks)">
              <img v-if="n.shotId" :src="`/__t3-annotate/shot/${n.shotId}.png`" alt="">
              <span><b>Slide {{ n.slide.no }}</b> {{ n.comment }}</span>
            </button>
          </div>
          <p v-if="m.text" class="tc-text">{{ m.text }}</p>
        </div>
        <!-- Rendered on the dev server with raw HTML disabled. -->
        <div v-else class="tc-msg agent tc-md" :class="{ streaming: m.streaming }" v-html="m.html" />
      </template>

      <div v-if="chat.sending" class="tc-msg user sending">
        <div v-if="chat.sending.notes.length" class="tc-notes-sent">
          <span v-for="(n, i) in chat.sending.notes" :key="i" class="tc-sent-note">
            <img v-if="n.shotId" :src="`/__t3-annotate/shot/${n.shotId}.png`" alt="">
            <span><b>Slide {{ n.slide.no }}</b> {{ n.comment }}</span>
          </span>
        </div>
        <p v-if="chat.sending.text" class="tc-text">{{ chat.sending.text }}</p>
      </div>

      <div v-if="chat.sending || thread?.busy" class="tc-working">
        <span class="tc-spin" />
        <span>{{ data?.activity?.at(-1)?.label || (chat.sending ? 'Sending…' : 'Working…') }}</span>
      </div>
      <p v-if="thread?.pending" class="tc-alert">The agent is waiting for an answer in T3 Code.</p>
    </div>

    <p v-if="error || chat.error" role="alert" class="tc-error">{{ error || chat.error }}</p>

    <form class="tc-composer" @submit.prevent="send">
      <ol v-if="draft.annotations.length" class="tc-notes">
        <li v-for="a in draft.annotations" :key="a.id" class="tc-note">
          <button type="button" class="tc-thumb" :title="`Go to slide ${a.slide.no}`" @click="nav.go(a.slide.no, a.slide.clicks)">
            <img v-if="a.shotState === 'ready'" :src="`/__t3-annotate/shot/${a.shotId}.png`" alt="">
            <span v-else-if="a.shotState === 'pending'" class="tc-spin" />
            <span v-else class="tc-dim">no image</span>
          </button>
          <div class="tc-note-body">
            <span class="tc-dim">Slide {{ a.slide.no }}<template v-if="a.slide.clicksTotal"> · click {{ a.slide.clicks }}/{{ a.slide.clicksTotal }}</template></span>
            <textarea v-model="a.comment" rows="1" placeholder="Describe the change…" />
          </div>
          <button type="button" class="tc-icon" aria-label="Remove note" @click="removeNote(a.id)">✕</button>
        </li>
      </ol>
      <div class="tc-inputrow">
        <button
          type="button" class="tc-icon tc-annotate" :class="{ on: ui.active }"
          :title="ui.active ? 'Stop annotating' : 'Annotate the slide'" aria-label="Annotate the slide" @click="ui.active = !ui.active"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2.5l9.5 4-4 1.5-1.5 4z" /><path d="M9 9l4 4" /></svg>
        </button>
        <textarea
          ref="input" v-model="draft.message" rows="1" class="tc-input"
          :placeholder="draft.threadId ? 'Reply…' : `Ask about the deck (you are on slide ${nav.currentSlideNo.value})`"
          @keydown="onInputKey"
        />
        <button type="submit" class="tc-send" :disabled="!canSend" :title="shotsPending ? 'Waiting for screenshots' : 'Send (Enter)'" aria-label="Send">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" /></svg>
        </button>
      </div>
      <div class="tc-foot">
        <template v-if="!draft.threadId && models.length">
          <select :value="selectedModel ? modelKey(selectedModel) : ''" aria-label="Model" @change="pickModel($event.target.value)">
            <optgroup v-for="p in providers" :key="p" :label="p">
              <option v-for="m in models.filter(x => x.provider === p)" :key="modelKey(m)" :value="modelKey(m)">{{ m.label }}</option>
            </optgroup>
          </select>
          <select v-if="selectedModel?.effort" v-model="modelChoice.effort" aria-label="Effort">
            <option v-for="c in selectedModel.effort.choices" :key="c.id" :value="c.id">{{ c.label }}</option>
          </select>
        </template>
        <span v-else-if="thread" class="tc-dim">{{ threadModel?.label || thread.model }}</span>
        <button v-if="signedIn" type="button" class="tc-link tc-signout" title="Revoke this slide server's T3 session now. Opening the chat signs in again." @click="signOut">Sign out</button>
      </div>
    </form>
  </aside>
</template>

<style scoped>
.tc-panel { position: fixed; top: 12px; right: 12px; bottom: 12px; width: 400px; z-index: 2147483001; display: flex; flex-direction: column; box-sizing: border-box; border-radius: 14px; overflow: hidden; background: #1e293bf7; color: #e2e8f0; box-shadow: 0 16px 40px rgb(0 0 0 / 0.4); font: 13px/1.45 system-ui, -apple-system, sans-serif; }
.tc-head { display: flex; align-items: center; gap: 8px; padding: 10px 10px 10px 12px; border-bottom: 1px solid #334155; }
.tc-picker { flex: 1; min-width: 0; padding: 5px 6px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: #f8fafc; font: 600 14px system-ui, sans-serif; outline: none; }
.tc-picker:hover, .tc-picker:focus { border-color: #334155; background: #0f172a; }
.tc-picker option, .tc-picker optgroup { background: #0f172a; font-weight: 400; }
.tc-status { padding: 1px 8px; border-radius: 999px; font-size: 11px; background: #334155; color: #cbd5e1; white-space: nowrap; }
.tc-status.busy { background: #134e4a; color: #5eead4; }
.tc-status.wait { background: #78350f; color: #fde68a; }
.tc-icon { all: unset; cursor: pointer; display: grid; place-items: center; padding: 4px 7px; border-radius: 6px; color: #94a3b8; }
.tc-icon:hover { background: #334155; color: white; }

.tc-log { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.tc-empty { color: #cbd5e1; }
.tc-empty p { margin: 0 0 10px; }
.tc-dim { color: #94a3b8; font-size: 11px; }
.tc-link { all: unset; cursor: pointer; color: #5eead4; text-decoration: underline; }
.tc-msg { max-width: 92%; border-radius: 12px; padding: 8px 11px; overflow-wrap: anywhere; }
.tc-msg.user { align-self: flex-end; background: #0f766e; color: #f0fdfa; border-bottom-right-radius: 4px; }
.tc-msg.user.sending { opacity: 0.7; }
.tc-msg.agent { align-self: flex-start; background: #0f172a; border-bottom-left-radius: 4px; }
.tc-text { margin: 0; white-space: pre-wrap; }
.tc-notes-sent { display: grid; gap: 6px; margin-bottom: 6px; }
.tc-notes-sent:last-child { margin-bottom: 0; }
.tc-sent-note { all: unset; cursor: pointer; display: grid; grid-template-columns: 72px 1fr; gap: 8px; align-items: center; font-size: 12px; }
.tc-sent-note img { width: 72px; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 4px; background: #134e4a; }
.tc-working { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 12px; }
.tc-alert { margin: 0; padding: 6px 10px; border-radius: 8px; background: #78350f; color: #fde68a; }
.tc-error { margin: 0 12px 8px; padding: 8px 10px; border-radius: 8px; background: #450a0a; color: #fecaca; }

.tc-md :deep(p) { margin: 0 0 8px; }
.tc-md :deep(> :last-child) { margin-bottom: 0; }
.tc-md :deep(ul), .tc-md :deep(ol) { margin: 0 0 8px; padding-left: 20px; }
.tc-md :deep(code) { padding: 1px 4px; border-radius: 4px; background: #1e293b; font: 12px ui-monospace, monospace; }
.tc-md :deep(pre) { margin: 0 0 8px; padding: 8px; border-radius: 6px; background: #020617; overflow-x: auto; }
.tc-md :deep(pre code) { padding: 0; background: none; }
.tc-md :deep(a) { color: #5eead4; }
.tc-md :deep(h1), .tc-md :deep(h2), .tc-md :deep(h3) { margin: 4px 0 6px; font-size: 14px; }
.tc-md.streaming::after { content: '▍'; color: #5eead4; animation: tc-blink 1s steps(2) infinite; }
@keyframes tc-blink { 50% { opacity: 0; } }

.tc-composer { display: grid; gap: 8px; padding: 10px 12px 10px; border-top: 1px solid #334155; }
.tc-notes { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; max-height: 210px; overflow-y: auto; }
.tc-note { display: grid; grid-template-columns: 88px 1fr auto; gap: 8px; align-items: start; padding: 5px; border-radius: 10px; background: #0f172a; }
.tc-thumb { all: unset; cursor: pointer; width: 88px; aspect-ratio: 16 / 9; border-radius: 5px; overflow: hidden; background: #334155; display: grid; place-items: center; }
.tc-thumb img { width: 100%; height: 100%; object-fit: cover; }
.tc-note-body { display: grid; gap: 2px; min-width: 0; }
.tc-note-body textarea { width: 100%; box-sizing: border-box; resize: vertical; border: 1px solid transparent; border-radius: 6px; padding: 2px 4px; background: transparent; color: #f1f5f9; font: inherit; outline: none; }
.tc-note-body textarea:focus { border-color: #2dd4bf; }
.tc-inputrow { display: flex; align-items: flex-end; gap: 6px; padding: 4px; border: 1px solid #334155; border-radius: 12px; background: #0f172a; }
.tc-inputrow:focus-within { border-color: #2dd4bf; }
.tc-input { flex: 1; min-height: 22px; max-height: 160px; padding: 5px 2px; border: 0; resize: none; background: transparent; color: #f1f5f9; font: 14px/1.4 system-ui, sans-serif; outline: none; }
.tc-annotate svg, .tc-send svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linejoin: round; stroke-linecap: round; }
.tc-annotate.on { color: #2dd4bf; }
.tc-send { all: unset; cursor: pointer; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; background: #2dd4bf; color: #0f172a; }
.tc-send:disabled { opacity: 0.35; cursor: default; }
.tc-foot { display: flex; align-items: center; gap: 6px; min-height: 22px; }
.tc-foot select { min-width: 0; padding: 2px 4px; border: 1px solid #334155; border-radius: 6px; background: #0f172a; color: #cbd5e1; font: 12px system-ui, sans-serif; outline: none; }
.tc-foot select:first-child { flex: 1; }
.tc-signout { margin-left: auto; font-size: 11px; color: #94a3b8; }

.tc-spin { flex: none; width: 12px; height: 12px; border: 2px solid #475569; border-top-color: #2dd4bf; border-radius: 50%; animation: tc-spin 0.8s linear infinite; }
@keyframes tc-spin { to { transform: rotate(360deg); } }
</style>
