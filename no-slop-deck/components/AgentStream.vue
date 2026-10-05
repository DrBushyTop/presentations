<!--
  Cover artwork: an agent session, drawn the way OpenCode and Codex show it.
  One step at a time: a tool call runs with a spinner, then settles with a
  result. Edits show a small diff (teal adds, red deletes), bash calls show
  output. Older steps glide up under the header and are removed only once
  they're fully out of view; the loop carries on into the next round. The seeded bug sits in plain sight in
  the new export file. Outside the live slide it shows a still frame.
-->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { prefersReducedMotion, useIsActive } from '../lib/active'

type Diff = { k: '+' | '-', t: string }
type Step =
  | { kind: 'say', text: string }
  | { kind: 'read' | 'grep' | 'delete', target: string, result: string, ms: number }
  | { kind: 'write' | 'edit', target: string, result: string, ms: number, diff: Diff[] }
  | { kind: 'bash', target: string, result: string, ms: number, out: string[] }

const script: Step[] = [
  { kind: 'say', text: 'I\'ll check how the task list scopes by team.' },
  { kind: 'read', target: 'src/routes/tasks.ts', result: '20 lines', ms: 900 },
  { kind: 'grep', target: '"teamId" in src', result: '6 matches', ms: 1100 },
  { kind: 'say', text: 'The list reuses findTasks. I\'ll add the export beside it.' },
  {
    kind: 'write', target: 'src/routes/export.ts', result: '+7', ms: 1300,
    diff: [
      { k: '+', t: 'export async function exportTasks(req) {' },
      { k: '+', t: '  const session = await requireSession(req)' },
      { k: '+', t: '  const teamId = req.query.teamId ?? session.teamId' },
      { k: '+', t: '  const rows = await findTasks(db, { teamId })' },
      { k: '+', t: '  return csv(rows, COLUMNS)' },
    ],
  },
  {
    kind: 'edit', target: 'src/lib/csv.ts', result: '+2 −2', ms: 1100,
    diff: [
      { k: '-', t: 'const row = (t) => [t.id, t.title]' },
      { k: '+', t: 'const toRow = (t: Task) => [t.id, t.title]' },
    ],
  },
  { kind: 'delete', target: 'src/lib/legacyExport.ts', result: '−48', ms: 800 },
  { kind: 'bash', target: 'npm test', result: '4.2 s', ms: 2400, out: ['✓ 24 passed · 0 failed'] },
  { kind: 'bash', target: 'gh pr create --fill', result: '1.1 s', ms: 1400, out: ['Opened #482 · review bot: no issues'] },
  { kind: 'say', text: 'Ready to merge. Small, well-tested change.' },
]

const meta = {
  read: { icon: '→', name: 'Read' },
  grep: { icon: '✱', name: 'Grep' },
  write: { icon: '+', name: 'Write' },
  edit: { icon: '✎', name: 'Edit' },
  delete: { icon: '✕', name: 'Delete' },
  bash: { icon: '$', name: 'Bash' },
} as const

type Block = { id: number, step: Step, done: boolean, shown: number }
const blocks = ref<Block[]>([])
const tick = ref(0)
const STILL = 6
const feed = ref<{ $el: HTMLElement }>()
const frames = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
const spinner = computed(() => frames[tick.value % frames.length])
const running = ref(false)

let id = 0
let i = 0
let timers: number[] = []
let spin = 0
const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)) }

function add(step: Step, done = false) {
  const b: Block = { id: id++, step, done, shown: done ? 999 : 0 }
  blocks.value.push(b)
  return blocks.value[blocks.value.length - 1]
}

// Drop blocks only once they've scrolled completely above the feed, so
// nothing leaves a gap while it is still on screen.
async function prune() {
  await nextTick()
  const el = feed.value?.$el
  if (!el) return
  const top = el.getBoundingClientRect().top
  const gone = new Set<number>()
  for (const child of el.children) {
    const r = (child as HTMLElement).getBoundingClientRect()
    if (r.bottom < top) gone.add(Number((child as HTMLElement).dataset.id))
  }
  if (gone.size) blocks.value = blocks.value.filter(b => !gone.has(b.id))
}

function next() {
  const step = script[i % script.length]
  i++
  const b = add(step)
  later(prune, 900)
  if (step.kind === 'say') {
    // Type the sentence, then pause so it can be read.
    const typeTick = () => {
      b.shown += 3
      if (b.shown < step.text.length) later(typeTick, 30)
      else { b.done = true; later(next, 1200) }
    }
    later(typeTick, 150)
    return
  }
  later(() => {
    b.done = true
    const lines = 'diff' in step ? step.diff.length : 'out' in step ? step.out.length : 0
    const revealLine = () => {
      b.shown++
      if (b.shown < lines) later(revealLine, 200)
      else later(next, 1100)
    }
    if (lines) later(revealLine, 120)
    else later(next, 800)
  }, step.ms * 0.75)
}

function stop() {
  timers.forEach(clearTimeout)
  timers = []
  clearInterval(spin)
  running.value = false
}

function stillFrame() {
  blocks.value = []
  for (const s of script.slice(script.length - STILL)) add(s, true)
}

