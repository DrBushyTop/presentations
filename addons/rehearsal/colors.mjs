// Section colours shared by the presenter panel and the HTML report.
// Each entry is [fill, text on fill]. Red is left out because it marks overruns.
const palette = [['#037f91', '#fff'], ['#d99a00', '#1a1a1a'], ['#4f5bd5', '#fff'], ['#3b9550', '#fff'],
  ['#a3489a', '#fff'], ['#05b4cc', '#1a1a1a'], ['#7f8f00', '#fff'], ['#9a5b2e', '#fff'], ['#5a6b85', '#fff'],
  ['#d0679f', '#fff'], ['#2a8f7f', '#fff'], ['#7a4fc4', '#fff']]

// 'Other' holds slides before the first `part`. Grey keeps it out of the way
// unless it is the only section.
export function sectionColors(parts) {
  const unique = [...new Set(parts)]
  const colors = {}
  let index = 0
  for (const part of unique) colors[part] = part === 'Other' && unique.length > 1 ? ['#8a8f98', '#fff'] : palette[index++ % palette.length]
  return colors
}
