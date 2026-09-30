<!--
  The fair counterargument: teams already review less by hand.
  1 people who keep reading · 2 teams that automate approval · 3 what they share
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const teams = [
  { who: 'Dillon Mulroy', what: 'Reads every generated line. Keeps PRs at 300 to 800 lines.', x: 0.05, up: true, g: 1 },
  { who: 'Spotify', what: 'Merged changes doubled. Kept its size thresholds anyway.', x: 0.22, up: false, g: 1 },
  { who: 'Honeycomb', what: 'Team plan reviews for big tickets. Relaxed for small ones.', x: 0.41, up: true, g: 1 },
  { who: 'Uber', what: 'Scores review bots on precision, recall, cost and noise.', x: 0.62, up: false, g: 2 },
  { who: 'Intercom', what: '19% of PRs approved by AI. Narrow changes only.', x: 0.77, up: true, g: 2 },
  { who: 'OpenAI', what: 'Human review optional. Linters and structural tests hold the line.', x: 0.95, up: false, g: 2 },
]
const W = 1136
const CW = 270
const left = (x: number) => Math.min(Math.max(x * W - CW / 2, 0), W - CW)
</script>

<template>
  <div class="dial">
    <div class="axis" />
    <div class="ends">
      <span>More reading by hand</span>
      <span>More approval by machine</span>
    </div>
    <div
      v-for="t in teams" :key="t.who" class="team" :class="{ up: t.up, on: step >= t.g }"
      :style="{ left: left(t.x) + 'px', '--px': (t.x * W - left(t.x)) + 'px' }"
    >
      <b>{{ t.who }}</b>
      <span>{{ t.what }}</span>
    </div>
    <div v-for="t in teams" :key="t.who + 'd'" class="pin" :class="{ on: step >= t.g, g2: t.g === 2 }" :style="{ left: t.x * W + 'px' }" />
    <p class="take" :class="{ on: step >= 3 }">Every team that reads less by hand checks more by machine.</p>
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
  font-size: 17px;
  font-weight: 700;
  color: var(--z-grey-600);
}

.ends span:last-child {
  color: var(--ns-teal);
}

.team {
  position: absolute;
  width: 270px;
  top: 250px;
  padding: 14px 16px;
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
  font-size: 18px;
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
