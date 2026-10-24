// Where you're the bottleneck at each gate, and what goes wrong if you step
// out with nothing in your place. The part's own slides are the fix, so the
// opener doesn't name it. The slide title is the bottleneck.
// `from` and `ask` are what reaches you (`fromIcon` defaults to the bot), and
// `you` is what you do with it. `name` is the failure once you stop, and
// `source`, `evidence` and `note` are the artifact that shows it. Verify has
// two rows: the structure half and the run-it half.
export interface Relay {
  from: string
  fromIcon?: string
  ask: string
  you: string
  name: string
  icon: string
  source: string
  evidence: string
  code?: boolean
  note?: string
}

export const relays: Relay[][] = [
  // Research
  [
    {
      from: 'Issue',
      fromIcon: 'ticket',
      ask: 'Large replies end the run.',
      you: 'You pull the failing runs from telemetry and paste them in',
      name: 'It stops where the code stops',
      icon: 'file',
      source: 'research.md, testing-harness',
      evidence: 'The limits cap whole replies, not one message.',
      note: 'Is one message capped? The code can\'t say.',
    },
  ],
  // Design
  [
    {
      from: 'Agent',
      ask: 'Free text, or named states?',
      you: 'You answer in a chat nobody else reads',
      name: 'The agent decides for you',
      icon: 'branch',
      source: 'PR #364, testing-harness',
      evidence: '"Owner decision (October 16 PR review, Q9)…"',
      note: '11 decisions made after the code existed',
    },
  ],
  // Slice
  [
    {
      from: 'Agent',
      ask: 'Feature implemented.',
      you: 'You click it for the first time',
      name: 'Nothing to click until the end',
      icon: 'ticket',
      source: 'The agent\'s plan',
      evidence: '1. Database\n2. API\n3. UI',
      code: true,
      note: 'The first click comes after the last layer',
    },
  ],
  // Verify
  [
    {
      from: 'Agent',
      ask: 'Added it to the main file.',
      you: 'You point it to the folder structure you want, again',
      name: 'Every agent piles onto one file',
      icon: 'file',
      source: 'Poteto\'s app at SpaceX AI, early on',
      evidence: '8 god files, each over 10,000 lines',
      note: 'Every agent appended, because it was the easy thing',
    },
    {
      from: 'Agent',
      ask: 'Done, 2,404 tests pass.',
      you: 'You open the app and paste the error back',
      name: 'Nobody runs it',
      icon: 'check',
      source: 'The test run',
      evidence: '✓ 2,404 tests passed',
      code: true,
      note: 'The app doesn\'t even start',
    },
  ],
  // Review
  [
    {
      from: 'CodeRabbit',
      ask: 'Potential issue, Major',
      you: 'You copy it to the agent, and judge if it\'s real',
      name: 'The agent obeys every bot',
      icon: 'bot',
      source: 'CodeRabbit on T3 Code #11354',
      evidence: '"Selection won\'t move in inputs."',
      note: 'It does move. A blind fix changes code that worked.',
    },
  ],
  // Production
  [
    {
      from: 'Agent',
      ask: 'PR ready, +312 −40.',
      you: 'You read every line and picture production',
      name: 'It breaks under real traffic',
      icon: 'globe',
      source: 'Spotify Engineering, September 2026',
      evidence: '"An automated dependency upgrade passed our checks, but still failed in production, impacting end users."',
    },
  ],
]
