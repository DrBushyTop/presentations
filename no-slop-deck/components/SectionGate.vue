<!--
  Part divider. The part's own material streams down through a gate line:
  above it, unchecked and dim; below it, each line has either passed or been
  held, with the reason. The same stream is drawn twice and clipped at the
  line, so a line changes state exactly as it crosses. Outside the live slide
  (overview, print) it shows a still frame.
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useIsActive } from '../lib/active'
import { gates } from '../lib/gates'

const props = defineProps<{ current: number, title: string, question: string }>()
const active = useIsActive()
const { $renderContext } = useSlideContext()
const still = computed(() => !['slide', 'presenter'].includes($renderContext.value as string))

// Slidev often mounts this slide at the moment it becomes active, so start
// the entrance a frame later or the transitions never run.
const go = ref(false)
watch(active, (on) => {
  if (!on) {
    go.value = false
    return
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { go.value = true }))
}, { immediate: true })

const gate = computed(() => gates[props.current])
// Enough copies to cover the panel plus one loop.
const lines = computed(() => Array.from({ length: 4 }, () => gate.value.stream).flat())
const ROW = 46
const loop = computed(() => `${gate.value.stream.length * ROW}px`)
</script>

<template>
  <div class="ns-dark gate-slide" :class="{ go: go || still, still, moving: go && !still }">
    <ol class="rail" aria-label="Parts of the talk">
      <li
        v-for="(g, i) in gates" :key="g.name"
        :class="{ past: i < current, now: i === current }"
        :aria-current="i === current ? 'step' : undefined"
      >
        {{ g.name }}
      </li>
    </ol>

    <div class="copy">
      <h1>{{ title }}</h1>
      <p>{{ question }}</p>
    </div>

    <div class="panel" aria-hidden="true" :style="{ '--loop': loop, '--row': ROW + 'px' }">
      <div class="half above">
        <ul class="stream">
          <li v-for="(l, i) in lines" :key="i"><span class="mark">›</span><span class="t">{{ l.t }}</span></li>
        </ul>
      </div>
      <div class="half below">
        <ul class="stream">
          <li v-for="(l, i) in lines" :key="i" :class="{ held: l.held }">
            <Icon class="mark" :name="l.held ? 'x' : 'check'" />
            <span class="t">{{ l.t }}</span>
            <em v-if="l.held">{{ l.held }}</em>
          </li>
        </ul>
      </div>

      <div class="gate"><i class="bar" /></div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- Rail ---------- */

.rail {
  position: absolute;
  top: 56px;
  left: 72px;
  z-index: 2;
  display: flex;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rail li {
  width: 96px;
  margin: 0;
  padding-top: 12px;
  border-top: 3px solid #3a3a3a;
  font-size: 16px;
  font-weight: 700;
  color: #7a7a7a;
}

.rail li::before {
  display: none !important;
}

.rail li.past {
  border-color: var(--z-teal);
  color: var(--z-teal-300);
}

.rail li.now {
  border-color: var(--ns-frozen);
  color: #fff;
}

/* ---------- Copy ---------- */

.copy {
  position: absolute;
  left: 72px;
  bottom: 76px;
  z-index: 2;
  width: 610px;
}

h1 {
  font-family: var(--z-font-display);
  font-size: 80px;
  line-height: 0.96;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #fff;
  margin: 0 0 26px;
  text-wrap: balance;
}

p {
  font-size: 28px;
  line-height: 1.3;
  color: var(--ns-frozen);
  font-weight: 600;
  margin: 0;
  max-width: 30ch;
  text-wrap: balance;
}

/* ---------- Stream through the gate ---------- */

.panel {
  --line: 56%;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 560px;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 84%, transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 84%, transparent);
}

.half {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.above {
  clip-path: inset(0 0 calc(100% - var(--line)) 0);
}

.below {
  clip-path: inset(var(--line) 0 0 0);
}

.stream {
  margin: 0;
  padding: 0 0 0 28px;
  list-style: none;
  transform: translateY(calc(var(--loop) * -1));
}

.moving .stream {
  animation: flow 11s linear infinite;
}

@keyframes flow {
  from { transform: translateY(calc(var(--loop) * -1)); }
  to { transform: translateY(0); }
}

.stream li {
  height: var(--row);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--ns-mono);
  font-size: 19px;
  white-space: nowrap;
}

.stream li::before {
  display: none !important;
}

.mark {
  flex: none;
  width: 20px;
  text-align: center;
}

.above li {
  color: #5f5f5f;
}

.below li {
  color: #f2f2f2;
}

.below .mark {
  color: var(--ns-frozen);
  font-size: 20px;
}

.below li.held {
  color: #ff8a78;
}

.below li.held .mark {
  color: var(--z-red-400);
}

.below li.held .t {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.below em {
  font-family: var(--z-font-text);
  font-style: normal;
  font-size: 16px;
  font-weight: 700;
  padding: 2px 8px;
  background: var(--ns-red);
  color: #fff;
}

.gate {
  position: absolute;
  left: 0;
  right: 0;
  top: var(--line);
  transform: translateY(-50%);
  pointer-events: none;
}

.bar {
  display: block;
  width: 100%;
  height: 3px;
  background: var(--ns-frozen);
  box-shadow: 0 10px 40px 4px rgba(5, 195, 222, 0.35);
  transform-origin: left;
  transition: transform 1100ms var(--ns-ease) 350ms;
}

.gate-slide:not(.go) .bar {
  transform: scaleX(0);
}

.half {
  transition: opacity 900ms var(--ns-ease) 200ms;
}

.gate-slide:not(.go) .half {
  opacity: 0;
}

/* ---------- Entrance ---------- */

h1,
p {
  transition: opacity 700ms var(--ns-ease), transform 900ms var(--ns-ease), filter 700ms var(--ns-ease);
}

.gate-slide:not(.go) h1,
.gate-slide:not(.go) p {
  opacity: 0;
  transform: translateY(24px);
  filter: blur(6px);
}

.go h1 { transition-delay: 600ms; }
.go p { transition-delay: 850ms; }

.still,
.still * {
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .moving .stream {
    animation: none;
  }

  .gate-slide:not(.go) h1,
  .gate-slide:not(.go) p {
    transform: none;
    filter: none;
  }
}
</style>
