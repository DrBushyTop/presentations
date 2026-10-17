<script setup>
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useNav } from '@slidev/client'
import { describeElement } from './pick.mjs'
import {
  api, canvasSize, clearPending, draft, hasPending, marksBounds, pending, slideElement,
  toScreenRect, toSlidePoint, toSlideRect, ui,
} from './store.mjs'

const nav = useNav()
const slideRect = ref(null)
const hover = ref(null) // { rect, label }
const drag = ref(null) // { kind, start, points }
const commentBox = ref(null)

const tools = [
  { id: 'select', label: 'Select', title: 'Pick elements. Shift-click adds more.' },
  { id: 'region', label: 'Area', title: 'Drag to mark an area' },
  { id: 'draw', label: 'Draw', title: 'Draw on the slide' },
  { id: 'erase', label: 'Erase', title: 'Click a mark to remove it' },
]

let frame = 0
function track() {
  const el = slideElement()
  const r = el?.getBoundingClientRect()
  const prev = slideRect.value
  if (!r) slideRect.value = null
  else if (!prev || prev.left !== r.left || prev.top !== r.top || prev.width !== r.width || prev.height !== r.height)
    slideRect.value = { left: r.left, top: r.top, width: r.width, height: r.height }
  frame = requestAnimationFrame(track)
}
onMounted(() => { frame = requestAnimationFrame(track) })
onBeforeUnmount(() => cancelAnimationFrame(frame))

const screen = r => slideRect.value ? toScreenRect(r, slideRect.value) : { left: 0, top: 0, width: 0, height: 0 }
const box = r => { const s = screen(r); return { left: `${s.left}px`, top: `${s.top}px`, width: `${s.width}px`, height: `${s.height}px` } }
const strokePath = s => s.points.map(([x, y], i) => {
  const p = screen({ x, y, w: 0, h: 0 })
  return `${i ? 'L' : 'M'}${p.left} ${p.top}`
}).join(' ')

const surfaceStyle = computed(() => slideRect.value && {
  left: `${slideRect.value.left}px`, top: `${slideRect.value.top}px`,
  width: `${slideRect.value.width}px`, height: `${slideRect.value.height}px`,
})

const toolbarStyle = computed(() => {
  const r = slideRect.value
  if (!r) return {}
  return { left: `${r.left + r.width / 2}px`, top: `${Math.max(8, r.top + 10)}px` }
})

// Annotations already attached for the slide on screen, shown as numbered pins.
const pins = computed(() => draft.value.annotations
  .map((a, i) => ({ a, n: i + 1 }))
  .filter(({ a }) => a.slide.no === nav.currentSlideNo.value)
  .map(({ a, n }) => ({ n, comment: a.comment, bounds: marksBounds(a) || { x: 24, y: 24, w: 0, h: 0 } })))

const canvasRect = () => { const { width, height } = canvasSize(); return { x: 0, y: 0, w: width, h: height } }
// A whole-slide note has no marks, so its editor sits at the bottom of the slide.
const pendingBounds = computed(() => marksBounds(pending) || (pending.wholeSlide ? { ...canvasRect(), y: canvasRect().h - 1, h: 1 } : null))
const editorStyle = computed(() => {
  if (!pendingBounds.value || !slideRect.value) return {}
  const s = screen(pendingBounds.value)
  const width = 340
  const below = s.top + s.height + 10
  const top = below + 150 < window.innerHeight ? below : Math.max(8, s.top - 160)
  return { left: `${Math.min(Math.max(8, s.left), window.innerWidth - width - 8)}px`, top: `${top}px`, width: `${width}px` }
})

function pickable(x, y) {
  const root = slideElement()
  return document.elementsFromPoint(x, y).find(el =>
    root?.contains(el) && el !== root && !el.closest('[data-t3-annotate-ui]')
    && !el.classList.contains('slidev-page') && el.getBoundingClientRect().width > 0) || null
}

function elementEntry(el) {
  return { node: markRaw(el), ...describeElement(el, slideElement()), rect: toSlideRect(el.getBoundingClientRect(), slideRect.value) }
}

