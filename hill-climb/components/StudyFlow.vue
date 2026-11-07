<!-- The designer study, one hour. The climb's scores, checked by people. -->
<script setup lang="ts">
import Rise from './Rise.vue'

const steps = [
  { n: 'Rank', d: 'Screens, by what matters' },
  { n: 'Use', d: 'Old and new, hands-on, order swapped' },
  { n: 'Compare', d: '12 blind pairs' },
  { n: 'Reflect', d: 'What would you change?' },
]
</script>

<template>
  <div class="hc-stage s">
    <Rise v-for="(p, i) in steps" :key="p.n" class="step" :delay="i * 0.14" :y="26">
      <b class="hc-num">{{ i + 1 }}</b>
      <h3>{{ p.n }}</h3>
      <p>{{ p.d }}</p>
    </Rise>
  </div>
</template>

<style scoped>
.s { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.step { background: var(--hc-soft); border-radius: 14px; padding: 28px 24px; display: flex; flex-direction: column; }
.step b { font-size: 88px; line-height: 1; color: var(--z-teal); }
.step h3 { font-size: 34px; margin: auto 0 6px; color: var(--z-ink); }
.step p { font-size: 22px; line-height: 1.25; min-height: 2.5em; margin: 0; color: var(--z-ink-800); }
</style>
