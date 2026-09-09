<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  x: number | string
  y: number | string
  width?: number | string
  align?: 'left' | 'center' | 'right'
}>(), { width: 690, align: 'left' })

const left = computed(() => Number(props.x) - (
  props.align === 'right' ? Number(props.width) : props.align === 'center' ? Number(props.width) / 2 : 0
))
</script>

<template>
  <foreignObject :x="left" :y="Number(y) - 24" :width="width" height="36" class="context-label">
    <div xmlns="http://www.w3.org/1999/xhtml" class="context-label-content" :style="{ justifyContent: { left: 'flex-start', center: 'center', right: 'flex-end' }[align] }">
      <slot />
    </div>
  </foreignObject>
</template>

<style scoped>
/* HTML labels keep typography consistent with the deck in high-DPI previews. */
.context-label { overflow: visible; }
.context-label-content {
  display: flex;
  position: relative;
  align-items: center;
  height: 32px;
  line-height: 1;
  white-space: nowrap;
}
</style>
