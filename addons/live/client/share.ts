import { ref } from 'vue'

// The presenter's side of the screen share. The tab captures a screen or a
// window, pushes it to Cloudflare Realtime through the dev server, and the
// relay shows it to every viewer over the slides until the share ends.
// Measured on code at 1920 px: a still screen sends next to nothing, an
// animated demo about 0.9 Mbps at 30 fps, and scrolling the whole screen
// fills 2.5 Mbps at 29 fps, blurred until it stops. At 4 Mbps viewers got
// only 13 fps. Every viewer receives it: 200 viewers take up to 225 GB an
// hour of Realtime's free 1,000 GB a month, far less for still screens.
const MAX_BITRATE = 2_500_000
const ICE = [{ urls: 'stun:stun.cloudflare.com:3478' }]

export const share = {
  state: ref<'off' | 'starting' | 'live'>('off'),
  error: ref(''),
  start,
  stop,
}

let pc: RTCPeerConnection | undefined
let stream: MediaStream | undefined
let id: string | undefined

async function call(body: Record<string, unknown>, keepalive = false) {
  const res = await fetch('/__slidev-live/screen', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-slidev-live': '1' },
    body: JSON.stringify(body),
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

async function start() {
  if (share.state.value !== 'off') return
  share.state.value = 'starting'
  share.error.value = ''
  try {
    // A Retina screen comes down to 1920 px: as sharp on viewers' screens as
    // full size at the same bitrate, and full size needs far more bits.
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 30, max: 30 }, width: { max: 1920 }, height: { max: 1080 } },
      audio: false,
      // Not the presenter view itself, but let the presenter switch what is
      // shared from the browser's own bar.
      selfBrowserSurface: 'exclude',
      surfaceSwitching: 'include',
    } as DisplayMediaStreamOptions)
    const track = stream.getVideoTracks()[0]
    // Keep text sharp; drop frames rather than resolution.
    track.contentHint = 'detail'
    track.addEventListener('ended', () => stop())
    const peer = new RTCPeerConnection({ iceServers: ICE, bundlePolicy: 'max-bundle' })
    pc = peer
    const transceiver = peer.addTransceiver(track, {
      direction: 'sendonly',
      sendEncodings: [{ maxBitrate: MAX_BITRATE, maxFramerate: 30 }],
    })
    // VP8: H.264, VP9 and AV1 encode a screen this size in software and drop
    // to a few frames a second while it moves.
    const codecs = RTCRtpSender.getCapabilities('video')?.codecs ?? []
    const vp8 = codecs.filter(codec => codec.mimeType.toLowerCase() === 'video/vp8')
    if (vp8.length) transceiver.setCodecPreferences([...vp8, ...codecs.filter(codec => !vp8.includes(codec))])
    await peer.setLocalDescription(await peer.createOffer())
    const answer = await call({
      action: 'publish',
      sdp: peer.localDescription!.sdp,
      tracks: [{ mid: transceiver.mid, trackName: 'screen' }],
    })
    if (pc !== peer) return
    id = answer.id
    await peer.setRemoteDescription({ type: 'answer', sdp: answer.sdp })
    await connected(peer)
    await call({ action: 'on', id })
    if (pc !== peer) return
    share.state.value = 'live'
    peer.addEventListener('connectionstatechange', () => {
      if (pc === peer && peer.connectionState === 'failed') stop('The screen share lost its connection.')
    })
  }
  catch (error: any) {
    // Cancelling the browser's picker is not an error.
    stop(error?.name === 'NotAllowedError' ? '' : String(error?.message ?? error))
  }
}

function stop(message = '', keepalive = false) {
  stream?.getTracks().forEach(track => track.stop())
  pc?.close()
  if (id) call({ action: 'off', id }, keepalive).catch(() => {})
  stream = pc = id = undefined
  share.state.value = 'off'
  share.error.value = message
  if (message) console.error(`[live] ${message}`)
}

// Closing the presenter tab ends the share; otherwise viewers would keep its
// last frame.
addEventListener('pagehide', () => {
  if (id) stop('', true)
})
