<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const phases = [
  { name: 'Research', question: 'How does it work today?', out: 'Current-state map' },
  { name: 'Design + grill', question: 'What are we actually building?', out: 'Decisions + CONTEXT.md' },
  { name: 'Implement', question: 'Does this slice work?', out: 'Code + evidence' },
]
const paths = [
  { name: 'Clear task', note: 'Implement directly', steps: [false, false, true] },
  { name: 'Unclear decisions', note: 'Grill, then implement', steps: [false, true, true] },
  { name: 'Unfamiliar codebase', note: 'Research before design', steps: [true, true, true] },
]
</script>

<template>
  <div class="paths">
    <div class="handoff"><b>Keep the useful context.</b><span>Pass facts and decisions to the next phase.</span></div>
    <section v-for="phase in phases" :key="phase.name" class="phase">
      <h2>{{ phase.name }}</h2><p>{{ phase.question }}</p><span :class="{ visible: step >= 1 }">{{ phase.out }}</span>
    </section>
    <template v-for="path in paths" :key="path.name">
      <div class="label"><b>{{ path.name }}</b><span>{{ path.note }}</span></div>
      <div v-for="(on, i) in path.steps" :key="i" class="cell" :class="{ on, revealed: step >= 1 }"><span>{{ on ? '●' : '' }}</span></div>
    </template>
    <div class="optional" :class="{ visible: step >= 2 }"><b>Add structure when it helps.</b><span>Vertical slices first. A detailed plan is optional.</span></div>
  </div>
</template>

<style scoped>
.paths { height: 480px; display: grid; grid-template-columns: 290px repeat(3, minmax(0, 1fr)); grid-template-rows: 190px repeat(3, 1fr) 68px; gap: 10px 18px; }
.handoff { align-self: center; display: flex; flex-direction: column; gap: 10px; padding-right: 24px; }
.handoff b { font-size: 25px; line-height: 1.2; }.handoff span { font-size: 20px; line-height: 1.35; color: var(--z-grey-600); }
.phase { border-top: 5px solid var(--z-ink); display: flex; flex-direction: column; padding: 17px 0; }.phase h2 { font-size: 27px; margin: 0; }.phase p { font-size: 22px; line-height: 1.3; margin: 10px 0; }.phase > span { margin-top: auto; color: var(--ns-teal); font-size: 18px; font-weight: 700; opacity: 0; transition: opacity 400ms; }.phase > span.visible { opacity: 1; }
.label { border-top: 1px solid var(--ns-line); display: flex; flex-direction: column; justify-content: center; gap: 4px; }.label b { font-size: 21px; }.label span { font-size: 18px; color: var(--z-grey-600); }
.cell { display: grid; place-items: center; border-top: 1px solid var(--ns-line); }.cell span { opacity: 0; font-size: 29px; color: var(--ns-teal); transition: opacity 400ms; }.cell.revealed span { opacity: 1; }.cell.on { background: var(--ns-soft); }
.optional { grid-column: 1 / -1; background: var(--z-ink); color: #fff; padding: 18px 22px; display: flex; align-items: center; gap: 22px; opacity: 0; transition: opacity 400ms; }.optional.visible { opacity: 1; }.optional b { font-size: 23px; }.optional span { font-size: 22px; color: var(--ns-frozen); }
</style>
