import type { SlidevPreparserExtension } from '@slidev/types'

// Slidev strips Markdown and raw notes from production metadata. Keep a snapshot
// in frontmatter so rehearsals from built decks can export the same report.
// Live viewer builds (addons/live) have no presenter and must not carry notes.
const liveViewer = process.env.SLIDEV_LIVE_VIEWER === '1'

export default function (): SlidevPreparserExtension {
  return {
    name: 'rehearsal-content',
    async transformSlide(content, frontmatter) {
      if (liveViewer) return undefined
      const { rehearsalSource: _previous, ...metadata } = frontmatter
      frontmatter.rehearsalSource = {
        markdown: content,
        frontmatter: JSON.stringify(metadata, null, 2),
      }
      return undefined
    },
    async transformNote(note, frontmatter) {
      if (liveViewer) return undefined
      frontmatter.rehearsalSource.notes = note || ''
      return undefined
    },
  }
}
