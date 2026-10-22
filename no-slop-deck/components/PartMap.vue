<!--
  The agenda: six parts, with examples from one repo. The box introduces the
  repo briefly; the numbers follow on the next slide. Same grouping as the part
  dividers: before code, for each slice, after merge.
  0 the repo · 1 before code · 2 for each slice and after merge
-->
<script setup lang="ts">
import { gates } from '../lib/gates'

withDefaults(defineProps<{ step?: number }>(), { step: 99 })

// `at` is the click that reveals the group; `first` numbers the cards within
// that reveal so they rise one after another.
const groups = [
  { label: 'Before code', parts: [0, 1, 2], at: 1, first: 0 },
  { label: 'For each slice', parts: [3, 4], loop: true, at: 2, first: 3 },
  { label: 'After merge', parts: [5], at: 2, first: 3 },
]
</script>

<template>
  <div class="pm">
    <section class="ticket">
      <span class="id ns-mono"><Icon name="branch" />my repo</span>
      <div>
        <b>A UX research tool, built and merged by agents</b>
        <p>It records people trying prototype apps. Agents use it through MCP.</p>
      </div>
    </section>

    <div class="groups">
      <section v-for="g in groups" :key="g.label" class="group" :class="{ loop: g.loop, on: step >= g.at }" :style="{ '--n': g.parts.length }">
        <header>
          <svg v-if="g.loop" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" /><path d="M18 2.5v4h-4M6 21.5v-4h4" /></svg>
          {{ g.label }}
        </header>
        <div class="parts">
          <div v-for="i in g.parts" :key="i" class="part" :style="{ '--i': i - g.first }">
            <span class="n">{{ i + 1 }}</span>
            <b>{{ gates[i].name }}</b>
            <p>{{ gates[i].q }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.pm {
  height: 510px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 26px;
}

.ticket {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 28px;
  padding: 20px 26px;
  background: var(--ns-soft);
  border-left: 8px solid var(--z-ink);
}

.id {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  color: var(--z-grey-600);
}

.id :deep(.ns-icon) {
  font-size: 30px;
  color: var(--z-ink);
}

.ticket b {
  display: block;
  font-size: 32px;
  letter-spacing: -0.015em;
}

.ticket p {
  margin: 4px 0 0;
  max-width: none;
  font-size: 21px;
  color: var(--z-ink-800);
}

.tag {
  align-self: start;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--ns-teal);
}

.groups {
  display: grid;
  grid-template-columns: 3fr 2fr 1fr;
  gap: 22px;
  min-height: 0;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
  padding-bottom: 8px;
  border-bottom: 2px solid var(--z-ink);
}

.loop header {
  color: var(--ns-teal);
  border-color: var(--ns-teal);
}

header svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.parts {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  gap: 16px;
}

/* The frame sits outside the cards, so they keep the same size as the
   others and have room to rise into place. */
.loop .parts {
  padding: 10px;
  margin: -12px;
  border: 2px dashed var(--ns-teal);
}

.part {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 18px;
  background: #fff;
  border: 2px solid var(--z-ink);
  border-top-width: 6px;
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
  transition-delay: calc(var(--i) * 90ms);
}

.group:not(.on) .part {
  opacity: 0.12;
  transform: translateY(8px);
}

header,
.loop .parts {
  transition: opacity 600ms var(--ns-ease), border-color 600ms var(--ns-ease);
}

.group:not(.on) header {
  opacity: 0.35;
}

.loop:not(.on) .parts {
  border-color: rgba(3, 127, 145, 0.25);
}

.n {
  font-size: 44px;
  font-weight: 200;
  line-height: 1;
  color: var(--ns-teal);
}

.part b {
  font-size: 26px;
  letter-spacing: -0.01em;
}

.part p {
  margin: auto 0 0;
  max-width: none;
  font-size: 21px;
  line-height: 1.3;
  color: var(--z-ink-800);
  text-wrap: balance;
}
</style>
