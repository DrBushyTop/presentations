import { watch } from 'vue'
import { recorder } from '@slidev/client/logic/recording.ts'
import { createPush } from './push'

// Slidev's camera bubble, sent to viewers while it is on in this tab: the
// camera, and the microphone if one is picked. Viewers hear it only if they
// choose to listen.
const CAMERA_BITRATE = 600_000

export function startCamera() {
  const push = createPush('camera')
  let current: MediaStream | undefined
  let retry: ReturnType<typeof setTimeout> | undefined

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
    try {
      // Replaced by another tab's camera, or the talk ended here: wait for
      // the bubble to be turned on again.
      await push.start(outgoing, why => why === 'lost' && again())
    }
    catch (error) {
      if (stream !== current) return
      console.warn('[live] camera', error)
      push.stop()
      again()
    }
  }

  watch(
    () => recorder.showAvatar.value ? recorder.streamCamera.value : undefined,
    (stream) => {
      if (stream === current) return
      current = stream
      clearTimeout(retry)
      push.stop()
      if (stream) send(stream)
    },
    { immediate: true },
  )
}
