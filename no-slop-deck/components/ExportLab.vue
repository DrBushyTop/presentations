<!--
  The export lab. The tests below are real: they run in the browser against
  the export function shown, for whichever version is on screen.
  Click the teamId line to cycle versions, the request to forge a teamId.

  0 seeded bug, happy tests green · 1 forged request leaks Team B
  2 boundary checks go red · 3 fix, all green · 4 remove the filter: checks fail
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useSynced } from '../lib/sync'

type Version = 'seeded' | 'fixed' | 'control'
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const { $page } = useSlideContext()

const TASKS = [
  { id: 'A-101', team: 'team-a', title: 'Draft Q4 roadmap', status: 'open' },
  { id: 'A-102', team: 'team-a', title: 'Fix login, then retest', status: 'done' },
  { id: 'B-201', team: 'team-b', title: 'CANARY: Team B only', status: 'open' },
  { id: 'B-202', team: 'team-b', title: 'Salary review notes', status: 'open' },
]

function exportTasks(version: Version, session: { teamId: string }, query: { teamId?: string }) {
  const teamId = version === 'seeded' ? (query.teamId ?? session.teamId) : session.teamId
  const rows = version === 'control' ? TASKS : TASKS.filter(t => t.team === teamId)
  const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  return ['id,title,status', ...rows.map(r => [r.id, r.title, r.status].map(cell).join(','))].join('\n')
}

const A = { teamId: 'team-a' }
const dataRows = (csv: string) => csv.split('\n').slice(1)
const TESTS = [
  { name: 'exports a CSV header', boundary: false, run: (v: Version) => exportTasks(v, A, {}).split('\n')[0] === 'id,title,status' },
  { name: 'exports my team\'s tasks', boundary: false, run: (v: Version) => { const c = exportTasks(v, A, {}); return c.includes('A-101') && c.includes('A-102') } },
  { name: 'escapes commas in titles', boundary: false, run: (v: Version) => exportTasks(v, A, {}).includes('"Fix login, then retest"') },
  { name: 'forged teamId returns only my rows', boundary: true, run: (v: Version) => dataRows(exportTasks(v, A, { teamId: 'team-b' })).every(r => r.startsWith('A-')) },
  { name: 'Team A exports exactly its 2 rows', boundary: true, run: (v: Version) => dataRows(exportTasks(v, A, {})).length === 2 },
]

const byStep = computed(() => ({
  version: (props.step >= 4 ? 'control' : props.step >= 3 ? 'fixed' : 'seeded') as Version,
  forged: props.step >= 1,
}))

const manual = useSynced<{ version: Version, forged: boolean } | null>(`export-lab-${$page.value}`, null)
watch(() => props.step, () => { manual.value = null })
const state = computed(() => manual.value ?? byStep.value)

function cycleVersion() {
  const order: Version[] = ['seeded', 'fixed', 'control']
  const next = order[(order.indexOf(state.value.version) + 1) % 3]
  manual.value = { ...state.value, version: next }
}
function toggleForged() {
  manual.value = { ...state.value, forged: !state.value.forged }
}

const showBoundary = computed(() => props.step >= 2 || !!manual.value)
const revealed = computed(() => props.step >= 1 || !!manual.value)
const results = computed(() => TESTS
  .filter(t => showBoundary.value || !t.boundary)
  .map(t => ({ name: t.name, boundary: t.boundary, pass: t.run(state.value.version) })))
const failed = computed(() => results.value.filter(r => !r.pass).length)

const output = computed(() => {
  const csv = exportTasks(state.value.version, A, state.value.forged ? { teamId: 'team-b' } : {})
  return dataRows(csv).map((line) => {
    const id = line.split(',')[0]
    return { id, text: line.slice(id.length + 1), foreign: !id.startsWith('A-') }
  })
})

const running = ref(false)
let t = 0
watch(() => JSON.stringify(state.value) + showBoundary.value, () => {
  running.value = true
  clearTimeout(t)
  t = window.setTimeout(() => (running.value = false), 380)
})
</script>

<template>
  <div class="lab">
    <section class="editor ns-mono">
      <header>
        <span>routes/export.ts</span>
        <em v-if="state.version === 'seeded'" class="tag is-seeded">Seeded defect</em>
        <em v-else-if="state.version === 'fixed'" class="tag is-fixed">Fixed</em>
        <em v-else class="tag is-control">Filter removed</em>
      </header>
      <div class="code">
        <div class="ln"><i>1</i>export async function exportTasks(req) {</div>
        <div class="ln"><i>2</i>  const session = await requireSession(req)</div>
        <button class="ln hot" :class="[`is-${state.version}`, { revealed }]" type="button" @click="cycleVersion">
          <i>3</i>  const teamId = <span class="swap"><span v-if="state.version === 'seeded'" class="bad">req.query.teamId ?? </span>session.teamId</span>
        </button>
        <div class="ln"><i>4</i>  const rows = await db.tasks.findMany({</div>
        <div class="ln" :class="{ gone: state.version === 'control' }"><i>5</i>    where: { teamId },</div>
        <div class="ln"><i>6</i>  })</div>
        <div class="ln"><i>7</i>  return csv(rows, ['id', 'title', 'status'])</div>
        <div class="ln"><i>8</i>}</div>
      </div>
      <button class="req" type="button" @click="toggleForged">
        <span class="verb">GET</span> /tasks/export<span class="q" :class="{ on: state.forged }">?teamId=team-b</span>
        <span class="as">signed in as Team A</span>
      </button>
    </section>

    <section class="out">
      <header>export.csv <span>{{ output.length }} rows</span></header>
      <TransitionGroup tag="ul" name="row" class="rows">
        <li v-for="r in output" :key="r.id" :class="{ foreign: r.foreign }" :style="{ viewTransitionName: `ns-row-${r.id}` }">
          <span class="ns-mono id">{{ r.id }}</span>
          <span class="t">{{ r.text }}</span>
          <em v-if="r.foreign">Team B</em>
        </li>
      </TransitionGroup>
    </section>

    <section class="tests" :class="{ running }">
      <header>
        <span>Tests</span>
        <b :class="failed ? 'bad' : 'ok'">{{ results.length - failed }} passed<template v-if="failed"> · {{ failed }} failed</template></b>
      </header>
      <TransitionGroup tag="ul" name="row" class="list">
        <li v-for="(r, i) in results" :key="r.name" :class="[r.pass ? 'pass' : 'fail', { boundary: r.boundary }]" :style="{ viewTransitionName: `ns-test-${i}` }">
          <span class="ic"><Icon :name="r.pass ? 'check' : 'x'" /></span>
          <span>{{ r.name }}</span>
        </li>
      </TransitionGroup>
    </section>
  </div>
