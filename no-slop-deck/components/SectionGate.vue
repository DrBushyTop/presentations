<!--
  Part divider drawn as a CI run of the talk. Parts already covered have
  passed with their duration, the current part is running with its log open,
  the rest are queued. Verify and review sit in a "for each slice" group.
  On entry the previous job finishes, the connector fills and the current
  job starts. After that only the spinner moves. Outside the live slide
  (overview, print) it shows the finished state without motion.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useIsActive } from '../lib/active'
import { gates } from '../lib/gates'

const props = defineProps<{ current: number, title: string, question: string }>()
const active = useIsActive()
const { $renderContext } = useSlideContext()
const still = computed(() => !['slide', 'presenter'].includes($renderContext.value as string))

// Slidev often mounts this slide at the moment it becomes active, so start
// the entrance a frame later or the transitions never run.
const go = ref(false)
// The previous job finishes once the page turn has landed, so it's seen.
const settled = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
watch(active, (on) => {
  clearTimeout(timer)
  if (!on) {
    go.value = false
    settled.value = false
    return
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { go.value = true }))
  timer = setTimeout(() => { settled.value = true }, 900)
}, { immediate: true })
onBeforeUnmount(() => clearTimeout(timer))

const on = computed(() => go.value || still.value)
const done = computed(() => settled.value || still.value)

type State = 'done' | 'run' | 'queued'
// Before the entrance, the previous job is still running and this one is queued.
function state(i: number): State {
  if (i < props.current - 1) return 'done'
  if (i === props.current - 1) return done.value ? 'done' : 'run'
  if (i === props.current) return done.value ? 'run' : 'queued'
  return 'queued'
}

const log = computed(() => gates[props.current].stream.filter(l => !l.held).slice(0, 3))
</script>

