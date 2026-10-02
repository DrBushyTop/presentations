<!--
  Grilling, drawn as the interview it is: the agent asks one question at a
  time, the person answers, and grill-with-docs writes the settled answer into
  CONTEXT.md. Only the caller-team boundary is a fixed decision here; the
  other two show where the real design run will land.
  0 the request · 1 the agent's questions · 2 the answers · 3 the record
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const turns = [
  { q: 'Can someone export another team\'s tasks?', a: 'No. Only the signed-in user\'s team.', fixed: true },
  { q: 'All tasks, or what the list shows now?', a: 'Decide which filters and columns carry over.' },
  { q: 'What belongs in the first version?', a: 'Agree the limits. Leave the rest out.' },
]
</script>

<template>
  <div class="grill">
    <section class="chat">
      <div class="msg me req"><small>Request</small>Let me download the task list for weekly reporting.</div>
      <template v-for="(t, i) in turns" :key="i">
        <div class="msg agent" :class="{ on: step >= 1 }" :style="{ '--i': i }"><small>Agent asks</small>{{ t.q }}</div>
        <div class="msg me ans" :class="{ on: step >= 2, 'is-set': t.fixed }" :style="{ '--i': i }">{{ t.a }}</div>
      </template>
    </section>

    <section class="doc" :class="{ on: step >= 3 }">
      <header><span class="ns-mono">CONTEXT.md</span><em>grill with docs</em></header>
      <dl>
        <dt>Export</dt>
        <dd>A CSV of the caller's team's tasks. Never another team's.</dd>
        <dt>Team</dt>
        <dd>Comes from the session, not from the request.</dd>
      </dl>
      <footer class="ns-mono">+ docs/adr/0007-export-scope.md</footer>
    </section>
  </div>
</template>

<style scoped>
.grill {
  height: 510px;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 36px;
}

.chat {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.msg {
  max-width: 78%;
  padding: 10px 16px;
  font-size: 21px;
  line-height: 1.3;
  transition: opacity 500ms var(--ns-ease), transform 600ms var(--ns-ease);
  transition-delay: calc(var(--i, 0) * 140ms);
}

.msg small {
  display: block;
  font-size: 16px;
  font-weight: 700;
  opacity: 0.7;
}

.msg.agent {
  align-self: flex-start;
  background: var(--z-ink);
  color: #fff;
}

.msg.agent small {
  color: var(--ns-frozen);
  opacity: 1;
}

.msg.me {
  align-self: flex-end;
  background: var(--ns-soft);
  font-weight: 700;
}

.msg.req {
  max-width: 88%;
  font-size: 24px;
}

.msg.ans.is-set {
  background: #e3f4f6;
  color: var(--ns-teal);
}

.msg.agent:not(.on),
.msg.ans:not(.on) {
  opacity: 0;
  transform: translateY(8px);
}

.doc {
  align-self: center;
  border: 1px solid var(--ns-line);
  background: #fff;
  box-shadow: 0 24px 60px -34px rgba(26, 26, 26, 0.4);
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.doc:not(.on) {
  opacity: 0.15;
  transform: translateX(14px);
}

.doc header {
  display: flex;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--ns-line);
  font-size: 16px;
  color: var(--z-grey-600);
}

.doc header em {
  font-style: normal;
  font-weight: 700;
  color: var(--ns-teal);
}

dl {
  margin: 0;
  padding: 18px 20px 6px;
}

dt {
  font-family: var(--z-font-display);
  font-size: 26px;
  font-weight: 800;
}

dd {
  margin: 2px 0 16px;
  font-size: 21px;
  line-height: 1.35;
}

.doc footer {
  margin: 0 20px 18px;
  padding: 10px 14px;
  background: var(--z-ink);
  color: var(--ns-frozen);
  font-size: 17px;
}
</style>
