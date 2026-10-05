#!/usr/bin/env node
/*
  Layout invariants for Slidev decks that use the Zure theme.

  Usage:
    node scripts/check-slides.mjs [deck ...]      check the named decks
                                                  (a deck is a directory with slides.md,
                                                  or dir/entry.md for another entry file)
    node scripts/check-slides.mjs --staged        the hook: every deck if the theme changed,
                                                  otherwise only decks with staged changes
    node scripts/check-slides.mjs --update-baseline [deck ...]

  Each deck starts in a Slidev dev server, all at once. Slides render in
  parallel browser tabs (CHECK_SLIDES_TABS, default 6) at 1280 x 720 in their
  final click state and are measured in the browser. The rules:

    overflow     visible content leaves the canvas or the 72px side margins
    footer       content enters the footer band or overlaps the citation line
    tiny-text    rendered text is smaller than 14px
    empty-bottom the lowest content ends too high, leaving the lower band empty
    gap          a large empty horizontal band splits the content

  Known violations live in scripts/slide-check-baseline.json, so existing
  decks can be fixed later while new violations still fail the commit.
  Slides opt out of the whitespace rules with `class: allow-whitespace`.
*/
import { spawn, execSync } from 'node:child_process'
import { createServer } from 'node:net'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-chromium'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const baselinePath = join(root, 'scripts', 'slide-check-baseline.json')
const allDecks = ['coding-agents', 'workshop-intro', 'database-modernization', 'agent-building-blocks', 'no-slop-deck']
const deckDir = (deck) => (deck.endsWith('.md') ? dirname(deck) : deck)
const deckEntry = (deck) => (deck.endsWith('.md') ? deck.slice(deckDir(deck).length + 1) : 'slides.md')

const args = process.argv.slice(2)
const updateBaseline = args.includes('--update-baseline')
let decks = args.filter((a) => !a.startsWith('--'))

if (args.includes('--staged')) {
  const files = execSync('git diff --cached --name-only', { cwd: root, encoding: 'utf8' })
    .split('\n').filter(Boolean)
  // A theme or addon change can affect every deck, so check them all. Otherwise check
  // only decks with staged changes. Folders inside a deck that never render
  // as slides don't count.
  const ignored = (f) => f.includes('/demo-app/')
  const sharedPresentationChanged = files.some((f) => f.startsWith('themes/') || f.startsWith('addons/'))
  decks = sharedPresentationChanged ? allDecks : allDecks.filter((d) => files.some((f) => f.startsWith(`${deckDir(d)}/`) && !ignored(f)))
  if (!decks.length) process.exit(0)
}
if (!decks.length) decks = allDecks

// Thresholds, in canvas pixels. The canvas is 1280 x 720.
const RULES = {
  sideMargin: 72,
  footerTop: 680, // footer and logo band
  minFont: 14,
  bottomFill: 0.82, // content must reach 82% of the band between title and citation
  maxGap: 0.24, // no empty band taller than 24% of that space
}

