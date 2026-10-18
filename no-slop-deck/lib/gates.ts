// The agenda map and part dividers share these names. The map shows the
// questions; the dividers take theirs from slides.md.
// Divider logs illustrate each phase's work. They are not recorded agent runs.
export const gates: { name: string, q: string, stream: { t: string }[] }[] = [
  {
    name: 'Research',
    q: 'What does the code do today?',
    stream: [
      { t: 'Session identifies a user and team' },
      { t: 'List route supplies the team filter' },
      { t: 'No export route exists yet' },
    ],
  },
  {
    name: 'Design',
    q: 'What are we actually building?',
    stream: [
      { t: 'Ask about the open decisions' },
      { t: 'Explore code for factual answers' },
      { t: 'Record decisions in CONTEXT.md' },
    ],
  },
  {
    name: 'Slice',
    q: 'What can someone see and check today?',
    stream: [
      { t: 'Thin UI → API → data path' },
      { t: 'Check one usable behavior' },
      { t: 'Add the next vertical slice' },
    ],
  },
  {
    name: 'Verify',
    q: 'Which claim did we actually test?',
    stream: [
      { t: 'Run types, lints and tests locally' },
      { t: 'Check the agreed behavior' },
      { t: 'Break it: the check must fail' },
    ],
  },
  {
    name: 'Review',
    q: 'What still needs your eyes?',
    stream: [
      { t: 'Subagents review the slice' },
      { t: 'PR bots add a second opinion' },
      { t: 'Stop by the written rule' },
    ],
  },
  {
    name: 'Production',
    q: 'Who watches it, and what stops it?',
    stream: [
      { t: 'Roll out behind a flag' },
      { t: 'Watch the agreed signals' },
      { t: 'Stop or roll back on failure' },
    ],
  },
]
