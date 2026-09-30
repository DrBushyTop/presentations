<!--
  Reveal wrapper driven by a step number instead of v-click, so the same markup
  works in the click deck (step = $clicks) and the split deck (step = constant).
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  step: number
  at?: number
  until?: number
  fx?: 'rise' | 'left' | 'wipe' | 'focus' | 'fade'
  tag?: string
}>(), { at: 1, fx: 'rise', tag: 'div' })

const on = computed(() => props.step >= props.at && (props.until == null || props.step < props.until))
</script>

<template>
  <component :is="tag" class="ns-show" :class="[`ns-fx-${fx}`, { on }]">
    <slot />
  </component>
</template>
