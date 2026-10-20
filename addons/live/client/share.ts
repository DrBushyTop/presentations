import { ref } from 'vue'
import { createPush } from './push'

// The presenter's side of the screen share. The tab captures a screen or a
// window, and the relay shows it to every viewer over the slides until the
// share ends.
// Measured on code at 1920 px: a still screen sends next to nothing, an
// animated demo about 0.9 Mbps at 30 fps, and scrolling the whole screen
// fills 2.5 Mbps at 29 fps, blurred until it stops. At 4 Mbps viewers got
// only 13 fps. Every viewer receives it: 200 viewers take up to 225 GB an
// hour of Realtime's free 1,000 GB a month, far less for still screens.
const MAX_BITRATE = 2_500_000

export const share = {
  state: ref<'off' | 'starting' | 'live'>('off'),
  error: ref(''),
  start,
  stop,
}

const push = createPush('screen')
let stream: MediaStream | undefined
// Each start is an attempt; a stale one only cleans up after itself.
let attempt = 0
const ENDED = {
  lost: 'The screen share lost its connection.',
  replaced: 'Another tab started sharing.',
  stopped: 'This dev server no longer publishes to the live site.',
}

async function start() {
  if (share.state.value !== 'off') return
  const mine = ++attempt
  share.state.value = 'starting'
  share.error.value = ''
  let captured: MediaStream | undefined
  try {
    // A Retina screen comes down to 1920 px: as sharp on viewers' screens as
    // full size at the same bitrate, and full size needs far more bits.
    captured = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 30, max: 30 }, width: { max: 1920 }, height: { max: 1080 } },
      audio: false,
      // Not the presenter view itself, but let the presenter switch what is
      // shared from the browser's own bar.
      selfBrowserSurface: 'exclude',
      surfaceSwitching: 'include',
    } as DisplayMediaStreamOptions)
    // Stopped while the picker was open.
    if (mine !== attempt) return captured.getTracks().forEach(track => track.stop())
    stream = captured
    const track = captured.getVideoTracks()[0]
    // Keep text sharp; drop frames rather than resolution.
    track.contentHint = 'detail'
    track.addEventListener('ended', () => {
      if (mine === attempt) stop()
    })
    // VP8: H.264, VP9 and AV1 encode a screen this size in software and drop
    // to a few frames a second while it moves.
    const started = await push.start(
      [{ track, trackName: 'screen', encodings: [{ maxBitrate: MAX_BITRATE, maxFramerate: 30 }], codec: 'video/vp8' }],
      (why) => {
        if (mine === attempt) stop(ENDED[why])
      },
    )
    if (started && mine === attempt) share.state.value = 'live'
  }
  catch (error: any) {
    if (mine !== attempt) return captured?.getTracks().forEach(track => track.stop())
    // Cancelling the browser's picker is not an error.
    stop(error?.name === 'NotAllowedError' ? '' : String(error?.message ?? error))
  }
}

function stop(message = '') {
  attempt++
  stream?.getTracks().forEach(track => track.stop())
  push.stop()
  stream = undefined
  share.state.value = 'off'
  share.error.value = message
  if (message) console.error(`[live] ${message}`)
}
