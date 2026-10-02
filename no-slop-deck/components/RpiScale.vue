<!--
  Research, design, implement, scaled to the task. Each phase starts a fresh
  context. Research spends its context reading the code and hands on a short
  map, so design and implementation start nearly empty. The fill levels are
  illustrative.
  0 the phases · 1 what fills each context · 2 which phases a task needs
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const phases = [
  { name: 'Research', q: 'How does it work today?', given: 0, work: 74, workLabel: 'reads 30 files', out: 'research.md' },
  { name: 'Design + grill', q: 'What are we building?', given: 8, work: 26, workLabel: 'the grilling', out: 'CONTEXT.md' },
  { name: 'Implement', q: 'Does this slice work?', given: 10, work: 38, workLabel: 'one slice', out: 'commits' },
]
const paths = [
  { name: 'Small, clear change', note: 'Implement directly', steps: [false, false, true] },
  { name: 'Open decisions', note: 'Grill, then implement', steps: [false, true, true] },
  { name: 'Complex or large', note: 'Research first, in its own context', steps: [true, true, true] },
]
</script>

<template>
  <div class="rpi">
    <div class="corner">
      <b>Every phase starts a fresh context.</b>
      <div class="key" :class="{ on: step >= 1 }"><span><i class="k-work" /> Reading and work</span><span><i class="k-given" /> Notes handed on</span><span class="cap">Context used, illustrative</span></div>
    </div>

    <section v-for="(p, i) in phases" :key="p.name" class="phase">
      <h2>{{ p.name }}</h2>
      <p>{{ p.q }}</p>
      <div class="ctx" :class="{ on: step >= 1 }">
        <div class="gauge">
          <span class="given" :style="{ width: p.given + '%' }" />
          <span class="work" :style="{ width: p.work + '%' }"><em>{{ p.workLabel }}</em></span>
        </div>
        <div class="out"><i v-if="i < 2" class="arr">→</i><b class="ns-mono">{{ p.out }}</b></div>
      </div>
    </section>

    <template v-for="path in paths" :key="path.name">
      <div class="label" :class="{ on: step >= 2 }"><b>{{ path.name }}</b><span>{{ path.note }}</span></div>
      <div v-for="(use, i) in path.steps" :key="i" class="cell" :class="{ use, on: step >= 2 }"><i /></div>
    </template>
  </div>
</template>

<style scoped>
.rpi {
  height: 480px;
  display: grid;
  grid-template-columns: 300px repeat(3, minmax(0, 1fr));
  grid-template-rows: 1fr repeat(3, 62px);
  column-gap: 18px;
}

.corner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding-right: 18px;
}

.corner b {
  font-size: 25px;
  line-height: 1.2;
}

.key {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 18px;
  color: var(--z-ink-800);
  transition: opacity 500ms var(--ns-ease);
}

.key:not(.on) {
  opacity: 0;
}

.key span {
  display: flex;
  align-items: center;
  gap: 10px;
}

.key .cap {
  color: var(--z-grey-600);
  font-size: 16px;
}

.key i {
  width: 20px;
  height: 20px;
}

.k-work { background: #b9b9b6; }
.k-given { background: var(--ns-teal); }

.phase {
  border-top: 5px solid var(--z-ink);
  padding: 16px 0 18px;
  display: flex;
  flex-direction: column;
}

.phase h2 {
  margin: 0;
  font-size: 27px;
}

.phase p {
  margin: 8px 0 0;
  max-width: none;
  font-size: 21px;
  line-height: 1.3;
}

.ctx {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: opacity 500ms var(--ns-ease);
}

.ctx:not(.on) {
  opacity: 0;
}

.gauge {
  display: flex;
  height: 64px;
  border: 2px solid var(--z-ink);
  background: #fff;
}

.given {
  background: var(--ns-teal);
}

.work {
  position: relative;
  background: repeating-linear-gradient(90deg, #b9b9b6 0 10px, #c9c9c6 10px 12px);
}

.work em {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-style: normal;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  color: var(--z-ink);
}

.out {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.out b {
  padding: 4px 10px;
  background: var(--ns-teal);
  color: #fff;
  font-size: 18px;
}

.arr {
  font-style: normal;
  font-size: 22px;
  color: var(--ns-teal);
}

.label {
  border-top: 1px solid var(--ns-line);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  transition: opacity 500ms var(--ns-ease);
}

.label b {
  font-size: 20px;
  line-height: 1.2;
}

.label span {
  font-size: 17px;
  color: var(--z-grey-600);
}

.cell {
  border-top: 1px solid var(--ns-line);
  display: grid;
  place-items: center;
  transition: opacity 500ms var(--ns-ease), background 500ms var(--ns-ease);
}

.cell.use {
  background: var(--ns-soft);
}

.cell.use i {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--ns-teal);
}

.label:not(.on),
.cell:not(.on) {
  opacity: 0;
}
</style>