const active = useIsActive()
watch(active, (on) => {
  stop()
  if (!on || prefersReducedMotion()) {
    stillFrame()
    return
  }
  blocks.value = []
  i = 0
  for (const s of script.slice(0, 3)) add(s, true)
  i = 3
  running.value = true
  spin = window.setInterval(() => tick.value++, 80)
  later(next, 700)
}, { immediate: true })

onBeforeUnmount(stop)
</script>

<template>
  <div class="session" aria-hidden="true">
    <header>
      <span class="app">opencode</span>
      <span class="ns-mono">build · agent/export-csv</span>
      <span class="state" :class="{ busy: running }">
        <i class="ns-mono">{{ running ? spinner : '●' }}</i>{{ running ? 'Working' : 'Idle' }}
      </span>
    </header>

    <TransitionGroup ref="feed" tag="div" name="blk" class="feed">
      <div v-for="b in blocks" :key="b.id" :data-id="b.id" class="blk" :class="[`k-${b.step.kind}`, { done: b.done }]">
        <p v-if="b.step.kind === 'say'" class="say">{{ b.step.text.slice(0, b.shown) }}</p>

        <template v-else>
          <div class="call">
            <span class="ic ns-mono">{{ b.done ? meta[b.step.kind].icon : spinner }}</span>
            <b>{{ meta[b.step.kind].name }}</b>
            <span class="tgt ns-mono">{{ b.step.target }}</span>
            <span class="res ns-mono">{{ b.done ? b.step.result : '' }}</span>
          </div>
          <div v-if="'diff' in b.step && b.done" class="diff ns-mono">
            <div v-for="(d, k) in b.step.diff" :key="k" class="dl" :class="[d.k === '+' ? 'add' : 'del', { on: k < b.shown }]">
              <i>{{ d.k }}</i>{{ d.t }}
            </div>
          </div>
          <div v-if="'out' in b.step && b.done" class="out ns-mono">
            <div v-for="(o, k) in b.step.out" :key="k" class="ol" :class="{ on: k < b.shown }">{{ o }}</div>
          </div>
        </template>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.session {
  position: absolute;
  inset: 0;
  background: var(--z-ink);
  color: #d6d6d6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 32px 18px;
  border-bottom: 1px solid #333;
  background: var(--z-ink);
  font-size: 15px;
  color: #8f8f8f;
}

.app {
  font-family: var(--z-font-display);
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.state {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.state i {
  font-style: normal;
  color: #6a6a6a;
}

.state.busy {
  color: var(--ns-frozen);
}

.state.busy i {
  color: var(--ns-frozen);
}

.feed {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 18px;
  padding: 0 32px 44px;
  mask-image: linear-gradient(to bottom, transparent 0, #000 90px);
}

.blk {
  width: 100%;
}

/* Assistant text */
.say {
  margin: 4px 0;
  max-width: none;
  font-family: var(--z-font-text);
  font-size: 19px;
  line-height: 1.35;
  font-weight: 600;
  color: #fff;
}

/* Tool call line */
.call {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 16px;
}

.ic {
  width: 18px;
  text-align: center;
  color: var(--ns-frozen);
}

.call b {
  font-family: var(--z-font-text);
  font-weight: 700;
  color: #fff;
}

.tgt {
  color: #a8a8a8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.res {
  margin-left: auto;
  color: #7a7a7a;
  white-space: nowrap;
}

.done .ic {
  color: #8f8f8f;
}

.k-write.done .ic,
.k-edit.done .ic { color: var(--z-teal-300); }

.k-delete.done .ic,
.k-delete.done b { color: #ff8a78; }

.k-delete .tgt {
  text-decoration: line-through;
  text-decoration-color: rgba(255, 138, 120, 0.6);
}

.k-write .res,
.k-edit .res { color: var(--z-teal-300); }

.k-delete .res { color: #ff8a78; }

.k-bash .ic { color: #f2c94c; }

.k-bash.done .ic { color: #8f8f8f; }

/* Diff and output panels under a call */
.diff,
.out {
  margin: 8px 0 0;
  padding: 8px 0;
  background: #222;
  font-size: 15px;
  line-height: 1.65;
}

.dl {
  padding: 0 12px;
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 300ms var(--ns-ease), transform 400ms var(--ns-ease);
}

.dl i {
  display: inline-block;
  width: 16px;
  font-style: normal;
}

.dl.add {
  color: var(--z-teal-300);
  background: rgba(3, 127, 145, 0.16);
}

.dl.del {
  color: #ff8a78;
  background: rgba(222, 30, 5, 0.16);
}

.dl:not(.on),
.ol:not(.on) {
  opacity: 0;
  transform: translateX(-6px);
}

.ol {
  padding: 0 14px;
  color: var(--ns-frozen);
  transition: opacity 300ms var(--ns-ease), transform 400ms var(--ns-ease);
}

/* New blocks rise in; older ones glide up. */
.blk-move {
  transition: transform 700ms var(--ns-ease);
}

.blk-enter-active {
  transition: opacity 500ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.blk-enter-from {
  opacity: 0;
  transform: translateY(18px);
}

.blk-leave-active {
  display: none;
}
</style>
