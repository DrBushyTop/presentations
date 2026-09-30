import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const decks = [
  ['coding-agents', 'How I develop with coding agents'],
  ['database-modernization', 'Modernizing databases'],
  ['agent-building-blocks', 'Skills, tools and agent boundaries'],
  ['workshop-intro', 'App modernization lab'],
  ['no-slop', 'The no slop engineer (click builds)'],
  ['no-slop-split', 'The no slop engineer (split slides)'],
]

const [action, ...args] = process.argv.slice(2)
const deckArgument = args.find((argument) => argument.startsWith('--deck='))
const deckIndex = args.indexOf('--deck')
const deck = deckArgument?.slice('--deck='.length) ?? (deckIndex === -1 ? undefined : args[deckIndex + 1])

if (!['dev', 'start', 'export', 'export-pptx'].includes(action)) {
  console.error('Use this selector with dev, start, export, or export-pptx.')
  process.exit(1)
}

const run = (selectedDeck) => {
  if (!decks.some(([name]) => name === selectedDeck)) {
    console.error(`Unknown deck "${selectedDeck}". Choose one of: ${decks.map(([name]) => name).join(', ')}.`)
    process.exit(1)
  }

  const child = spawn('npm', ['run', `${action}:${selectedDeck}`], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  child.on('exit', (code) => process.exit(code ?? 1))
}

if (deck) {
  run(deck)
} else if (!stdin.isTTY) {
  console.error(`Choose a deck explicitly, for example: npm run ${action}:workshop-intro`)
  process.exit(1)
} else {
  console.log(`\nChoose a deck to ${action}:\n`)
  decks.forEach(([name, title], index) => console.log(`  ${index + 1}. ${title} (${name})`))

  const readline = createInterface({ input: stdin, output: stdout })
  const answer = await readline.question('\nDeck number: ')
  readline.close()

  const selected = decks[Number(answer) - 1]
  if (!selected) {
    console.error('No deck selected.')
    process.exit(1)
  }

  run(selected[0])
}
