<!--
  Where you are the bottleneck: the person relaying context between the agent
  and everything it can't reach. Poteto's phrase is "the meat proxy".
  0 you relay everything · 1 the quote · 2 the agent reaches each source itself
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const rows = [
  { src: 'Browser and DevTools', you: 'You copy the error back', agent: 'The agent drives the browser' },
  { src: 'The code', you: 'You answer what the code could', agent: 'The agent reads it and cites it' },
  { src: 'Slack, Linear, email', you: 'You paste in the bug report', agent: 'A routine passes reports in' },
  { src: 'CI and review bots', you: 'You relay the failing check', agent: 'A babysitter reads the checks' },
]
</script>

<template>
  <div class="bn" :class="{ direct: step >= 2 }">
    <div class="agent">
      <Icon name="bot" />
      <b>Agent</b>
    </div>
    <div class="rows">
      <div v-for="(r, i) in rows" :key="r.src" class="row" :style="{ '--i': i }">
        <div class="wire">
          <span class="chip you"><Icon name="user" />{{ r.you }}</span>
          <span class="chip it"><Icon name="arrow" />{{ r.agent }}</span>
        </div>
        <div class="src">{{ r.src }}</div>
      </div>
    </div>
    <div class="foot">
      <Show :step="step" :at="1" :until="2" class="q">
        <p>"I was the meat proxy between my agent and Chrome DevTools."</p>
        <span>Poteto, SpaceX AI</span>
      </Show>
      <Show :step="step" :at="2" class="q ok">
        <p>Your job moves to setting up what the agent can reach.</p>
      </Show>
    </div>
  </div>
</template>

<style scoped>
.bn {
  height: 510px;
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 1fr auto;
  gap: 20px 0;
}

.agent {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: var(--z-ink);
  color: #fff;
}

.agent :deep(.ns-icon) {
  font-size: 54px;
  color: var(--ns-frozen);
}

.agent b {
  font-size: 26px;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 290px;
}

.wire {
  position: relative;
  display: grid;
  place-items: center;
}

.wire::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  border-top: 4px dashed var(--z-grey-300, #bdbdbd);
  transition: border-color 600ms var(--ns-ease);
}

.direct .wire::before {
  border-top-style: solid;
  border-color: var(--ns-teal);
}

.chip {
  grid-area: 1 / 1;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  font-size: 21px;
  font-weight: 700;
  transition: opacity 500ms var(--ns-ease), transform 700ms var(--ns-ease);
  transition-delay: calc(var(--i) * 90ms);
}

.chip :deep(.ns-icon) {
  font-size: 22px;
}

.you {
  background: #fff1ee;
  border: 3px solid var(--ns-red);
  color: var(--z-ink);
}

.you :deep(.ns-icon) {
  color: var(--ns-red);
}

.it {
  background: #fff;
  border: 3px solid var(--ns-teal);
  color: var(--ns-teal);
}

.direct .you,
.bn:not(.direct) .it {
  opacity: 0;
  transform: translateY(10px);
}

.src {
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: var(--ns-soft);
  border-left: 5px solid var(--z-ink);
  font-size: 22px;
  font-weight: 800;
}

.foot {
  grid-column: 1 / -1;
  display: grid;
  min-height: 70px;
}

.q {
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 0 24px;
  background: var(--z-ink);
  color: #fff;
}

.q.ok {
  background: var(--ns-teal);
}

.q p {
  margin: 0;
  max-width: none;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.q span {
  font-size: 17px;
  color: #cfcfcf;
  white-space: nowrap;
}
</style>
