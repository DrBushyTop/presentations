<!--
  Polylane forecasts the affected series before a trajectory gets its
  verdict, and the agent reads the p10 to p90 band, not the median. The
  series here is synthetic, shaped like the checkout-api chart in their post.
  Drag the threshold line to see how the reading changes.
  0 observed · 1 the median · 2 the band · 3 a threshold and the reading
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useSynced } from '../lib/sync'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const { $page } = useSlideContext()

const OBS = 64
const AHEAD = 24
const W = 1136
const H = 360
const X0 = 86
const Y0 = 16
const Y1 = 300
const LO = 16000
const HI = 42000

const shape = (h: number) => 26000 + 5200 * Math.sin((2 * Math.PI * (h - 9)) / 24) + 32 * h
let seed = 11
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 1600
const observed = Array.from({ length: OBS }, (_, h) => shape(h) + noise())
const forecast = Array.from({ length: AHEAD }, (_, k) => {
  const h = OBS + k
  const mid = shape(h)
  const spread = 700 + 120 * (k + 1)
  return { h, mid, p10: mid - spread, p90: mid + spread }
})

const x = (h: number) => X0 + ((W - X0 - 10) * h) / (OBS + AHEAD - 1)
const y = (v: number) => Y0 + ((HI - v) / (HI - LO)) * (Y1 - Y0)
const unY = (py: number) => HI - ((py - Y0) / (Y1 - Y0)) * (HI - LO)

