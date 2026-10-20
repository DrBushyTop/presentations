// The viewer's side of the screen share and the camera. While the presenter
// shares a screen, a video covers the slides; while Slidev's camera bubble is
// on, a bubble shows it here too. The presenter's voice plays only after the
// viewer chooses to listen: in the room it would echo.
// Each viewer keeps one connection to Cloudflare Realtime for the whole talk,
// opened when the page opens. Opening one takes a moment, and an audience
// opening the page at once is spread over a minute or so; a share then only
// adds its tracks to connections that are already up.
const ICE = [{ urls: 'stun:stun.cloudflare.com:3478' }]
const KINDS = ['screen', 'camera'] as const
type Kind = typeof KINDS[number]
export interface Media { id: string, tracks: string[] }
export type Shown = Partial<Record<Kind, Media>>

export function createMedia(relay: string) {
  const base = relay.replace(/^ws/, 'http').replace(/\/$/, '')
  const screen = document.createElement('video')
  screen.className = 'slidev-live-screen'
  // The listen button sits next to the camera bubble, in the corner where
  // Slidev puts it.
  const corner = document.createElement('div')
  corner.className = 'slidev-live-corner'
  const bubble = document.createElement('div')
  bubble.className = 'slidev-live-camera'
  const camera = document.createElement('video')
  bubble.append(camera)
  for (const video of [screen, camera]) {
    video.muted = true
    video.autoplay = true
    video.playsInline = true
  }
  const listen = document.createElement('button')
  listen.type = 'button'
  listen.className = 'slidev-live-listen'
  // One stream for the voice, played from the viewer's click: browsers only
  // let audio play after one. A new voice track replaces the one in it. It
  // goes in the element only then: an empty stream holds up the page's load.
  const voice = new MediaStream()
  const audio = new Audio()
  screen.hidden = bubble.hidden = listen.hidden = true
  corner.append(listen, bubble)
  document.body.append(screen, corner)

  let pc: RTCPeerConnection | undefined
  let token: string | undefined
  let connecting: Promise<void> | undefined
  // What should be shown, what this connection has pulled, and which share
  // each incoming track belongs to.
  let wanted: Shown = {}
  let pulled: Partial<Record<Kind, { id: string, names: Set<string> }>> = {}
  const mids = new Map<string, { id: string, name: string }>()
  // The share each track on screen (or in the voice stream) comes from.
  const showing = new Map<string, string>()
  const kindOf = (name: string): Kind => name === 'screen' ? 'screen' : 'camera'
  let closing: ReturnType<typeof setTimeout> | undefined
  let listening = false
  let active = false
  let retry = 1000
  let timer: ReturnType<typeof setTimeout> | undefined
  // Changes to one SFU session must not overlap.
  let queue = Promise.resolve()

  // No content type: a simple request needs no CORS preflight. A refusal
  // (`clean`) left the SFU session as it was; any other failure may have
  // changed it.
  async function post(step: string, body: unknown) {
    const res = await fetch(`${base}/watch?step=${step}`, { method: 'POST', body: JSON.stringify(body), signal: AbortSignal.timeout(15_000) })
    const result = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(result.error || `${res.status}`), { clean: [400, 409, 429, 503].includes(res.status) })
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

  function received(event: RTCTrackEvent) {
    const from = mids.get(event.transceiver.mid ?? '')
    if (!from) return
    const video = from.name === 'screen' ? screen : from.name === 'camera' ? camera : undefined
    showing.set(from.name, from.id)
    if (video) {
      // Play frames as soon as they arrive. A frozen frame is worse than a
      // dropped one. The voice keeps its buffer: gaps in speech are worse.
      if ('jitterBufferTarget' in event.receiver) (event.receiver as any).jitterBufferTarget = 0
      video.srcObject = new MediaStream([event.track])
      video.play().catch(() => {})
      return
    }
    for (const old of voice.getTracks()) voice.removeTrack(old)
    voice.addTrack(event.track)
    if (listening) audio.play().catch(() => {})
  }

  function connect() {
    connecting ??= (async () => {
      const peer = new RTCPeerConnection({ iceServers: ICE, bundlePolicy: 'max-bundle' })
      pc = peer
      pulled = {}
      mids.clear()
      peer.ontrack = received
      peer.onconnectionstatechange = () => {
        if (pc === peer && peer.connectionState === 'failed') reset()
      }
      const opened = await post('connect', {})
      token = opened.token
      await answer(peer, opened.sdp)
      await connected(peer)
    })().catch((error) => {
      console.warn('[live] media connection', error)
      reset()
      throw error
    })
    return connecting
  }

  function close() {
    pc?.close()
    clearTimeout(closing)
    pc = token = connecting = undefined
    pulled = {}
    mids.clear()
    for (const name of ['screen', 'camera', 'voice']) drop(name)
    render()
  }

  // Starts over with a new connection, after a pause.
  function reset() {
    close()
    later()
  }

  function later() {
    clearTimeout(timer)
    timer = setTimeout(sync, retry * (0.5 + Math.random()))
    retry = Math.min(retry * 2, 30_000)
  }

  // Dropping a track means showing it again pulls it afresh.
  function drop(name: string) {
    showing.delete(name)
    if (name === 'voice') for (const old of voice.getTracks()) voice.removeTrack(old)
    else (name === 'screen' ? screen : camera).srcObject = null
  }

  function render() {
    screen.hidden = !active || !shows(screen, 'screen')
    bubble.hidden = !active || !shows(camera, 'camera')
    listen.hidden = !active || !wanted.camera?.tracks.includes('voice')
    listen.textContent = listening ? 'Mute presenter' : 'Listen to presenter'
    listen.classList.toggle('on', listening)
    listen.setAttribute('aria-pressed', String(listening))
  }

  // An element shows its share from its first frame, so viewers never see
  // an empty box.
  const playing = new Set<HTMLVideoElement>()
  function shows(video: HTMLVideoElement, name: string) {
    const id = wanted[kindOf(name)]?.id
    return !!id && showing.get(name) === id && playing.has(video)
  }
  for (const video of [screen, camera]) {
    video.addEventListener('playing', () => {
      playing.add(video)
      render()
    })
    video.addEventListener('emptied', () => {
      playing.delete(video)
      render()
    })
  }

  // The tracks of a kind this viewer should receive.
  function names(kind: Kind) {
    const tracks = wanted[kind]?.tracks ?? []
    return tracks.filter(name => name !== 'voice' || listening)
  }

  // Tracks of shares that ended. Each new share adds tracks to the
  // connection, so ended ones are closed, a few seconds later and at a random
  // moment so the audience does not ask at once.
  function obsolete() {
    const ids = new Set(KINDS.map(kind => wanted[kind]?.id))
    return [...mids].filter(([, from]) => !ids.has(from.id)).map(([mid]) => mid)
  }
  function closeLater() {
    if (closing || !obsolete().length) return
    closing = setTimeout(() => {
      closing = undefined
      queue = queue.then(async () => {
        const peer = pc
        const ended = obsolete()
        if (!peer || !token || !ended.length) return
        for (const transceiver of peer.getTransceivers()) {
          if (ended.includes(transceiver.mid ?? '')) transceiver.stop()
        }
        for (const mid of ended) mids.delete(mid)
        await peer.setLocalDescription(await peer.createOffer())
        const closed = await post('close', { token, mids: ended, sdp: peer.localDescription!.sdp })
        if (pc === peer) await peer.setRemoteDescription({ type: 'answer', sdp: closed.sdp })
      }).catch(failed)
    }, 2000 + Math.random() * 8000)
  }

  // A refusal leaves the connection usable: try again later. Anything else
  // may have left the SFU and this connection disagreeing, so start over.
  function failed(error: any) {
    if (!pc || !connecting) return
    console.warn('[live] media', error)
    if (error?.clean) later()
    else reset()
  }

  // Brings the connection in line with what should be shown.
  function sync() {
    queue = queue.then(async () => {
      if (!active) return
      await connect()
      for (const kind of KINDS) {
        const want = wanted[kind]
        if (!want) continue
        if (pulled[kind]?.id !== want.id) pulled[kind] = { id: want.id, names: new Set() }
        const missing = names(kind).filter(name => !pulled[kind]!.names.has(name))
        if (!missing.length) continue
        const peer = pc!
        const offer = await post('pull', { token, kind, tracks: missing })
        if (pc !== peer) return
        // The SFU has added the tracks either way, so the offer is answered
        // even if another share started meanwhile.
        for (const { mid, trackName } of offer.tracks ?? []) mids.set(mid, { id: offer.id, name: trackName })
        await answer(peer, offer.sdp)
        if (offer.id === pulled[kind]?.id) for (const { trackName } of offer.tracks ?? []) pulled[kind]!.names.add(trackName)
      }
      // A share that started meanwhile was announced, and its turn is queued.
      retry = 1000
      closeLater()
    }).catch(failed)
  }

  listen.addEventListener('click', () => {
    listening = !listening
    audio.muted = !listening
    // Within the click, so the browser lets it play.
    if (listening) {
      audio.srcObject ??= voice
      audio.play().catch(() => {})
      sync()
    }
    render()
  })

  ;(window as any).__slidevLiveMedia = { screen, camera, audio, listen, pc: () => pc }

  return {
    // While the talk is live, keep a connection ready.
    active(on: boolean) {
      if (on === active) return
      active = on
      if (on) return sync()
      wanted = {}
      clearTimeout(timer)
      close()
    },
    // What the presenter shows now.
    show(next: Shown | undefined) {
      wanted = { ...next }
      for (const name of ['screen', 'camera', 'voice']) {
        if (showing.get(name) !== wanted[kindOf(name)]?.id) drop(name)
      }
      render()
      closeLater()
      if (KINDS.some(kind => wanted[kind])) sync()
    },
  }
}
