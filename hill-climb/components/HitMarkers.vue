<!--
  Every changed-screen pin from the PRs, fired at one screen. Positions are real
  pin coordinates from many screens, mapped onto this one, so it is a joke with
  true numbers, not a map. Sound plays only in the main slide window, and
  browsers mute it until that window has had one click.

  Sounds: public/sounds/hit.mp3 and ending.mp3 are used if they exist. Both are
  gitignored, for your own clips. Without them the tick is synthesised here and
  the ending is the text-to-speech ending-tts.mp3.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { animate, motion } from 'motion-v'
import { useSlideContext } from '@slidev/client'
import data from '../lib/pins.json'
import { asset, useStage } from '../lib/stage'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { still, active, spring, ease } = useStage()
const { $renderContext } = useSlideContext()

const pins = data.pins as [number, number][]
const feed = data.feed as string[]
const SCALE = 720 / 800
const LIFE = 340

const canvas = ref<HTMLCanvasElement>()
const fired = ref(0)
const lines = ref<{ id: number, t: string }[]>([])
const shake = ref<HTMLElement>()
let raf = 0
let run: { stop: () => void } | undefined
let audio: AudioContext | undefined
let hitClip: AudioBuffer | null = null
let endClip: AudioBuffer | null = null
let endSource: AudioBufferSourceNode | undefined
let lastTick = 0
let lastLine = 0
const live: { x: number, y: number, at: number }[] = []
const dead = ref(still.value)

// The dev server answers a missing file with the app page, so a clip only
// counts once it decodes.
async function loadClip(names: string[]) {
  for (const name of names) {
    try {
      const res = await fetch(asset(`sounds/${name}`))
      if (res.ok) return await audio!.decodeAudioData(await res.arrayBuffer())
    }
    catch {}
  }
  return null
}

async function setUpSound() {
  if (audio || $renderContext.value !== 'slide' || still.value || typeof AudioContext === 'undefined') return
  audio = new AudioContext()
  hitClip = await loadClip(['hit.mp3', 'hit.wav', 'hit.ogg'])
  endClip = await loadClip(['ending.mp3', 'ending.wav', 'ending.ogg', 'ending-tts.mp3'])
}

function playClip(clip: AudioBuffer, rate = 1, gain = 1) {
  const source = audio!.createBufferSource()
  const level = audio!.createGain()
  source.buffer = clip
  source.playbackRate.value = rate
  level.gain.value = gain
  source.connect(level).connect(audio!.destination)
  source.start()
  return source
}

function ctx2d() {
  const c = canvas.value
  if (!c) return null
  if (c.width !== 2304) { c.width = 2304; c.height = 1440 }
  const g = c.getContext('2d')!
  g.setTransform(2, 0, 0, 2, 0, 0)
  return g
}

function cross(g: CanvasRenderingContext2D, x: number, y: number, size: number, width: number, colour: string) {
  const a = size * 0.38
  g.strokeStyle = colour
  g.lineWidth = width
  g.beginPath()
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    g.moveTo(x + dx * a, y + dy * a)
    g.lineTo(x + dx * size, y + dy * size)
  }
  g.stroke()
}

function draw(now: number) {
  const g = ctx2d()
  if (!g) return
  g.clearRect(0, 0, 1152, 720)
  g.fillStyle = '#de1e05'
  const n = Math.floor(fired.value)
  for (let i = 0; i < n; i++) {
    g.beginPath()
    g.arc(pins[i][0] * SCALE, pins[i][1] * SCALE, 4, 0, 6.3)
    g.fill()
  }
  for (let i = live.length - 1; i >= 0; i--) {
    const m = live[i]
    const t = (now - m.at) / LIFE
    if (t >= 1) { live.splice(i, 1); continue }
    g.globalAlpha = 1 - t
    const size = 12 + 12 * (1 - t)
    cross(g, m.x, m.y, size + 1.5, 6, '#000')
    cross(g, m.x, m.y, size, 3, '#fff')
    g.globalAlpha = 1
  }
}

function loop(now: number) {
  draw(now)
  if (live.length || (fired.value < pins.length && fired.value > 0)) raf = requestAnimationFrame(loop)
  else raf = 0
}

function tick() {
  if ($renderContext.value !== 'slide' || !audio) return
  const now = performance.now()
  if (now - lastTick < 42) return
  lastTick = now
  if (hitClip) {
    playClip(hitClip, 0.97 + Math.random() * 0.06, 0.7)
    return
  }
  const t = audio.currentTime
  const o = audio.createOscillator()
  const g = audio.createGain()
  const hp = audio.createBiquadFilter()
  o.type = 'square'
  o.frequency.setValueAtTime(1500 + Math.random() * 500, t)
  o.frequency.exponentialRampToValueAtTime(700, t + 0.035)
  hp.type = 'highpass'
  hp.frequency.value = 900
  g.gain.setValueAtTime(0.13, t)
  g.gain.exponentialRampToValueAtTime(0.0008, t + 0.05)
  o.connect(hp).connect(g).connect(audio.destination)
  o.start(t)
  o.stop(t + 0.06)
}

