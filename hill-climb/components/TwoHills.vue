<!--
  Why UI is a harder hill than a test suite. Both numbers are from Theo's
  video: the MCP eval falling 66 to 63 of 85, and a rival's score rising from
  8.3 to 9.1 on screenshots nobody had changed.
-->
<script setup lang="ts">
import { useStage } from '../lib/stage'
import Count from './Count.vue'
import Rise from './Rise.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { entered } = useStage()
</script>

<template>
  <div class="hc-stage two">
    <div class="sec">
      <h3>A test run</h3>
      <div class="exhibit evals">
        <i v-for="n in 85" :key="n" :class="{ ok: n <= 63, lost: n > 63 && n <= 66 }" />
      </div>
      <p class="big"><Count :from="66" :to="63" :on="entered" :delay="0.7" :duration="1" /><span> / 85</span></p>
      <p class="hc-label">A program says so</p>
    </div>
    <Rise :on="step >= 1" :x="30" :y="0">
      <div class="sec">
        <h3>A good interface</h3>
        <div class="exhibit wire" aria-hidden="true"><i class="top" /><i class="side" /><i class="main" /><i class="line" /><i class="line s" /></div>
        <p class="big"><Count :from="8.3" :to="9.1" :on="step >= 1" :decimals="1" :delay="0.5" :duration="1.6" /></p>
        <p class="hc-label">Same rival screenshot, nothing changed</p>
      </div>
    </Rise>
  </div>
</template>

<style scoped>
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; }
.sec { display: flex; flex-direction: column; height: 100%; min-height: 0; }
h3 { font-size: 28px; font-weight: 700; margin: 0 0 16px; color: var(--z-ink); }
.exhibit { flex: 1; min-height: 0; border-radius: 12px; background: var(--hc-soft); overflow: hidden; }
.evals { display: grid; grid-template-columns: repeat(17, 1fr); gap: 6px; padding: 18px; align-content: center; }
.evals i { aspect-ratio: 1; border-radius: 50%; background: var(--z-grey-200); }
.evals .ok { background: var(--z-teal); }
.evals .lost { background: var(--z-red); }
.wire { display: grid; grid-template-columns: 24% 1fr; grid-template-rows: 34px 1fr 16px 16px; gap: 10px; padding: 18px; }
.wire i { height: 100%; border-radius: 4px; background: var(--z-grey-200); }
.wire .top { grid-column: 1 / -1; }
.wire .side { grid-row: 2 / 5; }
.wire .s { width: 60%; }
.big { font-size: 64px; line-height: 1; margin: 18px 0 0; color: var(--z-ink); }
.big span:last-child:not(.hc-num) { font-size: 34px; color: var(--z-grey-600); }
.hc-label { margin: 4px 0 0; font-size: 20px; }
</style>
