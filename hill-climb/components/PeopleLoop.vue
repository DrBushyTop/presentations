<!--
  The next loop: as automated as before, with real input. User feedback writes
  the council's brief and its score sheet, the council climbs on its own, and
  a study checks the end. Clicks: the inputs, the loop, the final check.
  A bet, not a result.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { motion } from 'motion-v'
import { useStage, useTicker } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { active, entered, still, ease } = useStage()

const rows = ['A first-time user captures a moment', 'Every chart reads at a glance', '“Where am I?” is always answerable']

// The council loop from "One round", smaller, with short station names.
const stations = ['Score', 'Brief', 'Build', 'Land', 'Check']
const LX = 590
const LW = 330
const CX = 165
const CY = 277
const R = 112
const at = (i: number) => {
  const a = -Math.PI / 2 + (i / stations.length) * Math.PI * 2
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)]
}
const running = computed(() => entered.value && props.step >= 1)
const here = ref(0)
useTicker(() => active.value && props.step >= 1, 620, () => { here.value = (here.value + 1) % stations.length })
const dot = computed(() => at(here.value))
const done = computed(() => entered.value && props.step >= 2)

// Stage coordinates for the wires.
const curve = (x1: number, y1: number, x2: number, y2: number) => `M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`
const BRIEF_Y = 112
const SHEET_Y = 380
// In and out of the loop between stations, clear of their labels.
const IN_Y = CY + 41
const edge = Math.sqrt(R * R - 41 * 41)
const wires = [
  { d: curve(236, CY, 266, BRIEF_Y), at: 0, c: 'var(--z-teal)' },
  { d: curve(236, CY, 266, SHEET_Y), at: 0, c: 'var(--z-teal)' },
  { d: curve(566, BRIEF_Y, LX + CX - edge - 10, IN_Y), at: 1, c: 'var(--z-ink)' },
  { d: curve(566, SHEET_Y, LX + CX - edge - 10, IN_Y), at: 1, c: 'var(--z-ink)' },
  { d: `M${LX + CX + edge + 10} ${IN_Y} H954`, at: 2, c: 'var(--z-ink)' },
]
const drawn = (n: number) => entered.value && props.step >= n
</script>

<template>
  <div class="hc-stage pl">
    <svg viewBox="0 0 1136 554" class="wires" aria-hidden="true">
      <motion.path
        v-for="(w, i) in wires" :key="i" :d="w.d" fill="none" :stroke="w.c" stroke-width="3" stroke-linecap="round"
        :initial="{ pathLength: still ? 1 : 0, opacity: still ? 1 : 0 }" :animate="{ pathLength: drawn(w.at) ? 1 : 0, opacity: drawn(w.at) ? 1 : 0 }"
        :transition="ease(0.7, { delay: still ? 0 : 0.25 + (i % 2) * 0.12 })"
      />
    </svg>

    <Rise class="fb">
      <p class="tag">From the study</p>
      <h3>Real user feedback</h3>
      <p class="big"><b class="hc-num">10</b> failures</p>
      <p class="sub">With session evidence, and what people valued</p>
    </Rise>

    <Rise class="card brief" :delay="0.35" :style="{ top: `${BRIEF_Y - 82}px` }">
      <h4>Council’s brief</h4>
      <p class="sub">The failures, not a tweet and a feature list</p>
    </Rise>
    <Rise class="card sheet" :delay="0.5" :style="{ top: `${SHEET_Y - 142}px` }">
      <h4>Score sheet</h4>
      <p class="sub">Not the council’s own rubric</p>
      <ul>
        <li v-for="r in rows" :key="r"><i />{{ r }}</li>
      </ul>
    </Rise>

    <svg :viewBox="`0 0 ${LW} 554`" class="loop" :style="{ left: `${LX}px`, width: `${LW}px` }" aria-hidden="true">
      <motion.g :initial="false" :animate="{ opacity: running ? 1 : 0.25 }" :transition="ease(0.5)">
        <text :x="CX" y="104" text-anchor="middle" class="own">Agents only</text>
        <circle :cx="CX" :cy="CY" :r="R" fill="none" stroke="var(--z-grey-200)" stroke-width="2" />
        <g v-for="(s, i) in stations" :key="s">
          <circle :cx="at(i)[0]" :cy="at(i)[1]" r="7" :fill="here === i && running && !still ? 'var(--z-teal)' : 'var(--z-grey-200)'" />
          <text
            :x="at(i)[0] + (i === 0 || i === 4 ? 0 : i < 3 ? 16 : -16)" :y="at(i)[1] + (i === 0 || i === 4 ? -16 : 7)"
            :text-anchor="i === 0 || i === 4 ? 'middle' : i < 3 ? 'start' : 'end'"
            class="st" :class="{ on: here === i && running && !still }"
          >{{ s }}</text>
        </g>
        <motion.circle r="11" fill="var(--z-teal)" :initial="false" :animate="{ cx: dot[0], cy: dot[1] }" :transition="ease(0.5)" />
      </motion.g>
      <motion.g :initial="false" :animate="{ opacity: running ? 1 : 0 }" :transition="ease(0.5, { delay: still ? 0 : 0.4 })">
        <text :x="CX" :y="CY + 14" text-anchor="middle" class="few">A few</text>
        <text :x="CX" :y="CY + 44" text-anchor="middle" class="rl">rounds, not 23</text>
        <text :x="CX" :y="CY + R + 64" text-anchor="middle" class="bet">The bet: the right hill</text>
      </motion.g>
    </svg>

    <Rise :on="step >= 2" class="study" :x="20" :y="0" :delay="0.5">
      <h4>Study at the end</h4>
      <p>People check the result</p>
    </Rise>
  </div>
