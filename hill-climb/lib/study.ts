// The designer study, 10 November 2026: three designers, one hour each.
// Numbers come from the study app export, unblinded with the answer key.

// Hands-on rating of the old and the new build, 1 to 10.
export const hands = [
  { p: 'P1', old: 3, new: 7, t: '3 → 7' },
  { p: 'P2', old: 4, new: 4, t: '4 and 4' },
  { p: 'P3', old: 5, new: 8, t: '5 → 8' },
  { p: 'Mean', old: 4.0, new: 6.3, t: '4.0 → 6.3' },
]

// Blind pairs, original against the final build: 12 pairs x 3 people, each
// -2 (original clearly better) to +2 (final build clearly better).
export const pairs = { mean: 0.47, won: 19, tied: 8, lost: 9 }

// Mean rank of six screens, three designers each (1 = best of 4).
export const ranks = [
  { k: 'original', n: 'Original', v: 2.89 },
  { k: 'r2', n: 'Round 2/3', v: 2.5 },
  { k: 'r10', n: 'Round 10', v: 2.0 },
  { k: 'final', n: 'Final build', v: 2.61 },
] as const
