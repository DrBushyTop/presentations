<!--
  A game over screen in the style of a late-90s stealth game, drawn here from
  scratch. `on` flashes the screen pale, fades it to black while the title writes
  itself from the left, then draws the bar with a blue bloom. `gains` moves the
  title up and writes the gains underneath in the same lettering.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import { animate, motion } from 'motion-v'
import { climbGain } from '../lib/data'
import { CAP, measure } from '../lib/outline'
import { useStage } from '../lib/stage'
import OutlineWord from './OutlineWord.vue'
import ScanReveal from './ScanReveal.vue'

const props = defineProps<{ on: boolean, gains: boolean }>()
const { still, spring } = useStage()
const dots = useId()
const bloomFill = useId()

const WIDTH = 1280
const LEAN = 0.364
const title = { text: 'GAME OVER', scale: 1.24 }
const titleW = measure(title.text) * title.scale
const titleH = CAP * title.scale
const titleX = (WIDTH - titleW) / 2 + titleH * LEAN * 0.5
const TITLE_Y = 140
const BAR_Y = TITLE_Y + titleH + 14
const BAR_H = 40
const barLeft = titleX - 8
const barRight = titleX + titleW - 8
const bar = `M${barLeft + BAR_H * LEAN} ${BAR_Y}H${barRight + BAR_H * LEAN}L${barRight} ${BAR_Y + BAR_H}H${barLeft}Z`

const GAIN_SCALE = 1.16
const GAP = 96
const GAIN_Y = 368
const GAIN_H = CAP * GAIN_SCALE
const GAIN_WRITE = 1.8
const entries = [{ text: `+${climbGain.opus.toFixed(2)}`, who: 'Opus' }, { text: `+${climbGain.sol.toFixed(2)}`, who: 'Sol' }]
const widths = entries.map(g => measure(g.text) * GAIN_SCALE)
const gainsW = widths[0] + GAP + widths[1]
const gainsX = (WIDTH - gainsW) / 2 + GAIN_H * LEAN * 0.5
const gains = entries.map((g, i) => ({
  ...g,
  x: gainsX + (i ? widths[0] + GAP : 0),
  mid: gainsX + (i ? widths[0] + GAP : 0) + widths[i] / 2 - GAIN_H * LEAN * 0.5,
}))

// The title's timeline, in seconds from the flash.
const FADED = 1.85
const WRITTEN = 2.95
const BAR_DONE = 3.3
const BLOOM_PEAK = 3.36
const SETTLED = 3.8

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const between = (t: number, from: number, to: number) => clamp((t - from) / (to - from))

function useClock(running: () => boolean, seconds: number) {
  const t = ref(still.value ? seconds : 0)
  let run: { stop: () => void } | undefined
  watch(running, (go) => {
    run?.stop()
    if (!go) t.value = 0
    else if (still.value) t.value = seconds
    else run = animate(0, seconds, { duration: seconds, ease: 'linear', onUpdate: (v: number) => { t.value = v } })
  }, { immediate: true })
  onBeforeUnmount(() => run?.stop())
  return t
}

const t = useClock(() => props.on, SETTLED)
const gainT = useClock(() => props.gains, GAIN_WRITE)

const paper = computed(() => {
  const v = Math.round(200 * (1 - between(t.value, 0, FADED)))
  return `rgb(${v} ${v + 2} ${v})`
})
const front = computed(() => between(t.value, 0, WRITTEN))
const topEdge = computed(() => barRight + BAR_H * LEAN - between(t.value, WRITTEN, BAR_DONE - 0.08) * (barRight - barLeft))
const lowEdge = computed(() => barRight - between(t.value, WRITTEN + 0.1, BAR_DONE) * (barRight - barLeft))
const zipEnd = computed(() => WIDTH + 40 - between(t.value, BAR_DONE - 0.1, BLOOM_PEAK) * (WIDTH + 40 - barRight))
const zip = computed(() => (t.value < WRITTEN ? 0 : 1 - between(t.value, BAR_DONE, SETTLED)))
const barShown = computed(() => t.value >= BAR_DONE)
const swing = computed(() => (t.value >= WRITTEN && t.value < BAR_DONE ? between(t.value, WRITTEN, BAR_DONE) : -1))
const bloom = computed(() => between(t.value, BLOOM_PEAK - 0.12, BLOOM_PEAK) * (1 - between(t.value, BLOOM_PEAK, SETTLED - 0.1)))
const built = computed(() => t.value >= SETTLED - 0.2)
const pulse = computed(() => (still.value ? { opacity: 1 } : { opacity: [0.16, 1, 0.16] }))
const beat = computed(() => (still.value ? { duration: 0 } : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }))
</script>

