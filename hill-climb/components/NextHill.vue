<!--
  A second climb with the opposite goal: remove code, and treat the UI score as
  a floor rather than a target. The analysis suggested about 8.6. The study's
  tasks join the floor, so removing code can't break what people could do.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'
import Count from './Count.vue'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, ease, still } = useStage()
const heights = [100, 88, 79, 72, 66, 61]
const bars = computed(() => (props.step >= 1 ? heights : heights.map(() => 100)))
</script>

<template>
  <div class="hc-night n">
    <h1>The next hill goes down</h1>
    <div class="chart">
      <motion.i
        v-for="(h, i) in bars" :key="i"
        :initial="false"
        :animate="{ scaleY: entered ? h / 100 : 0 }"
        :transition="ease(1, { delay: still ? 0 : i * 0.1 })"
      />
      <Rise :on="step >= 2" class="floor" :y="0"><span>Floor: UI 8.6 and the study’s tasks</span></Rise>
    </div>
    <p>Goal: less code. Rule: never drop below the floor.</p>
  </div>
</template>

<style scoped>
.n { padding: 56px 96px 48px; display: flex; flex-direction: column; }
h1 { font: 800 76px/1 var(--z-font-display); letter-spacing: -0.035em; margin: 0; color: #fff; }
.chart { position: relative; flex: 1; min-height: 0; margin: 28px 0 20px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
.chart i { background: var(--z-teal); transform-origin: bottom; border-radius: 6px 6px 0 0; }
.floor { position: absolute; left: 0; right: 0; bottom: 42%; border-top: 3px dashed var(--z-red-400); }
.floor span { position: absolute; right: 0; top: -36px; font-size: 22px; font-weight: 700; color: #fff; }
p { margin: 0; font-size: 26px; color: #d9d9d6; }
</style>
