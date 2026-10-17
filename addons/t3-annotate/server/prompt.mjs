// Turns a chat message and its slide notes into the text an agent receives.
// The context goes after the presenter's own words, under a heading the chat
// view uses to hide it again (see userText).
const clip = (text, max) => (text.length > max ? `${text.slice(0, max)}…` : text)
const oneLine = (text) => text.replace(/\s+/g, ' ').trim()

const NOTES_HEADING = '## Slide notes'
const CONTEXT_HEADING = '## Context'

function describeElement(el, rel) {
  const lines = [`\`${el.label}\`${el.text ? ` with text "${clip(oneLine(el.text), 120)}"` : ''}`]
  if (el.selector) lines.push(`selector: \`${el.selector}\``)
  const components = (el.components || []).map(rel).filter(Boolean)
  if (components.length) lines.push(`rendered by: ${components.join(' ← ')}`)
  if (el.html) lines.push(`html: \`${clip(oneLine(el.html), 600).replace(/`/g, '\\`')}\``)
  return lines
}

/**
 * @param {object} input
 * @param {string} input.message      what the presenter typed
 * @param {Array}  input.annotations  notes with slide, comment, elements, regions, strokes, shotName
 * @param {{no: number, clicks: number, clicksTotal: number}} [input.current]  the slide on screen when sending
 * @param {boolean} input.first       the message starts a new thread, so it carries the full deck context
 * @param {object} input.deck         { entry, devUrl, slides: (no) => { file, start, end, title } }
 * @param {(path: string) => string} input.rel  makes absolute paths repository-relative
 */
export function buildPrompt({ message, annotations, current, first, deck, rel }) {
  const out = []
  const slideName = (at) => {
    const slide = deck.slides(at.no)
    const clicks = at.clicksTotal ? `, click ${at.clicks} of ${at.clicksTotal}` : ''
    const title = slide?.title ? ` "${clip(oneLine(slide.title), 80)}"` : ''
    return { slide, name: `Slide ${at.no}${title}${clicks}` }
  }
  const sourceLine = (slide) => `\`${rel(slide.file)}\` lines ${slide.start + 1}-${slide.end}`

  if (message.trim()) out.push(message.trim(), '')

  if (annotations.length) {
    out.push(NOTES_HEADING, '')
    annotations.forEach((a, i) => {
      const { slide, name } = slideName(a.slide)
      out.push(`### ${i + 1}. ${name}`, '', a.comment.trim() || '(no comment, see the screenshot)', '')
      if (slide) out.push(`- slide source: ${sourceLine(slide)}`)
      if (a.wholeSlide && !a.elements.length) out.push('- applies to the whole slide')
      if (a.shotName) out.push(`- screenshot: attached image \`${a.shotName}\`. Selected elements are outlined, marked areas are dashed boxes and my drawings are shown in red.`)
      a.elements.forEach((el, j) => {
        const [head, ...rest] = describeElement(el, rel)
        out.push(`- element ${j + 1}: ${head}`, ...rest.map((l) => `  ${l}`))
      })
      const regions = a.regions?.length || 0
      const strokes = a.strokes?.length || 0
      const marks = [
        regions ? `${regions} marked area${regions > 1 ? 's' : ''}` : '',
        strokes ? `${strokes} drawing${strokes > 1 ? 's' : ''}` : '',
      ].filter(Boolean)
      if (marks.length) out.push(`- also: ${marks.join(' and ')}, visible in the screenshot`)
      out.push('')
    })
  }

  out.push(CONTEXT_HEADING, '')
  if (first) {
    out.push(
      `We are working on the Slidev deck \`${rel(deck.entry)}\`. Its dev server runs at ${deck.devUrl} and hot-reloads on save, so I see your changes immediately.`,
      'Edit the deck sources and follow the repository AGENTS.md. Positions in slide notes refer to the slide canvas, not to my screen.',
    )
  }
  if (current?.no) {
    const { slide, name } = slideName(current)
    out.push(`I am on ${name}${slide ? `, source ${sourceLine(slide)}` : ''}.`)
  }
  return out.join('\n').trim()
}

/** The part of a sent message the presenter wrote, without the context added above. */
export function userText(text) {
  const cut = [NOTES_HEADING, CONTEXT_HEADING, '## Slide change requests']
    .map((h) => (text.startsWith(h) ? 0 : text.indexOf(`\n\n${h}`)))
    .filter((i) => i >= 0)
  return (cut.length ? text.slice(0, Math.min(...cut)) : text).trim()
}
