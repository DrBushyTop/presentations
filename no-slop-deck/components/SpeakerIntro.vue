<!--
  Speaker intro. Name and photo on top, then three lanes on one time axis
  from 2014 to now: years on Azure, years as an MVP, and every post on
  huuhka.net as a dot, stacked per quarter. Dots tagged AI on the blog are
  frozen blue. On entry the bars draw in and the dots follow the sweep.
  Outside the live slide (overview, print) it shows the final state.
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useIsActive } from '../lib/active'

const active = useIsActive()
const { $renderContext } = useSlideContext()
const still = computed(() => !['slide', 'presenter'].includes($renderContext.value as string))

const go = ref(false)
watch(active, (on) => {
  if (!on) { go.value = false; return }
  requestAnimationFrame(() => requestAnimationFrame(() => { go.value = true }))
}, { immediate: true })
const on = computed(() => go.value || still.value)

// Every post listed on https://www.huuhka.net (55 on 3 Oct 2026).
// "ai" marks posts listed on https://www.huuhka.net/tag/ai/ (16).
const posts: [string, boolean?][] = [
  ['2019-11-12'], ['2019-11-20'],
  ['2020-01-25'], ['2020-02-03'], ['2020-02-12'], ['2020-02-25'], ['2020-03-13'],
  ['2020-03-17'], ['2020-03-28'], ['2020-04-28'], ['2020-05-03'], ['2020-05-22'],
  ['2020-05-31'], ['2020-06-06'], ['2020-09-04'], ['2020-09-10'], ['2020-12-08'],
  ['2022-01-04'],
  ['2023-02-19'], ['2023-03-04'], ['2023-03-07'], ['2023-03-19'],
  ['2024-01-17'], ['2024-02-01'], ['2024-03-03'], ['2024-03-12'], ['2024-03-17'],
  ['2024-03-19'], ['2024-11-01'],
  ['2025-01-12'], ['2025-01-20'], ['2025-02-16'], ['2025-02-17'], ['2025-02-20'],
  ['2025-02-23'], ['2025-02-26'], ['2025-03-01', true], ['2025-07-13', true],
  ['2025-11-23', true], ['2025-12-07'], ['2025-12-17', true], ['2025-12-21', true],
  ['2026-01-13'], ['2026-01-15', true], ['2026-01-16', true], ['2026-01-28', true],
  ['2026-01-28'], ['2026-02-08', true], ['2026-02-10', true], ['2026-02-20', true],
  ['2026-02-22', true], ['2026-02-25', true], ['2026-03-01', true], ['2026-03-07', true],
  ['2026-03-11', true],
]

// Chart geometry in canvas pixels. The track starts under the name.
const W = 848
const START = 2014
const END = 2027
const NOW = 2026.76
const x = (t: number) => ((t - START) / (END - START)) * W
const qw = W / ((END - START) * 4)

const ROW = { azure: 0, mvp: 78, posts: 156 }
const BAR = 36
const POSTS_H = 150
const BASE = ROW.posts + POSTS_H
const H = BASE + 34
const PITCH = 11.2
const R = 4.6

const dots = computed(() => {
  const stacks = new Map<number, number>()
  return posts.map(([d, ai]) => {
    const [y, m] = d.split('-').map(Number)
    const q = (y - START) * 4 + Math.floor((m - 1) / 3)
    const n = stacks.get(q) ?? 0
    stacks.set(q, n + 1)
    const cx = q * qw + qw / 2
    return { cx, cy: BASE - 8 - n * PITCH, ai: !!ai, delay: 300 + (cx / W) * 1300 }
  })
})

const years = Array.from({ length: END - START }, (_, i) => START + i)
const strong = new Set([2014, 2020, 2026])
</script>

