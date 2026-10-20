<script setup lang="ts">
import type { Box } from './place'
import { slideAspect, useDrawings } from '@slidev/client'
import { recorder } from '@slidev/client/logic/recording.ts'
import { presenterLayout } from '@slidev/client/state/storage.ts'
import { useEventListener } from '@vueuse/core'
import { computed, onBeforeUnmount, ref, shallowRef, watch, watchEffect } from 'vue'
import { placement } from './camera'
import { circle, clampPlace, fit } from './place'
import { mirror } from './share'

// The camera bubble in the presenter view, over the Current pane, on the spot
// of the slide where viewers see it. Clicks and drawing go through it to the
// slide: only its edge moves it, and the dot on the edge resizes it. While
// drawing, neither does.
const EDGE = 10
const KNOB = 7

const { drawingEnabled } = useDrawings()
const video = ref<HTMLVideoElement>()
const box = shallowRef<Box>()
const near = ref(false)
const drag = shallowRef<{ kind: 'move' | 'size', dx: number, dy: number, out: number }>()

// The slide in the Current pane, or a slide's shape fitted in the Screen
// Mirror, as viewers see a share.
function measure() {
  const slide = document.getElementById('slide-content')?.getBoundingClientRect()
  const pane = mirror.value?.getBoundingClientRect()
  box.value = slide?.width ? slide : pane?.width ? fit(pane, slideAspect.value) : undefined
}
// The pane changes size with the window, the layout and the notes.
const observer = new ResizeObserver(measure)
const container = document.getElementById('slide-container')
if (container) observer.observe(container)
watch(mirror, (pane, old) => {
  if (old) observer.unobserve(old)
  if (pane) observer.observe(pane)
  measure()
}, { immediate: true })
watch(presenterLayout, measure, { flush: 'post' })
useEventListener('resize', measure)
onBeforeUnmount(() => observer.disconnect())

const place = computed(() => box.value && clampPlace(placement.value, box.value.width / box.value.height))
const shown = computed(() => box.value && place.value && circle(box.value, place.value))
const knob = computed(() => shown.value && shown.value.size / 2 * (1 + Math.SQRT1_2))

watchEffect(() => {
  if (video.value) video.value.srcObject = recorder.streamCamera.value ?? null
}, { flush: 'post' })

// The handles show once the pointer is on the bubble.
useEventListener(document, 'pointermove', (event: PointerEvent) => {
  const c = shown.value
  near.value = !!c && Math.hypot(event.clientX - c.left - c.size / 2, event.clientY - c.top - c.size / 2) < c.size / 2 + 16
}, { passive: true })
useEventListener(document.documentElement, 'pointerleave', () => near.value = false)

function grab(event: PointerEvent, kind: 'move' | 'size') {
  const c = shown.value
  if (!c || event.button !== 0) return
  event.preventDefault()
  ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
  const dx = event.clientX - c.left - c.size / 2
  const dy = event.clientY - c.top - c.size / 2
  drag.value = { kind, dx, dy, out: Math.hypot(dx, dy) - c.size / 2 }
}

function follow(event: PointerEvent) {
  const d = drag.value
  const b = box.value
  const p = place.value
  if (!d || !b || !p) return
  const x = (event.clientX - b.left) / b.width
  const y = (event.clientY - b.top) / b.height
  // Moving keeps the pointer where it took hold; resizing keeps the centre.
  const next = d.kind === 'move'
    ? { ...p, x: x - d.dx / b.width, y: y - d.dy / b.height }
    : { ...p, size: 2 * (Math.hypot(event.clientX - b.left - p.x * b.width, event.clientY - b.top - p.y * b.height) - d.out) / b.width }
  placement.value = clampPlace(next, b.width / b.height)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="shown"
      class="slidev-live-bubble"
      :class="{ near: near || drag, moving: drag, drawing: drawingEnabled }"
      :style="{ left: `${shown.left}px`, top: `${shown.top}px`, width: `${shown.size}px`, height: `${shown.size}px` }"
    >
      <video ref="video" autoplay muted playsinline />
      <svg :viewBox="`0 0 ${shown.size} ${shown.size}`">
        <circle
          class="edge"
          :cx="shown.size / 2"
          :cy="shown.size / 2"
          :r="shown.size / 2 - EDGE / 2"
          :stroke-width="EDGE"
          @pointerdown="grab($event, 'move')"
          @pointermove="follow"
          @pointerup="drag = undefined"
          @lostpointercapture="drag = undefined"
        >
          <title>Drag the edge to move the camera</title>
        </circle>
        <circle
          class="knob"
          :cx="knob"
          :cy="knob"
          :r="KNOB"
          @pointerdown="grab($event, 'size')"
          @pointermove="follow"
          @pointerup="drag = undefined"
          @lostpointercapture="drag = undefined"
        >
          <title>Drag to resize the camera</title>
        </circle>
      </svg>
    </div>
  </Teleport>
</template>

<style scoped>
/* Slidev's own bubble sits at this level: over the slide, under menus. */
.slidev-live-bubble {
  position: fixed;
  z-index: 15;
  pointer-events: none;
}

.slidev-live-bubble video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  background: rgb(156 163 175 / 0.1);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.3);
  transform: rotateY(180deg);
}

.slidev-live-bubble svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Only the edge and the knob take the pointer, wherever they are drawn. */
.edge {
  fill: none;
  stroke: transparent;
  pointer-events: stroke;
  cursor: move;
  touch-action: none;
  transition: stroke 0.15s;
}

.knob {
  fill: #fff;
  stroke: rgb(0 0 0 / 0.4);
  opacity: 0;
  pointer-events: all;
  cursor: nwse-resize;
  touch-action: none;
  transition: opacity 0.15s;
}

.near .edge {
  stroke: rgb(255 255 255 / 0.35);
}

.near .edge:hover,
.moving .edge {
  stroke: rgb(255 255 255 / 0.75);
}

.near .knob {
  opacity: 1;
}

.drawing .edge,
.drawing .knob {
  display: none;
}

@media (hover: none) {
  .knob {
    opacity: 1;
  }
}
</style>
