<!--
  Polylane's Jev aside: a typed decision model in place of LLM calls for
  routing, classification and ranking. Their numbers, their workload.
  0 before · 1 after
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const metrics = [
  { k: 'P90 latency', before: 4752, after: 508, unit: 'ms', fmt: (v: number) => `${v.toLocaleString('en-US')} ms` },
  { k: 'Cost per 1,000 calls', before: 0.762, after: 0.464, unit: '$', fmt: (v: number) => `$${v.toFixed(2)}` },
]
</script>

<template>
  <div class="jev">
    <div class="uses">
      <b>Where they use it</b>
      <ul>
        <li>Routing replies</li>
        <li>Classifying incidents and closed PRs</li>
        <li>Ranking autofix urgency</li>
      </ul>
      <p>Not for writing code, and not for investigation.</p>
    </div>
    <div class="metrics">
      <div v-for="m in metrics" :key="m.k" class="m">
        <header><b>{{ m.k }}</b><span class="ns-mono">{{ m.fmt(step >= 1 ? m.after : m.before) }}</span></header>
        <div class="track">
          <div class="old" />
          <div class="new" :style="{ width: (step >= 1 ? m.after / m.before : 1) * 100 + '%', viewTransitionName: `ns-jev-${m.unit}` }" />
        </div>
        <div class="labels"><span>LLM call: {{ m.fmt(m.before) }}</span><span :class="{ on: step >= 1 }">Jev: {{ m.fmt(m.after) }}</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jev {
  height: 530px;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 60px;
}

.uses b {
  font-size: 24px;
}

.uses ul {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.uses li {
  font-size: 24px;
  padding: 18px 0;
  border-top: 1px solid var(--ns-line);
  margin: 0;
  max-width: none;
}

.uses li::before {
  display: none !important;
}

.uses p {
  margin-top: 28px;
  font-size: 20px;
  color: var(--ns-red);
  font-weight: 700;
}

.metrics {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

header b {
  font-size: 24px;
}

header span {
  font-size: 34px;
  font-weight: 700;
}

.track {
  position: relative;
  height: 46px;
}

.old,
.new {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
}

.old {
  right: 0;
  background: var(--ns-soft);
  border: 1px dashed #b5b5b2;
}

.new {
  background: var(--ns-teal);
  transition: width 1200ms var(--ns-ease);
}

.labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 17px;
  color: var(--z-grey-600);
}

.labels span.on {
  color: var(--ns-teal);
  font-weight: 700;
}

.labels span:last-child:not(.on) {
  opacity: 0;
}
</style>
