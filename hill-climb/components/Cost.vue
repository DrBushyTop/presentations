<!-- List-price cost by job, implementation first. Figures in lib/data.ts. -->
<script setup lang="ts">
import { motion } from 'motion-v'
import { cost } from '../lib/data'
import { useStage } from '../lib/stage'
import Count from './Count.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, spring } = useStage()
const max = cost.rows[0].value
const shown = (i: number) => entered.value && (i === 0 || props.step >= 1)
</script>

<template>
  <div class="hc-stage cost">
    <div v-for="(r, i) in cost.rows" :key="r.name" class="row" :class="{ lead: r.lead }" :style="{ opacity: shown(i) ? 1 : 0, transition: 'opacity .3s' }">
      <span class="n">{{ r.name }}</span>
      <div class="track">
        <motion.i
          :style="{ width: `${r.value / max * 100}%` }"
          :initial="false"
          :animate="{ scaleX: shown(i) ? 1 : 0 }"
          :transition="spring({ visualDuration: 0.8, delay: i ? (i - 1) * 0.1 : 0 })"
        />
      </div>
      <span class="v"><Count :to="r.value" :on="shown(i)" prefix="$" :duration="1" /></span>
    </div>
    <div class="fine" :style="{ opacity: step >= 1 ? 1 : 0, transition: 'opacity .4s' }"><Count :to="cost.claude" :on="step >= 1" prefix="Claude $" /><Count :to="cost.gpt" :on="step >= 1" prefix="GPT $" /><span>{{ cost.note }}</span></div>
  </div>
</template>

<style scoped>
.cost { display: grid; grid-template-rows: 2fr 1fr 1fr 1fr auto; gap: 12px; }
.row { display: grid; grid-template-columns: 220px minmax(0, 1fr) 210px; gap: 18px; align-items: center; min-height: 0; }
.n { font-size: 25px; font-weight: 600; color: var(--z-ink); }
.track { height: 100%; min-height: 0; display: flex; align-items: stretch; }
.track i { background: var(--z-grey-200); border-radius: 0 6px 6px 0; transform-origin: left; }
.lead .track i { background: var(--z-teal); }
.v { font-size: 36px; text-align: right; color: var(--z-ink); }
.lead .v { font-size: 56px; }
.lead .n { font-size: 30px; }
.fine { display: flex; gap: 28px; align-items: baseline; font-size: 26px; color: var(--z-ink); min-height: 34px; }
.fine span { font-size: 18px; color: var(--z-grey-600); margin-left: auto; }
</style>
