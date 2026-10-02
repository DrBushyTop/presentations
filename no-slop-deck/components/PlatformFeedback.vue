<!--
  Honeycomb's investments around the agent, drawn as the loop a change goes
  through. Fast checks sit on the way out, production feedback on the way
  back, and the repository's shared context in the middle.
  0 the loop and the three investments · 1 a miss becomes a rule · 2 takeaway
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const CX = 250
const C = 220
const R = 165
const at = (deg: number) => [CX + R * Math.cos((deg * Math.PI) / 180), C + R * Math.sin((deg * Math.PI) / 180)]
const stations = [
  { deg: -90, t: 'Agent changes code', k: 'agent' },
  { deg: 0, t: 'Checks run', k: 'inv', n: 1 },
  { deg: 90, t: 'Change ships', k: 'ship' },
  { deg: 180, t: 'Production signal', k: 'inv', n: 3 },
]
const items = [
  { n: 1, t: 'Fast, readable checks', d: 'The agent runs them and fixes what fails.' },
  { n: 2, t: 'Shared working context', d: 'Tickets, tools, and what is shipping.' },
  { n: 3, t: 'Production feedback', d: 'See how the change behaves. Feed it back.' },
]
</script>

<template>
  <div class="fb" :class="`s${Math.min(step, 2)}`">
    <svg class="cycle" viewBox="0 0 500 450" aria-hidden="true">
      <defs>
        <marker id="fb-a" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" /></marker>
      </defs>
      <circle :cx="CX" :cy="C" :r="R" class="track" />
      <path v-for="d in [-45, 45, 135, 225]" :key="d" :d="`M${at(d - 8)[0]},${at(d - 8)[1]} A${R},${R} 0 0 1 ${at(d + 8)[0]},${at(d + 8)[1]}`" class="dir" marker-end="url(#fb-a)" />

      <path class="lesson" :d="`M${at(180)[0] + 24},${C} L${CX - 56},${C}`" />
      <path class="lesson" :d="`M${CX},${C - 56} L${CX},${at(-90)[1] + 24}`" marker-end="url(#fb-a)" />

      <g v-for="s in stations" :key="s.t" class="st" :class="s.k">
        <circle :cx="at(s.deg)[0]" :cy="at(s.deg)[1]" r="16" />
        <text v-if="s.n" :x="at(s.deg)[0]" :y="at(s.deg)[1] + 6" text-anchor="middle" class="num">{{ s.n }}</text>
      </g>

      <circle :cx="CX" :cy="C" r="54" class="hub" />
      <text :x="CX" :y="C + 10" text-anchor="middle" class="num big">2</text>

      <text :x="CX" :y="C - R - 30" text-anchor="middle" class="lbl">Agent changes code</text>
      <text :x="CX" :y="C + R + 46" text-anchor="middle" class="lbl">Change ships</text>
      <text :x="at(0)[0]" :y="C + 52" text-anchor="middle" class="lbl inv">Checks run</text>
      <text :x="at(180)[0]" :y="C + 52" text-anchor="middle" class="lbl inv">Production signal</text>
      <text :x="CX" :y="C + 82" text-anchor="middle" class="lbl miss">A miss becomes</text>
      <text :x="CX" :y="C + 106" text-anchor="middle" class="lbl miss">a rule, skill or check</text>
    </svg>

    <ol class="items">
      <li v-for="it in items" :key="it.n">
        <span class="n ns-mono">{{ it.n }}</span>
        <div><b>{{ it.t }}</b><p>{{ it.d }}</p></div>
      </li>
    </ol>

    <p class="take">Spend some of the new capacity improving the tools.</p>
  </div>
</template>

<style scoped>
.fb {
  position: relative;
  height: 510px;
  display: grid;
  grid-template-columns: 500px 1fr;
  align-items: center;
  grid-template-rows: 1fr auto;
  column-gap: 40px;
  row-gap: 18px;
}

.cycle {
  grid-row: 1;
  width: 470px;
  height: 423px;
  overflow: visible;
}

.track {
  fill: none;
  stroke: #d9d9d6;
  stroke-width: 10;
}

.dir {
  fill: none;
  stroke: var(--z-ink);
  stroke-width: 3;
}

#fb-a path {
  fill: var(--z-ink);
}

.st circle {
  fill: #fff;
  stroke: var(--z-ink);
  stroke-width: 4;
}

.st.inv circle {
  fill: var(--ns-teal);
  stroke: var(--ns-teal);
  r: 22;
}

.num {
  font-family: var(--ns-mono);
  font-size: 20px;
  font-weight: 700;
  fill: #fff;
}

.num.big {
  font-size: 30px;
}

.hub {
  fill: var(--ns-teal);
}

.lesson {
  fill: none;
  stroke: var(--ns-red);
  stroke-width: 4;
  stroke-dasharray: 8 6;
  opacity: 0;
  transition: opacity 500ms var(--ns-ease);
}

.s1 .lesson,
.s2 .lesson {
  opacity: 1;
}

.lbl {
  font-family: var(--z-font-text);
  font-size: 20px;
  font-weight: 700;
  fill: var(--z-ink);
  paint-order: stroke;
  stroke: #fff;
  stroke-width: 8px;
}

.lbl.inv {
  fill: var(--ns-teal);
}

.lbl.miss {
  fill: var(--ns-red);
  font-size: 19px;
  opacity: 0;
  transition: opacity 500ms var(--ns-ease);
}

.s1 .lbl.miss,
.s2 .lbl.miss {
  opacity: 1;
}

.items {
  grid-row: 1;
  grid-column: 2;
  align-self: center;
  list-style: none;
  margin: 0;
  padding: 0;
}

.items li {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 14px;
  margin: 0;
  padding: 18px 0;
  border-top: 2px solid var(--z-ink);
}

.items li::before {
  display: none !important;
}

.items .n {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ns-teal);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

.items b {
  font-size: 25px;
}

.items p {
  margin: 4px 0 0;
  max-width: none;
  font-size: 21px;
  line-height: 1.3;
  color: var(--z-ink-800);
}

.take {
  grid-column: 1 / -1;
  margin: 0;
  max-width: none;
  padding: 16px 22px;
  background: var(--z-ink);
  color: #fff;
  font-size: 25px;
  font-weight: 800;
  transition: opacity 500ms var(--ns-ease);
}

.s0 .take,
.s1 .take {
  opacity: 0;
}
</style>
