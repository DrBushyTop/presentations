<!--
  The designers' recipe for the next climb. Clicks: what to build, from a
  recorded walkthrough, then how to build it, from a design system.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, ease, still } = useStage()

const lanes = [
  {
    h: 'What to build',
    c: 'var(--z-teal)',
    steps: [
      { n: 'Record', d: 'A researcher walks through their real work' },
      { n: 'Critical paths', d: 'The order and transitions that must be easy' },
      { n: 'Test tasks', d: 'The next study checks those paths' },
    ],
  },
  {
    h: 'How to build it',
    c: 'var(--z-ink)',
    steps: [
      { n: 'Design system', d: 'Styles, components, layout' },
      { n: 'Rules for agents', d: 'Set before the first round' },
      { n: '“Don’t invent. Ask.”', d: 'Not the median of the internet' },
    ],
  },
]
const on = (l: number) => computed(() => entered.value && props.step >= l)
const shown = [on(0), on(1)]
</script>

<template>
  <div class="hc-stage sh">
    <div v-for="(l, li) in lanes" :key="l.h" class="lane">
      <Rise :on="step >= li" :x="-20" :y="0" class="lab">
        <h3 :style="{ color: l.c }">{{ l.h }}</h3>
      </Rise>
      <template v-for="(s, si) in l.steps" :key="s.n">
        <motion.svg
          v-if="si > 0" viewBox="0 0 40 40" class="arr" aria-hidden="true"
          :initial="false" :animate="{ opacity: shown[li].value ? 1 : 0 }" :transition="ease(0.4, { delay: still ? 0 : 0.15 + si * 0.16 })"
        >
          <path d="M4 20 H32 M22 10 L32 20 L22 30" fill="none" :stroke="l.c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        </motion.svg>
        <Rise :on="step >= li" :delay="si * 0.16" class="card">
          <span class="hc-num k" :style="{ color: l.c }">{{ li * 3 + si + 1 }}</span>
          <b>{{ s.n }}</b>
          <p>{{ s.d }}</p>
        </Rise>
      </template>
    </div>
  </div>
</template>

<style scoped>
.sh { display: grid; grid-template-rows: 1fr 1fr; gap: 22px; }
.lane { display: grid; grid-template-columns: 170px 1fr 40px 1fr 40px 1fr; align-items: stretch; gap: 14px; }
.lab { display: flex; align-items: center; }
.lab h3 { font-size: 30px; line-height: 1.1; margin: 0; }
.arr { width: 40px; height: 40px; align-self: center; }
.card { background: var(--hc-soft); border-radius: 14px; padding: 26px 22px; display: flex; flex-direction: column; }
.k { font-size: 56px; line-height: 1; margin-bottom: 22px; }
.card b { font-size: 30px; line-height: 1.12; color: var(--z-ink); }
.card p { font-size: 21px; line-height: 1.25; margin: 10px 0 0; color: var(--z-ink-800); }
</style>
