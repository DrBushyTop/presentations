<!-- The question and the scale of the run. Figures are in the notes. -->
<script setup lang="ts">
import { useStage } from '../lib/stage'
import Count from './Count.vue'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered } = useStage()
const stats = [
  { to: 48, s: 'hours' },
  { to: 23, s: 'rounds' },
  { to: 190, s: 'PRs' },
  { to: 246, s: 'agent threads' },
]
</script>

<template>
  <div class="hc-night qq">
    <Rise><h1>Is it worth it?</h1></Rise>
    <div class="row">
      <Rise v-for="(n, i) in stats" :key="n.s" :on="step >= 1" :delay="i * 0.1" class="n">
        <b><Count :to="n.to" :on="step >= 1 && entered" :delay="i * 0.1" /></b>
        <span>{{ n.s }}</span>
      </Rise>
    </div>
  </div>
</template>

<style scoped>
.qq { display: flex; flex-direction: column; justify-content: center; padding: 0 96px; gap: 72px; }
h1 { font: 800 132px/1 var(--z-font-display); letter-spacing: -0.045em; margin: 0; color: #fff; }
.row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; min-height: 130px; }
.n b { display: block; font-size: 84px; line-height: 1; color: var(--z-frozen); }
.n span { font-size: 22px; color: #d9d9d6; }
</style>
