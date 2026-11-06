<!-- My prompt, verbatim, typed out. Each click lights the part that mattered. -->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { useStage } from '../lib/stage'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { active, still, ease } = useStage()

const parts = [
  { t: 'Your job is to improve our UI of the application. ' },
  { t: 'Put the changes through the council.', at: 1 },
  { t: ' Generate your own screenshots of the app with the t3 browser. Have each council member give scores on the UI, 1 to 10. Decimals allowed. ' },
  { t: "When you get all them to agree it's 9.5 or better, you are done.", at: 2, red: true },
  { t: ' ' },
  { t: "Don't let them know what number you need to reach.", at: 3 },
  { t: '\n\nHelp clarify and simplify the UI. Make it designer-proof. I want professionals to be impressed with how clean, clear and usable things are.\n\nHere are a few examples from competitors. Add them to the panel somehow. ' },
  { t: 'I want our app to score higher than these apps do consistently in all rankings.', at: 4 },
]
const total = parts.reduce((n, p) => n + p.t.length, 0)
const typed = ref(still.value ? total : 0)
let id: ReturnType<typeof setInterval> | undefined

watch(active, (on) => {
  clearInterval(id)
  if (!on) return
  id = setInterval(() => {
    typed.value = Math.min(total, typed.value + 3)
    if (typed.value >= total) clearInterval(id)
  }, 16)
}, { immediate: true })
watch(still, (s) => { if (s) typed.value = total })
onBeforeUnmount(() => clearInterval(id))

const spans = computed(() => {
  let left = typed.value
  return parts.map((p) => {
    const text = p.t.slice(0, Math.max(0, left))
    left -= p.t.length
    return { ...p, text }
  })
})
</script>

<template>
  <div class="hc-stage term">
    <div class="bar"><i /><i /><i /><span>04 Nov, 09:01</span></div>
    <div class="body"><template v-for="(s, i) in spans" :key="i"><motion.span
      :class="{ lit: s.at && step >= s.at, red: s.red && s.at && step >= s.at }"
      :animate="{ opacity: step > 0 && !(s.at && step >= s.at) ? 0.42 : 1 }"
      :transition="ease(0.4)"
    >{{ s.text }}</motion.span></template><i v-if="typed < total" class="caret" /></div>
  </div>
</template>

<style scoped>
.term { background: var(--hc-night); border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; }
.bar { display: flex; gap: 8px; align-items: center; padding: 14px 18px; background: var(--hc-night-2); color: #9aa2a8; font: 500 15px var(--hc-mono); }
.bar i { width: 12px; height: 12px; border-radius: 50%; background: var(--hc-night-3); }
.bar span { margin-left: auto; }
.body { flex: 1; padding: 22px 34px; font: 500 23px/1.38 var(--z-font-text); color: #e7e9ea; white-space: pre-wrap; }
.lit { color: var(--z-frozen); font-weight: 700; }
.lit.red { color: var(--z-red-400); }
.caret { display: inline-block; width: 11px; height: 24px; background: var(--z-frozen); margin-left: 2px; vertical-align: -3px; }
</style>