function onMove(e) {
  if (drag.value) {
    const pt = toSlidePoint(e.clientX, e.clientY, slideRect.value)
    if (drag.value.kind === 'draw') drag.value.points.push(pt)
    else drag.value.end = pt
    return
  }
  if (ui.tool !== 'select') { hover.value = null; return }
  const el = pickable(e.clientX, e.clientY)
  if (el && pending.elements.some(p => p.node === el)) { hover.value = null; return }
  hover.value = el && { rect: toSlideRect(el.getBoundingClientRect(), slideRect.value), label: elementEntry(el).label }
}

function onDown(e) {
  if (e.button !== 0 || !slideRect.value) return
  e.preventDefault()
  e.currentTarget.setPointerCapture(e.pointerId)
  const pt = toSlidePoint(e.clientX, e.clientY, slideRect.value)
  if (ui.tool === 'select') {
    const el = pickable(e.clientX, e.clientY)
    if (!el) return
    const at = pending.elements.findIndex(p => p.node === el)
    if (at >= 0) pending.elements.splice(at, 1)
    else if (e.shiftKey || e.metaKey) pending.elements.push(elementEntry(el))
    else pending.elements = [elementEntry(el)]
    focusEditor()
  }
  else if (ui.tool === 'region') drag.value = { kind: 'region', start: pt, end: pt }
  else if (ui.tool === 'draw') drag.value = { kind: 'draw', points: [pt] }
  else if (ui.tool === 'erase') erase(pt)
}

function onUp() {
  const d = drag.value
  drag.value = null
  if (!d) return
  if (d.kind === 'region') {
    const r = dragRect(d)
    if (r.w > 6 && r.h > 6) pending.regions.push(r)
  }
  else if (d.points.length > 1) pending.strokes.push({ points: d.points })
  focusEditor()
}

const dragRect = d => ({
  x: Math.min(d.start[0], d.end[0]), y: Math.min(d.start[1], d.end[1]),
  w: Math.abs(d.end[0] - d.start[0]), h: Math.abs(d.end[1] - d.start[1]),
})

const inside = ([x, y], r, pad = 0) => x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad
function erase(pt) {
  const s = pending.strokes.findIndex(st => st.points.some(([x, y]) => Math.hypot(x - pt[0], y - pt[1]) < 14))
  if (s >= 0) return pending.strokes.splice(s, 1)
  const r = pending.regions.findIndex(rg => inside(pt, rg))
  if (r >= 0) return pending.regions.splice(r, 1)
  const el = pending.elements.findIndex(p => inside(pt, p.rect))
  if (el >= 0) pending.elements.splice(el, 1)
}

function selectParent() {
  const last = pending.elements.at(-1)
  const parent = last?.node.parentElement
  if (!parent || parent === slideElement() || !slideElement()?.contains(parent)) return
  pending.elements.splice(pending.elements.length - 1, 1, elementEntry(parent))
}

async function focusEditor() {
  await nextTick()
  commentBox.value?.focus()
}

function noteWholeSlide() {
  clearPending()
  pending.wholeSlide = true
  focusEditor()
}

function attach() {
  if (!hasPending() && !(pending.wholeSlide && pending.comment.trim())) return
  const id = Math.random().toString(36).slice(2, 10)
  const marks = {
    boxes: [
      ...pending.elements.map((p, i) => ({ ...p.rect, kind: 'element', label: pending.elements.length > 1 ? String(i + 1) : '' })),
      ...pending.regions.map(r => ({ ...r, kind: 'region' })),
    ],
    strokes: pending.strokes.map(s => ({ points: s.points })),
  }
  const annotation = {
    id,
    slide: { no: nav.currentSlideNo.value, clicks: nav.clicks.value, clicksTotal: nav.clicksTotal.value },
    comment: pending.comment.trim(),
    elements: pending.elements.map(({ node, ...rest }) => rest),
    regions: pending.regions.map(r => ({ ...r })),
    strokes: pending.strokes.map(s => ({ points: s.points })),
    wholeSlide: pending.wholeSlide,
    shotId: '',
    shotState: 'pending',
  }
  draft.value.annotations.push(annotation)
  clearPending()
  hover.value = null
  api('shot', { slide: annotation.slide, marks })
    .then(({ id: shotId }) => patch(id, { shotId, shotState: 'ready' }))
    .catch(() => patch(id, { shotState: 'failed' }))
}

