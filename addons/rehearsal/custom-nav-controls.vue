<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { configs, lockShortcuts, useNav } from '@slidev/client'
import { rehearsalReport } from './report.mjs'
import { checkpoint, createSession, enterSlide, finish, formatTime, pause, resume, slideTotals, toCsv } from './timing.mjs'

const nav = useNav()
const deckId = configs.exportFilename || configs.title || 'presentation'
const storageKey = `slidev-rehearsal-v1:${deckId}`
const sessions = ref([])
const selectedId = ref('')
const open = ref(false)
const longestFirst = ref(false)
const target = ref(Number(configs.rehearsal?.targetMinutes) || 30)
const now = ref(Date.now())
const error = ref('')
const ownsRecording = ref(false)
let releaseLock
let acquiring = false
let unlockShortcuts
let previousFocus
const session = computed(() => sessions.value.find(item => item.id === selectedId.value))
const rows = computed(() => session.value ? slideTotals(session.value, ownsRecording.value ? now.value : session.value.visits.at(-1)?.checkpointAt || now.value) : [])
const visitedCount = computed(() => rows.value.filter(row => row.visits > 0).length)
const deckRevision = computed(() => JSON.stringify(nav.slides.value.map(route => [route.no, route.meta.slide.revision, route.meta.slide.title, route.meta.slide.frontmatter.part])))
const sortedRows = computed(() => longestFirst.value ? [...rows.value].sort((a, b) => b.elapsedMs - a.elapsedMs) : rows.value)
const total = computed(() => rows.value.reduce((sum, row) => sum + row.elapsedMs, 0))
const cutTime = computed(() => rows.value.filter(row => session.value.selectedCuts.includes(row.no)).reduce((sum, row) => sum + row.elapsedMs, 0))
const sections = computed(() => {
  const result = new Map()
  for (const row of rows.value) result.set(row.part, (result.get(row.part) || 0) + row.elapsedMs)
  return [...result].map(([part, elapsedMs]) => ({ part, elapsedMs }))
})
const active = computed(() => sessions.value.find(item => item.status !== 'finished'))
const currentTime = computed(() => active.value ? slideTotals(active.value, now.value).find(row => row.no === nav.currentSlideNo.value)?.elapsedMs || 0 : 0)
const presenter = computed(() => nav.isPresenter.value && !nav.isPrintMode.value && !nav.isEmbedded.value)

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '[]')
    if (!Array.isArray(data) || data.some(item => item.version !== 1 || !Array.isArray(item.slides) || !Array.isArray(item.visits) || !Array.isArray(item.selectedCuts))) throw new Error('Invalid rehearsal data')
    sessions.value = data
    if (!sessions.value.some(item => item.id === selectedId.value)) selectedId.value = sessions.value.at(-1)?.id || ''
  } catch { error.value = 'Could not read saved rehearsals. Export any open results before clearing browser storage.' }
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(sessions.value)) }
  catch { error.value = 'Browser storage is unavailable. Export this rehearsal before closing the page.' }
}
load()

