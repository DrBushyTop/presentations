<!--
  The six gates a change passes through, as the agenda:
  1 before any code (deciding the slices included) · 2 the loop for every
  slice · 3 production after merge. Part dividers draw their own corridor.
-->
<script setup lang="ts">
import { gates } from '../lib/gates'

withDefaults(defineProps<{ step?: number }>(), { step: 99 })
</script>

<template>
  <div class="map">
    <div class="groups">
      <div class="grp g1" :class="{ on: step >= 1 }">Before any code</div>
      <div class="grp g2" :class="{ on: step >= 2 }">For every slice: build it, then</div>
      <div class="grp g3" :class="{ on: step >= 3 }">After merge</div>
    </div>
    <svg class="loop" :class="{ on: step >= 2 }" viewBox="0 0 1136 56" aria-hidden="true">
      <defs>
        <marker id="gm-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" />
        </marker>
      </defs>
      <path d="M856,54 C856,6 664,6 664,48" marker-end="url(#gm-arrow)" />
      <text x="760" y="16" text-anchor="middle">next slice</text>
    </svg>
    <div class="floor">
      <div
        v-for="(g, i) in gates" :key="g.name" class="gate"
        :class="{ on: step >= (i < 3 ? 1 : i < 5 ? 2 : 3) }"
        :style="{ '--i': i }"
      >
        <div class="frame"><span class="name">{{ g.name }}</span></div>
        <div class="q">{{ g.q }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map {
  position: relative;
}

.groups {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
}

.g1 { grid-column: 1 / span 3; }
.g2 { grid-column: 4 / span 2; color: var(--ns-teal) !important; border-color: var(--ns-teal) !important; }
.g3 { grid-column: 6; }

.loop {
  display: block;
  width: 100%;
  height: 56px;
  overflow: visible;
  transition: opacity 500ms var(--ns-ease);
}

.loop:not(.on) {
  opacity: 0;
}

.loop path {
  fill: none;
  stroke: var(--ns-teal);
  stroke-width: 4;
}

.loop marker path {
  fill: var(--ns-teal);
  stroke: none;
}

.loop text {
  font-family: var(--z-font-text);
  font-size: var(--ns-label);
  font-weight: 700;
  fill: var(--ns-teal);
  paint-order: stroke;
  stroke: #fff;
  stroke-width: 8px;
}

.grp {
  font-size: 18px;
  font-weight: 700;
  color: var(--z-grey-600);
  border-bottom: 2px solid var(--z-ink);
  padding-bottom: 8px;
  transition: opacity 500ms var(--ns-ease);
}

.grp:not(.on) {
  opacity: 0.25;
}

.floor {
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
}

.gate {
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
  transition-delay: calc(var(--i) % 3 * 90ms);
}

.gate:not(.on) {
  opacity: 0.18;
  transform: translateY(16px);
}

.frame {
  position: relative;
  height: 285px;
  border: 5px solid var(--z-ink);
  border-bottom: 0;
  display: flex;
  align-items: flex-end;
  padding: 0 0 16px 16px;
  background: linear-gradient(to top, var(--ns-soft), #fff 70%);
}

.frame::after {
  content: '';
  position: absolute;
  left: -5px;
  right: -5px;
  bottom: 0;
  height: 5px;
  background: var(--ns-teal);
}

.name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.q {
  margin-top: 14px;
  font-size: 21px;
  line-height: 1.3;
  color: var(--z-ink-800);
  text-wrap: balance;
}
</style>