// Ask the OS for an unused port, so parallel runs never collide.
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.unref()
    srv.on('error', reject)
    srv.listen(0, () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

async function startServer(deck, port) {
  const child = spawn('npx', ['slidev', deckEntry(deck), '--port', String(port)], {
    cwd: join(root, deckDir(deck)),
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${deck}: dev server timeout`)), 60000)
    child.stdout.on('data', (d) => {
      if (String(d).includes(`localhost:${port}`)) { clearTimeout(timer); resolve() }
    })
    child.on('exit', (code) => reject(new Error(`${deck}: dev server exited ${code}`)))
  })
  return child
}

// Runs inside the page. Returns a list of { rule, detail }.
function measure(rules) {
  const canvas = document.querySelector('#slide-content')
  const origin = canvas.getBoundingClientRect()
  const scale = origin.width / 1280
  const page = canvas.querySelector('.slidev-page:not([style*="display: none"])') || canvas
  const layout = page.querySelector('.slidev-layout')
  const problems = []
  // Clip each box by scrolling or overflow-hidden ancestors, so code blocks
  // and cropped media are measured by what is actually painted.
  const clipped = (el) => {
    let { left, top, right, bottom } = el.getBoundingClientRect()
    for (let n = el.parentElement; n && n !== canvas; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        const c = n.getBoundingClientRect()
        left = Math.max(left, c.left); top = Math.max(top, c.top)
        right = Math.min(right, c.right); bottom = Math.min(bottom, c.bottom)
      }
    }
    return { left, top, right, bottom, width: right - left, height: bottom - top }
  }
  const rect = (el) => {
    const r = clipped(el)
    return {
      x: (r.left - origin.left) / scale, y: (r.top - origin.top) / scale,
      r: (r.right - origin.left) / scale, b: (r.bottom - origin.top) / scale,
      w: r.width / scale, h: r.height / scale,
    }
  }
  const visible = (el) => {
    for (let n = el; n && n !== page; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false
    }
    const r = clipped(el)
    return r.width > 1 && r.height > 1
  }
  const furniture = (el) => el.closest('.z-footer, .z-brand, .cite, .slidev-note, [class*="zcover"], .zsplit, .zdark')
  const fullBleed = !layout || /\b(cover|zsection|zend)\b/.test(layout.className)
  const optOut = layout && layout.classList.contains('allow-whitespace')

  // Content boxes: elements that paint text, media, borders or backgrounds.
  const boxes = []
  for (const el of page.querySelectorAll('*')) {
    if (!visible(el) || furniture(el)) continue
    const cs = getComputedStyle(el)
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    const media = /^(IMG|SVG|CANVAS|VIDEO|PRE)$/i.test(el.tagName)
    const painted = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0
    if (!ownText && !media && !painted) continue
    if (el === layout) continue
    if (ownText && parseFloat(cs.fontSize) < rules.minFont) {
      problems.push({ rule: 'tiny-text', detail: `${parseFloat(cs.fontSize)}px "${el.textContent.trim().slice(0, 40)}"` })
    }
    boxes.push({ el, ...rect(el) })
  }

  if (!fullBleed) {
    for (const b of boxes) {
      if (b.x < rules.sideMargin - 2 || b.r > 1280 - rules.sideMargin + 2) {
        problems.push({ rule: 'overflow', detail: `${b.el.tagName.toLowerCase()} x ${Math.round(b.x)}–${Math.round(b.r)}` })
      }
      if (b.b > rules.footerTop) {
        problems.push({ rule: 'footer', detail: `${b.el.tagName.toLowerCase()} bottom ${Math.round(b.b)}` })
      }
    }
  }
  for (const b of boxes) {
    if (b.x < -1 || b.y < -1 || b.r > 1281 || b.b > 721) {
      problems.push({ rule: 'overflow', detail: `${b.el.tagName.toLowerCase()} outside canvas` })
    }
  }

  const cite = page.querySelector('.cite')
  const citeTop = cite && visible(cite) ? rect(cite).y : rules.footerTop - 20
  if (cite && visible(cite)) {
    for (const b of boxes) if (b.b > citeTop + 1 && b.y < citeTop) {
      problems.push({ rule: 'footer', detail: `${b.el.tagName.toLowerCase()} overlaps citation` })
    }
  }

  const h1 = layout && layout.querySelector('h1')
  if (!fullBleed && !optOut && h1 && visible(h1)) {
    const top = rect(h1).b
    const band = citeTop - top
    const body = boxes.filter((b) => b.y >= top - 1 && b.b <= citeTop + 1 && !h1.contains(b.el))
    if (body.length) {
      const lowest = Math.max(...body.map((b) => b.b))
      const fill = (lowest - top) / band
      if (fill < rules.bottomFill) {
        problems.push({ rule: 'empty-bottom', detail: `content ends at ${Math.round(lowest)}px, ${Math.round((1 - fill) * 100)}% of the band empty` })
      }
      const spans = body.map((b) => [b.y, b.b]).sort((a, b) => a[0] - b[0])
      let cursor = top
      for (const [y, b] of spans) {
        if (y - cursor > band * rules.maxGap) {
          problems.push({ rule: 'gap', detail: `empty band ${Math.round(cursor)}–${Math.round(y)}px` })
        }
        cursor = Math.max(cursor, b)
      }
    }
  }
  // Collapse duplicates so one wide element does not report per child.
  const seen = new Set()
  return problems.filter((p) => { const k = p.rule + p.detail; return !seen.has(k) && seen.add(k) })
}

// What to do for each rule. Printed once per rule under the failures, so the
// author (human or model) gets a concrete next step, not just a measurement.
const FIXES = {
  'empty-bottom':
    'Make the main exhibit taller so it reaches the citation line: raise row heights or min-height on the diagram, table or cards, or increase their font size. Anchor a takeaway callout just above the citation. Do not add more text to fill space.',
  gap:
    'Remove the empty band. Top-align the content under the title (no vertical centring of a short block), keep a callout directly under the exhibit it summarises, and grow the exhibit instead of spreading it out.',
  overflow:
    'Keep content inside x 72–1208 and inside the canvas. Shorten labels, reduce columns, or let the grid shrink with minmax(0, 1fr). Full-canvas designs must use layout: none with a z* full-bleed wrapper.',
  footer:
    'Content must end above the citation line and the footer band (y 680). Shrink or shorten the exhibit, or move detail into the speaker notes.',
  'tiny-text':
    'Use at least 14px. Enlarge the label, or drop it and say it in the speaker notes. Do not rely on small text the back of the room cannot read.',
}

const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : {}
const TABS = Number(process.env.CHECK_SLIDES_TABS) || 6
const started = Date.now()
const browser = await chromium.launch()
const servers = []
const results = {} // deck -> slide -> problems

try {
  // Start every dev server at once, then count each deck's slides.
  const ports = await Promise.all(decks.map(() => freePort()))
  await Promise.all(decks.map(async (deck, i) => { servers.push(await startServer(deck, ports[i])) }))
  const jobs = []
  for (const [i, deck] of decks.entries()) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(`http://localhost:${ports[i]}/1?embedded=true`, { waitUntil: 'networkidle' })
    const total = await page.evaluate(() => window.__slidev__?.nav?.total ?? 0)
    await page.close()
    results[deck] = { total, slides: {} }
    for (let n = 1; n <= total; n++) jobs.push({ deck, port: ports[i], n })
  }
  console.log(`Checking ${jobs.length} slides in ${decks.join(', ')} with ${TABS} tabs`)

  // Each worker owns one tab. Chromium stops mounting large dev decks after a
  // few dozen full reloads in one tab, so a worker starts a fresh tab every
  // 25 slides and after a failure.
  const worker = async () => {
    let page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    let renders = 0
    const fresh = async () => {
      await page.close()
      page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
      renders = 0
    }
    const render = async ({ port, n }) => {
      await page.goto(`http://localhost:${port}/${n}?embedded=true&clicks=999`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await page.waitForSelector('#slide-content', { timeout: 5000 })
      return page.evaluate(measure, RULES)
    }
    for (let job = jobs.shift(); job; job = jobs.shift()) {
      if (++renders > 25) await fresh()
      let problems
      try {
        problems = await render(job)
      } catch {
        await fresh()
        try {
          problems = await render(job)
        } catch (error) {
          throw new Error(`${job.deck} slide ${job.n} did not render: ${error.message.split('\n')[0]}`)
        }
      }
      results[job.deck].slides[job.n] = problems
    }
    await page.close()
  }
  await Promise.all(Array.from({ length: TABS }, worker))
} finally {
  for (const server of servers) server.kill()
  await browser.close()
}

let failures = 0
const failedRules = new Set()
for (const deck of decks) {
  const { total, slides } = results[deck]
  const found = {}
  for (let n = 1; n <= total; n++) {
    const problems = slides[n] ?? []
    if (problems.length) found[n] = problems.map((p) => p.rule).filter((r, i, a) => a.indexOf(r) === i)
    const known = new Set(baseline[deck]?.[n] ?? [])
    const fresh = problems.filter((p) => !known.has(p.rule))
    for (const p of fresh) console.log(`✗ ${deck} slide ${n} [${p.rule}] ${p.detail}`)
    if (!updateBaseline) {
      failures += fresh.length
      for (const p of fresh) failedRules.add(p.rule)
    }
  }
  if (updateBaseline) baseline[deck] = found
  console.log(`${deck}: ${total} slides checked`)
}
console.log(`Done in ${Math.round((Date.now() - started) / 1000)} s`)

if (updateBaseline) {
  writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + '\n')
  console.log(`Baseline written to ${baselinePath}`)
} else if (failures) {
  console.log(`\n${failures} layout problem(s). How to fix:`)
  for (const rule of failedRules) console.log(`  ${rule}: ${FIXES[rule]}`)
  console.log('\nOnly if the whitespace is a deliberate design choice, add `class: allow-whitespace` to that slide and explain why in its speaker notes. Never edit the thresholds or the baseline to pass.')
  process.exit(1)
}
