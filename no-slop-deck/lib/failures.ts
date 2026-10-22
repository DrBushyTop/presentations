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
      name: 'The agent guesses instead of looking',
      seen: 'agent: "The guest probably can\'t rebuild a split reply."',
      fix: 'Answer from the code, logs and tickets, with a reference',
    },
    {
      name: 'The agent rereads the system every time',
      seen: '30 files read inside the implementation context',
      fix: 'Research once, hand on a short map',
    },
  ],
  // Design
  [
    {
      name: 'The agent picks what the feature means',
      seen: '11 decisions made in PR review, after the code existed',
      fix: 'Grill the open choices, record them in CONTEXT.md',
    },
    {
      name: 'Only the author understands it',
      seen: '"Why did my session stop recording?" Nobody knows.',
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
      name: 'The agent takes the shortcut',
      seen: 'await db.Database\n  .BeginTransactionAsync(ct);',
      fix: 'Rules that fail locally and say how to fix it',
    },
    {
      name: 'The tests only confirm the code',
      seen: 'Assert.True(\n  frame.Length < 24000);\n// the platform drops > 16 KiB',
      fix: 'Expectations from the decision, and a negative control',
    },
    {
      name: 'Nobody ran it',
      seen: '✓ 2,404 tests passed. The replay never leaves its first screen.',
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
      name: 'The change passes CI and breaks under real traffic',
      seen: 'CREATE INDEX locks writes to orders at 38 a second',
      fix: 'Checks that know production, and a small blast radius',
    },
    {
      name: 'The same mistake comes back next week',
      seen: 'Third correction this month: "use TimeProvider"',
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
  'You run it first, and paste the errors back to the agent',
  'You relay the bot comments and decide when to stop',
  'You repeat last month\'s correction',
]
