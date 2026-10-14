<!--
  The agent answers its own factual questions from real sources, each answer
  with a reference, so only the product choices come back to a person.
  The first answer is the demo app's real code. The others are illustrative.
  0 the questions · 1 sources and answers · 2 what still comes to you
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const rows = [
  { q: 'Does the list show done tasks?', src: 'Code', a: "Yes. 'all' is the default filter.", ref: 'client/TaskList.tsx:27' },
  { q: 'How big does one team\'s export get?', src: 'Database', a: 'Largest team: 8,412 tasks', ref: 'SELECT count(*) … GROUP BY team_id' },
  { q: 'Has anyone asked for this before?', src: 'Linear, Slack', a: 'Two tickets. Both want open tasks only.', ref: 'DOC-118 · DOC-131' },
  { q: 'How did we fix CSV quoting last time?', src: 'Past sessions', a: 'Quote every field, double inner quotes', ref: 'recall: session of 14 Sep' },
]
</script>

<template>
  <div class="oa">
    <div class="head">
      <span>The agent asks</span>
      <span :class="{ on: step >= 1 }">It looks in</span>
      <span :class="{ on: step >= 1 }">And answers, with a reference</span>
    </div>
    <div v-for="(r, i) in rows" :key="r.q" class="row" :style="{ '--i': i }">
      <p class="q"><Icon name="bot" />{{ r.q }}</p>
      <p class="src" :class="{ on: step >= 1 }">{{ r.src }}</p>
      <div class="a" :class="{ on: step >= 1 }">
        <b>{{ r.a }}</b>
        <span class="ns-mono">{{ r.ref }}</span>
      </div>
    </div>
    <div class="foot" :class="{ on: step >= 2 }">
      <p>"Not by hallucinating, not by guessing, but actually real data."</p>
      <span>Poteto</span>
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
