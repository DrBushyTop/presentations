<!--
  The pull request the talk opens and closes on.
  mode "hook":     0 card · 1 the vote · 2 the question nobody asked
  mode "evidence": the same PR with the evidence built during the talk
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ step?: number, mode?: 'hook' | 'evidence' }>(), { step: 0, mode: 'hook' })

const hookChecks = [
  { icon: 'check', tone: 'ok', label: '3 tests passed', meta: 'unit tests' },
  { icon: 'check', tone: 'ok', label: 'Lint, typecheck, build', meta: 'CI' },
  { icon: 'bot', tone: 'ok', label: 'Review bot: no issues found', meta: 'automated' },
  { icon: 'user', tone: 'ok', label: 'Approved by 1 reviewer', meta: '"LGTM, nice tests"' },
] as const

const evidence = [
  { icon: 'check', tone: 'ok', label: 'Fact: scoping lives in the route, not the query', meta: 'research' },
  { icon: 'check', tone: 'ok', label: 'Decision: caller\'s team only', meta: 'design' },
  { icon: 'check', tone: 'ok', label: 'Forged teamId returns 0 foreign rows', meta: 'boundary check' },
  { icon: 'check', tone: 'ok', label: 'Check fails without the predicate', meta: 'negative control' },
  { icon: 'check', tone: 'ok', label: 'Review stopped: round 2, nothing above the bar', meta: 'stop rule' },
  { icon: 'clock', tone: 'watch', label: 'Behind a flag. I watch exports per team.', meta: 'rollout' },
] as const

const rows = computed(() => (props.mode === 'hook' ? hookChecks : evidence))
</script>

<template>
  <div class="pr" :class="mode">
    <div class="head">
      <div class="title">Add CSV export for team tasks <span>#482</span></div>
      <div class="meta">
        <span class="state">Open</span>
        <span class="branch"><Icon name="branch" /> agent/export-csv</span>
        <span class="size"><b class="plus">+146</b> <b class="minus">−3</b> · 4 files</span>
      </div>
    </div>

    <div class="body">
      <ul class="checks">
        <li v-for="r in rows" :key="r.label" :class="r.tone">
          <span class="ic"><Icon :name="r.icon" /></span>
          <span class="label">{{ r.label }}</span>
          <span class="m">{{ r.meta }}</span>
        </li>
      </ul>

      <div class="diff ns-mono" aria-label="Diff of routes/export.ts">
        <div class="file">routes/export.ts</div>
        <div class="dl add"><i>+</i>export async function exportTasks(req) {</div>
        <div class="dl add"><i>+</i>  const session = await requireSession(req)</div>
        <div class="dl add" :class="{ lit: mode === 'evidence' }"><i>+</i>  const teamId = <template v-if="mode === 'hook'">req.query.teamId ?? </template>session.teamId</div>
        <div class="dl add"><i>+</i>  const rows = await db.tasks.findMany({</div>
        <div class="dl add"><i>+</i>    where: { teamId },</div>
        <div class="dl add"><i>+</i>  })</div>
        <div class="dl add"><i>+</i>  return csv(rows, COLUMNS)</div>
        <div class="dl add"><i>+</i>}</div>
      </div>
    </div>

    <div v-if="mode === 'hook'" class="prompt" :class="{ on: step >= 1 }">
      <div class="vote" :class="{ gone: step >= 2 }">Hands up if you would merge this.</div>
      <div class="question" :class="{ on: step >= 2 }">Which team's tasks can this export return?</div>
    </div>
    <div v-else class="prompt on done">
      <div class="question on">Same diff. Now there is evidence for it.</div>
    </div>
  </div>
</template>

<style scoped>
.pr {
  position: relative;
  height: 540px;
  border: 1px solid var(--ns-line);
  background: #fff;
  box-shadow: 0 24px 60px -30px rgba(26, 26, 26, 0.35);
  display: grid;
  grid-template-rows: auto 1fr auto;
  view-transition-name: pr-card;
}

.head {
  padding: 24px 30px 18px;
  border-bottom: 1px solid var(--ns-line);
}

.title {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.title span {
  color: var(--z-grey-600);
  font-weight: 400;
}

.meta {
  margin-top: 10px;
  display: flex;
  gap: 22px;
  align-items: center;
  font-size: 17px;
  color: var(--z-ink-800);
}

.state {
  background: var(--ns-teal);
  color: #fff;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 16px;
}

.branch {
  font-family: var(--ns-mono);
  font-size: 17px;
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.plus { color: var(--ns-teal); }
.minus { color: var(--ns-red); }

.body {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  min-height: 0;
}

.checks {
  list-style: none;
  margin: 0;
  padding: 18px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.checks li {
  display: grid;
  grid-template-columns: 34px 1fr;
  grid-template-rows: auto auto;
  column-gap: 8px;
  padding: 9px 0;
  margin: 0;
  max-width: none;
  border-bottom: 1px solid var(--ns-soft);
}

.checks li::before {
  display: none !important;
}

.checks .ic {
  grid-row: span 2;
  font-size: 24px;
  color: var(--ns-teal);
  padding-top: 2px;
}

.checks li.watch .ic {
  color: var(--z-grey-600);
}

.checks .label {
  font-size: 20px;
  font-weight: 650;
  line-height: 1.25;
}

.checks .m {
  font-size: 17px;
  color: var(--z-grey-600);
}

.evidence .checks li {
  padding: 7px 0;
  grid-template-columns: 30px 1fr;
  grid-template-rows: auto;
  align-items: baseline;
}

.evidence .checks .ic {
  grid-row: auto;
  font-size: 20px;
}

.evidence .checks .label {
  font-size: 18px;
}

.evidence .checks .m {
  display: none;
}

.diff {
  background: var(--z-ink);
  color: #d6d6d6;
  padding: 18px 22px;
  font-size: var(--ns-code);
  line-height: 1.75;
  overflow: hidden;
}

.file {
  color: #9a9a9a;
  margin-bottom: 8px;
}

.dl {
  white-space: pre;
  color: var(--z-teal-300);
}

.dl i {
  font-style: normal;
  color: #6e6e6e;
  display: inline-block;
  width: 1.4ch;
}

.dl.lit {
  background: rgba(5, 195, 222, 0.14);
  color: #fff;
}

.prompt {
  position: relative;
  height: 74px;
  background: var(--z-ink);
  color: #fff;
  overflow: hidden;
  transition: background 600ms var(--ns-ease);
}

.prompt:not(.on) {
  background: transparent;
}

.prompt:not(.on) .vote {
  opacity: 0;
  transform: translateY(100%);
}

.prompt.on:has(.question.on) {
  background: var(--ns-red);
}

.prompt.done {
  background: var(--ns-teal) !important;
}

.vote,
.question {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 0 30px;
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -0.01em;
  transition: transform 600ms var(--ns-ease), opacity 400ms var(--ns-ease);
}

.vote.gone {
  transform: translateY(-100%);
  opacity: 0;
}

.question:not(.on) {
  transform: translateY(100%);
  opacity: 0;
}
</style>
