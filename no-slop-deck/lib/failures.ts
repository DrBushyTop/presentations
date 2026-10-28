// Where you're the bottleneck at each gate, and what goes wrong if you step
// out with nothing in your place. The part's own slides are the fix, so the
// opener doesn't name it. The slide title is the bottleneck.
// Each one reads aloud as two sentences: "Today, `you`. If you stop, `name`."
// `from` and `ask` are what reaches you (`fromIcon` defaults to the bot).
// `evidence` is one line that shows the failure without any backstory; where
// it came from is in the slide's notes.
export interface Relay {
  from: string
  fromIcon?: string
  ask: string
  you: string
  name: string
  evidence: string
  code?: boolean
}

export const relays: Relay[] = [
  // Research
  {
    from: 'Issue',
    fromIcon: 'ticket',
    ask: 'Large replies end the run.',
    you: 'You pull the failing runs from telemetry and paste them in',
    name: 'Research stops where the code stops',
    evidence: 'Does the platform cap one message? The code can\'t say.',
  },
  // Design
  {
    from: 'Agent',
    ask: 'Free text, or named states?',
    you: 'You answer in a chat nobody else reads',
    name: 'The agent decides for you',
    evidence: '11 product decisions, made after the code existed.',
  },
  // Slice
  {
    from: 'Agent',
    ask: 'Feature implemented.',
    you: 'You click it for the first time',
    name: 'There\'s nothing to click until the end',
    evidence: '1. Database\n2. API\n3. UI',
    code: true,
  },
  // Verify
  {
    from: 'Agent',
    ask: 'Done, 2,404 tests pass.',
    you: 'You open the app and paste the error back',
    name: 'Nobody runs it',
    evidence: 'The app doesn\'t even start.',
  },
  // Review
  {
    from: 'CodeRabbit',
    ask: 'Potential issue, Major',
    you: 'You copy it to the agent, and judge if it\'s real',
    name: 'The agent obeys every bot',
    evidence: 'It fixes a bug that isn\'t there.',
  },
  // Production
  {
    from: 'Agent',
    ask: 'PR ready, +312 −40.',
    you: 'You read every line and picture production',
    name: 'It breaks under real traffic',
    evidence: 'Spotify: "An automated dependency upgrade passed our checks, but still failed in production."',
  },
]
