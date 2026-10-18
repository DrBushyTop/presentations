<!--
  Part divider. The six parts sit on one track across the screen so the room
  sees where the talk is: the part just finished ticks to done, the track
  fills to this part and it lights up. An arc under the track runs from
  review back to verify: both repeat for the next slice. Then the row zooms into this
  part, which becomes the headline, and its question fades in underneath.
  Outside the live slide (overview, print) it shows the zoomed-in state
  without motion.
-->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useIsActive } from '../lib/active'
import { gates } from '../lib/gates'

const props = defineProps<{ current: number }>()
const active = useIsActive()
const { $renderContext } = useSlideContext()
const still = computed(() => !['slide', 'presenter'].includes($renderContext.value as string))

// Two hidden copies of the row give the offsets: the whole row centred, and
// the row with this part at headline size and centred on it. They also give
// the middle of the review-to-verify arc, where its label goes.
const whole = ref<HTMLElement>()
const zoomed = ref<HTMLElement>()
const xWhole = ref(0)
const xZoom = ref(0)
const labelWhole = ref(0)
const labelZoom = ref(0)
const centre = (row: HTMLElement | undefined, i: number) => {
  const el = row?.querySelector<HTMLElement>(`[data-i="${i}"]`)
  return el ? el.offsetLeft + el.offsetWidth / 2 : 0
}
async function measure() {
  await nextTick()
  await document.fonts?.ready
  if (whole.value) xWhole.value = 640 - whole.value.offsetWidth / 2
  xZoom.value = 640 - centre(zoomed.value, props.current)
  labelWhole.value = (centre(whole.value, 3) + centre(whole.value, 4)) / 2
  labelZoom.value = (centre(zoomed.value, 3) + centre(zoomed.value, 4)) / 2
}
onMounted(measure)

// arrive: the whole row, the previous part still running
// handoff: the previous part done, this part running
// zoom: this part is the headline
type Phase = 'arrive' | 'handoff' | 'zoom'
const phase = ref<Phase>('arrive')
let timers: ReturnType<typeof setTimeout>[] = []
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
const clear = () => { timers.forEach(clearTimeout); timers = [] }

// Slidev mounts the next slide hidden, so measure again once it's on screen.
// On leaving, wait for the page turn before resetting, or the reset shows.
watch(active, async (on) => {
  clear()
  if (!on) {
    later(1500, () => { phase.value = 'arrive' })
    return
  }
  phase.value = 'arrive'
  await measure()
  later(900, () => { phase.value = 'handoff' })
  later(2900, () => { phase.value = 'zoom' })
}, { immediate: true })
onBeforeUnmount(clear)

const shown = computed<Phase>(() => (still.value ? 'zoom' : phase.value))
const reached = computed(() => (shown.value === 'arrive' ? props.current - 1 : props.current))
function state(i: number) {
  if (i < reached.value) return 'done'
  if (i === reached.value) return 'run'
  return 'queued'
}
const x = computed(() => (shown.value === 'zoom' ? xZoom.value : xWhole.value))
const labelX = computed(() => (shown.value === 'zoom' ? labelZoom.value : labelWhole.value))
</script>

<template>
  <div class="ns-dark gate" :class="['p-' + shown, { still }]">
    <div class="window">
      <div class="row" :style="{ transform: `translateX(${x}px)` }">
        <div
          v-for="(g, i) in gates" :key="g.name"
          class="st" :class="['s-' + state(i), { big: shown === 'zoom' && i === current }]"
        >
          <b class="w">{{ g.name }}</b>
          <i class="fill l" />
          <i class="fill r" />
          <span class="node" aria-hidden="true">
            <i class="ping" />
            <i class="dot" />
            <svg viewBox="0 0 24 24"><path d="M6.5 12.5l3.8 3.8L17.5 9" /></svg>
          </span>
          <span v-if="i === 3" class="loop to" aria-hidden="true" />
          <span v-if="i === 4" class="loop from" aria-hidden="true" />
        </div>
        <span class="loop-label ns-mono" :style="{ left: `${labelX}px` }">next slice</span>
      </div>

      <div ref="whole" class="row measure" aria-hidden="true">
        <div v-for="(g, i) in gates" :key="g.name" class="st" :data-i="i"><b class="w">{{ g.name }}</b></div>
      </div>
      <div ref="zoomed" class="row measure" aria-hidden="true">
        <div v-for="(g, i) in gates" :key="g.name" class="st" :data-i="i" :class="{ big: i === current }">
          <b class="w">{{ g.name }}</b>
        </div>
      </div>
    </div>

    <p class="q">{{ gates[current].q }}</p>
  </div>
</template>

<style scoped>
.gate {
  --ok: var(--z-teal-300);
  --live: var(--ns-frozen);
  --ease: var(--ns-ease);
  --gap: 44px;
  --track: #3d3d3d;
  --arc: #666;
}

