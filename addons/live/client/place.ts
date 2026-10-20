// Where the camera bubble sits: its centre and its width as fractions of the
// slide, so it lands on the same spot of the slide on any screen.
export interface Place { x: number, y: number, size: number }
export interface Box { left: number, top: number, width: number, height: number }

// Slidev's own bubble starts an eighth of the window wide, near the bottom
// right corner.
const SIZE = 0.125
const MARGIN = 0.02
const MIN = 0.05
const MAX = 0.5

const number = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback
const between = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

// Keeps the bubble whole on the slide, and fills in what is missing.
// `aspect` is the slide's width over its height.
export function clampPlace(place: Partial<Place> | undefined, aspect: number): Place {
  const size = between(number(place?.size, SIZE), MIN, Math.min(MAX, 1 / aspect))
  const x = number(place?.x, 1 - MARGIN - size / 2)
  const y = number(place?.y, 1 - (MARGIN + size / 2) * aspect)
  return {
    x: between(x, size / 2, 1 - size / 2),
    y: between(y, size * aspect / 2, 1 - size * aspect / 2),
    size,
  }
}

// The bubble in pixels, on a slide shown at `box`.
export function circle(box: Box, place: Place) {
  const size = place.size * box.width
  return { left: box.left + place.x * box.width - size / 2, top: box.top + place.y * box.height - size / 2, size }
}

// The other way round: a bubble in pixels as fractions of the slide.
export function toPlace(box: Box, bubble: { left: number, top: number, size: number }): Place {
  return clampPlace({
    x: (bubble.left + bubble.size / 2 - box.left) / box.width,
    y: (bubble.top + bubble.size / 2 - box.top) / box.height,
    size: bubble.size / box.width,
  }, box.width / box.height)
}

// A slide of this shape, as large as fits in `area` and centred.
export function fit(area: Box, aspect: number): Box {
  const width = Math.min(area.width, area.height * aspect)
  const height = width / aspect
  return { left: area.left + (area.width - width) / 2, top: area.top + (area.height - height) / 2, width, height }
}
