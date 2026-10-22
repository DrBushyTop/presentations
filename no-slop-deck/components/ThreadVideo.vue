<!--
  A recording of the real PR #540 thread in the T3 web UI. Each click plays
  the video on to the next beat, pauses there and zooms to the message.
  Going back jumps straight to that beat. Thumbnails and exports show a
  still of the beat instead of the video.
  0 to 8: the beats in lib/thread540.ts
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { prefersReducedMotion, useIsActive } from '../lib/active'
import { BEATS } from '../lib/thread540'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const { $renderContext } = useSlideContext()
const active = useIsActive()
const live = computed(() => ['slide', 'presenter'].includes($renderContext.value as string))
const target = computed(() => Math.min(Math.max(props.step, 0), BEATS.length - 1))

const video = ref<HTMLVideoElement>()
// The beat the video is paused on, and whether it is zoomed in on it.
const shown = ref(target.value)
const focused = ref(true)

let run = 0
let raf = 0
let timer: ReturnType<typeof setTimeout> | undefined

function stop() {
  run++
  cancelAnimationFrame(raf)
  clearTimeout(timer)
  video.value?.pause()
}

function jump(i: number) {
  stop()
  shown.value = i
  focused.value = true
  if (video.value) video.value.currentTime = BEATS[i].video.t
}

// Zoom out, play on to the next beat, pause, zoom in.
function advance(i: number) {
  const v = video.value
  if (!v) return jump(i)
  stop()
  const id = run
  const end = BEATS[i].video.t
  focused.value = false
  timer = setTimeout(() => {
    if (id !== run) return
    const tick = () => {
      if (id !== run) return
      if (v.currentTime >= end || v.ended) {
        v.pause()
        v.currentTime = end
        shown.value = i
        focused.value = true
        return
      }
      raf = requestAnimationFrame(tick)
    }
    v.play().then(() => { raf = requestAnimationFrame(tick) }).catch(() => jump(i))
  }, 420)
}

watch(target, (i, prev) => {
  if (active.value && i === prev + 1 && !prefersReducedMotion()) advance(i)
  else jump(i)
})
watch(active, (on) => { if (on) jump(target.value); else stop() })
onMounted(() => {
  const v = video.value
  if (!v) return
  if (v.readyState >= 1) jump(target.value)
  else v.addEventListener('loadedmetadata', () => jump(target.value), { once: true })
})
onBeforeUnmount(stop)

const MAX_ZOOM = 1.8
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const zoom = computed(() => {
  const [x, y, w, h] = BEATS[shown.value].video.rect
  if (!focused.value) return { s: 1, tx: 0, ty: 0 }
  const s = clamp(Math.min(0.94 / w, 0.9 / h), 1, MAX_ZOOM)
  return {
    s,
    tx: clamp(0.5 - s * (x + w / 2), 1 - s, 0),
    ty: clamp(0.5 - s * (y + h / 2), 1 - s, 0),
  }
})
const stageStyle = computed(() => ({
  transform: `translate(${zoom.value.tx * 100}%, ${zoom.value.ty * 100}%) scale(${zoom.value.s})`,
}))
const spotStyle = computed(() => {
  const [x, y, w, h] = BEATS[shown.value].video.rect
  const pad = 0.012
  return {
    left: `${(x - pad) * 100}%`,
    top: `${(y - pad) * 100}%`,
    width: `${(w + pad * 2) * 100}%`,
    height: `${(h + pad * 2) * 100}%`,
  }
})
</script>

<template>
  <div class="tv">
    <div class="frame">
      <div class="stage" :style="stageStyle">
        <video
          v-if="live"
          ref="video"
          src="/thread-540/walkthrough.mp4"
          :poster="`/thread-540/beat-${target}.jpg`"
          muted
          playsinline
          preload="auto"
          disablepictureinpicture
        />
        <img v-else :src="`/thread-540/beat-${target}.jpg`" alt="The PR #540 thread in T3 Code">
        <div class="spot" :class="{ on: focused }" :style="spotStyle" />
      </div>
    </div>

    <ol class="rail">
      <li
        v-for="(b, i) in BEATS"
        :key="b.id"
        :class="[b.who, { on: i === target, past: i < target, later: i > target }]"
      >
        <span class="clock ns-mono">{{ b.clock }}</span>
        <span class="label">{{ b.label }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.tv {
  height: 510px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 30px;
}

.frame {
  position: relative;
  height: 510px;
  aspect-ratio: 800 / 520;
  overflow: hidden;
  border: 1px solid var(--ns-line);
  background: #fcfcfc;
}

.stage {
  position: absolute;
  inset: 0;
  transform-origin: 0 0;
  transition: transform 700ms var(--ns-ease);
}

.stage video,
.stage img {
  display: block;
  width: 100%;
  height: 100%;
}

.spot {
  position: absolute;
  border-radius: 10px;
  outline: 2px solid var(--ns-teal);
  outline-offset: 0;
  box-shadow: 0 0 0 2000px rgb(252 252 252 / 0.62);
  opacity: 0;
  transition: opacity 400ms var(--ns-ease);
  pointer-events: none;
}

.spot.on {
  opacity: 1;
  transition-delay: 250ms;
}

.rail {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.rail li {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 0;
  padding: 4px 0 4px 14px;
  border-left: 4px solid var(--ns-line);
  transition: opacity 400ms var(--ns-ease), border-color 400ms var(--ns-ease);
}

.rail li.later {
  opacity: 0;
}

.clock {
  font-size: 15px;
  line-height: 1.2;
  color: var(--z-grey-600);
}

.label {
  font-size: 19px;
  line-height: 1.25;
  white-space: nowrap;
  color: var(--z-grey-600);
}

.rail li.on {
  border-left-color: var(--ns-teal);
}

.rail li.on .label {
  color: var(--z-ink);
  font-weight: 700;
}

.rail li.on .clock {
  color: var(--z-ink);
}

.rail li.you.on {
  border-left-color: var(--ns-red);
}
</style>
