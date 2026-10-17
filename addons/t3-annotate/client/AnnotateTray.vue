<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useNav } from '@slidev/client'
import { api, draft, modelChoice, ui } from './store.mjs'

const nav = useNav()
const signedIn = ref(false)
const loading = ref(true)
const models = ref([])
const threads = ref([])
const error = ref('')
const sending = ref(false)
const lastSent = ref(null)
const preview = ref('')
const messageBox = ref(null)

const selectedModel = computed(() => models.value.find(m => m.instanceId === modelChoice.value.instanceId && m.model === modelChoice.value.model))
const providers = computed(() => [...new Set(models.value.map(m => m.provider))])
const target = computed(() => threads.value.find(t => t.id === draft.value.threadId))
const shotsPending = computed(() => draft.value.annotations.some(a => a.shotState === 'pending'))
const canSend = computed(() => !loading.value && !sending.value && !shotsPending.value
  && (draft.value.message.trim() || draft.value.annotations.length))
const modelKey = m => `${m.instanceId}|${m.model}`

function fail(e) {
  error.value = e.message
}

// The first call signs the slide server in to T3; the session ends when that server stops.
async function refresh() {
  try {
    const [catalog, list] = await Promise.all([models.value.length ? null : api('catalog'), api('threads')])
    if (catalog) models.value = catalog.models
    threads.value = list.threads
    if (!selectedModel.value && models.value.length) {
      const m = models.value.find(x => x.instanceId === 'claudeAgent') || models.value[0]
      modelChoice.value = { instanceId: m.instanceId, model: m.model, effort: m.effort?.default || '' }
    }
    // A thread that was archived or deleted falls back to a new one.
    if (draft.value.threadId && !target.value && !sending.value) draft.value.threadId = ''
    signedIn.value = true
    error.value = ''
  }
  catch (e) { fail(e) }
  finally { loading.value = false }
}

async function signOut() {
  await api('sign-out', {}).catch(fail)
  signedIn.value = false
  models.value = []
  threads.value = []
  ui.trayOpen = false
}

function pickModel(key) {
  const m = models.value.find(x => modelKey(x) === key)
  if (m) modelChoice.value = { instanceId: m.instanceId, model: m.model, effort: m.effort?.default || '' }
}

const current = () => ({ no: nav.currentSlideNo.value, clicks: nav.clicks.value, clicksTotal: nav.clicksTotal.value })
function payload() {
  const m = selectedModel.value
  return {
    message: draft.value.message,
    annotations: draft.value.annotations,
    threadId: draft.value.threadId || null,
    current: current(),
    model: m && {
      instanceId: m.instanceId,
      model: m.model,
      ...(m.effort && modelChoice.value.effort ? { options: [{ id: m.effort.id, value: modelChoice.value.effort }] } : {}),
    },
  }
}

async function togglePreview() {
  if (preview.value) { preview.value = ''; return }
  try { preview.value = (await api('preview', payload())).prompt }
  catch (e) { fail(e) }
}

async function send() {
  if (!canSend.value) return
  sending.value = true
  error.value = ''
  try {
    const result = await api('send', payload())
    lastSent.value = { title: result.title || target.value?.title || 'thread', at: new Date() }
    draft.value = { message: '', annotations: [], threadId: result.threadId }
    preview.value = ''
    await refresh()
  }
  catch (e) { fail(e) }
  finally { sending.value = false }
}

function remove(id) {
  draft.value.annotations = draft.value.annotations.filter(a => a.id !== id)
}

function onKey(e) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send() }
  if (e.key === 'Escape') ui.trayOpen = false
}

let poll
onMounted(() => {
  refresh()
  poll = setInterval(() => signedIn.value && refresh(), 5000)
  messageBox.value?.focus()
})
onBeforeUnmount(() => clearInterval(poll))
watch(() => draft.value.annotations.length, () => { preview.value = '' })

const statusLabel = s => ({ running: 'working', starting: 'starting', preparing: 'preparing', queued: 'queued', waiting: 'needs you', idle: 'idle', completed: 'done', failed: 'failed', interrupted: 'stopped', cancelled: 'cancelled' }[s] || s)
const busy = s => ['running', 'starting', 'preparing', 'queued'].includes(s)
</script>

