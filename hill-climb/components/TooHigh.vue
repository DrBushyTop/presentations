<!--
  The goal, drawn to scale. Real rounds on the left, then the blind rate of
  +0.01 a round carried forward until it reaches 9.5. Cost uses the $73 average
  of the last three blind rounds.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { mean, smooth } from '../lib/terrain'
import { useStage } from '../lib/stage'
import Count from './Count.vue'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, ease, still } = useStage()

const W = 1136
const H = 554
const L = 44
const R = 24
const B = 34
const T = 12
const LAST = 102
const x = (r: number) => L + ((r - 1) / (LAST - 1)) * (W - L - R)
const y = (s: number) => H - B - ((s - 6) / 4) * (H - B - T)
const line = smooth(mean.map((s, i) => [x(i + 1), y(s)] as [number, number]), 0.3)
const nowR = 22
const nowS = mean[21]
const end = computed(() => (props.step >= 1 && entered.value ? { cx: x(LAST), cy: y(9.5) } : { cx: x(nowR), cy: y(nowS) }))
const reveal = computed(() => (props.step >= 1 && entered.value ? x(LAST) + 8 : x(nowR)))
</script>

<template>
  <div class="hc-stage th">
    <svg :viewBox="`0 0 ${W} ${H}`" width="100%" height="100%" role="img" aria-label="Score by round, projected forward to the 9.5 goal">
      <defs>
        <clipPath id="hc-th-reveal">
          <motion.rect :y="-10" :height="H + 20" :initial="{ width: still ? reveal : x(nowR) }" :animate="{ width: reveal }" :transition="ease(3)" />
        </clipPath>
      </defs>
      <g v-for="v in [6, 7, 8, 9, 10]" :key="v">
        <line :x1="L" :x2="W - R" :y1="y(v)" :y2="y(v)" stroke="var(--z-grey-200)" stroke-width="1" />
        <text :x="L - 12" :y="y(v) + 6" text-anchor="end" class="ax">{{ v }}</text>
      </g>
      <text v-for="r in [1, 22, 50, 75, 102]" :key="r" :x="x(r)" :y="H - 8" text-anchor="middle" class="ax">{{ r }}</text>
      <text :x="x(11)" :y="H - 8" text-anchor="middle" class="ax">Round</text>
      <line :x1="L" :x2="W - R" :y1="y(9.5)" :y2="y(9.5)" stroke="var(--z-red)" stroke-width="2" stroke-dasharray="6 6" />
      <text :x="L + 8" :y="y(9.5) - 10" class="goal">Goal 9.5</text>
      <path :d="line" fill="none" stroke="var(--hc-opus)" stroke-width="2.5" />
      <path
        :d="`M${x(nowR)} ${y(nowS)} L${x(LAST)} ${y(9.5)}`" clip-path="url(#hc-th-reveal)"
        fill="none" stroke="var(--z-ink)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="0.1 10"
      />
      <circle :cx="x(nowR)" :cy="y(nowS)" r="7" fill="var(--hc-opus)" stroke="#fff" stroke-width="2" />
      <motion.text :x="x(62)" :y="y(8.82)" text-anchor="middle" class="lab" :initial="false" :animate="{ opacity: step >= 1 ? 1 : 0 }" :transition="ease(0.6, { delay: still ? 0 : 0.4 })">+0.01 per round, blind</motion.text>
      <text :x="x(nowR) + 4" :y="y(nowS) + 34" class="lab">We stopped: {{ nowS.toFixed(2) }}</text>
      <motion.circle r="9" fill="var(--z-ink)" stroke="#fff" stroke-width="2" :initial="false" :animate="end" :transition="ease(3)" :opacity="step >= 1 ? 1 : 0" />
    </svg>
    <div class="nums">
      <Rise :on="step >= 1" :delay="0.5"><b><Count :to="80" :on="step >= 1" :delay="0.5" :duration="2.4" /></b><span>more rounds</span></Rise>
      <Rise :on="step >= 1" :delay="1.2"><b><Count :to="160" :on="step >= 1" :delay="1.2" :duration="1.8" suffix=" h" /></b><span>of machine time</span></Rise>
      <Rise :on="step >= 1" :delay="1.9"><b><Count :to="5800" :on="step >= 1" :delay="1.9" :duration="1.2" prefix="$" /></b><span>at list price</span></Rise>
    </div>
  </div>
</template>

<style scoped>
.ax { font: 500 17px var(--hc-mono); fill: var(--z-grey-600); }
.goal { font: 700 20px var(--z-font-text); fill: var(--z-red); }
.lab { font: 700 20px var(--z-font-text); fill: var(--z-ink); }
.nums { position: absolute; left: 400px; right: 24px; bottom: 58px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.nums b { display: block; font-size: 58px; line-height: 1; color: var(--z-ink); font-variant-numeric: tabular-nums; }
.nums span { font-size: 21px; color: var(--z-grey-600); }
</style>
