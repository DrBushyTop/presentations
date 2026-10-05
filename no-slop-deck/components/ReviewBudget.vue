<!--
  How many reviews? A small, deliberately illustrative model you can drive
  live. Assumptions (in the speaker notes too): 6 real issues; each reviewer
  catches a remaining issue with p = 0.35, extra reviewers only partly
  independent; every fix adds 0.12 new issues; 2.5 noise findings per
  reviewer per round; triage 3 min per finding, 8 min per real fix;
  €90 an hour for people, €0.60 per model review run; 300 PRs a month.

  0 one reviewer, one round · 1 three providers · 2 five rounds, the stop
  3 the same run in money
-->
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useSynced } from '../lib/sync'

type Lens = 'attention' | 'money'
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const { $page } = useSlideContext()

const byStep = computed(() => ({
  k: props.step >= 1 ? 3 : 1,
  rounds: props.step >= 2 ? 5 : 1,
  lens: (props.step >= 3 ? 'money' : 'attention') as Lens,
}))
const manual = useSynced<{ k: number, rounds: number, lens: Lens } | null>(`budget-${$page.value}`, null)
watch(() => props.step, () => { manual.value = null })
const s = computed(() => manual.value ?? byStep.value)
const set = (patch: Partial<{ k: number, rounds: number, lens: Lens }>) => { manual.value = { ...s.value, ...patch } }

const ISSUES = 6
const P = 0.35
const NOISE = 2.5
const TRIAGE = 3
const FIXREVIEW = 8
const EUR_MIN = 1.5
const EUR_RUN = 0.6
const PRS = 300

const sim = computed(() => {
  const catchRate = 1 - (1 - P) ** (1 + 0.6 * (s.value.k - 1))
  let remaining = ISSUES
  const rounds = []
  for (let r = 1; r <= 6; r++) {
    const real = remaining * catchRate
    const noise = NOISE * s.value.k
    remaining = remaining - real + 0.12 * real
    const minutes = (real + noise) * TRIAGE + real * FIXREVIEW
    rounds.push({ r, real, noise, minutes, people: minutes * EUR_MIN, model: s.value.k * EUR_RUN })
  }
  const stopAt = rounds.findIndex(x => x.real < 0.5) + 1 || 6
  const used = rounds.slice(0, s.value.rounds)
  const sum = (f: (x: typeof rounds[number]) => number) => used.reduce((a, x) => a + f(x), 0)
  return {
    rounds,
    stopAt,
    caught: sum(x => x.real),
    findings: sum(x => x.real + x.noise),
    minutes: sum(x => x.minutes),
    people: sum(x => x.people),
    model: sum(x => x.model),
  }
})

const maxAttention = 12
const maxMoney = 160
const bars = computed(() => sim.value.rounds.map((x) => {
  const money = s.value.lens === 'money'
  const a = money ? x.model / maxMoney : x.real / maxAttention
  const b = money ? x.people / maxMoney : x.noise / maxAttention
  return { ...x, a: Math.min(a, 1), b: Math.min(b, 1 - Math.min(a, 1)), used: x.r <= s.value.rounds, past: x.r > sim.value.stopAt }
}))

const hm = (m: number) => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')} min`
const eur = (v: number) => `€${Math.round(v).toLocaleString('en-US')}`
</script>

<template>
  <div class="budget" :class="s.lens">
    <div class="controls">
      <div class="seg">
        <span>Reviewers</span>
        <button v-for="n in 4" :key="n" type="button" :class="{ on: s.k === n }" @click="set({ k: n })">{{ n }}</button>
      </div>
      <div class="seg">
        <span>Rounds</span>
        <button v-for="n in 6" :key="n" type="button" :class="{ on: s.rounds === n }" @click="set({ rounds: n })">{{ n }}</button>
      </div>
      <div class="seg lens">
        <button type="button" :class="{ on: s.lens === 'attention' }" @click="set({ lens: 'attention' })">Developer: attention</button>
        <button type="button" :class="{ on: s.lens === 'money' }" @click="set({ lens: 'money' })">Manager: money</button>
      </div>
    </div>

    <div class="chart">
      <div class="axis">{{ s.lens === 'money' ? '€ per round' : 'Findings per round' }}</div>
      <div class="cols">
        <div v-for="b in bars" :key="b.r" class="col" :class="{ used: b.used, past: b.past }">
          <div class="stack">
            <div class="seg-b" :style="{ height: b.b * 100 + '%', viewTransitionName: `ns-bb-${b.r}` }" />
            <div class="seg-a" :style="{ height: b.a * 100 + '%', viewTransitionName: `ns-ba-${b.r}` }" />
          </div>
          <div class="rl">Round {{ b.r }}</div>
          <div v-if="b.r === sim.stopAt && s.rounds >= sim.stopAt" class="stop">Stop here</div>
        </div>
      </div>
      <div class="legend">
        <template v-if="s.lens === 'attention'"><i class="a" /> real issues <i class="b" /> noise to triage</template>
        <template v-else><i class="a" /> model runs <i class="b" /> people's time</template>
        <em>Illustrative model</em>
      </div>
    </div>

    <div class="sum">
      <template v-if="s.lens === 'attention'">
        <div><span>Real issues caught</span><b>{{ sim.caught.toFixed(1) }} <small>of 6</small></b></div>
        <div><span>Findings to triage</span><b>{{ Math.round(sim.findings) }}</b></div>
        <div class="big"><span>Your attention, per PR</span><b>{{ hm(sim.minutes) }}</b></div>
      </template>
      <template v-else>
        <div><span>Model runs, per PR</span><b>{{ eur(sim.model) }}</b></div>
        <div><span>People's time, per PR</span><b>{{ eur(sim.people) }}</b></div>
        <div class="big"><span>At 300 PRs a month</span><b>{{ eur((sim.model + sim.people) * PRS) }}</b></div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.budget {
  height: 510px;
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr;
  gap: 18px 36px;
}

