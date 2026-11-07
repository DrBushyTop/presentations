<!--
  Hill climbing in one picture. The agent only sees what is near it, tries a
  step, keeps it if the score rises, and stops when nothing nearby is higher.
  Click 1 starts the climb. Click 2 lifts the fog and shows the taller peak.
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { useStage, useTicker } from '../lib/stage'
import { peaks, smooth } from '../lib/terrain'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { still, active, spring, ease } = useStage()

const W = 1136
const H = 440
const f = peaks
const px = (t: number) => t * W
const py = (t: number) => H - 40 - f(t) * 330
const terrain = smooth(Array.from({ length: 80 }, (_, i) => [px(i / 79), py(i / 79)] as [number, number]), 0.5)
const score = (t: number) => (5 + f(t) * 5.2).toFixed(1)

const STEP = 0.038
const seq = [1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1]
const peak = 0.3
const t = ref(still.value ? peak : 0.07)
const ghost = ref<number | null>(null)
const failed = ref(false)
const phase = ref(0)
const n = ref(0)
let waitTry = true

const climbing = computed(() => active.value && props.step >= 1 && !done.value)
const done = ref(still.value)

useTicker(() => climbing.value, 520, () => {
  if (waitTry) {
    const dir = seq[n.value % seq.length]
    ghost.value = Math.min(1, Math.max(0, t.value + dir * STEP))
    failed.value = f(ghost.value) < f(t.value)
    phase.value = 1
  }
  else {
    phase.value = 2
    if (ghost.value !== null && !failed.value) t.value = ghost.value
    ghost.value = null
    n.value++
    const best = Math.max(f(t.value - STEP), f(t.value + STEP))
    if (best <= f(t.value) || t.value >= 0.34) done.value = true
  }
  waitTry = !waitTry
})

watch(() => props.step, (s) => {
  if (s === 0) { t.value = 0.07; n.value = 0; done.value = false; ghost.value = null; waitTry = true; phase.value = 0 }
})

const reveal = computed(() => props.step >= 2 || still.value)
const steps = ['Change', 'Measure', 'Keep if better']
</script>

<template>
  <div class="hc-stage hc">
    <svg :viewBox="`0 0 ${W} ${H}`" class="art" aria-hidden="true">
      <defs>
        <radialGradient id="hc-fog">
          <stop offset="0.45" stop-color="#fff" />
          <stop offset="1" stop-color="#000" />
        </radialGradient>
        <mask id="hc-fog-mask">
          <rect :width="W" :height="H" fill="#000" />
          <motion.circle
            fill="url(#hc-fog)"
            :initial="{ cx: px(t), cy: py(t), r: reveal ? 1500 : 190 }"
            :animate="{ cx: px(t), cy: py(t), r: reveal ? 1500 : 190 }"
            :transition="reveal ? ease(1.6) : spring()"
          />
        </mask>
      </defs>
      <g mask="url(#hc-fog-mask)">
        <path :d="`${terrain} L${W} ${H} L0 ${H} Z`" fill="var(--z-teal-100)" opacity="0.55" />
        <path :d="terrain" fill="none" stroke="var(--z-teal)" stroke-width="3" />
        <g v-if="reveal">
          <line :x1="px(0.76)" :x2="px(0.76)" :y1="py(0.76)" :y2="py(0.76) - 54" stroke="var(--z-red)" stroke-width="3" />
          <path :d="`M${px(0.76)} ${py(0.76) - 54} l26 9 l-26 9 z`" fill="var(--z-red)" />
        </g>
      </g>
      <motion.circle
        v-if="ghost !== null"
        r="10" fill="none" :stroke="failed ? 'var(--z-red)' : 'var(--z-teal)'" stroke-width="3"
        :cx="px(ghost)" :cy="py(ghost)"
        :initial="{ opacity: 0, scale: 0.4 }" :animate="{ opacity: 1, scale: 1 }" :transition="spring()"
      />
      <motion.g :initial="{ x: px(t), y: py(t) }" :animate="{ x: px(t), y: py(t) }" :transition="spring({ visualDuration: 0.35 })">
        <circle r="13" fill="var(--z-ink)" />
        <text y="-24" text-anchor="middle" class="val">{{ score(t) }}</text>
      </motion.g>
    </svg>
    <div class="loop">
      <template v-for="(s, i) in steps" :key="s">
        <motion.span
          class="chip"
          :animate="{ backgroundColor: climbing && phase === i ? '#037f91' : '#f3f3f2', color: climbing && phase === i ? '#ffffff' : '#1a1a1a' }"
          :transition="ease(0.2)"
        >{{ s }}</motion.span>
        <i v-if="i < 2" class="arr">→</i>
      </template>
      <motion.span class="stuck" :animate="{ opacity: done && !reveal ? 1 : 0 }" :transition="ease(0.4)">No step is higher</motion.span>
      <motion.span class="stuck red" :initial="{ opacity: reveal ? 1 : 0 }" :animate="{ opacity: reveal ? 1 : 0 }" :transition="ease(0.5, { delay: still ? 0 : 0.9 })">Stuck on a lower peak</motion.span>
    </div>
  </div>
</template>

<style scoped>
.hc { display: grid; grid-template-rows: 1fr auto; gap: 14px; }
.art { width: 100%; height: 100%; min-height: 0; }
.val { font: 700 24px var(--hc-mono); fill: var(--z-ink); }
.loop { display: flex; align-items: center; gap: 12px; font-size: 22px; position: relative; height: 48px; }
.chip { padding: 8px 18px; border-radius: 999px; font-weight: 600; }
.arr { font-style: normal; color: var(--z-grey-600); }
.stuck { position: absolute; right: 0; font-weight: 600; font-size: 22px; }
.stuck.red { color: var(--z-red); }
</style>
