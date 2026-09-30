<!--
  The six gates a change passes through. The agenda uses the light variant:
  1 before any code (deciding the slices included) · 2 the loop for every
  slice · 3 production after merge. Every part divider uses the dark variant
  with the current gate lit.
-->
<script setup lang="ts">
import { useIsActive } from '../lib/active'

const active = useIsActive()
withDefaults(defineProps<{ step?: number, current?: number, variant?: 'light' | 'dark' }>(), { step: 99, current: -1, variant: 'light' })

const gates = [
  { name: 'Research', q: 'What do we actually know?' },
  { name: 'Plan', q: 'Which decision is still open?' },
  { name: 'Slice', q: 'How do we cut the work?' },
  { name: 'Verify', q: 'Which claim did we test?' },
  { name: 'Review', q: 'When do we stop?' },
  { name: 'Production', q: 'What stops a bad rollout?' },
]
</script>

<template>
  <div class="map" :class="`is-${variant}`">
    <div class="groups" v-if="variant === 'light'">
      <div class="grp g1" :class="{ on: step >= 1 }">Before any code</div>
      <div class="grp g2" :class="{ on: step >= 2 }">For every slice: build it, then</div>
      <div class="grp g3" :class="{ on: step >= 3 }">After merge</div>
    </div>
    <svg v-if="variant === 'light'" class="loop" :class="{ on: step >= 2 }" viewBox="0 0 1136 56" aria-hidden="true">
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
        :class="{
          on: variant === 'dark' || step >= (i < 3 ? 1 : i < 5 ? 2 : 3),
          past: variant === 'dark' && i < current,
          now: i === current,
        }"
        :style="{ '--i': i }"
      >
        <div class="frame"><span class="name">{{ g.name }}</span></div>
        <div class="q" v-if="variant === 'light'">{{ g.q }}</div>
      </div>
      <div v-if="variant === 'dark' && current >= 0" class="token" :class="{ go: active }" :style="{ '--to': current }" />
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

/* Dark: a corridor of gates seen from above, the current one lit. */
.is-dark .floor {
  transform: perspective(1100px) rotateX(38deg);
  transform-origin: 50% 100%;
  gap: 22px;
}

.is-dark .frame {
  height: 180px;
  border-color: #4a4a4a;
  background: transparent;
  padding: 12px 0 0 14px;
  align-items: flex-start;
}

.is-dark .frame::after {
  background: #4a4a4a;
}

.is-dark .name {
  color: #7a7a7a;
  font-size: 20px;
}

.is-dark .past .frame {
  border-color: var(--z-teal);
}

.is-dark .past .frame::after {
  background: var(--z-teal);
}

.is-dark .past .name {
  color: var(--z-teal-300);
}

.is-dark .now .frame {
  border-color: var(--ns-frozen);
  background: linear-gradient(to top, rgba(5, 195, 222, 0.28), rgba(5, 195, 222, 0.02));
}

.is-dark .now .frame::after {
  background: var(--ns-frozen);
}

.is-dark .now .name {
  color: #fff;
}

.token {
  position: absolute;
  bottom: 12px;
  width: 22px;
  height: 22px;
  background: #fff;
  left: calc((100% + 22px) / 6 * var(--to) + (100% + 22px) / 12 - 22px);
  opacity: 0;
}

.token.go {
  animation: walk 1.4s var(--ns-ease) both 0.7s;
}

@keyframes walk {
  from {
    transform: translateX(calc((100% + 0px) * -9));
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .token.go { animation: none; opacity: 1; }
}
</style>
