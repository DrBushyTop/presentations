<!--
  Polylane forecasts the affected series before a trajectory gets its
  verdict, and the agent reads the p10 to p90 band, not the median. Applied
  to my repo: a prod.bicepparam change that lowers the code-mode sandbox cap
  from 8 to 4. The series is synthetic. The
  three readings are my simplification of "a p10 that stays above the
  threshold is a different answer from one that crosses it".
  0 the question and the last 64 hours · 1 the forecast · 2 the limit, and
  the median says it's fine · 3 the band crosses it, and how the agent reads it
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const s = computed(() => Math.min(props.step, 3))

const OBS = 64
const AHEAD = 24
const W = 1136
const H = 300
const X0 = 70
const Y0 = 10
const Y1 = 250
const LO = 0
const HI = 6

const shape = (h: number) => 2.4 + 1.1 * Math.sin((2 * Math.PI * (h - 3)) / 24) + 0.004 * h
let seed = 11
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 0.4
const observed = Array.from({ length: OBS }, (_, h) => shape(h) + noise())
const forecast = Array.from({ length: AHEAD }, (_, k) => {
  const h = OBS + k
  const mid = shape(h)
  const spread = 0.15 + 0.03 * (k + 1)
  return { h, mid, p10: mid - spread, p90: mid + spread }
})

const x = (h: number) => X0 + ((W - X0 - 10) * h) / (OBS + AHEAD - 1)
const y = (v: number) => Y0 + ((HI - v) / (HI - LO)) * (Y1 - Y0)

