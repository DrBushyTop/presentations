<!--
  The common reveal. Follows `on`, and sits hidden until the slide is on screen.
  Starts hidden even when `on` is already true, so a v-if mount animates too.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'

const props = withDefaults(defineProps<{ on?: boolean, delay?: number, x?: number, y?: number, scale?: number }>(), {
  on: true, delay: 0, x: 0, y: 18, scale: 1,
})
const { entered, spring, still } = useStage()
const shown = computed(() => props.on && entered.value)
const hidden = { opacity: 0, x: props.x, y: props.y, scale: props.scale }
const open = { opacity: 1, x: 0, y: 0, scale: 1 }
</script>

<template>
  <motion.div :initial="still ? open : hidden" :animate="shown ? open : hidden" :transition="spring({ delay: still || !shown ? 0 : delay })">
    <slot />
  </motion.div>
</template>
