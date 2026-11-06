<!-- 23 rounds of one screen, then three before-and-after wipes. Both play by themselves and can be dragged. -->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion-v'
import { mean } from '../lib/terrain'
import { asset, useScrub, useStage, useTicker } from '../lib/stage'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { active, still, ease, sweep } = useStage()

const LAST = 23
const RAIL = 420
const WIDTH = 1152

const pad = (n: number) => String(n).padStart(2, '0')
const frame = (n: number) => asset(`screens/flip/r${pad(n)}.jpg`)
const n = ref(still.value ? LAST : 1)
const held = ref(false)
useTicker(() => active.value && props.step === 0 && !held.value && n.value < LAST, 700, () => { n.value++ })
const rounds = useScrub('rounds', 'y', (at) => {
  held.value = true
  n.value = 1 + Math.round(at * (LAST - 1))
})
onMounted(() => { for (let i = 1; i <= LAST; i++) new Image().src = frame(i) })

const pairs = [
  { f: '03-findings-list', n: 'Findings' },
  { f: '13-task-results', n: 'Task results' },
  { f: '04-finding-reader', n: 'Reader' },
]
const pair = computed(() => (props.step >= 1 ? pairs[Math.min(props.step - 1, 2)] : null))
const score = computed(() => (mean[Math.min(n.value, 22) - 1]).toFixed(1))

const split = useMotionValue(1)
const clip = useTransform(split, v => `inset(0 ${(1 - v) * 100}% 0 0)`)
const edge = useTransform(split, v => v * WIDTH)
let run: { stop: () => void } | undefined
const wipe = useScrub('wipe', 'x', (at) => {
  run?.stop()
  split.set(at)
})
watch(() => props.step, (step, old) => {
  run?.stop()
  if (still.value || !active.value || step === 0 || (old !== undefined && step < old)) {
    split.set(1)
    return
  }
  split.set(0)
  run = animate(split, 1, sweep(3.6, { delay: 0.5 }))
}, { immediate: true })
onBeforeUnmount(() => run?.stop())
</script>

<template>
  <div class="hc-night flip">
    <img v-if="!pair" class="screen" :src="frame(n)" alt="">
    <template v-else>
      <AnimatePresence>
        <motion.img
          :key="`${pair.f}-before`" class="screen" :src="asset(`screens/pair/${pair.f}-r1.jpg`)" alt=""
          :initial="{ opacity: still ? 1 : 0 }" :animate="{ opacity: 1 }" :transition="ease(0.5)"
        />
      </AnimatePresence>
      <b class="tag before">Round 1</b>
      <motion.div class="after" :style="{ clipPath: clip }">
        <img class="screen" :src="asset(`screens/pair/${pair.f}-r23.jpg`)" alt="">
        <b class="tag">Round 23</b>
      </motion.div>
      <div class="wipe" :class="{ held: wipe.dragging.value }" v-bind="wipe.on">
        <motion.div v-if="!still" class="edge" :style="{ x: edge }"><i>‹ ›</i></motion.div>
      </div>
    </template>
    <div class="hud">
      <template v-if="!pair">
        <span>Round</span><b class="hc-num">{{ n }}</b>
        <span>Score</span><b class="hc-num">{{ n > 22 ? '–' : score }}</b>
        <div class="rail" :class="{ held: rounds.dragging.value }" :style="{ height: `${RAIL}px` }" v-bind="rounds.on">
          <motion.i
            class="thumb" :initial="false" :animate="{ y: ((n - 1) / (LAST - 1)) * RAIL }"
            :transition="rounds.dragging.value ? { duration: 0 } : ease(0.5)"
          />
        </div>
      </template>
      <b v-else class="nm">{{ pair.n }}</b>
    </div>
  </div>
</template>

<style scoped>
.screen { position: absolute; left: 0; top: 0; width: 1152px; height: 720px; object-fit: cover; object-position: top left; }
.hud { position: absolute; right: 0; top: 0; bottom: 0; width: 128px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: var(--hc-night); text-align: center; padding: 0 6px; }
.hud span { font-size: 16px; color: #b5b9bd; }
.hud b { font-size: 48px; line-height: 1; margin-bottom: 18px; color: #fff; }
.hud .nm { font-size: 22px; font-weight: 700; line-height: 1.15; margin-bottom: 6px; }

.rail { position: relative; width: 100%; margin: 14px 0 0; flex: none; cursor: grab; touch-action: none; user-select: none; }
.rail::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 4px; margin-left: -2px; border-radius: 2px; background: #5a6066; }
.rail.held { cursor: grabbing; }
.thumb { position: absolute; left: 50%; top: -14px; width: 28px; height: 28px; margin-left: -14px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45); }

.after { position: absolute; left: 0; top: 0; width: 1152px; height: 720px; }
.wipe { position: absolute; z-index: 1; left: 0; top: 0; width: 1152px; height: 720px; cursor: ew-resize; touch-action: none; user-select: none; }
.tag { position: absolute; left: 244px; bottom: 16px; padding: 4px 12px; border-radius: 6px; font-size: 18px; font-weight: 600; color: #fff; background: rgba(16, 18, 20, 0.84); }
.tag.before { left: auto; right: 144px; }
.edge { position: absolute; left: -2px; top: 0; bottom: 0; width: 4px; background: #fff; box-shadow: 0 0 8px rgba(0, 0, 0, 0.5); }
.edge i { position: absolute; left: 50%; top: 76%; width: 48px; height: 48px; margin: -24px 0 0 -24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 22px; font-style: normal; font-weight: 700; color: #16191c; background: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45); }
</style>
