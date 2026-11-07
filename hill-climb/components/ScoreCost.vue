<!--
  Score against money. Clicks: the first rounds, the rest of the climb, the
  blind rounds and how much of the curve was memory, then the band to stop in.
  Everything above the blind plateau can't be real, because later builds were
  better and still scored lower. Below that line a score is only an upper bound.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { spendByRound } from '../lib/data'
import { mean, smooth } from '../lib/terrain'
import { useStage } from '../lib/stage'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, ease, still } = useStage()

const W = 1136
const H = 554
const L = 44
const R = 24
const B = 34
const T = 12
const MAX = 1400
const x = (d: number) => L + (d / MAX) * (W - L - R)
const y = (s: number) => H - B - ((s - 6) / 4) * (H - B - T)
const pts = mean.map((s, i) => [x(spendByRound[i]), y(s)] as [number, number])
const line = smooth(pts, 0.3)
const blind = mean.slice(18)
const plateau = blind.reduce((a, b) => a + b, 0) / blind.length

const at = (r: number) => ({ x: x(spendByRound[r - 1]), y: y(mean[r - 1]) })
const rate = (a: number, b: number) => ((mean[b - 1] - mean[a - 1]) / (spendByRound[b - 1] - spendByRound[a - 1]) * 100).toFixed(2)

const to = computed(() => [4, 18, 22, 22][Math.min(props.step, 3)])
const reveal = computed(() => (entered.value ? at(to.value).x + 10 : 0))
const notes = [
  { r: 1, a: 'start', dx: 14, dy: 26, t: '$11', at: 0 },
  { r: 4, a: 'start', dx: 4, dy: -16, t: '$227', at: 0 },
  { r: 10, a: 'start', dx: 8, dy: 34, t: '$539', at: 1 },
  { r: 18, a: 'middle', dx: 0, dy: -16, t: '$1,012', at: 1 },
  { r: 22, a: 'end', dx: 0, dy: 34, t: '$1,298', at: 2 },
]
const rates = [
  { from: 1, to: 4, v: rate(1, 4), left: 106, top: 300, at: 0 },
  { from: 4, to: 10, v: rate(4, 10), left: 312, top: 300, at: 1 },
  { from: 19, to: 22, v: rate(19, 22), left: 900, top: 300, at: 2 },
]
const band = computed(() => ({ x: at(4).x, w: at(10).x - at(4).x }))
</script>

<template>
  <div class="hc-stage sc">
    <svg :viewBox="`0 0 ${W} ${H}`" width="100%" height="100%" role="img" aria-label="Council score against cumulative spend">
      <defs>
        <clipPath id="hc-sc-reveal">
          <motion.rect :y="-10" :height="H + 20" :initial="{ width: still ? reveal : 0 }" :animate="{ width: reveal }" :transition="ease(step === 0 ? 0.8 : 1.5)" />
        </clipPath>
        <clipPath id="hc-sc-above"><rect :x="0" :y="0" :width="W" :height="y(plateau)" /></clipPath>
      </defs>
      <motion.rect :x="band.x" :y="T" :width="band.w" :height="H - B - T" fill="var(--z-teal-100)" :initial="false" :animate="{ opacity: step >= 3 ? 0.38 : 0 }" :transition="ease(0.6)" />
      <g v-for="v in [6, 7, 8, 9, 10]" :key="v">
        <line :x1="L" :x2="W - R" :y1="y(v)" :y2="y(v)" stroke="var(--z-grey-200)" stroke-width="1" />
        <text :x="L - 12" :y="y(v) + 6" text-anchor="end" class="ax">{{ v }}</text>
      </g>
      <text v-for="d in [0, 400, 800, 1200]" :key="d" :x="x(d)" :y="H - 8" text-anchor="middle" class="ax">${{ d.toLocaleString('en-US') }}</text>
      <motion.g :initial="false" :animate="{ opacity: step >= 1 ? 1 : 0 }" :transition="ease(0.5)">
        <line :x1="L" :x2="W - R" :y1="y(9.5)" :y2="y(9.5)" stroke="var(--z-red)" stroke-width="2" stroke-dasharray="6 6" />
        <text :x="L + 8" :y="y(9.5) - 10" class="goal">Goal 9.5</text>
      </motion.g>
      <motion.g :initial="false" :animate="{ opacity: step >= 2 ? 1 : 0 }" :transition="ease(0.6)">
        <path :d="`${line} L${pts[17][0]} ${H - B} L${pts[0][0]} ${H - B} Z`" clip-path="url(#hc-sc-above)" fill="var(--z-red)" opacity="0.14" />
        <line :x1="L" :x2="W - R" :y1="y(plateau)" :y2="y(plateau)" stroke="var(--z-ink)" stroke-width="1.5" stroke-dasharray="3 5" />
        <text :x="W - R" :y="y(plateau) - 10" text-anchor="end" class="lab">Blind {{ plateau.toFixed(2) }}</text>
        <text :x="at(14).x" :y="y(9.32)" text-anchor="middle" class="mem">Memory</text>
      </motion.g>
      <g clip-path="url(#hc-sc-reveal)">
        <path :d="line" fill="none" stroke="var(--hc-opus)" stroke-width="2.5" />
        <circle v-for="(p, i) in pts" :key="i" :cx="p[0]" :cy="p[1]" r="3.5" fill="var(--hc-opus)" stroke="#fff" stroke-width="1.5" />
      </g>
      <template v-for="n in notes" :key="n.r">
        <motion.g :initial="false" :animate="{ opacity: step >= n.at && entered ? 1 : 0 }" :transition="ease(0.4, { delay: still ? 0 : 0.5 })">
          <text :x="at(n.r).x + n.dx" :y="at(n.r).y + n.dy" :text-anchor="n.a" class="lab">R{{ n.r }} · {{ n.t }}</text>
        </motion.g>
      </template>
      <motion.text :x="band.x + band.w / 2" :y="y(9.72)" text-anchor="middle" class="spot" :initial="false" :animate="{ opacity: step >= 3 ? 1 : 0 }" :transition="ease(0.5)">Sweet spot</motion.text>
    </svg>
    <motion.div
      v-for="k in rates" :key="k.from" class="rate"
      :style="{ left: `${k.left}px`, top: `${k.top}px` }"
      :initial="false"
      :animate="{ opacity: step >= k.at && entered ? 1 : 0, y: step >= k.at ? 0 : 10 }"
      :transition="ease(0.5, { delay: still ? 0 : 0.7 })"
    >
      <b class="hc-num">+{{ k.v }}</b><span>per $100</span>
    </motion.div>
  </div>
</template>

<style scoped>
.ax { font: 500 17px var(--hc-mono); fill: var(--z-grey-600); }
.goal { font: 700 20px var(--z-font-text); fill: var(--z-red); }
.lab { font: 700 19px var(--z-font-text); fill: var(--z-ink); }
.mem { font: 700 20px var(--z-font-text); fill: var(--z-red); }
.spot { font: 700 24px var(--z-font-text); fill: var(--z-ink); }
.rate { position: absolute; display: flex; flex-direction: column; }
.rate b { font-size: 38px; line-height: 1; color: var(--z-ink); }
.rate span { font-size: 18px; color: var(--z-grey-600); }
</style>
