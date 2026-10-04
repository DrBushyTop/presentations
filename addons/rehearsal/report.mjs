import { slideTotals } from './timing.mjs'

// This function runs inside the downloaded HTML. It has no external dependencies.
// Keep the closing script tag sequence out of this source, because the function
// is inlined into a script element.
function reportApp() {
  const data = JSON.parse(document.getElementById('report-data').textContent)
  const run = data.session
  const deckName = run.deck || 'Presentation'
  const rows = data.rows
  const cuts = new Set(run.selectedCuts)
  const targetMs = run.targetMinutes * 60000
  const QUICK_MS = 5000
  const $ = id => document.getElementById(id)

  function h(tag, props, ...children) {
    const node = document.createElement(tag)
    for (const [key, value] of Object.entries(props || {})) {
      if (value === undefined || value === null || value === false) continue
      if (key === 'class') node.className = value
      else if (key === 'style') for (const [name, v] of Object.entries(value)) node.style.setProperty(name, v)
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value)
      else if (key === 'checked' || key === 'value' || key === 'open') node[key] = value
      else node.setAttribute(key, value === true ? '' : value)
    }
    node.append(...children.flat(Infinity).filter(child => child !== null && child !== undefined && child !== false))
    return node
  }
  function svg(tag, attrs, ...children) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag)
    for (const [key, value] of Object.entries(attrs || {})) if (value !== undefined) node.setAttribute(key, value)
    node.append(...children.flat(Infinity).filter(Boolean))
    return node
  }

  const pad = n => String(n).padStart(2, '0')
  function clock(ms) {
    // Minutes keep counting past 60 so a run reads directly against its target.
    const seconds = Math.floor(Math.max(0, ms) / 1000)
    return Math.floor(seconds / 60) + ':' + pad(seconds % 60)
  }
  const sumMs = list => list.reduce((sum, row) => sum + row.elapsedMs, 0)
  const pctOf = (ms, scale) => (ms / scale * 100) + '%'
  const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's')

  // Derived figures
  const total = sumMs(rows)
  const scaleMs = Math.max(total, targetMs, 1)
  const pct = ms => pctOf(ms, scaleMs)
  for (const row of rows) row.startMs = row.cumulativeMs - row.elapsedMs
  const byNo = new Map(rows.map(row => [row.no, row]))
  const visited = rows.filter(row => row.visits > 0)
  const unvisited = rows.filter(row => row.visits === 0)
  const palette = [['#037f91', '#fff'], ['#d99a00', '#1a1a1a'], ['#4f5bd5', '#fff'], ['#3b9550', '#fff'],
    ['#a3489a', '#fff'], ['#05b4cc', '#1a1a1a'], ['#7f8f00', '#fff'], ['#9a5b2e', '#fff'], ['#5a6b85', '#fff'],
    ['#d0679f', '#fff'], ['#2a8f7f', '#fff'], ['#7a4fc4', '#fff']]
  const colorOf = {}
  let paletteIndex = 0
  const parts = [...new Set(rows.map(row => row.part))]
  // 'Other' holds slides before the first `part`; grey keeps it out of the way unless it is the only section.
  for (const part of parts) colorOf[part] = part === 'Other' && parts.length > 1 ? ['#8a8f98', '#fff'] : palette[paletteIndex++ % palette.length]
  const colorVars = part => ({ '--c': colorOf[part][0], '--fg': colorOf[part][1] })
  // Contiguous runs of slides in the same section, in deck order.
  const sections = []
  for (const row of rows) {
    const last = sections.at(-1)
    if (last && last.part === row.part) last.rows.push(row)
    else sections.push({ part: row.part, rows: [row], startMs: row.startMs })
  }
  for (const section of sections) section.ms = sumMs(section.rows)
  const visits = run.visits
  const firstStart = visits[0]?.startedAt ?? run.startedAt
  const lastEnd = run.status === 'running' ? data.exportedAt
    : run.finishedAt ?? visits.at(-1)?.endedAt ?? visits.at(-1)?.checkpointAt ?? firstStart
  const wallMs = Math.max(0, lastEnd - firstStart)
  const pausedMs = Math.max(0, wallMs - total)
  const sortedTimes = visited.map(row => row.elapsedMs).sort((a, b) => a - b)
  const medianMs = sortedTimes.length ? (sortedTimes[(sortedTimes.length - 1) >> 1] + sortedTimes[sortedTimes.length >> 1]) / 2 : 0
  const longest = [...visited].sort((a, b) => b.elapsedMs - a.elapsedMs || a.no - b.no)
  const revisited = rows.filter(row => row.visits > 1)
  const quick = visited.filter(row => row.elapsedMs < QUICK_MS)
  const returnMs = new Map()
  {
    const seen = new Set()
    for (const visit of visits) {
      if (seen.has(visit.slideNo)) returnMs.set(visit.slideNo, (returnMs.get(visit.slideNo) || 0) + visit.elapsedMs)
      seen.add(visit.slideNo)
    }
  }
  // Chronological point where measured time passed the target.
  let crossing = null
  {
    let elapsed = 0
    for (const visit of visits) {
      if (!crossing && elapsed + visit.elapsedMs > targetMs) crossing = byNo.get(visit.slideNo)
      elapsed += visit.elapsedMs
    }
  }
  const cutMs = () => rows.filter(row => cuts.has(row.no)).reduce((sum, row) => sum + row.elapsedMs, 0)
  const slideLabel = row => row.title === 'Slide ' + row.no ? row.title : 'Slide ' + row.no + ' · ' + row.title

  // Header
  document.title = deckName + ' · Rehearsal report'
  $('deck-title').textContent = deckName
  const statusText = { finished: 'Finished', running: 'Recording at export', paused: 'Paused at export' }[run.status] || run.status
  $('status').replaceChildren(
    h('span', { class: 'chip chip-' + run.status }, statusText),
    unvisited.length ? h('span', { class: 'chip chip-partial' }, 'Partial run') : null)
  const dateFormat = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  $('run-meta').textContent = new Date(run.startedAt).toLocaleString(undefined, dateFormat)
    + ' · ' + plural(rows.length, 'slide') + ' · ' + plural(parts.length, 'section')

  // Verdict
  const over = total > targetMs
  $('total').textContent = clock(total)
  $('target').textContent = clock(targetMs)
  $('delta').className = 'delta ' + (over ? 'is-over' : 'is-under')
  $('delta').textContent = clock(Math.abs(total - targetMs)) + (over ? ' over' : ' under')
  function renderHeadlines() {
    const items = []
    if (!visited.length) items.push(h('li', { class: 'lead' }, 'No presenting time recorded in this run.'))
    else if (over) {
      items.push(h('li', { class: 'lead' }, 'Cut ', h('b', {}, clock(total - targetMs)), ' to finish on time.'))
      if (crossing) items.push(h('li', {}, 'Passed ' + clock(targetMs) + ' on ', h('a', { href: '#slide-' + crossing.no, class: 'inline-link', onclick: event => { event.preventDefault(); focusSlide(crossing.no) } }, 'slide ' + crossing.no + ', ' + crossing.title), '.'))
    } else items.push(h('li', { class: 'lead' }, h('b', {}, clock(targetMs - total)), unvisited.length ? ' left inside the target so far.' : ' left inside the target.'))
    if (unvisited.length && visited.length) {
      // Rough projection: skipped slides at the median pace of this run.
      const projected = total + unvisited.length * medianMs
      items.push(h('li', { class: projected > targetMs ? 'warn' : '' }, plural(unvisited.length, 'slide') + ' not visited. At your median pace the full talk takes about ',
        h('b', {}, clock(projected)), projected > targetMs ? ', ' + clock(projected - targetMs) + ' over.' : ', ' + clock(targetMs - projected) + ' under.'))
    }
    if (cuts.size) {
      const remaining = total - cutMs()
      items.push(h('li', {}, 'Selected cuts save ', h('b', {}, clock(cutMs())), ', leaving ' + clock(remaining) + ' (' + clock(Math.abs(remaining - targetMs)) + (remaining > targetMs ? ' over).' : ' under).')))
    }
    $('headlines').replaceChildren(...items)
  }
  const stat = (label, value, note) => h('div', { class: 'stat' }, h('dt', {}, label), h('dd', {}, value), note ? h('small', {}, note) : null)
  $('quick-stats').replaceChildren(
    stat('Slides visited', visited.length + ' / ' + rows.length, unvisited.length ? unvisited.length + ' skipped' : 'All slides'),
    stat('Paused', clock(pausedMs), 'Wall clock ' + clock(wallMs)),
    stat('Typical slide', visited.length ? clock(medianMs) : '–', 'Median of visited slides'),
    stat('Revisits', plural(revisited.length, 'slide'), revisited.length ? '+' + clock([...returnMs.values()].reduce((a, b) => a + b, 0)) + ' on return visits' : 'No backtracking'))

  // Timeline
  function axisTicks(scale) {
    const minutes = scale / 60000
    const step = [1, 2, 5, 10, 15, 20, 30, 60].find(candidate => minutes / candidate <= 12) || 120
    const ticks = []
    for (let m = 0; m <= minutes + 0.001; m += step) ticks.push(m * 60000)
    return ticks
  }
  function renderTimeline() {
    const removed = cutMs()
    const px = $('timeline').clientWidth || 1000
    const wide = (ms, min) => ms / scaleMs * px >= min
    const sectionBand = h('div', { class: 'band band-sections' }, sections.filter(section => section.ms > 0).map(section => {
      const width = section.ms / scaleMs * 100
      return h('div', {
        class: 'sec', style: { left: pct(section.startMs), width: width + '%', ...colorVars(section.part) },
        'data-tip': section.part + '\n' + clock(section.ms) + ' · ' + plural(section.rows.length, 'slide') + '\nStarts at ' + clock(section.startMs),
        onclick: () => showSection(section.part),
      }, wide(section.ms, 74) ? h('span', { class: 'sec-name' }, section.part) : null, wide(section.ms, 44) ? h('span', { class: 'sec-time' }, clock(section.ms)) : null)
    }))
    const slideBand = h('div', { class: 'band band-slides' }, visited.map(row => {
      const width = row.elapsedMs / scaleMs * 100
      const index = sections.find(section => section.rows.includes(row)).rows.indexOf(row)
      return h('div', {
        class: 'seg' + (index % 2 ? ' alt' : '') + (cuts.has(row.no) ? ' cut' : ''),
        style: { left: pct(row.startMs), width: width + '%', ...colorVars(row.part) },
        'data-tip': slideLabel(row) + '\n' + row.part + ' · ' + clock(row.elapsedMs) + (row.visits > 1 ? ' · ' + row.visits + ' visits' : '') + '\nStarts at ' + clock(row.startMs) + (cuts.has(row.no) ? '\nMarked as a potential cut' : ''),
        onclick: () => focusSlide(row.no),
      }, wide(row.elapsedMs, 22) ? h('span', {}, row.no) : null)
    }))
    const missing = h('div', { class: 'band band-missing' }, unvisited.map(row => h('div', {
      class: 'missing', style: { left: pct(row.startMs) }, 'data-tip': slideLabel(row) + '\nNot visited', onclick: () => focusSlide(row.no),
    })))
    const overlays = []
    if (over) overlays.push(h('div', { class: 'overrun', style: { left: pct(targetMs), width: pct(total - targetMs) } }))
    else if (total < targetMs) overlays.push(h('div', { class: 'spare', style: { left: pct(total), width: pct(targetMs - total) } }, h('span', {}, clock(targetMs - total) + ' spare')))
    const edge = ms => ms / scaleMs > 0.88 ? ' at-end' : ms / scaleMs < 0.12 ? ' at-start' : ''
    overlays.push(h('div', { class: 'marker marker-target' + edge(targetMs), style: { left: pct(targetMs) } }, h('span', {}, 'Target ' + clock(targetMs))))
    if (removed) overlays.push(h('div', { class: 'marker marker-cuts' + edge(total - removed), style: { left: pct(total - removed) } }, h('span', {}, 'After cuts ' + clock(total - removed))))
    const axis = h('div', { class: 'axis' }, axisTicks(scaleMs).map(ms => h('span', { style: { left: pct(ms) } }, Math.round(ms / 60000) + (ms ? '' : ' min'))))
    $('timeline').replaceChildren(h('div', { class: 'timeline-body' }, sectionBand, slideBand, missing, overlays), axis)
    $('timeline').setAttribute('aria-label', 'Timeline. ' + sections.map(section => section.part + ' ' + clock(section.ms)).join(', '))
  }

  // Sections table
  function renderSections() {
    const maxShare = Math.max(1, ...sections.map(section => section.ms))
    $('section-table').replaceChildren(
      h('thead', {}, h('tr', {}, ['Section', 'Slides', 'Starts at', 'Time', 'Share', 'Per slide'].map((label, i) => h('th', { class: [i > 0 && i !== 4 ? 'num' : '', i === 4 ? 'share-col' : '', i === 2 || i === 5 ? 'opt' : ''].join(' ').trim() }, label)))),
      h('tbody', {}, sections.map(section => {
        const seen = section.rows.filter(row => row.visits)
        return h('tr', { tabindex: 0, onclick: () => showSection(section.part), onkeydown: event => { if (event.key === 'Enter') showSection(section.part) } },
          h('td', {}, h('span', { class: 'swatch', style: colorVars(section.part) }), section.part),
          h('td', { class: 'num' }, seen.length === section.rows.length ? section.rows.length : seen.length + ' / ' + section.rows.length),
          h('td', { class: 'num muted opt' }, clock(section.startMs)),
          h('td', { class: 'num strong' }, clock(section.ms)),
          h('td', { class: 'share-col' }, h('div', { class: 'share' }, h('div', { class: 'meter' }, h('i', { style: { width: pctOf(section.ms, maxShare), ...colorVars(section.part) } })), h('span', {}, Math.round(section.ms / Math.max(total, 1) * 100) + '%'))),
          h('td', { class: 'num muted opt' }, seen.length ? clock(section.ms / seen.length) : '–'))
      })),
      h('tfoot', {}, h('tr', {}, h('td', {}, 'Total'), h('td', { class: 'num' }, visited.length + ' / ' + rows.length), h('td', { class: 'opt' }), h('td', { class: 'num strong' }, clock(total)), h('td', { class: 'share-col' }), h('td', { class: 'num muted opt' }, visited.length ? clock(total / visited.length) : '–'))))
  }

  // Watch list
  function slideLink(row, extra) {
    return h('button', { class: 'slide-link', type: 'button', onclick: () => focusSlide(row.no) },
      h('span', { class: 'swatch', style: colorVars(row.part) }), h('span', { class: 'no' }, row.no), h('span', { class: 'title' }, row.title), extra ? h('span', { class: 'value' }, extra) : null)
  }
  function watchCard(title, count, note, list, value, empty) {
    return h('article', { class: 'watch' + (list.length ? '' : ' is-empty') },
      h('header', {}, h('h3', {}, title), h('strong', {}, count)), h('p', { class: 'muted' }, list.length ? note : empty),
      list.length ? h('ol', {}, list.slice(0, 6).map(row => h('li', {}, slideLink(row, value(row))))) : null,
      list.length > 6 ? h('p', { class: 'muted more' }, '+' + (list.length - 6) + ' more in the slide list') : null)
  }
  function renderWatch() {
    const topFive = longest.slice(0, 5)
    $('watch').replaceChildren(
      watchCard('Longest slides', clock(sumMs(topFive)), 'Top five take ' + Math.round(sumMs(topFive) / Math.max(total, 1) * 100) + '% of the run.', topFive, row => clock(row.elapsedMs), 'No slides visited.'),
      watchCard('Went back to', String(revisited.length), 'Return visits add to the slide total.', revisited, row => row.visits + '× · +' + clock(returnMs.get(row.no) || 0), 'No slide was revisited.'),
      watchCard('Flicked past', String(quick.length), 'Under ' + QUICK_MS / 1000 + ' seconds. Divider, or worth cutting?', quick, row => (row.elapsedMs / 1000).toFixed(1) + ' s', 'Every visited slide got at least ' + QUICK_MS / 1000 + ' seconds.'),
      watchCard('Not visited', String(unvisited.length), 'No measured time. The full talk needs more.', unvisited, () => 'skipped', 'Every slide was visited.'))
  }

  // Path through the deck, chronological
  function renderPath() {
    const host = $('path')
    const width = Math.max(320, host.clientWidth)
    const left = width < 600 ? 36 : Math.min(170, width * 0.2), right = 8, top = 22, bottom = 26
    const rowHeight = Math.max(4, Math.min(8, 360 / rows.length))
    const height = top + bottom + rows.length * rowHeight
    const x = ms => left + ms / scaleMs * (width - left - right)
    const fit = (text, px) => text.length * 6.2 > px ? text.slice(0, Math.max(3, Math.floor(px / 6.2) - 1)) + '…' : text
    const y = no => top + (no - 0.5) * rowHeight
    const stripes = sections.map((section, i) => svg('g', {},
      svg('rect', { x: 0, y: top + (section.rows[0].no - 1) * rowHeight, width: width - right, height: section.rows.length * rowHeight, class: i % 2 ? 'stripe alt' : 'stripe' }),
      left >= 110 && section.rows.length * rowHeight >= 13 ? svg('text', { x: 10, y: top + (section.rows[0].no - 1) * rowHeight + 11, class: 'stripe-label' }, fit(section.part, left - 44)) : null))
    const lines = []
    const hits = []
    let elapsed = 0
    let previous = null
    for (const visit of visits) {
      const row = byNo.get(visit.slideNo)
      if (!row) continue
      const x0 = x(elapsed), x1 = x(elapsed + visit.elapsedMs)
      if (previous) lines.push(svg('line', { x1: x0, x2: x0, y1: y(previous), y2: y(row.no), class: row.no < previous ? 'jump back' : 'jump' }))
      lines.push(svg('line', { x1: x0, x2: Math.max(x1, x0 + 1), y1: y(row.no), y2: y(row.no), class: 'dwell', stroke: colorOf[row.part][0] }))
      hits.push(svg('rect', {
        x: x0, y: y(row.no) - rowHeight, width: Math.max(3, x1 - x0), height: rowHeight * 2, class: 'hit',
        'data-tip': slideLabel(row) + '\n' + clock(elapsed) + ' to ' + clock(elapsed + visit.elapsedMs) + ' · ' + clock(visit.elapsedMs) + (row.no < (previous ?? 0) ? '\nWent back' : ''),
      }))
      elapsed += visit.elapsedMs
      previous = row.no
    }
    const ticks = axisTicks(scaleMs).map(ms => svg('g', {},
      svg('line', { x1: x(ms), x2: x(ms), y1: top, y2: height - bottom, class: 'grid' }),
      svg('text', { x: x(ms), y: height - 8, class: 'tick', 'text-anchor': 'middle' }, Math.round(ms / 60000) + (ms ? '' : ' min'))))
    const yLabels = [1, ...sections.map(section => section.rows[0].no).filter(no => no > 1 && no < rows.length - 1), rows.length]
      .filter((no, i, list) => i === 0 || (no - list[i - 1]) * rowHeight >= 14)
      .map(no => svg('text', { x: left - 6, y: y(no) + 3.5, class: 'tick', 'text-anchor': 'end' }, no))
    host.replaceChildren(svg('svg', { width, height, viewBox: '0 0 ' + width + ' ' + height, role: 'img', 'aria-label': 'Slide number over measured time, in the order you presented' },
      stripes, ticks, yLabels,
      svg('line', { x1: x(targetMs), x2: x(targetMs), y1: top - 10, y2: height - bottom, class: 'target-line' }),
      svg('text', { x: x(targetMs), y: top - 12, class: 'target-label', 'text-anchor': x(targetMs) > width - 80 ? 'end' : 'middle' }, 'Target'),
      lines, hits))
  }

  // Slide list
  const sectionFilter = $('section-filter')
  sectionFilter.replaceChildren(h('option', { value: '' }, 'All sections'), ...parts.map(part => h('option', { value: part }, part)))
  const maxSlide = Math.max(1, ...rows.map(row => row.elapsedMs))
  function sourceBlock(label, value, className) {
    return h('section', { class: 'source' }, h('h4', {}, label), value && value.trim() ? h('pre', { class: className }, value) : h('p', { class: 'muted' }, 'None'))
  }
  function slideDetails(row) {
    const own = visits.filter(visit => visit.slideNo === row.no)
    const body = h('div', { class: 'slide-body' })
    if (row.source) body.append(h('div', { class: 'source-grid' }, sourceBlock('Speaker notes', row.source.notes, 'notes'), sourceBlock('Slide markup', row.source.markdown)))
    else body.append(h('p', { class: 'muted' }, 'Slide content was not captured for this older run. New rehearsals include it automatically.'))
    body.append(h('h4', {}, 'Visits'))
    if (!own.length) body.append(h('p', { class: 'muted' }, 'No visits recorded.'))
    else {
      body.append(h('table', { class: 'visits' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Visit'), h('th', {}, 'Started'), h('th', { class: 'num' }, 'Measured'))),
        h('tbody', {}, own.map((visit, index) => h('tr', {}, h('td', {}, index ? 'Return ' + index : 'First'), h('td', {}, new Date(visit.startedAt).toLocaleTimeString()), h('td', { class: 'num' }, clock(visit.elapsedMs)))))))
    }
    if (row.source?.frontmatter) body.append(h('details', { class: 'frontmatter' }, h('summary', {}, 'Frontmatter'), h('pre', {}, row.source.frontmatter)))
    return body
  }
  function renderSlides() {
    const query = $('search').value.trim().toLowerCase()
    const part = sectionFilter.value
    let list = rows.filter(row => (!part || row.part === part)
      && (!$('visited-only').checked || row.visits > 0)
      && (!$('cuts-only').checked || cuts.has(row.no))
      && (!query || [row.no, row.title, row.part, row.source?.markdown, row.source?.notes].join(' ').toLowerCase().includes(query)))
    if ($('sort').value === 'longest') list = [...list].sort((a, b) => b.elapsedMs - a.elapsedMs || a.no - b.no)
    const open = new Set([...document.querySelectorAll('#slides details.slide[open]')].map(node => Number(node.dataset.slide)))
    $('shown').textContent = list.length === rows.length ? plural(rows.length, 'slide') : list.length + ' of ' + rows.length + ' slides'
    $('slides').replaceChildren(...list.map(row => {
      const details = h('details', { class: 'slide', 'data-slide': row.no, open: open.has(row.no) },
        h('summary', {},
          h('span', { class: 'no' }, row.no),
          h('span', { class: 'name' }, h('span', { class: 'title' }, row.title), h('span', { class: 'part' }, h('span', { class: 'swatch', style: colorVars(row.part) }), row.part)),
          h('span', { class: 'meter' }, h('i', { style: { width: pctOf(row.elapsedMs, maxSlide), ...colorVars(row.part) } })),
          h('span', { class: 'num time' + (row.visits ? '' : ' muted') }, row.visits ? clock(row.elapsedMs) : 'Skipped'),
          h('span', { class: 'num visits' + (row.visits > 1 ? ' strong' : ' muted') }, row.visits > 1 ? row.visits + '×' : row.visits ? '' : '–'),
          h('span', { class: 'num at muted' }, clock(row.startMs))))
      details.addEventListener('toggle', () => { if (details.open && !details.querySelector('.slide-body')) details.append(slideDetails(row)) })
      if (details.open) details.append(slideDetails(row))
      return h('div', { class: 'slide-row' + (cuts.has(row.no) ? ' is-cut' : ''), id: 'slide-' + row.no },
        h('label', { class: 'cut-box', title: 'Potential cut' }, h('input', {
          type: 'checkbox', checked: cuts.has(row.no), 'aria-label': 'Mark slide ' + row.no + ' as a potential cut',
          onchange: event => { if (event.target.checked) cuts.add(row.no); else cuts.delete(row.no); updateCuts() },
        })), details)
    }))
  }
  function updateCuts() {
    const removed = cutMs()
    const remaining = total - removed
    const bar = $('cut-summary')
    bar.classList.toggle('has-cuts', cuts.size > 0)
    bar.replaceChildren(cuts.size
      ? h('span', {}, h('b', {}, plural(cuts.size, 'cut')), ' save ' + clock(removed) + ' → ', h('b', {}, clock(remaining)), ' ',
        h('span', { class: remaining > targetMs ? 'over' : 'under' }, clock(Math.abs(remaining - targetMs)) + (remaining > targetMs ? ' over' : ' under')),
        ' ', h('button', { type: 'button', class: 'link', onclick: () => { cuts.clear(); updateCuts() } }, 'Clear'))
      : h('span', { class: 'muted' }, 'Tick slides to plan cuts. ' + (over ? 'You need ' + clock(total - targetMs) + '.' : '')))
    for (const node of document.querySelectorAll('.slide-row')) {
      const no = Number(node.id.slice(6))
      node.classList.toggle('is-cut', cuts.has(no))
      node.querySelector('input').checked = cuts.has(no)
    }
    if ($('cuts-only').checked) renderSlides()
    renderHeadlines()
    renderTimeline()
  }
  function resetFilters() {
    $('search').value = ''; sectionFilter.value = ''; $('visited-only').checked = false; $('cuts-only').checked = false
  }
  function focusSlide(no) {
    if (!$('slide-' + no)) { resetFilters(); renderSlides() }
    const node = $('slide-' + no)
    const details = node.querySelector('details')
    if (!details.open) details.open = true
    node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    node.classList.remove('flash'); void node.offsetWidth; node.classList.add('flash')
  }
  function showSection(part) {
    resetFilters(); sectionFilter.value = part; renderSlides()
    $('slides-section').scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Tooltip shared by the charts
  const tip = $('tip')
  function placeTip(x, y) {
    const box = tip.getBoundingClientRect()
    tip.style.left = Math.min(window.innerWidth - box.width - 8, Math.max(8, x - box.width / 2)) + 'px'
    tip.style.top = (y - box.height - 14 < 8 ? y + 18 : y - box.height - 14) + 'px'
  }
  document.addEventListener('pointermove', event => {
    const target = event.target.closest?.('[data-tip]')
    if (!target) { tip.hidden = true; return }
    if (tip.textContent !== target.dataset.tip) tip.textContent = target.dataset.tip
    tip.hidden = false
    placeTip(event.clientX, event.clientY)
  })
  document.addEventListener('pointerleave', () => { tip.hidden = true })
  window.addEventListener('scroll', () => { tip.hidden = true }, { passive: true })

  // Actions
  function download(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = h('a', { href: url, download: filename })
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const fileBase = deckName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-rehearsal'
  function syncRaw() {
    run.selectedCuts = [...cuts].sort((a, b) => a - b)
    if ($('raw-details').open) $('raw-data').textContent = JSON.stringify(data, null, 2)
  }
  $('download-json').addEventListener('click', () => {
    syncRaw()
    download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), fileBase + '.json')
  })
  $('save-report').addEventListener('click', () => {
    syncRaw()
    const page = document.documentElement.cloneNode(true)
    for (const node of page.querySelectorAll('[data-render]')) node.replaceChildren()
    page.querySelector('#report-data').textContent = JSON.stringify(data).replaceAll('<', '\\u003c')
    download(new Blob(['<!doctype html>\n' + page.outerHTML], { type: 'text/html;charset=utf-8' }), fileBase + '.html')
  })
  $('print').addEventListener('click', () => window.print())
  for (const id of ['sort', 'section-filter', 'visited-only', 'cuts-only']) $(id).addEventListener('change', renderSlides)
  $('search').addEventListener('input', renderSlides)
  $('raw-details').addEventListener('toggle', syncRaw)
  let resizeFrame
  let lastWidth = 0
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(() => {
      if ($('path').clientWidth === lastWidth) return
      lastWidth = $('path').clientWidth
      renderPath(); renderTimeline()
    })
  }).observe($('path'))

  renderHeadlines(); renderTimeline(); renderSections(); renderWatch(); renderSlides(); updateCuts(); renderPath()
}

