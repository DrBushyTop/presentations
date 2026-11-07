// A small stroke font. Each glyph is centre lines on an 88 x 90 box. OutlineWord
// draws them thick in colour, then slightly thinner in black, which leaves
// hollow letters with no internal seams.
type Line = number[][]
type Glyph = { lines: Line[], advance?: number }

const LEFT = 7
const RIGHT = 81
const TOP = 7
const MID = 45
const BOTTOM = 83
const box = [[LEFT, TOP], [RIGHT, TOP], [RIGHT, BOTTOM], [LEFT, BOTTOM], [LEFT, TOP]]

const glyphs: Record<string, Glyph> = {
  'G': { lines: [[[RIGHT, TOP], [LEFT, TOP], [LEFT, BOTTOM], [RIGHT, BOTTOM], [RIGHT, MID], [46, MID]]] },
  'A': { lines: [[[LEFT, BOTTOM], [LEFT, 30], [30, TOP], [RIGHT, TOP], [RIGHT, BOTTOM]], [[LEFT, 52], [RIGHT, 52]]] },
  'M': { lines: [[[LEFT, BOTTOM], [LEFT, TOP], [RIGHT, TOP], [RIGHT, BOTTOM]], [[44, TOP], [44, 60]]] },
  'E': { lines: [[[RIGHT, TOP], [LEFT, TOP], [LEFT, BOTTOM], [RIGHT, BOTTOM]], [[LEFT, MID], [68, MID]]] },
  'O': { lines: [box] },
  'V': { lines: [[[LEFT, TOP], [LEFT, 52], [44, BOTTOM], [RIGHT, 52], [RIGHT, TOP]]] },
  'R': { lines: [[[LEFT, BOTTOM], [LEFT, TOP], [RIGHT, TOP], [RIGHT, MID], [LEFT, MID]], [[50, 52], [RIGHT, BOTTOM]]] },
  '0': { lines: [box] },
  '1': { lines: [[[14, 20], [38, TOP], [38, BOTTOM]]], advance: 64 },
  '2': { lines: [[[LEFT, TOP], [RIGHT, TOP], [RIGHT, MID], [LEFT, MID], [LEFT, BOTTOM], [RIGHT, BOTTOM]]] },
  '3': { lines: [[[LEFT, TOP], [RIGHT, TOP], [RIGHT, BOTTOM], [LEFT, BOTTOM]], [[24, MID], [RIGHT, MID]]] },
  '4': { lines: [[[60, BOTTOM], [60, TOP], [LEFT, 58], [RIGHT, 58]]] },
  '5': { lines: [[[RIGHT, TOP], [LEFT, TOP], [LEFT, MID], [RIGHT, MID], [RIGHT, BOTTOM], [LEFT, BOTTOM]]] },
  '6': { lines: [[[RIGHT, TOP], [LEFT, TOP], [LEFT, BOTTOM], [RIGHT, BOTTOM], [RIGHT, MID], [LEFT, MID]]] },
  '7': { lines: [[[LEFT, TOP], [RIGHT, TOP], [36, BOTTOM]]] },
  '8': { lines: [box, [[LEFT, MID], [RIGHT, MID]]] },
  '9': { lines: [[[RIGHT, MID], [LEFT, MID], [LEFT, TOP], [RIGHT, TOP], [RIGHT, BOTTOM], [LEFT, BOTTOM]]] },
  '+': { lines: [[[44, 22], [44, 68]], [[18, MID], [70, MID]]] },
  '.': { lines: [[[14, 76], [14, BOTTOM]]], advance: 44 },
  ' ': { lines: [], advance: 52 },
}

const ADVANCE = 96
const advance = (ch: string) => glyphs[ch].advance ?? ADVANCE

export const CAP = 90
export const STROKE = 14
export const measure = (text: string) => [...text].reduce((sum, ch) => sum + advance(ch), 0) - 8

export function outlinePath(text: string) {
  let x = 0
  let d = ''
  for (const ch of text) {
    for (const line of glyphs[ch].lines) {
      const isBox = line === box
      const points = isBox ? line.slice(0, -1) : line
      d += `M${points.map(([px, py]) => `${px + x} ${py}`).join('L')}${isBox ? 'Z' : ''}`
    }
    x += advance(ch)
  }
  return d
}
