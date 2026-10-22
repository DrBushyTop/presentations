<!--
  What a research run looks like, without the agent's text. The input is the
  research questions, not the ticket, so the ticket's guess can't steer it.
  The research agent and its subagents (locator, analyzer, pattern finder)
  can open any file, but they search first and open only the files that
  match, then look outside the code, then write a short map for the next
  context. The question is my repo's issue #257 (large MCP replies failing);
  file names are real at commit af31181. The run itself is illustrative.
  0 the prompt · 1 search the code · 2 look elsewhere · 3 write research.md
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const files = [
  { dir: 'McpCode/', name: 'AcaExecStream.cs', hit: true },
  { dir: 'McpCode/', name: 'CodeExecution.cs', hit: true },
  { dir: 'McpCode/', name: 'CodeSchema.cs' },
  { dir: 'McpCode/', name: 'CodeJson.cs', hit: true },
  { dir: 'Features/', name: 'McpCodeTools.cs' },
  { dir: 'resources/', name: 'build.mjs' },
  { dir: 'resources/', name: 'worker-v2.mjs', hit: true },
  { dir: 'tests/', name: 'CodeV2Tests.cs' },
  { dir: 'resources/', name: 'package.json' },
]

// Geometry in px inside the 1136 x 510 stage.
const AGENT = { x: 410, y: 190, w: 140, h: 120 }
const PANEL = { x: 610, y: 0, w: 526, h: 320 }
const TILE = { w: 159, h: 78, gap: 10, top: 52, pad: 14 }
const tile = (i: number) => {
  const c = i % 3
  const r = Math.floor(i / 3)
  return {
    x: PANEL.x + TILE.pad + c * (TILE.w + TILE.gap),
    y: PANEL.y + TILE.top + r * (TILE.h + TILE.gap),
  }
}
// Hits open in reading order, in step with their wires.
const hitRank = (i: number) => files.slice(0, i).filter(f => f.hit).length

const elsewhere = [
  { icon: 'globe', label: 'Docs', line: 'Exec stream limits' },
  { icon: 'db', label: 'Logs', line: 'Failed runs and sizes' },
  { icon: 'clock', label: 'Past notes', line: 'Earlier sandbox research' },
] as const
const OUT = { y: 352, h: 158, w: 167, gap: 12 }
const outX = (i: number) => PANEL.x + i * (OUT.w + OUT.gap)

const ax = AGENT.x + AGENT.w
const ay = AGENT.y + AGENT.h / 2
const fileWires = files
  .map((f, i) => ({ f, i }))
  .filter(({ f }) => f.hit)
  .map(({ i }, k) => {
    const t = tile(i)
    const tx = t.x + TILE.w / 2
    const ty = t.y + TILE.h / 2
    return { d: `M${ax},${ay} C${ax + 40},${ay} ${tx - 60},${ty} ${tx},${ty}`, k }
  })
const outWires = elsewhere.map((_, i) => {
  const tx = outX(i) + OUT.w / 2
  const sx = AGENT.x + 40 + i * 30
  const sy = AGENT.y + AGENT.h
  return { d: `M${sx},${sy} C${sx},${OUT.y - 10} ${tx},${sy + 10} ${tx},${OUT.y}`, k: i }
})

const findings = [
  'Each reply is one JSON line',
  'Send cuts it into 16 KiB pieces',
  'Limits cap whole replies only',
  'The guest rebuilds lines itself',
]
</script>

