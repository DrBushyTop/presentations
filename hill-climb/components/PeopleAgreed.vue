<!--
  The designers agreed with the council, by less. Group 1: hands-on ratings,
  old to new, per person. Click: the blind pairs on their own -2..+2 scale,
  with the marker sliding to the mean.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { hands, pairs } from '../lib/study'
import { useStage } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, spring, still } = useStage()

// Ratings, 1 to 10.
const RW = 760
const RH = 236
const X0 = 150
const X1 = 730
const rx = (v: number) => X0 + ((v - 1) / 9) * (X1 - X0)
const ry = (i: number) => 26 + i * 50 + (i === 3 ? 12 : 0)
const go = computed(() => entered.value)

// Blind pairs, -2 to +2.
const PW = 1136
const PH = 176
const P0 = 110
const P1 = 1026
const px = (v: number) => P0 + ((v + 2) / 4) * (P1 - P0)
const LINE = 74
const ticks = [
  { v: -2, a: 'Original', b: 'clearly better' },
  { v: -1, a: 'Original', b: 'slightly better' },
  { v: 0, a: 'No', b: 'difference' },
  { v: 1, a: 'Final build', b: 'slightly better' },
  { v: 2, a: 'Final build', b: 'clearly better' },
]
const second = computed(() => entered.value && props.step >= 1)
</script>

<template>
  <div class="hc-stage pa">
    <div class="g1">
      <div class="rate">
        <p class="gh">Hands-on rating, 1 to 10 <span class="key"><i class="old" />Old <i class="new" />New</span></p>
        <svg :viewBox="`0 0 ${RW} ${RH}`" width="100%" :height="RH" role="img" aria-label="Hands-on rating per person, old and new build">
          <g v-for="t in [1, 4, 7, 10]" :key="t">
            <line :x1="rx(t)" :x2="rx(t)" y1="6" :y2="RH - 24" stroke="var(--z-grey-200)" stroke-width="1" />
            <text :x="rx(t)" :y="RH - 2" text-anchor="middle" class="ax">{{ t }}</text>
          </g>
          <line :x1="X0 - 130" :x2="X1" :y1="ry(3) - 31" :y2="ry(3) - 31" stroke="var(--z-grey-200)" stroke-width="1" />
          <g v-for="(h, i) in hands" :key="h.p">
            <text x="0" :y="ry(i) + 7" class="who" :class="{ all: i === 3 }">{{ h.p }}</text>
            <motion.line
              :x1="rx(h.old)" :y1="ry(i)" :y2="ry(i)" stroke="var(--z-teal)" stroke-width="6" stroke-linecap="round"
              :initial="{ x2: still ? rx(h.new) : rx(h.old) }" :animate="{ x2: go ? rx(h.new) : rx(h.old) }"
              :transition="spring({ visualDuration: 0.9, delay: still ? 0 : 0.4 + i * 0.15 })"
            />
            <circle :cx="rx(h.old)" :cy="ry(i)" r="11" fill="var(--z-grey-600)" />
            <motion.g
              :initial="{ x: still ? rx(h.new) : rx(h.old) }" :animate="{ x: go ? rx(h.new) : rx(h.old) }"
              :transition="spring({ visualDuration: 0.9, delay: still ? 0 : 0.4 + i * 0.15 })"
            >
              <circle cx="0" :cy="ry(i)" :r="i === 3 ? 14 : 11" fill="var(--z-teal)" stroke="#fff" stroke-width="3" />
            </motion.g>
            <text :x="rx(Math.max(h.old, h.new)) + 26" :y="ry(i) + 7" class="val" :class="{ all: i === 3 }">
              {{ h.t }}
            </text>
          </g>
        </svg>
      </div>
      <Rise class="pick" :delay="0.9" :x="20" :y="0">
        <p><b class="hc-num">2 of 3</b></p>
        <p class="s">picked the new build</p>
        <p class="t">The third saw no real difference</p>
      </Rise>
    </div>

    <Rise class="g2" :delay="0.5" :y="16">
      <p class="gh">Blind pairs, original against the final build, −2 to +2</p>
      <svg :viewBox="`0 0 ${PW} ${PH}`" width="100%" :height="PH" role="img" aria-label="Mean blind preference on a minus 2 to plus 2 scale">
        <motion.rect :x="px(0)" :y="LINE - 16" :width="px(1) - px(0)" height="32" fill="var(--z-teal)" rx="4" :initial="false" :animate="{ opacity: second ? 0.22 : 0 }" :transition="spring({ delay: still ? 0 : 1.2 })" />
        <line :x1="P0" :x2="P1" :y1="LINE" :y2="LINE" stroke="var(--z-grey-200)" stroke-width="4" />
        <g v-for="t in ticks" :key="t.v">
          <line :x1="px(t.v)" :x2="px(t.v)" :y1="LINE - 12" :y2="LINE + 12" stroke="var(--z-grey-600)" stroke-width="3" />
          <text :x="px(t.v)" :y="LINE + 44" text-anchor="middle" class="tk">{{ t.a }}</text>
          <text :x="px(t.v)" :y="LINE + 66" text-anchor="middle" class="tk">{{ t.b }}</text>
        </g>
        <motion.g
          :initial="{ x: still ? px(pairs.mean) : px(0), opacity: still ? 1 : 0 }" :animate="{ x: second ? px(pairs.mean) : px(0), opacity: second ? 1 : 0 }"
          :transition="spring({ visualDuration: 1.2, bounce: 0.1, delay: still ? 0 : 0.6 })"
        >
          <path :d="`M0 ${LINE - 6} L-12 ${LINE - 26} L12 ${LINE - 26} Z`" fill="var(--z-teal)" />
          <text x="0" :y="LINE - 36" text-anchor="middle" class="mk">+{{ pairs.mean.toFixed(2) }}</text>
        </motion.g>
      </svg>
      <Rise :on="step >= 1" :delay="1.3" :y="10">
        <p class="cap">About halfway from no difference to slightly better. Final build won {{ pairs.won }}, tied {{ pairs.tied }}, lost {{ pairs.lost }}.</p>
      </Rise>
    </Rise>
  </div>
