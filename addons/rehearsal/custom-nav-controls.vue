<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { configs, lockShortcuts, useNav } from '@slidev/client'
import { sectionColors } from './colors.mjs'
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

// A run this tab does not own only advances to its last checkpoint.
const totalsAt = run => slideTotals(run, ownsRecording.value && run === active.value ? now.value : run.visits.at(-1)?.checkpointAt || now.value)
const sumMs = list => list.reduce((sum, row) => sum + row.elapsedMs, 0)
const session = computed(() => sessions.value.find(item => item.id === selectedId.value))
const rows = computed(() => session.value ? totalsAt(session.value) : [])
const visitedCount = computed(() => rows.value.filter(row => row.visits > 0).length)
const deckRevision = computed(() => JSON.stringify(nav.slides.value.map(route => [route.no, route.meta.slide.revision, route.meta.slide.title, route.meta.slide.frontmatter.part])))
const sortedRows = computed(() => longestFirst.value ? [...rows.value].sort((a, b) => b.elapsedMs - a.elapsedMs || a.no - b.no) : rows.value)
const total = computed(() => sumMs(rows.value))
const targetMs = computed(() => (session.value?.targetMinutes || target.value) * 60000)
const cutTime = computed(() => sumMs(rows.value.filter(row => session.value.selectedCuts.includes(row.no))))
const maxSlide = computed(() => Math.max(1, ...rows.value.map(row => row.elapsedMs)))
const colors = computed(() => sectionColors(rows.value.map(row => row.part)))
const sections = computed(() => {
  const result = []
  for (const row of rows.value) {
    const last = result.at(-1)
    if (last?.part === row.part) last.elapsedMs += row.elapsedMs
    else result.push({ part: row.part, elapsedMs: row.elapsedMs, startMs: row.cumulativeMs - row.elapsedMs })
  }
  return result
})
// Unfinished runs hide sections not reached yet. Finished runs keep them to show what was skipped.
const visibleSections = computed(() => session.value?.status === 'finished' ? sections.value : sections.value.filter(section => section.elapsedMs > 0))
const scaleMs = computed(() => Math.max(total.value, targetMs.value, 1))
const active = computed(() => sessions.value.find(item => item.status !== 'finished'))
const liveRows = computed(() => active.value ? totalsAt(active.value) : [])
const liveTotal = computed(() => sumMs(liveRows.value))
const liveTargetMs = computed(() => (active.value?.targetMinutes || target.value) * 60000)
const currentTime = computed(() => liveRows.value.find(row => row.no === nav.currentSlideNo.value)?.elapsedMs || 0)
const slideCount = computed(() => nav.slides.value.length)
// Where an even split of the target would put you on arriving at this slide.
const evenPaceMs = computed(() => liveTargetMs.value * (nav.currentSlideNo.value - 1) / Math.max(1, slideCount.value))
const paceMs = computed(() => liveTotal.value - currentTime.value - evenPaceMs.value)
const phase = computed(() => ownsRecording.value ? 'recording' : active.value ? 'paused' : 'idle')
const presenter = computed(() => nav.isPresenter.value && !nav.isPrintMode.value && !nav.isEmbedded.value)
const pct = (ms, scale) => `${Math.min(100, Math.max(0, ms / scale * 100))}%`
const colorVars = part => ({ '--c': colors.value[part]?.[0] || '#8a8f98', '--fg': colors.value[part]?.[1] || '#fff' })
const signedDelta = (ms, targetValue) => `${formatTime(Math.abs(ms - targetValue))} ${ms > targetValue ? 'over' : 'under'}`
function runLabel(run) {
  const when = new Date(run.startedAt).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const state = run.status === 'finished' ? '' : run === active.value && ownsRecording.value ? ' · recording' : ' · unfinished'
  return `${when} · ${formatTime(run.visits.reduce((sum, visit) => sum + visit.elapsedMs, 0))}${state}`
}

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
function stepTarget(delta) { target.value = Math.max(1, (Number(target.value) || 0) + delta) }
function toggleCut(no) {
  if (!session.value || cutsLocked.value) return
  const cuts = session.value.selectedCuts
  session.value.selectedCuts = cuts.includes(no) ? cuts.filter(item => item !== no) : [...cuts, no]
  save()
}
const cutsLocked = computed(() => session.value === active.value && active.value?.status === 'running')
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
    document.querySelector('.rh-panel .rh-close')?.focus()
  } else previousFocus?.focus()
})
const interval = setInterval(() => {
  now.value = Date.now()
  if (ownsRecording.value && active.value) { checkpoint(active.value, now.value); save() }
}, 1000)
// Escape is handled on the window so it still works after the focused button is replaced.
function onWindowKeydown(event) {
  if (open.value && event.key === 'Escape') { event.stopPropagation(); open.value = false }
}
function onDialogKeydown(event) {
  if (event.key !== 'Tab') return
  const controls = [...event.currentTarget.querySelectorAll('button, input, select, summary')].filter(element => !element.disabled)
  const first = controls[0], last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
function onStorage(event) { if (event.key === storageKey && !ownsRecording.value) load() }
function onPageHide() { pauseRecording() }
window.addEventListener('storage', onStorage)
window.addEventListener('pagehide', onPageHide)
window.addEventListener('keydown', onWindowKeydown, true)
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onWindowKeydown, true)
  pauseRecording(); clearInterval(interval); unlockShortcuts?.()
  window.removeEventListener('storage', onStorage); window.removeEventListener('pagehide', onPageHide)
})
</script>