<template>
  <div class="ns-dark run-slide" :class="{ go: on, still, live: go && !still }">
    <div class="copy">
      <h1>{{ title }}</h1>
      <p>{{ question }}</p>
    </div>

    <section class="run" aria-label="Parts of the talk as a pipeline run">
      <header>
        <span class="ns-mono">talk.yml · The no slop engineer</span>
        <b class="status"><i class="dot" />{{ current + 1 }} of 6 running</b>
      </header>

      <ol class="jobs">
        <li
            v-for="i in [0, 1, 2]" :key="i"
            class="job" :class="['s-' + state(i), { open: i === current }]"
            :aria-current="i === current ? 'step' : undefined"
          >
            <span class="ic" aria-hidden="true">
              <svg v-if="state(i) === 'done'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" class="fill" /><path d="M7 12.5l3.2 3.2L17 9" class="tick" /></svg>
              <svg v-else-if="state(i) === 'run'" viewBox="0 0 24 24" class="spin"><circle cx="12" cy="12" r="9" class="track" /><path d="M12 3a9 9 0 0 1 9 9" class="arc" /></svg>
              <svg v-else viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" class="ring" /></svg>
            </span>
            <b class="name">{{ gates[i].name }}</b>
            <span class="meta ns-mono">{{ state(i) === 'done' ? gates[i].dur : state(i) === 'run' ? 'Running' : 'Queued' }}</span>
            <div v-if="i === current" class="log">
              <div>
                <div v-for="(l, k) in log" :key="k" class="ln ns-mono" :class="{ now: k === log.length - 1 }" :style="{ '--k': k }">
                  <span class="lk">{{ k === log.length - 1 ? '›' : '✓' }}</span>{{ l.t }}
                </div>
              </div>
            </div>
          </li>
        <li class="group">
          <span class="group-label">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" /><path d="M18 2.5v4h-4M6 21.5v-4h4" /></svg>
            For each slice
          </span>
          <ol class="jobs inner">
            <li
            v-for="i in [3, 4]" :key="i"
            class="job" :class="['s-' + state(i), { open: i === current }]"
            :aria-current="i === current ? 'step' : undefined"
          >
            <span class="ic" aria-hidden="true">
              <svg v-if="state(i) === 'done'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" class="fill" /><path d="M7 12.5l3.2 3.2L17 9" class="tick" /></svg>
              <svg v-else-if="state(i) === 'run'" viewBox="0 0 24 24" class="spin"><circle cx="12" cy="12" r="9" class="track" /><path d="M12 3a9 9 0 0 1 9 9" class="arc" /></svg>
              <svg v-else viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" class="ring" /></svg>
            </span>
            <b class="name">{{ gates[i].name }}</b>
            <span class="meta ns-mono">{{ state(i) === 'done' ? gates[i].dur : state(i) === 'run' ? 'Running' : 'Queued' }}</span>
            <div v-if="i === current" class="log">
              <div>
                <div v-for="(l, k) in log" :key="k" class="ln ns-mono" :class="{ now: k === log.length - 1 }" :style="{ '--k': k }">
                  <span class="lk">{{ k === log.length - 1 ? '›' : '✓' }}</span>{{ l.t }}
                </div>
              </div>
            </div>
          </li>
          </ol>
        </li>
        <li
            v-for="i in [5]" :key="i"
            class="job" :class="['s-' + state(i), { open: i === current }]"
            :aria-current="i === current ? 'step' : undefined"
          >
            <span class="ic" aria-hidden="true">
              <svg v-if="state(i) === 'done'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" class="fill" /><path d="M7 12.5l3.2 3.2L17 9" class="tick" /></svg>
              <svg v-else-if="state(i) === 'run'" viewBox="0 0 24 24" class="spin"><circle cx="12" cy="12" r="9" class="track" /><path d="M12 3a9 9 0 0 1 9 9" class="arc" /></svg>
              <svg v-else viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" class="ring" /></svg>
            </span>
            <b class="name">{{ gates[i].name }}</b>
            <span class="meta ns-mono">{{ state(i) === 'done' ? gates[i].dur : state(i) === 'run' ? 'Running' : 'Queued' }}</span>
            <div v-if="i === current" class="log">
              <div>
                <div v-for="(l, k) in log" :key="k" class="ln ns-mono" :class="{ now: k === log.length - 1 }" :style="{ '--k': k }">
                  <span class="lk">{{ k === log.length - 1 ? '›' : '✓' }}</span>{{ l.t }}
                </div>
              </div>
            </div>
          </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.run-slide {
  --ok: var(--z-teal-300);
  --live: var(--ns-frozen);
  --dim: #5a5a5a;
}

/* ---------- Copy ---------- */

.copy {
  position: absolute;
  left: 72px;
  bottom: 76px;
  width: 560px;
}

h1 {
  font-family: var(--z-font-display);
  font-size: 80px;
  line-height: 0.96;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #fff;
  margin: 0 0 26px;
  text-wrap: balance;
}

p {
  font-size: 28px;
  line-height: 1.3;
  color: var(--live);
  font-weight: 600;
  margin: 0;
  max-width: 30ch;
  text-wrap: balance;
}

/* ---------- Run ---------- */

.run {
  position: absolute;
  top: 52px;
  right: 64px;
  bottom: 64px;
  width: 540px;
  display: flex;
  flex-direction: column;
}

.run header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 2px solid #333;
  font-size: 16px;
  color: #8f8f8f;
}

.status {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: var(--live);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--live);
  box-shadow: 0 0 0 4px rgba(5, 195, 222, 0.2);
}

