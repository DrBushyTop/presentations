import { slideTotals } from './timing.mjs'

// This function runs inside the downloaded HTML. It has no external dependencies.
function reportApp() {
  const data = JSON.parse(document.getElementById('report-data').textContent)
  const run = data.session
  const rows = data.rows
  const cuts = new Set(run.selectedCuts)
  const byId = id => document.getElementById(id)
  const element = (tag, className, text) => {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text !== undefined) node.textContent = text
    return node
  }
  const time = ms => {
    const seconds = Math.floor(ms / 1000)
    return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
  }
  const total = rows.reduce((sum, row) => sum + row.elapsedMs, 0)
  const max = Math.max(1, ...rows.map(row => row.elapsedMs))
  const sections = [...new Set(rows.map(row => row.part))]
  byId('deck-title').textContent = run.deck
  document.title = run.deck + ' · Rehearsal report'
  byId('run-date').textContent = new Date(run.startedAt).toLocaleString() + ' · ' + run.status + ' at export'
  byId('total').textContent = time(total)
  byId('target').textContent = run.targetMinutes + ' min'
  const difference = total - run.targetMinutes * 60000
  byId('difference-label').textContent = difference > 0 ? 'Over target' : 'Below target'
  byId('difference').textContent = time(Math.abs(difference))
  const visited = rows.filter(row => row.visits > 0).length
  byId('coverage').textContent = visited + ' / ' + rows.length + ' slides visited. '
    + (visited < rows.length ? 'Partial rehearsal. Unvisited slides have no measured time.' : 'All slides visited.')
  for (const part of sections) {
    const option = element('option', '', part)
    option.value = part
    byId('section-filter').append(option)
  }
  function updateSavings() {
    const cutMs = rows.filter(row => cuts.has(row.no)).reduce((sum, row) => sum + row.elapsedMs, 0)
    byId('cut-time').textContent = time(cutMs)
    byId('remaining').textContent = time(total - cutMs)
    byId('remaining-difference').textContent = (total - cutMs > run.targetMinutes * 60000 ? 'Over target by ' : 'Below target by ')
      + time(Math.abs(total - cutMs - run.targetMinutes * 60000))
  }
  function renderSections() {
    const totals = sections.map(part => ({ part, ms: rows.filter(row => row.part === part).reduce((sum, row) => sum + row.elapsedMs, 0) }))
    const maxSection = Math.max(1, ...totals.map(section => section.ms))
    byId('section-chart').replaceChildren(...totals.map(section => {
      const row = element('div', 'section-row')
      row.append(element('span', '', section.part))
      const track = element('div', 'track')
      const bar = element('div', 'bar')
      bar.style.width = section.ms / maxSection * 100 + '%'
      track.append(bar)
      row.append(track, element('strong', 'duration', time(section.ms)))
      return row
    }))
  }
  function sourceBlock(parent, label, value) {
    parent.append(element('h4', '', label), element('pre', '', value || 'None'))
  }
  function renderSlides() {
    const query = byId('search').value.toLowerCase()
    let filtered = rows.filter(row => (!byId('section-filter').value || row.part === byId('section-filter').value)
      && (!byId('visited-only').checked || row.visits > 0)
      && [row.title, row.part, row.source?.markdown, row.source?.notes].join(' ').toLowerCase().includes(query))
    if (byId('sort').value === 'longest') filtered = [...filtered].sort((a, b) => b.elapsedMs - a.elapsedMs || a.no - b.no)
    const openSlides = new Set([...document.querySelectorAll('details[open]')].map(node => Number(node.dataset.slide)))
    byId('shown').textContent = filtered.length + ' slides shown'
    byId('slides').replaceChildren(...filtered.map(row => {
      const card = element('article', 'slide-card' + (cuts.has(row.no) ? ' potential-cut' : ''))
      const header = element('div', 'slide-heading')
      const title = element('div')
      title.append(element('span', 'eyebrow', 'SLIDE ' + row.no + ' · ' + row.part), element('h3', '', row.title))
      const label = element('label', 'cut-label')
      const checkbox = element('input')
      checkbox.type = 'checkbox'
      checkbox.checked = cuts.has(row.no)
      checkbox.setAttribute('aria-label', 'Mark slide ' + row.no + ' as a potential cut')
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) cuts.add(row.no)
        else cuts.delete(row.no)
        card.classList.toggle('potential-cut', checkbox.checked)
        updateSavings()
      })
      label.append(checkbox, document.createTextNode('Potential cut'))
      header.append(title, label)
      const timing = element('div', 'slide-timing')
      const track = element('div', 'track')
      const bar = element('div', 'bar')
      bar.style.width = row.elapsedMs / max * 100 + '%'
      track.append(bar)
      timing.append(track, element('strong', 'duration', row.visits ? time(row.elapsedMs) : 'Unvisited'))
      const meta = element('p', 'muted', row.visits + ' visits · Cumulative in deck order ' + time(row.cumulativeMs))
      const details = element('details')
      details.dataset.slide = row.no
      details.open = openSlides.has(row.no)
      details.append(element('summary', '', 'Slide content, speaker notes and visits'))
      if (row.source) {
        sourceBlock(details, 'Markdown / slide markup', row.source.markdown)
        sourceBlock(details, 'Speaker notes', row.source.notes)
        sourceBlock(details, 'Frontmatter', row.source.frontmatter)
      } else details.append(element('p', 'muted', 'Slide content was not captured for this older run. New rehearsals include it automatically.'))
      const visits = run.visits.filter(visit => visit.slideNo === row.no)
      details.append(element('h4', '', 'Individual visits'))
      if (!visits.length) details.append(element('p', 'muted', 'No visits recorded.'))
      else {
        const table = element('table')
        const head = element('tr')
        for (const value of ['Visit', 'Started', 'Measured time']) head.append(element('th', '', value))
        const thead = element('thead'); thead.append(head); table.append(thead)
        const body = element('tbody')
        visits.forEach((visit, index) => {
          const tr = element('tr')
          for (const value of [index + 1, new Date(visit.startedAt).toLocaleTimeString(), time(visit.elapsedMs)]) tr.append(element('td', '', value))
          body.append(tr)
        })
        table.append(body); details.append(table)
      }
      card.append(header, timing, meta, details)
      return card
    }))
  }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = element('a')
    link.href = url; link.download = filename; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  function updateRawData() {
    run.selectedCuts = [...cuts]
    byId('raw-data').textContent = JSON.stringify(data, null, 2)
  }
  byId('download-json').addEventListener('click', () => {
    updateRawData()
    download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'rehearsal-data.json')
  })
  byId('save-report').addEventListener('click', () => {
    updateRawData()
    const page = document.documentElement.cloneNode(true)
    page.querySelector('#report-data').textContent = JSON.stringify(data).replaceAll('<', '\\u003c')
    download(new Blob(['<!doctype html>\n' + page.outerHTML], { type: 'text/html;charset=utf-8' }), 'rehearsal-report.html')
  })
  byId('print').addEventListener('click', () => window.print())
  for (const id of ['sort', 'section-filter', 'visited-only']) byId(id).addEventListener('change', renderSlides)
  byId('search').addEventListener('input', renderSlides)
  byId('raw-details').addEventListener('toggle', updateRawData)
  updateSavings(); renderSections(); renderSlides(); updateRawData()
}

