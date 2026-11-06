// Every number on the slides, with where it came from. The per-round scores
// live in rounds.json, parsed from the council reports in
// ~/zpotlight-ui-programme/scratchpad/council/round-*/{opus,sol}.md and
// weighted with each member's own frozen weights across all 22 rounds.

// Blind calibration, scratchpad/calibration.md. Tip bec7ac1f, master f56ded3b.
export const calibration = {
  rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
  names: ['Capture', 'Replay', 'Sessions', 'Findings', 'Results', 'Evidence', 'Search', 'Shell', 'Setup'],
  opus: {
    tip: [8.9, 8.9, 8.6, 8.9, 8.8, 8.9, 8.8, 8.7, 8.7],
    repeat: [9.0, 8.9, 8.7, 9.0, 9.1, 8.9, 8.9, 8.8, 8.7],
    master: [6.5, 6.3, 7.3, 7.5, 6.5, 6.9, 7.5, 7.7, 7.8],
    overall: { tip: 8.825, repeat: 8.91, master: 6.995, gain: 1.87, noise: 0.085 },
    beat: { tip: 6, repeat: 6, master: 0 },
  },
  sol: {
    tip: [8.5, 8.8, 8.6, 8.7, 8.7, 8.7, 8.3, 8.5, 8.2],
    repeat: [8.3, 8.7, 8.3, 8.7, 8.5, 8.5, 8.4, 8.5, 8.3],
    master: [7.0, 7.5, 7.9, 7.8, 7.5, 7.8, 8.3, 8.2, 7.6],
    overall: { tip: 8.62, repeat: 8.499, master: 7.617, gain: 0.94, noise: 0.121 },
    beat: { tip: 2, repeat: 1, master: 0 },
  },
}

// Frozen benchmark scores, council/frozen-{opus,sol}.md (each member's round 12).
export const frozen = {
  opus: { A: 8.8, B: 8.6, C: 8.2, D: 9.0, E: 8.3, F: 8.6, G: 8.1, H: 9.0 },
  sol: { A: 9.0, B: 8.6, C: 8.3, D: 8.9, E: 8.8, F: 8.8, G: 8.4, H: 8.6 },
}

// Row table from council/round-1/opus.md.
export const roundOne = [
  { row: 'A', name: 'Capturing observations', rival: 'Frame.io', c: [6.5, 5, 4.5, 5.5, 6.5], all: 5.5, best: 8.8 },
  { row: 'B', name: 'Reading a session', rival: 'Sentry', c: [6.5, 6, 4.5, 6, 7], all: 6.0, best: 8.3 },
  { row: 'C', name: 'Sessions list', rival: 'Sentry', c: [8, 8, 6.5, 8, 7.5], all: 7.6, best: 7.7 },
  { row: 'D', name: 'Findings triage', rival: 'Linear', c: [7.5, 6, 5, 7.5, 7], all: 6.6, best: 8.9 },
  { row: 'E', name: 'Task results', rival: 'Maze', c: [6, 5.5, 5, 7, 6.5], all: 5.7, best: 8.4 },
  { row: 'F', name: 'Evidence, transcript', rival: 'Condens', c: [7, 6, 6, 7, 6.5], all: 6.5, best: 8.4 },
  { row: 'G', name: 'Search', rival: 'Condens', c: [7.5, 6.5, 7.5, 5.5, 7.5], all: 6.9, best: 7.8 },
  { row: 'H', name: 'Shell, navigation', rival: 'Linear', c: [7, 6.5, 6.5, 7, 7.5], all: 6.9, best: 9.0 },
  { row: 'I', name: 'Setup surfaces', rival: 'none', c: [7.5, 6.5, 7, 8, 7.2], all: 7.3, best: null },
]
export const criteria = ['Clarity', 'Density', 'Speed', 'Feedback', 'Craft']

// Opus's first-ranked change each round, by the row it names.
export const firstAsk = ['A', 'A', 'D', 'B', 'D', 'D', 'D', 'A', 'E', 'B', 'B', 'A', 'A', 'E', 'A', 'A', 'H', 'A', 'D', 'E', 'F', 'B']

// Opus's first-ranked change, shortened from each council/round-N/opus.md.
export const askText = [
  'Freeze the moment. Add keys.', 'Entry focus', 'The Reader list cuts titles', 'The event list',
  'One way to decide on drafts', 'One way to decide', 'The Reader rail', 'Space and arrows after a click',
  'Answer "where" above the fold', 'Show the page', 'Remove the 5-second stall', 'Make a click do something',
  'Stop losing a written note', 'Every link keeps the way back', "Refused leave: don't take the keyboard", 'Writing from full screen',
  'A draft bar on every page', 'Writing from Player only', 'Give evidence a key', 'Run strip in the first screen',
  'The Evidence tab crops itself', 'Friction navigation',
]

// The top item in the reports, shortened. Round folders hold the full text.
export const asks = [
  { round: 1, opus: 'Freeze the moment. Add keys.', sol: 'Citations scroll the whole document' },
  { round: 5, opus: 'One way to decide on drafts', sol: 'Put the reasons beside the result' },
  { round: 11, opus: 'Remove the 5-second stall', sol: 'Give the replay more width' },
  { round: 13, opus: 'Stop losing a written note', sol: 'Pin at x420. Writing field at x840.' },
  { round: 17, opus: 'One draft bar on every page', sol: 'One scope for the headline' },
  { round: 21, opus: 'The Evidence tab crops itself', sol: 'Give task paths real names' },
]

// Measured in thread 'Review UI Redesign Workflow Efficiency' (rounds 5 to 14).
export const fanOut = {
  fan: { build: 48, join: 42 },
  single: { build: 145, join: 15 },
  lanes: { build: 50, join: 18 },
}
export const gaps = { rounds: [14, 15, 16, 17, 18, 19, 20, 21], minutes: [98, 87, 150, 148, 133, 182, 147, 114] }

// Diff review High findings, rounds 18 to 22.
export const highs = [0, 0, 2, 2, 4]
// git diff pre-council-ui-stack origin/master, web/src production code.
export const lines = { added: 17344, removed: 4028 }

// List-price cost from the T3 state DB on both machines. m1: 225 threads,
// $1,327.33. m4: 21 lane threads, $211.68, all Claude implementation, excluding
// two cancelled turns with no usage data (session logs put m4 at $216.53).
// Sol prices are from secondary sources.
export const cost = {
  note: 'm1 and m4, list price',
  rows: [
    { name: 'Implementation', value: 1133.51, lead: true, claude: 1133.51, gpt: 0 },
    { name: 'Council', value: 214.83, claude: 161.03, gpt: 53.8 },
    { name: 'Orchestrator', value: 137.8, claude: 137.8, gpt: 0 },
    { name: 'Review', value: 52.87, claude: 14.52, gpt: 38.35 },
  ],
  claude: 1446.86,
  gpt: 92.15,
}

// Cumulative list-price spend when each council reported, rounds 1 to 22, both
// machines. Each provider turn goes to the next council after it finished, and
// a council's own cost goes to its round. m4 lanes go by start time. Calibration
// and later work bring the climb to $1,476.
export const spendByRound = [11, 87, 150, 227, 287, 336, 391, 433, 481, 539, 603, 659, 711, 758, 797, 851, 930, 1012, 1078, 1158, 1226, 1298]