<template>
  <div v-if="presenter" class="rh-controls">
    <button
      class="rh-chip" :class="`is-${phase}`" type="button"
      :title="phase === 'idle' ? 'Rehearsal timing' : `Total ${formatTime(liveTotal)} of ${formatTime(liveTargetMs)}. This slide ${formatTime(currentTime)}.`"
      @click="open = true"
    >
      <svg v-if="phase === 'idle'" class="rh-glyph" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="9" r="5.5" /><path d="M8 6v3l2 1.5M6.5 1.5h3" /></svg>
      <span v-else class="rh-dot" aria-hidden="true" />
      <span v-if="phase === 'idle'">Rehearse</span>
      <template v-else>
        <span class="rh-chip-total" :class="{ over: liveTotal > liveTargetMs }">{{ formatTime(liveTotal) }}</span>
        <span class="rh-chip-slide">{{ phase === 'paused' ? 'paused' : `/ ${formatTime(liveTargetMs)}` }}</span>
      </template>
    </button>
    <button v-if="phase === 'recording'" class="rh-icon" type="button" aria-label="Pause rehearsal" title="Pause rehearsal" @click="pauseRecording">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" /></svg>
    </button>
    <button v-else-if="phase === 'paused'" class="rh-icon" type="button" aria-label="Resume rehearsal" title="Resume rehearsal" @click="resumeRecording">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6L12.5 8z" class="fill" /></svg>
    </button>

    <Teleport to="body">
      <div v-if="open" class="rh-backdrop" @keydown="onDialogKeydown" @click.self="open = false">
        <section role="dialog" aria-modal="true" aria-labelledby="rh-title" class="rh-panel">
          <header class="rh-head">
            <div>
              <p class="rh-eyebrow">Rehearsal timing</p>
              <h2 id="rh-title">{{ configs.title }}</h2>
            </div>
            <button class="rh-close" type="button" aria-label="Close" @click="open = false">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
            </button>
          </header>

          <div class="rh-body">
            <p v-if="error" role="alert" class="rh-alert">{{ error }}</p>

            <!-- Start a run -->
            <section v-if="phase === 'idle'" class="rh-card rh-start">
              <div class="rh-start-row">
                <div class="rh-field">
                  <span class="rh-label" id="rh-target-label">Target</span>
                  <div class="rh-stepper" role="group" aria-labelledby="rh-target-label">
                    <button type="button" aria-label="5 minutes less" @click="stepTarget(-5)">−</button>
                    <input v-model.number="target" type="number" min="1" inputmode="numeric" aria-label="Target minutes" />
                    <span class="rh-unit">min</span>
                    <button type="button" aria-label="5 minutes more" @click="stepTarget(5)">+</button>
                  </div>
                </div>
                <button class="rh-btn rh-primary rh-big" type="button" @click="start">
                  <span class="rh-dot static" aria-hidden="true" />Start rehearsal
                </button>
              </div>
              <p class="rh-hint">Timing starts on slide {{ nav.currentSlideNo.value }}. Move through the deck as you would on stage.</p>
            </section>

            <!-- Live run -->
            <section v-else class="rh-card rh-live" :class="`is-${phase}`">
              <div class="rh-live-top">
                <span class="rh-badge"><span class="rh-dot" aria-hidden="true" />{{ phase === 'recording' ? 'Recording' : 'Paused' }}</span>
                <span class="rh-muted">Slide {{ nav.currentSlideNo.value }} of {{ slideCount }} · this slide {{ formatTime(currentTime) }}</span>
              </div>
              <div class="rh-figure">
                <strong>{{ formatTime(liveTotal) }}</strong>
                <span class="rh-of">of {{ formatTime(liveTargetMs) }}</span>
                <span class="rh-delta" :class="liveTotal > liveTargetMs ? 'over' : 'under'">{{ signedDelta(liveTotal, liveTargetMs) }}</span>
              </div>
              <div class="rh-gauge" aria-hidden="true">
                <div class="rh-gauge-fill" :class="{ over: liveTotal > liveTargetMs }" :style="{ width: pct(liveTotal, Math.max(liveTotal, liveTargetMs)) }" />
                <div class="rh-gauge-pace" :style="{ left: pct(evenPaceMs, Math.max(liveTotal, liveTargetMs)) }" />
                <div v-if="liveTotal > liveTargetMs" class="rh-gauge-target" :style="{ left: pct(liveTargetMs, liveTotal) }" />
              </div>
              <p class="rh-pace">
                <template v-if="nav.currentSlideNo.value === 1">Even pace splits {{ formatTime(liveTargetMs) }} across {{ slideCount }} slides.</template>
                <template v-else>
                  <b :class="paceMs > 30000 ? 'over' : paceMs < -30000 ? 'under' : ''">{{ Math.abs(paceMs) < 30000 ? 'On pace' : `${formatTime(Math.abs(paceMs))} ${paceMs > 0 ? 'behind' : 'ahead of'} even pace` }}</b>
                  on reaching this slide. Even pace: {{ formatTime(evenPaceMs) }}.
                </template>
              </p>
              <div class="rh-actions">
                <button v-if="phase === 'recording'" class="rh-btn rh-primary" type="button" @click="pauseRecording">Pause</button>
                <button v-else class="rh-btn rh-primary" type="button" @click="resumeRecording">Resume</button>
                <button class="rh-btn" type="button" @click="finishRecording">Finish rehearsal</button>
              </div>
            </section>

            <!-- Results for a saved run -->
            <section v-if="session" class="rh-results">
              <div class="rh-results-head">
                <label class="rh-run">
                  <span class="rh-label">Run</span>
                  <select v-model="selectedId" aria-label="Saved run">
                    <option v-for="run in [...sessions].reverse()" :key="run.id" :value="run.id">{{ runLabel(run) }}</option>
                  </select>
                </label>
                <div class="rh-export" role="group" aria-label="Export">
                  <button class="rh-btn rh-accent" type="button" @click="download('html')">
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" /></svg>Report
                  </button>
                  <button class="rh-btn rh-quiet" type="button" @click="download('csv')">CSV</button>
                  <button class="rh-btn rh-quiet" type="button" @click="download('json')">JSON</button>
                </div>
              </div>

              <dl v-if="session !== active" class="rh-stats">
                <div><dt>Total</dt><dd>{{ formatTime(total) }}</dd><small :class="total > targetMs ? 'over' : 'under'">{{ signedDelta(total, targetMs) }}</small></div>
                <div><dt>Slides visited</dt><dd>{{ visitedCount }} / {{ rows.length }}</dd><small>{{ visitedCount < rows.length ? 'Partial run' : 'All slides' }}</small></div>
                <div><dt>Selected cuts</dt><dd>{{ formatTime(cutTime) }}</dd><small>{{ session.selectedCuts.length ? `${formatTime(total - cutTime)} left · ${signedDelta(total - cutTime, targetMs)}` : 'Tick slides below' }}</small></div>
              </dl>

              <div class="rh-timeline" role="img" :aria-label="`Time per slide. ${sections.map(s => `${s.part} ${formatTime(s.elapsedMs)}`).join(', ')}`">
                <div class="rh-track">
                  <div
                    v-for="row in rows.filter(r => r.visits)" :key="row.no"
                    class="rh-seg" :class="{ cut: session.selectedCuts.includes(row.no) }"
                    :style="{ left: pct(row.cumulativeMs - row.elapsedMs, scaleMs), width: pct(row.elapsedMs, scaleMs), ...colorVars(row.part) }"
                    :title="`${row.no}. ${row.title} · ${formatTime(row.elapsedMs)}`"
                  />
                  <div v-if="total > targetMs" class="rh-overrun" :style="{ left: pct(targetMs, scaleMs), width: pct(total - targetMs, scaleMs) }" />
                  <div class="rh-target" :style="{ left: pct(targetMs, scaleMs) }" />
                </div>
                <div class="rh-axis"><span>0</span><span :style="{ left: pct(targetMs, scaleMs) }">{{ formatTime(targetMs) }}</span></div>
              </div>
              <ul class="rh-sections">
                <li v-for="section in visibleSections" :key="section.part + section.startMs" :style="colorVars(section.part)">
                  <span class="rh-swatch" />{{ section.part }}<b>{{ formatTime(section.elapsedMs) }}</b>
                </li>
              </ul>

              <div class="rh-table-head">
                <h3>Slides</h3>
                <div class="rh-segmented" role="group" aria-label="Sort slides">
                  <button type="button" :aria-pressed="!longestFirst" @click="longestFirst = false">Deck order</button>
                  <button type="button" :aria-pressed="longestFirst" @click="longestFirst = true">Longest</button>
                </div>
              </div>
              <p v-if="cutsLocked" class="rh-hint">Pause to mark potential cuts.</p>
              <p v-else-if="session === active && session.selectedCuts.length" class="rh-hint">Selected cuts save {{ formatTime(cutTime) }}.</p>
              <ol class="rh-list">
                <li v-for="row in sortedRows" :key="row.no" :class="{ cut: session.selectedCuts.includes(row.no), skipped: !row.visits }">
                  <label class="rh-cut" :title="`Mark slide ${row.no} as a potential cut`">
                    <input type="checkbox" :aria-label="`Mark slide ${row.no} as a potential cut`" :checked="session.selectedCuts.includes(row.no)" :disabled="cutsLocked" @change="toggleCut(row.no)" />
                  </label>
                  <span class="rh-no">{{ row.no }}</span>
                  <span class="rh-name"><span class="rh-title">{{ row.title }}</span><span class="rh-part" :style="colorVars(row.part)"><span class="rh-swatch" />{{ row.part }}</span></span>
                  <span class="rh-bar"><i :style="{ width: pct(row.elapsedMs, maxSlide), ...colorVars(row.part) }" /></span>
                  <span class="rh-time">{{ row.visits ? formatTime(row.elapsedMs) : session.status === 'finished' ? 'Skipped' : '–' }}</span>
                  <span class="rh-visits">{{ row.visits > 1 ? `${row.visits}×` : '' }}</span>
                </li>
              </ol>
            </section>

            <details class="rh-help">
              <summary>How timing works</summary>
              <ul>
                <li>Clicks count toward the slide they are on. Going back to a slide adds to its total.</li>
                <li>Demo tabs keep the timer running. Pause for interruptions; time while paused is not counted.</li>
                <li>Leaving presenter view pauses the run. Reloading keeps it, so you can resume.</li>
                <li>Runs are saved in this browser for this address. Export before switching browsers.</li>
              </ul>
            </details>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Nav bar controls. They inherit the presenter bar colour. */
