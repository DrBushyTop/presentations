<!--
  A shared plan in the style of GitHub Next's Chopin, redrawn from their demo
  videos (not a screenshot). The plan is my repo's issue #526, starting
  states, the feature from the grilling slide: the notes, decisions, research
  answer and open bug are real, shortened. It didn't happen in Chopin, and
  the colleagues' lines are made up.
  The document scrolls to what each click adds; the conversation grows from
  the bottom. One change per click.
  0 the rough notes · 1 a decision as a question · 2 the answer, written back
  · 3 research in the plan · 4 what's open · 5 a comment · 6 the agent
  applies it
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })

const notes = [
  'Who writes a state: the researcher or the app\'s developer?',
  'Does a task still need a reset between runs?',
  'What does the participant see while the app gets ready?',
  'Which sessions can we trust to report the app\'s states?',
]

const options = [
  { h: 'Any session that registers states', p: 'Simple, but a participant\'s browser can be tampered with.' },
  { h: 'Only sessions we started', p: 'Self-tests and automated explorations. A participant\'s report only checks their own run.', pick: true },
  { h: 'States typed into the project by hand', p: 'Nothing to trust, but the list drifts from the app.' },
]

const chat = [
  { at: 0, who: 'Roosa Melkko', av: 'RM', t: 'In the pilot nobody filled in "Preparing the app". Could it be a pick list?' },
  { at: 0, who: 'Pasi Huuhka', av: 'PH', t: '@chopin Read our notes and turn this into a plan. Anything you\'re not sure about, turn into decisions.' },
  { at: 1, who: 'Planner', bot: true, t: 'I\'ll read the plan and the repo first.', tool: 'Questions · 4 open', t2: 'Now the open choices as questions in the plan.' },
  { at: 2, who: 'Planner', bot: true, t: 'Answers are in. Writing them into the prose.' },
  { at: 3, who: 'Antti Sartjärvi', av: 'AS', t: '@chopin What reads the starting state today?' },
  { at: 3, who: 'Planner', bot: true, t: 'Researching it in the plan.', tool: 'Search repository' },
  { at: 4, who: 'Roosa Melkko', av: 'RM', t: '@chopin Can you call out what this puts at risk?' },
  { at: 4, who: 'Planner', bot: true, t: 'Added one under Open.' },
  { at: 6, sys: true, t: 'Antti Sartjärvi applied a comment' },
  { at: 6, who: 'Planner', bot: true, t: 'Answering Antti\'s question in the prose: apply routes inside the app, and a page load during it is a failure.' },
]

// Scroll the document so what this click adds is in view, keeping as much
// of what came before as fits. `marks[i]` is what click i adds.
const view = ref<HTMLElement>()
const marks = ref<HTMLElement[]>([])
const shift = ref(0)
const mark = (i: number) => (el: unknown) => { marks.value[i] = el as HTMLElement }

function measure() {
  const v = view.value
  const el = marks.value[Math.max(0, Math.min(props.step, 6))]
  if (!v || !el || !v.clientHeight) return
  const bottom = el.offsetTop + el.offsetHeight
  shift.value = Math.max(0, Math.min(el.offsetTop - 8, bottom - v.clientHeight + 18))
}

