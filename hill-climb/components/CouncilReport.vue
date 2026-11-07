<!-- A real report, round 1 from Opus. Each click walks to the next section. -->
<script setup lang="ts">
import { computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { useStage } from '../lib/stage'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { spring, ease, still } = useStage()

const parts = [
  { h: 'Scores', big: '5.5', t: 'A, Capturing observations. Rival: Frame.io 8.8.' },
  { h: 'Overall', big: '6.4', t: 'Competent, honest and clean, but slow at the things a researcher does for hours.' },
  { h: 'Why the rival wins', big: 'C', t: 'The comment box is always there and pinned to the timecode. Zpotlight needs 4 to 5 clicks and a tab change.' },
  { h: 'Ranked changes', big: '1', t: 'Session review: freeze the moment and add keys. Size M.' },
  { h: 'Broken things', big: '0:40', t: 'A transcript hit says 9:14 AM. The line is at 0:40.' },
]
const i = computed(() => Math.min(props.step, parts.length - 1))
</script>

<template>
  <div class="hc-stage r">
    <ol class="toc">
      <li v-for="(p, k) in parts" :key="p.h">
        <motion.span
          class="line"
          :initial="false"
          :animate="{ opacity: k === i ? 1 : k < i ? 0.55 : 0.3, x: k === i ? 14 : 0 }"
          :transition="spring()"
        >
          <b class="hc-mono">{{ k + 1 }}</b>{{ p.h }}
        </motion.span>
      </li>
    </ol>
    <div class="page">
      <AnimatePresence mode="wait">
        <motion.div :key="i" class="sheet" :initial="{ opacity: still ? 1 : 0, y: still ? 0 : 18 }" :animate="{ opacity: 1, y: 0 }" :exit="{ opacity: 0, y: -12 }" :transition="ease(0.3)">
          <b class="big hc-num">{{ parts[i].big }}</b>
          <p>{{ parts[i].t }}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>

<style scoped>
.r { display: grid; grid-template-columns: 400px 1fr; gap: 40px; }
.toc { list-style: none; margin: 0; padding: 0; display: grid; grid-auto-rows: 1fr; }
.toc li { display: flex; align-items: center; margin: 0; padding: 0; }
.line { font-size: 30px; font-weight: 600; color: var(--z-ink); display: block; white-space: nowrap; }
.line b { color: var(--z-teal); margin-right: 16px; font-size: 22px; }
.page { background: var(--hc-soft); border-radius: 14px; padding: 44px; display: flex; align-items: center; overflow: hidden; }
.big { display: block; font-size: 120px; line-height: 1; color: var(--z-teal); margin-bottom: 20px; }
p { margin: 0; font-size: 34px; line-height: 1.25; font-weight: 600; color: var(--z-ink); }
</style>
