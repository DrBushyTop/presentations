<!--
  The honest test. Old master and the final tip, scored blind in the same round.
  Each slope is a member. The dashed rung is the second run of the same tip.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { calibration } from '../lib/data'
import { useStage } from '../lib/stage'
import Count from './Count.vue'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, ease, sweep, still } = useStage()

const W = 720
const H = 554
const y = (s: number) => H - 30 - ((s - 6.5) / 3.2) * (H - 70)
const LX = 150
const RX = 540
const seats = [
  { n: 'Opus', ...calibration.opus.overall, c: 'var(--hc-opus)', beat: calibration.opus.beat.tip },
  { n: 'Sol', ...calibration.sol.overall, c: 'var(--hc-sol)', beat: calibration.sol.beat.tip },
]
const mid = (s: { tip: number, repeat: number }) => (s.tip + s.repeat) / 2
const show = computed(() => props.step >= 1)
</script>

<template>
  <div class="hc-stage cal">
    <svg :viewBox="`0 0 ${W} ${H}`" width="100%" height="100%" role="img" aria-label="Blind scores for the old and new versions">
      <line :x1="LX" :x2="RX" :y1="y(9.5)" :y2="y(9.5)" stroke="var(--z-red)" stroke-width="2" stroke-dasharray="6 6" />
      <text :x="RX + 14" :y="y(9.5) + 7" class="goal">9.5</text>
      <text :x="LX" :y="H - 4" text-anchor="middle" class="ax">Before</text>
      <text :x="RX" :y="H - 4" text-anchor="middle" class="ax">After</text>
      <line :x1="LX" :x2="LX" :y1="y(9.7)" :y2="y(6.6)" stroke="var(--z-grey-200)" />
      <line :x1="RX" :x2="RX" :y1="y(9.7)" :y2="y(6.6)" stroke="var(--z-grey-200)" />
      <g v-for="(s, i) in seats" :key="s.n">
        <motion.path
          :d="`M${LX} ${y(s.master)} L${RX} ${y(mid(s))}`" fill="none" :stroke="s.c" stroke-width="3"
          :initial="{ pathLength: still ? 1 : 0 }" :animate="{ pathLength: entered ? 1 : 0 }" :transition="sweep(1.8, { delay: still ? 0 : i * 0.3 })"
        />
        <circle :cx="LX" :cy="y(s.master)" r="7" :fill="s.c" stroke="#fff" stroke-width="2" />
        <text :x="LX - 16" :y="y(s.master) + 7" text-anchor="end" class="v">{{ s.n }} {{ s.master.toFixed(2) }}</text>
        <motion.g :initial="false" :animate="{ opacity: entered ? 1 : 0 }" :transition="ease(0.6, { delay: still ? 0 : 2.2 })">
          <line :x1="RX" :x2="RX" :y1="y(s.tip)" :y2="y(s.repeat)" :stroke="s.c" stroke-width="10" stroke-linecap="round" />
          <text :x="RX + 18" :y="y(mid(s)) + 7" class="v">{{ s.n }} {{ mid(s).toFixed(2) }}</text>
        </motion.g>
      </g>
    </svg>
    <div class="side">
      <Rise v-for="(s, i) in seats" :key="s.n" :on="show" :delay="i * 0.15" class="gain">
        <b><Count :to="s.gain" :on="show" :decimals="2" sign :delay="0.15" /></b>
        <span>{{ s.n }}, about {{ Math.round(s.gain / s.noise) }}× its noise</span>
      </Rise>
      <Rise :on="step >= 2" class="gain muted">
        <b class="hc-num">+2.8</b><span>What the unblinded chart suggested</span>
      </Rise>
    </div>
  </div>
</template>

<style scoped>
.cal { display: grid; grid-template-columns: 720px 1fr; gap: 28px; }
.goal { font: 700 20px var(--z-font-text); fill: var(--z-red); }
.ax { font: 600 18px var(--z-font-text); fill: var(--z-grey-600); }
.v { font: 700 20px var(--z-font-text); fill: var(--z-ink); }
.side { display: grid; grid-auto-rows: 1fr; gap: 12px; }
.gain { background: var(--hc-soft); border-radius: 12px; padding: 16px 22px; display: flex; flex-direction: column; justify-content: center; }
.gain b { font-size: 60px; line-height: 1; color: var(--z-ink); }
.gain span:last-child { font-size: 19px; color: var(--z-grey-600); margin-top: 6px; }
.muted b { color: var(--z-grey-600); text-decoration: line-through; text-decoration-color: var(--z-red); text-decoration-thickness: 4px; }
</style>
