<!--
  The moment the scores broke. Round 18 to 19: members stopped being able to
  see their earlier reports. Dots on a scale, because bars would need a zero.
-->
<script setup lang="ts">
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { spring } = useStage()
const seats = [
  { n: 'Opus', a: 9.22, b: 8.64, c: 'var(--hc-opus)' },
  { n: 'Sol', a: 9.06, b: 8.65, c: 'var(--hc-sol)' },
]
const low = 8
const high = 9.5
const h = (v: number) => (v - low) / (high - low)
const ticks = [8, 8.5, 9, 9.5]
</script>

<template>
  <div class="hc-stage a">
    <Rise class="q" :x="-20" :y="0">
      <p>“It seems like opus is at least reading the previous rounds reviews.”</p>
      <span class="hc-label">Me, round 18</span>
    </Rise>
    <div class="scale">
      <div class="well">
        <i v-for="t in ticks" :key="t" class="tick" :class="{ goal: t === 9.5 }" :style="{ bottom: `${h(t) * 100}%` }"><span>{{ t }}</span></i>
        <motion.div
          v-for="(s, i) in seats" :key="s.n" class="dotline"
          :style="{ left: `${22 + i * 44}%` }"
          :initial="false"
          :animate="{ y: `${-h(step >= 1 ? s.b : s.a) * 100}%` }"
          :transition="spring({ visualDuration: 1.4, bounce: 0.3, delay: i * 0.2 })"
        >
          <i :style="{ background: s.c }" />
        </motion.div>
      </div>
      <div class="vals">
        <div v-for="s in seats" :key="s.n"><b class="hc-num">{{ (step >= 1 ? s.b : s.a).toFixed(2) }}</b><span>{{ s.n }}</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.a { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: stretch; }
.q { align-self: center; }
.q p { font-size: 44px; line-height: 1.18; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 14px; color: var(--z-ink); }
.q .hc-label { font-size: 20px; }
.scale { display: flex; flex-direction: column; min-height: 0; }
.well { position: relative; flex: 1; min-height: 0; margin: 18px 0 18px 46px; }
.tick { position: absolute; left: 0; right: 0; border-top: 1px solid var(--z-grey-200); }
.tick.goal { border-top: 2px dashed var(--z-red); }
.tick span { position: absolute; left: -46px; top: -11px; font: 500 16px var(--hc-mono); font-style: normal; color: var(--z-grey-600); }
.dotline { position: absolute; top: 0; bottom: 0; width: 44px; margin-left: -22px; }
.dotline i { position: absolute; left: 0; bottom: -22px; width: 44px; height: 44px; border-radius: 50%; border: 3px solid #fff; }
.vals { display: grid; grid-template-columns: 1fr 1fr; text-align: center; padding-left: 46px; }
.vals b { display: block; font-size: 54px; line-height: 1.05; color: var(--z-ink); }
.vals span { font-size: 21px; color: var(--z-grey-600); }
</style>
