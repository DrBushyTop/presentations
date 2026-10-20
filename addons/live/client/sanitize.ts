// Drawings arrive as SVG markup and Slidev renders them with innerHTML. Keep
// only the shapes and attributes drauu draws with.
const ELEMENTS = new Set(['g', 'defs', 'marker', 'path', 'line', 'rect', 'ellipse', 'circle', 'polyline', 'polygon'])
const ATTRIBUTES = new Set([
  'id', 'd', 'points', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height',
  'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-dashoffset',
  'stroke-linecap', 'stroke-linejoin', 'opacity', 'transform',
  'viewBox', 'markerWidth', 'markerHeight', 'markerUnits', 'refX', 'refY', 'orient', 'marker-start', 'marker-mid', 'marker-end',
])
// Paints and lengths: no url() except a local marker reference.
const SAFE_VALUE = /^[\w\s.,#%()+-]*$/
const MARKER_REF = /^url\(#[\w-]+\)$/
const SVG = 'http://www.w3.org/2000/svg'

function clean(node: Element) {
  for (const child of [...node.children]) {
    if (child.namespaceURI !== SVG || !ELEMENTS.has(child.localName)) {
      child.remove()
      continue
    }
    for (const { name, value } of [...child.attributes]) {
      const ok = ATTRIBUTES.has(name) && (name.startsWith('marker-') ? MARKER_REF.test(value) : SAFE_VALUE.test(value) && !/url\s*\(/i.test(value))
      if (!ok) child.removeAttribute(name)
    }
    clean(child)
  }
}

export function sanitizeDrawing(markup: unknown): string {
  if (typeof markup !== 'string' || !markup) return ''
  const doc = new DOMParser().parseFromString(`<svg xmlns="${SVG}">${markup}</svg>`, 'image/svg+xml')
  const root = doc.documentElement
  if (root.localName !== 'svg' || doc.querySelector('parsererror')) return ''
  clean(root)
  const serializer = new XMLSerializer()
  return [...root.childNodes].filter(n => n.nodeType === 1).map(n => serializer.serializeToString(n)).join('')
}
