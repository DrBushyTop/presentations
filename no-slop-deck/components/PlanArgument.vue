<!--
  Grilling as it really looks: the agent asks a batch of numbered questions,
  each with its own recommendation. The person answers by number, accepting
  most and overriding the one that matters. grill-with-docs writes the
  settled answers into CONTEXT.md. Only the caller-team answer is fixed for
  the teaching case; the others stand in for the real design run.
  0 the prompt · 1 the agent's batch · 2 the reply · 3 the record
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const qs = [
  { n: 'Q1', q: 'Can someone export another team\'s tasks?', r: 'No. Take the team from the session and ignore any team in the request.' },
  { n: 'Q2', q: 'Which tasks go in the file?', r: 'All of the team\'s tasks.' },
  { n: 'Q3', q: 'What is out of the first version?', r: 'Scheduling, other formats and column choices.' },
]
</script>

<template>
  <div class="grill">
    <section class="chat">
      <div class="msg me req"><small>You</small>Grill me on this plan so we can both close the gaps in our understanding.</div>

      <div class="msg agent" :class="{ on: step >= 1 }">
        <small>Agent asks</small>
        <div v-for="q in qs" :key="q.n" class="q">
          <p><b class="ns-mono">{{ q.n }}</b> {{ q.q }}</p>
          <p class="rec"><span>Recommendation</span> {{ q.r }}</p>
        </div>
      </div>

      <div class="msg me reply" :class="{ on: step >= 2 }">
        <span>Q1 agree.</span>
        <span class="over">Q2 no: only what the list shows now, with its filter.</span>
        <span>Q3 agree.</span>
      </div>
    </section>

    <section class="doc" :class="{ on: step >= 3 }">
      <header><span class="ns-mono">CONTEXT.md</span><em>grill with docs</em></header>
      <dl>
        <dt>Export</dt>
        <dd>A CSV of the caller's team's tasks, with the list's current filter.</dd>
        <dt>Team</dt>
        <dd>Comes from the session, never from the request.</dd>
      </dl>
      <footer class="ns-mono">+ docs/adr/0007-export-scope.md</footer>
    </section>
  </div>
</template>

<style scoped>
.grill {
  height: 510px;
  display: grid;
  grid-template-columns: 1fr 410px;
  gap: 32px;
}

.chat {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.msg {
  padding: 10px 16px;
  font-size: 20px;
  line-height: 1.3;
  transition: opacity 500ms var(--ns-ease), transform 600ms var(--ns-ease);
}

.msg small {
  display: block;
  font-size: 16px;
  font-weight: 700;
  opacity: 0.7;
}

.msg.me {
  align-self: flex-end;
  background: var(--ns-soft);
  font-weight: 700;
}

.msg.req {
  max-width: 82%;
  font-size: 22px;
}

.msg.agent {
  flex: 1;
  background: var(--z-ink);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 12px 18px;
}

.msg.agent small {
  color: var(--ns-frozen);
  opacity: 1;
}

.q p {
  margin: 0;
  max-width: none;
  font-size: 20px;
  line-height: 1.3;
}

.q b {
  margin-right: 6px;
  color: var(--ns-frozen);
}

.q .rec {
  margin-top: 2px;
  font-size: 18px;
  color: #cfcfcf;
}

.q .rec span {
  margin-right: 4px;
  font-weight: 700;
  color: var(--z-yellow);
}

.msg.reply {
  display: flex;
  flex-direction: column;
  max-width: 90%;
}

.reply .over {
  color: var(--ns-red);
}

.msg.agent:not(.on),
.msg.reply:not(.on) {
  opacity: 0;
  transform: translateY(8px);
}

.doc {
  align-self: center;
  border: 1px solid var(--ns-line);
  background: #fff;
  box-shadow: 0 24px 60px -34px rgba(26, 26, 26, 0.4);
  transition: opacity 600ms var(--ns-ease);
}

.doc:not(.on) {
  opacity: 0.15;
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
  padding: 10px 12px;
  white-space: nowrap;
  background: var(--z-ink);
  color: var(--ns-frozen);
  font-size: 16px;
}
</style>