const styles = `
:root{--ink:#1a1a1a;--ink-2:#3d4148;--muted:#6b7079;--line:#e6e3dd;--line-2:#d6d2ca;--paper:#f5f3ef;--card:#fff;
--red:#de1e05;--red-soft:#fdece9;--teal:#037f91;--teal-soft:#e3f3f5;--amber:#a86a00;--amber-soft:#fff4dc;
color-scheme:light;font:15px/1.5 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);background:var(--paper);
font-feature-settings:"cv11","ss01";-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}body{margin:0}
main{max-width:1240px;margin:auto;padding:28px 32px 72px}
h1,h2,h3,h4{margin:0;letter-spacing:-.01em}
h1{font-size:clamp(26px,3.4vw,38px);line-height:1.1;font-weight:750;letter-spacing:-.025em}
h2{font-size:19px;font-weight:700}
h3{font-size:14px;font-weight:650}
h4{font-size:12px;font-weight:650;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin:18px 0 8px}
p{margin:0}
button,input,select{font:inherit;color:inherit}
.muted{color:var(--muted)}.strong{font-weight:650}
.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px}
.swatch{display:inline-block;width:9px;height:9px;border-radius:3px;background:var(--c);flex:none;margin-right:8px;vertical-align:1px}

/* Header */
.top{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:18px}
.eyebrow{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:650;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
#run-meta{margin-top:6px;color:var(--muted)}
.chip{display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:999px;font-size:11.5px;letter-spacing:.02em;text-transform:none;font-weight:600;background:#eceae5;color:var(--ink-2)}
.chip-finished{background:var(--teal-soft);color:var(--teal)}
.chip-partial,.chip-running,.chip-paused{background:var(--amber-soft);color:var(--amber)}
.actions{display:flex;gap:8px;flex-wrap:wrap}
.btn{border:1px solid var(--line-2);background:var(--card);border-radius:9px;padding:7px 13px;font-size:13.5px;font-weight:550;cursor:pointer}
.btn:hover{border-color:#b9b4aa;background:#fbfaf8}
.btn.primary{background:var(--ink);border-color:var(--ink);color:#fff}.btn.primary:hover{background:#333}

/* Hero */
.hero{padding:26px 28px 22px}
.hero-top{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:28px;align-items:start}
.figure{display:flex;align-items:baseline;flex-wrap:wrap;gap:6px 14px}
.total{font-size:clamp(56px,7.4vw,84px);line-height:.95;font-weight:780;letter-spacing:-.045em;font-variant-numeric:tabular-nums}
.of{font-size:16px;color:var(--muted)}.of b{color:var(--ink);font-weight:650}
.delta{display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:8px;font-weight:700;font-size:15px;font-variant-numeric:tabular-nums}
.delta.is-over{background:var(--red-soft);color:var(--red)}.delta.is-under{background:var(--teal-soft);color:var(--teal)}
.headlines{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:5px;color:var(--ink-2)}
.headlines .lead{font-size:16.5px;color:var(--ink)}
.headlines .warn{color:var(--amber)}
.inline-link{font-weight:600;color:var(--ink);text-decoration:underline;text-decoration-color:var(--line-2);text-underline-offset:3px;cursor:pointer;text-align:left}
.inline-link:hover{text-decoration-color:var(--ink)}
.quick-stats{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:0;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.stat{background:var(--card);padding:13px 16px}
.stat dt{font-size:12px;color:var(--muted);font-weight:550}
.stat dd{margin:2px 0 0;font-size:22px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.stat small{display:block;font-size:12px;color:var(--muted)}

/* Timeline */
.timeline-head{display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap;margin:26px 0 10px}
.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:var(--muted)}
.legend span{display:inline-flex;align-items:center;gap:6px}
.legend i{display:inline-block;width:14px;height:10px;border-radius:2px}
.legend .l-target{width:2px;height:12px;background:var(--ink)}
.legend .l-over{background:repeating-linear-gradient(135deg,#de1e0533 0 3px,#de1e0512 3px 6px)}
.legend .l-cut{background:repeating-linear-gradient(135deg,#fff 0 2px,#037f91 2px 5px)}
.legend .l-missing{width:9px;height:9px;transform:rotate(45deg);border:1.5px solid var(--amber);border-radius:1px}
.timeline{position:relative;padding-top:20px}
.timeline-body{position:relative}
.band{position:relative}
.band-sections{height:40px;margin-bottom:4px}
.band-slides{height:64px}
.band-missing{height:24px}
.sec,.seg{position:absolute;top:0;bottom:0;cursor:pointer}
.sec{display:flex;flex-direction:column;justify-content:center;padding:0;overflow:hidden;white-space:nowrap;background:color-mix(in srgb,var(--c) 13%,#fff);border-left:3px solid var(--c);border-right:1px solid #fff;line-height:1.2}
.sec:hover{background:color-mix(in srgb,var(--c) 22%,#fff)}
.sec-name,.sec-time{margin:0 6px 0 8px}
.sec-name{font-size:12.5px;font-weight:650;overflow:hidden;text-overflow:ellipsis}
.sec-time{font-size:11.5px;color:var(--ink-2);font-variant-numeric:tabular-nums}
.seg{background:var(--c);color:var(--fg);box-shadow:inset -1px 0 #fff;display:flex;align-items:flex-end;justify-content:center;padding-bottom:5px;font-size:10.5px;font-weight:650;overflow:hidden;transition:filter .12s}
.seg.alt{background:color-mix(in srgb,var(--c) 76%,#fff)}
.seg:hover{filter:brightness(.88)}
.seg.cut{background:repeating-linear-gradient(135deg,#fff 0 3px,var(--c) 3px 7px);color:var(--ink)}
.seg.cut span{background:#fff;border-radius:3px;padding:0 2px}
.band-slides .seg:first-child{border-radius:6px 0 0 6px}
.missing{position:absolute;top:4px;width:9px;height:9px;margin-left:-4.5px;transform:rotate(45deg);border:1.5px solid var(--amber);background:var(--amber-soft);border-radius:1px;cursor:pointer}
.overrun{position:absolute;top:-4px;bottom:-4px;background:repeating-linear-gradient(135deg,#de1e0526 0 4px,#de1e050d 4px 8px);border-top:2px solid var(--red);pointer-events:none}
.spare{position:absolute;top:44px;height:64px;border:1.5px dashed var(--line-2);border-left:0;border-radius:0 6px 6px 0;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--muted);overflow:hidden;white-space:nowrap}
.marker{position:absolute;top:-22px;bottom:-4px;width:0;border-left:2px solid var(--ink);pointer-events:none}
.marker span{position:absolute;top:0;transform:translateX(-50%);font-size:11.5px;font-weight:650;white-space:nowrap;background:var(--ink);color:#fff;border-radius:5px;padding:1px 6px}
.marker.at-end span{transform:translateX(calc(-100% + 1px));border-top-right-radius:0}.marker.at-start span{transform:translateX(-1px);border-top-left-radius:0}
.marker-cuts{border-left:2px dashed var(--teal);top:-4px}.marker-cuts span{background:var(--teal);top:auto;bottom:0;z-index:1}
.axis{position:relative;height:22px;margin-top:6px;border-top:1px solid var(--line)}
.axis span{position:absolute;top:4px;transform:translateX(-50%);font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.axis span:first-child{transform:none}
.axis span::before{content:"";position:absolute;left:50%;top:-8px;height:4px;border-left:1px solid var(--line-2)}
.axis span:first-child::before{left:0}

/* Sections and watch list */
.stack{display:grid;gap:20px;margin-top:20px}
.stack>*,.hero-top>*{min-width:0}
.panel{padding:22px 24px}
.panel-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:12px}
table{width:100%;border-collapse:collapse;font-size:13.5px}
th{font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:600;text-align:left;padding:0 8px 8px}
td{padding:9px 8px;border-top:1px solid var(--line)}
#section-table tbody tr{cursor:pointer}
#section-table tbody tr:hover,#section-table tbody tr:focus-visible{background:#faf9f6;outline:none}
#section-table td:first-child{font-weight:600;white-space:nowrap;max-width:240px;overflow:hidden;text-overflow:ellipsis}
#section-table tfoot td{border-top:1.5px solid var(--line-2);font-weight:650}
.share-col{width:34%}
#section-table th.num,#section-table td.num{width:86px}
.share{display:flex;align-items:center;gap:8px}
.share span{width:34px;text-align:right;font-variant-numeric:tabular-nums;color:var(--muted);font-size:12.5px}
.meter{display:block;flex:1;height:8px;background:#f0eee9;border-radius:4px;overflow:hidden}
.meter i{display:block;height:100%;background:var(--c);border-radius:4px}
.watch-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.watch{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 16px 12px}
.watch header{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.watch header strong{font-size:20px;font-weight:720;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.watch > p{font-size:12.5px;margin:2px 0 8px}
.watch.is-empty header strong{color:var(--muted)}
.watch ol{list-style:none;margin:0 -6px;padding:0}
.watch .more{font-size:12px;padding:4px 0 0}
.slide-link{display:flex;align-items:center;width:100%;gap:0;border:0;background:none;padding:4px 6px;border-radius:7px;cursor:pointer;text-align:left;font-size:13px;min-width:0}
.slide-link:hover{background:#f4f2ee}
.slide-link .no{color:var(--muted);font-variant-numeric:tabular-nums;min-width:22px;margin-right:6px;font-size:12px}
.slide-link .title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.slide-link .value{margin-left:10px;font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap;font-size:12.5px}

/* Path */
.path-panel{margin-top:20px}
#path{width:100%;min-height:200px}
#path svg{display:block;overflow:visible}
.stripe{fill:#faf9f6}.stripe.alt{fill:#f2f0eb}
.stripe-label{font-size:11px;fill:var(--ink-2);font-weight:600}
.grid{stroke:#e8e5df;stroke-width:1}
.tick{font-size:10.5px;fill:var(--muted);font-variant-numeric:tabular-nums}
.dwell{stroke-width:3.5;stroke-linecap:round}
.jump{stroke:#bdb8af;stroke-width:1}
.jump.back{stroke:var(--red);stroke-width:1.5}
.hit{fill:transparent;cursor:default}
.hit:hover{fill:#1a1a1a10}
.target-line{stroke:var(--ink);stroke-width:1.5;stroke-dasharray:4 3}
.target-label{font-size:11px;font-weight:650;fill:var(--ink)}

/* Slide list */
.slides-section{margin-top:28px}
.toolbar{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:12px 0 8px;background:var(--paper)}
.toolbar select,.toolbar input[type=search]{height:34px;border:1px solid var(--line-2);border-radius:9px;background:var(--card);padding:0 10px;font-size:13.5px}
.toolbar input[type=search]{flex:1;min-width:200px}
.toolbar label.check{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;white-space:nowrap}
input[type=checkbox]{accent-color:var(--red);width:16px;height:16px;margin:0}
#cut-summary{flex-basis:100%;display:flex;align-items:center;font-size:13.5px;min-height:20px}
#cut-summary.has-cuts{color:var(--ink)}
#cut-summary .over{color:var(--red);font-weight:650}#cut-summary .under{color:var(--teal);font-weight:650}
.link{border:0;background:none;padding:0 4px;color:var(--teal);text-decoration:underline;cursor:pointer;font-size:13px}
.list-head,.slide-row summary{display:grid;grid-template-columns:30px minmax(0,1fr) minmax(80px,20%) 56px 36px 56px;gap:12px;align-items:center}
.list-head{flex-basis:100%;padding:4px 15px 0 37px;font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:600}
#slides{background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.slide-row{display:grid;grid-template-columns:36px minmax(0,1fr);align-items:start;border-top:1px solid var(--line);scroll-margin-top:150px}
.slide-row:first-child{border-top:0}
.slide-row:hover{background:#fcfbf9}
.slide-row.is-cut{background:#fff6f4}
.slide-row.is-cut .title{text-decoration:line-through;text-decoration-color:#de1e0599;color:var(--ink-2)}
.slide-row.flash{animation:flash 1.8s ease-out}
@keyframes flash{0%,35%{background:#e3f3f5}100%{background:transparent}}
.cut-box{display:flex;justify-content:center;padding-top:12px;cursor:pointer}
.slide-row summary{list-style:none;cursor:pointer;padding:8px 14px 8px 0;min-height:40px}
.slide-row summary::-webkit-details-marker{display:none}
.slide-row .no{font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.slide-row .name{display:flex;align-items:center;gap:10px;min-width:0}
.slide-row .title{font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.slide-row .part{font-size:12px;color:var(--muted);display:inline-flex;align-items:center;white-space:nowrap;flex:none;margin-left:auto}
.slide-row .part .swatch{width:7px;height:7px;margin-right:6px}
.slide-row .time{font-weight:650;font-size:14px}
.slide-row details[open] summary{border-bottom:1px solid var(--line)}
.slide-body{padding:4px 14px 16px 0}
.source-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
pre{font:12.5px/1.6 "JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere;background:#f7f6f3;border:1px solid var(--line);border-radius:9px;padding:12px 14px;margin:0;max-height:380px;overflow:auto}
pre.notes{font:13.5px/1.6 Inter,ui-sans-serif,system-ui,sans-serif;background:#fcfbf8}
table.visits{max-width:440px}
.frontmatter{margin-top:14px}.frontmatter summary{cursor:pointer;font-size:12.5px;color:var(--muted);margin-bottom:8px}
.raw{margin-top:28px}.raw summary{cursor:pointer;font-weight:600}.raw pre{margin-top:10px;max-height:520px}
footer{margin-top:24px;font-size:12.5px;color:var(--muted);max-width:80ch}
#tip{position:fixed;z-index:20;pointer-events:none;background:var(--ink);color:#fff;font-size:12.5px;line-height:1.45;padding:7px 10px;border-radius:8px;white-space:pre-line;max-width:320px;box-shadow:0 6px 24px #0003}
#tip::first-line{font-weight:650}
:focus-visible{outline:2px solid var(--teal);outline-offset:2px}

@media (max-width:980px){.hero-top{grid-template-columns:1fr}}
@media (max-width:640px){main{padding:18px 14px 56px}.hero,.panel{padding:18px 16px}.watch-grid,.source-grid{grid-template-columns:minmax(0,1fr)}
.list-head,.slide-row .part{display:none}.slide-row summary{grid-template-columns:28px minmax(0,1fr) 56px 30px}.slide-row .meter,.slide-row .at{display:none}
.share-col,.opt{display:none}#section-table th.num,#section-table td.num{width:auto}.legend{display:none}.band-slides .seg span{display:none}}
@media print{body,:root{background:#fff}main{max-width:none;padding:0}.actions,.toolbar,.cut-box,.raw,#tip,.screen-only{display:none!important}
.card,.watch,.slide-row{break-inside:avoid}.slide-row{grid-template-columns:0 1fr}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}pre{max-height:none}}
`