const obsPath = observed.map((v, h) => `${h ? 'L' : 'M'}${x(h).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
const last = { h: OBS - 1, v: observed[OBS - 1] }
const midPath = `M${x(last.h)},${y(last.v)} ` + forecast.map(f => `L${x(f.h).toFixed(1)},${y(f.mid).toFixed(1)}`).join(' ')
const bandPath = `M${x(last.h)},${y(last.v)} `
  + forecast.map(f => `L${x(f.h).toFixed(1)},${y(f.p90).toFixed(1)}`).join(' ')
  + ' ' + [...forecast].reverse().map(f => `L${x(f.h).toFixed(1)},${y(f.p10).toFixed(1)}`).join(' ') + ' Z'

const maxMid = Math.max(...forecast.map(f => f.mid))
const maxP90 = Math.max(...forecast.map(f => f.p90))
const defaultThreshold = Math.round((maxMid + maxP90) / 2 / 100) * 100

const manual = useSynced<number | null>(`forecast-${$page.value}`, null)
watch(() => props.step, () => { manual.value = null })
const threshold = computed(() => manual.value ?? defaultThreshold)

const reading = computed(() => {
  const t = threshold.value
  if (forecast.some(f => f.p10 > t)) return { tone: 'bad', text: 'Even the low estimate crosses it. Expect it to happen.' }
  if (forecast.some(f => f.mid > t)) return { tone: 'bad', text: 'The median crosses it. Likely within a day.' }
  if (forecast.some(f => f.p90 > t)) return { tone: 'maybe', text: 'The median stays below, but the band crosses it. Plausible.' }
  return { tone: 'ok', text: 'Even the high estimate stays below. Unlikely.' }
})

const svg = ref<SVGSVGElement>()
const dragging = ref(false)
function toValue(e: PointerEvent) {
  const el = svg.value
  if (!el) return
  const pt = el.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(el.getScreenCTM()!.inverse())
  manual.value = Math.round(Math.min(HI - 500, Math.max(LO + 500, unY(p.y))) / 100) * 100
}
function down(e: PointerEvent) {
  if (props.step < 3) return
  dragging.value = true
  ;(e.target as Element).setPointerCapture?.(e.pointerId)
  toValue(e)
}
const move = (e: PointerEvent) => { if (dragging.value) toValue(e) }
const up = () => { dragging.value = false }

const ticks = [20000, 25000, 30000, 35000, 40000]
const fmt = (v: number) => `${Math.round(v / 1000)}k`
</script>

<template>
  <div class="fc" :class="[`s${Math.min(step, 3)}`, reading.tone]">
    <div class="head">
      <b class="ns-mono">checkout-api</b><span>requests per hour</span>
      <span class="key"><i class="k-obs" />observed <i class="k-mid" />median <i class="k-band" />p10 to p90</span>
    </div>
    <svg
      ref="svg" class="chart" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Observed requests and a 24 hour forecast band"
      @pointerdown="down" @pointermove="move" @pointerup="up" @pointerleave="up"
    >
      <g class="grid">
        <g v-for="t in ticks" :key="t">
          <line :x1="X0" :x2="W" :y1="y(t)" :y2="y(t)" />
          <text :x="X0 - 12" :y="y(t) + 6" text-anchor="end">{{ fmt(t) }}</text>
        </g>
        <line class="now" :x1="x(OBS - 1)" :x2="x(OBS - 1)" :y1="Y0" :y2="Y1" />
        <text :x="x(0)" :y="H - 12">64 hours ago</text>
        <text :x="x(OBS - 1)" :y="H - 12" text-anchor="middle">now</text>
        <text :x="W - 10" :y="H - 12" text-anchor="end">+24 h</text>
      </g>
      <path :d="bandPath" class="band" />
      <path :d="obsPath" class="obs" />
      <path :d="midPath" class="mid" pathLength="1" />
      <g class="thr" :class="{ drag: dragging }">
        <line :x1="X0" :x2="W" :y1="y(threshold)" :y2="y(threshold)" />
        <rect :x="X0" :y="y(threshold) - 16" :width="W - X0" height="32" class="hit" />
        <text :x="X0 + 12" :y="y(threshold) - 12">Load checkout-api can take</text>
      </g>
    </svg>
    <div class="reading">
      <span class="dot" />
      <b>{{ reading.text }}</b>
      <span class="hint">Drag the line</span>
    </div>
  </div>
</template>

<style scoped>
.fc {
  height: 510px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 10px;
}

.head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-size: 20px;
}

.head b {
  font-size: 21px;
}

.key {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--ns-label);
  color: var(--z-ink-800);
}

.key i {
  display: inline-block;
  width: 26px;
  height: 12px;
  margin-left: 12px;
}

.k-obs { background: var(--z-ink); height: 4px !important; }
.k-mid { border-top: 4px dashed var(--ns-teal); height: 0 !important; }
.k-band { background: rgba(3, 127, 145, 0.25); }

.chart {
  width: 100%;
  height: 100%;
  overflow: visible;
  touch-action: none;
}

.grid line {
  stroke: var(--ns-line);
  stroke-width: 1;
}

.grid line.now {
  stroke: var(--z-ink);
  stroke-dasharray: 4 6;
}

.grid text {
  font-family: var(--z-font-text);
  font-size: 18px;
  fill: var(--z-grey-600);
}

.obs {
  fill: none;
  stroke: var(--z-ink);
  stroke-width: 3;
}

.mid {
  fill: none;
  stroke: var(--ns-teal);
  stroke-width: 4;
  stroke-dasharray: 0.012 0.008;
  opacity: 0;
  transition: opacity 600ms var(--ns-ease);
}

.band {
  fill: rgba(3, 127, 145, 0.22);
  opacity: 0;
  clip-path: inset(0 100% 0 0);
  transition: opacity 400ms var(--ns-ease), clip-path 1200ms var(--ns-ease);
}

.s1 .mid,
.s2 .mid,
.s3 .mid {
  opacity: 1;
}

.s2 .band,
.s3 .band {
  opacity: 1;
  clip-path: inset(0 0 0 0);
}

.thr {
  opacity: 0;
  transition: opacity 500ms var(--ns-ease);
  cursor: ns-resize;
}

.s3 .thr {
  opacity: 1;
}

.thr line {
  stroke: var(--z-ink);
  stroke-width: 3;
  stroke-dasharray: 10 6;
}

.thr .hit {
  fill: transparent;
}

.thr text {
  font-family: var(--z-font-text);
  font-size: 19px;
  font-weight: 700;
  fill: var(--z-ink);
  paint-order: stroke;
  stroke: #fff;
  stroke-width: 6px;
}

.reading {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  background: var(--z-ink);
  color: #fff;
  opacity: 0;
  transition: opacity 500ms var(--ns-ease), background 400ms var(--ns-ease);
}

.s3 .reading {
  opacity: 1;
}

.reading b {
  font-size: 24px;
  flex: 1;
}

.reading .dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--ns-frozen);
}

.bad .reading .dot { background: var(--z-red-400); }
.maybe .reading .dot { background: var(--z-yellow); }

.hint {
  font-size: var(--ns-label);
  color: #bdbdbd;
}
</style>
