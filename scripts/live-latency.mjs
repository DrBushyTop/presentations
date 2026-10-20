// Measures how long a live viewer takes to show the presenter's slide.
//
//   npm run live:latency -- --deck no-slop --viewer <url> [--steps 40] [--viewers 3]
//
// Needs `npm run live` (or a dev server with the SLIDEV_LIVE_* environment)
// already running. Presenter and viewers run in one local Chromium, so every
// timestamp comes from the same clock:
//   key       presenter keydown
//   publish   dev server sends to the relay (message ts)
//   receive   viewer gets the message
//   paint     first frame after the viewer navigated

import { chromium } from 'playwright-chromium'
import { chooseDeck } from './decks.mjs'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}

const deck = await chooseDeck(args, 'measure', 'npm run live:latency -- --deck no-slop --viewer <url>')
const presenterUrl = option('presenter', `http://localhost:${deck.port}/presenter/1?password=slides`)
const viewerUrl = option('viewer')
const steps = Number(option('steps', 40))
const viewerCount = Number(option('viewers', 1))
const settle = Number(option('settle', 1200))
if (!viewerUrl) {
  console.error('Pass --viewer <url>, for example the output of `npm run live:url`.')
  process.exit(1)
}

// Background pages pause requestAnimationFrame, which would stall the paint
// timestamps. Give every page its own window and keep them all running.
const browser = await chromium.launch({
  args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
})
const newPage = async () => (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage()

const presenter = await newPage()
await presenter.goto(presenterUrl)
await presenter.waitForSelector('.slidev-page', { timeout: 30_000 })
await presenter.evaluate(() => {
  window.__keys = []
  window.addEventListener('keydown', () => window.__keys.push(Date.now()), { capture: true })
})

const viewers = []
for (let i = 0; i < viewerCount; i++) {
  const page = await newPage()
  await page.goto(viewerUrl)
  viewers.push(page)
}
// Nudge the presenter so the relay has a position, then wait for viewers.
await presenter.keyboard.press('ArrowRight')
await presenter.keyboard.press('ArrowLeft')
for (const page of viewers)
  await page.waitForSelector('.slidev-live-cover', { state: 'hidden', timeout: 30_000 })
await presenter.waitForTimeout(settle)

const total = await presenter.evaluate(() => window.__slidev__?.nav?.total ?? 0)
const results = []
let direction = 'ArrowRight'
for (let step = 0; step < steps; step++) {
  const no = await presenter.evaluate(() => window.__slidev__?.nav?.currentSlideNo)
  if (total && no >= total) direction = 'ArrowLeft'
  if (no <= 1) direction = 'ArrowRight'

  const before = await Promise.all(viewers.map(p => p.evaluate(() => window.__slidevLive.trace.length)))
  await presenter.keyboard.press(direction)
  const key = await presenter.evaluate(() => window.__keys.at(-1))

  for (const [i, page] of viewers.entries()) {
    const entry = await page.waitForFunction(
      n => window.__slidevLive.trace.slice(n).find(e => e.painted),
      before[i],
      { timeout: 5_000, polling: 5 },
    ).then(h => h.jsonValue()).catch(() => undefined)
    if (!entry) {
      results.push({ step, viewer: i, missed: true })
      continue
    }
    results.push({
      step,
      viewer: i,
      publish: entry.ts - key,
      relay: entry.recv - entry.ts,
      render: entry.painted - entry.recv,
      total: entry.painted - key,
    })
  }
  // Random gaps, so the measurement does not lock onto a timer.
  await presenter.waitForTimeout(250 + Math.random() * 500)
}

await browser.close()

const ok = results.filter(r => !r.missed)
const pct = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]
}
console.log(`\n${ok.length} samples, ${results.length - ok.length} missed, ${viewerCount} viewer(s)\n`)
console.log('segment     p50    p90    p99    max  (ms)')
for (const segment of ['publish', 'relay', 'render', 'total']) {
  const values = ok.map(r => r[segment])
  const row = [50, 90, 99].map(p => String(pct(values, p)).padStart(6)).join(' ')
  console.log(`${segment.padEnd(8)} ${row} ${String(Math.max(...values)).padStart(6)}`)
}
if (args.includes('--json')) console.log(JSON.stringify(results))