export function rehearsalReport(session, now) {
  // Escape '<' so literal slide markup cannot terminate the JSON script element.
  const data = JSON.stringify({ exportedAt: now, session, rows: slideTotals(session, now) }).replaceAll('<', '\\u003c')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rehearsal report</title>
<style>${styles}</style></head><body><main>
<header class="top">
  <div><div class="eyebrow">Rehearsal report <span id="status" data-render></span></div><h1 id="deck-title"></h1><p id="run-meta"></p></div>
  <div class="actions"><button class="btn primary" id="save-report">Save copy with cuts</button><button class="btn" id="download-json">Download JSON</button><button class="btn" id="print">Print</button></div>
</header>
<section class="card hero" aria-label="Summary">
  <div class="hero-top">
    <div>
      <div class="figure"><span id="total" class="total"></span><span class="of">of <b id="target"></b> target</span><span id="delta" class="delta"></span></div>
      <ul id="headlines" class="headlines" data-render></ul>
    </div>
    <dl id="quick-stats" class="quick-stats" data-render></dl>
  </div>
  <div class="timeline-head"><h2>Where the time went</h2>
    <div class="legend"><span><i class="l-target"></i>Target</span><span><i class="l-over"></i>Over target</span><span><i class="l-cut"></i>Potential cut</span><span><i class="l-missing"></i>Not visited</span></div></div>
  <div id="timeline" class="timeline" role="img" data-render></div>
</section>
<div class="stack">
  <section class="card panel" aria-label="Sections"><div class="panel-head"><h2>Sections</h2><span class="muted screen-only">Click a row to list its slides</span></div><table id="section-table" data-render></table></section>
  <section aria-label="Worth a look"><div id="watch" class="watch-grid" data-render></div></section>
</div>
<section class="card panel path-panel" aria-label="Path through the deck"><div class="panel-head"><h2>Path through the deck</h2><span class="muted">Order you presented in. Red lines are jumps back.</span></div><div id="path" data-render></div></section>
<section id="slides-section" class="slides-section" aria-label="Slides">
  <h2>Slides</h2>
  <div class="toolbar">
    <select id="sort" aria-label="Sort"><option value="deck">Deck order</option><option value="longest">Longest first</option></select>
    <select id="section-filter" aria-label="Section" data-render></select>
    <input id="search" type="search" aria-label="Search slides" placeholder="Search titles, markup and notes">
    <label class="check"><input type="checkbox" id="visited-only">Visited only</label>
    <label class="check"><input type="checkbox" id="cuts-only">Cuts only</label>
    <div id="cut-summary" data-render></div>
    <div class="list-head"><span>#</span><span>Slide</span><span>Time</span><span class="num">Total</span><span class="num">Visits</span><span class="num">Starts</span></div>
  </div>
  <div id="slides" data-render></div>
  <p id="shown" class="muted" style="margin-top:10px;font-size:12.5px"></p>
</section>
<details id="raw-details" class="raw"><summary>Raw rehearsal data</summary><pre id="raw-data" data-render></pre></details>
<footer>Times are measured presenting time with pauses removed. Totals include return visits. "Starts" is the running total in deck order. Content is the deck as it was when the rehearsal began. Cuts you tick here change this report, not the presentation.</footer>
</main><div id="tip" hidden data-render></div><script id="report-data" type="application/json">${data}</script><script>(${reportApp.toString()})();</script></body></html>`
}
