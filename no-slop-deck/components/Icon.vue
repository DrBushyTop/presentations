<!-- One stroke weight, drawn in SVG. No glyphs or emoji stand in for icons. -->
<script setup lang="ts">
defineProps<{ name: 'check' | 'x' | 'dot' | 'clock' | 'alert' | 'arrow' | 'play' | 'branch' | 'bot' | 'user' | 'eye' | 'file' | 'search' | 'globe' | 'db' | 'ticket' | 'lock' }>()
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
    <g v-else-if="name === 'file'"><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></g>
    <g v-else-if="name === 'search'"><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5.5 5.5" /></g>
    <g v-else-if="name === 'globe'"><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5s1.2-6.1 3.8-8.5z" /></g>
    <g v-else-if="name === 'db'"><ellipse cx="12" cy="6" rx="7" ry="2.5" /><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" /></g>
    <g v-else-if="name === 'ticket'"><path d="M3.5 7.5h17v3a1.5 1.5 0 0 0 0 3v3h-17v-3a1.5 1.5 0 0 0 0-3z" /><path d="M14 7.5v9" stroke-dasharray="1.5 2" /></g>
    <g v-else-if="name === 'lock'"><rect x="5" y="11" width="14" height="9.5" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>
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
