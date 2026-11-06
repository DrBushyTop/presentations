#!/usr/bin/env node
// Fetches the hit-marker slide's sound clips if they are missing. They are game
// audio, so they stay gitignored and are never committed.
//
//   node scripts/hill-climb-sounds.mjs           asks before downloading
//   node scripts/hill-climb-sounds.mjs --yes     skips the question
//   node scripts/hill-climb-sounds.mjs --force   replaces existing clips
//
// Needs ffmpeg to trim the clips. Declining or failing is fine: the slide falls
// back to a synthesised tick and a text-to-speech ending.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { fileURLToPath } from 'node:url'

const BASE = 'https://www.myinstants.com/media/sounds'
const MAX_BYTES = 2 * 1024 * 1024
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'hill-climb', 'public', 'sounds')

const clips = [
  { file: 'hit.mp3', label: 'hit marker', url: `${BASE}/hitmarker_1.mp3`, keep: [[0.03, 0.12]] },
  { file: 'ending.mp3', label: 'death yell, then Snake? Snake! Snaaake!', url: `${BASE}/snake-dies-with-game-over.mp3`, keep: [[0.15, 7.2]] },
]

const args = process.argv.slice(2)
const force = args.includes('--force')
const missing = clips.filter(clip => force || !existsSync(join(dir, clip.file)))
if (!missing.length) process.exit(0)

async function confirmed() {
  if (args.includes('--yes') || args.includes('-y')) return true
  if (!stdin.isTTY) {
    console.log('Hit-marker clips are missing. Run npm run sounds:hill-climb to fetch them.')
    return false
  }
  console.log('The hill-climb hit-marker slide can use these clips:')
  for (const clip of missing) console.log(`  ${clip.file}: ${clip.label}\n    ${clip.url}`)
  const rl = createInterface({ input: stdin, output: stdout })
  const answer = await rl.question('Download them? They stay gitignored. [y/N] ')
  rl.close()
  return /^y(es)?$/i.test(answer.trim())
}

function isMp3(bytes) {
  const id3 = bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33
  const frame = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0
  return id3 || frame
}

async function fetchClip(clip, work) {
  const res = await fetch(clip.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const type = res.headers.get('content-type') ?? ''
  if (!type.startsWith('audio/')) throw new Error(`expected audio, got ${type || 'no content type'}`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  if (bytes.length > MAX_BYTES) throw new Error(`${bytes.length} bytes is too large`)
  if (!isMp3(bytes)) throw new Error('not an MP3 file')
  const raw = join(work, `raw-${clip.file}`)
  writeFileSync(raw, bytes)
  const cuts = clip.keep.map(([from, to], i) => `[0]atrim=${from}:${to},asetpts=PTS-STARTPTS[a${i}]`)
  const joined = clip.keep.map((_, i) => `[a${i}]`).join('')
  const filter = `${cuts.join(';')};${joined}concat=n=${clip.keep.length}:v=0:a=1[out]`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-filter_complex', filter, '-map', '[out]', '-ac', '1', '-b:a', '128k', join(dir, clip.file)], { stdio: 'inherit' })
}

if (!await confirmed()) process.exit(0)
mkdirSync(dir, { recursive: true })
const work = mkdtempSync(join(tmpdir(), 'hill-climb-sounds-'))
let failed = 0
for (const clip of missing) {
  try {
    await fetchClip(clip, work)
    console.log(`Saved ${clip.file}`)
  }
  catch (error) {
    failed++
    console.error(`Could not get ${clip.file}: ${error.message}`)
  }
}
rmSync(work, { recursive: true, force: true })
if (failed) console.error('The slide will use its fallback sound for those clips.')
