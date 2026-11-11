<!--
  What the score loop couldn't see, from the designers' debrief. First how the
  app hangs together and the task nobody finished, then how it feels to press
  and the legends nobody noticed.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered, spring, still } = useStage()
const late = computed(() => entered.value && props.step >= 1)

// Features as islands: no path between them.
const islands = [
  { x: 18, y: 24, w: 54, h: 34 }, { x: 118, y: 8, w: 66, h: 30 }, { x: 78, y: 76, w: 46, h: 46 },
  { x: 8, y: 132, w: 60, h: 30 }, { x: 140, y: 104, w: 48, h: 38 }, { x: 96, y: 160, w: 70, h: 30 },
]
const dots = [[20, 120], [56, 96], [92, 128], [128, 64], [164, 84]]
</script>

<template>
  <div class="hc-stage un">
    <Rise class="c" :delay="0">
      <svg viewBox="0 0 200 200" class="art" aria-hidden="true">
        <motion.rect
          v-for="(b, i) in islands" :key="i" :x="b.x" :y="b.y" :width="b.w" :height="b.h" rx="6"
          fill="var(--z-teal-100)" stroke="var(--z-teal)" stroke-width="2.5"
          :initial="still ? false : { opacity: 0, scale: 0.6 }" :animate="{ opacity: entered ? 1 : 0, scale: entered ? 1 : 0.6 }"
          :transition="spring({ delay: still ? 0 : 0.2 + i * 0.07 })"
        />
        <text x="100" y="118" text-anchor="middle" class="q">?</text>
      </svg>
      <div><h3>No map</h3><p>Features everywhere, no journey through them</p></div>
    </Rise>

    <Rise class="c" :delay="0.12">
      <div class="art zero" aria-hidden="true">
        <div v-for="b in ['Old', 'New']" :key="b" class="run">
          <span>{{ b }}</span>
          <motion.i
            v-for="n in 3" :key="n"
            :initial="false" :animate="{ scale: entered ? 1 : 0.4, opacity: entered ? 1 : 0 }"
            :transition="spring({ delay: still || !entered ? 0 : 0.3 + n * 0.08 + (b === 'New' ? 0.3 : 0) })"
          >✕</motion.i>
        </div>
      </div>
      <div><h3><b class="hc-num">0 of 6</b> captured a moment</h3><p>The core job, in both builds</p></div>
    </Rise>

    <Rise class="c" :on="step >= 1" :delay="0">
      <div class="art btns" aria-hidden="true">
        <span class="b">Previous <span class="hc-key">P</span></span>
        <span class="b">Next <span class="hc-key">N</span></span>
        <b class="q2">?</b>
      </div>
      <div><h3>Buttons you don’t dare press</h3><p>Shortcut chips that act at once</p></div>
    </Rise>

    <Rise class="c" :on="step >= 1" :delay="0.12">
      <svg viewBox="0 0 200 200" class="art" aria-hidden="true">
        <line x1="14" x2="190" y1="170" y2="170" stroke="var(--z-grey-200)" stroke-width="2" />
        <motion.path
          d="M14 150 C 50 140, 70 90, 100 104 S 150 50, 186 40" fill="none" stroke="var(--z-ink)" stroke-width="3"
          :initial="still ? false : { pathLength: 0 }" :animate="{ pathLength: late ? 1 : 0 }" :transition="spring({ visualDuration: 1.1, delay: still ? 0 : 0.2 })"
        />
        <circle v-for="(d, i) in dots" :key="i" :cx="d[0]" :cy="d[1]" r="6" fill="var(--z-teal)" />
        <!-- The legend is there, only too faint to notice. -->
        <g class="faint">
          <rect x="112" y="118" width="80" height="44" rx="6" fill="none" stroke="var(--z-grey-600)" stroke-width="1.5" />
          <line x1="120" x2="136" y1="131" y2="131" stroke="var(--z-ink)" stroke-width="3" />
          <rect x="142" y="128" width="40" height="6" rx="3" fill="var(--z-grey-600)" />
          <circle cx="128" cy="149" r="5" fill="var(--z-teal)" />
          <rect x="142" y="146" width="32" height="6" rx="3" fill="var(--z-grey-600)" />
        </g>
      </svg>
      <div><h3>Legends nobody noticed</h3><p>There, but lost in the page</p></div>
    </Rise>

  </div>
</template>

<style scoped>
.un { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 18px; }
.c { display: flex; align-items: center; gap: 26px; padding: 0 28px 0 22px; background: var(--hc-soft); border-radius: 14px; }
.art { flex: 0 0 200px; width: 200px; height: 200px; }
h3 { font-size: 32px; line-height: 1.12; margin: 0 0 8px; color: var(--z-ink); }
h3 b { color: var(--z-red); }
p { font-size: 22px; line-height: 1.25; margin: 0; color: var(--z-ink-800); }
.q { font: 800 64px var(--z-font-display); fill: var(--z-red); }
.faint { opacity: 0.22; }
.btns { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 16px; position: relative; }
.b { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 10px; background: var(--z-ink); color: #fff; font-size: 22px; font-weight: 700; }
.b .hc-key { font-size: 16px; }
.q2 { position: absolute; right: 0; bottom: 18px; font: 800 64px var(--z-font-display); color: var(--z-red); }
.zero { display: flex; flex-direction: column; justify-content: center; gap: 18px; }
.run { display: flex; align-items: center; gap: 10px; }
.run span { width: 54px; font-size: 18px; font-weight: 700; color: var(--z-grey-600); }
.run i { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; border: 3px solid var(--z-red); color: var(--z-red); font: normal 800 20px var(--z-font-text); }
</style>
