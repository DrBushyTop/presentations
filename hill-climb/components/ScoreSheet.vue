<!-- Opus's first report, filled in cell by cell. Then the rival column lands. -->
<script setup lang="ts">
import { roundOne, criteria } from '../lib/data'
import { useStage } from '../lib/stage'
import Count from './Count.vue'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered } = useStage()
// Sequential teal: one hue, light to dark, 4.5 to 8.5.
const fill = (v: number) => `color-mix(in srgb, var(--z-teal) ${Math.round(Math.max(0, (v - 4) / 4.5) * 72 + 8)}%, white)`
const ink = (v: number) => (v >= 7.5 ? '#fff' : 'var(--z-ink)')
</script>

<template>
  <div class="hc-stage sheet">
    <div class="tbl">
      <span />
      <span v-for="c in criteria" :key="c" class="hd">{{ c }}</span>
      <span class="hd">Score</span>
      <span class="hd">Rival</span>
      <template v-for="(r, i) in roundOne" :key="r.row">
        <span class="nm"><b class="hc-mono">{{ r.row }}</b>{{ r.name }}</span>
        <Rise v-for="(v, k) in r.c" :key="k" class="cell" :y="0" :scale="0.7" :delay="0.25 + i * 0.05 + k * 0.03" :style="{ background: fill(v), color: ink(v) }">{{ v.toFixed(1) }}</Rise>
        <Rise class="all" :y="0" :delay="0.9 + i * 0.05"><b class="hc-num">{{ r.all.toFixed(1) }}</b></Rise>
        <Rise :on="step >= 1" :x="16" :y="0" :delay="i * 0.05" class="rival">
          <template v-if="r.best"><b class="hc-num">{{ r.best.toFixed(1) }}</b><span>{{ r.rival }}</span></template>
          <span v-else>none</span>
        </Rise>
      </template>
    </div>
    <aside>
      <p class="score"><Count :to="6.4" :decimals="1" :on="entered" :delay="1" /></p>
      <p class="of">of 10, round 1</p>
    </aside>
  </div>
</template>

<style scoped>
.sheet { display: grid; grid-template-columns: 1fr 170px; gap: 24px; }
.tbl { display: grid; grid-template-columns: 250px repeat(5, 1fr) 64px 128px; grid-template-rows: 26px repeat(9, 1fr); gap: 3px; min-height: 0; color: var(--z-ink); }
.hd { font-size: 15px; font-weight: 600; color: var(--z-grey-600); text-align: center; }
.nm { display: flex; align-items: center; font-size: 19px; font-weight: 500; white-space: nowrap; }
.nm b { color: var(--z-teal); width: 24px; }
.cell { display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 18px; font-variant-numeric: tabular-nums; font-weight: 600; }
.all { display: flex; align-items: center; justify-content: center; font-size: 22px; }
.rival { display: flex; align-items: center; gap: 6px; padding-left: 8px; }
.rival b { font-size: 20px; }
.rival span { font-size: 15px; color: var(--z-grey-600); }
aside { align-self: center; }
.score { font-size: 96px; line-height: 1; margin: 0; color: var(--z-ink); }
.of { margin: 4px 0 0; font-size: 19px; color: var(--z-grey-600); }
</style>
