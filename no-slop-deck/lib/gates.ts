// The agenda and part dividers share these names and questions.
// Divider logs illustrate each phase's work. They are not recorded agent runs.
export const gates: { name: string, q: string, stream: { t: string }[] }[] = [
  {
    name: 'Research',
    q: 'How does the system work today?',
    stream: [
      { t: 'Session identifies a user and team' },
      { t: 'List route supplies the team filter' },
      { t: 'No export route exists yet' },
    ],
  },
  {
    name: 'Design',
    q: 'Which decision is still open?',
    stream: [
      { t: 'Ask about the open decisions' },
      { t: 'Explore code for factual answers' },
      { t: 'Record decisions in CONTEXT.md' },
    ],
  },
  {
    name: 'Slice',
    q: 'How do we cut the work?',
    stream: [
      { t: 'Thin UI → API → data path' },
      { t: 'Check one usable behavior' },
      { t: 'Add the next vertical slice' },
    ],
  },
  {
    name: 'Verify',
    q: 'Which claim did we test?',
    stream: [
      { t: 'Run types, lints and tests locally' },
      { t: 'Check the agreed behavior' },
      { t: 'Break it: the check must fail' },
    ],
  },
  {
    name: 'Review',
    q: 'When do we stop?',
    stream: [
      { t: 'Local subagents review the diff' },
      { t: 'PR bots add a second opinion' },
      { t: 'Fix within the agreed budget' },
    ],
  },
  {
    name: 'Production',
    q: 'What stops a bad rollout?',
    stream: [
      { t: 'Roll out behind a flag' },
      { t: 'Watch the agreed signals' },
      { t: 'Stop or roll back on failure' },
    ],
  },
]
