<!-- How it got here. The gap between the last two stops is the joke. -->
<script setup lang="ts">
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { ease, entered } = useStage()
const stops = [
  { h: 'Autoresearch', s: 'Karpathy: let agents run the experiments' },
  { h: 'A rubric and a loop', s: 'Poteto names it for agents' },
  { h: 'Agents Sucked At UI', s: 'Theo, 3 November' },
  { h: 'My first prompt', s: '4 November, 09:01' },
]
</script>

<template>
  <div class="hc-stage ins">
    <motion.i class="rule" :initial="false" :animate="{ scaleX: entered ? Math.min(step + 1, 4) / 4 : 0 }" :transition="ease(0.8)" />
    <Rise v-for="(p, i) in stops" :key="p.h" :on="step >= i" class="stop" :class="{ last: i === 3 }" :y="26">
      <b class="hc-num">{{ i + 1 }}</b>
      <h3>{{ p.h }}</h3>
      <p>{{ p.s }}</p>
    </Rise>
  </div>
</template>

<style scoped>
.ins { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; padding-top: 22px; }
.rule { position: absolute; left: 0; right: 0; top: 0; height: 6px; border-radius: 3px; background: var(--z-teal); transform-origin: left; }
.stop { background: var(--hc-soft); border-radius: 14px; padding: 26px 24px; display: flex; flex-direction: column; min-height: 0; }
.stop b { font-size: 88px; line-height: 1; color: var(--z-teal); }
h3 { margin: auto 0 8px; font-size: 33px; line-height: 1.12; color: var(--z-ink); }
p { margin: 0; font-size: 22px; line-height: 1.25; color: var(--z-ink-800); }
.last { background: var(--z-ink); }
.last b { color: var(--z-red-400); }
.last h3 { color: #fff; }
.last p { color: #d9d9d6; }
</style>
