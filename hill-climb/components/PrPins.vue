<!-- One real PR image from the run: before and after, with the pins and legend the agent drew. -->
<script setup lang="ts">
import { asset } from '../lib/stage'
import Rise from './Rise.vue'
</script>

<template>
  <div class="hc-stage p">
    <Rise class="shot hc-card" :y="24">
      <img :src="asset('screens/pr-pins.webp')" alt="A PR image: before and after screenshots of the Evidence header, with four numbered pins and a legend">
    </Rise>
    <Rise class="cap hc-label" :delay="0.25">
      One of 190 PRs. The agent took the screenshots and drew the pins.
    </Rise>
  </div>
</template>

<style scoped>
.p { display: flex; flex-direction: column; justify-content: center; gap: 14px; }
.shot { padding: 6px 8px; box-shadow: 0 10px 30px rgb(0 0 0 / 0.06); }
.shot img { display: block; width: 100%; height: auto; }
.cap { font-size: 18px; }
</style>
