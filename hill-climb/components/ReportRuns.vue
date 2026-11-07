<!--
  Every round's first ask, one chip per round. The rail plays through on entry,
  then one click swaps to both members side by side.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { asks, askText, firstAsk } from '../lib/data'
import { useStage, useTicker } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { active, still, ease } = useStage()
const i = ref(still.value ? 21 : 0)
useTicker(() => active.value && props.step === 0, 1500, () => { i.value = (i.value + 1) % 22 })
const rows = ['A', 'B', 'D', 'E', 'F', 'H']
const name: Record<string, string> = { A: 'Capture', B: 'Replay', D: 'Findings', E: 'Results', F: 'Evidence', H: 'Shell' }
const table = computed(() => props.step >= 1)
</script>

<template>
  <div class="hc-stage runs">
    <div class="rail">
      <div v-for="r in rows" :key="r" class="lane">
        <span class="nm">{{ name[r] }}</span>
        <i v-for="(a, k) in firstAsk" :key="k" class="cell">
          <motion.b
            v-if="a === r" :initial="false"
            :animate="{ scale: k === i && !table ? 1.35 : 1, backgroundColor: !table && k > i ? '#d9d9d6' : '#037f91' }"
            :transition="ease(0.25, { delay: table && k > i ? (k - i) * 0.025 : 0 })"
          />
        </i>
      </div>
    </div>
    <div class="now">
      <AnimatePresence mode="wait">
        <motion.div v-if="!table" :key="`ask-${i}`" :initial="{ opacity: still ? 1 : 0, y: still ? 0 : 12 }" :animate="{ opacity: 1, y: 0 }" :exit="{ opacity: 0, y: -10 }" :transition="ease(0.2)">
          <span class="hc-label">Round {{ i + 1 }}</span>
          <p>{{ askText[i] }}</p>
        </motion.div>
        <motion.div v-else key="both" class="two" :initial="{ opacity: 1 }" :animate="{ opacity: 1 }" :exit="{ opacity: 0, y: 10 }" :transition="ease(0.2)">
          <Rise v-for="(a, n) in asks.slice(1, 5)" :key="a.round" class="row" :y="14" :delay="n * 0.08">
            <span class="hc-mono r">R{{ a.round }}</span><span>{{ a.opus }}</span><span class="sol">{{ a.sol }}</span>
          </Rise>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>

<style scoped>
.runs { display: grid; grid-template-rows: 1fr 190px; gap: 16px; }
.rail { display: grid; grid-auto-rows: 1fr; gap: 2px; min-height: 0; }
.lane { display: grid; grid-template-columns: 110px repeat(22, 1fr); align-items: center; border-bottom: 1px solid var(--hc-soft); }
.nm { font-size: 18px; font-weight: 500; color: var(--z-grey-600); }
.cell { display: flex; justify-content: center; }
.cell b { width: 30px; height: 30px; border-radius: 6px; display: block; }
.now p { margin: 2px 0 0; font-size: 50px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em; color: var(--z-ink); }
.now .hc-label { font-size: 20px; }
.two { display: grid; gap: 6px; }
.row { display: grid; grid-template-columns: 60px 1fr 1fr; gap: 18px; font-size: 21px; line-height: 1.2; color: var(--z-ink); font-weight: 600; }
.r { color: var(--z-grey-600); font-size: 17px; font-weight: 500; }
.sol { color: var(--z-grey-600); font-weight: 500; }
</style>
