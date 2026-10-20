<script setup>
import { defineAsyncComponent } from 'vue'

// Only a dev server that publishes to the live site puts a camera button in
// the presenter view.
const CameraButton = import.meta.env.DEV && __SLIDEV_LIVE_BRIDGE__ ? defineAsyncComponent(() => import('./client/CameraButton.vue')) : null
</script>

<template>
  <CameraButton v-if="CameraButton" />
</template>
