<!--
  After merge: something will get through, so plan who watches, what signal
  stops it and how far it can spread. The rollout and the metric are our
  export example, not data from a source.
  0 who watches · 1 the signal and the flag · 2 the blast radius · 3 Honeycomb's goal
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const stops = [
  { x: 40, t: 'Merge' },
  { x: 250, t: 'Deploy, flag off' },
  { x: 500, t: 'Flag on for one team' },
  { x: 745, t: 'Signal fires, flag off' },
  { x: 1000, t: 'Fix, then all teams' },
]
const cards = [
  { q: 'Who watches it go live?', a: 'The author, in working hours, ready to roll back.', src: 'Intercom · Spotify' },
  { q: 'What signal stops it?', a: 'A metric tied to this PR, and a flag to turn it off.', src: 'Honeycomb' },
  { q: 'How far can it spread?', a: 'One team behind the flag. Least privilege. A rollback you have tried.', src: 'Honeycomb · Spotify' },
]
</script>

<template>
  <div class="contain" :class="`s${Math.min(step, 3)}`">
    <svg class="roll" viewBox="0 0 1136 210" aria-hidden="true">
      <g class="watch">
        <path d="M250,30 L250,18 L1000,18 L1000,30" />
        <text x="625" y="10" text-anchor="middle">Author watching</text>
      </g>

      <rect class="ghost" x="752" y="40" width="360" height="110" />
      <text class="ghost-t" x="932" y="98" text-anchor="middle">Without the flag: every team</text>
      <rect class="radius" x="500" y="40" width="248" height="110" />
      <text class="radius-t" x="512" y="64">One team affected</text>

      <line x1="0" x2="1136" y1="150" y2="150" class="base" />
      <path class="metric flat" d="M40,150 L1100,150" />
      <path class="metric spike" pathLength="1" d="M500,150 C540,150 560,86 600,80 L745,76 L752,150" />
      <text class="metric-t" x="620" y="110"><tspan x="620">Foreign rows</tspan><tspan x="620" dy="22">in exports</tspan></text>

      <g class="flag-off">
        <line x1="748" x2="748" y1="36" y2="150" />
      </g>

      <g v-for="s in stops" :key="s.t" class="stop">
        <circle :cx="s.x" cy="150" r="7" />
        <text :x="s.x" y="190" :text-anchor="s.x < 100 ? 'start' : 'middle'">{{ s.t }}</text>
      </g>
    </svg>

    <div class="cards">
      <section v-for="(c, i) in cards" :key="c.q" class="card" :class="{ on: step >= i }">
        <b>{{ c.q }}</b>
        <p>{{ c.a }}</p>
        <small>{{ c.src }}</small>
      </section>
    </div>

    <p class="goal" :class="{ on: step >= 3 }">"Keeping each failure cheap to contain, not holding the count flat." <span>Honeycomb</span></p>
  </div>
</template>

<style scoped>
.contain {
  height: 510px;
  display: grid;
  grid-template-rows: 210px 1fr auto;
  gap: 22px;
}

.roll {
  width: 100%;
  height: 210px;
  overflow: visible;
}

.roll text {
  font-family: var(--z-font-text);
  font-size: var(--ns-label);
  fill: var(--z-grey-600);
}

.base {
  stroke: var(--z-ink);
  stroke-width: 2;
}

.stop circle {
  fill: #fff;
  stroke: var(--z-ink);
  stroke-width: 3;
}

.stop text {
  fill: var(--z-ink);
  font-weight: 700;
}

.watch path {
  fill: none;
  stroke: var(--ns-teal);
  stroke-width: 2;
}

.watch text {
  fill: var(--ns-teal);
  font-weight: 700;
}

.metric {
  fill: none;
  stroke-width: 4;
  transition: opacity 500ms var(--ns-ease);
}

.flat {
  stroke: var(--ns-teal);
}

.spike {
  stroke: var(--ns-red);
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  opacity: 0;
}

.metric-t,
.flag-off,
.radius,
.radius-t,
.ghost,
.ghost-t {
  opacity: 0;
  transition: opacity 600ms var(--ns-ease);
}

.metric-t {
  fill: var(--ns-red) !important;
  font-weight: 700;
}

.flag-off line {
  stroke: var(--ns-red);
  stroke-width: 3;
  stroke-dasharray: 6 5;
}

.radius {
  fill: rgba(222, 30, 5, 0.1);
}

.radius-t {
  fill: var(--ns-red) !important;
  font-weight: 700;
}

.ghost {
  fill: none;
  stroke: #b5b5b2;
  stroke-width: 2;
  stroke-dasharray: 8 6;
}

.s1 .spike,
.s2 .spike,
.s3 .spike {
  opacity: 1;
  animation: draw 1400ms var(--ns-ease) both;
}

.s1 .metric-t,
.s2 .metric-t,
.s3 .metric-t,
.s1 .flag-off,
.s2 .flag-off,
.s3 .flag-off {
  opacity: 1;
}

.s2 .radius,
.s3 .radius,
.s2 .radius-t,
.s3 .radius-t,
.s2 .ghost,
.s3 .ghost,
.s2 .ghost-t,
.s3 .ghost-t {
  opacity: 1;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px;
  background: var(--ns-soft);
  border-top: 4px solid var(--z-ink);
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.card:not(.on) {
  opacity: 0;
  transform: translateY(12px);
}

.card b {
  font-size: 24px;
}

.card p {
  margin: 0;
  font-size: 21px;
  line-height: 1.35;
  max-width: none;
}

.card small {
  margin-top: auto;
  font-size: var(--ns-label);
  color: var(--z-grey-600);
}

.goal {
  margin: 0;
  max-width: none;
  padding: 16px 22px;
  background: var(--z-ink);
  color: #fff;
  font-size: 25px;
  font-weight: 800;
  transition: opacity 600ms var(--ns-ease);
}

.goal span {
  margin-left: 10px;
  font-size: var(--ns-label);
  font-weight: 400;
  color: #bdbdbd;
}

.goal:not(.on) {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .spike {
    animation: none !important;
    stroke-dashoffset: 0;
  }
}
</style>