</template>

<style scoped>
.lab {
  display: grid;
  grid-template-columns: 620px 1fr;
  grid-template-rows: 215px 1fr;
  gap: 16px 20px;
  height: 510px;
}

.editor {
  grid-row: 1 / -1;
  background: var(--z-ink);
  color: #cfcfcf;
  display: flex;
  flex-direction: column;
  view-transition-name: lab-editor;
}

.editor header,
.out header,
.tests header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 17px;
  padding: 12px 18px;
}

.editor header {
  color: #9a9a9a;
  border-bottom: 1px solid #333;
}

.tag {
  font-style: normal;
  font-family: var(--z-font-text);
  font-weight: 700;
  font-size: var(--ns-label);
  padding: 3px 10px;
  color: #fff;
}

.tag.is-seeded { background: var(--ns-red); }
.tag.is-fixed { background: var(--ns-teal); }
.tag.is-control { background: #555; }

.code {
  padding: 14px 0;
  flex: 1;
}

.ln {
  display: block;
  width: 100%;
  text-align: left;
  font: inherit;
  font-size: 17.5px;
  line-height: 2;
  white-space: pre;
  color: #d4d4d4;
  background: none;
  border: 0;
  padding: 0 18px 0 0;
  transition: background 400ms var(--ns-ease), opacity 400ms var(--ns-ease);
}

.ln i {
  font-style: normal;
  display: inline-block;
  width: 44px;
  text-align: right;
  padding-right: 14px;
  color: #5c5c5c;
}

button.ln {
  cursor: pointer;
}

.ln.hot {
  background: rgba(255, 255, 255, 0.06);
  outline: 1px dashed #555;
  outline-offset: -1px;
}

.ln.hot.is-seeded.revealed { background: rgba(222, 30, 5, 0.22); }
.ln.hot.is-fixed { background: rgba(3, 127, 145, 0.4); color: #fff; }

.revealed .bad {
  color: #ff9d8f;
}

.ln.gone {
  opacity: 0.35;
  text-decoration: line-through;
  text-decoration-color: var(--z-red-400);
  text-decoration-thickness: 2px;
}

.req {
  margin: 0 18px 18px;
  padding: 14px 16px;
  border: 1px solid #3a3a3a;
  background: #111;
  color: #fff;
  font: inherit;
  font-size: 17px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  gap: 0 4px;
  align-items: baseline;
}

.verb {
  color: var(--ns-frozen);
  font-weight: 700;
  margin-right: 8px;
}

.q {
  color: #ff9d8f;
  display: inline-block;
  transition: opacity 400ms var(--ns-ease), transform 500ms var(--ns-ease);
}

.q:not(.on) {
  opacity: 0;
  transform: translateY(-6px);
}

.as {
  width: 100%;
  font-family: var(--z-font-text);
  font-size: 19px;
  color: #9a9a9a;
  margin-top: 4px;
}

.out,
.tests {
  border: 1px solid var(--ns-line);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.out header,
.tests header {
  font-weight: 700;
  border-bottom: 1px solid var(--ns-line);
}

.out header span {
  font-weight: 400;
  color: var(--z-grey-600);
}

ul {
  list-style: none;
  margin: 0;
  padding: 6px 0;
  position: relative;
}

li {
  margin: 0;
  max-width: none;
}

li::before {
  display: none !important;
}

.rows li {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 5px 18px;
  font-size: 18px;
}

.rows .id {
  font-size: 17px;
  color: var(--z-grey-600);
}

.rows .t {
  flex: 1;
}

.rows li.foreign {
  background: var(--ns-red);
  color: #fff;
}

.rows li.foreign .id {
  color: #ffd9d3;
}

.rows em {
  font-style: normal;
  font-weight: 700;
  font-size: var(--ns-label);
}

.tests header b.ok { color: var(--ns-teal); }
.tests header b.bad { color: var(--ns-red); }

.list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 18px;
  font-size: 18px;
  transition: opacity 300ms linear;
}

.list .ic {
  font-size: 20px;
  display: flex;
}

.list li.pass .ic { color: var(--ns-teal); }
.list li.fail { color: var(--ns-red); font-weight: 700; }
.list li.boundary { border-top: 1px dashed var(--ns-line); }

.running .list li {
  opacity: 0.25;
}

.row-enter-active,
.row-leave-active,
.row-move {
  transition: all 500ms var(--ns-ease);
}

.row-enter-from,
.row-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.row-leave-active {
  position: absolute;
  left: 0;
  right: 0;
}
</style>
