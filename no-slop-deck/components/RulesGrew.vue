<!--
  How my repo's rules grew: commits per day for its first twelve days, from
  the repo's harness report (22 Oct 2026). The checks arrived in a burst on
  14 to 16 October; after that, the work moved to tickets and review depth.
  0 the chart and the first days · 1 the checks arrive · 2 tickets and review ·
  3 regularly: improve the checks and skills from real sessions
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 99 })

const days = [34, 59, 11, 171, 330, 330, 9, 29, 231, 20, 43, 51].map((n, i) => ({ d: 11 + i, n }))
const max = 330

// Which click lights a day: 14-16 Oct on the first, 17-19 Oct on the second.
const at = (d: number) => (d >= 14 && d <= 16 ? 1 : d >= 17 && d <= 19 ? 2 : 0)
function tone(d: number, step: number) {
  const a = at(d)
  if (!a || step < a) return 'idle'
  return a === Math.min(step, 2) ? 'now' : 'past'
}

const notes = [
  { from: 0, at: 0, when: '11–13 Oct', h: 'Start', p: 'Feature slices, CONTEXT.md, browser evidence in every PR' },
  { from: 3, at: 1, when: '14–16 Oct', h: 'The checks', p: 'A pre-commit hook, local CI, AGENTS.md cut to a map, a second model reviewing' },
  { from: 6, at: 2, when: '17–19 Oct', h: 'Tickets and reviews', p: 'Every issue gets a size. Review depth follows it.' },
]
</script>

<template>
  <div class="rg">
    <div class="chart">
      <span class="axis">Commits per day, October</span>
      <div v-for="(x, i) in days" :key="x.d" class="day" :class="'t-' + tone(x.d, step)" :style="{ '--h': x.n / max, '--i': i }">
        <span class="n ns-mono">{{ x.n }}</span>
        <i class="bar" />
        <span class="d ns-mono">{{ x.d }}</span>
      </div>
    </div>

    <div class="notes">
      <div
        v-for="c in notes" :key="c.when"
        class="note" :class="{ on: step >= c.at, now: step === c.at && c.at > 0 }"
        :style="{ gridColumn: `${c.from + 1} / span 3` }"
      >
        <span class="when ns-mono">{{ c.when }}</span>
        <b>{{ c.h }}</b>
        <p>{{ c.p }}</p>
      </div>
      <div class="take" :class="{ on: step >= 3 }">
        <span class="when ns-mono">Regularly</span>
        <b>Improve from real data</b>
        <p>Agents read past sessions and propose new checks and skill fixes.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rg {
  height: 510px;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 26px;
}

/* ---------- Chart ---------- */

.chart {
  position: relative;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 14px;
  min-height: 0;
  padding-top: 8px;
  border-bottom: 2px solid var(--z-ink);
}

.axis {
  position: absolute;
  left: 0;
  top: 0;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
}

.day {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
}

.bar {
  width: 100%;
  height: calc(var(--h) * 240px);
  min-height: 4px;
  background: #d3d8da;
  transition: background-color 600ms var(--ns-ease);
  transition-delay: calc(var(--i) * 40ms);
}

.n {
  font-size: 17px;
  color: var(--z-grey-600);
  transition: color 600ms var(--ns-ease);
}

/* The day sits under the axis line. */
.d {
  position: absolute;
  bottom: -32px;
  font-size: 17px;
  color: var(--z-grey-600);
}

.t-now .bar { background: var(--ns-teal); }
.t-past .bar { background: #93c9d1; }
.t-now .n { color: var(--ns-teal); font-weight: 700; }

/* ---------- Notes under the bars ---------- */

.notes {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 14px;
  margin-top: 30px;
  min-height: 132px;
}

.note {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 10px;
  border-top: 4px solid var(--z-ink);
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease), border-color 600ms var(--ns-ease);
}

.note:not(.on) {
  opacity: 0;
  transform: translateY(10px);
}

.note.now { border-color: var(--ns-teal); }

.when {
  font-size: 16px;
  color: var(--ns-teal);
}

.note b {
  font-size: 22px;
  line-height: 1.2;
}

.note p,
.take p {
  margin: 0;
  max-width: none;
  font-size: 18px;
  line-height: 1.35;
  color: var(--z-ink-800);
}

.take {
  grid-column: 10 / span 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 14px 18px;
  background: var(--z-ink);
  color: #fff;
  transition: opacity 600ms var(--ns-ease) 300ms, transform 700ms var(--ns-ease) 300ms;
}

.take .when { color: var(--ns-frozen); }

.take b {
  font-size: 21px;
  line-height: 1.25;
  color: var(--ns-frozen);
}

.take p { color: #e6e6e6; }

.take:not(.on) {
  opacity: 0;
  transform: translateY(10px);
}
</style>
