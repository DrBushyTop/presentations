<!--
  The checks. In series, and everything else queued behind them. Then in
  parallel, on their own instance, and the council stops waiting. Last click is
  the honest bit: the time saved went straight into bigger work.
-->
<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { gaps } from '../lib/data'
import { useStage } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { spring, entered, ease, still } = useStage()
const parts = [
  { n: 'API', m: 7.5 },
  { n: 'Journeys', m: 5 },
  { n: 'Layout', m: 4 },
  { n: 'Unit', m: 3 },
]
const scale = 21
let left = 0
const seq = parts.map((p) => { const a = left; left += p.m; return { ...p, a } })
const bar = (i: number) => {
  const on = entered.value
  const p = seq[i]
  return props.step >= 1
    ? { x: 0, y: i * 62, scaleX: 1 }
    : { x: p.a / scale * 760, y: 0, scaleX: on ? 1 : 0 }
}
</script>

<template>
  <div class="hc-stage ci">
    <div class="chart">
      <motion.div
        v-for="(p, i) in seq" :key="p.n" class="seg"
        :style="{ width: `${p.m / scale * 760}px` }"
        :initial="false"
        :animate="bar(i)"
        :transition="spring({ delay: step >= 1 ? i * 0.05 : i * 0.25 })"
      ><span>{{ p.n }}</span></motion.div>
    </div>
    <div class="clock">
      <AnimatePresence mode="wait">
        <motion.div :key="step >= 1 ? 'after' : 'before'" :initial="{ opacity: still ? 1 : 0, y: still ? 0 : 12 }" :animate="{ opacity: 1, y: 0 }" :exit="{ opacity: 0, y: -10 }" :transition="ease(0.25)">
          <b class="hc-num">{{ step >= 1 ? '8m 17s' : '20 min' }}</b>
          <span>{{ step >= 1 ? 'Parallel, own instance' : 'In series. Council waits.' }}</span>
        </motion.div>
      </AnimatePresence>
    </div>
    <Rise :on="step >= 2" class="gaps">
      <span class="hc-label">Minutes between councils</span>
      <div class="sp">
        <div v-for="(m, i) in gaps.minutes" :key="i" class="g">
          <motion.i :initial="false" :animate="{ scaleY: step >= 2 ? 1 : 0 }" :style="{ height: `${m / 190 * 100}%` }" :transition="spring({ delay: i * 0.05 })" />
          <b class="hc-num">{{ m }}</b>
        </div>
      </div>
    </Rise>
  </div>
</template>

<style scoped>
.ci { display: grid; grid-template-columns: 760px 1fr; grid-template-rows: 260px 1fr; gap: 16px 44px; }
.chart { position: relative; }
.seg { position: absolute; left: 0; top: 0; height: 54px; background: var(--z-teal); border-radius: 0 6px 6px 0; transform-origin: left; display: flex; align-items: center; padding-left: 12px; box-shadow: inset -2px 0 0 #fff; }
.seg span { font-size: 19px; font-weight: 600; color: #fff; }
.clock { align-self: center; }
.clock b { display: block; font-size: 76px; line-height: 1; color: var(--z-ink); white-space: nowrap; }
.clock span { font-size: 22px; color: var(--z-grey-600); }
.gaps { grid-column: 1 / -1; display: flex; flex-direction: column; min-height: 0; }
.gaps .hc-label { font-size: 19px; }
.sp { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; }
.g { position: relative; display: flex; align-items: flex-end; justify-content: center; }
.g i { width: 100%; background: var(--z-grey-200); border-radius: 4px 4px 0 0; transform-origin: bottom; }
.g b { position: absolute; left: 0; right: 0; bottom: 6px; text-align: center; font-size: 22px; color: var(--z-ink); }
</style>