<template>
  <div v-if="on" class="go">
    <svg :viewBox="`0 0 ${WIDTH} 720`" role="img" aria-label="Game over. Opus plus 2.25, Sol plus 2.31, from first review to last blind round.">
      <defs>
        <pattern :id="`${dots}-p`" patternUnits="userSpaceOnUse" width="3" height="3">
          <rect width="2.5" height="2.5" fill="#fff" />
        </pattern>
        <mask :id="dots" maskUnits="userSpaceOnUse" x="0" y="-130" :width="WIDTH" height="980">
          <rect y="-130" :width="WIDTH" height="980" :fill="`url(#${dots}-p)`" />
        </mask>
        <radialGradient :id="bloomFill">
          <stop offset="0" stop-color="#3f7dff" />
          <stop offset="0.45" stop-color="#1f4fe0" stop-opacity="0.8" />
          <stop offset="1" stop-color="#0d2aa8" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect :width="WIDTH" height="720" :fill="paper" />

      <motion.g :initial="false" :animate="{ y: props.gains ? 0 : 118 }" :transition="spring({ visualDuration: 0.8, bounce: 0.12 })">
        <ScanReveal :x="titleX - titleH * LEAN" :y="TITLE_Y" :w="titleW + titleH * LEAN" :h="titleH" :front="front" :time="t">
          <g :mask="`url(#${dots})`">
            <OutlineWord :text="title.text" :x="titleX" :y="TITLE_Y" :scale="title.scale" />
          </g>
        </ScanReveal>

        <g v-if="zip" :opacity="zip" aria-hidden="true">
          <line :x1="topEdge" :y1="BAR_Y" :x2="zipEnd + BAR_H * LEAN" :y2="BAR_Y" stroke="#eefaff" stroke-width="1.8" />
          <line :x1="lowEdge" :y1="BAR_Y + BAR_H" :x2="zipEnd" :y2="BAR_Y + BAR_H" stroke="#eefaff" stroke-width="1.8" />
        </g>
        <path v-if="barShown" :d="bar" fill="none" stroke="#8d989d" stroke-width="1.5" />
        <ellipse
          v-if="swing >= 0" :cx="barRight - swing * (barRight - barLeft) * 0.85" :cy="BAR_Y" rx="300" ry="15"
          :transform="`rotate(26 ${barRight - swing * (barRight - barLeft) * 0.85} ${BAR_Y})`"
          :fill="`url(#${bloomFill})`" class="light"
        />
        <ellipse
          v-if="bloom" :cx="(barLeft + barRight) / 2 + 20" :cy="BAR_Y + BAR_H / 2 + 10" :rx="(barRight - barLeft) * 0.46" ry="62"
          :fill="`url(#${bloomFill})`" :opacity="bloom" class="light"
        />
        <motion.g v-if="built" :initial="{ opacity: 0 }" :animate="pulse" :transition="beat">
          <text class="pick" :x="barLeft + 58" :y="BAR_Y + 30">CONTINUE</text>
        </motion.g>
        <text v-if="built" class="exit" :x="barRight - 34" :y="BAR_Y + 28" text-anchor="end">EXIT</text>
      </motion.g>

      <ScanReveal
        v-if="props.gains" :x="gainsX - GAIN_H * LEAN" :y="GAIN_Y" :w="gainsW + GAIN_H * LEAN" :h="GAIN_H" :below="120"
        :front="gainT / GAIN_WRITE" :time="gainT"
      >
        <g :mask="`url(#${dots})`">
          <OutlineWord v-for="g in gains" :key="g.who" :text="g.text" :x="g.x" :y="GAIN_Y" :scale="GAIN_SCALE" core="#07323d" />
        </g>
        <text v-for="g in gains" :key="g.who" class="who" :x="g.mid" :y="GAIN_Y + GAIN_H + 44" text-anchor="middle">{{ g.who }}</text>
        <text class="note-line" :x="WIDTH / 2" :y="GAIN_Y + GAIN_H + 86" text-anchor="middle">First review to last blind round</text>
      </ScanReveal>
    </svg>
  </div>
</template>

<style scoped>
.go { position: absolute; inset: 0; pointer-events: none; }
.go svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.light { mix-blend-mode: screen; }
.pick { font: italic 800 28px var(--z-font-display); letter-spacing: 0.08em; fill: #3aa7bf; }
.exit { font: 600 18px var(--z-font-display); letter-spacing: 0.6em; fill: #2c5560; }
.who { font: italic 800 30px var(--z-font-display); letter-spacing: 0.08em; fill: #3aa7bf; }
.note-line { font: 500 22px var(--z-font-display); fill: #b5c4c9; }
</style>
