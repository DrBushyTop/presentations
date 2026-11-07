<!--
  The headline chart. One axis, two series, labelled at the line ends. Clicks
  move the reveal: round 4, round 18 and the goal, the blind round, the end.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { overall, smooth } from '../lib/terrain'
import { useStage } from '../lib/stage'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, ease, sweep, spring, still } = useStage()

const W = 1136
const H = 554
const L = 44
const R = 140
const x = (r: number) => L + ((r - 1) / 21) * (W - L - R)
const y = (s: number) => H - 34 - ((s - 6) / 4) * (H - 60)
const path = (s: number[]) => s.map((v, i) => [x(i + 1), y(v)] as [number, number])
const opus = overall('opus')
const sol = overall('sol')
const stops = [1, 4, 18, 19, 22]
const to = computed(() => stops[Math.min(props.step, 4)])
const reveal = computed(() => (entered.value ? x(to.value) + 14 : 0))
const last = (s: number[]) => s[to.value - 1]
</script>

<template>
  <div class="hc-stage">
    <svg :viewBox="`0 0 ${W} ${H}`" width="100%" height="100%" role="img" aria-label="Council scores by round">
      <defs>
        <clipPath id="hc-score-clip">
          <motion.rect y="-10" :height="H + 20" :initial="{ width: still ? reveal : 0 }" :animate="{ width: reveal }" :transition="sweep(step === 0 ? 0.8 : 2.4)" />
        </clipPath>
      </defs>
      <g v-for="v in [6, 7, 8, 9, 10]" :key="v">
        <line :x1="L" :x2="W - R" :y1="y(v)" :y2="y(v)" stroke="var(--z-grey-200)" stroke-width="1" />
        <text :x="L - 12" :y="y(v) + 6" text-anchor="end" class="ax">{{ v }}</text>
      </g>
      <text v-for="r in [1, 5, 10, 15, 22]" :key="r" :x="x(r)" :y="H - 8" text-anchor="middle" class="ax">{{ r }}</text>
      <motion.g :initial="false" :animate="{ opacity: step >= 2 ? 1 : 0 }" :transition="ease(0.8)">
        <line :x1="L" :x2="W - R" :y1="y(9.5)" :y2="y(9.5)" stroke="var(--z-red)" stroke-width="2" stroke-dasharray="6 6" />
        <text :x="L + 8" :y="y(9.5) - 10" class="goal">Goal 9.5</text>
      </motion.g>
      <motion.g :initial="false" :animate="{ opacity: step >= 3 ? 1 : 0 }" :transition="ease(0.8)">
        <line :x1="x(19)" :x2="x(19)" :y1="y(10)" :y2="y(6)" stroke="var(--z-ink)" stroke-width="1" stroke-dasharray="3 5" />
        <text :x="x(19) + 8" :y="y(10) + 18" class="blind">Blind</text>
      </motion.g>
      <g clip-path="url(#hc-score-clip)">
        <path :d="smooth(path(sol), 0.35)" fill="none" stroke="var(--hc-sol)" stroke-width="2.5" />
        <path :d="smooth(path(opus), 0.35)" fill="none" stroke="var(--hc-opus)" stroke-width="2.5" />
      </g>
      <motion.g v-for="(s, k) in [{ v: opus, n: 'Opus', c: 'var(--hc-opus)', d: -1 }, { v: sol, n: 'Sol', c: 'var(--hc-sol)', d: 1 }]" :key="s.n"
        :initial="false" :animate="{ x: x(to), y: y(last(s.v)) }" :transition="sweep(step === 0 ? 0.8 : 2.4)">
        <circle r="6" :fill="s.c" stroke="#fff" stroke-width="2" />
        <text x="16" :y="(last(opus) >= last(sol) ? (k === 0 ? -8 : 22) : (k === 0 ? 22 : -8))" class="lab">{{ s.n }} {{ last(s.v).toFixed(2) }}</text>
      </motion.g>
    </svg>
  </div>
</template>

<style scoped>
.ax { font: 500 17px var(--hc-mono); fill: var(--z-grey-600); }
.goal { font: 700 20px var(--z-font-text); fill: var(--z-red); }
.blind { font: 700 20px var(--z-font-text); fill: var(--z-ink); }
.lab { font: 700 20px var(--z-font-text); fill: var(--z-ink); }
</style>
