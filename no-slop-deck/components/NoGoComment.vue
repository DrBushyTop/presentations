<!--
  A no-go comment, redrawn from Polylane's post: the mechanism first, then
  the evidence from production, then what would make the change safe.
  The chart is synthetic, shaped like theirs (~38 writes/s on orders).
  0 the verdict and mechanism · 1 the evidence · 2 the fix
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const N = 48
const CW = 520
const CH = 190
let seed = 5
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 6
const pts = Array.from({ length: N }, (_, h) => Math.max(8, 34 + 9 * Math.sin((2 * Math.PI * (h - 8)) / 24) + noise()))
const x = (h: number) => 40 + ((CW - 50) * h) / (N - 1)
const y = (v: number) => 10 + ((50 - v) / 50) * (CH - 40)
const line = pts.map((v, h) => `${h ? 'L' : 'M'}${x(h).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
const area = `${line} L${x(N - 1)},${y(0)} L${x(0)},${y(0)} Z`
</script>

<template>
  <div class="nogo">
    <div class="who"><span class="av"><Icon name="bot" /></span><b>polylane</b> bot commented on PR #1207</div>
    <div class="caution"><Icon name="alert" /> Merging this pull request may degrade production (high impact).</div>
    <p class="mech">Merging this blocks every write to <code>orders</code> while the index builds.</p>

    <div class="evidence" :class="{ on: step >= 1 }">
      <div class="facts">
        <p><code>0114_order_search_trgm.sql:3</code> creates an index without <code>CONCURRENTLY</code>, which locks the table for the whole build.</p>
        <p>Checkout sustains <b>about 38 writes a second</b> on that table. Every one waits while the index builds.</p>
      </div>
      <figure class="chart">
        <figcaption><span class="ns-mono">orders-db</span> writes per second, last 48 h</figcaption>
        <svg :viewBox="`0 0 ${CW} ${CH}`" aria-hidden="true">
          <line v-for="t in [0, 20, 40]" :key="t" :x1="40" :x2="CW - 10" :y1="y(t)" :y2="y(t)" class="gl" />
          <text v-for="t in [0, 20, 40]" :key="'t' + t" :x="32" :y="y(t) + 6" text-anchor="end">{{ t }}</text>
          <path :d="area" class="area" />
          <path :d="line" class="ln" />
          <text :x="40" :y="CH - 4">48 h ago</text>
          <text :x="CW - 10" :y="CH - 4" text-anchor="end">now</text>
        </svg>
      </figure>
    </div>

    <div class="fix" :class="{ on: step >= 2 }">
      <Icon name="check" />
      <span>To make this safe: <code>CREATE INDEX CONCURRENTLY</code>, outside the transactional migration.</span>
    </div>
  </div>
</template>

<style scoped>
.nogo {
  height: 510px;
  border: 1px solid var(--ns-line);
  box-shadow: 0 24px 60px -34px rgba(26, 26, 26, 0.4);
  padding: 18px 24px;
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  gap: 12px;
}

.who {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 19px;
  color: var(--z-ink-800);
}

.av {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--z-ink);
  color: #fff;
  font-size: 20px;
}

.caution {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #fff1ee;
  color: var(--ns-red);
  font-size: 21px;
  font-weight: 800;
}

code {
  font-family: var(--ns-mono);
  font-size: 0.86em;
  background: var(--ns-soft);
  padding: 1px 6px;
}

.mech {
  margin: 4px 0 0;
  max-width: none;
  font-size: 32px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.mech code {
  background: #fff1ee;
  color: var(--ns-red);
}

.evidence {
  display: grid;
  grid-template-columns: 1fr 540px;
  gap: 28px;
  min-height: 0;
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.evidence:not(.on) {
  opacity: 0;
  transform: translateY(12px);
}

.facts {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.facts p {
  margin: 0;
  font-size: 21px;
  line-height: 1.38;
  max-width: none;
}

.chart {
  position: relative;
  margin: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

figcaption {
  font-size: var(--ns-label);
  color: var(--z-grey-600);
  margin-bottom: 4px;
}

.chart svg {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow: visible;
}

.gl {
  stroke: var(--ns-line);
}

.chart text {
  font-family: var(--z-font-text);
  font-size: 18px;
  fill: var(--z-grey-600);
}

.area {
  fill: rgba(222, 30, 5, 0.16);
}

.ln {
  fill: none;
  stroke: var(--ns-red);
  stroke-width: 3;
}

.over {
  position: absolute;
  left: 60px;
  top: 34px;
  padding: 4px 10px;
  background: #fff;
  border: 2px solid var(--ns-red);
  color: var(--ns-red);
  font-size: var(--ns-label);
  font-weight: 700;
}

.fix {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--ns-teal);
  color: #fff;
  font-size: 21px;
  font-weight: 700;
  transition: opacity 600ms var(--ns-ease);
}

.fix:not(.on) {
  opacity: 0;
}

.fix code {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}
</style>
