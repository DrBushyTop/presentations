<!--
  Section divider. The climber walks the hill to the next part, so the room
  always sees how far along the talk is.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { hill } from '../lib/terrain'
import { useStage } from '../lib/stage'

const props = defineProps<{ current: number, title?: string }>()
const parts = ['Why', 'Setup', 'Climb', 'Results', 'Verdict']
const W = 1280
const { pts, line, area } = hill(W, 610, 260, 5.8, 10)
const stops = [1, 5, 10, 16, 20]
const { entered, spring, ease, still } = useStage()

const start = computed(() => pts[stops[Math.max(0, props.current - 1)]])
const end = computed(() => pts[stops[props.current]])
</script>

<template>
  <div class="hc-night gate">
    <svg :viewBox="`0 0 ${W} 720`" class="art" aria-hidden="true">
      <defs>
        <linearGradient id="hc-gate-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1f2a2e" />
          <stop offset="1" stop-color="#101214" />
        </linearGradient>
      </defs>
      <path :d="area" fill="url(#hc-gate-fill)" />
      <path :d="line" fill="none" stroke="#3f464b" stroke-width="2" />
      <g v-for="(s, i) in stops" :key="s">
        <line :x1="pts[s][0]" :x2="pts[s][0]" :y1="pts[s][1]" :y2="pts[s][1] - 34" :stroke="i <= current ? 'var(--z-frozen)' : '#4a5157'" stroke-width="2" />
        <circle :cx="pts[s][0]" :cy="pts[s][1] - 38" r="5" :fill="i <= current ? 'var(--z-frozen)' : '#4a5157'" />
        <text :x="pts[s][0]" :y="pts[s][1] - 56" text-anchor="middle" :class="['stop', { on: i === current, past: i < current }]">{{ parts[i] }}</text>
      </g>
      <motion.circle
        r="11" fill="#fff"
        :initial="{ cx: still ? end[0] : start[0], cy: still ? end[1] : start[1] }"
        :animate="{ cx: entered ? end[0] : start[0], cy: entered ? end[1] : start[1] }"
        :transition="ease(1.5, { delay: still ? 0 : 0.25 })"
      />
    </svg>
    <motion.h1
      :initial="{ opacity: still ? 1 : 0, y: still ? 0 : 20 }"
      :animate="{ opacity: entered ? 1 : 0, y: entered ? 0 : 20 }"
      :transition="spring({ delay: still ? 0 : 0.15 })"
    >{{ title ?? parts[current] }}</motion.h1>
  </div>
</template>

<style scoped>
.art { position: absolute; inset: 0; width: 100%; height: 100%; }
.stop { font: 500 19px var(--z-font-text); fill: #6d757b; }
.stop.past { fill: #9aa2a8; }
.stop.on { fill: #fff; font-weight: 700; }
h1 {
  position: absolute; left: 72px; top: 96px; margin: 0;
  font-family: var(--z-font-display); font-size: 92px; line-height: 1; font-weight: 800;
  letter-spacing: -0.04em; color: #fff;
}
</style>
