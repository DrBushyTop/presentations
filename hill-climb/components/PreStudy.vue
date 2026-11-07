<!--
  The funnel, as images. About 50 were looked at, 31 kept, 16 shortlisted
  across 6 products. No vendor images: the repo is public, so tiles only.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'
import Count from './Count.vue'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, spring, still } = useStage()

const products = [
  { n: 'Frame.io', c: 3, for: 'Capture' },
  { n: 'Sentry', c: 2, for: 'Replay' },
  { n: 'Linear', c: 3, for: 'Findings' },
  { n: 'Maze', c: 3, for: 'Results' },
  { n: 'Dovetail', c: 3, for: 'Evidence' },
  { n: 'Condens', c: 2, for: 'Search' },
]
const W = 1136
const TW = 104
const TH = 76
const COL = W / 6
const slots = products.flatMap((p, c) => Array.from({ length: p.c }, (_, r) => ({ c, r })))
// Fixed scatter: which of the 50 survive each cut. Evenly spread, not random.
const keep31 = new Set(Array.from({ length: 31 }, (_, i) => Math.floor(i * 50 / 31)))
const order = [...keep31]
const keep16 = order.filter((_, i) => i % 2 === 0).slice(0, 16)

function place(i: number) {
  const gx = (W - 10 * (TW + 8)) / 2 + (i % 10) * (TW + 8)
  const gy = Math.floor(i / 10) * (TH + 12)
  const s = keep16.indexOf(i)
  if (props.step >= 2 && s >= 0) {
    const { c, r } = slots[s]
    return { x: c * COL + (COL - TW) / 2, y: 86 + r * (TH + 26), opacity: 1, scale: 1 }
  }
  const out = (props.step >= 1 && !keep31.has(i)) || (props.step >= 2 && s < 0)
  return { x: gx, y: gy, opacity: out ? 0 : 1, scale: out ? 0.6 : 1 }
}
const count = computed(() => [50, 31, 16][Math.min(props.step, 2)])
const warnings = ['Marketing shots are staged', 'Stills hide the keys', 'Nobody used them hands-on']
</script>

<template>
  <div class="hc-stage pre">
    <div class="field">
      <motion.i
        v-for="i in 50" :key="i" class="tile"
        :initial="{ ...place(i - 1), opacity: 0 }"
        :animate="entered ? place(i - 1) : { ...place(i - 1), opacity: 0 }"
        :transition="spring({ delay: still ? 0 : (i % 10) * 0.012 })"
      />
      <div v-if="step >= 2" class="cols">
        <Rise v-for="(p, i) in products" :key="p.n" class="col" :delay="0.2 + i * 0.05" :y="-10">
          <b>{{ p.n }}</b><span>{{ p.for }}</span>
        </Rise>
      </div>
    </div>
    <div class="foot">
      <p class="n" :class="{ gone: step >= 3 }"><Count :to="count" :from="count" :duration="0.7" /><span> images</span></p>
      <div class="warn">
        <Rise v-for="(w, i) in warnings" :key="w" :on="step >= 3" :delay="i * 0.12" class="w"><i />{{ w }}</Rise>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pre { display: grid; grid-template-rows: 1fr auto; gap: 8px; }
.field { position: relative; min-height: 0; }
.tile { position: absolute; left: 0; top: 0; width: 104px; height: 76px; border-radius: 6px; background: linear-gradient(180deg, var(--z-grey-200) 0 22%, var(--hc-soft) 22%); border: 1px solid var(--z-grey-200); }
.cols { position: absolute; left: 0; right: 0; top: 0; display: grid; grid-template-columns: repeat(6, 1fr); text-align: center; }
.col b { display: block; font-size: 24px; color: var(--z-ink); }
.col span { font-size: 18px; color: var(--z-teal); font-weight: 600; }
.foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; min-height: 86px; }
.n { margin: 0; font-size: 72px; line-height: 1; color: var(--z-ink); }
.n span:last-child { font-size: 26px; color: var(--z-grey-600); }
.warn { display: flex; gap: 14px; }
.w { font-size: 20px; font-weight: 600; color: var(--z-ink); padding: 12px 18px; border-radius: 10px; background: var(--hc-soft); display: flex; gap: 10px; align-items: center; }
.w i { width: 10px; height: 10px; border-radius: 50%; background: var(--z-red); }
</style>
