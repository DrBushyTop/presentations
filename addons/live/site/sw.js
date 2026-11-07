// Service worker of a sealed viewer site (see unlock.js). The site serves its
// slides encrypted; this opens each file as the page asks for it, with the key
// the viewer's password made. Without the key, or with the wrong one, a sealed
// file is refused. Files that are not sealed pass through as they are.
// A classic worker, not a module: Firefox only runs those.
const MAGIC = [83, 76, 86, 69, 49] // SLVE1
const HEADER = MAGIC.length + 12
// The unlock page checks a password against this one itself.
const RAW = new Set(['/live-check.bin'])

let key

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))
// The unlock page stored a new key.
// A hard-reloaded page asks to be taken over.
self.addEventListener('message', (event) => {
  if (event.data === 'slidev-live-key') key = undefined
  if (event.data === 'slidev-live-claim') event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== location.origin || event.request.mode === 'navigate' || RAW.has(url.pathname))
    return
  event.respondWith(open(event.request))
})

async function open(request, fresh = false) {
  // The whole file, even for a range request: a sealed file only opens whole.
  const cache = fresh ? 'reload' : request.cache === 'only-if-cached' ? 'default' : request.cache
  const response = await fetch(request.url, { credentials: 'same-origin', cache })
  if (!response.ok) return response
  const bytes = new Uint8Array(await response.arrayBuffer())
  const headers = new Headers(response.headers)
  headers.delete('content-length')
  headers.delete('content-range')
  if (!sealed(bytes)) return new Response(bytes, { status: response.status, headers })
  try {
    key ??= await stored()
    if (!key) throw new Error('locked')
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.subarray(MAGIC.length, HEADER) }, key, bytes.subarray(HEADER))
    return new Response(plain, { status: 200, headers })
  }
  catch {
    key = undefined
    // A cached copy can be sealed with an earlier password: fetch it again.
    if (!fresh) return open(request, true)
    return new Response('Locked', { status: 403, headers: { 'content-type': 'text/plain' } })
  }
}

function sealed(bytes) {
  return bytes.length > HEADER && MAGIC.every((b, i) => bytes[i] === b)
}

// The unlock page keeps the key in IndexedDB, as a CryptoKey that cannot be
// read back out.
function stored() {
  return new Promise((resolve) => {
    const request = indexedDB.open('slidev-live', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('keys')
    request.onerror = () => resolve(undefined)
    request.onsuccess = () => {
      const get = request.result.transaction('keys').objectStore('keys').get('content')
      get.onsuccess = () => resolve(get.result?.key)
      get.onerror = () => resolve(undefined)
    }
  })
}
