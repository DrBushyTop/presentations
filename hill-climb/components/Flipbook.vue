<!-- 23 rounds of one screen, then three before-and-after pairs side by side. The rounds play by themselves and the rail can be dragged. -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { mean } from '../lib/terrain'
import { asset, useScrub, useStage, useTicker } from '../lib/stage'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { active, still, ease, spring } = useStage()

const LAST = 23
const RAIL = 420

const pad = (n: number) => String(n).padStart(2, '0')
const frame = (n: number) => asset(`screens/flip/r${pad(n)}.jpg`)
const n = ref(still.value ? LAST : 1)
const held = ref(false)
useTicker(() => active.value && props.step === 0 && !held.value && n.value < LAST, 700, () => { n.value++ })
const rounds = useScrub('rounds', 'y', (at) => {
  held.value = true
  n.value = 1 + Math.round(at * (LAST - 1))
})

// Side by side. Both images of a pair are cropped to the same region of the
// 1280 x 800 capture, the part the rounds changed, and shown at 80% scale.
const SRC_W = 1280
const SRC_H = 800
const SCALE = 0.8
const CROP_W = 725
const CROP_H = 700
const THUMB = 0.125
const pairs = [
  { f: '03-findings-list', n: 'Findings', x: 243, y: 40 },
  { f: '13-task-results', n: 'Task results', x: 240, y: 50 },
  { f: '04-finding-reader', n: 'Reader', x: 400, y: 124 },
]
const sides = [
  { r: 'r1', label: 'Round 1', from: -36 },
  { r: 'r23', label: 'Round 23', from: 36 },
]
const pair = computed(() => (props.step >= 1 ? pairs[Math.min(props.step - 1, 2)] : null))
const score = computed(() => (mean[Math.min(n.value, 22) - 1]).toFixed(1))
onMounted(() => {
  for (let i = 1; i <= LAST; i++) new Image().src = frame(i)
  for (const p of pairs) for (const s of sides) new Image().src = asset(`screens/pair/${p.f}-${s.r}.jpg`)
})
</script>

<template>
  <div class="hc-night flip">
    <template v-if="!pair">
      <img class="screen" :src="frame(n)" alt="">
      <div class="hud">
        <span>Round</span><b class="hc-num">{{ n }}</b>
        <span>Score</span><b class="hc-num">{{ n > 22 ? '–' : score }}</b>
        <div class="rail" :class="{ held: rounds.dragging.value }" :style="{ height: `${RAIL}px` }" v-bind="rounds.on">
          <motion.i
            class="thumb" :initial="false" :animate="{ y: ((n - 1) / (LAST - 1)) * RAIL }"
            :transition="rounds.dragging.value ? { duration: 0 } : ease(0.5)"
          />
        </div>
      </div>
    </template>
    <div v-else class="pairs">
      <AnimatePresence mode="wait">
        <motion.div :key="pair.f" class="row" :exit="{ opacity: 0 }" :transition="ease(0.25)">
          <motion.div
            v-for="(s, i) in sides" :key="s.r" class="side"
            :initial="still ? false : { opacity: 0, x: s.from }" :animate="{ opacity: 1, x: 0 }"
            :transition="spring({ delay: still ? 0 : 0.1 + i * 0.18 })"
          >
            <div class="head">
              <div><span>{{ pair.n }}</span><b>{{ s.label }}</b></div>
              <div class="mini" :style="{ width: `${SRC_W * THUMB}px`, height: `${SRC_H * THUMB}px` }">
                <img :src="asset(`screens/pair/${pair.f}-${s.r}.jpg`)" alt="">
                <i :style="{ left: `${pair.x * THUMB}px`, top: `${pair.y * THUMB}px`, width: `${CROP_W * THUMB}px`, height: `${CROP_H * THUMB}px` }" />
              </div>
            </div>
            <div class="crop" :style="{ width: `${CROP_W * SCALE}px`, height: `${CROP_H * SCALE}px` }">
              <img
                :src="asset(`screens/pair/${pair.f}-${s.r}.jpg`)" alt=""
                :style="{ width: `${SRC_W * SCALE}px`, height: `${SRC_H * SCALE}px`, left: `${-pair.x * SCALE}px`, top: `${-pair.y * SCALE}px` }"
              >
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>

<style scoped>
.screen { position: absolute; left: 0; top: 0; width: 1152px; height: 720px; object-fit: cover; object-position: top left; }
.hud { position: absolute; right: 0; top: 0; bottom: 0; width: 128px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: var(--hc-night); text-align: center; padding: 0 6px; }
.hud span { font-size: 16px; color: #b5b9bd; }
.hud b { font-size: 48px; line-height: 1; margin-bottom: 18px; color: #fff; }

.rail { position: relative; width: 100%; margin: 14px 0 0; flex: none; cursor: grab; touch-action: none; user-select: none; }
.rail::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 4px; margin-left: -2px; border-radius: 2px; background: #5a6066; }
.rail.held { cursor: grabbing; }
.thumb { position: absolute; left: 50%; top: -14px; width: 28px; height: 28px; margin-left: -14px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45); }

.pairs { position: absolute; inset: 0; padding: 20px 40px 0; }
.row { display: flex; gap: 40px; }
.side { display: flex; flex-direction: column; gap: 12px; }
.head { height: 100px; display: flex; align-items: flex-end; justify-content: space-between; }
.head span { display: block; font-size: 18px; color: #b5b9bd; }
.head b { display: block; font: 800 40px/1 var(--z-font-display); letter-spacing: -0.02em; color: #fff; }
.side:last-child .head b { color: var(--z-frozen); }
.mini { position: relative; overflow: hidden; border-radius: 4px; background: #fff; }
.mini img { display: block; width: 100%; height: 100%; opacity: 0.55; }
.mini i { position: absolute; border: 2px solid var(--z-frozen); box-shadow: 0 0 0 999px rgba(16, 18, 20, 0.35); }
.crop { position: relative; overflow: hidden; border-radius: 8px; background: #fff; }
.crop img { position: absolute; max-width: none; }
</style>
