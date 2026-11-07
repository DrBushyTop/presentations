<!--
  The council: two read-only principal designers. Same brief, same app, same
  rival images, reports written separately. Input lines draw on entry.
-->
<script setup lang="ts">
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, ease, still } = useStage()

const inputs = [
  { y: 64, t: 'The live app', s: '7 walkthroughs' },
  { y: 190, t: 'Screenshots', s: '23 screens' },
  { y: 316, t: 'Rival shortlist', s: '16 images' },
  { y: 442, t: 'One brief', s: '10 rows, 5 criteria' },
]
const seats = [
  { y: 140, n: 'Opus 5.5', c: 'var(--z-teal)' },
  { y: 366, n: 'GPT-6.1 Sol', c: 'var(--z-ink)' },
]
const link = (a: number, b: number, x1: number, x2: number) => `M${x1} ${a} C${(x1 + x2) / 2} ${a} ${(x1 + x2) / 2} ${b} ${x2} ${b}`
const draw = (i: number) => ({
  initial: { pathLength: still.value ? 1 : 0 },
  animate: { pathLength: entered.value ? 1 : 0 },
  transition: ease(1, { delay: still.value ? 0 : i * 0.1 }),
})
</script>

<template>
  <div class="hc-stage c">
    <svg viewBox="0 0 1136 554" class="wires" aria-hidden="true">
      <template v-for="(s, k) in seats" :key="s.n">
        <motion.path v-for="(n, i) in inputs" :key="n.t" :d="link(n.y, s.y, 250, 470)" fill="none" stroke="var(--z-grey-200)" stroke-width="2" v-bind="draw(i + k)" />
        <motion.path :d="link(s.y, 253, 700, 870)" fill="none" :stroke="s.c" stroke-width="2" :initial="{ pathLength: step >= 1 ? 1 : 0 }" :animate="{ pathLength: step >= 1 ? 1 : 0 }" :transition="ease(0.8, { delay: k * 0.15 })" />
      </template>
    </svg>
    <Rise v-for="(n, i) in inputs" :key="n.t" class="in" :x="-20" :y="0" :delay="i * 0.08" :style="{ top: `${n.y - 44}px` }">
      <b>{{ n.t }}</b><span>{{ n.s }}</span>
    </Rise>
    <Rise v-for="(s, i) in seats" :key="s.n" class="seat" :y="0" :scale="0.8" :delay="0.6 + i * 0.2" :style="{ top: `${s.y - 88}px`, borderColor: s.c }">
      <i :style="{ background: s.c }" /><b>{{ s.n }}</b><span class="hc-mono">xhigh · read-only</span>
    </Rise>
    <Rise class="out" :on="step >= 1" :x="20" :y="0" :delay="0.6">
      <b>Two reports</b><span>Scores, reasons, up to 15 ranked changes</span>
    </Rise>
  </div>
</template>

<style scoped>
.c { position: absolute; }
.wires { position: absolute; inset: 0; width: 100%; height: 100%; }
.in { position: absolute; left: 0; width: 250px; height: 88px; background: var(--hc-soft); border-radius: 10px; padding: 14px 18px; }
.in b { display: block; font-size: 23px; color: var(--z-ink); }
.in span { font-size: 18px; color: var(--z-grey-600); }
.seat { position: absolute; left: 470px; width: 230px; height: 176px; border: 3px solid; border-radius: 14px; background: #fff; display: grid; justify-items: center; align-content: center; gap: 6px; text-align: center; }
.seat i { width: 56px; height: 56px; border-radius: 50%; }
.seat b { font-size: 25px; color: var(--z-ink); }
.seat span { font-size: 15px; color: var(--z-grey-600); }
.out { position: absolute; left: 870px; width: 266px; top: 169px; height: 168px; background: var(--z-ink); color: #fff; border-radius: 14px; padding: 24px; }
.out b { display: block; font-size: 30px; margin-bottom: 8px; }
.out span { font-size: 19px; line-height: 1.3; color: #d9d9d6; }
</style>
