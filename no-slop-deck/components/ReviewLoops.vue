<!--
  Two review loops. The inner one is local and fast; the outer one is the PR.
  0 inner loop · 1 outer loop · 2 where findings should die
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useIsActive } from '../lib/active'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const active = useIsActive()

const C = { x: 264, y: 250 }
const R1 = 108
const R2 = 200

const ring = (r: number) => `M${C.x - r},${C.y} a${r},${r} 0 1,1 ${2 * r},0 a${r},${r} 0 1,1 ${-2 * r},0`
const at = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a) }
}

const inner = [
  { label: 'Edit', deg: 180 },
  { label: 'Tests', deg: 270 },
  { label: 'Browser', deg: 0 },
  { label: 'Local review', deg: 90 },
].map(s => ({ ...s, ...at(R1, s.deg) }))

const outer = [
  { label: 'Push', deg: 200, anchor: 'end' },
  { label: 'CI', deg: 268, anchor: 'middle' },
  { label: 'Other providers', deg: 328, anchor: 'start' },
  { label: 'Babysitter', deg: 32, anchor: 'start' },
  { label: 'A person merges', deg: 115, anchor: 'end' },
].map(s => {
  const p = at(R2, s.deg)
  const l = at(R2 + 26, s.deg)
  return { ...s, ...p, lx: l.x, ly: l.y + 6 }
})

const running = computed(() => active.value)
</script>

<template>
  <div class="loops">
    <svg viewBox="0 0 600 500" class="rings" aria-hidden="true">
      <g class="outer" :class="{ on: step >= 1 }">
        <path :d="ring(R2)" class="track" />
        <g v-for="s in outer" :key="s.label">
          <circle :cx="s.x" :cy="s.y" r="9" class="stop" />
          <text :x="s.lx" :y="s.ly" :text-anchor="s.anchor" class="lbl">{{ s.label }}</text>
        </g>
        <circle r="11" class="tok slow" :cx="running && step >= 1 ? 0 : C.x - R2" :cy="running && step >= 1 ? 0 : C.y">
          <animateMotion v-if="running && step >= 1" dur="9s" repeatCount="indefinite" :path="ring(R2)" />
        </circle>
      </g>
      <g class="inner">
        <path :d="ring(R1)" class="track in" />
        <g v-for="s in inner" :key="s.label">
          <circle :cx="s.x" :cy="s.y" r="8" class="stop in" />
          <text :x="s.x" :y="s.y + (s.deg === 90 ? -18 : s.deg === 270 ? 30 : 6)" :dx="s.deg === 180 ? 18 : s.deg === 0 ? -18 : 0" :text-anchor="s.deg === 180 ? 'start' : s.deg === 0 ? 'end' : 'middle'" class="lbl in">{{ s.label }}</text>
        </g>
        <circle r="10" class="tok fast" :cx="running ? 0 : C.x - R1" :cy="running ? 0 : C.y">
          <animateMotion v-if="running" dur="2.4s" repeatCount="indefinite" :path="ring(R1)" />
        </circle>
      </g>
    </svg>

    <div class="copy">
      <div class="blk in">
        <b>Inner loop, on your machine</b>
        <span>Seconds per turn. It costs only your attention.</span>
      </div>
      <div class="blk out" :class="{ on: step >= 1 }">
        <b>Outer loop, the pull request</b>
        <span>Minutes per turn. It costs CI time and other people's attention.</span>
      </div>
      <div class="blk take" :class="{ on: step >= 2 }">
        Most findings should die in the inner loop.
      </div>
    </div>
  </div>
</template>

<style scoped>
.loops {
  display: grid;
  grid-template-columns: 620px 1fr;
  gap: 24px;
  height: 500px;
}

.rings {
  width: 600px;
  height: 500px;
  overflow: visible;
}

.track {
  fill: none;
  stroke: var(--ns-line);
  stroke-width: 10;
}

.track.in {
  stroke: var(--z-teal-100);
}

.stop {
  fill: #fff;
  stroke: var(--z-ink);
  stroke-width: 3;
}

.stop.in {
  stroke: var(--ns-teal);
}

.lbl {
  font-family: var(--z-font-text);
  font-size: 17px;
  font-weight: 700;
  fill: var(--z-ink);
}

.lbl.in {
  fill: var(--ns-teal);
  font-size: 16px;
}

.tok.fast {
  fill: var(--ns-teal);
}

.tok.slow {
  fill: var(--z-ink);
}

.outer {
  transition: opacity 700ms var(--ns-ease);
}

.outer:not(.on) {
  opacity: 0;
}

.copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 26px;
}

.blk {
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
}

.blk b {
  font-size: 27px;
  letter-spacing: -0.01em;
}

.blk.in b {
  color: var(--ns-teal);
}

.blk span {
  font-size: 21px;
  line-height: 1.35;
  color: var(--z-ink-800);
}

.blk.take {
  background: var(--z-ink);
  color: #fff;
  padding: 18px 22px;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
}

.blk:not(.in):not(.on) {
  opacity: 0;
  transform: translateX(18px);
}
</style>
