import { spawn } from 'node:child_process'
import { chooseDeck } from './decks.mjs'

const [action, ...args] = process.argv.slice(2)

if (!['dev', 'start', 'export', 'export-pptx'].includes(action)) {
  console.error('Use this selector with dev, start, export, or export-pptx.')
  process.exit(1)
}

const deck = await chooseDeck(args, action, `npm run ${action}:workshop-intro`)
const child = spawn('npm', ['run', `${action}:${deck.name}`], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

child.on('exit', code => process.exit(code ?? 1))