function patch(id, values) {
  const a = draft.value.annotations.find(x => x.id === id)
  if (a) Object.assign(a, values)
}

function onEditorKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); attach() }
  if (e.key === 'Escape') { e.preventDefault(); clearPending(); commentBox.value?.blur() }
}

function onWindowKey(e) {
  if (e.key !== 'Escape' || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return
  if (hasPending()) clearPending()
  else ui.active = false
}
onMounted(() => window.addEventListener('keydown', onWindowKey, true))
onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKey, true))

// Marks belong to one slide and click state; moving on discards unattached ones.
watch(() => [nav.currentSlideNo.value, nav.clicks.value], () => { clearPending(); hover.value = null })
</script>

<template>
  <div v-if="slideRect" data-t3-annotate-ui class="ta-layer">
    <div
      class="ta-surface" :class="`tool-${ui.tool}`" :style="surfaceStyle"
      @pointermove="onMove" @pointerdown="onDown" @pointerup="onUp" @pointercancel="onUp"
      @pointerleave="hover = null" @click.stop @contextmenu.stop
    />

    <svg class="ta-ink" aria-hidden="true">
      <path v-for="(s, i) in pending.strokes" :key="`s${i}`" :d="strokePath(s)" />
      <path v-if="drag?.kind === 'draw'" :d="strokePath(drag)" />
    </svg>

    <div v-if="hover" class="ta-hover" :style="box(hover.rect)">
      <span class="ta-tag">{{ hover.label }}</span>
    </div>
    <div v-for="(p, i) in pending.elements" :key="`e${i}`" class="ta-picked" :style="box(p.rect)">
      <span class="ta-tag">{{ pending.elements.length > 1 ? `${i + 1} · ` : '' }}{{ p.label }}</span>
    </div>
    <div v-for="(r, i) in pending.regions" :key="`r${i}`" class="ta-region" :style="box(r)" />
    <div v-if="drag?.kind === 'region'" class="ta-region" :style="box(dragRect(drag))" />

    <div
      v-for="p in pins" :key="`pin${p.n}`" class="ta-pin"
      :style="{ left: `${screen(p.bounds).left - 12}px`, top: `${screen(p.bounds).top - 12}px` }"
      :title="p.comment || 'Attached'"
    >
      {{ p.n }}
    </div>

    <div class="ta-toolbar" :style="toolbarStyle" role="toolbar" aria-label="Annotate slide">
      <button
        v-for="t in tools" :key="t.id" type="button" :class="{ on: ui.tool === t.id }" :title="t.title"
        @click="ui.tool = t.id; hover = null"
      >
        {{ t.label }}
      </button>
      <button type="button" :class="{ on: pending.wholeSlide }" title="Comment on the whole slide" @click="noteWholeSlide">Slide note</button>
      <span class="ta-sep" />
      <button type="button" title="Open the message tray" @click="ui.trayOpen = !ui.trayOpen">
        Tray<span v-if="draft.annotations.length" class="ta-count">{{ draft.annotations.length }}</span>
      </button>
      <button type="button" class="ta-done" title="Stop annotating (Esc)" @click="ui.active = false">Done</button>
    </div>

    <div v-if="pendingBounds" class="ta-editor" :style="editorStyle" @pointerdown.stop>
      <div v-if="pending.wholeSlide && !hasPending()" class="ta-editor-targets">
        <span class="ta-chip">Whole slide {{ nav.currentSlideNo.value }}</span>
      </div>
      <div v-if="pending.elements.length" class="ta-editor-targets">
        <span v-for="(p, i) in pending.elements" :key="i" class="ta-chip">{{ p.label }}</span>
        <button type="button" class="ta-link" title="Select the parent of the last element" @click="selectParent">Parent ↑</button>
      </div>
      <textarea
        ref="commentBox" v-model="pending.comment" rows="2" placeholder="Describe the change…"
        @keydown.stop="onEditorKey"
      />
      <div class="ta-editor-actions">
        <span class="ta-hint">Enter attaches · Esc clears</span>
        <button type="button" class="ta-ghost" @click="clearPending">Clear</button>
        <button type="button" class="ta-primary" @click="attach">Attach</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ta-layer { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; font: 13px/1.35 system-ui, -apple-system, sans-serif; }
