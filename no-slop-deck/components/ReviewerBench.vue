<!--
  Test the reviewers on bugs you already found, the way Uber benchmarks
  uReview: real PRs with known bugs, graded easy, medium and hard, scored on
  what was caught, false alarms, time and cost. The PRs and the results
  here are illustrative.
  0 the known bugs · 1 today's reviewer · 2 rerun after a change
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const prs = [
  { t: 'Crash on a null due date', g: 'Easy', a: 1, b: 1 },
  { t: 'Formula in a CSV cell', g: 'Easy', a: 1, b: 1 },
  { t: 'Off by one in paging', g: 'Easy', a: 0, b: 1 },
  { t: 'Report in the wrong timezone', g: 'Medium', a: 1, b: 1 },
  { t: 'Retry without backoff', g: 'Medium', a: 0, b: 1 },
  { t: 'Join without an index', g: 'Medium', a: 1, b: 0 },
  { t: 'Export ignores the team', g: 'Hard', a: 0, b: 1 },
  { t: 'Old role kept after a change', g: 'Hard', a: 1, b: 1 },
  { t: 'Race in the cache refresh', g: 'Hard', a: 0, b: 0 },
]
const caught = (k: 'a' | 'b') => prs.filter(p => p[k]).length
const summary = [
  { k: 'False alarms', a: '14', b: '6' },
  { k: 'Minutes per PR', a: '4.1', b: '2.3' },
  { k: 'Cost per review', a: '€0.42', b: '€0.18' },
]
const how = [
  { t: 'Collect merged PRs with a known bug', d: 'Grade them easy, medium, hard.' },
  { t: 'Run each reviewer on them', d: 'Count caught, missed, false alarms, time, cost.' },
  { t: 'Rerun when the model or prompt changes', d: 'Keep the reviewer that wins on your own bugs.' },
]
</script>

<template>
  <div class="bench">
    <ol class="how">
      <li v-for="(h, i) in how" :key="h.t" :class="{ on: step >= i }">
        <span class="n ns-mono">{{ i + 1 }}</span>
        <div><b>{{ h.t }}</b><small>{{ h.d }}</small></div>
      </li>
    </ol>

    <div class="grid">
      <div class="hd">
        <span>Known bug <em class="ill">· illustrative results</em></span>
        <span class="c" :class="{ on: step >= 1 }">Today</span>
        <span class="c" :class="{ on: step >= 2 }">New model</span>
      </div>
      <div v-for="p in prs" :key="p.t" class="r">
        <span class="t"><em :class="p.g.toLowerCase()">{{ p.g }}</em>{{ p.t }}</span>
        <span class="c" :class="[{ on: step >= 1 }, p.a ? 'hit' : 'miss']"><Icon :name="p.a ? 'check' : 'x'" /></span>
        <span class="c" :class="[{ on: step >= 2 }, p.b ? 'hit' : 'miss']"><Icon :name="p.b ? 'check' : 'x'" /></span>
      </div>
      <div class="r sum first">
        <span class="t">Caught</span>
        <span class="c ns-mono" :class="{ on: step >= 1 }">{{ caught('a') }} / 9</span>
        <span class="c ns-mono" :class="{ on: step >= 2 }">{{ caught('b') }} / 9</span>
      </div>
      <div v-for="s in summary" :key="s.k" class="r sum">
        <span class="t">{{ s.k }}</span>
        <span class="c ns-mono" :class="{ on: step >= 1 }">{{ s.a }}</span>
        <span class="c ns-mono" :class="{ on: step >= 2 }">{{ s.b }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bench {
  height: 510px;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 44px;
}

.how {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.how li {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 12px;
  padding: 18px 0;
  border-top: 2px solid var(--z-ink);
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.how li:not(.on) {
  opacity: 0;
  transform: translateY(12px);
}

.how .n {
  font-size: 30px;
  font-weight: 700;
  color: var(--ns-teal);
}

.how b {
  display: block;
  font-size: 24px;
  line-height: 1.25;
}

.how small {
  display: block;
  margin-top: 6px;
  font-size: 20px;
  line-height: 1.35;
  color: var(--z-ink-800);
}

.grid {
  position: relative;
  display: flex;
  flex-direction: column;
}

.hd,
.r {
  display: grid;
  grid-template-columns: 1fr 130px 130px;
  align-items: center;
}

.hd {
  padding-bottom: 8px;
  border-bottom: 2px solid var(--z-ink);
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
}

.r {
  height: 36px;
  border-bottom: 1px solid var(--ns-line);
}

.t {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
}

.t em {
  width: 74px;
  font-style: normal;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--z-grey-600);
}

.t em.hard {
  color: var(--ns-red);
}

.c {
  text-align: center;
  font-size: 22px;
  transition: opacity 500ms var(--ns-ease);
}

.c:not(.on) {
  opacity: 0;
}

.hd .c {
  color: var(--z-ink);
}

.hit {
  color: var(--ns-teal);
}

.miss {
  color: var(--ns-red);
}

.sum {
  height: 36px;
}

.sum.first {
  border-top: 2px solid var(--z-ink);
}

.sum .t {
  font-weight: 700;
}

.sum .c {
  font-size: 20px;
  font-weight: 700;
}

.ill {
  font-style: normal;
  font-weight: 400;
}
</style>
