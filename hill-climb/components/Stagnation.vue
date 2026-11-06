<!--
  Points gained per phase, against the hours each phase took. Means of both
  members, from rounds.json. The middle bar is unblinded, so it is hatched.
-->
<script setup lang="ts">
import { motion } from 'motion-v'
import { mean } from '../lib/terrain'
import { useStage } from '../lib/stage'
import Count from './Count.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { spring, entered } = useStage()
const m = (r: number) => mean[r - 1]
const phases = [
  { n: 'Rounds 1–4', a: 0, gain: m(4) - m(1), hours: 9.2, kind: 'clear' },
  { n: 'Rounds 4–18', a: 1, gain: m(18) - m(4), hours: 25.5, kind: 'anchored' },
  { n: 'Rounds 19–22', a: 2, gain: m(22) - m(19), hours: 7.4, kind: 'clear' },
]
const top = Math.max(...phases.map(p => p.gain))
const on = (p: { a: number }) => entered.value && props.step >= p.a
</script>

<template>
  <div class="hc-stage st">
    <div v-for="p in phases" :key="p.n" class="col" :style="{ opacity: on(p) ? 1 : 0, transition: 'opacity .3s' }">
      <b class="gain"><Count :to="p.gain" :decimals="2" sign :on="on(p)" /></b>
      <div class="well">
        <motion.i :class="p.kind" :style="{ height: `${Math.max(p.gain / top * 100, 1.2)}%` }" :initial="false" :animate="{ scaleY: on(p) ? 1 : 0 }" :transition="spring({ visualDuration: 0.8 })" />
      </div>
      <h3>{{ p.n }}</h3>
      <p>{{ p.hours }} hours{{ p.kind === 'anchored' ? ', not blind' : '' }}</p>
    </div>
  </div>
</template>

<style scoped>
.st { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.col { display: flex; flex-direction: column; min-height: 0; }
.gain { font-size: 56px; line-height: 1.1; color: var(--z-ink); }
.well { flex: 1; min-height: 0; display: flex; align-items: flex-end; border-bottom: 2px solid var(--z-ink); }
.well i { width: 100%; transform-origin: bottom; border-radius: 4px 4px 0 0; background: var(--z-teal); }
.well i.anchored { background: repeating-linear-gradient(135deg, var(--z-teal) 0 8px, var(--z-teal-100) 8px 14px); }
h3 { font-size: 26px; margin: 12px 0 0; color: var(--z-ink); }
p { font-size: 21px; margin: 2px 0 0; color: var(--z-grey-600); }
</style>
