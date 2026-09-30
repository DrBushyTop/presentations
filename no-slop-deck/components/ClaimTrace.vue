<!--
  Follow a research claim back to the code.
  1 claim one checks out · 2 claim three is false on the new path · 3 sort the rest
-->
<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useIsActive } from '../lib/active'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const root = ref<HTMLElement>()
const c1 = ref<HTMLElement>()
const c3 = ref<HTMLElement>()
const l1 = ref<HTMLElement>()
const l3 = ref<HTMLElement>()
const paths = ref<{ a: string, b: string }>({ a: '', b: '' })

function curve(from?: HTMLElement, to?: HTMLElement) {
  if (!root.value || !from || !to) return ''
  const box = root.value.getBoundingClientRect()
  if (!box.width) return ''
  const k = root.value.offsetWidth / box.width
  const f = from.getBoundingClientRect()
  const t = to.getBoundingClientRect()
  const x1 = (f.right - box.left) * k + 6
  const y1 = (f.top + f.height / 2 - box.top) * k
  const x2 = (t.left - box.left) * k - 6
  const y2 = (t.top + t.height / 2 - box.top) * k
  const mx = (x1 + x2) / 2
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
}

async function measure() {
  await nextTick()
  paths.value = { a: curve(c1.value, l1.value), b: curve(c3.value, l3.value) }
}

onMounted(() => { measure(); setTimeout(measure, 400) })
watch(() => props.step, measure)
const active = useIsActive()
watch(active, (on) => { if (on) { measure(); setTimeout(measure, 700) } })
</script>

<template>
  <div ref="root" class="trace">
    <section class="notes">
      <header class="ns-mono">research.md</header>
      <ol>
        <li ref="c1" :class="{ ok: step >= 1 }">
          <span>The task list is scoped to the caller's team.</span>
          <em class="chip ok" :class="{ on: step >= 1 }">Checked</em>
        </li>
        <li :class="{ maybe: step >= 3 }">
          <span>Export can reuse the list query.</span>
          <em class="chip maybe" :class="{ on: step >= 3 }">Assumption</em>
        </li>
        <li ref="c3" :class="{ bad: step >= 2 }">
          <span>The team id always comes from the session.</span>
          <em class="chip bad" :class="{ on: step >= 2 }">False for export</em>
        </li>
      </ol>
      <footer :class="{ on: step >= 3 }">One claim checked by hand changed the plan.</footer>
    </section>

    <section class="code ns-mono">
      <div class="file">
        <header>routes/tasks.ts</header>
        <div class="ln">export async function listTasks(req) {</div>
        <div class="ln">  const session = await requireSession(req)</div>
        <div ref="l1" class="ln hit" :class="{ on: step >= 1, good: true }">  where: { teamId: session.teamId },</div>
        <div class="ln">  ...</div>
      </div>
      <div class="file">
        <header>routes/export.ts <span>new</span></header>
        <div class="ln">export async function exportTasks(req) {</div>
        <div class="ln">  const session = await requireSession(req)</div>
        <div ref="l3" class="ln hit" :class="{ on: step >= 2, bad: true }">  const teamId = req.query.teamId ?? session.teamId</div>
        <div class="ln">  where: { teamId },</div>
      </div>
    </section>

    <svg class="wires" aria-hidden="true">
      <path :d="paths.a" class="wire good" :class="{ on: step >= 1 }" pathLength="1" />
      <path :d="paths.b" class="wire bad" :class="{ on: step >= 2 }" pathLength="1" />
    </svg>
  </div>
</template>

<style scoped>
.trace {
  position: relative;
  display: grid;
  grid-template-columns: 430px 1fr;
  gap: 110px;
  height: 500px;
}

.notes {
  border: 1px solid var(--ns-line);
  display: flex;
  flex-direction: column;
}

.notes header,
.file header {
  font-size: 16px;
  color: var(--z-grey-600);
  padding: 12px 18px;
  border-bottom: 1px solid var(--ns-line);
}

.notes ol {
  list-style: none;
  margin: 0;
  padding: 6px 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.notes li {
  margin: 0;
  max-width: none;
  padding: 10px 12px;
  font-size: 21px;
  line-height: 1.3;
  transition: background 400ms var(--ns-ease);
}

.notes li::before {
  display: none !important;
}

.notes li.ok { background: #e8f6f8; }
.notes li.bad { background: #fff1ee; }
.notes li.maybe { background: var(--ns-soft); }

.notes li span {
  display: block;
}

.chip {
  display: inline-block;
  margin-top: 8px;
  font-style: normal;
  font-size: 15px;
  font-weight: 700;
  padding: 3px 10px;
  color: #fff;
  transition: opacity 400ms var(--ns-ease), transform 500ms var(--ns-ease);
}

.chip:not(.on) {
  opacity: 0;
  transform: translateY(6px);
}

.chip.ok { background: var(--ns-teal); }
.chip.bad { background: var(--ns-red); }
.chip.maybe { background: var(--z-grey-600); }

.notes footer {
  margin: 0 18px 16px;
  padding: 12px 16px;
  background: var(--z-ink);
  color: #fff;
  font-size: 19px;
  font-weight: 700;
  transition: opacity 500ms var(--ns-ease);
}

.notes footer:not(.on) {
  opacity: 0;
}

.code {
  display: flex;
  flex-direction: column;
  gap: 28px;
  justify-content: center;
}

.file {
  background: var(--z-ink);
  color: #bdbdbd;
  padding-bottom: 12px;
}

.file header {
  border-color: #333;
  color: #8f8f8f;
}

.file header span {
  margin-left: 8px;
  color: var(--ns-frozen);
}

.ln {
  font-size: 16px;
  line-height: 1.9;
  padding: 0 18px;
  white-space: pre;
  transition: background 400ms var(--ns-ease), color 400ms var(--ns-ease);
}

.ln.hit.on.good {
  background: rgba(3, 127, 145, 0.45);
  color: #fff;
}

.ln.hit.on.bad {
  background: rgba(222, 30, 5, 0.5);
  color: #fff;
}

.wires {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.wire {
  fill: none;
  stroke-width: 3;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 900ms var(--ns-ease);
}

.wire.on {
  stroke-dashoffset: 0;
}

.wire.good { stroke: var(--ns-teal); }
.wire.bad { stroke: var(--ns-red); }
</style>
