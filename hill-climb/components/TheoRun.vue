<!--
  Theo's run, "Agents Sucked At UI (Until Today)", 3 Nov 2026. All numbers from
  the video. Click 2 is the point of the slide: the build the council had just
  scored 9 scored 7.4 once Claude Code and Codex were in the same frame.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'
import Count from './Count.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { spring, still, ease, entered } = useStage()

const score = computed(() => [6, 9, 7.4, 9.5, 10][Math.min(props.step, 4)])
const label = computed(() => [
  'First council',
  'Three rounds later',
  'Same build, rivals in the frame',
  'About ten more runs',
  'Then 10',
][Math.min(props.step, 4)])
const seats = [
  { n: 'Opus', c: 'var(--z-teal)' },
  { n: 'Sol', c: 'var(--z-ink)' },
  { n: 'Muse', c: 'var(--z-grey-600)' },
  { n: 'Jester', c: 'var(--z-red)', x: true },
]
</script>

<template>
  <div class="hc-stage theo">
    <div class="left">
      <motion.a
        class="video"
        href="https://www.youtube.com/watch?v=xq0eB8vxeqk"
        target="_blank"
        :initial="{ opacity: still ? 1 : 0, y: still ? 0 : 16 }"
        :animate="{ opacity: entered ? 1 : 0, y: entered ? 0 : 16 }"
        :transition="spring()"
      >
        <i class="play" aria-hidden="true" />
        <b>Agents Sucked At UI<br>(Until Today)</b>
        <span>Theo · t3.gg · 31:44</span>
      </motion.a>
      <div class="seats">
        <motion.div
          v-for="(s, i) in seats" :key="s.n" class="seat"
          :initial="{ opacity: still ? 1 : 0, scale: still ? 1 : 0.7 }"
          :animate="{ opacity: entered ? 1 : 0, scale: entered ? 1 : 0.7 }"
          :transition="spring({ delay: still ? 0 : 0.2 + i * 0.1 })"
        >
          <i :style="{ background: s.c }" /><span :class="{ cross: s.x }">{{ s.n }}</span>
        </motion.div>
      </div>
      <motion.div class="cost" :initial="{ opacity: step >= 4 ? 1 : 0 }" :animate="{ opacity: step >= 4 ? 1 : 0 }" :transition="ease(0.5)">
        <b class="hc-num">18 h</b><span>5 models</span><b class="hc-num">$250–400</b><span>at list price</span>
      </motion.div>
    </div>
    <div class="meter">
      <div class="scale">
        <i v-for="n in [10, 8, 6]" :key="n" :style="{ bottom: `${(n - 4) / 6 * 100}%` }"><span>{{ n }}</span></i>
        <motion.div
          class="fill"
          :initial="false"
          :animate="{ scaleY: (score - 4) / 6, backgroundColor: step === 2 ? '#de1e05' : '#037f91' }"
          :transition="spring({ visualDuration: 0.7, bounce: 0.3 })"
        />
      </div>
      <div class="read">
        <Count class="n" :to="score" :from="score" :decimals="score % 1 ? 1 : 0" :duration="0.7" />
        <motion.p :key="label" :initial="{ opacity: still ? 1 : 0, y: still ? 0 : 8 }" :animate="{ opacity: 1, y: 0 }" :transition="ease(0.4)">{{ label }}</motion.p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theo { display: grid; grid-template-columns: 1fr 1.05fr; gap: 56px; }
.left { display: flex; flex-direction: column; gap: 22px; min-height: 0; }
.video {
  display: block; position: relative; border-radius: 14px; padding: 30px 30px 26px 104px; text-decoration: none;
  background: var(--hc-night); color: #fff; border: 0;
}
.video b { display: block; font-size: 32px; line-height: 1.12; letter-spacing: -0.02em; }
.video span { display: block; margin-top: 12px; font-size: 18px; color: #b5b9bd; }
.play { position: absolute; left: 30px; top: 34px; width: 50px; height: 50px; border-radius: 50%; background: var(--z-red); }
.play::after { content: ''; position: absolute; left: 19px; top: 14px; border-left: 17px solid #fff; border-top: 11px solid transparent; border-bottom: 11px solid transparent; }
.seats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.seat { display: grid; justify-items: center; gap: 8px; font-size: 20px; font-weight: 600; color: var(--z-ink); }
.seat i { width: 64px; height: 64px; border-radius: 50%; }
.cross { text-decoration: line-through; text-decoration-color: var(--z-red); }
.cost { display: grid; grid-template-columns: auto 1fr; gap: 0 14px; align-items: baseline; margin-top: auto; }
.cost b { font-size: 44px; color: var(--z-ink); }
.cost span { font-size: 20px; color: var(--z-grey-600); }
.meter { display: grid; grid-template-columns: 96px 1fr; gap: 32px; min-height: 0; }
.scale { position: relative; background: var(--hc-soft); border-radius: 10px; overflow: visible; }
.scale i { position: absolute; left: -2px; right: -2px; border-top: 2px solid #fff; z-index: 2; }
.scale span { position: absolute; left: 100%; margin-left: 8px; top: -11px; font: 500 16px var(--hc-mono); font-style: normal; color: var(--z-grey-600); }
.fill { position: absolute; inset: 0; transform-origin: bottom; border-radius: 10px; }
.read { align-self: center; padding-left: 12px; }
.n { display: block; font-size: 148px; line-height: 1; color: var(--z-ink); letter-spacing: -0.05em; }
.read p { margin: 10px 0 0; font-size: 26px; line-height: 1.2; font-weight: 600; color: var(--z-ink); min-height: 62px; }
</style>
