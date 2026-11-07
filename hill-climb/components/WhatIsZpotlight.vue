<!-- The same four beats as the no-slop deck's product slide, drawn for this deck. -->
<script setup lang="ts">
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'
import Rise from './Rise.vue'

const { still } = useStage()
const steps = [
  { h: 'A researcher', p: 'sets the tasks' },
  { h: 'A participant', p: 'tries a prototype' },
  { h: 'The session', p: 'records screen, voice, transcript' },
  { h: 'Findings', p: 'for the team and for agents' },
]
const wave = [5, 9, 14, 8, 16, 11, 6, 12, 15, 7, 10, 4, 13, 9, 6, 11, 14, 7]
const loop = (duration: number, delay = 0) => still.value ? { duration: 0 } : { duration, delay, repeat: Infinity }
</script>

<template>
  <div class="hc-stage z">
    <Rise v-for="(s, i) in steps" :key="s.h" class="step" :y="28" :delay="i * 0.14">
      <div class="pic" aria-hidden="true">
        <template v-if="i === 0">
          <span v-for="(t, k) in ['Approve an invoice', 'Find the approver', 'Pay what is due']" :key="t" class="task"><em>{{ k + 1 }}</em>{{ t }}</span>
        </template>
        <span v-else-if="i === 1" class="phone">
          <i /><i /><i class="w" />
          <motion.i class="tap" :animate="still ? {} : { scale: [1, 1.5, 1], opacity: [0.9, 0.3, 0.9] }" :transition="loop(1.6)" />
        </span>
        <template v-else-if="i === 2">
          <span class="wave">
            <motion.i
              v-for="(h, k) in wave" :key="k"
              :style="{ height: `${h * 4}px` }"
              :animate="still ? {} : { scaleY: [1, 0.45, 1] }"
              :transition="loop(1.1, k * 0.05)"
            />
          </span>
          <span class="said">“Where would the report be?”</span>
        </template>
        <span v-else class="finding"><b>Finding</b><i /><i /><i class="w" /></span>
      </div>
      <b class="h">{{ s.h }}</b>
      <p>{{ s.p }}</p>
    </Rise>
  </div>
</template>

<style scoped>
.z { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.step { display: flex; flex-direction: column; min-height: 0; }
.pic { flex: 1; background: var(--hc-soft); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; justify-content: center; gap: 12px; min-height: 0; overflow: hidden; }
.h { margin-top: 16px; font-size: 26px; color: var(--z-ink); }
p { margin: 2px 0 0; font-size: 20px; line-height: 1.25; color: var(--z-grey-600); min-height: 50px; }
.task { display: flex; gap: 10px; align-items: center; background: #fff; border-radius: 8px; padding: 14px 10px; font-size: 16px; color: var(--z-ink); }
.task em { font: 700 15px var(--hc-mono); color: var(--z-teal); }
.phone { align-self: center; width: 160px; height: 300px; border: 3px solid var(--z-ink); border-radius: 22px; padding: 28px 16px; display: grid; gap: 12px; align-content: start; position: relative; background: #fff; }
.phone i { height: 14px; border-radius: 4px; background: var(--z-grey-200); }
.phone .w { height: 96px; background: var(--z-teal-100); }
.phone .tap { position: absolute; right: 26px; bottom: 44px; width: 30px; height: 30px; border-radius: 50%; background: var(--z-red); }
.wave { display: flex; align-items: center; justify-content: center; gap: 4px; height: 150px; }
.wave i { width: 6px; background: var(--z-teal); border-radius: 3px; }
.said { font-size: 18px; line-height: 1.3; text-align: center; color: var(--z-ink); }
.finding { background: #fff; border-radius: 10px; padding: 20px; display: grid; gap: 14px; border-left: 5px solid var(--z-teal); }
.finding b { font-size: 22px; color: var(--z-ink); }
.finding i { height: 14px; border-radius: 4px; background: var(--z-grey-200); }
.finding .w { width: 66%; }
</style>
