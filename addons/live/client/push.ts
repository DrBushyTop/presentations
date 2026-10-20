// Pushes the presenter's tracks to Cloudflare Realtime through the dev
// server, which holds the publish key. The relay shows them to viewers once
// the connection is up, until `stop`.
const ICE = [{ urls: 'stun:stun.cloudflare.com:3478' }]

export type Kind = 'screen' | 'camera'

// Why a share ended without its tab asking: its connection failed, another
// tab replaced it, or the talk is no longer live from this dev server.
export type Ended = 'lost' | 'replaced' | 'stopped'

export interface Outgoing {
  track: MediaStreamTrack
  trackName: string
  encodings?: RTCRtpEncodingParameters[]
  codec?: string
}

export function createPush(kind: Kind) {
  let pc: RTCPeerConnection | undefined
  // Names the current attempt, from before it publishes until it stops.
  let id: string | undefined
  let live = false
  let ended: ((why: Ended) => void) | undefined
  // The order of this attempt's `on` among all shares of this kind, and the
  // latest one the dev server announced.
  let seq = 0
  let latest = 0
  // This dev server no longer publishes: nothing can start again.
  let stopped = false

  async function call(body: Record<string, unknown>, keepalive = false) {
    const res = await fetch('/__slidev-live/media', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-slidev-live': '1' },
      body: JSON.stringify({ kind, ...body }),
      keepalive,
    })
    const result = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(result.error || `The dev server answered ${res.status}`), { status: res.status })
    return result
  }

  function connected(peer: RTCPeerConnection) {
    return new Promise<void>((resolve, reject) => {
      const check = () => {
        if (peer.connectionState === 'connected') resolve()
        else if (['failed', 'closed'].includes(peer.connectionState)) reject(new Error('Could not connect to Cloudflare Realtime'))
      }
      peer.addEventListener('connectionstatechange', check)
      setTimeout(() => reject(new Error('Timed out connecting to Cloudflare Realtime')), 15_000)
      check()
    })
  }

  // Resolves false, and never throws, once `stop` or a newer start came
  // first. `onEnded` runs if the share ends later without `stop`.
  async function start(outgoing: Outgoing[], onEnded: (why: Ended) => void) {
    stop()
    if (stopped) throw Object.assign(new Error('This dev server no longer publishes to the live site.'), { status: 409 })
    const mine = id = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('')
    const current = () => id === mine
    const peer = pc = new RTCPeerConnection({ iceServers: ICE, bundlePolicy: 'max-bundle' })
    ended = onEnded
    try {
      const sent = outgoing.map(({ track, trackName, encodings, codec }) => {
        const transceiver = peer.addTransceiver(track, { direction: 'sendonly', sendEncodings: encodings })
        const codecs = RTCRtpSender.getCapabilities(track.kind)?.codecs ?? []
        const preferred = codecs.filter(c => c.mimeType.toLowerCase() === codec)
        if (preferred.length) transceiver.setCodecPreferences([...preferred, ...codecs.filter(c => !preferred.includes(c))])
        return { transceiver, trackName }
      })
      await peer.setLocalDescription(await peer.createOffer())
      const answer = await call({
        action: 'publish',
        id: mine,
        sdp: peer.localDescription!.sdp,
        tracks: sent.map(({ transceiver, trackName }) => ({ mid: transceiver.mid, trackName })),
      })
      if (!current()) return false
      await peer.setRemoteDescription({ type: 'answer', sdp: answer.sdp })
      await connected(peer)
      if (!current()) return false
      const on = await call({ action: 'on', id: mine })
      if (!current()) return false
      // Another tab's share went on after this one while the answer was on
      // its way.
      seq = on.seq ?? 0
      if (latest > seq) {
        end('replaced')
        return false
      }
      live = true
      peer.addEventListener('connectionstatechange', () => {
        if (current() && peer.connectionState === 'failed') end('lost')
      })
      return true
    }
    catch (error) {
      if (!current()) return false
      throw error
    }
  }

  function stop(keepalive = false) {
    pc?.close()
    if (id) call({ action: 'off', id }, keepalive).catch(() => {})
    pc = id = ended = undefined
    live = false
    seq = 0
  }

  function end(why: Ended) {
    const notify = ended
    stop()
    notify?.(why)
  }

  // The dev server tells every tab which share is live, and when the talk
  // stopped publishing (taken over or stopped): the relay has cut this tab's
  // tracks off by then, so stop capturing too.
  import.meta.hot?.on('slidev-live:media', (data: { kind?: Kind, id?: string, seq?: number, stopped?: boolean }) => {
    if (data.stopped) {
      stopped = true
      if (id) end('stopped')
      return
    }
    if (data.kind !== kind || !data.seq) return
    latest = Math.max(latest, data.seq)
    if (live && data.seq > seq) end('replaced')
  })

  // Closing the tab ends it; otherwise viewers would keep its last frame.
  addEventListener('pagehide', () => {
    if (id) stop(true)
  })

  return { start, stop }
}
