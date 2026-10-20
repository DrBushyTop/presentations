// The viewer's side of the screen share: while the presenter shares, a video
// covers the slides. Each viewer keeps one connection to Cloudflare Realtime
// for the whole talk, opened when the page opens. Opening one takes a moment,
// and an audience opening the page at once is spread over a minute or so;
// a share then only adds its video to connections that are already up.
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

  let pc: RTCPeerConnection | undefined
  let token: string | undefined
  let connecting: Promise<void> | undefined
  // The share to show, and the one this connection has pulled.
  let wanted: string | undefined
  let pulled: string | undefined
  let active = false
  let retry = 1000
  let timer: ReturnType<typeof setTimeout> | undefined
  // Changes to one SFU session must not overlap.
  let queue = Promise.resolve()

  // No content type: a simple request needs no CORS preflight.
  async function post(step: string, body: unknown) {
    const res = await fetch(`${base}/watch?step=${step}`, { method: 'POST', body: JSON.stringify(body) })
    const result = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(result.error || `${res.status}`)
    return result
  }

  async function answer(peer: RTCPeerConnection, offer: string) {
    await peer.setRemoteDescription({ type: 'offer', sdp: offer })
    await peer.setLocalDescription(await peer.createAnswer())
    await post('answer', { token, sdp: peer.localDescription!.sdp })
  }

  function connected(peer: RTCPeerConnection) {
    return new Promise<void>((resolve, reject) => {
      const check = () => {
        if (peer.connectionState === 'connected') resolve()
        else if (['failed', 'closed'].includes(peer.connectionState)) reject(new Error(`connection ${peer.connectionState}`))
      }
      peer.addEventListener('connectionstatechange', check)
      setTimeout(() => reject(new Error('connection timed out')), 30_000)
      check()
    })
  }

  function connect() {
    connecting ??= (async () => {
      const peer = new RTCPeerConnection({ iceServers: ICE, bundlePolicy: 'max-bundle' })
      pc = peer
      pulled = undefined
      peer.ontrack = (event) => {
        // Play frames as soon as they arrive. A frozen frame is worse than
        // a dropped one.
        if ('jitterBufferTarget' in event.receiver) (event.receiver as any).jitterBufferTarget = 0
        video.srcObject = new MediaStream([event.track])
        video.play().catch(() => {})
      }
      peer.onconnectionstatechange = () => {
        if (pc === peer && peer.connectionState === 'failed') reset()
      }
      const opened = await post('connect', {})
      token = opened.token
      await answer(peer, opened.sdp)
      await connected(peer)
    })().catch((error) => {
      console.warn('[live] screen share connection', error)
      reset()
      throw error
    })
    return connecting
  }

  // Starts over with a new connection, after a pause.
  function reset() {
    pc?.close()
    pc = token = connecting = pulled = undefined
    hide()
    clearTimeout(timer)
    timer = setTimeout(sync, retry * (0.5 + Math.random()))
    retry = Math.min(retry * 2, 30_000)
  }

  // Hiding drops the video, so showing it again pulls it afresh.
  function hide() {
    video.hidden = true
    video.srcObject = null
    pulled = undefined
  }

  // Brings the connection in line with what should be shown.
  function sync() {
    queue = queue.then(async () => {
      if (!active) return
      await connect()
      if (!wanted || wanted === pulled) return
      const peer = pc!
      const offer = await post('pull', { token })
      // Another share started meanwhile; it gets its own turn.
      if (offer.id !== wanted || pc !== peer) return
      await answer(peer, offer.sdp)
      pulled = offer.id
      retry = 1000
    }).catch((error) => {
      if (!pc || !connecting) return
      console.warn('[live] screen share', error)
      clearTimeout(timer)
      timer = setTimeout(sync, retry * (0.5 + Math.random()))
      retry = Math.min(retry * 2, 30_000)
    })
  }

  // Shown from the first frame, so viewers never see an empty box.
  video.addEventListener('playing', () => {
    if (wanted && wanted === pulled) video.hidden = false
  })

  ;(window as any).__slidevLiveScreen = video

  return {
    // While the talk is live, keep a connection ready.
    active(on: boolean) {
      if (on === active) return
      active = on
      if (on) return sync()
      wanted = undefined
      clearTimeout(timer)
      pc?.close()
      pc = token = connecting = pulled = undefined
      hide()
    },
    // The share to show, or none.
    show(id: string | undefined) {
      if (id === wanted) return
      wanted = id
      if (!id || id !== pulled) hide()
      if (id) sync()
    },
  }
}
