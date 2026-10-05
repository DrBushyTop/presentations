import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createSession, enterSlide, checkpoint, pause, resume, finish, slideTotals, toCsv } from './timing.mjs'
const slides = [{ no: 1, title: 'First, "slide"', part: 'Opening' }, { no: 2, title: 'Second', part: 'Opening' }, { no: 3, title: 'Skipped', part: 'End' }]

test('clicks stay on a slide, backward visits add time, and finish includes the last slide', () => {
  const session = createSession('Test', slides, 60, 0)
  resume(session, 1, 0)
  enterSlide(session, 1, 500)
  enterSlide(session, 2, 2000)
  enterSlide(session, 1, 5000)
  finish(session, 9000)
  assert.deepEqual(slideTotals(session, 20000).map(s => [s.elapsedMs, s.visits]), [[6000, 2], [3000, 1], [0, 0]])
})

test('pauses, navigation while paused, and checkpoint recovery exclude interruptions', () => {
  const session = createSession('Test', slides, 60, 0)
  resume(session, 1, 0)
  checkpoint(session, 1000)
  pause(session, 2000)
  enterSlide(session, 2, 4000)
  resume(session, 2, 10000)
  checkpoint(session, 12000)
  // Recovery uses saved durations and never adds time spent with the page closed.
  const recovered = JSON.parse(JSON.stringify(session))
  recovered.status = 'paused'
  resume(recovered, 2, 50000)
  finish(recovered, 53000)
  assert.deepEqual(slideTotals(recovered, 60000).map(s => s.elapsedMs), [2000, 5000, 0])
  assert.match(toCsv(recovered, 60000), /"First, ""slide"""/)
})

test('HTML report embeds content and raw visits without allowing markup to escape its data block', async () => {
  const { rehearsalReport } = await import('./report.mjs')
  const source = { markdown: '# Raw <slide>\n</script><script>alert(1)</script>', notes: 'Rehearsal notes', frontmatter: '{"clicks": 3}' }
  const session = createSession('Talk <&>', [{ no: 1, title: 'Title <&>', part: 'Opening', source }, ...slides.slice(1)], 60, 0)
  resume(session, 1, 0)
  enterSlide(session, 2, 1000)
  enterSlide(session, 1, 2000)
  finish(session, 5000)
  session.selectedCuts = [1]
  const html = rehearsalReport(session, 5000)
  const embedded = html.match(/<script id="report-data" type="application\/json">(.*?)<\/script>/s)[1]
  assert.ok(!embedded.includes('<'))
  const data = JSON.parse(embedded)
  assert.deepEqual(data.session.slides[0].source, source)
  assert.deepEqual(data.rows.map(row => [row.elapsedMs, row.visits]), [[4000, 2], [1000, 1], [0, 0]])
  assert.deepEqual(data.session.selectedCuts, [1])
  assert.ok(!html.includes('<script src=') && !html.includes('<link '))
})
