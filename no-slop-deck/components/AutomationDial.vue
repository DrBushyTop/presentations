<!--
  The fair counterargument: some teams no longer read every line.
  1 people still approve every change · 2 machines approve some
  3 HumanLayer moved back: from reading only specs in 2025 to reading the code
  4 what the teams that read less share
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

// x: where the pin sits on the axis. left: where the card sits, so that the
// four cards above and the three below never overlap.
const teams = [
  { who: 'Dillon Mulroy', what: 'Reads every line. PRs of 300 to 800 lines.', x: 0.04, left: 0, up: true, g: 1 },
  { who: 'HumanLayer', what: 'Specs only in 2025. Reads the code again.', x: 0.16, left: 50, up: false, g: 3, back: true },
  { who: 'Honeycomb', what: 'Team reviews plans. Auto-approves 0%.', x: 0.27, left: 291, up: true, g: 1 },
  { who: 'Uber', what: 'People approve. Review bots tested on known bugs.', x: 0.42, left: 346, up: false, g: 1 },
  { who: 'Spotify', what: 'Most automated changes merge after checks.', x: 0.6, left: 582, up: true, g: 2 },
  { who: 'Intercom', what: '19% of PRs approved by AI. Narrow ones only.', x: 0.77, left: 744, up: false, g: 2 },
  { who: 'OpenAI', what: 'Review optional. People own the lint rules.', x: 0.95, left: 874, up: true, g: 2 },
]
const W = 1136
const CW = 262
// HumanLayer in July 2025: specs and tickets only, background agents.
const FROM = 0.86
const TO = 0.16
</script>

<template>
  <div class="dial">
    <div class="axis" />
    <div class="ends">
      <span>People read every line</span>
      <span>Machines approve some changes</span>
    </div>
    <svg class="trail" :class="{ on: step >= 3 }" :viewBox="`0 0 ${W} 40`" aria-hidden="true">
      <defs>
        <marker id="ad-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" />
        </marker>
      </defs>
      <path :d="`M${FROM * W - 14},20 L${TO * W + 22},20`" marker-end="url(#ad-arrow)" />
    </svg>
    <div class="ghost" :class="{ on: step >= 3 }" :style="{ left: FROM * W + 'px' }" />
    <span class="was" :class="{ on: step >= 3 }" :style="{ left: FROM * W + 'px' }">2025</span>
    <div
      v-for="t in teams" :key="t.who" class="team" :class="{ up: t.up, on: step >= t.g, back: t.back }"
      :style="{ left: t.left + 'px', '--px': (t.x * W - t.left) + 'px' }"
    >
      <b>{{ t.who }}</b>
      <span>{{ t.what }}</span>
    </div>
    <div
      v-for="t in teams" :key="t.who + 'd'" class="pin"
      :class="{ on: step >= t.g, g2: t.g === 2, back: t.back }" :style="{ left: t.x * W + 'px' }"
    />
    <p class="take" :class="{ on: step >= 4 }">Teams that read less add automated checks and make recovery cheap.</p>
  </div>
</template>

<style scoped>
.dial {
  position: relative;
  height: 510px;
}

.axis {
  position: absolute;
  left: 0;
  right: 0;
  top: 218px;
  height: 6px;
  background: linear-gradient(to right, var(--z-ink), var(--ns-teal));
}

.ends {
  position: absolute;
  left: 0;
  right: 0;
  top: 398px;
  display: flex;
  justify-content: space-between;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
}

.ends span:last-child {
  color: var(--ns-teal);
}

.team {
  position: absolute;
  width: 262px;
  top: 250px;
  padding: 12px 14px;
  background: var(--ns-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
}

.team.up {
  top: 20px;
}

.team:not(.on) {
  opacity: 0;
  transform: translateY(14px);
}

.team.up:not(.on) {
  transform: translateY(-14px);
}

.team::after {
  content: '';
  position: absolute;
  left: var(--px);
  width: 2px;
  background: var(--z-ink);
  top: -32px;
  height: 32px;
}

.team.up::after {
  top: auto;
  bottom: -40px;
  height: 40px;
}

.team b {
  font-size: 22px;
}

.team span {
  font-size: 20px;
  line-height: 1.3;
  color: var(--z-ink-800);
}

.pin {
  position: absolute;
  top: 211px;
  width: 20px;
  height: 20px;
  margin-left: -10px;
  border-radius: 50%;
  background: #fff;
  border: 4px solid var(--z-ink);
  transition: transform 500ms var(--ns-ease), opacity 400ms var(--ns-ease);
}

.pin.g2 {
  border-color: var(--ns-teal);
}

.pin:not(.on) {
  opacity: 0;
  transform: scale(0.4);
}

.team.back {
  background: #fff5f3;
  outline: 2px solid var(--ns-red);
  outline-offset: -2px;
}

.pin.back {
  border-color: var(--ns-red);
}

.trail {
  position: absolute;
  left: 0;
  top: 201px;
  width: 1136px;
  height: 40px;
  overflow: visible;
  transition: opacity 600ms var(--ns-ease);
}

.trail path {
  fill: none;
  stroke: var(--ns-red);
  stroke-width: 4;
  stroke-dasharray: 10 8;
}

.trail marker path {
  fill: var(--ns-red);
  stroke: none;
}

.trail:not(.on),
.ghost:not(.on),
.was:not(.on) {
  opacity: 0;
}

.ghost {
  position: absolute;
  top: 211px;
  width: 20px;
  height: 20px;
  margin-left: -10px;
  border-radius: 50%;
  background: #fff;
  border: 3px dashed var(--ns-red);
  transition: opacity 600ms var(--ns-ease);
}

.was {
  position: absolute;
  top: 178px;
  transform: translateX(-50%);
  font-size: 17px;
  font-weight: 700;
  color: var(--ns-red);
  transition: opacity 600ms var(--ns-ease);
}

.take {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  max-width: none;
  padding: 18px 22px;
  background: var(--z-ink);
  color: #fff;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.01em;
  transition: opacity 600ms var(--ns-ease);
}

.take:not(.on) {
  opacity: 0;
}
</style>
