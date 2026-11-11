<!--
  The callback to the hill climbing slide: same landscape, fog closing in on
  8.68. Each click draws one explanation for the plateau onto the hill.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { peaks, smooth } from '../lib/terrain'
import { useStage } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, ease, still } = useStage()

const W = 1136
const H = 392
const px = (t: number) => t * W
const py = (t: number) => H - 26 - peaks(t) * 300
const terrain = smooth(Array.from({ length: 80 }, (_, i) => [px(i / 79), py(i / 79)] as [number, number]), 0.5)
const T = 0.3
const roof = py(T) - 76
const fog = computed(() => (entered.value ? 230 : 1500))
const ideas = [
  { h: 'Local peak?', s: 'The rulings fenced the climb' },
  { h: 'Noise?', s: 'Gains too small to see' },
  { h: 'Top of the scale?', s: 'Rivals stop at 9.0' },
]
const fence = [0.13, 0.47]
</script>

<template>
  <div class="hc-stage fr">
    <svg :viewBox="`0 0 ${W} ${H}`" class="art" aria-hidden="true">
      <defs>
        <radialGradient id="hc-fr-fog">
          <stop offset="0.5" stop-color="#fff" />
          <stop offset="1" stop-color="#000" />
        </radialGradient>
        <radialGradient id="hc-fr-hole">
          <stop offset="0.5" stop-color="#000" />
          <stop offset="1" stop-color="#000" stop-opacity="0" />
        </radialGradient>
        <mask id="hc-fr-mist">
          <rect x="0" y="-20" :width="W" :height="H + 20" fill="#fff" />
          <motion.circle :cx="px(T)" :cy="py(T)" fill="url(#hc-fr-hole)" :initial="{ r: still ? 230 : 1500 }" :animate="{ r: fog }" :transition="ease(2.2)" />
        </mask>
        <mask id="hc-fr-mask">
          <rect :width="W" :height="H" fill="#000" />
          <motion.circle :cx="px(T)" :cy="py(T)" fill="url(#hc-fr-fog)" :initial="{ r: still ? 230 : 1500 }" :animate="{ r: fog }" :transition="ease(2.2)" />
        </mask>
      </defs>
      <g mask="url(#hc-fr-mask)">
        <path :d="`${terrain} L${W} ${H} L0 ${H} Z`" fill="var(--z-teal-100)" opacity="0.55" />
        <path :d="terrain" fill="none" stroke="var(--z-teal)" stroke-width="3" />
        <line :x1="px(0.76)" :x2="px(0.76)" :y1="py(0.76)" :y2="py(0.76) - 54" stroke="var(--z-red)" stroke-width="3" />
        <path :d="`M${px(0.76)} ${py(0.76) - 54} l26 9 l-26 9 z`" fill="var(--z-red)" />
      </g>

      <motion.rect
        x="0" y="-20" :width="W" :height="H + 20" rx="14" fill="#e6e6e3" mask="url(#hc-fr-mist)"
        :initial="{ opacity: still ? 1 : 0 }" :animate="{ opacity: entered ? 1 : 0 }" :transition="ease(1.2, { delay: still ? 0 : 0.6 })"
      />
      <motion.text
        :x="px(0.76)" y="246" text-anchor="middle" class="ask"
        :initial="{ opacity: still ? 1 : 0 }" :animate="{ opacity: entered ? 1 : 0 }" :transition="ease(0.8, { delay: still ? 0 : 1.7 })"
      >?</motion.text>

      <motion.g :initial="false" :animate="{ opacity: step >= 1 ? 1 : 0 }" :transition="ease(0.5)">
        <template v-for="t in fence" :key="t">
          <line :x1="px(t)" :x2="px(t)" :y1="py(t)" :y2="py(T) - 40" stroke="var(--z-red)" stroke-width="3" stroke-dasharray="10 7" />
        </template>
      </motion.g>

      <motion.circle
        v-if="step >= 2" :cx="px(T)" :cy="py(T)" fill="none" stroke="var(--z-ink)" stroke-width="2"
        :initial="{ r: 16, opacity: 0.7 }"
        :animate="still ? { r: 34, opacity: 0.4 } : { r: [16, 44], opacity: [0.7, 0] }"
        :transition="still ? { duration: 0 } : { duration: 1.1, repeat: Infinity, ease: 'easeOut' }"
      />
      <circle :cx="px(T)" :cy="py(T)" r="13" fill="var(--z-ink)" />
      <text :x="px(T)" :y="py(T) - 54" text-anchor="middle" class="val">8.68</text>

      <motion.g :initial="false" :animate="{ opacity: step >= 3 ? 1 : 0 }" :transition="ease(0.5)">
        <line :x1="0" :x2="W" :y1="roof" :y2="roof" stroke="var(--z-ink)" stroke-width="2" stroke-dasharray="4 7" />
      </motion.g>
      <motion.text
        :x="W - 24" y="330" text-anchor="end" class="end"
        :initial="false" :animate="{ opacity: step >= 3 ? 1 : 0 }" :transition="ease(0.6, { delay: still ? 0 : 0.5 })"
      >We can't see past the fog.</motion.text>
    </svg>
    <div class="ideas">
      <Rise v-for="(c, i) in ideas" :key="c.h" :on="step >= i + 1" class="idea">
        <b>{{ c.h }}</b><span>{{ c.s }}</span>
      </Rise>
    </div>
  </div>
</template>

<style scoped>
.fr { display: grid; grid-template-rows: minmax(0, 1fr) 118px; gap: 14px; }
.art { width: 100%; height: 100%; min-height: 0; overflow: visible; }
.val { font: 700 24px var(--hc-mono); fill: var(--z-ink); }
.ask { font: 800 120px var(--z-font-display); fill: #b9b9b4; }
.end { font: 700 34px var(--z-font-text); fill: var(--z-ink); letter-spacing: -0.02em; }
.ideas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.idea { background: var(--hc-soft); border-radius: 12px; padding: 0 22px; display: flex; flex-direction: column; justify-content: center; }
.idea b { font-size: 30px; line-height: 1.15; color: var(--z-ink); }
.idea span { font-size: 20px; color: var(--z-grey-600); }
</style>
