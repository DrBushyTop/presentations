<!--
  How three designers ranked four builds of six screens. Clicks: the original
  and the final build, then rounds 2/3 and 10, then where round 10 beat the
  final build, screen by screen and person by person.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { ranks } from '../lib/study'
import { useStage } from '../lib/stage'
import Count from './Count.vue'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, spring, still } = useStage()

const W = 660
const H = 554
const X0 = 196
const X1 = 628
const TOP = 40
const AXIS = 66
const x = (r: number) => X0 + ((4 - r) / 3) * (X1 - X0)
const rowH = (H - TOP - AXIS) / ranks.length
const y = (i: number) => TOP + rowH * (i + 0.5)

const look = {
  original: { fill: 'var(--z-grey-600)', at: 0 },
  r2: { fill: 'var(--z-grey-600)', at: 1 },
  r10: { fill: 'var(--z-teal)', at: 1 },
  final: { fill: 'var(--z-ink)', at: 0 },
} as const
const shown = (k: keyof typeof look) => entered.value && props.step >= look[k].at

// Round 10 above the final build? One row per screen, P1 to P3.
const grid = [
  { s: 'Session review', w: [1, 1, 1] },
  { s: 'Task results', w: [0, 0, 1] },
  { s: 'Findings', w: [0, 1, 1] },
  { s: 'Sessions', w: [1, 1, 1], note: 'R10 first for all 3' },
  { s: 'Search', w: [0, 1, 1] },
  { s: 'Setup', w: [1, 0, 1], note: 'Final build last' },
]
const wins = grid.reduce((a, g) => a + g.w.reduce((b, c) => b + c, 0), 0)
const third = computed(() => props.step >= 2 && entered.value)
</script>

<template>
  <div class="hc-stage pr">
    <svg :viewBox="`0 0 ${W} ${H}`" width="100%" height="100%" role="img" aria-label="Mean rank of each build, 1 is best">
      <g v-for="t in [4, 3, 2, 1]" :key="t">
        <line :x1="x(t)" :x2="x(t)" :y1="TOP - 10" :y2="H - AXIS + 6" stroke="var(--z-grey-200)" stroke-width="1" />
        <text :x="x(t)" :y="H - AXIS + 32" text-anchor="middle" class="ax">{{ t }}</text>
      </g>
      <text :x="X0" :y="H - 6" class="end">Worst</text>
      <text :x="X1" :y="H - 6" text-anchor="end" class="end">Best</text>
      <text :x="(X0 + X1) / 2" :y="H - 6" text-anchor="middle" class="cap">Mean rank, 18 rankings</text>

      <g v-for="(r, i) in ranks" :key="r.k">
        <motion.g :initial="false" :animate="{ opacity: shown(r.k) ? 1 : 0.22 }" :transition="spring()">
          <text :x="0" :y="y(i) + 9" class="row" :class="r.k">{{ r.n }}</text>
          <line :x1="X0" :x2="X1" :y1="y(i)" :y2="y(i)" stroke="var(--z-grey-200)" stroke-width="10" stroke-linecap="round" />
        </motion.g>
        <motion.line
          :x1="X0" :y1="y(i)" :y2="y(i)" :stroke="look[r.k].fill" stroke-width="10" stroke-linecap="round"
          :initial="{ x2: still ? x(r.v) : X0, opacity: still ? 0.28 : 0 }" :animate="{ x2: shown(r.k) ? x(r.v) : X0, opacity: shown(r.k) ? 0.28 : 0 }"
          :transition="spring({ visualDuration: 0.9, delay: still || !shown(r.k) ? 0 : (r.k === 'r10' ? 0.25 : 0) })"
        />
        <motion.g
          :initial="{ x: still ? x(r.v) : X0, opacity: still ? 1 : 0 }"
          :animate="{ x: shown(r.k) ? x(r.v) : X0, opacity: shown(r.k) ? 1 : 0 }"
          :transition="spring({ visualDuration: 0.9, delay: still || !shown(r.k) ? 0 : (r.k === 'r10' ? 0.25 : 0) })"
        >
          <circle :cx="0" :cy="y(i)" :r="r.k === 'r10' ? 20 : 16" :fill="look[r.k].fill" stroke="#fff" stroke-width="3" />
          <text :x="0" :y="y(i) - 30" text-anchor="middle" class="val" :class="r.k">{{ r.v.toFixed(2) }}</text>
        </motion.g>
      </g>
    </svg>

    <Rise class="side" :delay="0.3" :x="24" :y="0">
      <motion.p class="big" :initial="false" :animate="{ opacity: third ? 1 : 0 }" :transition="spring()"><b class="hc-num"><Count :to="wins" :on="third" :duration="1.4" /></b> of 18</motion.p>
      <p class="sub">Round 10 above the final build</p>
      <div class="grid">
        <span />
        <span v-for="p in ['P1', 'P2', 'P3']" :key="p" class="who">{{ p }}</span>
        <span />
        <template v-for="(g, gi) in grid" :key="g.s">
          <span class="s">{{ g.s }}</span>
          <span v-for="(w, wi) in g.w" :key="wi" class="cell">
            <motion.i
              v-if="w" class="win"
              :initial="false" :animate="{ scale: third ? 1 : 0.3, opacity: third ? 1 : 0 }"
              :transition="spring({ delay: still || !third ? 0 : 0.3 + gi * 0.09 + wi * 0.03 })"
            />
          </span>
          <Rise :on="third" :delay="0.9" :y="0" :x="-10" class="n" :class="{ bad: g.s === 'Setup' }">{{ g.note }}</Rise>
        </template>
      </div>
      <p class="key"><i class="sw win" /> Round 10 higher <i class="sw" /> Final build higher</p>
    </Rise>
  </div>