.rh-controls { display: flex; align-items: center; gap: 2px; font: 500 13px/1 Inter, ui-sans-serif, system-ui, sans-serif; }
.rh-chip, .rh-icon { display: inline-flex; align-items: center; gap: 7px; height: 30px; border-radius: 8px; cursor: pointer; color: inherit; background: transparent; transition: background .15s, opacity .15s; }
.rh-chip { padding: 0 10px; opacity: .8; white-space: nowrap; font-variant-numeric: tabular-nums; }
.rh-chip:hover, .rh-icon:hover { background: rgba(128, 128, 128, .14); opacity: 1; }
.rh-chip.is-recording, .rh-chip.is-paused { opacity: 1; background: rgba(128, 128, 128, .1); }
.rh-chip-total { font-weight: 700; }
.rh-chip-total.over { color: #de1e05; }
.rh-chip-slide { opacity: .6; }
.rh-icon { width: 30px; justify-content: center; opacity: .8; }
.rh-glyph, .rh-icon svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.rh-icon svg .fill { fill: currentColor; stroke: none; }
.rh-dot { width: 8px; height: 8px; border-radius: 50%; background: #de1e05; flex: none; }
.is-recording .rh-dot, .rh-live.is-recording .rh-dot { animation: rh-pulse 1.6s ease-in-out infinite; }
.is-paused .rh-dot { background: #c98a00; }
.rh-dot.static { animation: none; background: currentColor; opacity: .9; }
@keyframes rh-pulse { 0%, 100% { box-shadow: 0 0 0 0 #de1e0555; } 50% { box-shadow: 0 0 0 5px #de1e0500; } }

/* Dialog */
.rh-backdrop {
  --ink: #1a1a1a; --ink-2: #3d4148; --muted: #6b7079; --line: #e6e3dd; --line-2: #d6d2ca; --paper: #f5f3ef; --card: #fff;
  --red: #de1e05; --red-soft: #fdece9; --teal: #037f91; --teal-soft: #e3f3f5; --amber: #a86a00; --amber-soft: #fff4dc;
  position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 24px;
  background: rgba(20, 20, 22, .55); backdrop-filter: blur(3px);
  font: 14px/1.45 Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--ink); text-align: left;
  color-scheme: light;
}
.rh-panel { width: min(880px, 100%); max-height: calc(100dvh - 48px); display: flex; flex-direction: column; background: var(--paper); border-radius: 16px; box-shadow: 0 24px 80px rgba(0, 0, 0, .35); overflow: hidden; }
.rh-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 20px 24px 16px; border-bottom: 1px solid var(--line); background: var(--paper); }
.rh-eyebrow { margin: 0 0 4px; font-size: 11.5px; font-weight: 650; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
h2 { margin: 0; font-size: 22px; line-height: 1.15; font-weight: 750; letter-spacing: -.02em; }
h3 { margin: 0; font-size: 15px; font-weight: 700; }
.rh-close { flex: none; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--line-2); background: var(--card); color: var(--ink); cursor: pointer; }
.rh-close:hover { border-color: var(--muted); }
.rh-close svg, .rh-btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.rh-body { overflow-y: auto; padding: 18px 24px 24px; display: grid; gap: 16px; overscroll-behavior: contain; }
.rh-alert { margin: 0; padding: 10px 14px; border-radius: 10px; background: var(--red-soft); color: var(--red); font-weight: 550; }
.rh-card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; }
.rh-label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; }
.rh-muted { color: var(--muted); }
.rh-hint { margin: 10px 0 0; font-size: 13px; color: var(--muted); }
.over { color: var(--red); }
.under { color: var(--teal); }

/* Buttons */
.rh-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 38px; padding: 0 16px; border-radius: 10px; border: 1px solid var(--line-2); background: var(--card); color: var(--ink); font: inherit; font-weight: 600; cursor: pointer; white-space: nowrap; }
.rh-btn:hover { border-color: var(--muted); }
.rh-primary { background: var(--ink); border-color: var(--ink); color: var(--paper); }
.rh-primary:hover { opacity: .88; border-color: var(--ink); }
.rh-accent { border-color: var(--teal); color: var(--teal); }
.rh-quiet { border-color: transparent; background: transparent; color: var(--ink-2); padding: 0 10px; }
.rh-quiet:hover { background: var(--card); border-color: var(--line-2); }
.rh-big { height: 46px; padding: 0 22px; font-size: 15px; }
button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

