<!--
  Placeholder: where my own repo still takes the agent's word, from the
  harness report's "Where we still rely on trust" (16 Oct 2026). Each gap
  names the change that would close it. Refresh before the talk.
  0 the gaps · 1 the takeaway
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const gaps = [
  { gap: 'An agent can edit a rule or a baseline', next: 'CI takes rule files from master' },
  { gap: 'The implementer decides whether to get a review', next: 'Review required by path and size' },
  { gap: '"Verified in the app" is the agent\'s own account', next: 'A UI change must carry media' },
  { gap: '"Write the failing test first" is prose', next: 'New tests must fail on master' },
]
</script>

<template>
  <div class="og">
    <div class="labels">
      <span>Self-reported, or only written down</span>
      <span class="nx">What would make it a check</span>
    </div>
    <div v-for="g in gaps" :key="g.gap" class="row">
      <p class="gap"><Icon name="alert" />{{ g.gap }}</p>
      <p class="next"><Icon name="arrow" />{{ g.next }}</p>
    </div>
    <p class="take" :class="{ on: step >= 1 }">No slop doesn't mean no trust. It means knowing where you still trust.</p>
  </div>
</template>

<style scoped>
.og {
  height: 510px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.labels,
.row {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 26px;
}

.labels span {
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
  padding-bottom: 8px;
  border-bottom: 2px solid var(--z-ink);
}

.labels .nx {
  color: var(--ns-teal);
  border-color: var(--ns-teal);
}

.row {
  flex: 1;
}

.row p {
  margin: 0;
  max-width: none;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 20px;
  font-size: 23px;
  font-weight: 700;
  line-height: 1.25;
}

.row :deep(.ns-icon) {
  font-size: 24px;
}

.gap {
  background: #fff1ee;
  border-left: 6px solid var(--ns-red);
}

.gap :deep(.ns-icon) { color: var(--ns-red); }

.next {
  background: #e6f4f6;
  border-left: 6px solid var(--ns-teal);
}

.next :deep(.ns-icon) { color: var(--ns-teal); }

.take {
  margin: 0;
  max-width: none;
  padding: 16px 22px;
  background: var(--z-ink);
  color: #fff;
  font-size: 25px;
  font-weight: 800;
  transition: opacity 600ms var(--ns-ease);
}

.take:not(.on) {
  opacity: 0;
}
</style>
