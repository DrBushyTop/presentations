<!--
  Local review after every slice: the main agent sends adversarial subagents
  at the slice it just built, one lens each, and fixes what they find before
  the next slice starts.
  0 one adversary · 1 three in parallel · 2 fix, then the next slice
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const adversaries = [
  { lens: 'Functional', f: 'A forged teamId returns Team B\'s rows.' },
  { lens: 'Non-functional', f: 'Every row loads into memory before streaming.' },
  { lens: 'Security', f: 'A title starting with = runs as a spreadsheet formula.' },
]
const ys = [16.7, 50, 83.3]
</script>

<template>
  <div class="adv" :class="{ 'is-fixed': step >= 2 }">
    <ol class="slices">
      <li class="done"><Icon name="check" /><span><b>Slice 1</b>Done</span></li>
      <li class="now"><Icon name="dot" /><span><b>Slice 2</b>Just built</span></li>
      <li class="next" :class="{ open: step >= 2 }"><Icon :name="step >= 2 ? 'arrow' : 'clock'" /><span><b>Slice 3</b>{{ step >= 2 ? 'Can start' : 'Waits for fixes' }}</span></li>
    </ol>

    <div class="main">
      <small>Main agent</small>
      <b>Slice 2 is done. Send in the reviewers.</b>
      <span class="ns-mono">{{ step >= 1 ? '3 subagents, in parallel' : '1 subagent' }}</span>
    </div>

    <svg class="fan" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path
        v-for="(y, i) in ys" :key="i" :d="`M0,50 C50,50 50,${y} 100,${y}`"
        class="wire" :class="{ on: i === 0 || step >= 1 }" vector-effect="non-scaling-stroke"
      />
    </svg>

    <div class="list">
      <section v-for="(a, i) in adversaries" :key="a.lens" class="card" :class="{ on: i === 0 || step >= 1 }" :style="{ '--i': i }">
        <header><b>{{ a.lens }}</b></header>
        <div class="finding">
          <Icon :name="step >= 2 ? 'check' : 'alert'" />
          <span>{{ a.f }}</span>
        </div>
      </section>
    </div>

    <p class="rule" :class="{ on: step >= 2 }">Fix before the next slice starts. One lens per subagent, each with a fresh context.</p>
  </div>
</template>

<style scoped>
.adv {
  height: 510px;
  display: grid;
  grid-template-columns: 170px 230px 90px minmax(0, 1fr);
  grid-template-rows: 1fr auto;
  column-gap: 18px;
  row-gap: 20px;
}

.slices {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.slices li {
  margin: 0;
  max-width: none;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 12px;
  background: var(--ns-soft);
  font-size: var(--ns-label);
  transition: background 500ms var(--ns-ease), color 500ms var(--ns-ease), opacity 500ms var(--ns-ease);
}

.slices li::before {
  display: none !important;
}

.slices li :deep(.ns-icon) {
  font-size: 20px;
  margin-top: 2px;
}

.slices span {
  display: flex;
  flex-direction: column;
  color: var(--z-grey-600);
}

.slices b {
  font-size: 19px;
  color: var(--z-ink);
}

.slices .done :deep(.ns-icon) {
  color: var(--ns-teal);
}

.slices .now {
  background: var(--z-ink);
}

.slices .now b,
.slices .now span {
  color: #fff;
}

.slices .now :deep(.ns-icon) {
  color: var(--ns-frozen);
}

.slices .next {
  opacity: 0.55;
}

.slices .next.open {
  opacity: 1;
  background: #e3f4f6;
}

.slices .next.open :deep(.ns-icon) {
  color: var(--ns-teal);
}

.main {
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 20px;
  background: var(--z-ink);
  color: #fff;
}

.main small {
  font-size: var(--ns-label);
  font-weight: 700;
  color: #bdbdbd;
}

.main b {
  font-size: 22px;
  line-height: 1.25;
}

.main span {
  font-size: var(--ns-label);
  color: var(--ns-frozen);
}

.fan {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.wire {
  fill: none;
  stroke: var(--z-ink);
  stroke-width: 3;
  stroke-dasharray: 6 6;
  opacity: 0;
  transition: opacity 500ms var(--ns-ease);
  animation: flow 1s linear infinite;
}

.wire.on {
  opacity: 1;
}

.is-fixed .wire {
  stroke: var(--ns-teal);
}

@keyframes flow {
  to { stroke-dashoffset: -12; }
}

.list {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: space-between;
}

.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid var(--z-ink);
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
  transition-delay: calc(var(--i) * 120ms);
}

.card:not(.on) {
  opacity: 0.1;
  transform: translateY(10px);
}

.card header {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.card header b {
  font-size: 24px;
  flex: none;
}

.card header span {
  font-size: 17px;
  line-height: 1.3;
  color: var(--z-ink-800);
}

.finding {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  background: #fff1ee;
  color: var(--ns-red);
  font-size: 21px;
  font-weight: 700;
  transition: background 500ms var(--ns-ease), color 500ms var(--ns-ease);
}

.is-fixed .finding {
  background: #e3f4f6;
  color: var(--ns-teal);
}



.rule {
  grid-column: 1 / -1;
  margin: 0;
  max-width: none;
  padding: 16px 22px;
  background: var(--z-ink);
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.01em;
  transition: opacity 600ms var(--ns-ease);
}

.rule:not(.on) {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .wire { animation: none; }
}
</style>