/* Start */
.rh-start-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.rh-stepper { display: inline-flex; align-items: center; height: 46px; border: 1px solid var(--line-2); border-radius: 12px; background: var(--card); overflow: hidden; }
.rh-stepper button { width: 44px; height: 100%; border: 0; background: transparent; color: var(--ink); font-size: 20px; cursor: pointer; }
.rh-stepper button:hover { background: var(--paper); }
.rh-stepper input { width: 52px; border: 0; background: transparent; color: var(--ink); text-align: right; font-family: inherit; font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; -moz-appearance: textfield; }
.rh-stepper input::-webkit-inner-spin-button { display: none; }
.rh-unit { padding: 0 6px 0 4px; color: var(--muted); font-weight: 550; }

/* Live */
.rh-live-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: 13px; font-variant-numeric: tabular-nums; }
.rh-badge { display: inline-flex; align-items: center; gap: 7px; height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 650; background: var(--red-soft); color: var(--red); }
.rh-live.is-paused .rh-badge { background: var(--amber-soft); color: var(--amber); }
.rh-live.is-paused .rh-dot { background: var(--amber); }
.rh-figure { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 12px; margin: 12px 0 14px; }
.rh-figure strong { font-size: 52px; line-height: 1; font-weight: 780; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.rh-of { color: var(--muted); font-size: 15px; font-variant-numeric: tabular-nums; }
.rh-delta { font-weight: 700; font-size: 14px; padding: 3px 9px; border-radius: 7px; font-variant-numeric: tabular-nums; }
.rh-delta.over { background: var(--red-soft); }
.rh-delta.under { background: var(--teal-soft); }
.rh-gauge { position: relative; height: 10px; border-radius: 5px; background: var(--paper); border: 1px solid var(--line); }
.rh-gauge-fill { height: 100%; border-radius: 5px; background: var(--teal); transition: width .9s linear; }
.rh-gauge-fill.over { background: var(--red); }
.rh-gauge-pace { position: absolute; top: -4px; bottom: -4px; width: 2px; margin-left: -1px; background: var(--ink); border-radius: 1px; }
.rh-gauge-target { position: absolute; top: -4px; bottom: -4px; width: 2px; background: var(--card); }
.rh-pace { margin: 10px 0 0; font-size: 13px; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.rh-actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }

/* Results */
.rh-results { display: grid; gap: 14px; }
.rh-results-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.rh-run { flex: 1 1 260px; min-width: 0; }
.rh-run select { width: 100%; height: 38px; padding: 0 10px; border-radius: 10px; border: 1px solid var(--line-2); background: var(--card); color: var(--ink); font: inherit; font-variant-numeric: tabular-nums; }
.rh-export { display: flex; gap: 4px; align-items: center; }
.rh-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; margin: 0; background: var(--line); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.rh-stats > div { background: var(--card); padding: 12px 14px; min-width: 0; }
.rh-stats dt { font-size: 12px; font-weight: 600; color: var(--muted); }
.rh-stats dd { margin: 2px 0 0; font-size: 22px; font-weight: 720; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.rh-stats small { display: block; font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
.rh-stats small.over { color: var(--red); } .rh-stats small.under { color: var(--teal); }
.rh-timeline { padding-top: 2px; }
.rh-track { position: relative; height: 34px; border-radius: 7px; background: var(--card); border: 1px solid var(--line); overflow: hidden; }
.rh-seg { position: absolute; top: 0; bottom: 0; background: var(--c); box-shadow: inset -1px 0 var(--card); }
.rh-seg.cut { background: repeating-linear-gradient(135deg, var(--card) 0 3px, var(--c) 3px 7px); }
.rh-overrun { position: absolute; top: 0; bottom: 0; background: repeating-linear-gradient(135deg, #de1e0538 0 4px, #de1e0510 4px 8px); border-top: 3px solid var(--red); pointer-events: none; }
.rh-target { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--ink); }
.rh-axis { position: relative; height: 18px; font-size: 11.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
.rh-axis span { position: absolute; top: 3px; }
.rh-axis span + span { transform: translateX(-100%); }
.rh-sections { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.rh-sections li { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 8px; background: var(--card); border: 1px solid var(--line); font-size: 12.5px; }
.rh-sections b { font-weight: 650; font-variant-numeric: tabular-nums; margin-left: 2px; }
.rh-swatch { width: 8px; height: 8px; border-radius: 3px; background: var(--c); flex: none; }
.rh-table-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 4px; }
.rh-segmented { display: inline-flex; padding: 2px; border-radius: 9px; background: var(--line); }
.rh-segmented button { height: 28px; padding: 0 12px; border: 0; border-radius: 7px; background: transparent; color: var(--ink-2); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.rh-segmented button[aria-pressed='true'] { background: var(--card); color: var(--ink); box-shadow: 0 1px 2px rgba(0, 0, 0, .08); }
.rh-list { list-style: none; margin: 0; padding: 0; background: var(--card); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.rh-list li { display: grid; grid-template-columns: 40px 28px minmax(0, 1fr) minmax(60px, 22%) 52px 30px; align-items: center; gap: 10px; min-height: 42px; padding-right: 14px; border-top: 1px solid var(--line); font-variant-numeric: tabular-nums; }
.rh-list li:first-child { border-top: 0; }
.rh-list li.cut { background: var(--red-soft); }
.rh-list li.cut .rh-title { text-decoration: line-through; text-decoration-color: var(--red); }
.rh-list li.skipped .rh-time { color: var(--muted); font-weight: 500; }
.rh-cut { display: flex; justify-content: center; align-self: stretch; align-items: center; cursor: pointer; }
.rh-cut input { width: 16px; height: 16px; margin: 0; accent-color: var(--red); cursor: pointer; }
.rh-cut input:disabled { cursor: not-allowed; opacity: .4; }
.rh-no { font-size: 12.5px; color: var(--muted); }
.rh-name { display: flex; align-items: center; gap: 10px; min-width: 0; }
.rh-title { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.rh-part { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; font-size: 12px; color: var(--muted); white-space: nowrap; flex: none; }
.rh-bar { height: 8px; border-radius: 4px; background: var(--paper); overflow: hidden; }
.rh-bar i { display: block; height: 100%; border-radius: 4px; background: var(--c); }
.rh-time { text-align: right; font-weight: 650; }
.rh-visits { text-align: right; font-size: 12.5px; font-weight: 650; color: var(--ink-2); }
.rh-help { font-size: 13px; color: var(--ink-2); }
.rh-help summary { cursor: pointer; font-weight: 600; color: var(--muted); width: max-content; }
.rh-help ul { margin: 8px 0 0; padding-left: 18px; display: grid; gap: 4px; }

@media (max-width: 720px) {
  .rh-backdrop { padding: 0; place-items: stretch; }
  .rh-panel { width: 100%; max-height: 100dvh; height: 100dvh; border-radius: 0; }
  .rh-head { padding: 16px 16px 12px; }
  .rh-body { padding: 14px 16px 28px; gap: 14px; }
  .rh-card { padding: 16px; }
  .rh-start-row > * { flex: 1 1 100%; }
  .rh-stepper { width: 100%; justify-content: space-between; }
  .rh-stepper input { flex: 1; text-align: center; }
  .rh-big { width: 100%; }
  .rh-figure strong { font-size: 44px; }
  .rh-actions .rh-btn { flex: 1; }
  .rh-export { width: 100%; }
  .rh-export .rh-accent { flex: 1; }
  .rh-stats { grid-template-columns: 1fr 1fr; }
  .rh-stats > div:first-child { grid-column: 1 / -1; }
  .rh-list li { grid-template-columns: 40px 24px minmax(0, 1fr) 52px 26px; }
  .rh-bar, .rh-part { display: none; }
}
@media (prefers-reduced-motion: reduce) { .rh-dot, .rh-gauge-fill { animation: none !important; transition: none !important; } }
</style>

<style>
/* Unscoped so it can follow Slidev's dark mode class on <html>. */
html.dark .rh-backdrop {
  --ink: #f2f1ee; --ink-2: #cfcdc8; --muted: #9a978f; --line: #2e2d2b; --line-2: #3d3b38; --paper: #161615; --card: #1f1f1d;
  --red: #ff6a52; --red-soft: #3a1914; --teal: #3cc3d6; --teal-soft: #0f2d32; --amber: #f0b54a; --amber-soft: #33270f;
  color-scheme: dark;
}
</style>
