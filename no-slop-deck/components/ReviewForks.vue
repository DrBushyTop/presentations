<!--
  Inside the review step of the previous slide. The implementer hands one
  reviewer the issue, the decisions and the diff. The reviewer reads the files
  the change touches, then forks itself: each fork starts from the reviewer's
  whole context, read from the prompt cache, and gets one lens. Each fork reads
  a few files of its own, then sends findings back. The reviewer merges
  duplicates and sends one summary to the implementer. The implementer itself
  is never drawn.
  0 the handoff · 1 the reviewer reads · 2 it forks · 3 the forks read and report, one summary goes out · 4 what the shared reading costs
-->
<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const reads = [
  { k: 'Read', t: 'sdk/states.ts' },
  { k: 'Read', t: 'app/router.ts' },
  { k: 'Read', t: 'states.spec.ts' },
  { k: 'Search', t: 'onTaskStart callers' },
]

const forks = [
  { lens: 'Functional', q: 'Does it do what the issue says?', own: 6, f: 'A reload applies it twice', sev: 'High' },
  { lens: 'Non-functional', q: 'Failures, limits, structure', own: 9, f: 'apply runs again on reload', sev: 'High' },
  { lens: 'Security', q: 'Authority, untrusted input', own: 4, f: 'Nothing above the bar', sev: '' },
]

// Going back shows the earlier state at once; only forward steps play in order.
const back = ref(false)
// The token count climbs with each read, in time with the rows.
const tokens = [9, 19, 28, 41, 48]
const readN = ref(props.step >= 1 ? reads.length : 0)
// Each fork then reads a few files of its own, at full price, before it reports.
const forkN = ref(props.step >= 3 ? forks.length : 0)
let timers: ReturnType<typeof setTimeout>[] = []
watch(() => props.step, (now, before) => {
  back.value = now < before
  timers.forEach(clearTimeout)
  timers = []
  if (now >= 1 && before < 1) {
    reads.forEach((_, i) => timers.push(setTimeout(() => { readN.value = i + 1 }, 200 + i * 380)))
  } else {
    readN.value = now >= 1 ? reads.length : 0
  }
  if (now >= 3 && before < 3) {
    forks.forEach((_, i) => timers.push(setTimeout(() => { forkN.value = i + 1 }, 350 + i * 180)))
  } else {
    forkN.value = now >= 3 ? forks.length : 0
  }
})
</script>

<template>
  <div class="forks" :class="[`at-${step}`, { back }]">
    <div class="lane">
      <div class="io in">
        <small>From the implementer</small>
        <b>Review slice 2</b>
        <span>Issue #526</span>
        <span>The decisions</span>
        <span>The diff, 6 files</span>
      </div>
      <div class="io out" :class="{ on: step >= 3 }">
        <small>Back to the implementer</small>
        <b>One summary</b>
        <span>2 findings, 1 high</span>
        <span>Security: nothing</span>
      </div>
    </div>

    <svg class="pipe" viewBox="0 0 40 400" aria-hidden="true">
      <path class="p-in" d="M4,86 H32" />
      <path class="p-in" d="M24,78 L32,86 L24,94" />
      <path class="p-out" :class="{ on: step >= 3 }" d="M36,318 H8" />
      <path class="p-out" :class="{ on: step >= 3 }" d="M16,310 L8,318 L16,326" />
    </svg>

    <div class="rev">
      <header><Icon name="bot" /> Reviewer <span class="ns-mono tok">{{ tokens[readN] }}k tokens</span></header>
      <ol class="ctx">
        <li class="sys"><span class="k">Rules</span>Review skill, tools</li>
        <li class="hand"><span class="k">Handoff</span>Issue, decisions, diff</li>
        <li v-for="(r, i) in reads" :key="r.t" class="read" :class="{ on: step >= 1 }" :style="{ '--i': i }">
          <span class="k">{{ r.k }}</span><span class="ns-mono">{{ r.t }}</span>
        </li>
      </ol>
      <div class="merge" :class="{ on: step >= 3 }">
        <small>Merged</small>
        <p><i class="sev">High</i> A reload applies it twice <em>×2</em></p>
        <p><i class="sev low">Low</i> A helper name, style only</p>
      </div>
    </div>

    <svg class="tree" viewBox="0 0 80 400" aria-hidden="true">
      <g class="go" :class="{ on: step >= 2 }">
        <path v-for="(y, i) in [64, 200, 336]" :key="'g' + i" :style="{ '--i': i }" :d="`M0,150 C40,150 40,${y} 80,${y}`" pathLength="1" />
      </g>
      <g class="ret" :class="{ on: step >= 3 }">
        <path v-for="(y, i) in [96, 232, 368]" :key="'r' + i" :d="`M80,${y} C40,${y} 40,330 0,330`" />
      </g>
    </svg>

    <div class="col">
      <div v-for="(k, i) in forks" :key="k.lens" class="fork" :class="{ on: step >= 2, grown: forkN > i }" :style="{ '--i': i, '--own': k.own / 48 }">
        <header><b>{{ k.lens }}</b><small>Fork {{ i + 1 }} <span class="ns-mono tok">{{ 48 + (forkN > i ? k.own : 0) }}k tokens</span></small></header>
        <div class="cache">
          <span class="bar"><i class="s1" /><i class="s2" /><i class="s3" /><i class="s4" /></span>
          <span>48k from the cache</span>
          <em class="own">+{{ k.own }}k read</em>
        </div>
        <p class="q">{{ k.q }}</p>
        <p class="found" :class="{ on: step >= 3, none: !k.sev }">
          <i v-if="k.sev" class="sev">{{ k.sev }}</i><Icon v-else name="check" />
          {{ k.f }}
        </p>
      </div>
    </div>

    <div class="cost" :class="{ on: step >= 4 }">
      <small>Reading 48k for three reviews<span>Opus 5.5 input</span></small>
      <div class="row">
        <span class="who">Three fresh subagents</span>
        <span class="bars"><i class="full" /><i class="full" /><i class="full" /></span>
        <span class="sum ns-mono">3 × 24¢</span>
      </div>
      <div class="row">
        <span class="who">One reviewer, three forks</span>
        <span class="bars"><i class="full" /><i class="hit" /><i class="hit" /><i class="hit" /></span>
        <span class="sum ns-mono">24¢ + 3 × 1¢</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forks {
  --gap-t: 0ms;
  height: 510px;
  display: grid;
  grid-template-columns: 210px 40px 320px 80px 1fr;
  grid-template-rows: 400px 1fr;
  row-gap: 22px;
}

