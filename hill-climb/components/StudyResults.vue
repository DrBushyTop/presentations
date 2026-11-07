<!-- The slot for the study. Empty frames until lib/study.ts has values. -->
<script setup lang="ts">
import { study } from '../lib/study'
import Rise from './Rise.vue'

const q = [
  { k: 'direction', h: 'Same direction?', s: 'Do designers prefer the new one?' },
  { k: 'size', h: 'Same size?', s: 'Big gain, or small?' },
  { k: 'blindSpots', h: 'Blind spots', s: 'What the council never saw' },
  { k: 'overbuilding', h: 'Overbuilt', s: 'What should go' },
] as const
</script>

<template>
  <div class="hc-stage r">
    <Rise v-for="(c, i) in q" :key="c.k" class="c" :class="{ empty: !study[c.k] }" :delay="i * 0.1">
      <h3>{{ c.h }}</h3>
      <p v-if="study[c.k]" class="v">{{ study[c.k] }}</p>
      <p v-else class="s">{{ c.s }}</p>
    </Rise>
  </div>
</template>

<style scoped>
.r { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 18px; }
.c { border-radius: 14px; padding: 28px; background: var(--hc-soft); display: flex; flex-direction: column; justify-content: center; }
.c.empty { background: none; border: 3px dashed var(--z-grey-200); }
h3 { font-size: 34px; margin: 0 0 8px; color: var(--z-ink); }
.s { font-size: 23px; margin: 0; color: var(--z-grey-600); }
.v { font-size: 26px; margin: 0; color: var(--z-ink); }
</style>
