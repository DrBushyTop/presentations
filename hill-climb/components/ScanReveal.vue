<!--
  Writes its slot from the left, with a lens flare at the write head. The beams
  strobe between upright and crossing every 0.12 s, and hairlines flicker around
  the head. `front` runs 0 to 1, `time` is seconds.
-->
<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(defineProps<{ x: number, y: number, w: number, h: number, front: number, time: number, below?: number }>(), { below: 70 })
const clip = useId()
const beamFill = useId()
const haze = useId()
const soft = useId()

const FLASHES = [[24, -22], [90, 28], [90, 88], [26, -68], [88, 12], [90], [20, 84], [90, 92], [18], [90], [24, 90], [90, -16]]
const rand = (n: number) => { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v) }

const tick = computed(() => Math.floor(props.time / 0.12))
const top = computed(() => props.y - 70)
const bottom = computed(() => props.y + props.h + props.below)
const lean = computed(() => (bottom.value - top.value) * 0.182)
const head = computed(() => props.x - lean.value + props.front * (props.w + 2 * lean.value))
const mid = computed(() => props.y + props.h / 2)
const shape = computed(() => {
  const left = props.x - 60
  return `${left},${top.value} ${head.value + lean.value},${top.value} ${head.value - lean.value},${bottom.value} ${left},${bottom.value}`
})
const sweeping = computed(() => props.front > 0 && props.front < 1)
const beams = computed(() => FLASHES[tick.value % FLASHES.length].map((deg, i) => ({
  deg,
  length: deg === 90 || Math.abs(deg) > 60 ? 430 : 340,
  width: i ? 30 : 56,
  shift: deg === 90 && i ? -46 : 0,
})))
const flats = computed(() => [0, 1, 2].map((i) => {
  const b = tick.value
  const row = [0.06, 0.34, 0.62, 0.98][Math.floor(rand(b * 3 + i) * 4)]
  const from = head.value + 24 + rand(b * 5 + i) * 330
  return { x1: from, x2: from + 40 + rand(b * 7 + i) * 190, y: props.y + props.h * row }
}))
const slants = computed(() => [0, 1].map((i) => {
  const b = tick.value
  const length = 70 + rand(b * 11 + i) * 150
  const side = rand(b * 13 + i) > 0.5 ? 1 : -1
  const x = head.value + (rand(b * 17 + i) - 0.5) * 240
  const y = side > 0 ? props.y + props.h + 16 + rand(b * 19 + i) * 50 : props.y - 16 - rand(b * 19 + i) * 50
  return { x1: x, y1: y, x2: x - side * length * 0.34, y2: y + side * length * 0.94 }
}))
</script>

<template>
  <g>
    <defs>
      <clipPath :id="clip"><polygon :points="shape" /></clipPath>
      <linearGradient :id="beamFill">
        <stop offset="0" stop-color="#1c46d8" stop-opacity="0" />
        <stop offset="0.3" stop-color="#2a62f0" stop-opacity="0.8" />
        <stop offset="0.5" stop-color="#6ea6ff" />
        <stop offset="0.7" stop-color="#2a62f0" stop-opacity="0.8" />
        <stop offset="1" stop-color="#1c46d8" stop-opacity="0" />
      </linearGradient>
      <radialGradient :id="haze">
        <stop offset="0" stop-color="#e4f3ff" />
        <stop offset="0.35" stop-color="#9fcfff" stop-opacity="0.75" />
        <stop offset="1" stop-color="#3f7dff" stop-opacity="0" />
      </radialGradient>
      <filter :id="soft" x="-10%" y="-120%" width="120%" height="340%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
    </defs>
    <g :clip-path="`url(#${clip})`"><slot /></g>
    <g v-if="sweeping" class="flare" aria-hidden="true">
      <rect
        v-for="(b, i) in beams" :key="i" :x="head + b.shift - b.length" :y="mid - b.width / 2" :width="b.length * 2" :height="b.width"
        :transform="`rotate(${b.deg} ${head + b.shift} ${mid})`" :fill="`url(#${beamFill})`" :filter="`url(#${soft})`"
      />
      <ellipse :cx="head" :cy="mid" rx="96" ry="78" :fill="`url(#${haze})`" :opacity="(0.45 + rand(tick) * 0.35) * (1 - front * 0.6)" />
      <line v-for="(l, i) in flats" :key="`f${i}`" :x1="l.x1" :y1="l.y" :x2="l.x2" :y2="l.y" stroke="#eefaff" stroke-width="1.6" />
      <line v-for="(l, i) in slants" :key="`s${i}`" v-bind="l" stroke="#eefaff" stroke-width="1.4" />
    </g>
  </g>
</template>

<style scoped>
.flare { mix-blend-mode: screen; }
</style>
