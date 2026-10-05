import type { SlidevPreparserExtension } from '@slidev/types'

// Slidev strips Markdown and raw notes from production metadata. Keep a snapshot
// in frontmatter so rehearsals from built decks can export the same report.
export default function (): SlidevPreparserExtension {
  return {
    name: 'rehearsal-content',
    async transformSlide(content, frontmatter) {
      const { rehearsalSource: _previous, ...metadata } = frontmatter
      frontmatter.rehearsalSource = {
        markdown: content,
        frontmatter: JSON.stringify(metadata, null, 2),
      }
      return undefined
    },
    async transformNote(note, frontmatter) {
      frontmatter.rehearsalSource.notes = note || ''
      return undefined
    },
  }
}
