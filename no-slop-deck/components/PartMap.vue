<!--
  The agenda: the six parts on the same dark track as the part dividers, so
  the room has seen the map before the first divider zooms into it. Each click
  fills the track through one group, lights its names and shows the question
  each part answers. The arc under verify and review is the per-slice loop,
  drawn as on the dividers.
  0 the track · 1 before code · 2 for each slice and after merge
-->
<script setup lang="ts">
import { gates } from '../lib/gates'

withDefaults(defineProps<{ step?: number }>(), { step: 99 })

// `at` is the click that lights a part; `k` orders the parts within it.
const parts = gates.map((g, i) => ({ ...g, at: i < 3 ? 1 : 2, k: i < 3 ? i : i - 3 }))
const groups = [
  { label: 'Before code', from: 0, span: 3, at: 1 },
  { label: 'For each slice', from: 3, span: 2, at: 2, loop: true },
  { label: 'After merge', from: 5, span: 1, at: 2 },
]
</script>

<template>
  <div class="ns-dark pm">
    <h1>Six places it can go wrong</h1>

    <div class="map">
      <div
        v-for="g in groups" :key="g.label"
        class="group" :class="{ on: step >= g.at }"
        :style="{ '--from': g.from, '--span': g.span }"
      >
        <svg v-if="g.loop" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" /><path d="M18 2.5v4h-4M6 21.5v-4h4" /></svg>
        {{ g.label }}
      </div>

      <!-- Review hands the next slice back to verify. -->
      <span class="arc" :class="{ on: step >= 2 }" aria-hidden="true" />
      <span class="arc-label ns-mono" :class="{ on: step >= 2 }">next slice</span>

      <i
        v-for="i in 5" :key="'seg' + i"
        class="seg" :class="{ on: step >= parts[i].at }"
        :style="{ '--i': i - 1, '--k': parts[i].k }"
      />

      <div
        v-for="(p, i) in parts" :key="p.name"
        class="part" :class="{ on: step >= p.at }"
        :style="{ '--i': i, '--k': p.k }"
      >
        <b class="w">{{ p.name }}</b>
        <span class="node" aria-hidden="true"><i class="dot" /></span>
        <p>{{ p.q }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pm {
  --col: calc(1136px / 6);
  --live: var(--ns-frozen);
  --ok: var(--z-teal-300);
  --track: #3d3d3d;
  --arc: #666;
}

h1 {
  position: absolute;
  left: 72px;
  top: 50px;
  margin: 0;
  font-family: var(--z-font-display);
  font-size: 42px;
  line-height: 1.06;
  font-weight: var(--z-display-weight);
  letter-spacing: var(--z-display-tracking);
  color: #fff;
}

.map {
  position: absolute;
  left: 72px;
  top: 0;
  width: 1136px;
  height: 720px;
}

/* ---------- Groups ---------- */

.group {
  position: absolute;
  top: 190px;
  left: calc(var(--from) * var(--col) + 10px);
  width: calc(var(--span) * var(--col) - 20px);
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4a4a4a;
  font-size: 20px;
  font-weight: 700;
  color: #6f6f6f;
  transition: color 600ms var(--ns-ease), border-color 600ms var(--ns-ease);
}

.group.on {
  color: #fff;
  border-color: var(--ok);
}

.group svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* As on the dividers: an arc under the track from review back to verify,
   arrow pointing up into verify, labelled underneath. */
.arc {
  position: absolute;
  top: 362px;
  left: calc(3.5 * var(--col));
  width: var(--col);
  height: 28px;
  border: 0 solid var(--arc);
  border-width: 0 2px 2px;
  border-radius: 0 0 14px 14px;
  transition: border-color 600ms var(--ns-ease) 700ms;
}

.arc::before {
  content: '';
  position: absolute;
  left: -6px;
  top: -1px;
  width: 10px;
  height: 10px;
  border: 0 solid var(--arc);
  border-width: 2px 0 0 2px;
  transform: rotate(45deg);
  transition: border-color 600ms var(--ns-ease) 700ms;
}

.arc.on,
.arc.on::before {
  border-color: var(--ok);
}

.arc-label {
  position: absolute;
  top: 398px;
  left: calc(4 * var(--col));
  transform: translateX(-50%);
  font-size: 18px;
  line-height: 22px;
  color: #8f8f8f;
  transition: color 600ms var(--ns-ease) 700ms;
}

.arc-label.on {
  color: #d4d4d4;
}

/* ---------- Track ----------
   The track runs through the node centres at y 340, one segment between
   each pair of parts, filling left to right. */

.seg {
  position: absolute;
  top: 338px;
  left: calc((var(--i) + 0.5) * var(--col));
  width: var(--col);
  height: 4px;
  background: var(--track);
}

.seg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ok);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 260ms linear;
  transition-delay: calc(var(--k) * 260ms);
}

.seg.on::after {
  transform: scaleX(1);
}

/* ---------- Parts ---------- */

.part {
  position: absolute;
  top: 270px;
  left: calc(var(--i) * var(--col));
  width: var(--col);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.w {
  font-family: var(--z-font-display);
  font-size: 34px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.02em;
  white-space: nowrap;
  color: #5a5a5a;
  transition: color 600ms var(--ns-ease);
  transition-delay: calc(var(--k) * 260ms + 150ms);
}

.node {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-top: 22px;
  border-radius: 50%;
  background: var(--z-ink);
  box-shadow: inset 0 0 0 3px #4a4a4a;
  transition: box-shadow 400ms var(--ns-ease);
  transition-delay: calc(var(--k) * 260ms + 150ms);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--live);
  opacity: 0;
  transition: opacity 300ms var(--ns-ease);
  transition-delay: inherit;
}

.part p {
  margin: 104px 0 0;
  max-width: 180px;
  font-size: 21px;
  line-height: 1.3;
  color: #d4d4d4;
  text-wrap: balance;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
  transition-delay: calc(var(--k) * 260ms + 250ms);
}

.part.on .w { color: #fff; }
.part.on .node { box-shadow: inset 0 0 0 3px var(--live); }
.part.on .dot { opacity: 1; }

.part.on p {
  opacity: 1;
  transform: none;
}
</style>
