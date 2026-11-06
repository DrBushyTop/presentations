<!--
  One round. The orchestrator thread runs the loop and I only change its rules.
  The dot circles and the round counter runs to 23.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { motion } from 'motion-v'
import { useStage, useTicker } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { active, still, ease } = useStage()

const stations = ['Council scores', 'One brief', 'Lanes build', 'Land PRs', 'Checks']
const CX = 300
const CY = 277
const R = 200
const at = (i: number) => {
  const a = -Math.PI / 2 + (i / stations.length) * Math.PI * 2
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)]
}
const here = ref(0)
const round = ref(still.value ? 23 : 1)
useTicker(() => active.value, 620, () => {
  here.value = (here.value + 1) % stations.length
  if (here.value === 0) round.value = round.value >= 23 ? 1 : round.value + 1
})
const dot = computed(() => at(here.value))
</script>

<template>
  <div class="hc-stage o">
    <svg viewBox="0 0 600 554" class="loop" aria-hidden="true">
      <circle :cx="CX" :cy="CY" :r="R" fill="none" stroke="var(--z-grey-200)" stroke-width="2" />
      <g v-for="(s, i) in stations" :key="s">
        <circle :cx="at(i)[0]" :cy="at(i)[1]" r="9" :fill="here === i && !still ? 'var(--z-teal)' : 'var(--z-grey-200)'" />
        <text
          :x="at(i)[0] + (i === 0 ? 0 : i < 3 ? 22 : -22)" :y="at(i)[1] + (i === 0 ? -22 : 7)"
          :text-anchor="i === 0 ? 'middle' : i < 3 ? 'start' : 'end'"
          class="st" :class="{ on: here === i && !still }"
        >{{ s }}</text>
      </g>
      <motion.circle r="13" fill="var(--z-teal)" :initial="false" :animate="{ cx: dot[0], cy: dot[1] }" :transition="ease(0.5)" />
      <text :x="CX" :y="CY + 26" text-anchor="middle" class="round">{{ round }}</text>
      <text :x="CX" :y="CY + 58" text-anchor="middle" class="rl">round</text>
    </svg>
    <div class="side">
      <Rise :on="step >= 1" :x="24" :y="0" class="box">
        <b>Orchestrator</b><p>Never writes UI code</p>
      </Rise>
      <Rise :on="step >= 2" :x="24" :y="0" class="box">
        <b>Lanes</b><p>One agent, one worktree, one PR</p>
      </Rise>
      <Rise :on="step >= 3" :x="24" :y="0" class="box me">
        <b>Me</b><p>Rules only</p>
      </Rise>
    </div>
  </div>
</template>

<style scoped>
.o { display: grid; grid-template-columns: 600px 1fr; gap: 40px; }
.loop { width: 100%; height: 100%; overflow: visible; }
.st { font: 500 20px var(--z-font-text); fill: var(--z-grey-600); }
.st.on { fill: var(--z-ink); font-weight: 700; }
.round { font: 700 84px var(--z-font-text); fill: var(--z-ink); font-variant-numeric: tabular-nums; }
.rl { font: 500 20px var(--z-font-text); fill: var(--z-grey-600); }
.side { display: grid; grid-auto-rows: 1fr; gap: 16px; }
.box { background: var(--hc-soft); border-radius: 12px; padding: 22px 26px; display: flex; flex-direction: column; justify-content: center; }
.box b { font-size: 30px; color: var(--z-ink); }
.box p { margin: 4px 0 0; font-size: 22px; color: var(--z-grey-600); }
.me { background: var(--z-ink); }
.me b { color: #fff; }
.me p { color: #d9d9d6; }
</style>
