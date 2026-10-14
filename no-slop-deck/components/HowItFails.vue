<!--
  Opens each part: how agent work goes wrong at this gate, what it looks like
  when it happens, and the practice the part goes on to show.
  0 failures and what you'd see · 1 the fixes
-->
<script setup lang="ts">
import { computed } from 'vue'
import { failures } from '../lib/failures'

const props = withDefaults(defineProps<{ gate: number, step?: number }>(), { step: 99 })
const rows = computed(() => failures[props.gate])
</script>

<template>
  <div class="hf" :class="{ three: rows.length > 2 }">
    <div class="labels">
      <span>How it goes wrong</span>
      <span>What you see</span>
      <span class="fx" :class="{ on: step >= 1 }">What we do about it</span>
    </div>
    <div v-for="r in rows" :key="r.name" class="row">
      <b class="name"><Icon name="x" />{{ r.name }}</b>
      <p class="seen ns-mono">{{ r.seen }}</p>
      <p class="fix" :class="{ on: step >= 1 }"><Icon name="arrow" />{{ r.fix }}</p>
    </div>
  </div>
</template>

<style scoped>
.hf {
  height: 510px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.labels,
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 26px;
}

.labels span {
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
  padding-bottom: 8px;
  border-bottom: 2px solid var(--z-ink);
  transition: opacity 500ms var(--ns-ease);
}

.labels .fx {
  color: var(--ns-teal);
  border-color: var(--ns-teal);
}

.labels .fx:not(.on) {
  opacity: 0;
}

.row {
  flex: 1;
  align-items: stretch;
}

.name {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 0 0 0 16px;
  border-left: 6px solid var(--ns-red);
  font-size: 28px;
  line-height: 1.18;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.name :deep(.ns-icon) {
  font-size: 26px;
  color: var(--ns-red);
}

.seen {
  margin: 0;
  max-width: none;
  display: flex;
  align-items: center;
  padding: 18px 22px;
  background: var(--z-ink);
  color: #ff9d8f;
  font-size: 20px;
  line-height: 1.45;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.fix {
  margin: 0;
  max-width: none;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 18px 20px;
  background: #e6f4f6;
  border-left: 6px solid var(--ns-teal);
  font-size: 23px;
  font-weight: 700;
  line-height: 1.3;
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease), filter 600ms var(--ns-ease);
}

.fix :deep(.ns-icon) {
  font-size: 24px;
  color: var(--ns-teal);
}

.fix:not(.on) {
  opacity: 0;
  transform: translateX(-24px);
  filter: blur(5px);
}

.three .name { font-size: 26px; }
.three .seen { font-size: 19px; padding: 14px 20px; }
.three .fix { font-size: 22px; padding: 14px 18px; }
</style>
