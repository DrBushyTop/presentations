<!--
  Planning tools, redrawn (not screenshots). Top: a Chopin-style shared plan,
  where research questions, decision discussions and diagrams live next to
  the lines they are about. Bottom: HumanLayer's workflow phases, each handing
  a written artifact to the next.
  0 the shared plan · 1 threads on specific lines · 2 HumanLayer's phases
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const phases = [
  { f: 'Research', d: 'How it works today' },
  { f: 'Design discussion', d: 'Decisions, argued' },
  { f: 'Structure outline', d: 'Vertical phases' },
  { f: 'Implement', d: 'One phase at a time', code: true },
]
</script>

<template>
  <div class="tools">
    <div class="top">
      <section class="doc">
        <header><span class="ns-mono">export-tasks.mdx</span><em>GitHub Next · Chopin</em></header>
        <div class="body">
          <h4>Export tasks as CSV</h4>
          <p class="ln a1" :class="{ hot: step >= 1 }">Today the list route adds the caller's team to the query.</p>
          <p class="ln a2 dec" :class="{ hot: step >= 1 }">Decision: export only the caller's team.</p>
          <div class="ln a3 dia" :class="{ hot: step >= 1 }">
            <span>Session</span><i /><span>List route</span><i /><span>Shared query</span>
          </div>
        </div>
      </section>

      <aside class="threads" :class="{ on: step >= 1 }">
        <div class="th t1"><b>Research</b><p><em>@agent</em> What does the list filter by?</p><p class="re">session.teamId · routes/tasks.ts</p></div>
        <div class="th t2"><b>Discuss</b><p><em>Mia</em> Admins export every team?</p><p class="re">Not in the first version.</p></div>
        <div class="th t3"><b>Explain</b><p><em>@agent</em> Added a diagram of the path.</p></div>
      </aside>
    </div>

    <section class="hl" :class="{ on: step >= 2 }">
      <span class="who">HumanLayer</span>
      <template v-for="(p, i) in phases" :key="p.f">
        <i v-if="i" class="arr" />
        <div class="ph" :class="{ code: p.code }"><b>{{ p.f }}</b><span>{{ p.d }}</span></div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.tools {
  height: 510px;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 22px;
}

.top {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 0;
  min-height: 0;
}

.doc {
  border: 1px solid var(--ns-line);
  background: #fff;
  box-shadow: 0 24px 60px -34px rgba(26, 26, 26, 0.4);
  display: flex;
  flex-direction: column;
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
  color: var(--z-ink);
}

.body {
  flex: 1;
  padding: 14px 20px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

h4 {
  margin: 0;
  font-family: var(--z-font-display);
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.ln {
  position: relative;
  margin: 0;
  max-width: none;
  padding: 8px 12px;
  font-size: 21px;
  line-height: 1.3;
  transition: background 500ms var(--ns-ease);
}

.ln.hot {
  background: #fff6d6;
}

.ln.hot::after {
  content: '';
  position: absolute;
  right: -21px;
  top: 50%;
  width: 21px;
  height: 2px;
  background: var(--z-yellow);
}

.dec {
  font-weight: 800;
}

.dia {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dia span {
  padding: 6px 12px;
  border: 2px solid var(--z-ink);
  font-size: 18px;
  font-weight: 700;
}

.dia i {
  flex: 1;
  max-width: 40px;
  height: 2px;
  background: var(--z-ink);
}

.threads {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding-left: 20px;
  border-left: 0;
  transition: opacity 600ms var(--ns-ease);
}

.threads:not(.on) {
  opacity: 0;
}

.th {
  padding: 10px 14px;
  background: #fff6d6;
}

.th b {
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--z-grey-600);
}

.th p {
  margin: 2px 0 0;
  max-width: none;
  font-size: 19px;
  line-height: 1.3;
}

.th em {
  font-style: normal;
  font-weight: 700;
}

.th .re {
  color: var(--ns-teal);
  font-weight: 700;
}

.hl {
  display: flex;
  align-items: stretch;
  gap: 0;
  padding: 16px 20px;
  background: var(--z-ink);
  color: #fff;
  transition: opacity 600ms var(--ns-ease);
}

.hl:not(.on) {
  opacity: 0;
}

.who {
  align-self: center;
  width: 150px;
  font-size: 20px;
  font-weight: 800;
  color: var(--ns-frozen);
}

.ph {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 14px;
  border: 2px solid #4a4a4a;
}

.ph b {
  font-size: 20px;
  color: #fff;
}

.ph span {
  font-size: 17px;
  color: #bdbdbd;
}

.ph.code {
  border-color: var(--ns-frozen);
}

.arr {
  align-self: center;
  width: 26px;
  height: 2px;
  background: #8f8f8f;
  position: relative;
}

.arr::after {
  content: '';
  position: absolute;
  right: 0;
  top: -4px;
  border: 5px solid transparent;
  border-left-color: #8f8f8f;
  border-right: 0;
}
</style>
