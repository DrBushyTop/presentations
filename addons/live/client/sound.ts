// Slide sounds on the viewer. Slides that make sound with Web Audio play it
// here too, through the same mute and volume as the presenter's voice. Every
// AudioContext the page makes sends its sound through one gain of its own,
// which the viewer's controls set. Browsers keep a context suspended until the
// viewer has touched the page; the first touch resumes them all.
type Listener = () => void

export function routeSlideSound() {
  const Native = window.AudioContext
  const contexts = new Set<AudioContext>()
  const gains = new Set<GainNode>()
  const listeners = new Set<Listener>()
  let level = 1
  let used = false
  const changed = () => listeners.forEach(fn => fn())

  // Whether this browser holds sound back until the viewer touches the page.
  // Firefox says so. Elsewhere a context made now tells: it starts suspended
  // and turns running a moment later if sound is allowed, so until it has had
  // that moment, nothing counts as held.
  let held = false
  let touched = false
  const policy = (navigator as any).getAutoplayPolicy?.('audiocontext')
  if (Native && !(navigator as any).userActivation?.hasBeenActive) {
    if (policy) held = policy !== 'allowed'
    else {
      try {
        const probe = new Native()
        setTimeout(() => {
          if (probe.state === 'suspended' && !touched) {
            held = true
            changed()
          }
          probe.close().catch(() => {})
        }, 400)
      }
      catch {}
    }
  }

  // iPhones silence Web Audio with the ring switch unless the page plays
  // media. Safari 17 and later.
  try {
    if ('audioSession' in navigator) (navigator as any).audioSession.type = 'playback'
  }
  catch {}

  if (Native) {
    class Routed extends Native {
      constructor(options?: AudioContextOptions) {
        super(options)
        const gain = super.createGain()
        gain.gain.value = level
        gain.connect(super.destination)
        gains.add(gain)
        contexts.add(this)
        used = true
        // Code connects to `destination`, so this context's gain stands in.
        Object.defineProperty(this, 'destination', { value: gain, configurable: true })
        this.addEventListener('statechange', () => {
          if (this.state === 'closed') {
            contexts.delete(this)
            gains.delete(gain)
          }
          changed()
        })
        changed()
      }
    }
    window.AudioContext = Routed
    if ('webkitAudioContext' in window) (window as any).webkitAudioContext = Routed
  }

  return {
    // Sound waits for the viewer's first touch, click or key.
    held: () => held,
    // A slide has made sound at some point since the page opened.
    used: () => used,
    // A slide's context is waiting for the viewer's go-ahead.
    blocked: () => held && [...contexts].some(context => context.state === 'suspended'),
    // Called inside the viewer's touch, click or key, which lets them start.
    resume() {
      touched = true
      if (held) {
        held = false
        changed()
      }
      for (const context of contexts) {
        if (context.state === 'suspended') context.resume().then(changed, () => {})
      }
    },
    level(value: number) {
      level = value
      for (const gain of gains) gain.gain.value = value
    },
    onChange(fn: Listener) {
      listeners.add(fn)
    },
  }
}

