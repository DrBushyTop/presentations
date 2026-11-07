<!--
  Every row, every round, both members averaged. Red is low, blue is high.
  Red to blue, not red to green, so it holds up for colour-blind viewers.
-->
<script setup lang="ts">
import { motion } from 'motion-v'
import { calibration } from '../lib/data'
import { ROUND_NUMBERS, rowMean } from '../lib/terrain'
import { useStage } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, ease, sweep, still } = useStage()
const rows = calibration.rows.map((r, i) => ({ r, name: calibration.names[i], v: rowMean(r) }))
const LOW = 6.5
const MID = 8
const HIGH = 9.2
const RED = '#c8350f'
const YELLOW = '#f7d84a'
const BLUE = '#0b6fa4'
const fill = (v: number) => {
  const up = v >= MID
  const t = up ? (v - MID) / (HIGH - MID) : (v - LOW) / (MID - LOW)
  const pct = Math.round(Math.max(0, Math.min(1, t)) * 100)
  return up
    ? `color-mix(in oklab, ${BLUE} ${pct}%, ${YELLOW})`
    : `color-mix(in oklab, ${YELLOW} ${pct}%, ${RED})`
}
</script>

<template>
  <div class="hc-stage h">
    <motion.div
      class="grid"
      :initial="{ clipPath: still ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }"
      :animate="{ clipPath: entered ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }"
      :transition="sweep(2.6)"
    >
      <template v-for="row in rows" :key="row.r">
        <span class="nm">{{ row.name }}</span>
        <i v-for="(v, k) in row.v" :key="k" :style="{ background: fill(v) }" />
      </template>
      <span class="rl">Round</span>
      <b v-for="r in ROUND_NUMBERS" :key="r" class="rn">{{ [1, 5, 10, 15, 19, 22].includes(r) ? r : '' }}</b>
    </motion.div>
    <Rise :on="step >= 1" class="band" :y="0"><span>Blind</span></Rise>
    <div class="key" aria-hidden="true">
      <span>{{ LOW }}</span>
      <i :style="{ background: `linear-gradient(90deg in oklab, ${RED}, ${YELLOW} 50%, ${BLUE})` }" />
      <span>{{ HIGH }}</span>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: 124px repeat(22, 1fr); grid-template-rows: repeat(9, 1fr) 26px; gap: 2px; height: 100%; }
.nm { font-size: 19px; font-weight: 500; color: var(--z-ink); align-self: center; }
.grid i { border-radius: 3px; }
.rl { font-size: 16px; color: var(--z-grey-600); align-self: end; }
.rn { font: 500 16px var(--hc-mono); color: var(--z-grey-600); text-align: center; align-self: end; }
.band { position: absolute; top: -6px; bottom: 26px; left: calc(124px + (100% - 124px) * 18 / 22 - 2px); right: 0; border: 3px solid var(--z-ink); border-radius: 8px; pointer-events: none; }
.band span { position: absolute; top: -30px; left: 0; font-size: 20px; font-weight: 700; color: var(--z-ink); }
.key { position: absolute; right: 0; top: -62px; display: flex; align-items: center; gap: 8px; font: 500 16px var(--hc-mono); color: var(--z-grey-600); }
.key i { display: block; width: 180px; height: 14px; border-radius: 3px; }
</style>
