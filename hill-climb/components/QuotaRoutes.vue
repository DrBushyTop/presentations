<!-- The night rules. When Sol's quota ran out the run went down this list. -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { motion } from 'motion-v'
import { useStage, useTicker } from '../lib/stage'

const { active, still, spring } = useStage()
const routes = [
  { n: 'Codex', s: 'Subscription' },
  { n: 'Foundry', s: 'Real money' },
  { n: 'OpenCode, Copilot', s: 'Free, 50 images per request' },
  { n: 'One quota reset', s: 'Wait, once' },
]
const at = ref(still.value ? 3 : 0)
useTicker(() => active.value, 1400, () => { at.value = (at.value + 1) % routes.length })
const top = computed(() => `${at.value * 25 + 12.5}%`)
</script>

<template>
  <div class="hc-stage q">
    <motion.i class="ball" :initial="false" :animate="{ top }" :transition="spring({ bounce: 0.35 })" />
    <div v-for="(r, i) in routes" :key="r.n" class="r" :class="{ on: i === at }">
      <b>{{ r.n }}</b><span>{{ r.s }}</span>
    </div>
  </div>
</template>

<style scoped>
.q { display: grid; grid-template-rows: repeat(4, 1fr); padding-left: 76px; gap: 10px; }
.ball { position: absolute; left: 14px; width: 40px; height: 40px; margin-top: -20px; border-radius: 50%; background: var(--z-ink); }
.r { display: flex; justify-content: space-between; align-items: center; padding: 0 30px; border-radius: 12px; background: var(--hc-soft); transition: background 0.25s; }
.r b { font-size: 34px; color: var(--z-ink); }
.r span { font-size: 22px; color: var(--z-grey-600); }
.r.on { background: var(--z-teal-100); }
</style>
