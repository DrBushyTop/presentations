<!-- A number that counts up to `to` when `on` turns true. -->
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { animate } from 'motion-v'
import { useStage } from '../lib/stage'

const props = withDefaults(defineProps<{
  to: number
  from?: number
  on?: boolean
  decimals?: number
  duration?: number
  delay?: number
  sign?: boolean
  prefix?: string
  suffix?: string
}>(), { from: 0, on: true, decimals: 0, duration: 1.2, delay: 0, sign: false, prefix: '', suffix: '' })

const { still } = useStage()
const value = ref(still.value ? props.to : props.from)
let run: { stop: () => void } | undefined

watch(() => [props.on, props.to, still.value] as const, ([on, to, isStill]) => {
  run?.stop()
  if (isStill) { value.value = to; return }
  if (!on) { value.value = props.from; return }
  run = animate(value.value, to, {
    duration: props.duration,
    delay: props.delay,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: (v: number) => { value.value = v },
  })
}, { immediate: true })
onBeforeUnmount(() => run?.stop())

const text = () => {
  const n = value.value.toFixed(props.decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${props.prefix}${props.sign && value.value > 0 ? '+' : ''}${n}${props.suffix}`
}
</script>

<template>
  <bdi class="hc-num">{{ text() }}</bdi>
</template>
