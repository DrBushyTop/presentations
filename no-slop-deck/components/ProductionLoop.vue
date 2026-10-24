<!--
  The two review loops from the review part, with a third loop around them
  that runs through production and feeds back to the agent.
  0 the two review loops, faint · 1 the production loop · 2 a miss becomes a rule
-->
<script setup lang="ts">
import { useIsActive } from '../lib/active'

withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const active = useIsActive()

const C = { x: 290, y: 250 }
const R1 = 70
const R2 = 138
const R3 = 214

const ring = (r: number) => `M${C.x - r},${C.y} a${r},${r} 0 1,1 ${2 * r},0 a${r},${r} 0 1,1 ${-2 * r},0`
const at = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a) }
}

const prod = [
  { label: 'Ships behind a flag', deg: 300, anchor: 'start' },
  { label: 'Real use', deg: 20, anchor: 'start' },
  { label: 'Signal, bug report', deg: 120, anchor: 'end' },
  { label: 'Back to the agent', deg: 240, anchor: 'end' },
].map(s => {
  const p = at(R3, s.deg)
  const l = at(R3 + 24, s.deg)
  return { ...s, ...p, lx: l.x, ly: l.y + 6 }
})

// The feedback arrow: from the production loop's last stop into the inner loop.
const from = at(R3 - 14, 240)
const to = at(R1 + 14, 240)
</script>

<template>
  <div class="pl">
    <svg viewBox="0 0 600 500" class="rings" aria-hidden="true">
      <defs>
        <marker id="pl-a" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" /></marker>
      </defs>
      <g class="review">
        <path :d="ring(R2)" class="track pr" />
        <path :d="ring(R1)" class="track in" />
        <text :x="C.x" :y="C.y + 6" text-anchor="middle" class="lbl in">Your machine</text>
        <text :x="C.x" :y="C.y - R2 + 32" text-anchor="middle" class="lbl pr">The PR</text>
        <circle r="8" class="tok in" :cx="active ? 0 : C.x - R1" :cy="active ? 0 : C.y">
          <animateMotion v-if="active" dur="2.4s" repeatCount="indefinite" :path="ring(R1)" />
        </circle>
        <circle r="9" class="tok pr" :cx="active ? 0 : C.x - R2" :cy="active ? 0 : C.y">
          <animateMotion v-if="active" dur="6s" repeatCount="indefinite" :path="ring(R2)" />
        </circle>
      </g>

      <g class="prod" :class="{ on: step >= 1 }">
        <path :d="ring(R3)" class="track out" />
        <g v-for="s in prod" :key="s.label">
          <circle :cx="s.x" :cy="s.y" r="10" class="stop" />
          <text :x="s.lx" :y="s.ly" :text-anchor="s.anchor" class="lbl">{{ s.label }}</text>
        </g>
        <circle r="11" class="tok out" :cx="active && step >= 1 ? 0 : C.x - R3" :cy="active && step >= 1 ? 0 : C.y">
          <animateMotion v-if="active && step >= 1" dur="12s" repeatCount="indefinite" :path="ring(R3)" />
        </circle>
      </g>

      <path class="back" :class="{ on: step >= 2 }" :d="`M${from.x},${from.y} L${to.x},${to.y}`" marker-end="url(#pl-a)" />
    </svg>

    <div class="copy">
      <div class="blk now">
        <b>Review stops at merge</b>
        <span>Both loops end before a user touches the change.</span>
      </div>
      <div class="blk prod-copy" :class="{ on: step >= 1 }">
        <b>A third loop runs through production</b>
        <span>Signals and bug reports go back to the agent, not to you.</span>
      </div>
      <div class="blk take" :class="{ on: step >= 2 }">
        A miss in production becomes a rule, a skill or a check.
      </div>
    </div>
  </div>
</template>

<style scoped>
.pl {
  display: grid;
  grid-template-columns: 620px 1fr;
  gap: 24px;
  height: 510px;
}

.rings {
  width: 600px;
  height: 500px;
  overflow: visible;
}

.track {
  fill: none;
  stroke-width: 10;
}

.track.in { stroke: var(--z-teal-100); }
.track.pr { stroke: var(--ns-line); }
.track.out { stroke: #ffd2c9; }

.review {
  transition: opacity 700ms var(--ns-ease);
}

.stop {
  fill: #fff;
  stroke: var(--ns-red);
  stroke-width: 3;
}

.lbl {
  font-family: var(--z-font-text);
  font-size: 18px;
  font-weight: 700;
  fill: var(--z-ink);
}

.lbl.in { fill: var(--ns-teal); font-size: var(--ns-label); }
.lbl.pr { fill: var(--z-grey-600); font-size: var(--ns-label); }

.tok.in { fill: var(--ns-teal); }
.tok.pr { fill: var(--z-grey-600); }
.tok.out { fill: var(--ns-red); }

.prod,
.back {
  transition: opacity 700ms var(--ns-ease);
}

.prod:not(.on),
.back:not(.on) {
  opacity: 0;
}

.back {
  stroke: var(--z-ink);
  stroke-width: 5;
  stroke-dasharray: 10 8;
  fill: none;
}

.back marker path,
#pl-a path {
  fill: var(--z-ink);
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

.blk.prod-copy b {
  color: var(--ns-red);
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

.blk:not(.now):not(.on) {
  opacity: 0;
  transform: translateX(18px);
}
</style>