.lane {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.io {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  background: var(--z-ink);
  color: #e6e6e6;
  font-size: 17px;
  line-height: 1.3;
}

.io small,
.merge small,
.cost small {
  font-size: 16px;
  font-weight: 700;
  color: var(--ns-frozen);
}

.io b {
  font-size: 20px;
  color: #fff;
  margin-bottom: 2px;
}

.io.out {
  transition: opacity 600ms var(--ns-ease), transform 600ms var(--ns-ease);
}

.io.out:not(.on) {
  opacity: 0;
  transform: translateX(16px);
}

.forks:not(.back) .io.out.on {
  transition-delay: 3100ms;
}

.pipe,
.tree {
  width: 100%;
  height: 400px;
  overflow: visible;
}

.pipe path {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.p-in {
  stroke: var(--z-ink);
}

.p-out {
  stroke: var(--ns-teal);
  transition: opacity 400ms var(--ns-ease);
}

.p-out:not(.on) {
  opacity: 0;
}

.forks:not(.back) .p-out.on {
  transition-delay: 2900ms;
}

.rev {
  height: 400px;
  display: flex;
  flex-direction: column;
  border: 3px solid var(--z-ink);
  padding: 10px 14px 12px;
}

.rev header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 21px;
  font-weight: 800;
}

.rev .tok {
  margin-left: auto;
  font-size: 16px;
  font-weight: 700;
  color: var(--ns-teal);
}

.ctx {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ctx li {
  margin: 0;
  height: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  font-size: 16px;
  white-space: nowrap;
}

.ctx li::before {
  display: none !important;
}

.ctx .k {
  width: 80px;
  flex: none;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ctx .sys {
  background: #e6e6e6;
}

.ctx .hand {
  background: var(--z-ink);
  color: #fff;
}

.ctx .hand .k {
  color: var(--ns-frozen);
}

.ctx .read {
  background: var(--z-teal-100);
  transition: opacity 400ms var(--ns-ease), transform 500ms var(--ns-ease);
}

.ctx .read .k {
  color: var(--ns-teal);
}

.ctx .read:not(.on) {
  opacity: 0;
  transform: translateX(-12px);
}

.forks:not(.back) .ctx .read.on {
  transition-delay: calc(var(--i) * 380ms);
}

.merge {
  margin-top: auto;
  padding-top: 10px;
  border-top: 2px solid var(--ns-line);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: opacity 500ms var(--ns-ease);
}

.merge small {
  color: var(--ns-teal);
}

.merge:not(.on) {
  opacity: 0;
}

.forks:not(.back) .merge.on {
  transition-delay: 2300ms;
}

.merge p {
  margin: 0;
  max-width: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  line-height: 1.25;
}

.merge em {
  margin-left: auto;
  font-style: normal;
  font-family: var(--ns-mono);
  font-size: 16px;
  font-weight: 700;
  color: var(--ns-teal);
}

.sev {
  flex: none;
  padding: 1px 6px;
  background: var(--ns-red);
  color: #fff;
  font-style: normal;
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sev.low {
  background: var(--z-grey-600);
}

.tree path {
  fill: none;
  stroke-width: 3;
}

.go path {
  stroke: var(--ns-teal);
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 600ms var(--ns-ease);
}

.go.on path {
  stroke-dashoffset: 0;
}

.forks:not(.back) .go.on path {
  transition-delay: calc(var(--i) * 120ms);
}

.ret path {
  stroke: var(--ns-frozen);
  stroke-dasharray: 6 6;
  transition: opacity 400ms var(--ns-ease);
}

.ret:not(.on) path {
  opacity: 0;
}

.ret.on path {
  animation: flow 900ms linear infinite;
}

.forks:not(.back) .ret.on path {
  transition-delay: 1700ms;
}

@keyframes flow {
  to {
    stroke-dashoffset: 12;
  }
}

.col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.fork {
  height: 124px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 14px 10px;
  border: 2px solid var(--ns-teal);
  border-left-width: 6px;
  transition: opacity 500ms var(--ns-ease), transform 600ms var(--ns-ease);
}

.fork:not(.on) {
  opacity: 0;
  transform: translateX(-24px);
}

.forks:not(.back) .fork.on {
  transition-delay: calc(300ms + var(--i) * 160ms);
}

.fork header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.fork header b {
  font-size: 21px;
}

.fork header small {
  display: flex;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--z-grey-600);
}

.fork header .tok {
  font-size: 16px;
  color: var(--ns-teal);
}

.cache {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  font-size: 15px;
  color: var(--z-grey-600);
}

.cache .bar {
  width: 150px;
  flex: none;
  height: 14px;
  display: flex;
  gap: 2px;
}

.cache .bar i {
  height: 100%;
}

.cache .s1 {
  width: 16px;
  background: #cfcfcd;
}

.cache .s2 {
  width: 20px;
  background: var(--z-ink);
}

.cache .s3 {
  width: 80px;
  background: var(--z-teal-300);
}

.cache .s4 {
  width: 0;
  background: var(--ns-teal);
  transition: width 500ms var(--ns-ease);
}

.fork.grown .s4 {
  width: calc(var(--own) * 120px);
}

.cache .own {
  font-style: normal;
  font-weight: 700;
  color: var(--ns-teal);
  transition: opacity 400ms var(--ns-ease);
}

.fork:not(.grown) .own {
  opacity: 0;
}

.fork .q {
  margin: 0;
  max-width: none;
  font-size: 18px;
  font-weight: 700;
  color: var(--z-ink-800);
}

.found {
  margin: 0;
  max-width: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  transition: opacity 500ms var(--ns-ease);
}

.found:not(.on) {
  opacity: 0;
}

.forks:not(.back) .found.on {
  transition-delay: calc(900ms + var(--i) * 250ms);
}

.found.none {
  color: var(--z-grey-600);
}

.found.none .ns-icon {
  color: var(--ns-teal);
}

.cost {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 300px 1fr;
  align-content: center;
  column-gap: 24px;
  row-gap: 8px;
  padding: 10px 22px;
  background: var(--ns-soft);
  transition: opacity 500ms var(--ns-ease);
}

.cost:not(.on) {
  opacity: 0;
}

.cost small {
  grid-row: 1 / 3;
  align-self: center;
  display: flex;
  flex-direction: column;
  color: var(--ns-teal);
  font-size: 19px;
  line-height: 1.25;
}

.cost small span {
  font-size: 16px;
  font-weight: 400;
  color: var(--z-grey-600);
}

.cost .row {
  display: grid;
  grid-template-columns: 250px 270px 1fr;
  align-items: center;
  gap: 16px;
  font-size: 18px;
}

.cost .who {
  font-weight: 700;
}

.cost .bars {
  display: flex;
  gap: 3px;
  height: 20px;
}

.cost .full {
  width: 84px;
  background: var(--z-ink);
}

.cost .hit {
  width: 4px;
  background: var(--ns-teal);
}

.cost .sum {
  font-size: 18px;
  font-weight: 700;
}
</style>
