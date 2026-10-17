// State shared by the nav button, the slide overlay and the tray. Module scope
// keeps it alive when Slidev remounts the nav controls.
import { useLocalStorage } from '@vueuse/core'
import { configs } from '@slidev/client'
import { reactive } from 'vue'

const deckId = configs.exportFilename || configs.title || 'presentation'

export const ui = reactive({
  active: false, // the overlay captures the pointer on the current slide
  tool: 'select', // select | region | draw | erase
  trayOpen: false,
})

/** Marks made on the current slide that are not attached yet. Rects are in slide canvas pixels. */
export const pending = reactive({ elements: [], regions: [], strokes: [], comment: '', wholeSlide: false })

/** The message being composed. Survives reloads, one per deck. */
export const draft = useLocalStorage(`slidev-t3-annotate:${deckId}`, { message: '', annotations: [], threadId: '' }, { mergeDefaults: true })
export const modelChoice = useLocalStorage('slidev-t3-annotate:model', { instanceId: '', model: '', effort: '' }, { mergeDefaults: true })

export function clearPending() {
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
