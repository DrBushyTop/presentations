import type { Ended, Status } from './push'
import Mirror from '@slidev/client/internals/ScreenCaptureMirror.vue'
import { getCurrentInstance, onBeforeUnmount, onMounted, shallowRef, watchEffect } from 'vue'
import { createPush, sentence } from './push'

// The presenter's side of the screen share: Slidev's Screen Mirror (the
// presenter view's Current pane) goes to every viewer too, over the slides,
// until the mirror ends.
// Measured on code at 1920 px: a still screen sends next to nothing, an
// animated demo about 0.9 Mbps at 30 fps, and scrolling the whole screen
// fills 2.5 Mbps at 29 fps, blurred until it stops. At 4 Mbps viewers got
// only 13 fps. Every viewer receives it: 200 viewers take up to 225 GB an
// hour of Realtime's free 1,000 GB a month, far less for still screens.
const MAX_BITRATE = 2_500_000
// A Retina screen comes down to 1920 px: as sharp on viewers' screens as
// full size at the same bitrate, and full size needs far more bits.
const VIDEO = { frameRate: { ideal: 30, max: 30 }, width: { max: 1920 }, height: { max: 1080 } }
const ENDED: Record<Ended, string> = {
  lost: 'The screen share lost its connection.',
  replaced: 'Another tab started sharing.',
  stopped: 'This dev server no longer publishes to the live site.',
}
const TITLES = {
  connecting: 'Connecting the screen share to viewers…',
  live: 'Viewers see the screen share.',
  failed: 'Viewers don\'t see the screen share.',
}

// Whether viewers get the share, and the mirror pane while it is open.
export const status = shallowRef<Status>({ state: 'off' })
export const mirror = shallowRef<HTMLElement>()

export function startShare() {
  const devices = navigator.mediaDevices
  // Phones cannot capture a screen.
  if (!devices?.getDisplayMedia) return
  const capture = devices.getDisplayMedia.bind(devices)
  const push = createPush('screen')
  let current: MediaStream | undefined
  let retry: ReturnType<typeof setTimeout> | undefined
  // The mirror pane being clicked, while the click runs.
  let clicked: ((stream: MediaStream) => void) | undefined

  // Slidev keeps the mirror's stream inside its component, and captures when
  // its button is clicked. A capture started by a click in the mirror pane is
  // the mirror's; recordings and screenshots pass through untouched.
  devices.getDisplayMedia = (options?: DisplayMediaStreamOptions) => {
    const adopt = clicked
    if (!adopt) return capture(options)
    clicked = undefined
    return capture({
      ...options,
      video: { ...(typeof options?.video === 'object' ? options.video : {}), ...VIDEO },
      // Not the presenter view itself, but let the presenter switch what is
      // shared from the browser's own bar.
      selfBrowserSurface: 'exclude',
      surfaceSwitching: 'include',
      preferCurrentTab: false,
    } as DisplayMediaStreamOptions).then((stream) => {
      adopt(stream)
      return stream
    })
  }

  const setup = Mirror.setup!
  Mirror.setup = (props: any, ctx: any) => {
    const instance = getCurrentInstance()!
    const streams = new Set<MediaStream>()
    let open = true
    const close = (stream: MediaStream) => {
      end(stream)
      stream.getTracks().forEach(track => track.stop())
    }
    const adopt = (stream: MediaStream) => {
      // Closed while the picker was open.
      if (!open) return close(stream)
      streams.add(stream)
      // Slidev's own listener would touch the pane once it is gone.
      stream.addEventListener('inactive', event => open || event.stopImmediatePropagation())
      share(stream)
    }
    const arm = () => {
      clicked = adopt
      setTimeout(() => clicked === adopt && (clicked = undefined))
    }
    // A dot next to the pane's title says whether viewers get it, and why
    // not in its tooltip.
    const dot = document.createElement('span')
    dot.className = 'slidev-live-dot'
    watchEffect(() => {
      const { state, reason } = status.value
      dot.dataset.state = state
      dot.title = state === 'off' ? '' : state === 'failed' ? `${TITLES.failed} ${reason}` : TITLES[state]
      dot.setAttribute('aria-label', dot.title)
    })
    onMounted(() => {
      const root = instance.proxy!.$el as HTMLElement
      mirror.value = root
      root.addEventListener?.('click', arm, true)
      root.previousElementSibling?.firstElementChild?.after(dot)
    })
    // Switching the pane back to Slides ends it. Slidev would keep capturing
    // unseen; stop that too.
    onBeforeUnmount(() => {
      open = false
      streams.forEach(close)
      dot.remove()
      mirror.value = undefined
    })
    return setup(props, ctx)
  }

  function share(stream: MediaStream) {
    const track = stream.getVideoTracks()[0]
    if (!track) return
    current = stream
    // Keep text sharp; drop frames rather than resolution.
    track.contentHint = 'detail'
    // Ended from the browser's own bar.
    track.addEventListener('ended', () => end(stream))
    send(stream)
  }

  async function send(stream: MediaStream, wait = 2000) {
    clearTimeout(retry)
    const track = stream.getVideoTracks()[0]
    if (stream !== current || track.readyState !== 'live') return
    // Tries again until the mirror ends: the relay may be out of reach for a
    // moment.
    const again = () => {
      if (stream === current) retry = setTimeout(() => send(stream, Math.min(wait * 2, 30_000)), wait)
    }
    const failed = (reason: string, retrying: boolean) => {
      status.value = { state: 'failed', reason: sentence(reason) + (retrying ? ' Trying again.' : '') }
      if (retrying) again()
    }
    status.value = { state: 'connecting' }
    try {
      // VP8: H.264, VP9 and AV1 encode a screen this size in software and
      // drop to a few frames a second while it moves.
      const on = await push.start(
        [{ track, trackName: 'screen', encodings: [{ maxBitrate: MAX_BITRATE, maxFramerate: 30 }], codec: 'video/vp8' }],
        // Replaced by another tab's share, or the talk ended here: the mirror
        // stays local until it is started again.
        (why) => {
          console.warn(`[live] ${ENDED[why]}`)
          failed(ENDED[why], why === 'lost')
        },
      )
      if (on) status.value = { state: 'live' }
    }
    catch (error: any) {
      if (stream !== current) return
      console.error('[live] screen share', error)
      push.stop()
      // A refusal (the talk is over here, or Realtime is not set up) stays.
      failed(error?.message ?? String(error), ![409, 501].includes(error?.status))
    }
  }

  function end(stream: MediaStream) {
    if (stream !== current) return
    current = undefined
    clearTimeout(retry)
    push.stop()
    status.value = { state: 'off' }
  }
}
