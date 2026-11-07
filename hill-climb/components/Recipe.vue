<!-- What I would do next time. -->
<script setup lang="ts">
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const rules = [
  { h: 'Blind from round 1', s: 'No past reports' },
  { h: 'Freeze the rivals', s: 'Score once' },
  { h: 'Lanes, not swarms', s: 'Each file has one owner' },
  { h: 'Two runs on the same build', s: 'Measure the noise first' },
  { h: 'Stop rule up front', s: 'Three flat rounds' },
  { h: 'People at the end', s: 'A score is not a designer' },
]
</script>

<template>
  <div class="hc-stage rc">
    <Rise v-for="(r, i) in rules" :key="r.h" class="c" :on="step >= Math.floor(i / 2)" :delay="(i % 2) * 0.1">
      <b class="hc-num">{{ i + 1 }}</b>
      <div><h3>{{ r.h }}</h3><p>{{ r.s }}</p></div>
    </Rise>
  </div>
</template>

<style scoped>
.rc { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, 1fr); gap: 16px; }
.c { display: flex; align-items: center; gap: 22px; padding: 0 26px; background: var(--hc-soft); border-radius: 14px; }
.c b { font-size: 64px; color: var(--z-teal); width: 54px; }
h3 { font-size: 28px; margin: 0; line-height: 1.15; color: var(--z-ink); }
p { font-size: 21px; margin: 2px 0 0; color: var(--z-grey-600); }
</style>
