<!--
  The whole talk with no words: the real climb, round by round, the mean of
  both council members, under a red 9.5 line it never reaches.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { hill } from '../lib/terrain'
import { useStage } from '../lib/stage'

const W = 1280
const { line, area, y } = hill(W, 720, 360, 6, 10)
const { entered, ease, still } = useStage()
const goal = y(9.5)
const dot = computed(() => ({
  offsetPath: `path('${line}')`,
}))
</script>

<template>
  <div class="hc-night cover">
    <svg :viewBox="`0 0 ${W} 720`" class="art" aria-hidden="true">
      <motion.line
        x1="0" x2="1280" :y1="goal" :y2="goal"
        stroke="var(--z-red-400)" stroke-width="2" stroke-dasharray="4 8"
        :initial="{ opacity: 0 }" :animate="{ opacity: entered ? 1 : 0 }" :transition="ease(1, { delay: still ? 0 : 2.4 })"
      />
    </svg>
    <motion.svg
      :viewBox="`0 0 ${W} 720`" class="art" aria-hidden="true"
      :initial="{ clipPath: still ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }"
      :animate="{ clipPath: entered ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }"
      :transition="ease(3.4)"
    >
      <defs>
        <linearGradient id="hc-cover-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#037f91" stop-opacity="0.55" />
          <stop offset="1" stop-color="#037f91" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="area" fill="url(#hc-cover-fill)" />
      <path :d="line" fill="none" stroke="var(--z-frozen)" stroke-width="3" />
    </motion.svg>
    <motion.i
      class="climber"
      :style="dot"
      :initial="{ offsetDistance: still ? '100%' : '0%' }"
      :animate="{ offsetDistance: entered ? '100%' : '0%' }"
      :transition="ease(3.4)"
    />
    <motion.div
      class="text"
      :initial="{ opacity: still ? 1 : 0, y: still ? 0 : 18 }"
      :animate="{ opacity: entered ? 1 : 0, y: entered ? 0 : 18 }"
      :transition="ease(0.9, { delay: still ? 0 : 0.2 })"
    >
      <h1>Hill climbing<br>a UI</h1>
      <p class="meta">Pasi Huuhka · Zure</p>
    </motion.div>
  </div>
</template>

<style scoped>
.art { position: absolute; inset: 0; width: 100%; height: 100%; }
.climber {
  position: absolute; left: 0; top: 0; width: 18px; height: 18px; margin: -9px 0 0 -9px;
  border-radius: 50%; background: #fff; box-shadow: 0 0 0 6px rgba(5, 195, 222, 0.28);
  offset-rotate: 0deg;
}
.text { position: absolute; left: 72px; top: 104px; }
h1 {
  font-family: var(--z-font-display); font-size: 108px; line-height: 0.94; font-weight: 800;
  letter-spacing: -0.045em; margin: 0 0 26px; color: #fff;
}
.meta { font-size: 20px; color: #b5b9bd; margin: 0; }
</style>