<template>
  <div class="ns-dark intro" :class="{ go: on, still }">
    <img class="photo" src="/pasi.jpg" alt="Pasi Huuhka">

    <div class="who">
      <p class="cmd ns-mono">$ whoami</p>
      <h1>Pasi Huuhka</h1>
      <p class="role">DevOps Architect · Zure</p>
      <p class="links ns-mono">huuhka.net · linkedin.com/in/pasihuuhka</p>
    </div>

    <div class="labels">
      <div class="lab" :style="{ top: ROW.azure + 'px' }">
        <b>2014</b><span>started on Azure</span>
      </div>
      <div class="lab" :style="{ top: ROW.mvp + 'px' }">
        <b>2020</b><span>Microsoft MVP</span>
      </div>
      <div class="lab is-posts" :style="{ top: ROW.posts + 'px', height: POSTS_H + 'px' }">
        <b>55</b><span>blog posts</span>
        <span class="legend"><i />16 tagged AI</span>
      </div>
    </div>

    <svg class="chart" :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`" aria-label="Timeline from 2014 to 2026">
      <g class="grid">
        <line v-for="yr in years" :key="yr" :x1="x(yr)" :x2="x(yr)" y1="0" :y2="BASE" />
      </g>

      <g class="bar is-azure">
        <rect :x="0" :y="ROW.azure + 4" :width="x(NOW)" :height="BAR" />
        <text :x="x(NOW) - 16" :y="ROW.azure + 4 + BAR / 2" text-anchor="end" dominant-baseline="central">150+ customers</text>
      </g>
      <g class="bar is-mvp">
        <rect :x="x(2020 + 5 / 12)" :y="ROW.mvp + 4" :width="x(NOW) - x(2020 + 5 / 12)" :height="BAR" />
      </g>

      <g class="dots">
        <circle
          v-for="(d, i) in dots" :key="i"
          :cx="d.cx" :cy="d.cy" :r="R"
          :class="{ 'is-ai': d.ai }"
          :style="{ transitionDelay: d.delay + 'ms' }"
        />
      </g>

      <line class="axis" x1="0" :x2="W" :y1="BASE" :y2="BASE" />
      <line class="now" :x1="x(NOW)" :x2="x(NOW)" y1="-6" :y2="BASE + 6" />
      <text
        v-for="yr in years" :key="'t' + yr"
        class="year ns-mono" :class="{ 'is-strong': strong.has(yr) }"
        :x="x(yr + 0.5)" :y="BASE + 24" text-anchor="middle"
      >{{ yr }}</text>
    </svg>
  </div>
</template>

<style scoped>
.intro {
  --track: 360px;
  --top: 336px;
}

/* ---------- Header ---------- */

.photo {
  position: absolute;
  left: 72px;
  top: 40px;
  width: 260px;
  height: 260px;
  object-fit: cover;
  -webkit-mask-image: radial-gradient(circle at 50% 42%, #000 56%, transparent 71%);
  mask-image: radial-gradient(circle at 50% 42%, #000 56%, transparent 71%);
}

.who {
  position: absolute;
  left: var(--track);
  top: 40px;
  height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cmd {
  margin: 0 0 6px;
  font-size: 20px;
  color: var(--ns-frozen);
}

h1 {
  font-family: var(--z-font-display);
  font-size: 96px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.045em;
  color: #fff;
  margin: 0 0 14px;
}

.role {
  margin: 0 0 6px;
  font-size: 28px;
  font-weight: 600;
  color: #e6e6e6;
}

.links {
  margin: 0;
  font-size: 18px;
  color: #8f8f8f;
}

/* ---------- Lane labels ---------- */

.labels {
  position: absolute;
  left: 72px;
  top: var(--top);
  width: 260px;
}

.lab {
  position: absolute;
  left: 0;
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.lab b {
  font-family: var(--z-font-display);
  font-size: 52px;
  line-height: 44px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #fff;
}

.lab span {
  font-size: 19px;
  line-height: 1.2;
  color: #cfcfcf;
}

.lab.is-posts {
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 6px;
  padding-bottom: 0;
}

.lab.is-posts b {
  font-size: 84px;
  line-height: 72px;
}

.legend {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  color: var(--ns-frozen) !important;
  font-weight: 700;
}

.legend i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--ns-frozen);
}

/* ---------- Chart ---------- */

.chart {
  position: absolute;
  left: var(--track);
  top: var(--top);
  overflow: visible;
}

.grid line {
  stroke: #2c2c2c;
  stroke-width: 1;
}

.bar rect {
  transform-box: fill-box;
  transform-origin: 0 50%;
  transition: transform 1400ms var(--ns-ease) 300ms;
}

.is-azure rect {
  fill: var(--z-teal);
}

.is-mvp rect {
  fill: var(--z-teal-300);
  transition-delay: 1000ms;
}

.intro:not(.go) .bar rect {
  transform: scaleX(0);
}

.bar text {
  font-family: var(--z-font-display);
  font-size: 22px;
  font-weight: 800;
  fill: #fff;
  transition: opacity 600ms var(--ns-ease) 1500ms;
}

.intro:not(.go) .bar text {
  opacity: 0;
}

.dots circle {
  fill: #6a6a6a;
  transition: opacity 400ms var(--ns-ease);
}

.dots circle.is-ai {
  fill: var(--ns-frozen);
}

.intro:not(.go) .dots circle {
  opacity: 0;
}

.axis {
  stroke: #555;
  stroke-width: 2;
}

.now {
  stroke: var(--ns-frozen);
  stroke-width: 2;
  stroke-dasharray: 4 5;
}

.year {
  font-size: 16px;
  fill: #6f6f6f;
}

.year.is-strong {
  fill: #fff;
  font-weight: 700;
}

/* ---------- Entrance ---------- */

.photo,
.who,
.labels {
  transition: opacity 700ms var(--ns-ease), transform 900ms var(--ns-ease);
}

.intro:not(.go) .photo,
.intro:not(.go) .who,
.intro:not(.go) .labels {
  opacity: 0;
  transform: translateY(16px);
}

.go .who { transition-delay: 120ms; }
.go .labels { transition-delay: 240ms; }

.still,
.still * {
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .bar rect,
  .photo,
  .who,
  .labels {
    transform: none !important;
  }
}
</style>
