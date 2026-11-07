// What a talk's password opens, worked out the same way by `npm run live`
// (Node) and by the viewer page: PBKDF2 over the password, salted with the
// deck's name, gives 64 bytes. The first 32 are the AES-GCM key the published
// slides are sealed with; the rest, as hex, is the key the relay asks for.
// The relay only ever sees that key's SHA-256 (the lock), set by the dev
// server. Slow on purpose: the sealed files are public, so a guess costs this
// much every time.
export const ITERATIONS = 300_000

export async function derive(password, deck) {
  const text = new TextEncoder()
  const base = await crypto.subtle.importKey('raw', text.encode(password.trim()), 'PBKDF2', false, ['deriveBits'])
  const bits = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: text.encode(`slidev-live:${deck}`), iterations: ITERATIONS },
    base,
    512,
  ))
  return { content: bits.slice(0, 32), relay: hex(bits.slice(32)) }
}

export function hex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
}

// Sealed files start with this, then a 12-byte IV, then the AES-GCM
// ciphertext with its tag.
export const MAGIC = 'SLVE1'
