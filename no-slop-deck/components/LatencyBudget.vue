<!--
  Polylane's latency budget. Their medians from 15 September 2026, 325 runs,
  the biggest changes they made, and the latest review-turn median (94 s).
  0 where the time went · 1 what they changed · 2 the result
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const MAX = 300
const phases = [
  { k: 'Prelude', note: 'webhook, diff', s: 7.4 },
  { k: 'Sandbox', note: 'clone the head', s: 16.5 },
  { k: 'Review turn', note: 'the agent', s: 242.4, after: 94, main: true },
  { k: 'Delivery', note: 'check run, comment', s: 3 },
  { k: 'Unaccounted', note: 'queueing', s: 38.6 },
]
const fixes = [
  { t: 'A step budget', d: '30 steps, with the count in every prompt' },
  { t: 'A fresh run per commit', d: 'A new commit cancels the old review' },
  { t: 'Reuse earlier work', d: 'Review only the diff since the last run' },
]
const pct = (s: number) => `${(s / MAX) * 100}%`
</script>

<template>
  <div class="lat" :class="{ done: step >= 2 }">
    <div class="chart">
      <div class="plot"><div class="budget" :style="{ left: pct(120), width: pct(60) }"><span>CI budget<br>2 to 3 min</span></div></div>
      <div v-for="p in phases" :key="p.k" class="row" :class="{ main: p.main }">
        <div class="lbl"><b>{{ p.k }}</b><span>{{ p.note }}</span></div>
        <div class="track">
          <div class="bar" :style="{ width: pct(step >= 2 && p.after ? p.after : p.s) }" />
          <span class="val ns-mono" :style="{ left: pct(step >= 2 && p.after ? p.after : p.s) }">{{ step >= 2 && p.after ? p.after : p.s }} s</span>
        </div>
      </div>
      <div class="axis">
        <span v-for="t in [0, 60, 120, 180, 240, 300]" :key="t" :style="{ left: pct(t) }">{{ t }} s</span>
      </div>
    </div>

    <div class="fixes">
      <div v-for="(f, i) in fixes" :key="f.t" class="fx" :class="{ on: step >= 1 }" :style="{ '--i': i }">
        <b>{{ f.t }}</b>
        <span>{{ f.d }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lat {
  height: 510px;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 26px;
}

.chart {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 34px;
  --lbl: 250px;
}

.plot {
  position: absolute;
  left: var(--lbl);
  right: 0;
  top: 0;
  bottom: 34px;
}

.budget {
  position: absolute;
  top: 0;
  bottom: 0;
  background: #e3f4f6;
  border-left: 2px dashed var(--ns-teal);
  border-right: 2px dashed var(--ns-teal);
}

.budget span {
  position: absolute;
  top: -2px;
  left: 8px;
  font-size: var(--ns-label);
  font-weight: 700;
  line-height: 1.2;
  color: var(--ns-teal);
  white-space: nowrap;
}

.row {
  position: relative;
  display: grid;
  grid-template-columns: var(--lbl) 1fr;
  align-items: center;
  height: 56px;
}

.lbl {
  display: flex;
  flex-direction: column;
}

.lbl b {
  font-size: 22px;
}

.lbl span {
  font-size: var(--ns-label);
  color: var(--z-grey-600);
}

.track {
  position: relative;
  height: 34px;
}

.bar {
  height: 100%;
  background: #9a9a97;
  transition: width 1400ms var(--ns-ease);
}

.main .bar {
  background: var(--ns-red);
}

.done .main .bar {
  background: var(--ns-teal);
}

.val {
  position: absolute;
  top: 4px;
  margin-left: 10px;
  font-size: 20px;
  font-weight: 700;
  white-space: nowrap;
  transition: left 1400ms var(--ns-ease);
}

.main .val {
  font-size: 24px;
}

.axis {
  position: absolute;
  left: var(--lbl);
  right: 0;
  bottom: 0;
  height: 28px;
  border-top: 2px solid var(--z-ink);
}

.axis span {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  font-size: var(--ns-label);
  color: var(--z-grey-600);
  white-space: nowrap;
}

.axis span:first-child {
  transform: none;
}

.axis span:last-child {
  transform: translateX(-100%);
}

.fixes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.fx {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 18px;
  background: var(--z-ink);
  color: #fff;
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
  transition-delay: calc(var(--i) * 120ms);
}

.fx:not(.on) {
  opacity: 0;
  transform: translateY(12px);
}

.fx b {
  font-size: 23px;
}

.fx span {
  font-size: 19px;
  color: #d6d6d6;
}
</style>
