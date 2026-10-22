<!--
  One copy of the app per agent, on one machine. Each worktree starts its own
  instance with its own ports, data and browser, so several agents can verify
  at once. The setup is my repo's: each worktree's instance takes the first
  free block of ports from 5300 up and gets its own database and storage
  container. The worktree names are illustrative.
  0 one instance · 1 three in parallel · 2 what stops it
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const lanes = [
  { wt: 'replay-routes', api: 5300, ui: 5301, check: 'Replay shows the invoice' },
  { wt: 'starting-states', api: 5310, ui: 5311, check: 'Task opens on its state' },
  { wt: 'safari-audio', api: 5320, ui: 5321, check: 'Safari recording seeks' },
]
const blockers = [
  { bad: 'Fixed ports', good: 'Free ports per worktree' },
  { bad: 'One shared database', good: 'A database per worktree' },
  { bad: 'One browser profile', good: 'A browser per agent' },
]
</script>

<template>
  <div class="pa">
    <div class="lanes">
      <section v-for="(l, i) in lanes" :key="l.wt" class="lane" :class="{ on: i === 0 || step >= 1 }" :style="{ '--i': i }">
        <header class="ns-mono"><Icon name="branch" /> {{ l.wt }}</header>
        <div class="term ns-mono">
          <p class="cmd">$ scripts/dev/instance.sh start</p>
          <p class="dim">api :{{ l.api }} · web :{{ l.ui }}</p>
          <p class="dim">own database and storage</p>
        </div>
        <div class="browser">
          <div class="bar"><i /><i /><i /><span class="ns-mono">localhost:{{ l.ui }}</span></div>
          <p><Icon name="check" />{{ l.check }}</p>
        </div>
      </section>
    </div>
    <div class="stops" :class="{ on: step >= 2 }">
      <b>What stops it</b>
      <div v-for="b in blockers" :key="b.bad" class="stop">
        <span class="bad"><Icon name="x" />{{ b.bad }}</span>
        <span class="good"><Icon name="arrow" />{{ b.good }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pa {
  height: 510px;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 20px;
}

.lanes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  min-height: 0;
}

.lane {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ns-line);
  background: #fff;
  box-shadow: 0 18px 40px -28px rgba(26, 26, 26, 0.4);
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
  transition-delay: calc(var(--i) * 120ms);
}

.lane:not(.on) {
  opacity: 0.1;
  transform: translateY(16px);
}

.lane header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 4px solid var(--ns-teal);
}

.term {
  background: var(--z-ink);
  padding: 12px 16px;
}

.term p {
  margin: 0;
  max-width: none;
  font-size: 16px;
  line-height: 1.7;
}

.cmd { color: #f2f2f2; }
.dim { color: #9a9a9a; }

.browser {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.browser .bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--ns-soft);
  border-bottom: 1px solid var(--ns-line);
}

.browser .bar i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #cfcfcc;
}

.browser .bar span {
  margin-left: 6px;
  padding: 2px 8px;
  background: #fff;
  font-size: 15px;
}

.browser p {
  flex: 1;
  margin: 0;
  max-width: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  font-size: 20px;
  font-weight: 700;
  color: var(--ns-teal);
}

.browser p :deep(.ns-icon) {
  font-size: 24px;
}

.stops {
  display: grid;
  grid-template-columns: 180px repeat(3, 1fr);
  gap: 16px;
  align-items: stretch;
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.stops:not(.on) {
  opacity: 0;
  transform: translateY(14px);
}

.stops > b {
  display: flex;
  align-items: center;
  font-size: 22px;
}

.stop {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
  background: var(--ns-soft);
}

.stop span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 19px;
  font-weight: 700;
}

.stop .bad { color: var(--ns-red); }
.stop .good { color: var(--ns-teal); }
</style>
