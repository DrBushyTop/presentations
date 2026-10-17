// Turns the annotation draft into the message an agent receives.
const clip = (text, max) => (text.length > max ? `${text.slice(0, max)}…` : text)
const oneLine = (text) => text.replace(/\s+/g, ' ').trim()

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
 * @param {string} input.message      free text typed in the tray
 * @param {Array}  input.annotations  annotations with slide, comment, elements, regions, strokes, shotName
 * @param {{no: number, clicks: number, clicksTotal: number}} [input.current]  the slide on screen when sending
 * @param {object} input.deck         { entry, devUrl, slides: (no) => { file, start, end, title } }
 * @param {(path: string) => string} input.rel  makes absolute paths repository-relative
 */
export function buildPrompt({ message, annotations, deck, current, rel }) {
  const out = []
  const slideName = (at) => {
    const slide = deck.slides(at.no)
    const clicks = at.clicksTotal ? `, click ${at.clicks} of ${at.clicksTotal}` : ''
    const title = slide?.title ? ` "${clip(oneLine(slide.title), 80)}"` : ''
    return { slide, name: `Slide ${at.no}${title}${clicks}` }
  }
  const sourceLine = (slide) => `\`${rel(slide.file)}\` lines ${slide.start + 1}-${slide.end}`
  const deckLine = `Deck: \`${rel(deck.entry)}\`. Its Slidev dev server is running at ${deck.devUrl} and hot-reloads on save, so I see changes immediately.`

  if (message.trim()) out.push(message.trim(), '')
  if (!annotations.length) {
    // A free-text prompt still says where the presenter is.
    out.push('## Context', '', deckLine)
    if (current?.no) {
      const { slide, name } = slideName(current)
      out.push(`I am on ${name}${slide ? `, source ${sourceLine(slide)}` : ''}.`)
    }
    return out.join('\n').trim()
  }
  out.push('## Slide change requests', '', deckLine, '')
  annotations.forEach((a, i) => {
    const { slide, name } = slideName(a.slide)
    out.push(`### ${i + 1}. ${name}`)
    out.push('', a.comment.trim() || '(no comment, see the screenshot)', '')
    if (slide) out.push(`- slide source: ${sourceLine(slide)}`)
    if (a.wholeSlide && !a.elements.length) out.push('- applies to the whole slide')
    if (a.shotName) out.push(`- screenshot: attached image \`${a.shotName}\`. Selected elements are outlined, marked areas are dashed boxes and my drawings are shown in red.`)
    a.elements.forEach((el, j) => {
      const [first, ...rest] = describeElement(el, rel)
      out.push(`- element ${j + 1}: ${first}`, ...rest.map((l) => `  ${l}`))
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
  out.push('Make these changes in the deck sources and follow the repository AGENTS.md. Positions refer to the slide canvas, not to my screen.')
  return out.join('\n').trim()
}