.controls {
  grid-column: 1 / -1;
  display: flex;
  gap: 28px;
  align-items: center;
}

.seg {
  display: flex;
  align-items: center;
  gap: 4px;
}

.seg span {
  font-size: var(--ns-label);
  font-weight: 700;
  margin-right: 8px;
  color: var(--z-grey-600);
}

.seg button {
  font: inherit;
  font-size: var(--ns-label);
  font-weight: 700;
  min-width: 38px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--ns-line);
  background: #fff;
  color: var(--z-ink);
  cursor: pointer;
  transition: background 250ms var(--ns-ease), color 250ms var(--ns-ease);
}

.seg button.on {
  background: var(--z-ink);
  border-color: var(--z-ink);
  color: #fff;
}

.seg.lens {
  margin-left: auto;
}

.money .seg.lens button.on {
  background: var(--ns-red);
  border-color: var(--ns-red);
}

.chart {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 0;
  border-bottom: 2px solid var(--z-ink);
}

.axis {
  font-size: var(--ns-label);
  color: var(--z-grey-600);
  font-weight: 700;
}

.cols {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  align-items: end;
  min-height: 0;
  padding-top: 10px;
}

.col {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: opacity 500ms var(--ns-ease);
}

.col:not(.used) {
  opacity: 0.12;
}

.col.used.past {
  opacity: 0.45;
}

.stack {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.seg-a,
.seg-b {
  transition: height 900ms var(--ns-ease), background 500ms var(--ns-ease);
}

.seg-a {
  background: var(--ns-teal);
}

.seg-b {
  background: #c9c9c6;
}

.money .seg-a {
  background: var(--z-ink);
}

.money .seg-b {
  background: var(--ns-red);
}

.rl {
  font-size: var(--ns-label);
  padding: 8px 0 6px;
  color: var(--z-grey-600);
  font-weight: 600;
}

.stop {
  position: absolute;
  top: 0;
  left: -8px;
  right: -8px;
  bottom: 30px;
  border: 3px dashed var(--z-ink);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
  font-size: var(--ns-label);
  font-weight: 800;
  pointer-events: none;
}

.legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--ns-label);
  padding: 10px 0;
  color: var(--z-ink-800);
}

.legend i {
  width: 16px;
  height: 16px;
  display: inline-block;
}

.legend i.a { background: var(--ns-teal); }
.legend i.b { background: #c9c9c6; margin-left: 12px; }
.money .legend i.a { background: var(--z-ink); }
.money .legend i.b { background: var(--ns-red); }

.legend em {
  margin-left: auto;
  font-style: normal;
  color: var(--z-grey-600);
}

.sum {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sum > div {
  border-top: 1px solid var(--ns-line);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
}

.sum span {
  font-size: 19px;
  color: var(--z-grey-600);
  font-weight: 600;
}

.sum b {
  font-size: 36px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.sum small {
  font-size: 20px;
  color: var(--z-grey-600);
}

.sum .big {
  margin-top: auto;
  background: var(--z-ink);
  color: #fff;
  padding: 16px 18px;
  border: 0;
}

.sum .big span {
  color: #cfcfcf;
}

.sum .big b {
  font-size: 40px;
}

.money .sum .big {
  background: var(--ns-red);
}

.money .sum .big span {
  color: #ffe1dc;
}
</style>