async function claim(action) {
  if (acquiring) return
  if (ownsRecording.value) { action(); return }
  if (!navigator.locks) { error.value = 'This browser needs a secure connection to record rehearsals. Open the deck on localhost or HTTPS.'; return }
  acquiring = true
  try {
    await navigator.locks.request(storageKey, { ifAvailable: true }, async lock => {
      acquiring = false
      if (!lock) { error.value = 'Another presenter tab is recording this deck. Pause or finish there first.'; return }
      load()
      // The exclusive lock proves any saved running state has lost its owner.
      if (active.value?.status === 'running') { active.value.status = 'paused'; save() }
      ownsRecording.value = true
      error.value = ''
      // Set release before action, which may immediately release ownership.
      const held = new Promise(resolve => { releaseLock = resolve })
      try { action(); await held }
      finally { ownsRecording.value = false; releaseLock = undefined }
    })
  } catch (cause) { error.value = `Could not start recording: ${cause.message}` }
  finally { acquiring = false }
}
function release() { releaseLock?.() }
function slideList() {
  let part = 'Other'
  return nav.slides.value.map(route => {
    const slide = route.meta.slide
    part = slide.frontmatter.part || part
    return { no: route.no, title: slide.title || slide.frontmatter.title || `Slide ${route.no}`, part, source: slide.frontmatter.rehearsalSource ? { ...slide.frontmatter.rehearsalSource } : undefined }
  })
}
function start() {
  if (!Number.isFinite(target.value) || target.value <= 0) { error.value = 'Enter a target greater than zero.'; return }
  claim(() => {
    if (active.value) { error.value = 'Resume or finish the unfinished rehearsal before starting another.'; release(); return }
    const next = createSession(configs.title, slideList(), target.value)
    next.deckRevision = deckRevision.value
    sessions.value.push(next)
    selectedId.value = next.id
    resume(next, nav.currentSlideNo.value, Date.now())
    save()
    open.value = false
    nextTick(() => document.activeElement?.blur())
  })
}
function resumeRecording() {
  claim(() => {
    if (!active.value) { release(); return }
    if (!ensureDeckMatches()) { release(); return }
    selectedId.value = active.value.id
    resume(active.value, nav.currentSlideNo.value, Date.now())
    save()
  })
}
function pauseRecording() {
  if (!ownsRecording.value || !active.value) return
  pause(active.value, Date.now()); save(); release()
}
function finishRecording() {
  claim(() => {
    if (active.value) {
      selectedId.value = active.value.id
      finish(active.value, Date.now()); save()
    }
    release(); open.value = true
  })
}
function toggleCut(no) {
  if (!session.value || active.value?.status === 'running') return
  const cuts = session.value.selectedCuts
  session.value.selectedCuts = cuts.includes(no) ? cuts.filter(item => item !== no) : [...cuts, no]
  save()
}
function saveDownload(blob, extension, runId) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = `${deckId}-rehearsal-${runId}.${extension}`; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function download(kind) {
  if (!session.value) return
  const run = session.value
  if (ownsRecording.value && active.value) { checkpoint(active.value, Date.now()); save() }
  const data = kind === 'html' ? rehearsalReport(run, Date.now())
    : kind === 'csv' ? toCsv(run, Date.now()) : JSON.stringify(run, null, 2)
  const mime = kind === 'html' ? 'text/html;charset=utf-8'
    : kind === 'csv' ? 'text/csv;charset=utf-8' : 'application/json'
  saveDownload(new Blob([data], { type: mime }), kind, run.id)
}
function ensureDeckMatches() {
  if (active.value && active.value.deckRevision !== deckRevision.value) {
    pauseRecording()
    error.value = 'The deck changed since this run began. Finish this run and start a new rehearsal to keep slide timings accurate.'
    open.value = true
    return false
  }
  return true
}
watch(deckRevision, () => { if (ownsRecording.value) ensureDeckMatches() })
watch(() => nav.currentSlideNo.value, no => {
  if (ownsRecording.value && active.value && ensureDeckMatches()) { enterSlide(active.value, no, Date.now()); save() }
}, { flush: 'sync' })
watch(presenter, visible => { if (!visible) { pauseRecording(); open.value = false } })
watch(open, async visible => {
  unlockShortcuts?.(); unlockShortcuts = undefined
  if (visible) {
    previousFocus = document.activeElement
    unlockShortcuts = lockShortcuts()
    await nextTick()
    document.querySelector('.rehearsal-panel button')?.focus()
  } else previousFocus?.focus()
})
const interval = setInterval(() => {
  now.value = Date.now()
  if (ownsRecording.value && active.value) { checkpoint(active.value, now.value); save() }
}, 1000)
function onDialogKeydown(event) {
  if (event.key === 'Escape') { event.stopPropagation(); open.value = false }
  if (event.key !== 'Tab') return
  const controls = [...event.currentTarget.querySelectorAll('button, input, select')].filter(element => !element.disabled)
  const first = controls[0], last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
function onStorage(event) { if (event.key === storageKey && !ownsRecording.value) load() }
function onPageHide() { pauseRecording() }
window.addEventListener('storage', onStorage)
window.addEventListener('pagehide', onPageHide)
onBeforeUnmount(() => {
  pauseRecording(); clearInterval(interval); unlockShortcuts?.()
  window.removeEventListener('storage', onStorage); window.removeEventListener('pagehide', onPageHide)
})
</script>

<template>
  <div v-if="presenter" class="rehearsal-controls">
    <button class="rehearsal-button" @click="open = true">Rehearsal<span v-if="ownsRecording"> · {{ formatTime(currentTime) }}</span></button>
    <button v-if="ownsRecording" class="rehearsal-button" @click="pauseRecording">Pause rehearsal</button>
    <Teleport to="body">
      <div v-if="open" class="rehearsal-backdrop" @keydown="onDialogKeydown" @click.self="open = false">
        <section role="dialog" aria-modal="true" aria-label="Rehearsal timing" class="rehearsal-panel">
          <header><div><h2>Rehearsal timing</h2><p>{{ configs.title }}</p></div><button autofocus @click="open = false">Close</button></header>
          <p v-if="error" role="alert">{{ error }}</p>
          <div class="rehearsal-toolbar">
            <template v-if="!active"><label>Target minutes <input v-model.number="target" type="number" min="1" aria-label="Target minutes" /></label><button @click="start">Start rehearsal</button></template>
            <template v-else><span>{{ ownsRecording ? 'Recording' : 'Unfinished rehearsal' }}</span><button v-if="ownsRecording" @click="pauseRecording">Pause rehearsal</button><button v-else @click="resumeRecording">Resume rehearsal</button><button @click="finishRecording">Finish rehearsal</button></template>
          </div>
          <p class="rehearsal-help">Clicks count toward the current slide. Returning to a slide adds to its total. Demo tabs keep the timer running. Pause for interruptions.</p>
          <template v-if="session">
            <div class="rehearsal-toolbar"><label>Saved run <select v-model="selectedId" aria-label="Saved run"><option v-for="run in sessions" :key="run.id" :value="run.id">{{ new Date(run.startedAt).toLocaleString() }} · {{ run.status }}</option></select></label><button @click="download('csv')">Export CSV</button><button @click="download('json')">Export JSON</button><button @click="download('html')">Export HTML report</button></div>
            <p class="rehearsal-help">{{ visitedCount }} / {{ rows.length }} slides visited. {{ visitedCount < rows.length ? 'Partial rehearsal, unvisited slides have no measured time.' : 'All slides visited.' }}</p>
            <div class="rehearsal-summary"><div><small>Total</small><strong>{{ formatTime(total) }}</strong></div><div><small>Target</small><strong>{{ session.targetMinutes }} min</strong></div><div><small>{{ total > session.targetMinutes * 60000 ? 'Over target' : 'Below target' }}</small><strong>{{ formatTime(Math.abs(total - session.targetMinutes * 60000)) }}</strong></div><div><small>Selected cuts / remaining</small><strong>{{ formatTime(cutTime) }} / {{ formatTime(total - cutTime) }}</strong></div></div>
            <div class="rehearsal-sections"><span v-for="section in sections" :key="section.part">{{ section.part }} <b>{{ formatTime(section.elapsedMs) }}</b></span></div>
            <label class="rehearsal-sort"><input v-model="longestFirst" type="checkbox" /> Longest slides first</label>
            <div class="rehearsal-table-wrap"><table><thead><tr><th>Cut</th><th>Slide</th><th>Section</th><th>Time</th><th>Visits</th><th title="Sum of slide totals up to this slide in deck order">Cumulative*</th></tr></thead><tbody><tr v-for="row in sortedRows" :key="row.no"><td><input type="checkbox" :aria-label="`Mark slide ${row.no} as a potential cut`" :checked="session.selectedCuts.includes(row.no)" :disabled="active?.status === 'running'" @change="toggleCut(row.no)" /></td><td>{{ row.no }}. {{ row.title }}</td><td>{{ row.part }}</td><td>{{ row.visits ? formatTime(row.elapsedMs) : 'Unvisited' }}</td><td>{{ row.visits }}</td><td>{{ formatTime(row.cumulativeMs) }}</td></tr></tbody></table></div>
            <p class="rehearsal-help">*Cumulative totals follow deck order and include revisits. Selected cuts estimate time saved using this run.</p>
          </template>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.rehearsal-controls { display: flex; align-items: center; gap: 6px; font-size: 14px; }
.rehearsal-button { padding: 4px 8px; border-radius: 5px; background: rgba(128,128,128,.12); white-space: nowrap; }
.rehearsal-backdrop { position: fixed; inset: 0; z-index: 10000; background: #101827a8; display: grid; place-items: center; padding: 24px; color: #172033; font: 15px/1.4 Inter, sans-serif; }
.rehearsal-panel { width: min(1080px, 100%); max-height: calc(100dvh - 48px); overflow: auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 20px 80px #0005; }
header { display: flex; justify-content: space-between; align-items: start; gap: 20px; }
h2 { font-size: 24px; font-weight: 700; margin: 0; }
p { margin: 6px 0 14px; }
button { cursor: pointer; }
.rehearsal-panel button { border: 1px solid #c8d0de; border-radius: 6px; padding: 7px 12px; background: #f3f6fb; }
.rehearsal-panel button:hover { background: #e4ebf6; }
.rehearsal-panel input[type=number] { width: 75px; }
.rehearsal-panel input[type=number], select { border: 1px solid #c8d0de; border-radius: 5px; padding: 6px; background: white; }
.rehearsal-toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin: 14px 0; }
.rehearsal-toolbar label { display: flex; align-items: center; gap: 8px; }
.rehearsal-help { font-size: 14px; color: #526078; }
.rehearsal-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
.rehearsal-summary div { background: #edf2fa; border-radius: 8px; padding: 12px; }
small { display: block; font-size: 14px; }
strong { display: block; font-size: 23px; }
.rehearsal-sections { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.rehearsal-sections span { background: #f3f5f8; padding: 5px 9px; border-radius: 5px; }
.rehearsal-sort { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.rehearsal-table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { text-align: left; padding: 9px 8px; border-bottom: 1px solid #e1e6ee; }
th { background: #edf2fa; }
td:nth-child(2) { min-width: 280px; }
td:nth-child(n+4) { white-space: nowrap; font-variant-numeric: tabular-nums; }
input[type=checkbox] { accent-color: #315fb0; }
[role=alert] { color: #b42318; }
@media (max-width: 700px) { .rehearsal-summary { grid-template-columns: repeat(2, 1fr); } .rehearsal-panel { padding: 16px; } }
</style>
