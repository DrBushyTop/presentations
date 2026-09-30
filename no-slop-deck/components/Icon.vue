<!-- One stroke weight, drawn in SVG. No glyphs or emoji stand in for icons. -->
<script setup lang="ts">
defineProps<{ name: 'check' | 'x' | 'dot' | 'clock' | 'alert' | 'arrow' | 'play' | 'branch' | 'bot' | 'user' | 'eye' }>()
</script>

<template>
  <svg class="ns-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-if="name === 'check'" d="M4.5 12.5l5 5 10-11" />
    <path v-else-if="name === 'x'" d="M6 6l12 12M18 6L6 18" />
    <circle v-else-if="name === 'dot'" cx="12" cy="12" r="4.5" fill="currentColor" stroke="none" />
    <g v-else-if="name === 'clock'"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></g>
    <g v-else-if="name === 'alert'"><path d="M12 3.5l9.5 16.5h-19z" /><path d="M12 10v4.5M12 17.4v.1" /></g>
    <path v-else-if="name === 'arrow'" d="M4 12h15M13 6l6 6-6 6" />
    <path v-else-if="name === 'play'" d="M7 4.5v15l12-7.5z" fill="currentColor" />
    <g v-else-if="name === 'branch'"><circle cx="6" cy="5" r="2" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="8" r="2" /><path d="M6 7v10M18 10c0 5-7 4-11 8" /></g>
    <g v-else-if="name === 'bot'"><rect x="4" y="8" width="16" height="11" rx="2" /><path d="M12 8V4.5M9 13h.01M15 13h.01" /></g>
    <g v-else-if="name === 'eye'"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></g>
    <g v-else-if="name === 'user'"><circle cx="12" cy="8" r="3.6" /><path d="M5 20c1-4 4-6 7-6s6 2 7 6" /></g>
  </svg>
</template>

<style scoped>
.ns-icon {
  width: 1em;
  height: 1em;
  flex: none;
  display: inline-block;
  vertical-align: -0.12em;
}
</style>