<template>
  <aside data-t3-annotate-ui class="tt-tray" aria-label="Send changes to an agent" @keydown.stop="onKey">
    <header class="tt-head">
      <strong>Agent request</strong>
      <span v-if="target" class="tt-status" :class="{ busy: busy(target.status), wait: target.status === 'waiting' }">{{ statusLabel(target.status) }}</span>
      <button type="button" class="tt-x" aria-label="Close" @click="ui.trayOpen = false">✕</button>
    </header>

    <p v-if="loading" class="tt-empty">Signing in to T3 Code…</p>

    <ol v-if="draft.annotations.length" class="tt-notes">
      <li v-for="(a, i) in draft.annotations" :key="a.id" class="tt-note">
        <button type="button" class="tt-thumb" :title="`Go to slide ${a.slide.no}`" @click="nav.go(a.slide.no, a.slide.clicks)">
          <img v-if="a.shotState === 'ready'" :src="`/__t3-annotate/shot/${a.shotId}.png`" alt="">
          <span v-else-if="a.shotState === 'pending'" class="tt-spin" />
          <span v-else class="tt-noshot">no image</span>
          <span class="tt-num">{{ i + 1 }}</span>
        </button>
        <div class="tt-note-body">
          <span class="tt-meta">Slide {{ a.slide.no }}<template v-if="a.slide.clicksTotal"> · click {{ a.slide.clicks }}/{{ a.slide.clicksTotal }}</template></span>
          <textarea v-model="a.comment" rows="2" placeholder="Describe the change…" />
        </div>
        <button type="button" class="tt-remove" aria-label="Remove note" @click="remove(a.id)">✕</button>
      </li>
    </ol>
    <p v-else class="tt-empty">
      Write a prompt below, or use <button type="button" class="tt-link" @click="ui.active = true">Annotate</button> to point at things on the slides.
    </p>

    <textarea
      ref="messageBox" v-model="draft.message" class="tt-message" rows="4"
      :placeholder="draft.annotations.length ? 'Anything else for the agent?' : `Prompt about the deck. The agent is told you are on slide ${nav.currentSlideNo.value}.`"
    />

    <label class="tt-field">
      <span>Send to</span>
      <select v-model="draft.threadId">
        <option value="">New thread</option>
        <option v-for="t in threads" :key="t.id" :value="t.id">{{ t.title }} · {{ statusLabel(t.status) }}</option>
      </select>
    </label>
    <div v-if="!draft.threadId" class="tt-row">
      <label class="tt-field grow">
        <span>Model</span>
        <select :value="selectedModel ? modelKey(selectedModel) : ''" @change="pickModel($event.target.value)">
          <optgroup v-for="p in providers" :key="p" :label="p">
            <option v-for="m in models.filter(x => x.provider === p)" :key="modelKey(m)" :value="modelKey(m)">{{ m.label }}</option>
          </optgroup>
        </select>
      </label>
      <label v-if="selectedModel?.effort" class="tt-field">
        <span>Effort</span>
        <select v-model="modelChoice.effort">
          <option v-for="c in selectedModel.effort.choices" :key="c.id" :value="c.id">{{ c.label }}</option>
        </select>
      </label>
    </div>

    <p v-if="error" role="alert" class="tt-error">{{ error }}</p>
    <p v-else-if="lastSent" class="tt-sent">Sent to “{{ lastSent.title }}”. Follow-ups go to the same thread.</p>

    <div class="tt-actions">
      <button v-if="signedIn" type="button" class="tt-ghost tt-signout" title="Revoke this slide server's T3 session now. Opening the tray signs in again." @click="signOut">Sign out</button>
      <button type="button" class="tt-ghost" @click="togglePreview">{{ preview ? 'Hide prompt' : 'Preview prompt' }}</button>
      <button type="button" class="tt-primary" :disabled="!canSend" :title="shotsPending ? 'Waiting for screenshots' : '⌘↵'" @click="send">
        {{ sending ? 'Sending…' : draft.threadId ? 'Send follow-up' : 'Start thread' }}
      </button>
    </div>
    <pre v-if="preview" class="tt-preview">{{ preview }}</pre>
  </aside>
</template>

