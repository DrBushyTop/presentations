<!-- The rule changes, flagged on the real score line. Three paced groups. -->
<script setup lang="ts">
import { motion } from 'motion-v'
import { mean, smooth } from '../lib/terrain'
import { useStage } from '../lib/stage'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, ease, spring, still } = useStage()

const W = 1136
const H = 554
const x = (r: number) => 30 + ((r - 1) / 22) * (W - 60)
const y = (s: number) => 506 - ((s - 6) / 4) * 300
const line = smooth(mean.map((s, i) => [x(i + 1), y(s)] as [number, number]))
const groups = [
  { at: 0, c: 'var(--z-grey-600)', rules: [{ r: 1, t: 'Parallelise', l: 1 }, { r: 8, t: 'Phone is a nice-to-have', l: 1 }] },
  { at: 1, c: 'var(--z-teal)', rules: [{ r: 13, t: 'Max 4 lanes, one brief', l: 2 }, { r: 15, t: 'Lanes land themselves', l: 1 }, { r: 17, t: 'Council stops waiting for checks', l: 3, end: true }] },
  { at: 2, c: 'var(--z-ink)', rules: [{ r: 13, t: 'Freeze rival scores', l: 4, end: true }, { r: 16, t: 'Big fixes allowed', l: 4 }] },
  { at: 3, c: 'var(--z-red)', rules: [{ r: 19, t: 'Blind', l: 2 }, { r: 23, t: 'Stop', l: 1, end: true }] },
]
const flagY = (l: number) => 8 + (l - 1) * 46
</script>

<template>
  <div class="hc-stage">
    <svg :viewBox="`0 0 ${W} ${H}`" width="100%" height="100%" aria-hidden="true">
      <motion.path :d="line" fill="none" stroke="var(--z-teal)" stroke-width="3" :initial="{ pathLength: still ? 1 : 0 }" :animate="{ pathLength: entered ? 1 : 0 }" :transition="ease(1.4)" />
      <line :x1="x(1)" :x2="x(23)" y1="526" y2="526" stroke="var(--z-grey-200)" stroke-width="2" />
      <text v-for="r in [1, 5, 10, 15, 20, 23]" :key="r" :x="x(r)" y="550" text-anchor="middle" class="tick">{{ r }}</text>
      <template v-for="g in groups" :key="g.at">
        <motion.g
          v-for="f in g.rules" :key="f.t"
          :initial="false"
          :animate="{ opacity: step >= g.at && entered ? 1 : 0 }"
          :transition="spring()"
        >
          <line :x1="x(f.r)" :x2="x(f.r)" :y1="flagY(f.l) + 30" y2="526" :stroke="g.c" stroke-width="2" stroke-dasharray="2 5" />
          <text :x="f.end ? x(f.r) - 10 : x(f.r) + 10" :y="flagY(f.l) + 22" :text-anchor="f.end ? 'end' : 'start'" class="flag" :fill="g.c">{{ f.t }}</text>
        </motion.g>
      </template>
    </svg>
  </div>
</template>

<style scoped>
.tick { font: 500 16px var(--hc-mono); fill: var(--z-grey-600); }
.flag { font: 700 22px var(--z-font-text); }
</style>
