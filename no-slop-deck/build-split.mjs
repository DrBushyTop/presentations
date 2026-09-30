#!/usr/bin/env node
/*
  Builds split.md from slides.md.

  slides.md is the click deck: a slide with `clicks: N` builds in N steps,
  and every component takes `:step="$clicks"`. split.md turns each of those
  steps into its own slide with the step written in as a number. Consecutive
  steps are joined by the View Transition API, so named elements morph from
  one slide to the next instead of animating inside one slide.

  Speaker notes are cut at their [click] markers, so each split slide carries
  only the notes for its own step.

  Do not edit split.md by hand. Run `npm run build:no-slop-split`.
*/
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseSync } from '@slidev/parser'
import YAML from 'yaml'

const dir = dirname(fileURLToPath(import.meta.url))
const source = join(dir, 'slides.md')
const target = join(dir, 'split.md')
const { slides } = parseSync(readFileSync(source, 'utf8'), source)

const yaml = (obj) => YAML.stringify(obj, { lineWidth: 0 }).trimEnd()
const block = (frontmatter, content, note) =>
  `---\n${yaml(frontmatter)}\n---\n\n${content.trim()}\n${note ? `\n<!--\n${note.trim()}\n-->\n` : ''}`

const out = []
let count = 0

slides.forEach((slide, index) => {
  const fm = { ...slide.frontmatter }
  if (index === 0) {
    fm.info = 'Practices for shipping agent-written code you can explain. ESPC 2026, 60 minutes.\nSplit variant: every build step is its own slide, joined by view transitions.\nGenerated from slides.md. Do not edit.\n'
    fm.exportFilename = 'no-slop-engineer-split'
  }
  const clicks = Number(fm.clicks ?? 0)
  if (!clicks) {
    out.push(block(fm, slide.content, slide.note))
    count++
    return
  }
  delete fm.clicks
  const notes = (slide.note ?? '').split(/^\s*\[click\]\s*/m)
  for (let step = 0; step <= clicks; step++) {
    const copy = { ...fm }
    if (step < clicks) {
      copy.transition = 'view-transition'
      // A build step is partial on purpose. The last step fills the slide
      // and still has to pass the whitespace rules.
      copy.class = `${copy.class ?? ''} allow-whitespace`.trim()
    }
    const content = slide.content.replace(/\$clicks/g, String(step))
    const partial = step < clicks ? '\n\n(Build step. The empty space fills on the last step of this sequence.)' : ''
    const note = (step === 0 ? notes[0] : `(Step ${step} of ${clicks})\n\n${notes[step] ?? ''}`) + partial
    out.push(block(copy, content, note))
    count++
  }
})

writeFileSync(target, out.join('\n'))
console.log(`split.md: ${slides.length} source slides became ${count} slides`)