let ro: ResizeObserver | undefined
onMounted(() => {
  measure()
  document.fonts?.ready.then(measure)
  if (view.value) {
    ro = new ResizeObserver(measure)
    ro.observe(view.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())
watch(() => props.step, measure)
</script>

<template>
  <div class="chopin">
    <div class="bar">
      <span class="doc-name">Discovery <i>/</i> Starting states</span>
      <span class="people" aria-hidden="true"><i>PH</i><i>RM</i><i>AS</i></span>
      <b class="src">Redrawn after GitHub Next's Chopin</b>
    </div>

    <div class="panes">
      <div class="doc">
        <div class="tabs">
          <span class="ptab on">Document</span>
          <span class="ptab">Decisions <em>{{ step >= 2 ? 3 : 4 }}</em></span>
        </div>

        <div ref="view" class="view">
          <div class="col" :style="{ transform: `translateY(${-shift}px)` }">
            <!-- 0: the rough notes -->
            <div :ref="mark(0)" class="part">
              <div class="doc-h1">Tasks start from states the app registers</div>
              <p>In the pilot, both "Preparing the app" fields were left at their placeholders.</p>
              <p>Today the text reaches the app only through a hook whose code has to interpret prose.</p>
              <div class="doc-h2">Decisions</div>
              <p v-for="n in notes" :key="n" class="rough">{{ n }}</p>
            </div>

            <!-- 1-2: a decision put to the team, then the answer written back -->
            <div class="part" :class="{ settled: step >= 2 }">
              <div :ref="mark(1)" class="card reveal" :class="{ on: step >= 1 }">
                <div class="meta">
                  <span class="kind"><Icon name="branch" />Decision</span>
                  <span class="answered">Answered by <b>Pasi Huuhka</b></span>
                </div>
                <b class="q-h">Trusted reports</b>
                <span class="ask">Which sessions can add to an app's list of states?</span>
                <div v-for="o in options" :key="o.h" class="opt" :class="{ pick: o.pick }">
                  <i class="radio" />
                  <span><b>{{ o.h }}</b>{{ o.p }}</span>
                </div>
              </div>
              <p :ref="mark(2)" class="changed reveal" :class="{ on: step >= 2 }">States are kept per app, and only self-tests and automated explorations add to the list.</p>
            </div>

            <!-- 3-4: research inside the plan, then what's open -->
            <div class="part">
              <div :ref="mark(3)" class="card reveal" :class="{ on: step >= 3 }">
                <div class="meta">
                  <span class="kind"><Icon name="search" />Research</span>
                  <span class="ready"><Icon name="check" />Research ready</span>
                </div>
                <b class="q-h">What reads a task's starting state today?</b>
                <p>Only the SDK's <code>onTaskStart</code> hook. It hands the app the free text, and nothing checks that the app can produce the state.</p>
                <span class="foot">Sources: the SDK, docs/decisions.md · Researched by Planner</span>
              </div>
              <div class="doc-h2 reveal" :class="{ on: step >= 4 }">Open</div>
              <div :ref="mark(4)" class="callout reveal" :class="{ on: step >= 4 }">
                <b><Icon name="alert" />A state that navigates hits #476</b>
                <p>Replay freezes after the first route change. Out of scope here, but every task start will trigger it.</p>
              </div>
            </div>

            <!-- 5-6: a comment on a passage, then the agent applies it -->
            <div class="part" :class="{ commented: step >= 5, applied: step >= 6 }">
              <p><span class="anchor">A state's <code>apply</code> brings the app there from any state, so it's the reset too.</span></p>
              <div :ref="mark(5)" class="pop reveal" :class="{ on: step >= 5 }">
                <div class="pop-who"><i>AS</i><b>Antti Sartjärvi</b></div>
                <p>Our prototypes often do full page loads. What happens if <code>apply</code> navigates?</p>
                <div class="pop-foot">
                  <span>Planner will use this feedback to update the document.</span>
                  <b class="apply"><span class="todo">Apply feedback</span><span class="done"><Icon name="check" />Applied</span></b>
                </div>
              </div>
              <p :ref="mark(6)" class="changed reveal" :class="{ on: step >= 6 }"><code>apply</code> routes inside the app. A page load while it runs counts as a failure, and the next page load offers "Try again".</p>
            </div>
          </div>
        </div>
      </div>

      <div class="talk">
        <div class="tabs"><span class="ptab">Conversation</span></div>
        <div class="msgs">
          <template v-for="(m, i) in chat" :key="i">
            <div v-if="step >= m.at" class="msg" :class="{ sys: m.sys, fresh: m.at === step }">
              <template v-if="m.sys">{{ m.t }}</template>
              <template v-else>
                <i class="av" :class="{ bot: m.bot }">{{ m.bot ? '' : m.av }}</i>
                <div class="txt">
                  <b>{{ m.who }}</b>
                  <p>{{ m.t }}</p>
                  <span v-if="m.tool" class="tool ns-mono">{{ m.tool }}</span>
                  <p v-if="m.t2">{{ m.t2 }}</p>
                </div>
              </template>
            </div>
          </template>
        </div>
        <div class="input">Use @chopin to ask Chopin</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chopin {
  --hl: #fff3c4;
  --chg: #d7f3f6;
  height: 510px;
  display: grid;
  grid-template-rows: 42px 1fr;
  border: 1px solid var(--ns-line);
  background: #fff;
  box-shadow: 0 24px 60px -34px rgba(26, 26, 26, 0.4);
  overflow: hidden;
}

code {
  font-family: var(--ns-mono);
  font-size: 0.9em;
  padding: 0 4px;
  background: var(--ns-soft);
}

/* ---------- Window bar ---------- */

.bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 18px;
  background: var(--ns-soft);
  border-bottom: 1px solid var(--ns-line);
}

.doc-name {
  font-size: 16px;
  color: var(--z-ink-800);
}

.doc-name i {
  margin: 0 4px;
  font-style: normal;
  color: var(--z-grey-600);
}

.people {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.people i,
.pop-who i,
.av {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--z-ink-800);
  color: #fff;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
}

.src {
  font-size: 16px;
}

/* ---------- Panes ---------- */

.panes {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  min-height: 0;
}

.doc,
.talk {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.talk {
  border-left: 1px solid var(--ns-line);
}

.tabs {
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 16px;
  border-bottom: 1px solid var(--ns-line);
}

.ptab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  font-size: 16px;
  color: var(--z-grey-600);
}

.ptab.on {
  background: var(--ns-soft);
  color: var(--z-ink);
  font-weight: 700;
}

.ptab em {
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  border-radius: 11px;
  background: var(--ns-teal);
  color: #fff;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
}

/* ---------- Document ---------- */

.view {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.col {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 26px;
  padding: 16px 30px 30px;
  transition: transform 900ms var(--ns-ease);
}

/* Not positioned, so the marks' offsetTop is measured from .col. */
.part {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.part p {
  margin: 0;
  max-width: none;
  font-size: 18px;
  line-height: 1.4;
  color: var(--z-ink-800);
}

.doc-h1 {
  font-family: var(--z-font-display);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.doc-h2 {
  margin-top: 6px;
  font-size: 21px;
  font-weight: 800;
}

.part .rough {
  padding-left: 14px;
  border-left: 3px solid var(--ns-line);
}

.reveal {
  transition: opacity 600ms var(--ns-ease) 250ms, transform 700ms var(--ns-ease) 250ms;
}

.reveal:not(.on) {
  opacity: 0;
  transform: translateY(8px);
}

/* Cards: a decision and a research result */
.card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px 14px;
  background: #fafaf8;
  border: 1px solid var(--ns-line);
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  color: var(--z-grey-600);
}

.kind,
.ready {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
}

.kind { color: var(--z-ink); }
.ready { color: var(--ns-teal); }

.q-h {
  font-size: 19px;
}

.ask {
  margin-bottom: 4px;
  font-size: 17px;
  color: var(--z-ink-800);
}

.opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 16px;
  line-height: 1.3;
  color: var(--z-grey-600);
}

.opt b {
  display: block;
  font-size: 17px;
  color: var(--z-ink);
}

.radio {
  flex: none;
  width: 16px;
  height: 16px;
  margin-top: 3px;
  border: 2px solid #b5b5b0;
  border-radius: 50%;
  transition: border-color 300ms, box-shadow 300ms;
}

/* The answer: the chosen option, signed. */
.settled .pick .radio {
  border-color: var(--ns-teal);
  box-shadow: inset 0 0 0 3px #fff, inset 0 0 0 8px var(--ns-teal);
}

.meta .answered {
  opacity: 0;
  transition: opacity 500ms var(--ns-ease);
}

.settled .meta .answered {
  opacity: 1;
}

.meta .answered b { color: var(--z-ink); }

.part .changed {
  padding: 4px 8px;
  margin: 0 -8px;
  background: var(--chg);
}

.foot {
  font-size: 15px;
  color: var(--z-grey-600);
}

.callout {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 16px 12px;
  background: var(--z-callout-bg);
  border-left: 4px solid var(--ns-red);
}

.callout b {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: var(--ns-red);
}

.callout p { font-size: 17px; }

/* A comment on a passage, then Apply feedback and the agent's answer in
   the prose. */
.anchor {
  transition: background-color 500ms, box-shadow 500ms;
}

.commented .anchor {
  background: var(--hl);
  box-shadow: 0 2px 0 #e2c94c;
}

.pop {
  align-self: flex-end;
  width: 520px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--ns-line);
  box-shadow: 0 16px 40px -18px rgba(26, 26, 26, 0.45);
}

.pop-who {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.part .pop p { font-size: 17px; }

.pop-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: var(--z-grey-600);
}

.apply {
  position: relative;
  flex: none;
  display: grid;
  padding: 3px 10px;
  border: 1px solid var(--ns-teal);
  color: var(--ns-teal);
  font-size: 15px;
}

.apply > span {
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: opacity 300ms;
}

.apply .done { opacity: 0; }

.apply {
  transition: background-color 300ms, color 300ms;
}

.applied .apply {
  background: var(--ns-teal);
  color: #fff;
}

.applied .apply .todo { opacity: 0; }
.applied .apply .done { opacity: 1; }

/* ---------- Conversation ---------- */

.msgs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 14px;
  padding: 12px 16px;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, transparent 0, #000 40px);
}

.msg {
  flex: none;
  display: flex;
  gap: 10px;
}

.msg.fresh {
  animation: msg 600ms var(--ns-ease) both;
  animation-delay: 600ms;
}

.msg.fresh + .msg.fresh {
  animation-delay: 1100ms;
}

@keyframes msg {
  from { opacity: 0; transform: translateY(10px); }
}

.av.bot {
  background: var(--ns-teal);
}

.txt {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.txt b {
  font-size: 15px;
}

.txt p {
  margin: 0;
  max-width: none;
  font-size: 16px;
  line-height: 1.35;
  color: var(--z-ink-800);
}

.tool {
  align-self: flex-start;
  margin: 3px 0;
  padding: 1px 8px;
  background: var(--ns-soft);
  font-size: 14px;
  color: var(--z-grey-600);
}

.msg.sys {
  justify-content: center;
  font-size: 15px;
  color: var(--z-grey-600);
}

.input {
  flex: none;
  margin: 0 14px 14px;
  padding: 12px 14px;
  border: 1px solid var(--ns-line);
  font-size: 16px;
  color: #9a9a95;
}
</style>