const obsPath = observed.map((v, h) => `${h ? 'L' : 'M'}${x(h).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
const last = { h: OBS - 1, v: observed[OBS - 1] }
const midPath = `M${x(last.h)},${y(last.v)} ` + forecast.map(f => `L${x(f.h).toFixed(1)},${y(f.mid).toFixed(1)}`).join(' ')
const bandPath = `M${x(last.h)},${y(last.v)} `
  + forecast.map(f => `L${x(f.h).toFixed(1)},${y(f.p90).toFixed(1)}`).join(' ')
  + ' ' + [...forecast].reverse().map(f => `L${x(f.h).toFixed(1)},${y(f.p10).toFixed(1)}`).join(' ') + ' Z'

// The new cap: the median's peak stays under it, the band's doesn't.
const limit = 4
const peak = forecast.reduce((a, f) => (f.p90 > a.p90 ? f : a))

const fmt = (v: number) => `${Math.round(v)}`
const ticks = [0, 2, 4, 6]

const captions = [
  { tone: 'idle', text: `Now: about ${fmt(last.v)} at once. Is that steady, or climbing?` },
  { tone: 'idle', text: 'The agent forecasts the next 24 hours from the last 64.' },
  { tone: 'ok', text: 'The median stays under the new cap. Looks safe.' },
  { tone: 'maybe', text: 'The band crosses it at tomorrow\'s peak: plausible.' },
]

const scale = [
  { when: 'p90 crosses', means: 'plausible' },
  { when: 'Median crosses', means: 'likely' },
  { when: 'p10 crosses', means: 'expected' },
]
</script>

<template>
  <div class="fc" :class="`s${s}`">
    <div class="q">
      <b>The change lowers the sandbox cap from 8 to 4.</b>
      <span>Does that hurt? It depends on the demand.</span>
    </div>

    <div class="head">
      <b class="ns-mono">mcp-code</b><span>code runs at once, hourly peak</span>
      <span class="key">
        <i class="k-obs" />observed
        <span class="fk"><i class="k-mid" />median <i class="k-band" />p10 to p90</span>
      </span>
    </div>

    <svg class="chart" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Observed sandbox use and a 24 hour forecast band">
      <defs>
        <clipPath id="fc-over"><rect :x="0" :y="0" :width="W" :height="y(limit)" /></clipPath>
      </defs>
      <g class="grid">
        <g v-for="t in ticks" :key="t">
          <line :x1="X0" :x2="W" :y1="y(t)" :y2="y(t)" />
          <text :x="X0 - 12" :y="y(t) + 6" text-anchor="end">{{ fmt(t) }}</text>
        </g>
        <line class="now" :x1="x(OBS - 1)" :x2="x(OBS - 1)" :y1="Y0" :y2="Y1" />
        <text :x="x(0)" :y="H - 14">64 hours ago</text>
        <text :x="x(OBS - 1)" :y="H - 14" text-anchor="middle">now</text>
        <text :x="W - 10" :y="H - 14" text-anchor="end">+24 h</text>
      </g>
      <path :d="obsPath" class="obs" />
      <g class="fcst">
        <path :d="bandPath" class="band" />
        <path :d="bandPath" class="band over" clip-path="url(#fc-over)" />
        <path :d="midPath" class="mid" pathLength="1" />
      </g>
      <circle class="nowdot" :cx="x(last.h)" :cy="y(last.v)" r="7" />
      <g class="thr">
        <line :x1="X0" :x2="W" :y1="y(limit)" :y2="y(limit)" />
        <text :x="X0 + 12" :y="y(limit) - 12">New cap: 4 sandboxes</text>
      </g>
      <text class="cross" :x="x(peak.h)" :y="y(peak.p90) - 14" text-anchor="end">p90 crosses</text>
    </svg>

    <div class="reading" :class="captions[s].tone">
      <span class="dot" />
      <b>{{ captions[s].text }}</b>
      <ol class="scale">
        <li v-for="(r, i) in scale" :key="r.when" :class="{ hit: i === 0 }">
          <span>{{ r.when }}</span><em>{{ r.means }}</em>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.fc {
  height: 510px;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 10px;
}

.q {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 14px;
  padding: 12px 20px;
  background: #fff1ee;
  border-left: 6px solid var(--ns-red);
}

.q b {
  font-size: 24px;
  letter-spacing: -0.01em;
}

.q span {
  font-size: 22px;
  color: var(--z-ink-800);
}

.head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-size: 19px;
}

.head b {
  font-size: 20px;
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

.fk {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 500ms var(--ns-ease);
}

.s0 .fk { opacity: 0; }

.k-obs { background: var(--z-ink); height: 4px !important; }
.k-mid { border-top: 4px dashed var(--ns-teal); height: 0 !important; }
.k-band { background: rgba(3, 127, 145, 0.25); }

.chart {
  width: 100%;
  height: 100%;
  overflow: visible;
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

.nowdot {
  fill: var(--ns-red);
  stroke: #fff;
  stroke-width: 3;
}

.fcst {
  transition: opacity 400ms var(--ns-ease), clip-path 1200ms var(--ns-ease);
}

.s0 .fcst {
  opacity: 0;
  clip-path: inset(0 100% 0 0);
}

.band {
  fill: rgba(3, 127, 145, 0.22);
}

.band.over {
  fill: rgba(222, 30, 5, 0.55);
  opacity: 0;
  transition: opacity 600ms var(--ns-ease);
}

.s3 .band.over { opacity: 1; }

.mid {
  fill: none;
  stroke: var(--ns-teal);
  stroke-width: 4;
  stroke-dasharray: 0.012 0.008;
}

.thr,
.cross {
  opacity: 0;
  transition: opacity 500ms var(--ns-ease);
}

.s2 .thr,
.s3 .thr,
.s3 .cross {
  opacity: 1;
}

.thr line {
  stroke: var(--z-ink);
  stroke-width: 3;
  stroke-dasharray: 10 6;
}

.thr text,
.cross {
  font-family: var(--z-font-text);
  font-size: 19px;
  font-weight: 700;
  fill: var(--z-ink);
  paint-order: stroke;
  stroke: #fff;
  stroke-width: 6px;
}

.cross {
  fill: var(--ns-red);
}

/* A caption narrates each step, so nothing has to be dragged. */
.reading {
  display: flex;
  align-items: center;
  gap: 14px;
  /* Fixed, so the chart doesn't shift when the scale appears. */
  height: 72px;
  padding: 0 20px;
  background: var(--z-ink);
  color: #fff;
}

.reading b {
  flex: 1;
  font-size: 23px;
  line-height: 1.25;
}

.reading .dot {
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #8f8f8f;
  transition: background 400ms var(--ns-ease);
}

.reading.ok .dot { background: var(--ns-frozen); }
.reading.maybe .dot { background: var(--z-yellow); }

.scale {
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  transition: opacity 500ms var(--ns-ease);
}

.fc:not(.s3) .scale {
  display: none;
}

.scale li {
  display: flex;
  flex-direction: column;
  padding: 4px 12px;
  border: 1px solid #555;
  font-size: 15px;
  line-height: 1.25;
  color: #bdbdbd;
}

.scale em {
  font-style: normal;
  font-weight: 700;
  font-size: 17px;
  color: #fff;
}

.scale li.hit {
  border-color: var(--z-yellow);
  background: rgba(255, 210, 0, 0.12);
}

.scale li.hit em {
  color: var(--z-yellow);
}
</style>
