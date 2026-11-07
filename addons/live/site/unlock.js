// The page a sealed viewer site opens with. With `npm run live --password`,
// every file of the slides is published encrypted (scripts/live.mjs), and the
// page itself holds only this script and the list of the app's files. The
// viewer enters the password here; the key made from it opens a check file,
// goes to IndexedDB for the service worker (sw.js), which opens every file the
// app asks for, and then the app starts in this same page. The click on Join
// counts as the viewer's go-ahead for sound, so no second click is needed.
import { buildCard, takeLinkPassword } from './card.js'
import { derive, MAGIC } from './derive.js'

const config = JSON.parse(document.getElementById('slidev-live-sealed').textContent)
const RELAY_KEY = 'slidev-live-key'
const HEADER = MAGIC.length + 12
const card = buildCard()
const { backdrop, form, field, input, error, go, hint } = card
input.value = takeLinkPassword()

function show({ asking = true, message = '', busy = false } = {}) {
  backdrop.hidden = false
  field.hidden = !asking
  go.hidden = !asking
  hint.hidden = !asking
  go.disabled = busy
  go.textContent = busy ? 'Opening…' : 'Join'
  error.hidden = !message
  error.textContent = message
}

// The page has to be under the service worker before the app's files load.
async function worker() {
  const sw = navigator.serviceWorker
  await sw.register('/live-sw.js')
  await sw.ready
  if (sw.controller) return true
  // A hard reload skips the worker until it claims the page.
  const claimed = new Promise(resolve => sw.addEventListener('controllerchange', () => resolve(true), { once: true }))
  sw.ready.then(registration => registration.active?.postMessage('slidev-live-claim'))
  return Promise.race([claimed, new Promise(resolve => setTimeout(() => resolve(false), 3000))])
}

function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('slidev-live', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('keys')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function load() {
  try {
    const db = await database()
    return await new Promise((resolve) => {
      const get = db.transaction('keys').objectStore('keys').get('content')
      get.onsuccess = () => resolve(get.result)
      get.onerror = () => resolve(undefined)
    })
  }
  catch {
    return undefined
  }
}

async function save(entry) {
  const db = await database()
  await new Promise((resolve, reject) => {
    const tx = db.transaction('keys', 'readwrite')
    tx.objectStore('keys').put(entry, 'content')
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

// Whether a key opens this build's check file.
async function opens(key) {
  try {
    const res = await fetch('/live-check.bin', { cache: 'no-store' })
    const bytes = new Uint8Array(await res.arrayBuffer())
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.subarray(MAGIC.length, HEADER) }, key, bytes.subarray(HEADER))
    return new TextDecoder().decode(plain) === 'slidev-live'
  }
  catch {
    return false
  }
}

// The app's styles, preloads and entry, in the order the build had them.
function launch(relay) {
  try {
    sessionStorage.setItem(RELAY_KEY, relay)
  }
  catch {}
  backdrop.remove()
  // Styles and preloads first, then the entry.
  const app = [...config.app].sort(([a], [b]) => (a === 'script') - (b === 'script'))
  for (const [tag, attrs] of app) {
    const el = document.createElement(tag)
    for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value)
    document.head.append(el)
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!input.value.trim()) return input.focus()
  show({ busy: true })
  const { content, relay } = await derive(input.value, config.deck)
  const key = await crypto.subtle.importKey('raw', content, 'AES-GCM', false, ['decrypt'])
  if (!(await opens(key))) {
    show({ message: 'That password didn\'t work. Try again.' })
    input.select()
    return
  }
  try {
    await save({ key, relay })
  }
  catch {
    return show({ asking: false, message: 'This browser can\'t keep the key for the slides. Try a regular window, not a private one.' })
  }
  navigator.serviceWorker.controller?.postMessage('slidev-live-key')
  launch(relay)
})

async function main() {
  show({ asking: false, message: '' })
  go.textContent = 'Join'
  if (!('serviceWorker' in navigator) || !window.isSecureContext || !(await worker().catch(() => false))) {
    return show({ asking: false, message: 'This browser can\'t open these slides here. Open the link in a regular window, not a private one.' })
  }
  // This tab, or another one, joined before: no password needed. The app
  // asks for the click that turns sound on.
  const saved = await load()
  if (saved?.key && await opens(saved.key)) return launch(saved.relay)
  show()
  if (!input.value) input.focus({ preventScroll: true })
}

main()
