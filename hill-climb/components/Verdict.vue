<!-- The answer to the question the talk opened with. -->
<script setup lang="ts">
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const lines = [
  { h: 'Worth it', s: 'For a while. Most of the gain came early.', c: 'var(--z-frozen)' },
  { h: 'Stop on a plateau', s: 'Not on a number.', c: '#fff' },
  { h: 'Blind or it lies', s: 'Memory inflates scores.', c: 'var(--z-red-400)' },
]
</script>

<template>
  <div class="hc-night v">
    <Rise v-for="(l, i) in lines" :key="l.h" :on="step >= i" class="l" :x="-30" :y="0">
      <h2 :style="{ color: l.c }">{{ l.h }}</h2>
      <p>{{ l.s }}</p>
    </Rise>
  </div>
</template>

<style scoped>
.v { display: flex; flex-direction: column; justify-content: center; gap: 34px; padding: 0 96px; }
h2 { font: 800 76px/1 var(--z-font-display); letter-spacing: -0.035em; margin: 0 0 6px; }
p { font-size: 28px; margin: 0; color: #d9d9d6; }
</style>
