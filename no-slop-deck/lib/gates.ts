// The six gates of the talk. The agenda map and every part divider read this.
// `dur` is the part's length from the speaker notes. `stream` holds lines the
// gate checks. The divider's log shows the first three that pass, so keep
// those free of later reveals.
type Line = { t: string, held?: string }

export const gates: { name: string, q: string, dur: string, stream: Line[] }[] = [
  {
    name: 'Research',
    dur: '5m',
    q: 'What do we actually know?',
    stream: [
      { t: 'listTasks scopes by session.teamId' },
      { t: 'The CSV helper escapes commas' },
      { t: 'A task belongs to exactly one team' },
      { t: 'findTasks takes any where clause' },
      { t: 'Export can reuse findTasks as is', held: 'unverified' },
      { t: 'Every route reads the session team', held: 'assumption' },
      { t: 'Due dates are stored in UTC' },
      { t: 'Admins can list every team' },
    ],
  },
  {
    name: 'Plan',
    dur: '7m 30s',
    q: 'Which decision is still open?',
    stream: [
      { t: 'Add GET /tasks/export as CSV' },
      { t: 'Reuse the task serializer' },
      { t: 'Out of scope: jobs, streaming' },
      { t: 'Accept teamId to filter', held: 'nobody decided' },
      { t: 'Team comes from the session only' },
      { t: 'Forged teamId still gets 2 rows' },
      { t: 'Add a format option', held: 'not asked for' },
      { t: 'Evidence: a two-team check' },
    ],
  },
  {
    name: 'Slice',
    dur: '4m 45s',
    q: 'How do we cut the work?',
    stream: [
      { t: '1: Export button on fixture data' },
      { t: '2: Real query, team boundary' },
      { t: 'Database first, UI on day four', held: 'nothing to see' },
      { t: '3: Escaping and headers' },
      { t: '4: Stream large exports' },
      { t: 'Rename 40 files in this PR', held: 'own PR' },
      { t: 'Each slice ends in a check' },
      { t: 'Export stays behind a flag' },
    ],
  },
  {
    name: 'Verify',
    dur: '6m 45s',
    q: 'Which claim did we test?',
    stream: [
      { t: 'exports the CSV header' },
      { t: "exports my team's tasks" },
      { t: 'escapes commas in titles' },
      { t: '24 passed, 0 failed', held: 'which claim?' },
      { t: 'forged teamId: 0 foreign rows' },
      { t: 'fails with the filter removed' },
      { t: 'snapshot matches output', held: 'same assumption' },
      { t: 'Team A gets exactly 2 rows' },
    ],
  },
  {
    name: 'Review',
    dur: '11m 45s',
    q: 'When do we stop?',
    stream: [
      { t: 'CSV cell runs a formula' },
      { t: 'Consider handling errors', held: 'no repro' },
      { t: 'All rows load into memory' },
      { t: 'Rename toRow to rowFor', held: 'style' },
      { t: 'Boundary checks still pass' },
      { t: 'Approval predates last commit', held: 'stale' },
      { t: 'Round 2: nothing above the bar' },
      { t: 'Stop. Two fixes, both checked' },
    ],
  },
  {
    name: 'Production',
    dur: '14m',
    q: 'What stops a bad rollout?',
    stream: [
      { t: 'flag on: team-a' },
      { t: 'foreign rows in exports: 0' },
      { t: 'p95 export latency 180 ms' },
      { t: 'orders index blocks writes', held: 'no-go' },
      { t: 'flag on: all teams' },
      { t: 'error rate 0.2%' },
      { t: 'rollback rehearsed' },
      { t: 'author watching until 17:00' },
    ],
  },
]
