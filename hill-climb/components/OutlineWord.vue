<!-- Hollow slanted lettering from lib/outline.ts. The middle is cut out, so it works on any background. -->
<script setup lang="ts">
import { computed, useId } from 'vue'
import { CAP, measure, outlinePath, STROKE } from '../lib/outline'

const props = defineProps<{ text: string, x: number, y: number, scale: number, core?: string }>()
const cut = useId()
const edge = useId()
const d = computed(() => outlinePath(props.text))
const place = computed(() => `translate(${props.x} ${props.y}) skewX(-20) scale(${props.scale})`)
const area = computed(() => ({
  x: props.x - 60,
  y: props.y - 24,
  width: measure(props.text) * props.scale + 120,
  height: CAP * props.scale + 48,
}))
</script>

<template>
  <g>
    <defs>
      <linearGradient :id="edge" gradientUnits="userSpaceOnUse" x1="0" :y1="y" x2="0" :y2="y + CAP * scale">
        <stop offset="0" stop-color="#58d6ea" />
        <stop offset="0.6" stop-color="#2fa9c2" />
        <stop offset="1" stop-color="#d7eef2" />
      </linearGradient>
      <mask :id="cut" maskUnits="userSpaceOnUse" v-bind="area">
        <g :transform="place" fill="none" stroke-linejoin="miter" stroke-miterlimit="2" stroke-linecap="square">
          <path :d="d" stroke="#fff" :stroke-width="STROKE + 4" />
          <path :d="d" stroke="#000" :stroke-width="STROKE" />
        </g>
      </mask>
    </defs>
    <g v-if="core" :transform="place" fill="none" stroke-linejoin="miter" stroke-miterlimit="2" stroke-linecap="square">
      <path :d="d" :stroke="core" :stroke-width="STROKE" />
    </g>
    <rect v-bind="area" :fill="`url(#${edge})`" :mask="`url(#${cut})`" />
  </g>
</template>
