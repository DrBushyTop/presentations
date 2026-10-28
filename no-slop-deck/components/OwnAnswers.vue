<!--
  The agent answers its own factual questions from real sources, each answer
  with a reference, so only the product choices come back to a person.
  From my repo's issue #257: the telemetry, code and tests are real; the last
  question had no answer in code or docs, so the agent measured it in a
  throwaway environment. The numbers are that probe's.
  0 the questions · 1 telemetry · 2 code and tests · 3 the live run · 4 the rule
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const rows = [
  { q: 'Which replies fail?', src: 'Telemetry', at: 1, a: 'Every one over about 12 KB', ref: 'sandbox_protocol_failure, by size' },
  { q: 'Does the guest rebuild split replies?', src: 'Code', at: 2, a: 'Yes. It reads whole lines.', ref: 'worker-v2.mjs:49' },
  { q: 'Does a test send big replies?', src: 'Tests', at: 2, a: 'One sends 50 KB, in pieces up to 24 KB.', ref: 'ExecStreamTests.cs:60' },
  { q: 'Does the platform cap one message?', src: 'A live run', at: 3, a: '16,376 bytes arrive. 16,404 vanish.', ref: 'throwaway environment, then deleted' },
]

// Rows revealed on the same click come in one after another.
const delay = (i: number) => i - rows.findIndex(r => r.at === rows[i].at)
</script>

<template>
  <div class="oa">
    <div class="head">
      <span>The agent asks</span>
      <span :class="{ on: step >= 1 }">It looks in</span>
      <span :class="{ on: step >= 1 }">And answers, with a reference</span>
    </div>
    <div v-for="(r, i) in rows" :key="r.q" class="row" :style="{ '--i': delay(i) }">
      <p class="q"><Icon name="bot" />{{ r.q }}</p>
      <p class="src" :class="{ on: step >= r.at }">{{ r.src }}</p>
      <div class="a" :class="{ on: step >= r.at }">
        <b>{{ r.a }}</b>
        <span class="ns-mono">{{ r.ref }}</span>
      </div>
    </div>
    <div class="foot" :class="{ on: step >= 4 }">
      <p>Not a guess, not a question for you: real data, with a reference.</p>
    </div>
  </div>
</template>

<style scoped>
.oa {
  height: 510px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.head,
.row {
  display: grid;
  grid-template-columns: 1.15fr 180px 1.25fr;
  gap: 22px;
}

.head span {
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
  padding-bottom: 8px;
  border-bottom: 2px solid var(--z-ink);
  transition: opacity 500ms var(--ns-ease);
}

.head span:not(:first-child):not(.on) {
  opacity: 0;
}

.row {
  flex: 1;
}

.row > * {
  margin: 0;
  max-width: none;
}

.q {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  background: var(--z-ink);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
}

.q :deep(.ns-icon) {
  font-size: 24px;
  color: var(--ns-frozen);
}

.src {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--z-ink);
  font-size: 20px;
  font-weight: 800;
  text-align: center;
}

.a {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 0 18px;
  background: #e6f4f6;
  border-left: 6px solid var(--ns-teal);
}

.a b {
  font-size: 21px;
  line-height: 1.25;
}

.a span {
  font-size: 16px;
  color: var(--ns-teal);
}

.src,
.a {
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
  transition-delay: calc(var(--i) * 100ms);
}

.src:not(.on),
.a:not(.on) {
  opacity: 0;
  transform: translateX(-20px);
}

.foot {
  display: flex;
  align-items: baseline;
  gap: 22px;
  padding: 16px 22px;
  background: var(--ns-teal);
  color: #fff;
  transition: opacity 600ms var(--ns-ease);
}

.foot:not(.on) {
  opacity: 0;
}

.foot p {
  margin: 0;
  max-width: none;
  font-size: 25px;
  font-weight: 800;
}

.foot span {
  font-size: 17px;
  color: #e0f2f4;
}
</style>