<style scoped>
.tt-tray { position: fixed; top: 12px; right: 12px; bottom: 12px; width: 380px; z-index: 2147483001; display: flex; flex-direction: column; gap: 10px; padding: 14px; box-sizing: border-box; overflow-y: auto; border-radius: 14px; background: #1e293bf7; color: #e2e8f0; box-shadow: 0 16px 40px rgb(0 0 0 / 0.4); font: 13px/1.4 system-ui, -apple-system, sans-serif; }
/* Keep every block its natural height and let the tray scroll; a long preview otherwise squashes the message box. */
.tt-tray > * { flex-shrink: 0; }
.tt-head { display: flex; align-items: center; gap: 8px; font-size: 15px; }
.tt-x { all: unset; cursor: pointer; margin-left: auto; padding: 2px 6px; border-radius: 6px; color: #94a3b8; }
.tt-x:hover { background: #334155; color: white; }
.tt-status { padding: 1px 8px; border-radius: 999px; font-size: 11px; background: #334155; color: #cbd5e1; }
.tt-status.busy { background: #134e4a; color: #5eead4; }
.tt-status.wait { background: #78350f; color: #fde68a; }
.tt-signout { margin-right: auto; color: #94a3b8; font-weight: 500; }
.tt-notes { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.tt-note { display: grid; grid-template-columns: 112px 1fr auto; gap: 8px; align-items: start; padding: 6px; border-radius: 10px; background: #0f172a; }
.tt-thumb { all: unset; cursor: pointer; position: relative; width: 112px; aspect-ratio: 16 / 9; border-radius: 6px; overflow: hidden; background: #334155; display: grid; place-items: center; }
.tt-thumb img { width: 100%; height: 100%; object-fit: cover; }
.tt-num { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center; background: #f59e0b; color: #1c1917; font-size: 11px; font-weight: 700; }
.tt-noshot { font-size: 11px; color: #94a3b8; }
.tt-spin { width: 16px; height: 16px; border: 2px solid #64748b; border-top-color: #2dd4bf; border-radius: 50%; animation: tt-spin 0.8s linear infinite; }
@keyframes tt-spin { to { transform: rotate(360deg); } }
.tt-note-body { display: grid; gap: 3px; min-width: 0; }
.tt-meta { font-size: 11px; color: #94a3b8; }
.tt-note-body textarea, .tt-message, .tt-field select { width: 100%; box-sizing: border-box; border: 1px solid #334155; border-radius: 8px; padding: 6px 8px; background: #0f172a; color: #f1f5f9; font: inherit; outline: none; }
.tt-note-body textarea { resize: vertical; border-color: transparent; padding: 2px 4px; }
.tt-note-body textarea:focus, .tt-message:focus, .tt-field select:focus { border-color: #2dd4bf; }
.tt-message { resize: vertical; font-size: 14px; }
.tt-remove { all: unset; cursor: pointer; padding: 0 4px; color: #64748b; }
.tt-remove:hover { color: #f87171; }
.tt-empty { margin: 0; color: #94a3b8; }
.tt-link { all: unset; cursor: pointer; color: #5eead4; text-decoration: underline; }
.tt-row { display: flex; gap: 8px; }
.tt-field { display: grid; gap: 3px; font-size: 11px; color: #94a3b8; }
.tt-field.grow { flex: 1; }
.tt-error { margin: 0; padding: 8px 10px; border-radius: 8px; background: #450a0a; color: #fecaca; }
.tt-sent { margin: 0; color: #5eead4; }
.tt-actions { display: flex; justify-content: flex-end; gap: 8px; }
.tt-primary, .tt-ghost { all: unset; cursor: pointer; padding: 7px 14px; border-radius: 8px; font-weight: 600; }
.tt-primary { background: #2dd4bf; color: #0f172a; text-align: center; }
.tt-primary:disabled { opacity: 0.45; cursor: default; }
.tt-ghost { color: #cbd5e1; }
.tt-ghost:hover { background: #334155; }
.tt-preview { margin: 0; padding: 10px; border-radius: 8px; background: #020617; color: #cbd5e1; font: 11px/1.45 ui-monospace, monospace; white-space: pre-wrap; word-break: break-word; }
</style>
