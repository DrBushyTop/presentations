<!--
  Local review as part of the implementer's instructions, not a separate
  request. The instruction is given once, before work starts. For each slice
  the agent builds, sends review subagents, fixes what it judges worth fixing,
  reruns the checks and only then reports back. The person decides: next
  slice, or a PR for this one.
  0 the instruction and the build · 1 review and fix, unattended · 2 the report and your decision
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const lenses = ['Functional', 'Non-functional', 'Security']
const report = [
  { ok: true, t: 'Fixed: title starting with = ran as a formula' },
  { ok: true, t: 'Fixed: every row loaded into memory' },
  { ok: false, t: 'Skipped: rename toRow, style only' },
]
</script>

<template>
  <div class="loc">
    <section class="instr">
      <small>Your instruction, once, before work starts</small>
      <p class="ns-mono">After each slice, run the review subagents and fix what matters. Rerun the checks, then come back to me.</p>
    </section>

    <section class="agent">
      <header>Agent, unattended <span class="ns-mono">slice 2</span></header>
      <ol class="steps">
        <li class="on"><span class="n ns-mono">1</span><b>Build the slice</b></li>
        <li :class="{ on: step >= 1 }">
          <span class="n ns-mono">2</span><b>Review subagents</b>
          <div class="lenses"><i v-for="l in lenses" :key="l">{{ l }}</i></div>
        </li>
        <li :class="{ on: step >= 1 }"><span class="n ns-mono">3</span><b>Fix what matters</b><em>its judgement</em></li>
        <li :class="{ on: step >= 1 }"><span class="n ns-mono">4</span><b>Rerun the checks</b></li>
      </ol>
      <svg class="back" viewBox="0 0 20 100" preserveAspectRatio="none" aria-hidden="true" :class="{ on: step >= 1 }">
        <path d="M2,92 C18,92 18,8 2,8" vector-effect="non-scaling-stroke" />
      </svg>
    </section>

    <section class="you" :class="{ on: step >= 2 }">
      <header>You</header>
      <div class="report">
        <small>Slice 2 done. Checks green.</small>
        <p v-for="r in report" :key="r.t" :class="{ skip: !r.ok }">
          <Icon :name="r.ok ? 'check' : 'dot'" /> {{ r.t }}
        </p>
      </div>
      <div class="choice">
        <span>Next slice</span>
        <em>or</em>
        <span>Open a PR</span>
      </div>
    </section>

    <p class="take" :class="{ on: step >= 2 }">Your attention starts after the models have checked.</p>
  </div>
</template>

<style scoped>
.loc {
  height: 510px;
  display: grid;
  grid-template-columns: 1fr 380px;
  grid-template-rows: auto 1fr auto;
  gap: 18px 28px;
}

.instr {
  grid-column: 1 / -1;
  padding: 14px 20px;
  background: var(--z-ink);
  color: #fff;
}

.instr small {
  font-size: 16px;
  font-weight: 700;
  color: var(--ns-frozen);
}

.instr p {
  margin: 4px 0 0;
  max-width: none;
  font-size: 20px;
  line-height: 1.45;
}

.agent {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 2px dashed #b5b5b2;
  padding: 12px 52px 12px 18px;
}

.agent header,
.you header {
  display: flex;
  justify-content: space-between;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
}

.steps {
  flex: 1;
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.steps li {
  margin: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 14px;
  opacity: 0.25;
  transition: opacity 500ms var(--ns-ease);
}

.steps li::before {
  display: none !important;
}

.steps li.on {
  opacity: 1;
}

.steps .n {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--ns-teal);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}

.steps b {
  font-size: 23px;
}

.steps em {
  font-style: normal;
  font-size: var(--ns-label);
  color: var(--z-grey-600);
}

.lenses {
  display: flex;
  gap: 8px;
  flex-basis: 100%;
  padding-left: 48px;
}

.lenses i {
  font-style: normal;
  padding: 3px 10px;
  border: 2px solid var(--z-ink);
  font-size: 17px;
  font-weight: 700;
}

.back {
  position: absolute;
  right: 14px;
  top: 52px;
  bottom: 24px;
  width: 26px;
  height: calc(100% - 76px);
  overflow: visible;
  opacity: 0;
  transition: opacity 500ms var(--ns-ease);
}

.back.on {
  opacity: 1;
}

.back path {
  fill: none;
  stroke: var(--ns-teal);
  stroke-width: 3;
  stroke-dasharray: 6 6;
}

.you {
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: opacity 600ms var(--ns-ease);
}

.you:not(.on) {
  opacity: 0.12;
}

.report {
  flex: 1;
  padding: 14px 18px;
  background: var(--ns-soft);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.report small {
  font-size: 20px;
  font-weight: 800;
}

.report p {
  margin: 0;
  max-width: none;
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 19px;
  line-height: 1.3;
  color: var(--ns-teal);
  font-weight: 700;
}

.report p.skip {
  color: var(--z-grey-600);
  font-weight: 400;
}

.choice {
  display: flex;
  align-items: center;
  gap: 10px;
}

.choice span {
  flex: 1;
  padding: 10px 12px;
  text-align: center;
  border: 2px solid var(--z-ink);
  font-size: 20px;
  font-weight: 800;
}

.choice em {
  font-style: normal;
  font-size: var(--ns-label);
  color: var(--z-grey-600);
}

.take {
  grid-column: 1 / -1;
  margin: 0;
  max-width: none;
  padding: 14px 22px;
  background: var(--z-ink);
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  transition: opacity 500ms var(--ns-ease);
}

.take:not(.on) {
  opacity: 0;
}
</style>
