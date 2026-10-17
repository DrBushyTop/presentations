// Describes a picked slide element so an agent can find where it comes from.

// Slidev and Vue add these while animating; they say nothing about the source.
const NOISE = /^(slidev-vclick|v-click|slidev-page|slidev-layout$|v-enter|v-leave|fade|router-link)/

const stableClasses = (el) => [...el.classList].filter((c) => !NOISE.test(c) && !c.includes(':')).slice(0, 3)

export function elementLabel(el) {
  const tag = el.tagName.toLowerCase()
  return `${tag}${el.id ? `#${el.id}` : ''}${stableClasses(el).map((c) => `.${CSS.escape(c)}`).join('')}`
}

/** A CSS path from the slide page down to the element. */
export function cssPath(el, root) {
  const parts = []
  for (let node = el; node && node !== root && !node.classList.contains('slidev-page'); node = node.parentElement) {
    if (node.id && !node.id.startsWith('slide') && document.querySelectorAll(`#${CSS.escape(node.id)}`).length === 1) {
      parts.unshift(`#${CSS.escape(node.id)}`)
      break
    }
    let part = node.tagName.toLowerCase() + stableClasses(node).slice(0, 2).map((c) => `.${CSS.escape(c)}`).join('')
    const sameTag = node.parentElement ? [...node.parentElement.children].filter((c) => c.tagName === node.tagName) : []
    if (sameTag.length > 1) part += `:nth-of-type(${sameTag.indexOf(node) + 1})`
    parts.unshift(part)
  }
  return parts.join(' > ')
}

/** Source files of the Vue components that rendered the element, innermost first. Dev builds only. */
export function vueComponents(el) {
  const files = []
  for (let node = el; node && files.length === 0; node = node.parentElement) {
    for (let inst = node.__vueParentComponent; inst && files.length < 5; inst = inst.parent) {
      const file = inst.type?.__file
      if (!file || file.includes('/node_modules/') || files.includes(file)) continue
      files.push(file)
      if (file.includes('__slidev_')) return files // reached the slide itself
    }
  }
  return files
}

function htmlSnippet(el) {
  const html = el.outerHTML.replace(/\s(data-v-[\w-]+|data-slidev-[\w-]+)(="[^"]*")?/g, '').replace(/\s+/g, ' ')
  return html.length > 900 ? `${html.slice(0, 900)}…` : html
}

export function describeElement(el, root) {
  return {
    label: elementLabel(el),
    text: (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200),
    selector: cssPath(el, root),
    html: htmlSnippet(el),
    components: vueComponents(el),
  }
}