<template>
  <div class="rr" :class="['s' + Math.min(step, 3), { s1: step >= 1, s2: step >= 2, s3: step >= 3 }]">
    <svg class="wires" viewBox="0 0 1136 510" aria-hidden="true">
      <path class="wire in" d="M340,118 C390,118 370,250 410,250" />
      <path v-for="w in fileWires" :key="'f' + w.k" class="wire code" :d="w.d" pathLength="1" :style="{ '--k': w.k }" />
      <path v-for="w in outWires" :key="'o' + w.k" class="wire out" :d="w.d" pathLength="1" :style="{ '--k': w.k }" />
      <path class="wire doc" d="M410,280 C370,280 380,396 340,396" pathLength="1" />
    </svg>

    <section class="prompt">
      <header><Icon name="file" /><span>Research questions</span><b>no ticket</b></header>
      <ol>
        <li>How does a reply reach the sandbox?</li>
        <li>Where is it split or capped?</li>
        <li>Which tests send large replies?</li>
      </ol>
    </section>

    <div class="agent" :style="{ left: AGENT.x + 'px', top: AGENT.y + 'px', width: AGENT.w + 'px', height: AGENT.h + 'px' }">
      <span class="ring" />
      <Icon name="bot" />
      <b>Research</b>
      <small>+ 3 subagents</small>
    </div>

    <div class="query ns-mono"><Icon name="search" />stdin · ReplyBytes</div>

    <section class="panel" :style="{ left: PANEL.x + 'px', top: PANEL.y + 'px', width: PANEL.w + 'px', height: PANEL.h + 'px' }">
      <header><span class="ns-mono">src · tests</span><small>Opened 4</small></header>
    </section>
    <div class="scan" :style="{ left: PANEL.x + 2 + 'px', width: PANEL.w - 4 + 'px', '--top': PANEL.y + 46 + 'px', '--bottom': PANEL.y + PANEL.h - 6 + 'px' }" />
    <div
      v-for="(f, i) in files" :key="f.dir + f.name" class="file" :class="{ hit: f.hit }"
      :style="{ left: tile(i).x + 'px', top: tile(i).y + 'px', width: TILE.w + 'px', height: TILE.h + 'px', '--h': hitRank(i) }"
    >
      <Icon name="file" />
      <span class="ns-mono"><small>{{ f.dir }}</small>{{ f.name }}</span>
    </div>

    <div
      v-for="(e, i) in elsewhere" :key="e.label" class="src"
      :style="{ left: outX(i) + 'px', top: OUT.y + 'px', width: OUT.w + 'px', height: OUT.h + 'px', '--k': i }"
    >
      <Icon :name="e.icon" />
      <b>{{ e.label }}</b>
      <span>{{ e.line }}</span>
    </div>

    <section class="doc">
      <header><Icon name="file" /><b class="ns-mono">research.md</b></header>
      <p v-for="(f, i) in findings" :key="f" :style="{ '--k': i }">{{ f }}</p>
      <footer>Each finding cites a file and line</footer>
    </section>
  </div>
</template>

<style scoped>
.rr {
  position: relative;
  width: 1136px;
  height: 510px;
}

.wires {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.wire {
  fill: none;
  stroke-width: 3;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 700ms var(--ns-ease);
}

.wire.in {
  stroke: var(--z-ink);
  stroke-dasharray: none;
  stroke-dashoffset: 0;
  opacity: 0;
  transition: opacity 400ms var(--ns-ease);
}

.wire.code { stroke: var(--ns-teal); stroke-width: 4; }
.wire.out { stroke: var(--ns-teal); stroke-width: 4; }
.wire.doc { stroke: var(--z-ink); stroke-width: 4; }

.s1 .wire.in { opacity: 1; }

/* The code wires draw once the search has found the files. */
.s1 .wire.code {
  stroke-dashoffset: 0;
  transition-delay: calc(900ms + var(--k) * 200ms);
}

.s2 .wire.out {
  stroke-dashoffset: 0;
  transition-delay: calc(var(--k) * 220ms);
}

.s3 .wire.doc { stroke-dashoffset: 0; }

/* ---------- Prompt ---------- */

.prompt {
  position: absolute;
  left: 0;
  top: 0;
  width: 340px;
  height: 250px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 20px;
  background: var(--ns-soft);
  border-left: 6px solid var(--z-ink);
}

.prompt header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
}

.prompt header :deep(.ns-icon) {
  font-size: 20px;
}

.prompt header span {
  white-space: nowrap;
}

.prompt header b {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  background: var(--z-ink);
  color: #fff;
  font-size: 15px;
  white-space: nowrap;
}

.prompt p {
  margin: 0;
  max-width: none;
  font-size: 20px;
  line-height: 1.4;
}

.prompt ol {
  margin: 0;
  padding-left: 26px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 20px;
  line-height: 1.3;
}

.prompt ol li {
  margin: 0;
}

/* Before the run, only the prompt is in focus. */
.s0 .agent,
.s0 .panel,
.s0 .file {
  opacity: 0.3;
}

.agent,
.panel {
  transition: opacity 500ms var(--ns-ease);
}

/* ---------- Agent ---------- */

.agent {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--z-ink);
  color: #fff;
  transition: opacity 500ms var(--ns-ease);
}

.agent :deep(.ns-icon) {
  font-size: 36px;
  color: var(--ns-teal);
}

.agent b {
  font-size: 22px;
}

.agent small {
  margin-top: -6px;
  font-size: 15px;
  color: #bdbdbd;
}

.ring {
  position: absolute;
  inset: -6px;
  border: 3px solid var(--ns-teal);
  opacity: 0;
}

.s1 .ring {
  animation: pulse 1600ms var(--ns-ease) infinite;
}

.s3 .ring {
  animation: none;
}

@keyframes pulse {
  0% { opacity: 0.9; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.18); }
}

.query {
  position: absolute;
  left: 380px;
  top: 138px;
  width: 200px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 8px;
  border: 2px solid var(--ns-teal);
  color: var(--ns-teal);
  background: #fff;
  font-size: 16px;
  font-weight: 700;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 400ms var(--ns-ease), transform 500ms var(--ns-ease);
}