</template>

<style scoped>
.pr { display: grid; grid-template-columns: 660px 1fr; gap: 36px; }
.ax { font: 500 18px var(--hc-mono); fill: var(--z-grey-600); }
.end { font: 700 19px var(--z-font-text); fill: var(--z-grey-600); }
.cap { font: 500 18px var(--z-font-text); fill: var(--z-grey-600); }
.row { font: 700 26px var(--z-font-text); fill: var(--z-ink); }
.row.r10 { fill: var(--z-teal); }
.val { font: 700 24px var(--hc-mono); fill: var(--z-ink); }
.val.r10 { fill: var(--z-teal); font-size: 28px; }
.side { display: flex; flex-direction: column; justify-content: center; height: 100%; }
.big { margin: 0; font-size: 30px; font-weight: 700; color: var(--z-ink); }
.big b { font-size: 76px; line-height: 1; color: var(--z-teal); }
.sub { margin: 2px 0 22px; font-size: 22px; color: var(--z-ink-800); }
.grid { display: grid; grid-template-columns: auto repeat(3, 38px) 1fr; gap: 8px 8px; align-items: center; }
.who { font: 600 16px var(--hc-mono); color: var(--z-grey-600); text-align: center; }
.s { font-size: 19px; color: var(--z-ink); padding-right: 6px; }
.cell { position: relative; width: 38px; height: 38px; border-radius: 8px; border: 3px solid var(--z-grey-200); box-sizing: border-box; }
.win { position: absolute; inset: -3px; border-radius: 8px; background: var(--z-teal); }
.key { display: flex; align-items: center; gap: 8px; margin: 18px 0 0; font-size: 16px; color: var(--z-grey-600); }
.sw { position: static; display: inline-block; width: 18px; height: 18px; border-radius: 4px; border: 3px solid var(--z-grey-200); box-sizing: border-box; }
.sw.win { border-color: var(--z-teal); }
.sw + .sw, .key .sw:nth-of-type(2) { margin-left: 14px; }
.n { font-size: 16px; font-weight: 700; color: var(--z-teal); padding-left: 6px; line-height: 1.15; }
.n.bad { color: var(--z-red); }
</style>
