<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'
import { share } from './share'

const nav = useNav()
// Phones cannot capture a screen, so the phone remote gets no button.
const canCapture = !!navigator.mediaDevices?.getDisplayMedia
const available = computed(() => canCapture && nav.isPresenter.value && !nav.isPrintMode.value && !nav.isEmbedded.value)
const { state, error } = share
const title = computed(() => state.value === 'live'
  ? 'Stop sharing your screen with live viewers'
  : state.value === 'starting'
    ? 'Starting the screen share…'
    : error.value
      ? `Screen share failed: ${error.value} Click to try again.`
      : 'Share your screen with live viewers')
</script>

<template>
  <button
    v-if="available"
    class="slidev-icon-btn live-share" :class="[state, { failed: error && state === 'off' }]" type="button"
    :title="title" :aria-pressed="state === 'live'"
    @click="state === 'off' ? share.start() : share.stop()"
  >
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="9" rx="1" />
      <path d="M5.5 14h5M8 11.5V14" />
      <path v-if="state !== 'live'" d="M8 9V5M6 6.8 8 5l2 1.8" />
      <path v-else d="M6 5l4 4M10 5 6 9" />
    </svg>
  </button>
</template>

<style scoped>
.live-share svg { width: 1.1em; height: 1.1em; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linejoin: round; stroke-linecap: round; }
.live-share.live { color: #ef4444; }
.live-share.starting { opacity: 0.6; }
.live-share.failed { color: #f59e0b; }
</style>
