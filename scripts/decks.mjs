import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

// name is the npm script suffix (dev:<name>, start:<name>), dir holds slides.md
// and port is what start:<name> listens on.
export const decks = [
  { name: 'coding-agents', title: 'How I develop with coding agents', dir: 'coding-agents', port: 3030 },
  { name: 'database-modernization', title: 'Modernizing databases', dir: 'database-modernization', port: 3030 },
  { name: 'agent-building-blocks', title: 'Skills, tools and agent boundaries', dir: 'agent-building-blocks', port: 3030 },
  { name: 'workshop-intro', title: 'App modernization lab', dir: 'workshop-intro', port: 3030 },
  { name: 'no-slop', title: 'The no slop engineer', dir: 'no-slop-deck', port: 3131 },
]

export function deckArgument(args) {
  const inline = args.find(argument => argument.startsWith('--deck='))
  const index = args.indexOf('--deck')
  return inline?.slice('--deck='.length) ?? (index === -1 ? undefined : args[index + 1])
}

export function findDeck(name) {
  const deck = decks.find(d => d.name === name)
  if (!deck) {
    console.error(`Unknown deck "${name}". Choose one of: ${decks.map(d => d.name).join(', ')}.`)
    process.exit(1)
  }
  return deck
}

// Uses --deck when given, otherwise asks in a terminal.
export async function chooseDeck(args, verb, example) {
  const name = deckArgument(args)
  if (name) return findDeck(name)
  if (!stdin.isTTY) {
    console.error(`Choose a deck explicitly, for example: ${example}`)
    process.exit(1)
  }
  console.log(`\nChoose a deck to ${verb}:\n`)
  decks.forEach((d, index) => console.log(`  ${index + 1}. ${d.title} (${d.name})`))
  const readline = createInterface({ input: stdin, output: stdout })
  const answer = await readline.question('\nDeck number: ')
  readline.close()
  const selected = decks[Number(answer) - 1]
  if (!selected) {
    console.error('No deck selected.')
    process.exit(1)
  }
  return selected
}
