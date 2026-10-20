// The viewer's side of the screen share and the camera. While the presenter
// shares a screen, a video covers the slides; while Slidev's camera bubble is
// on, a bubble shows it here too, with the presenter's voice if a microphone
// is on. Browsers only play sound after the viewer has touched the page, so
// until then a button asks for it, and the first touch anywhere turns it on.
// A viewer who mutes it stays muted in that tab.
// Each viewer keeps one connection to Cloudflare Realtime for the whole talk,
// opened when the page opens. Opening one takes a moment, and an audience
// opening the page at once is spread over a minute or so; a share then only
// adds its tracks to connections that are already up.
const ICE = [{ urls: 'stun:stun.cloudflare.com:3478' }]
const KINDS = ['screen', 'camera'] as const
const VOLUME = 'slidev-live-volume'
const MUTED = 'slidev-live-muted'
const SPEAKER = '<path d="M4 9h4l5-4v14l-5-4H4z"/>'
const ICONS = {
  on: `${SPEAKER}<path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13"/>`,
  muted: `${SPEAKER}<path d="M16.5 9l6 6M22.5 9l-6 6"/>`,
}
type Kind = typeof KINDS[number]
export interface Media { id: string, tracks: string[] }
export type Shown = Partial<Record<Kind, Media>>

export function createMedia(relay: string) {
  const base = relay.replace(/^ws/, 'http').replace(/\/$/, '')
  const screen = document.createElement('video')
  screen.className = 'slidev-live-screen'
  // The speaker button sits next to the camera bubble, in the corner where
  // Slidev puts it. It opens a panel with mute and the volume.
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
  const sound = document.createElement('div')
  sound.className = 'slidev-live-sound'
  const listen = document.createElement('button')
  listen.type = 'button'
  listen.className = 'slidev-live-listen'
  listen.title = 'Presenter\'s sound'
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  icon.setAttribute('viewBox', '0 0 24 24')
  icon.setAttribute('aria-hidden', 'true')
  const label = document.createElement('span')
  label.textContent = 'Turn on sound'
  listen.append(icon, label)
  const panel = document.createElement('div')
  panel.className = 'slidev-live-panel'
  const mute = document.createElement('button')
  mute.type = 'button'
  mute.className = 'slidev-live-mute'
  const volume = document.createElement('input')
  volume.type = 'range'
  volume.className = 'slidev-live-volume'
  volume.min = '0'
  volume.max = '1'
  volume.step = '0.05'
  volume.setAttribute('aria-label', 'Presenter volume')
  panel.append(mute, volume)
  sound.append(panel, listen)
  // One stream for the voice. A new voice track replaces the one in it. It
  // goes in the element only with a track: an empty stream holds up the
  // page's load.
  const voice = new MediaStream()
  const audio = new Audio()
  // Remembered between talks. iPhones and iPads ignore a page's volume: their
  // own buttons set it, so they get no slider.
  audio.volume = volume.valueAsNumber = Math.min(1, Math.max(0, Number(localStorage.getItem(VOLUME) ?? 1) || 0))
  const adjustable = (() => {
    const probe = new Audio()
    probe.volume = 0.5
    return probe.volume === 0.5
  })()
  volume.addEventListener('input', () => {
    audio.volume = volume.valueAsNumber
    localStorage.setItem(VOLUME, String(audio.volume))
    // Turning it up while muted means the viewer wants to hear it.
    if (!listening) setListening(true)
  })
  screen.hidden = bubble.hidden = sound.hidden = true
  corner.append(sound, bubble)
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
  let listening = sessionStorage.getItem(MUTED) !== '1'
  audio.muted = !listening
  // The browser refused to play sound before the viewer touched the page.
  let blocked = false
  let open = false
  let shownIcon = ''
  let active = false
  let retry = 1000
  let timer: ReturnType<typeof setTimeout> | undefined
  // Changes to one SFU session must not overlap.
  let queue = Promise.resolve()

  // No content type: a simple request needs no CORS preflight. A refused
  // pull (`clean`) left the SFU session and this connection as they were.
  // Anything else may have left them disagreeing: an answer or a close is
  // refused only after this connection changed its own side.
  async function post(step: string, body: unknown) {
    const res = await fetch(`${base}/watch?step=${step}`, { method: 'POST', body: JSON.stringify(body), signal: AbortSignal.timeout(15_000) })
    const result = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(result.error || `${res.status}`), { clean: step === 'pull' && [400, 409, 429, 503].includes(res.status) })
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
    audio.srcObject ??= voice
    if (listening) play()
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
    pc = token = connecting = closing = undefined
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
    sound.hidden = !active || !wanted.camera?.tracks.includes('voice')
    const state = !listening ? 'muted' : blocked ? 'blocked' : 'on'
    if (sound.hidden || state === 'blocked') open = false
    listen.dataset.state = state
    const drawn = state === 'muted' ? ICONS.muted : ICONS.on
    if (shownIcon !== drawn) icon.innerHTML = shownIcon = drawn
    label.hidden = state !== 'blocked'
    // Without a volume to set there is nothing to open: the button mutes.
    listen.setAttribute('aria-label', state === 'blocked' ? 'Turn on sound' : adjustable ? 'Presenter\'s sound' : listening ? 'Mute presenter' : 'Unmute presenter')
    if (adjustable) listen.setAttribute('aria-expanded', String(open))
    panel.hidden = !open
    panel.classList.toggle('muted', !listening)
    mute.textContent = listening ? 'Mute' : 'Unmute'
    mute.setAttribute('aria-pressed', String(!listening))
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

  function play() {
    audio.play().then(() => {
      blocked = false
      render()
    }, (error) => {
      // Not allowed yet: wait for the viewer to touch the page.
      if (error?.name === 'NotAllowedError') blocked = true
      render()
    })
  }

  function setListening(on: boolean) {
    listening = on
    audio.muted = !on
    sessionStorage.setItem(MUTED, on ? '0' : '1')
    if (on) {
      if (audio.srcObject) play()
      sync()
    }
    render()
  }

  // Any touch, click or key counts as the viewer's go-ahead. The sound
  // controls handle their own clicks. A touch elsewhere, or Escape, closes
  // the panel.
  for (const type of ['pointerdown', 'keydown', 'touchend']) {
    addEventListener(type, (event) => {
      const inside = sound.contains(event.target as Node)
      if (blocked && listening && audio.srcObject && !inside) play()
      if (open && ((type === 'pointerdown' && !inside) || (event as KeyboardEvent).key === 'Escape')) {
        open = false
        render()
      }
    }, { capture: true, passive: true })
  }

  listen.addEventListener('click', () => {
    // While blocked, the click is the go-ahead.
    if (listening && blocked) return play()
    if (!adjustable) return setListening(!listening)
    open = !open
    render()
  })
  mute.addEventListener('click', () => setListening(!listening))

  ;(window as any).__slidevLiveMedia = { screen, camera, audio, listen, mute, panel, volume, sound, pc: () => pc }

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