.query :deep(.ns-icon) {
  font-size: 18px;
}

.s1 .query {
  opacity: 1;
  transform: none;
}

.s2 .query {
  opacity: 0;
}

/* ---------- Code ---------- */

.panel {
  position: absolute;
  border: 2px solid var(--z-ink);
  background: transparent;
}

.panel header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 10px 14px;
  font-size: 17px;
  font-weight: 700;
  border-bottom: 2px solid var(--z-ink);
  background: #fff;
}

.panel header small {
  font-size: 16px;
  color: var(--ns-teal);
  opacity: 0;
  transition: opacity 500ms var(--ns-ease) 1800ms;
}

.s1 .panel header small {
  opacity: 1;
}

/* One pass of the search over the codebase. It matches, it doesn't read. */
.scan {
  position: absolute;
  top: var(--top);
  height: 4px;
  background: var(--ns-teal);
  box-shadow: 0 0 14px 4px rgba(0, 128, 145, 0.35);
  opacity: 0;
  pointer-events: none;
  z-index: 1;
}

.s1:not(.s2) .scan {
  animation: scan 900ms var(--ns-ease) both 150ms;
}

@keyframes scan {
  0% { top: var(--top); opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { top: var(--bottom); opacity: 0; }
}

.file {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 8px 10px;
  background: #fff;
  border: 2px solid #d9d9d6;
  color: var(--z-ink);
  transition: opacity 500ms var(--ns-ease), background 500ms var(--ns-ease), border-color 500ms var(--ns-ease), color 500ms var(--ns-ease);
}

.file :deep(.ns-icon) {
  font-size: 22px;
  color: var(--z-grey-600);
}

.file span {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  white-space: nowrap;
  font-weight: 700;
  line-height: 1.2;
}

.file small {
  font-size: 14px;
  font-weight: 400;
  color: var(--z-grey-600);
}

/* The search finds the matches and the agent opens those. The rest stay
   available but untouched. */
.s1 .file.hit {
  background: #e6f4f6;
  border-color: var(--ns-teal);
  transition-delay: 0ms, calc(900ms + var(--h) * 200ms), calc(900ms + var(--h) * 200ms), 0ms;
}

.s1 .file.hit :deep(.ns-icon) {
  color: var(--ns-teal);
  transition: color 500ms var(--ns-ease);
  transition-delay: calc(900ms + var(--h) * 200ms);
}

.s1:not(.s2) .file.hit {
  animation: open 600ms var(--ns-ease) both;
  animation-delay: calc(900ms + var(--h) * 200ms);
}

@keyframes open {
  0% { box-shadow: 0 0 0 0 rgba(0, 128, 145, 0); }
  40% { box-shadow: 0 0 0 6px rgba(0, 128, 145, 0.35); }
  100% { box-shadow: 0 0 0 0 rgba(0, 128, 145, 0); }
}

/* ---------- Elsewhere ---------- */

.src {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 14px;
  background: #fff;
  border: 2px solid #d9d9d6;
  opacity: 0.25;
  transition: opacity 500ms var(--ns-ease), border-color 500ms var(--ns-ease), background 500ms var(--ns-ease);
  transition-delay: calc(var(--k) * 220ms + 300ms);
}

.src :deep(.ns-icon) {
  font-size: 30px;
  color: var(--ns-teal);
}

.src b {
  font-size: 21px;
}

.src span {
  font-size: 18px;
  line-height: 1.3;
  color: var(--z-ink-800);
}

.s2 .src {
  opacity: 1;
  background: #e6f4f6;
  border-color: var(--ns-teal);
}

/* ---------- Output ---------- */

.doc {
  position: absolute;
  left: 0;
  top: 282px;
  width: 340px;
  height: 228px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 14px 18px;
  background: var(--z-ink);
  color: #fff;
  opacity: 0;
  transform: translateX(-16px);
  transition: opacity 500ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.doc header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.doc header :deep(.ns-icon) {
  font-size: 22px;
  color: var(--ns-frozen);
}

.doc header b {
  font-size: 19px;
}

.doc p {
  margin: 0;
  max-width: none;
  padding-left: 12px;
  border-left: 3px solid var(--ns-teal);
  font-size: 17px;
  line-height: 1.3;
  white-space: nowrap;
}

.doc footer {
  margin-top: auto;
  font-size: 15px;
  color: #bdbdbd;
}

.s3 .doc {
  opacity: 1;
  transform: none;
  transition-delay: 400ms;
}

@media (prefers-reduced-motion: reduce) {
  .s1 .file.hit,
  .s1 .scan { animation: none; }
  .s1 .ring { animation: none; }
}
</style>