.ta-layer > * { pointer-events: auto; }
.ta-surface { position: fixed; cursor: default; touch-action: none; outline: 2px solid rgb(45 212 191 / 0.55); outline-offset: 2px; }
.ta-surface.tool-region, .ta-surface.tool-draw { cursor: crosshair; }
.ta-surface.tool-erase { cursor: not-allowed; }
.ta-ink, .ta-hover, .ta-picked, .ta-region, .ta-pin { pointer-events: none !important; }
.ta-ink { position: fixed; inset: 0; width: 100vw; height: 100vh; overflow: visible; }
.ta-ink path { fill: none; stroke: #ef4444; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
.ta-hover, .ta-picked, .ta-region { position: fixed; border-radius: 3px; box-sizing: border-box; }
.ta-hover { border: 2px solid #2dd4bf; background: rgb(45 212 191 / 0.12); }
.ta-picked { border: 2px solid #0ea5e9; background: rgb(14 165 233 / 0.12); }
.ta-region { border: 2px dashed #0ea5e9; background: rgb(14 165 233 / 0.08); }
.ta-tag { position: absolute; left: -2px; bottom: 100%; margin-bottom: 3px; padding: 1px 7px; border-radius: 5px; background: #2dd4bf; color: #0f172a; font-weight: 600; font-size: 12px; white-space: nowrap; max-width: 320px; overflow: hidden; text-overflow: ellipsis; }
.ta-picked .ta-tag { background: #0ea5e9; color: white; }
.ta-pin { position: fixed; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: #f59e0b; color: #1c1917; font-weight: 700; font-size: 12px; box-shadow: 0 0 0 2px white, 0 2px 6px rgb(0 0 0 / 0.35); }
.ta-toolbar { position: fixed; transform: translateX(-50%); display: flex; align-items: center; gap: 2px; padding: 4px; border-radius: 10px; background: #334155f2; box-shadow: 0 6px 20px rgb(0 0 0 / 0.3); }
.ta-toolbar button { all: unset; cursor: pointer; padding: 5px 11px; border-radius: 7px; color: #e2e8f0; font-weight: 600; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
.ta-toolbar button:hover { background: #475569; }
.ta-toolbar button.on { background: #1e293b; color: #2dd4bf; }
.ta-toolbar .ta-done { color: #fde68a; }
.ta-sep { width: 1px; align-self: stretch; margin: 4px 4px; background: #64748b; }
.ta-count { min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box; border-radius: 9px; background: #f59e0b; color: #1c1917; font-size: 11px; display: inline-grid; place-items: center; }
.ta-editor { position: fixed; padding: 10px; border-radius: 12px; background: #334155f5; color: #e2e8f0; box-shadow: 0 10px 30px rgb(0 0 0 / 0.35); display: grid; gap: 8px; }
.ta-editor-targets { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.ta-chip { padding: 1px 7px; border-radius: 6px; background: #0ea5e9; color: white; font-size: 11px; font-weight: 600; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ta-link { all: unset; cursor: pointer; font-size: 11px; color: #5eead4; margin-left: auto; }
.ta-editor textarea { width: 100%; box-sizing: border-box; resize: vertical; border: 1px solid #475569; border-radius: 8px; padding: 8px 10px; background: #1e293b; color: #f1f5f9; font: inherit; font-size: 14px; outline: none; }
.ta-editor textarea:focus { border-color: #2dd4bf; }
.ta-editor-actions { display: flex; align-items: center; gap: 6px; }
.ta-hint { flex: 1; font-size: 11px; color: #94a3b8; }
.ta-primary, .ta-ghost { all: unset; cursor: pointer; padding: 5px 12px; border-radius: 7px; font-weight: 600; }
.ta-primary { background: #2dd4bf; color: #0f172a; }
.ta-ghost { color: #cbd5e1; }
.ta-ghost:hover { background: #475569; }
</style>
