import type { Place } from './place'
import type { Ended, Status } from './push'
import { slideAspect } from '@slidev/client'
import { recorder } from '@slidev/client/logic/recording.ts'
import { useLocalStorage } from '@vueuse/core'
import { shallowRef, watch } from 'vue'
import { post } from './bridge'
import { clampPlace, toPlace } from './place'
import { createPush, sentence } from './push'

// Slidev's camera bubble, sent to viewers while it is on in this tab: the
// camera, and the microphone if one is picked. Viewers hear it unless they
// mute it, and see the bubble on the same spot of the slide as this tab.
const CAMERA_BITRATE = 600_000
// While the bubble is dragged, viewers get its place this often.
const PLACE_INTERVAL = 50
const ENDED: Record<Ended, string> = {
  lost: 'The camera lost its connection.',
  replaced: 'Another tab turned its camera on.',
  stopped: 'This dev server no longer publishes to the live site.',
}

// Where the presenter view puts the bubble, remembered between talks.
export const placement = useLocalStorage<Partial<Place>>('slidev-live-bubble', {})
// Whether viewers get the camera, for the dot on the camera button.
export const status = shallowRef<Status>({ state: 'off' })

// Slidev's own bubble in a play view, in pixels of the window, as
// WebCamera.vue keeps it.
const size = useLocalStorage('slidev-webcam-size', Math.round(Math.min(innerHeight, innerWidth / 8)), { writeDefaults: false })
const position = useLocalStorage('slidev-webcam-pos', { x: innerWidth - size.value - 30, y: innerHeight - size.value - 30 }, { writeDefaults: false })
// The slide moves when the window is resized, once Slidev has caught up.
const resized = shallowRef(0)
let resizing: ReturnType<typeof setTimeout> | undefined
addEventListener('resize', () => {
  clearTimeout(resizing)
  resizing = setTimeout(() => resized.value++, 100)
})

function played(): Place | undefined {
  const slide = document.getElementById('slide-content')?.getBoundingClientRect()
  if (slide?.width) return toPlace(slide, { left: position.value.x, top: position.value.y, size: size.value })
}

const round = (value: number) => Math.round(value * 10_000) / 10_000

// Runs at most once per interval, always with the latest state.
function throttle(interval: number, fn: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let at = 0
  return () => {
    if (timer) return
    timer = setTimeout(() => {
      timer = undefined
      at = Date.now()
      fn()
    }, Math.max(0, at + interval - Date.now()))
  }
}

export function startCamera(presenter: () => boolean) {
  const push = createPush('camera')
  let current: MediaStream | undefined
  let retry: ReturnType<typeof setTimeout> | undefined

  // Viewers put the bubble where it is on this tab's slide: as placed in the
  // presenter view, or where Slidev's own bubble sits in a play view. Worked
  // out when sent, as the play view's slide is not reactive.
  const place = () => presenter() ? clampPlace(placement.value, slideAspect.value) : played()
  const tab = Math.random().toString(36).slice(2)
  let seq = 0
  let sent = ''
  const sendPlace = throttle(PLACE_INTERVAL, () => {
    const where = current && place()
    if (!where) return
    const body = { x: round(where.x), y: round(where.y), size: round(where.size) }
    const text = JSON.stringify(body)
    if (text === sent) return
    sent = text
    post('bubble', { ...body, tab, seq: seq++ })
  })

  async function send(stream: MediaStream, wait = 2000) {
    clearTimeout(retry)
    if (stream !== current) return
    const outgoing = []
    const video = stream.getVideoTracks()[0]
    const audio = stream.getAudioTracks()[0]
    if (video?.readyState === 'live') {
      video.contentHint = 'motion'
      outgoing.push({ track: video, trackName: 'camera', encodings: [{ maxBitrate: CAMERA_BITRATE, maxFramerate: 30 }] })
    }
    if (audio?.readyState === 'live') {
      audio.contentHint = 'speech'
      outgoing.push({ track: audio, trackName: 'voice' })
    }
    if (!outgoing.length) return
    // Tries again until the bubble is turned off: the relay may be out of
    // reach for a moment.
    const again = () => {
      if (stream === current) retry = setTimeout(() => send(stream, Math.min(wait * 2, 30_000)), wait)
    }
    const failed = (reason: string, retrying: boolean) => {
      status.value = { state: 'failed', reason: sentence(reason) + (retrying ? ' Trying again.' : '') }
      if (retrying) again()
    }
    status.value = { state: 'connecting' }
    try {
      // Replaced by another tab's camera, or the talk ended here: wait for
      // the bubble to be turned on again.
      const on = await push.start(outgoing, why => failed(ENDED[why], why === 'lost'))
      if (on) status.value = { state: 'live' }
    }
    catch (error: any) {
      if (stream !== current) return
      console.warn('[live] camera', error)
      push.stop()
      // A refusal (the talk is over here, or Realtime is not set up) stays.
      failed(error?.message ?? String(error), ![409, 501].includes(error?.status))
    }
  }

  watch(
    () => recorder.showAvatar.value ? recorder.streamCamera.value : undefined,
    (stream) => {
      if (stream === current) return
      current = stream
      clearTimeout(retry)
      push.stop()
      status.value = { state: 'off' }
      if (!stream) return
      // Viewers know where the bubble goes before it shows.
      sent = ''
      sendPlace()
      send(stream)
    },
    { immediate: true },
  )
  watch(
    () => [presenter(), placement.value, slideAspect.value, position.value, size.value, resized.value],
    () => current && sendPlace(),
    { deep: true },
  )
}