/* Once zoomed, the row runs off both edges, so the edges fade. */
.window {
  position: absolute;
  inset: 0;
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 72px, #000 1208px, transparent 1280px);
  mask-image: linear-gradient(to right, transparent 0, #000 72px, #000 1208px, transparent 1280px);
}

/* The track runs through the node centres at y 384. Each part draws the half
   of the track on either side of its node. */
.row {
  position: absolute;
  left: 0;
  top: 0;
  height: 398px;
  display: flex;
  align-items: flex-end;
  gap: var(--gap);
  white-space: nowrap;
  transition: transform 1300ms var(--ease);
}

.measure {
  visibility: hidden;
}

.st {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.st::before,
.st::after,
.fill {
  content: '';
  position: absolute;
  bottom: 12px;
  height: 4px;
  background: var(--track);
}

/* The halves overlap by a pixel so the joins don't show. */
.st::before,
.fill.l {
  left: calc(var(--gap) / -2 - 1px);
  right: 50%;
}

.st::after,
.fill.r {
  left: 50%;
  right: calc(var(--gap) / -2);
}

.st:first-of-type::before,
.st:last-of-type::after,
.st:first-of-type .fill.l,
.st:last-of-type .fill.r,
.measure .st::before,
.measure .st::after {
  display: none;
}

/* The filled track sits above every grey half and fills left to right. */
.fill {
  z-index: 1;
  background: var(--ok);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 400ms linear;
}

.s-done .fill,
.s-run .fill.l {
  transform: scaleX(1);
}

/* The track reaches this part after the previous half has filled. */
.s-run .fill.l {
  transition-delay: 400ms;
}

.w {
  font-family: var(--z-font-display);
  font-size: 36px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #5a5a5a;
  transition: font-size 1300ms var(--ease), letter-spacing 1300ms var(--ease), color 600ms var(--ease);
}

.big .w {
  font-size: 168px;
  letter-spacing: -0.045em;
}

.s-done .w { color: var(--ok); }
.s-run .w { color: #fff; transition-delay: 0ms, 0ms, 800ms; }

/* ---------- Nodes ---------- */

.node {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-top: 18px;
  border-radius: 50%;
  background: var(--z-ink);
  box-shadow: inset 0 0 0 3px #4a4a4a;
  transition: background-color 400ms var(--ease), box-shadow 400ms var(--ease);
}

.node > * {
  grid-area: 1 / 1;
}

.node svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: var(--z-ink);
  stroke-width: 3.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 16;
  stroke-dashoffset: 16;
  transition: stroke-dashoffset 450ms var(--ease) 150ms;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--live);
  opacity: 0;
  transition: opacity 300ms var(--ease);
}

.ping {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--live);
  opacity: 0;
}

.s-done .node {
  background: var(--ok);
  box-shadow: inset 0 0 0 3px var(--ok);
}

.s-done .node svg {
  stroke-dashoffset: 0;
}

.s-run .node {
  box-shadow: inset 0 0 0 3px var(--live);
  transition-delay: 800ms;
}

.s-run .dot {
  opacity: 1;
  transition-delay: 800ms;
}

.gate:not(.still) .s-run .ping {
  animation: ping 1.8s var(--ease) infinite;
}

.gate:not(.p-arrive) .s-run .ping {
  animation-delay: 800ms;
}

@keyframes ping {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}

/* ---------- Next slice ----------
   An arc under the track from review back to verify, drawn in two pieces so
   each stays attached to its part while the row zooms. */

.loop {
  position: absolute;
  top: calc(100% + 8px);
  height: 28px;
  border: 0 solid var(--arc);
}

.loop.to {
  left: 50%;
  right: calc(var(--gap) / -2);
  border-width: 0 0 2px 2px;
  border-bottom-left-radius: 14px;
}

/* Arrowhead pointing up into verify */
.loop.to::before {
  content: '';
  position: absolute;
  left: -5px;
  top: -1px;
  width: 10px;
  height: 10px;
  border: 0 solid var(--arc);
  border-width: 2px 0 0 2px;
  transform: rotate(45deg);
}

.loop.from {
  left: calc(var(--gap) / -2 - 1px);
  right: 50%;
  border-width: 0 2px 2px 0;
  border-bottom-right-radius: 14px;
}

.loop-label {
  position: absolute;
  top: 442px;
  transform: translateX(-50%);
  font-size: 18px;
  line-height: 22px;
  color: #8f8f8f;
  transition: left 1300ms var(--ease);
}

/* ---------- Question ---------- */

.q {
  position: absolute;
  left: 0;
  right: 0;
  top: 492px;
  margin: 0;
  max-width: none;
  text-align: center;
  font-size: 40px;
  font-weight: 700;
  color: var(--live);
  transition: opacity 800ms var(--ease) 900ms, transform 900ms var(--ease) 900ms;
}

.gate:not(.p-zoom) .q {
  opacity: 0;
  transform: translateY(16px);
}

/* Before it starts, nothing animates into place. */
.p-arrive .row,
.p-arrive .row *,
.still .row,
.still .row *,
.still .q {
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .row,
  .w {
    transition: none;
  }

  .ping {
    animation: none !important;
  }
}
</style>
