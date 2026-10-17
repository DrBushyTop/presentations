// State shared by the nav button, the slide overlay and the chat. Module scope
// keeps it alive when Slidev remounts the nav controls. Edits to the deck's
// headmatter reload the page, so this tab's open panels and unfinished note
// live in sessionStorage.
import { useLocalStorage } from '@vueuse/core'
import { configs } from '@slidev/client'
import { reactive, watch } from 'vue'

const deckId = configs.exportFilename || configs.title || 'presentation'

function sessionState(key, initial, save = (v) => v) {
  let saved = null
  try { saved = JSON.parse(sessionStorage.getItem(key)) } catch {}
  const state = reactive({ ...initial, ...saved })
  watch(state, () => sessionStorage.setItem(key, JSON.stringify(save(state))), { deep: true })
  return state
}

export const ui = sessionState('slidev-t3-annotate:ui', {
  active: false, // the overlay captures the pointer on the current slide
  tool: 'select', // select | region | draw | erase
  trayOpen: false,
})

/**
 * Marks not attached yet, on `slide` ({ no, clicks }). Rects are in slide canvas pixels.
 * Picked elements hold their DOM node, which a reload loses.
 */
export const pending = sessionState(
  'slidev-t3-annotate:pending',
  { slide: null, elements: [], regions: [], strokes: [], comment: '', wholeSlide: false },
  (p) => ({ ...p, elements: p.elements.map(({ node, ...rest }) => rest) }),
)

/** The message being composed, the open chat and the deck's earlier chats. Survives reloads, one per deck. */
export const draft = useLocalStorage(`slidev-t3-annotate:${deckId}`, { message: '', annotations: [], threadId: '', chats: [] }, { mergeDefaults: true })
export const modelChoice = useLocalStorage('slidev-t3-annotate:model', { instanceId: '', model: '', effort: '' }, { mergeDefaults: true })

export function clearPending() {
  pending.slide = null
  pending.elements = []
  pending.regions = []
  pending.strokes = []
  pending.comment = ''
  pending.wholeSlide = false
}

export const hasPending = () => pending.elements.length + pending.regions.length + pending.strokes.length > 0

export class ApiError extends Error {}

export async function api(path, body) {
  const res = await fetch(`/__t3-annotate/${path}`, body === undefined
    ? { headers: { accept: 'application/json' } }
    : { method: 'POST', headers: { 'content-type': 'application/json', 'x-t3-annotate': '1' }, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`)
  return data
}

export const canvasSize = () => {
  const width = configs.canvasWidth || 980
  return { width, height: Math.round(width / (configs.aspectRatio || 16 / 9)) }
}

export const slideElement = () => document.querySelector('#slide-content')

/** Converts a screen rect to slide canvas pixels. */
export function toSlideRect(rect, slideRect) {
  const scale = slideRect.width / canvasSize().width
  return {
    x: Math.round((rect.left - slideRect.left) / scale),
    y: Math.round((rect.top - slideRect.top) / scale),
    w: Math.round(rect.width / scale),
    h: Math.round(rect.height / scale),
  }
}

export function toSlidePoint(x, y, slideRect) {
  const scale = slideRect.width / canvasSize().width
  return [Math.round((x - slideRect.left) / scale), Math.round((y - slideRect.top) / scale)]
}

/** Converts a slide canvas rect back to screen pixels. */
export function toScreenRect(r, slideRect) {
  const scale = slideRect.width / canvasSize().width
  return { left: slideRect.left + r.x * scale, top: slideRect.top + r.y * scale, width: r.w * scale, height: r.h * scale }
}

export function marksBounds({ elements = [], regions = [], strokes = [] }) {
  const rects = [
    ...elements.map((e) => e.rect),
    ...regions,
    ...strokes.map((s) => {
      const xs = s.points.map((p) => p[0])
      const ys = s.points.map((p) => p[1])
      return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
    }),
  ]
  if (!rects.length) return null
  const x = Math.min(...rects.map((r) => r.x))
  const y = Math.min(...rects.map((r) => r.y))
  return { x, y, w: Math.max(...rects.map((r) => r.x + r.w)) - x, h: Math.max(...rects.map((r) => r.y + r.h)) - y }
}

/** Renders the screenshot for an attached note and records the result on it. */
export function takeShot(annotation) {
  const labelled = annotation.elements.length > 1
  const marks = {
    boxes: [
      ...annotation.elements.map((e, i) => ({ ...e.rect, kind: 'element', label: labelled ? String(i + 1) : '' })),
      ...annotation.regions.map((r) => ({ ...r, kind: 'region' })),
    ],
    strokes: annotation.strokes.map((s) => ({ points: s.points })),
  }
  const update = (values) => Object.assign(draft.value.annotations.find((a) => a.id === annotation.id) || {}, values)
  update({ shotState: 'pending' })
  api('shot', { slide: annotation.slide, marks })
    .then(({ id }) => update({ shotId: id, shotState: 'ready' }))
    .catch(() => update({ shotState: 'failed' }))
}

// A reload while a screenshot rendered would leave the note waiting forever.
draft.value.annotations.filter((a) => a.shotState === 'pending').forEach(takeShot)