export function rehearsalReport(session, now) {
  // Escape '<' so literal slide markup cannot terminate the JSON script element.
  const data = JSON.stringify({ exportedAt: now, session, rows: slideTotals(session, now) }).replaceAll('<', '\\u003c')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rehearsal report</title>
<style>
:root{color-scheme:light;font:16px/1.5 system-ui,sans-serif;color:#18243a;background:#f4f6fa}*{box-sizing:border-box}body{margin:0}main{max-width:1120px;margin:auto;padding:40px 28px 70px}h1{font-size:clamp(28px,4vw,42px);line-height:1.15;margin:8px 0 14px}h2{font-size:23px;margin:0 0 16px}h3{font-size:19px;line-height:1.35;margin:5px 0 0}h4{margin:20px 0 8px}p{margin:8px 0}.eyebrow{font-size:12px;font-weight:700;letter-spacing:.08em;color:#60718c}.muted{color:#60718c;font-size:14px}.top-actions,.filters{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:22px 0}button,input,select{font:inherit}button,select,input[type=search]{border:1px solid #c9d3e3;border-radius:7px;background:#fff;color:#18243a;padding:8px 12px}button{cursor:pointer}button:hover{background:#edf2fa}label{display:flex;align-items:center;gap:8px}input[type=checkbox]{accent-color:#be4148;width:17px;height:17px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:24px 0 12px}.metric,.panel,.slide-card{background:#fff;border:1px solid #dfe5ef;border-radius:12px;padding:20px}.metric span,.metric strong{display:block}.metric span{font-size:14px;color:#60718c}.metric strong{font-size:29px}.cut-summary{background:#eaf1fb;padding:16px 20px;border-radius:9px;margin:18px 0 28px}.cut-summary strong{font-variant-numeric:tabular-nums}.panel{margin:24px 0}.section-row{display:grid;grid-template-columns:220px 1fr 80px;gap:16px;align-items:center;margin:12px 0}.track{height:18px;border-radius:5px;background:#e7edf5;overflow:hidden}.bar{height:100%;background:#2d7ca7;border-radius:5px;min-width:0}.duration{text-align:right;font-variant-numeric:tabular-nums}.filters label{font-size:14px}.filters input[type=search]{flex:1;min-width:220px}.slide-card{margin:14px 0}.slide-heading{display:flex;justify-content:space-between;align-items:start;gap:20px}.cut-label{font-size:14px;white-space:nowrap;margin-top:5px}.slide-timing{display:grid;grid-template-columns:1fr 95px;gap:16px;align-items:center;margin-top:18px}.potential-cut{border-color:#d98a8e;background:#fffafa}.potential-cut .bar{background:#be4148}details{margin-top:14px;border-top:1px solid #e1e7f0;padding-top:12px}summary{cursor:pointer;color:#315f90;font-weight:600}pre{font:13px/1.6 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;background:#f2f5fa;border:1px solid #e1e7f0;border-radius:8px;padding:16px;max-height:460px;overflow:auto}table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:8px;text-align:left;border-bottom:1px solid #dfe5ef}a{color:#315f90}footer{margin-top:28px}@media(max-width:700px){main{padding:24px 16px}.metrics{grid-template-columns:repeat(2,1fr)}.section-row{grid-template-columns:120px 1fr 60px;gap:8px}.slide-heading{flex-direction:column;gap:8px}.filters{align-items:stretch;flex-direction:column}}@media print{body{background:white}main{max-width:none;padding:0}.top-actions,.filters,.cut-label{display:none}.slide-card{break-inside:avoid}pre{max-height:none}.panel,.metric{break-inside:avoid}}
</style></head><body><main>
<header><span class="eyebrow">REHEARSAL REPORT</span><h1 id="deck-title"></h1><p id="run-date" class="muted"></p></header>
<div class="top-actions"><button id="save-report">Save report with selected cuts</button><button id="download-json">Download raw data</button><button id="print">Print / save PDF</button></div>
<div class="metrics"><div class="metric"><span>Measured total</span><strong id="total"></strong></div><div class="metric"><span>Target</span><strong id="target"></strong></div><div class="metric"><span id="difference-label"></span><strong id="difference"></strong></div><div class="metric"><span>Potential cuts</span><strong id="cut-time"></strong></div></div>
<p id="coverage" class="muted"></p><div class="cut-summary">After selected cuts <strong id="remaining"></strong> · <span id="remaining-difference"></span><p class="muted">Savings use this rehearsal's measured times. Revisited slides include every visit.</p></div>
<section class="panel" aria-label="Section timing chart"><h2>Time by section</h2><div id="section-chart"></div></section>
<section aria-label="Slide timing chart"><h2>Time by slide</h2><p class="muted">Bars compare total time per slide. Red marks a potential cut. Open a slide to read its raw content and visit timings.</p>
<div class="filters"><label>Sort <select id="sort"><option value="deck">Deck order</option><option value="longest">Longest first</option></select></label><label>Section <select id="section-filter"><option value="">All sections</option></select></label><input id="search" type="search" aria-label="Search slide content" placeholder="Search titles, content and notes"><label><input type="checkbox" id="visited-only">Visited only</label></div><p id="shown" class="muted"></p><div id="slides"></div></section>
<details id="raw-details"><summary>Full raw rehearsal data</summary><pre id="raw-data"></pre></details>
<footer class="muted">Cumulative timings follow deck order, including revisits. This report contains the content captured when the rehearsal began. Editing cuts here changes this report, not the presentation.</footer>
</main><script id="report-data" type="application/json">${data}</script><script>(${reportApp.toString()})();</script></body></html>`
}
