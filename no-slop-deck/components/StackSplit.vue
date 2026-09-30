<!--
  One large agent PR becomes a reviewable stack (GitHub's example).
  0 one PR · 1 four layers, CI on each · 2 how to read it
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const layers = [
  { name: 'Grounded UI', lines: 240 },
  { name: 'Chat grounding', lines: 310 },
  { name: 'Search API', lines: 280 },
  { name: 'Catalog data types', lines: 190 },
]
</script>

<template>
  <div class="stack" :class="{ split: step >= 1, read: step >= 2 }">
    <div class="stage">
      <div class="whole">
        <b>One pull request</b>
        <span class="ns-mono">1,020 lines · data, API, wiring and UI</span>
      </div>
      <div v-for="(l, i) in layers" :key="l.name" class="layer" :style="{ '--i': i, viewTransitionName: `ns-layer-${i}` }">
        <span class="no ns-mono">{{ 4 - i }}</span>
        <b>{{ l.name }}</b>
        <span class="ns-mono lines">{{ l.lines }} lines</span>
        <span class="ci"><Icon name="check" /> CI</span>
      </div>
    </div>
    <div class="how down">
      <b>Read top-down</b>
      <span>What is the whole thing for?</span>
    </div>
    <div class="how up">
      <b>Review bottom-up</b>
      <span>Is each layer right on its own?</span>
    </div>
  </div>
</template>

<style scoped>
.stack {
  position: relative;
  height: 500px;
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  gap: 24px;
}

.stage {
  grid-column: 2;
  position: relative;
}

.whole {
  position: absolute;
  inset: 70px 60px 70px 60px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #fff;
  text-align: center;
  transition: opacity 400ms var(--ns-ease);
}

.whole b {
  font-size: 32px;
  letter-spacing: -0.02em;
}

.whole span {
  font-size: 18px;
  color: #d0d0d0;
}

.split .whole {
  opacity: 0;
}

.layer {
  position: absolute;
  left: 60px;
  right: 60px;
  top: calc(70px + var(--i) * 90px);
  height: 90px;
  background: var(--z-ink);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 22px;
  transition:
    transform 900ms var(--ns-ease),
    background 600ms var(--ns-ease),
    box-shadow 900ms var(--ns-ease);
  transition-delay: calc((3 - var(--i)) * 80ms);
}

.layer > * {
  transition: opacity 500ms var(--ns-ease);
  opacity: 0;
}

.split .layer {
  transform: translate(calc((var(--i) - 1.5) * 34px), calc((var(--i) - 1.5) * 26px));
  background: #fff;
  color: var(--z-ink);
  box-shadow: 0 0 0 2px var(--z-ink), 0 18px 30px -18px rgba(26, 26, 26, 0.5);
}

.split .layer > * {
  opacity: 1;
  transition-delay: 500ms;
}

.no {
  font-size: 18px;
  color: var(--ns-teal);
  font-weight: 700;
}

.layer b {
  font-size: 23px;
  flex: 1;
}

.lines {
  font-size: 16px;
  color: var(--z-grey-600);
}

.ci {
  font-size: 16px;
  font-weight: 700;
  color: var(--ns-teal);
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.how {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px 0;
  position: relative;
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
}

.how b {
  font-size: 24px;
  letter-spacing: -0.01em;
}

.how span {
  font-size: 19px;
  line-height: 1.3;
  color: var(--z-ink-800);
}

.how::after {
  content: '';
  position: absolute;
  width: 4px;
  top: 120px;
  bottom: 40px;
  background: var(--z-ink);
}

.how::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-right: 4px solid var(--z-ink);
  border-bottom: 4px solid var(--z-ink);
}

.down {
  grid-column: 1;
  grid-row: 1;
  text-align: right;
  align-items: flex-end;
  justify-content: flex-start;
}

.down::after { right: 12px; }
.down::before { right: 6px; bottom: 40px; transform: rotate(45deg); }

.up {
  grid-column: 3;
  grid-row: 1;
  justify-content: flex-end;
}

.up::after { left: 12px; top: 40px; bottom: 120px; background: var(--ns-teal); }
.up::before { left: 6px; top: 40px; transform: rotate(-135deg); border-color: var(--ns-teal); }
.up b { color: var(--ns-teal); }

.stack:not(.read) .how {
  opacity: 0;
}

.stack:not(.read) .down { transform: translateX(-14px); }
.stack:not(.read) .up { transform: translateX(14px); }
</style>
