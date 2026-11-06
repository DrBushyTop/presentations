<!-- The brief said prefer removing. The diff did not. -->
<script setup lang="ts">
import { motion } from 'motion-v'
import { highs, lines } from '../lib/data'
import { useStage } from '../lib/stage'
import Count from './Count.vue'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { spring, entered } = useStage()
</script>

<template>
  <div class="hc-stage blo">
    <div class="col">
      <p class="said">“Prefer removing things.”</p>
      <div class="diff">
        <div class="r"><motion.i class="add" :initial="false" :animate="{ scaleX: entered ? 1 : 0 }" :transition="spring({ visualDuration: 0.9 })" /></div>
        <b class="hc-num"><Count :to="lines.added" :on="entered" sign /></b>
        <div class="r"><motion.i class="del" :style="{ width: `${lines.removed / lines.added * 100}%` }" :initial="false" :animate="{ scaleX: entered ? 1 : 0 }" :transition="spring({ visualDuration: 0.9, delay: 0.2 })" /></div>
        <b class="hc-num"><Count :to="lines.removed" :on="entered" prefix="−" /></b>
      </div>
      <p class="hc-label">Lines in web/src</p>
    </div>
    <Rise :on="step >= 1" :x="24" :y="0">
      <div class="col">
        <p class="said">High findings in diff review</p>
        <div class="highs">
          <div v-for="(h, i) in highs" :key="i" class="c">
            <motion.i :initial="false" :animate="{ scaleY: step >= 1 ? 1 : 0 }" :style="{ height: `${Math.max(h, 0.05) / 4 * 100}%` }" :transition="spring({ delay: i * 0.08 })" />
            <b class="hc-num">{{ h }}</b>
            <span>R{{ 18 + i }}</span>
          </div>
        </div>
      </div>
    </Rise>
  </div>
</template>

<style scoped>
.blo { display: grid; grid-template-columns: 1.15fr 1fr; gap: 48px; }
.col { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.said { margin: 0 0 18px; font-size: 32px; font-weight: 700; color: var(--z-ink); }
.diff { flex: 1; display: grid; grid-template-columns: 1fr; gap: 8px; align-content: center; min-height: 0; }
.diff b { font-size: 52px; line-height: 1; color: var(--z-ink); }
.r { height: 74px; display: flex; }
.r i { display: block; height: 100%; transform-origin: left; border-radius: 0 6px 6px 0; }
.add { width: 100%; background: var(--z-teal); }
.del { background: var(--z-red); }
.hc-label { margin: 8px 0 0; font-size: 20px; }
.highs { flex: 1; display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; min-height: 0; }
.c { display: grid; grid-template-rows: 1fr auto auto; justify-items: center; min-height: 0; }
.c i { align-self: end; width: 100%; background: var(--z-red); transform-origin: bottom; border-radius: 4px 4px 0 0; }
.c b { font-size: 34px; color: var(--z-ink); }
.c span { font-size: 18px; color: var(--z-grey-600); }
</style>
