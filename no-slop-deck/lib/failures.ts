// How agent work goes wrong, grouped by the gate that catches it cheapest.
// The overview slide lists the names; each part opens with its own entries.
// `seen` is what the failure looks like when it happens. `fix` names the
// practice the part goes on to show.
export interface Failure {
  name: string
  seen: string
  fix: string
}

export const failures: Failure[][] = [
  // Research
  [
    {
      name: 'It guesses instead of looking',
      seen: 'agent: "The list probably hides done tasks."',
      fix: 'Answer from the code, logs and tickets, with a reference',
    },
    {
      name: 'It rediscovers the system every time',
      seen: '30 files read inside the implementation context',
      fix: 'Research once, hand on a short map',
    },
  ],
  // Design
  [
    {
      name: 'It picks the meaning of the feature',
      seen: 'agent: "I assumed the export includes all tasks."',
      fix: 'Grill the open choices, record them in CONTEXT.md',
    },
    {
      name: 'Only the author understands it',
      seen: '"Why does the export skip done tasks?" Nobody knows.',
      fix: 'Review the plan as a team, before the code',
    },
  ],
  // Slice
  [
    {
      name: 'Everything is built before anyone looks',
      seen: 'Day 4, 38 files: the first time anyone clicks it',
      fix: 'A thin working path on day one',
    },
    {
      name: 'Small changes get waved through',
      seen: '+4 −0 · migration · approved in 40 seconds',
      fix: 'Review by blast radius, not line count',
    },
  ],
  // Verify
  [
    {
      name: 'It takes the shortcut',
      seen: "import { db } from '../server/storage'",
      fix: 'Rules that fail locally and say how to fix it',
    },
    {
      name: 'The tests only confirm the code',
      seen: 'expect(toCsv(rows))\n  .toEqual(toCsv(rows))',
      fix: 'Expectations from the decision, and a negative control',
    },
    {
      name: 'Nobody ran it',
      seen: '✓ 3 tests passed. The button downloads an empty file.',
      fix: 'The agent runs the app and checks it like a user',
    },
  ],
  // Review
  [
    {
      name: 'The review is a rubber stamp',
      seen: '1,940 lines · "LGTM" · approved in 2 minutes',
      fix: 'Agents review each slice first. You watch the clip.',
    },
    {
      name: 'The review loop never ends',
      seen: 'Round 6: two bots undo each other\'s fixes',
      fix: 'A written stop rule and a budget',
    },
  ],
  // Production
  [
    {
      name: 'It passes CI and breaks under real traffic',
      seen: 'CREATE INDEX locks writes to orders at 38 a second',
      fix: 'Checks that know production, and a small blast radius',
    },
    {
      name: 'The same mistake comes back next week',
      seen: 'Third review comment this month: "don\'t append to app.ts"',
      fix: 'Turn the correction into a check',
    },
  ],
]

// Where you're the bottleneck at each gate: the job the part hands to the
// agent or the environment.
export const bottlenecks: string[] = [
  'You answer the questions the code could answer',
  'Only you know what was decided',
  'You review four days of work in one sitting',
  'You are the first to run it, and you copy the errors back',
  'You relay the bot comments and decide when to stop',
  'You repeat last month\'s review comment',
]
