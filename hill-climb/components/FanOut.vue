<!-- One 10-PR round, three ways. The join is the part that fan-out hides. -->
<script setup lang="ts">
import { motion } from 'motion-v'
import { fanOut } from '../lib/data'
import { useStage } from '../lib/stage'
import Count from './Count.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const { spring } = useStage()
const rows = [
  { n: 'One agent', a: 0, ...fanOut.single, kids: 1 },
  { n: 'Fan-out, 10 agents', a: 1, ...fanOut.fan, kids: 10 },
  { n: 'Three lanes', a: 2, ...fanOut.lanes, kids: 3 },
]
const scale = 160
</script>

<template>
  <div class="hc-stage f">
    <div v-for="r in rows" :key="r.n" class="row" :style="{ opacity: step >= r.a ? 1 : 0, transition: 'opacity .3s' }">
      <div class="lab"><b>{{ r.n }}</b></div>
      <div class="track">
        <div class="bars" :style="{ width: `${r.build / scale * 100}%` }">
          <motion.i
            v-for="k in r.kids" :key="k"
            :initial="false"
            :animate="{ scaleX: step >= r.a ? 1 : 0 }"
            :transition="spring({ delay: k * 0.04 })"
          />
        </div>
        <motion.i
          class="join"
          :style="{ left: `${r.build / scale * 100}%`, width: `${r.join / scale * 100}%` }"
          :initial="false"
          :animate="{ scaleX: step >= r.a ? 1 : 0 }"
          :transition="spring({ delay: 0.55 })"
        />
      </div>
      <div class="t"><Count :from="0" :to="r.build + r.join" :on="step >= r.a" :delay="0.3" /><span> min</span></div>
    </div>
    <div class="key"><i class="k b" />Building<i class="k j" />Joining the work</div>
  </div>
</template>

<style scoped>
.f { display: grid; grid-template-rows: repeat(3, 1fr) auto; gap: 14px; }
.row { display: grid; grid-template-columns: 220px 1fr 130px; gap: 18px; align-items: stretch; min-height: 0; }
.lab { display: flex; align-items: center; font-size: 24px; color: var(--z-ink); }
.track { position: relative; background: var(--hc-soft); border-radius: 8px; overflow: hidden; }
.bars { position: absolute; left: 0; top: 8px; bottom: 8px; display: grid; grid-auto-rows: 1fr; gap: 2px; }
.bars i { background: var(--z-teal); border-radius: 0 4px 4px 0; transform-origin: left; }
.join { position: absolute; top: 8px; bottom: 8px; background: var(--z-red); border-radius: 0 4px 4px 0; transform-origin: left; }
.t { display: flex; align-items: center; justify-content: flex-end; gap: 6px; font-size: 44px; color: var(--z-ink); white-space: nowrap; }
.t span:last-child { font-size: 20px; color: var(--z-grey-600); }
.key { display: flex; align-items: center; gap: 10px; font-size: 19px; color: var(--z-ink); height: 28px; }
.k { width: 18px; height: 12px; border-radius: 3px; display: inline-block; }
.k.b { background: var(--z-teal); }
.k.j { background: var(--z-red); margin-left: 18px; }
</style>
