// The viewer's side of the screen share: while the presenter shares, a video
// covers the slides. Each viewer pulls the share from Cloudflare Realtime
// into a connection of its own, set up through the relay.
const ICE = [{ urls: 'stun:stun.cloudflare.com:3478' }]

export function createScreen(relay: string) {
  const base = relay.replace(/^ws/, 'http').replace(/\/$/, '')
  const video = document.createElement('video')
  video.className = 'slidev-live-screen'
  video.muted = true
  video.autoplay = true
  video.playsInline = true
  video.hidden = true
  document.body.append(video)

  let wanted: string | undefined
  let pc: RTCPeerConnection | undefined
  let retry = 1000
  let timer: ReturnType<typeof setTimeout> | undefined

  // No content type: a simple request needs no CORS preflight.
  async function post(path: string, body: unknown) {
    const res = await fetch(`${base}${path}`, { method: 'POST', body: JSON.stringify(body) })
    const result = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(result.error || `${res.status}`)
    return result
  }

  function close() {
    clearTimeout(timer)
    pc?.close()
    pc = undefined
    video.hidden = true
    video.srcObject = null
  }

  function again(id: string) {
    close()
    timer = setTimeout(() => connect(id), retry * (0.5 + Math.random()))
    retry = Math.min(retry * 2, 15_000)
  }

  async function connect(id: string) {
    if (wanted !== id) return
    const peer = new RTCPeerConnection({ iceServers: ICE, bundlePolicy: 'max-bundle' })
    pc = peer
    try {
      const offer = await post('/watch', {})
      // A newer share started meanwhile; its own message follows.
      if (pc !== peer || offer.id !== id) return peer.close()
      peer.ontrack = (event) => {
        // Play frames as soon as they arrive. A frozen frame is worse than
        // a dropped one.
        if ('jitterBufferTarget' in event.receiver) (event.receiver as any).jitterBufferTarget = 0
        video.srcObject = new MediaStream([event.track])
        video.play().catch(() => {})
      }
      peer.onconnectionstatechange = () => {
        if (pc === peer && peer.connectionState === 'failed') again(id)
      }
      await peer.setRemoteDescription({ type: 'offer', sdp: offer.sdp })
      await peer.setLocalDescription(await peer.createAnswer())
      await post('/watch?step=answer', { token: offer.token, sdp: peer.localDescription!.sdp })
    }
    catch (error) {
      if (pc !== peer) return
      console.warn('[live] screen share', error)
      again(id)
    }
  }

  // Shown from the first frame, so viewers never see an empty box.
  video.addEventListener('playing', () => {
    if (pc) {
      video.hidden = false
      retry = 1000
    }
  })

  ;(window as any).__slidevLiveScreen = video

  return {
    // The share to show, or none.
    show(id: string | undefined) {
      if (id === wanted) return
      wanted = id
      close()
      retry = 1000
      if (id) connect(id)
    },
  }
}
