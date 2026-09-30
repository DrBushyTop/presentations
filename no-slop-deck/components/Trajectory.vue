<!--
  Polylane's production review: from a diff to failure trajectories with
  evidence, each confirmed, plausible or refuted. Example rows are ours.
  0 the chain · 1 trajectories · 2 verdicts · 3 the policy question
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const chain = [
  { k: 'Diff', v: 'routes/export.ts' },
  { k: 'Affected resources', v: 'export API · tasks DB · report worker' },
  { k: 'Telemetry', v: 'Latency, CPU, errors, 24 h forecast' },
]
const rows = [
  { t: 'Export query scans every tenant, DB CPU spikes', s: 'confirmed', verdict: 'Fails the check' },
  { t: 'A very large export times out the worker', s: 'plausible', verdict: 'Passes. Nobody proved it either way.' },
  { t: 'New CSV columns break the nightly report', s: 'refuted', verdict: 'Dropped, with evidence' },
]
</script>

<template>
  <div class="traj">
    <div class="chain">
      <template v-for="(c, i) in chain" :key="c.k">
        <div class="node on" :style="{ '--i': i }"><small>{{ c.k }}</small><b>{{ c.v }}</b></div>
        <div v-if="i < chain.length - 1" class="arr on" />
      </template>
    </div>
    <div class="rows">
      <div v-for="(r, i) in rows" :key="r.t" class="row" :class="[r.s, { on: step >= 1, judged: step >= 2, focus: step >= 3 && r.s === 'plausible', dim: step >= 3 && r.s !== 'plausible' }]" :style="{ '--i': i }">
        <span class="t">{{ r.t }}</span>
        <span class="chip">{{ step >= 2 ? r.s : 'unchecked' }}</span>
        <span class="verdict">{{ r.verdict }}</span>
      </div>
    </div>
    <div class="policy" :class="{ on: step >= 3 }">
      <b>Missing evidence is a policy decision.</b>
    </div>
  </div>
</template>

<style scoped>
.traj {
  height: 510px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 22px;
}

.chain {
  display: grid;
  grid-template-columns: 1fr 48px 1.3fr 48px 1.2fr;
  align-items: stretch;
}

.node {
  background: var(--z-ink);
  color: #fff;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
  transition-delay: calc(var(--i) * 160ms);
}

.node small {
  font-size: var(--ns-label);
  color: #bdbdbd;
  font-weight: 700;
}

.node b {
  font-size: 19px;
  line-height: 1.3;
}

.node:not(.on),
.arr:not(.on) {
  opacity: 0;
  transform: translateX(-12px);
}

.arr {
  position: relative;
  transition: opacity 500ms var(--ns-ease) 300ms;
}

.arr::before {
  content: '';
  position: absolute;
  left: 8px;
  right: 10px;
  top: 50%;
  height: 3px;
  background: var(--z-ink);
}

.arr::after {
  content: '';
  position: absolute;
  right: 8px;
  top: calc(50% - 6px);
  width: 12px;
  height: 12px;
  border-top: 3px solid var(--z-ink);
  border-right: 3px solid var(--z-ink);
  transform: rotate(45deg);
}

.rows {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
}

.row {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 150px 340px;
  align-items: center;
  gap: 18px;
  padding: 0 18px;
  border: 1px solid var(--ns-line);
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease), background 500ms var(--ns-ease);
  transition-delay: calc(var(--i) * 120ms + 400ms);
}

.row:not(.on) {
  opacity: 0;
  transform: translateY(12px);
}

.row.dim {
  opacity: 0.6;
  transition-delay: 0ms;
}

.t {
  font-size: 21px;
  font-weight: 650;
  line-height: 1.25;
}

.chip {
  justify-self: start;
  font-size: var(--ns-label);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 12px;
  color: #fff;
  background: #9a9a9a;
  transition: background 400ms var(--ns-ease);
}

.verdict {
  font-size: 18px;
  line-height: 1.3;
  color: var(--z-ink-800);
  transition: opacity 400ms var(--ns-ease);
}

.row:not(.judged) .verdict {
  opacity: 0;
}

.judged.confirmed .chip { background: var(--ns-red); }
.judged.plausible .chip { background: var(--z-yellow); color: var(--z-ink); }
.judged.refuted .chip { background: var(--ns-teal); }

.row.focus {
  background: var(--z-ink);
  border-color: var(--z-ink);
  color: #fff;
  transition-delay: 0ms;
}

.row.focus .verdict {
  color: #fff;
  font-weight: 700;
}

.policy {
  display: flex;
  gap: 22px;
  align-items: baseline;
  transition: opacity 600ms var(--ns-ease);
}

.policy:not(.on) {
  opacity: 0;
}

.policy b {
  font-size: 30px;
}

.policy span {
  font-size: 18px;
  line-height: 1.35;
  color: var(--z-ink-800);
}
</style>
