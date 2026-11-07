<!--
  Why the join hurt. Left: ten agents, one hot file. Right: four lanes that each
  own their files. Round 14 is the first with lanes.
-->
<script setup lang="ts">
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'
import Count from './Count.vue'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, ease, still } = useStage()
const Y = (i: number, n: number, h: number) => 30 + (i + 0.5) * (h / n)
const left = Array.from({ length: 10 }, (_, i) => Y(i, 10, 340))
const right = Array.from({ length: 4 }, (_, i) => Y(i, 4, 340))
const draw = (on: boolean, i: number) => ({
  initial: { pathLength: on ? 1 : 0 },
  animate: { pathLength: on && entered.value ? 1 : 0 },
  transition: ease(0.8, { delay: still.value ? 0 : i * 0.05 }),
})
</script>

<template>
  <div class="hc-stage l">
    <div class="sec">
      <svg viewBox="0 0 540 400" class="pic" aria-hidden="true">
        <circle v-for="(y, i) in left" :key="i" cx="24" :cy="y" r="11" fill="var(--z-teal)" />
        <motion.path v-for="(y, i) in left" :key="`p${i}`" :d="`M36 ${y} C200 ${y} 240 200 360 200`" fill="none" stroke="var(--z-red)" stroke-width="2" v-bind="draw(true, i)" />
        <rect x="360" y="170" width="170" height="60" rx="8" fill="var(--z-red)" />
        <text x="445" y="208" text-anchor="middle" class="file">ReviewPage</text>
      </svg>
      <p class="stat"><Count :to="152" :on="entered" :delay="0.5" /><span>of 456 PR pairs shared a file</span></p>
    </div>
    <Rise :on="step >= 1" :x="30" :y="0">
      <div class="sec">
        <svg viewBox="0 0 540 400" class="pic" aria-hidden="true">
          <template v-for="(y, i) in right" :key="i">
            <circle cx="24" :cy="y" r="16" fill="var(--z-teal)" />
            <motion.path :d="`M42 ${y} L360 ${y}`" fill="none" stroke="var(--z-teal)" stroke-width="3" v-bind="draw(step >= 1, i)" />
            <rect x="360" :y="y - 26" width="170" height="52" rx="8" fill="var(--hc-soft)" stroke="var(--z-grey-200)" />
            <text x="445" :y="y + 7" text-anchor="middle" class="file ink">Lane {{ i + 1 }}</text>
          </template>
        </svg>
        <p class="stat"><Count :to="16" :on="step >= 1" :delay="0.5" /><span>PRs in 39 min. Before: 10 in 55.</span></p>
      </div>
    </Rise>
  </div>
</template>

<style scoped>
.l { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
.sec { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.pic { flex: 1; min-height: 0; width: 100%; }
.file { font: 700 22px var(--z-font-text); fill: #fff; }
.file.ink { fill: var(--z-ink); }
.stat { display: flex; align-items: baseline; gap: 12px; margin: 8px 0 0; font-size: 22px; color: var(--z-ink); }
.stat .hc-num { font-size: 64px; line-height: 1; }
</style>
