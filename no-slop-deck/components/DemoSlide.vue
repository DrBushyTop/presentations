<!-- Live demo interstitial: the prompt types itself while the terminal opens. -->
<script setup lang="ts">
import { computed } from 'vue'
import { prefersReducedMotion, useClock, useIsActive } from '../lib/active'

const props = defineProps<{ title: string, minutes: number, prompt: string, agent?: string }>()
const active = useIsActive()
const t = useClock(() => active.value)
const typed = computed(() => prefersReducedMotion() ? props.prompt : props.prompt.slice(0, Math.max(0, Math.floor((t.value - 0.8) * 60))))
const done = computed(() => typed.value.length >= props.prompt.length)
</script>

<template>
  <div class="ns-dark demo">
    <div class="top">
      <span class="live"><i /> Live demo</span>
      <span class="min ns-mono">{{ minutes }} min</span>
    </div>
    <h1>{{ title }}</h1>
    <div class="term">
      <div class="bar"><i /><i /><i /><span class="ns-mono">{{ agent ?? 'opencode' }}</span></div>
      <div class="screen ns-mono">
        <span class="caret-line"><b>›</b> {{ typed }}<span class="caret" :class="{ blink: done }" /></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo {
  padding: 56px 72px 64px;
  display: grid;
  grid-template-rows: auto auto 1fr;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: 700;
}

.live {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--ns-red);
  text-transform: none;
}

.live i {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--z-red-400);
  animation: pulse 1.6s ease-in-out infinite;
}

.min {
  color: #9a9a9a;
}

h1 {
  font-size: 66px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.02;
  margin: 26px 0 34px;
  color: #fff;
}

.term {
  border: 1px solid #3a3a3a;
  background: #111;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #2c2c2c;
}

.bar i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3d3d3d;
}

.bar span {
  margin-left: 10px;
  color: #8a8a8a;
  font-size: 15px;
}

.screen {
  padding: 26px 30px;
  font-size: 27px;
  line-height: 1.55;
  color: #f2f2f2;
  white-space: pre-wrap;
}

.screen b {
  color: var(--ns-frozen);
  font-weight: 700;
}

.caret {
  display: inline-block;
  width: 0.6ch;
  height: 1.1em;
  margin-left: 2px;
  vertical-align: -0.2em;
  background: var(--ns-frozen);
}

.caret.blink {
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

@keyframes pulse {
  50% { opacity: 0.35; }
}

@media (prefers-reduced-motion: reduce) {
  .live i, .caret.blink { animation: none; }
}
</style>