</template>

<style scoped>
.pa { display: grid; grid-template-rows: auto 1fr; gap: 18px; }
.g1 { display: grid; grid-template-columns: 1fr 300px; gap: 36px; align-items: center; }
.gh { margin: 0 0 8px; font-size: 22px; font-weight: 700; color: var(--z-ink); display: flex; align-items: center; gap: 18px; }
.key { display: inline-flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 500; color: var(--z-grey-600); }
.key i { display: inline-block; width: 14px; height: 14px; border-radius: 50%; }
.key i.new { margin-left: 10px; background: var(--z-teal); }
.key i.old { background: var(--z-grey-600); }
.ax { font: 500 16px var(--hc-mono); fill: var(--z-grey-600); }
.who { font: 700 22px var(--z-font-text); fill: var(--z-ink); }
.who.all { fill: var(--z-teal); }
.val { font: 700 20px var(--hc-mono); fill: var(--z-ink); }
.val.all { fill: var(--z-teal); font-size: 22px; }
.pick { border-radius: 14px; background: var(--hc-soft); padding: 26px 26px; }
.pick p { margin: 0; }
.pick b { font-size: 64px; line-height: 1; color: var(--z-teal); }
.pick .s { font-size: 24px; font-weight: 700; color: var(--z-ink); margin-top: 6px; }
.pick .t { font-size: 18px; color: var(--z-grey-600); margin-top: 10px; }
.g2 { display: flex; flex-direction: column; justify-content: flex-end; }
.tk { font: 500 17px var(--z-font-text); fill: var(--z-grey-600); }
.mk { font: 700 26px var(--hc-mono); fill: var(--z-teal); }
.cap { margin: 4px 0 0; max-width: none; font-size: 20px; color: var(--z-ink-800); }
</style>
