// PR #540 in the testing-harness repo: a Safari audio bug reported from my
// phone and fixed, reviewed and merged by an agent in one T3 Code thread
// (efc4a974, items 242 to 595, 21 Oct 2026, Helsinki time).
// walkthrough.mp4 is a recording of the real thread in the T3 web UI, with
// the production URLs and resource names blacked out. The cursor is drawn in:
// it clicks into the review subagent's own thread and back.
// Consecutive beats with the same label share one item in the rail.

export type Who = 'you' | 'agent' | 'review'

export interface Beat {
  id: string
  clock: string
  label: string
  who: Who
  // Where the beat sits in walkthrough.mp4: hold time in seconds, and the
  // message to zoom to as [x, y, w, h] fractions of the frame.
  video: { t: number, rect: [number, number, number, number] }
}

export const BEATS: Beat[] = [
  { id: 'report', clock: '22:35', label: 'Bug report from my phone', who: 'you',
    video: { t: 1.6, rect: [0.2787, 0.2481, 0.59, 0.3724] } },
  { id: 'steers', clock: '22:37', label: 'Symptoms, sent mid-run', who: 'you',
    video: { t: 4.65, rect: [0.5202, 0.2769, 0.3486, 0.3147] } },
  { id: 'wrong', clock: '22:38', label: '“Confirmed”, and wrong', who: 'agent',
    video: { t: 7.183, rect: [0.1313, 0.3577, 0.7375, 0.1543] } },
  { id: 'disprove', clock: '22:41', label: 'Tests its theory, drops it', who: 'agent',
    video: { t: 9.383, rect: [0.1313, 0.3577, 0.7375, 0.1543] } },
  { id: 'cause', clock: '22:44', label: 'Root cause in the real file', who: 'agent',
    video: { t: 11.583, rect: [0.1313, 0.2231, 0.7375, 0.4212] } },
  { id: 'tdd', clock: '22:47', label: 'Test first', who: 'agent',
    video: { t: 13.817, rect: [0.1313, 0.1769, 0.7375, 0.5159] } },
  { id: 'verify', clock: '23:06', label: 'Before and after, in the app', who: 'agent',
    video: { t: 17.717, rect: [0.1313, 0.3577, 0.7375, 0.1543] } },
  { id: 'honest', clock: '23:08', label: 'Says what it didn\'t test', who: 'agent',
    video: { t: 20.417, rect: [0.1363, 0.2932, 0.7275, 0.2825] } },
  { id: 'review', clock: '23:08', label: 'Another model reviews it', who: 'review',
    video: { t: 22.9, rect: [0.1313, 0.3904, 0.7375, 0.0882] } },
  { id: 'prompt', clock: '23:08', label: 'Another model reviews it', who: 'review',
    video: { t: 26.7, rect: [0.2787, 0.1308, 0.59, 0.4608] } },
  { id: 'result', clock: '23:10', label: 'Another model reviews it', who: 'review',
    video: { t: 28.9, rect: [0.1363, 0.3692, 0.7275, 0.3262] } },
  { id: 'merged', clock: '23:17', label: 'Fixed, reviewed again, merged', who: 'agent',
    video: { t: 32.95, rect: [0.1313, 0.3308, 0.7375, 0.5253] } },
]
