<!--
  Part divider. A corridor of doorways in 3D: the current gate is nearest and
  lit, the ones still ahead recede behind it. When the slide opens, the camera
  walks forward through the previous gate. The rail at the top keeps the
  whole sequence in view. Outside the live slide (overview, print) it shows
  the final state without motion.
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

// Doors from the previous gate (which the camera passes) to the last one.
const doors = computed(() =>
  gates
    .map((g, i) => ({ ...g, i, d: i - props.current }))
    .filter(g => g.d >= -1),
)
</script>

<template>
  <div class="ns-dark gate-slide" :class="{ go: go || still, still }">
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

    <div class="stage" aria-hidden="true">
      <div class="rig">
        <div class="floor" />
        <div
          v-for="d in doors" :key="d.name" class="door"
          :class="{ now: d.d === 0, behind: d.d < 0 }"
          :style="{ '--d': d.d, '--fade': Math.max(0.4, 1 - Math.max(d.d, 0) * 0.12) }"
        >
          <span v-if="d.d === 0">{{ d.name }}</span>
        </div>
      </div>
      <div class="spill" />
    </div>
  </div>
</template>

<style scoped>
.gate-slide {
  --gap: 540px;
}

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
  width: 600px;
}

h1 {
  font-family: var(--z-font-display);
  font-size: 88px;
  line-height: 0.95;
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

/* ---------- Corridor ---------- */

.stage {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 620px;
  perspective: 1000px;
  perspective-origin: 20% 44%;
  overflow: hidden;
}

.rig {
  position: absolute;
  left: 170px;
  top: 150px;
  width: 300px;
  height: 460px;
  transform-style: preserve-3d;
  transform: translateZ(0);
}

.go .rig {
  transition: transform 1600ms var(--ns-ease) 650ms;
}

.gate-slide:not(.go) .rig {
  transform: translateZ(calc(var(--gap) * -1));
}

.door {
  position: absolute;
  inset: 0;
  border: 6px solid #3d3d3d;
  border-bottom: 0;
  opacity: var(--fade);
  transform: translateZ(calc(var(--d) * var(--gap) * -1));
  transition: opacity 900ms var(--ns-ease) 900ms, border-color 900ms var(--ns-ease) 900ms, box-shadow 900ms var(--ns-ease) 900ms, background 900ms var(--ns-ease) 900ms;
}

.door span {
  position: absolute;
  top: 20px;
  left: 22px;
  font-family: var(--z-font-display);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #6a6a6a;
}

.door.now {
  border-color: var(--ns-frozen);
  background: linear-gradient(to top, rgba(5, 195, 222, 0.3), rgba(5, 195, 222, 0.04) 70%);
  box-shadow: 0 30px 90px -20px rgba(5, 195, 222, 0.45);
}

.door.now span {
  color: #fff;
}

.gate-slide:not(.go) .door.now {
  border-color: #3d3d3d;
  background: transparent;
  box-shadow: none;
}

/* The gate we just came through: framed at first, then passed. */
.door.behind {
  border-color: var(--z-teal);
}

.go .door.behind {
  opacity: 0;
}

.floor {
  position: absolute;
  left: -140px;
  top: 100%;
  width: 580px;
  height: 4400px;
  transform-origin: top center;
  transform: rotateX(-90deg) translateY(-700px);
  background:
    radial-gradient(ellipse 50% 14% at 50% 16%, rgba(5, 195, 222, 0.3), transparent 70%),
    repeating-linear-gradient(to bottom, transparent 0 268px, #353535 268px 271px),
    linear-gradient(to right, transparent 138px, #333 138px 141px, transparent 141px 439px, #333 439px 442px, transparent 442px);
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 8%, #000 30%, transparent 85%);
  mask-image: linear-gradient(to bottom, transparent, #000 8%, #000 30%, transparent 85%);
}

.spill {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 45% at 52% 88%, rgba(5, 195, 222, 0.16), transparent 70%);
  pointer-events: none;
  transition: opacity 1200ms var(--ns-ease) 1100ms;
}

.gate-slide:not(.go) .spill {
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

.go h1 { transition-delay: 900ms; }
.go p { transition-delay: 1150ms; }

.still,
.still * {
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .rig,
  .gate-slide:not(.go) .rig {
    transition: none;
    transform: none;
  }

  .gate-slide:not(.go) h1,
  .gate-slide:not(.go) p {
    transform: none;
    filter: none;
  }
}
</style>
