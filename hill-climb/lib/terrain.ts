import rounds from './rounds.json'

export type Member = 'opus' | 'sol'
export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] as const

const table = rounds as unknown as Record<string, Record<Member, { overall: number, rows: Record<string, number> }>>
export const ROUND_NUMBERS = Object.keys(table).map(Number).sort((a, b) => a - b)
export const overall = (m: Member) => ROUND_NUMBERS.map(r => table[r][m].overall)
export const mean = ROUND_NUMBERS.map(r => (table[r].opus.overall + table[r].sol.overall) / 2)
export const rowMean = (row: string) => ROUND_NUMBERS.map(r => (table[r].opus.rows[row] + table[r].sol.rows[row]) / 2)

// The two-peak landscape from the hill climbing slide. t runs from 0 to 1.
export const peaks = (t: number) =>
  0.5 * Math.exp(-((t - 0.32) ** 2) / 0.018) + 0.92 * Math.exp(-((t - 0.76) ** 2) / 0.014) + 0.05 * Math.sin(t * 9)

// A smooth line through points, as an SVG path.
export function smooth(pts: [number, number][], tension = 0.5) {
  if (!pts.length) return ''
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const k = tension / 3
    const c1x = p1[0] + (p2[0] - p0[0]) * k
    const c1y = p1[1] + (p2[1] - p0[1]) * k
    const c2x = p2[0] - (p3[0] - p1[0]) * k
    const c2y = p2[1] - (p3[1] - p1[1]) * k
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

// The real climb as a hill: the mean of both members, round by round.
export function hill(w: number, base: number, top: number, min = 6, max = 10) {
  const y = (s: number) => base - ((s - min) / (max - min)) * (base - top)
  const pts: [number, number][] = mean.map((s, i) => [(i / (mean.length - 1)) * w, y(s)])
  return { pts, y, line: smooth(pts), area: `${smooth(pts)} L${w} ${base + 400} L0 ${base + 400} Z` }
}