</template>

<style scoped>
.pl { position: absolute; }
.wires { position: absolute; inset: 0; width: 100%; height: 100%; }
.fb { position: absolute; left: 0; top: 77px; width: 236px; height: 400px; padding: 26px 22px; border-radius: 14px; background: var(--z-teal); color: #fff; display: flex; flex-direction: column; justify-content: center; }
.tag { margin: 0; font-size: 18px; font-weight: 700; color: var(--z-teal-100); }
.fb h3 { margin: 4px 0 18px; font-size: 30px; line-height: 1.1; color: #fff; }
.big { margin: 0; font-size: 26px; font-weight: 700; }
.big b { font-size: 76px; line-height: 1; }
.fb .sub { margin: 10px 0 0; font-size: 19px; line-height: 1.25; color: #e6f7f9; }
.card { position: absolute; left: 266px; width: 300px; padding: 20px 22px; border-radius: 14px; background: var(--hc-soft); }
.brief { height: 164px; display: flex; flex-direction: column; justify-content: center; }
.sheet { height: 284px; }
h4 { margin: 0; font: 700 28px/1.1 var(--z-font-text); letter-spacing: normal; text-transform: none; color: var(--z-ink); }
.card .sub { margin: 6px 0 0; font-size: 19px; line-height: 1.25; color: var(--z-grey-600); }
ul { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 10px; }
li { padding: 0; margin: 0; }
li::before { content: none; display: none; }
li { display: flex; gap: 10px; align-items: flex-start; font-size: 18px; line-height: 1.22; color: var(--z-ink); }
li i { flex: none; width: 18px; height: 18px; margin-top: 2px; border: 3px solid var(--z-teal); border-radius: 4px; box-sizing: border-box; }
.loop { position: absolute; top: 0; height: 100%; overflow: visible; }
.own { font: 700 22px var(--z-font-text); fill: var(--z-ink); }
.st { font: 500 18px var(--z-font-text); fill: var(--z-grey-600); }
.st.on { fill: var(--z-ink); font-weight: 700; }
.few { font: 800 50px var(--z-font-display); fill: var(--z-teal); letter-spacing: -0.02em; }
.rl { font: 500 19px var(--z-font-text); fill: var(--z-grey-600); }
.bet { font: 700 21px var(--z-font-text); fill: var(--z-teal); }
.study { position: absolute; left: 954px; width: 182px; top: 187px; height: 180px; padding: 22px 20px; border-radius: 14px; background: var(--z-ink); display: flex; flex-direction: column; justify-content: center; }
.study h4 { color: #fff; }
.study p { margin: 8px 0 0; font-size: 19px; line-height: 1.25; color: #d9d9d6; }
</style>
