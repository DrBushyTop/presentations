// Each visit has its own duration. Revisits contribute to the same slide total.
export function createSession(deck, slides, targetMinutes, now = Date.now()) {
  return {
    version: 1, id: `${now}-${Math.random().toString(36).slice(2)}`,
    deck, startedAt: now, finishedAt: null, status: 'paused',
    targetMinutes, slides, visits: [], selectedCuts: [],
  }
}

export function enterSlide(session, slideNo, now) {
  if (session.status !== 'running') return
  const last = session.visits.at(-1)
  if (last?.endedAt === null && last.slideNo === slideNo) return
  checkpoint(session, now)
  if (last) last.endedAt = now
  session.visits.push({ slideNo, startedAt: now, endedAt: null, elapsedMs: 0, checkpointAt: now })
}

export function checkpoint(session, now) {
  const visit = session.visits.at(-1)
  if (session.status === 'running' && visit?.endedAt === null) {
    visit.elapsedMs += Math.max(0, now - visit.checkpointAt)
    visit.checkpointAt = now
  }
}

export function pause(session, now) {
  checkpoint(session, now)
  session.status = 'paused'
}

export function resume(session, slideNo, now) {
  if (session.status === 'finished') return
  session.status = 'running'
  const visit = session.visits.at(-1)
  if (visit?.endedAt === null) visit.checkpointAt = now
  enterSlide(session, slideNo, now)
}

export function finish(session, now) {
  checkpoint(session, now)
  const visit = session.visits.at(-1)
  if (visit?.endedAt === null) visit.endedAt = now
  session.status = 'finished'
  session.finishedAt = now
}

export function slideTotals(session, now) {
  let cumulativeMs = 0
  return session.slides.map(slide => {
    const visits = session.visits.filter(visit => visit.slideNo === slide.no)
    const elapsedMs = visits.reduce((sum, visit) => sum + visit.elapsedMs
      + (session.status === 'running' && visit.endedAt === null ? Math.max(0, now - visit.checkpointAt) : 0), 0)
    cumulativeMs += elapsedMs
    return { ...slide, elapsedMs, cumulativeMs, visits: visits.length }
  })
}

export function formatTime(ms) {
  const seconds = Math.floor(ms / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function toCsv(session, now) {
  const quote = value => `"${String(value).replaceAll('"', '""')}"`
  const rows = slideTotals(session, now).map(row => [row.no, row.title, row.part,
    (row.elapsedMs / 1000).toFixed(1), row.visits, (row.cumulativeMs / 1000).toFixed(1),
    session.selectedCuts.includes(row.no)])
  return '\uFEFF' + [['Slide', 'Title', 'Section', 'Seconds', 'Visits', 'Cumulative seconds in deck order', 'Potential cut'], ...rows]
    .map(row => row.map(quote).join(',')).join('\r\n')
}
