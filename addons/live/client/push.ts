// Pushes the presenter's tracks to Cloudflare Realtime through the dev
// server, which holds the publish key. The relay shows them to viewers once
// the connection is up, until `stop`.
const ICE = [{ urls: 'stun:stun.cloudflare.com:3478' }]

export type Kind = 'screen' | 'camera'

export interface Outgoing {
  track: MediaStreamTrack
  trackName: string
  encodings?: RTCRtpEncodingParameters[]
  codec?: string
}

export function createPush(kind: Kind) {
  let pc: RTCPeerConnection | undefined
  let id: string | undefined

  async function call(body: Record<string, unknown>, keepalive = false) {
    const res = await fetch('/__slidev-live/media', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-slidev-live': '1' },
      body: JSON.stringify({ kind, ...body }),
      keepalive,
    })
    const result = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(result.error || `The dev server answered ${res.status}`)
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

  // Resolves false when `stop` came first. `lost` runs if the connection
  // fails later.
  async function start(outgoing: Outgoing[], lost: () => void) {
    stop()
    const peer = new RTCPeerConnection({ iceServers: ICE, bundlePolicy: 'max-bundle' })
    pc = peer
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
      sdp: peer.localDescription!.sdp,
      tracks: sent.map(({ transceiver, trackName }) => ({ mid: transceiver.mid, trackName })),
    })
    if (pc !== peer) return false
    id = answer.id
    await peer.setRemoteDescription({ type: 'answer', sdp: answer.sdp })
    await connected(peer)
    if (pc !== peer) return false
    await call({ action: 'on', id })
    if (pc !== peer) return false
    peer.addEventListener('connectionstatechange', () => {
      if (pc !== peer || peer.connectionState !== 'failed') return
      stop()
      lost()
    })
    return true
  }

  function stop(keepalive = false) {
    pc?.close()
    if (id) call({ action: 'off', id }, keepalive).catch(() => {})
    pc = id = undefined
  }

  // Closing the tab ends it; otherwise viewers would keep its last frame.
  addEventListener('pagehide', () => {
    if (id) stop(true)
  })

  return { start, stop }
}
