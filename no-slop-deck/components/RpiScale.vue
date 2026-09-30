<!--
  Research, plan, implement, with a fresh context per phase and the ceremony
  scaled to the task. 1 phases and handoffs · 2 how much of it a task needs
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const phases = [
  { name: 'Research', out: 'research.md', what: 'How it works today. Facts, not fixes.', fill: 52 },
  { name: 'Plan', out: 'plan.md', what: 'Decisions, files, and how we will verify.', fill: 47 },
  { name: 'Implement', out: 'commits', what: 'Follow the plan. Check each step.', fill: 58 },
]

const sizes = [
  { label: 'Small change', note: 'Talk to the agent directly', on: [false, false, true] },
  { label: 'Medium', note: 'Plan, then implement', on: [false, true, true] },
  { label: 'Large, messy or risky', note: 'The full sequence', on: [true, true, true] },
]
</script>

<template>
  <div class="rpi">
    <div class="corner">
      <div class="zone-key"><i /> Context used. I aim to stay inside 40 to 60%.</div>
    </div>
    <div v-for="(p, i) in phases" :key="p.name" class="phase" :class="{ on: step >= 1 }" :style="{ '--i': i }">
      <div class="name">{{ p.name }}</div>
      <div class="what">{{ p.what }}</div>
      <div class="gauge"><span class="band" /><span class="fill" :style="{ width: step >= 1 ? p.fill + '%' : '4%', viewTransitionName: `ns-rpi-${i}` }" /></div>
      <div class="out ns-mono">{{ p.out }}</div>
    </div>

    <template v-for="(s, r) in sizes" :key="s.label">
      <div class="row-label" :class="{ on: step >= 2 }" :style="{ '--r': r }">
        <b>{{ s.label }}</b><span>{{ s.note }}</span>
      </div>
      <div v-for="(lit, c) in s.on" :key="c" class="cell" :class="{ on: step >= 2, lit }" :style="{ '--r': r, '--c': c }" />
    </template>
  </div>
</template>

<style scoped>
.rpi {
  display: grid;
  grid-template-columns: 300px repeat(3, 1fr);
  grid-template-rows: 250px repeat(3, 1fr);
  gap: 12px 14px;
  height: 500px;
}

.corner {
  display: flex;
  align-items: flex-end;
  padding-bottom: 8px;
}

.zone-key {
  font-size: 16px;
  line-height: 1.35;
  color: var(--z-grey-600);
}

.zone-key i {
  display: inline-block;
  width: 26px;
  height: 12px;
  background: var(--z-teal-100);
  border: 1px solid var(--ns-teal);
  vertical-align: -1px;
  margin-right: 6px;
}

.phase {
  position: relative;
  border-top: 5px solid var(--z-ink);
  padding: 16px 18px 16px 0;
  display: flex;
  flex-direction: column;
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
  transition-delay: calc(var(--i) * 120ms);
}

.phase:not(.on) {
  opacity: 0.2;
}

.phase + .phase::before {
  content: '';
  position: absolute;
  left: -14px;
  top: 22px;
  width: 10px;
  height: 10px;
  border-top: 3px solid var(--z-ink);
  border-right: 3px solid var(--z-ink);
  transform: rotate(45deg);
}

.name {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.what {
  font-size: 19px;
  line-height: 1.3;
  color: var(--z-ink-800);
  margin-top: 6px;
  min-height: 50px;
}

.gauge {
  position: relative;
  height: 20px;
  margin-top: auto;
  background: var(--ns-soft);
  border: 1px solid var(--ns-line);
}

.band {
  position: absolute;
  left: 40%;
  width: 20%;
  top: -1px;
  bottom: -1px;
  background: var(--z-teal-100);
  border-left: 1px solid var(--ns-teal);
  border-right: 1px solid var(--ns-teal);
}

.fill {
  position: absolute;
  left: 0;
  top: 5px;
  height: 8px;
  background: var(--z-ink);
  transition: width 1400ms var(--ns-ease);
  transition-delay: calc(var(--i) * 260ms + 200ms);
}

.out {
  margin-top: 12px;
  font-size: 16px;
  color: var(--ns-teal);
  font-weight: 600;
}

.row-label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-top: 1px solid var(--ns-line);
  transition: opacity 500ms var(--ns-ease), transform 700ms var(--ns-ease);
  transition-delay: calc(var(--r) * 110ms);
}

.row-label b {
  font-size: 21px;
}

.row-label span {
  font-size: 17px;
  color: var(--z-grey-600);
}

.cell {
  border-top: 1px solid var(--ns-line);
  margin-top: 0;
  position: relative;
  transition: opacity 500ms var(--ns-ease);
  transition-delay: calc(var(--r) * 110ms + var(--c) * 60ms);
}

.cell.lit::after {
  content: '';
  position: absolute;
  inset: 10px 0 10px 0;
  background: var(--z-ink);
  transform-origin: left;
  transition: transform 700ms var(--ns-ease);
  transition-delay: inherit;
}

.cell:not(.on)::after {
  transform: scaleX(0);
}

.row-label:not(.on),
.cell:not(.on) {
  opacity: 0;
}

.row-label:not(.on) {
  transform: translateX(-16px);
}
</style>