function hit(i: number) {
  const now = performance.now()
  live.push({ x: pins[i][0] * SCALE, y: pins[i][1] * SCALE, at: now })
  tick()
  if (now - lastLine > 260) {
    lastLine = now
    lines.value = [{ id: i, t: feed[i % feed.length] }, ...lines.value].slice(0, 6)
    if (shake.value) animate(shake.value, { x: [0, -3, 3, 0], y: [0, 2, -2, 0] }, { duration: 0.12 })
  }
  if (!raf) raf = requestAnimationFrame(loop)
}

function reset() {
  run?.stop()
  cancelAnimationFrame(raf)
  raf = 0
  live.length = 0
  fired.value = 0
  dead.value = false
  try { endSource?.stop() }
  catch {}
  lines.value = []
  draw(performance.now())
}

function fire() {
  reset()
  setUpSound().then(() => audio?.resume())
  let seen = 0
  run = animate(0, pins.length, {
    duration: 12,
    ease: [0.7, 0, 0.84, 0.4],
    onUpdate: (v: number) => {
      fired.value = v
      const n = Math.floor(v)
      for (; seen < n; seen++) hit(seen)
    },
    onComplete: () => {
      fired.value = pins.length
      dead.value = true
      draw(performance.now())
      if (shake.value) animate(shake.value, { x: [0, -10, 10, -6, 6, 0], y: [0, 6, -6, 3, 0] }, { duration: 0.5 })
      if (audio && endClip && $renderContext.value === 'slide') endSource = playClip(endClip)
    },
  })
}

watch([() => props.step, active, canvas], ([s, on]) => {
  if (!canvas.value) return
  if (still.value || s >= 2) {
    run?.stop()
    fired.value = pins.length
    dead.value = true
    if (still.value) lines.value = feed.slice(0, 6).map((t, id) => ({ id, t }))
    draw(performance.now())
  }
  else if (s === 1 && on) fire()
  else if (s === 0) reset()
}, { immediate: true, flush: 'post' })

onMounted(setUpSound)
onBeforeUnmount(() => {
  run?.stop()
  cancelAnimationFrame(raf)
  audio?.close()
})
const count = computed(() => Math.floor(fired.value))
const big = computed(() => props.step >= 2 || still.value)
</script>

<template>
  <div class="hc-night hits">
    <div ref="shake" class="world" :class="{ dead }">
      <img class="screen" :src="asset('screens/pair/07-session-timeline-r23.jpg')" alt="">
      <canvas ref="canvas" class="layer" aria-hidden="true" />
    </div>
    <div class="feed">
      <motion.p v-for="l in lines" :key="l.id" :initial="{ opacity: still ? 1 : 0, x: still ? 0 : 40 }" :animate="{ opacity: 1, x: 0 }" :transition="ease(0.25)">
        <i aria-hidden="true">✕</i>{{ l.t }}
      </motion.p>
    </div>
    <div class="score">
      <b class="hc-num">{{ count }}</b><span>pins</span>
    </div>
    <motion.div class="award" :initial="false" :animate="{ opacity: big ? 1 : 0, scale: big ? 1 : 1.4 }" :transition="spring({ bounce: 0.4 })">
      <b>+1.87</b><span>Opus, scored blind</span>
    </motion.div>
  </div>
</template>

<style scoped>
.world { position: absolute; left: 0; top: 0; width: 1152px; height: 720px; }
.screen { transition: filter 2.2s ease; }
.dead .screen { filter: grayscale(1) brightness(0.62); }
.screen, .layer { position: absolute; inset: 0; width: 1152px; height: 720px; object-fit: cover; object-position: top left; }
.feed { position: absolute; right: 18px; top: 18px; width: 460px; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.feed p { margin: 0; padding: 6px 12px; background: rgba(16, 18, 20, 0.84); color: #fff; font-size: 17px; font-weight: 500; border-radius: 4px; }
.feed i { font-style: normal; color: var(--z-red-400); font-weight: 800; margin-right: 8px; }
.score { position: absolute; left: 22px; bottom: 16px; display: flex; align-items: baseline; gap: 8px; padding: 4px 16px; border-radius: 8px; background: rgba(16, 18, 20, 0.84); }
.score b { font-size: 56px; line-height: 1.1; color: #fff; }
.score span { font-size: 20px; color: #b5b9bd; }
.award { position: absolute; left: 0; right: 128px; top: 250px; text-align: center; pointer-events: none; }
.award b { display: block; font: 800 150px/1 var(--z-font-display); letter-spacing: -0.04em; color: var(--z-red); -webkit-text-stroke: 10px #fff; paint-order: stroke fill; }
.award span { display: inline-block; margin-top: 12px; padding: 6px 14px; border-radius: 6px; font-size: 22px; color: #fff; background: rgba(16, 18, 20, 0.84); }
</style>