.jobs {
  flex: 1;
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.jobs li {
  margin: 0;
}

.jobs li::before {
  display: none !important;
}

/* The connector: a thick spine through every status icon. */
.job {
  position: relative;
  display: grid;
  grid-template-columns: 34px 1fr auto;
  align-items: center;
  column-gap: 18px;
  padding: 9px 18px;
  margin-bottom: 8px !important;
  background: #262626;
  border: 2px solid #303030;
  transition: background 700ms var(--ns-ease), border-color 700ms var(--ns-ease), box-shadow 700ms var(--ns-ease);
}

.job::after {
  content: '';
  position: absolute;
  left: 36px;
  top: 100%;
  width: 4px;
  height: 10px;
  background: #3a3a3a;
  z-index: 1;
}

.job:last-child::after,
.jobs.inner .job:last-child::after {
  display: none;
}

.group:has(.s-done:last-child)::after {
  background: var(--ok);
}

.group::after {
  content: '';
  position: absolute;
  left: 25px;
  top: 100%;
  width: 4px;
  height: 10px;
  background: #3a3a3a;
}

.job.s-done::after {
  background: var(--ok);
}

.name {
  font-family: var(--z-font-display);
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fff;
  transition: color 600ms var(--ns-ease);
}

.meta {
  font-size: 17px;
  color: #8f8f8f;
}

.s-queued .name {
  color: #6f6f6f;
}

.s-done .meta {
  color: var(--ok);
}

.s-run .meta {
  color: var(--live);
  font-weight: 700;
}

/* Current job: the one moment of colour and size on the slide. */
.job.s-run {
  border-color: var(--live);
  background: linear-gradient(135deg, rgba(5, 195, 222, 0.2), rgba(5, 195, 222, 0.04) 60%), #262626;
  box-shadow: 0 24px 60px -24px rgba(5, 195, 222, 0.55);
}

.job.open .name {
  font-size: 32px;
}

/* Status icons */
.ic svg {
  display: block;
  width: 34px;
  height: 34px;
  overflow: visible;
}

.fill {
  fill: var(--z-teal);
}

.tick {
  fill: none;
  stroke: #fff;
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.track {
  fill: none;
  stroke: rgba(5, 195, 222, 0.25);
  stroke-width: 3;
}

.arc {
  fill: none;
  stroke: var(--live);
  stroke-width: 3;
  stroke-linecap: round;
}

.live .spin {
  animation: spin 1s linear infinite;
  transform-origin: 50% 50%;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ring {
  fill: #262626;
  stroke: var(--dim);
  stroke-width: 3;
  stroke-dasharray: 3 4;
}

/* Log of the running job */
.log {
  grid-column: 2 / -1;
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 900ms var(--ns-ease) 1100ms;
}

.log > div {
  overflow: hidden;
}

.go .open .log {
  grid-template-rows: 1fr;
}

.ln {
  padding-top: 5px;
  font-size: 17px;
  color: #cfcfcf;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 500ms var(--ns-ease);
  transition-delay: calc(1500ms + var(--k) * 260ms);
}

.run-slide:not(.go) .ln {
  opacity: 0;
}

.ln:first-child {
  padding-top: 8px;
}

.lk {
  display: inline-block;
  width: 24px;
  color: var(--ok);
}

.ln.now {
  color: #fff;
}

.ln.now .lk {
  color: var(--live);
}

/* For each slice: verify and review share a dashed frame. */
.group {
  position: relative;
  margin: 0 0 8px !important;
  padding: 0 10px 2px;
  border: 2px dashed #4a4a4a;
}

.group-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  font-size: 16px;
  font-weight: 700;
  color: #a8a8a8;
}

.group-label svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.jobs.inner {
  flex: none;
}

/* ---------- Entrance ---------- */

h1,
p {
  transition: opacity 700ms var(--ns-ease), transform 900ms var(--ns-ease), filter 700ms var(--ns-ease);
}

.run-slide:not(.go) h1,
.run-slide:not(.go) p {
  opacity: 0;
  transform: translateY(24px);
  filter: blur(6px);
}

.go h1 { transition-delay: 450ms; }
.go p { transition-delay: 700ms; }

.still,
.still * {
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .live .spin {
    animation: none;
  }

  .run-slide:not(.go) h1,
  .run-slide:not(.go) p {
    transform: none;
    filter: none;
  }
}
</style>
