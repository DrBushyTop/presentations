<script setup>
import { defineAsyncComponent } from 'vue'

// Only a dev server that publishes to the live site can share a screen.
const ShareButton = import.meta.env.DEV && __SLIDEV_LIVE_BRIDGE__ ? defineAsyncComponent(() => import('./client/ShareButton.vue')) : null
</script>

<template>
  <ShareButton v-if="ShareButton" />
</template>
