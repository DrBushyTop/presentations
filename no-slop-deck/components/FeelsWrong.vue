<!--
  The agent's run-and-check doesn't replace a person clicking through it.
  The agent checks what it was asked to check. A person notices what feels
  wrong. Same export as the previous slide; the findings are illustrative.
  0 what the agent checked · 1 what you noticed · 2 the takeaway
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const checked = [
  'The export downloads a file',
  'Five rows, three columns each',
  'A-102 stays in one column',
]
const noticed = [
  'The list shows open tasks. The export has all five.',
  'Two seconds with no sign anything happened',
  'It saves as export (3).csv',
  'The button says Download, the menu says Export',
]
</script>

<template>
  <div class="fw">
    <section class="agent">
      <h3><Icon name="bot" />The agent checked</h3>
      <p v-for="c in checked" :key="c"><Icon name="check" />{{ c }}</p>
    </section>

    <section class="you" :class="{ on: step >= 1 }">
      <h3><Icon name="user" />You noticed in two minutes</h3>
      <p v-for="(n, i) in noticed" :key="n" :style="{ '--i': i }"><Icon name="eye" />{{ n }}</p>
    </section>

    <div class="foot" :class="{ on: step >= 2 }">
      <p>The agent checks what you asked for. You notice what nobody asked for.</p>
    </div>
  </div>
</template>

<style scoped>
.fw {
  height: 510px;
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  grid-template-rows: 1fr auto;
  gap: 20px 32px;
}

section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 4px;
  padding-bottom: 10px;
  font-size: 24px;
  font-weight: 800;
  border-bottom: 4px solid var(--ns-teal);
}

.you h3 {
  border-color: var(--ns-red);
}

h3 :deep(.ns-icon) {
  font-size: 28px;
}

section p {
  flex: 1;
  margin: 0;
  max-width: none;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 20px;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
}

section p :deep(.ns-icon) {
  font-size: 24px;
}

.agent p {
  background: #e6f4f6;
  border-left: 6px solid var(--ns-teal);
}

.agent p :deep(.ns-icon) {
  color: var(--ns-teal);
}

.you p {
  background: #fff1ee;
  border-left: 6px solid var(--ns-red);
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
  transition-delay: calc(var(--i) * 110ms);
}

.you p :deep(.ns-icon) {
  color: var(--ns-red);
}

.you h3 {
  transition: opacity 600ms var(--ns-ease);
}

.you:not(.on) h3,
.you:not(.on) p {
  opacity: 0;
}

.you:not(.on) p {
  transform: translateX(20px);
}

.foot {
  grid-column: 1 / -1;
  padding: 16px 22px;
  background: var(--z-ink);
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
</style>
