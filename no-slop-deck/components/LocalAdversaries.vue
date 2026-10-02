<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const lenses = [
  { name: 'Functional', question: 'Does it match the agreed behavior?' },
  { name: 'Non-functional', question: 'What happens at limits and on errors?' },
  { name: 'Security', question: 'Can a caller cross an access boundary?' },
]
</script>

<template>
  <div class="local">
    <div class="instruction"><small>On your machine, after implementation</small><b>"Review this slice as adversarial subagents."</b><span>Give them the diff and the agreed decisions.</span></div>
    <div class="fan"><span>→</span><span :class="{ visible: step >= 1 }">→</span><span :class="{ visible: step >= 1 }">→</span></div>
    <div class="lenses"><section v-for="(lens, i) in lenses" :key="lens.name" :class="{ visible: i === 0 || step >= 1 }"><h2>{{ lens.name }}</h2><p>{{ lens.question }}</p></section></div>
    <div class="return" :class="{ visible: step >= 2 }"><b>Findings return to the main agent.</b><span>Reproduce → fix → rerun local checks → next slice</span></div>
  </div>
</template>

<style scoped>
.local { height: 480px; display: grid; grid-template-columns: 410px 65px 1fr; grid-template-rows: 1fr 104px; gap: 22px; }
.instruction { align-self: center; padding: 28px; background: var(--z-ink); color: white; display: flex; flex-direction: column; gap: 19px; }.instruction small { font-size: 18px; color: #bdbdbd; }.instruction b { font-size: 32px; line-height: 1.2; }.instruction > span { font-size: 22px; line-height: 1.3; color: var(--ns-frozen); }
.fan { display: grid; grid-template-rows: repeat(3, 1fr); align-items: center; text-align: center; font-size: 40px; color: var(--ns-teal); }.fan span { opacity: 0; transition: opacity 400ms; }.fan span:first-child, .fan .visible { opacity: 1; }
.lenses { display: grid; grid-template-rows: repeat(3, 1fr); gap: 13px; }.lenses section { padding: 17px 22px; background: var(--ns-soft); border-left: 4px solid var(--ns-teal); opacity: .12; transition: opacity 400ms; }.lenses section.visible { opacity: 1; }.lenses h2 { font-size: 27px; margin: 0 0 8px; }.lenses p { font-size: 23px; line-height: 1.25; margin: 0; }
.return { grid-column: 1 / -1; padding: 18px 24px; background: #e8f6f8; opacity: 0; transition: opacity 400ms; }.return.visible { opacity: 1; }.return b { display: block; font-size: 25px; color: var(--ns-teal); margin-bottom: 7px; }.return span { font-size: 23px; }
</style>
