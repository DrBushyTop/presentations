<!--
  How agent work goes wrong, under the gate that catches each failure most
  cheaply. Same columns and grouping as the gate map.
  1 before implementation · 2 the loop for every slice · 3 after merge
-->
<script setup lang="ts">
import { gates } from '../lib/gates'
import { failures } from '../lib/failures'

withDefaults(defineProps<{ step?: number }>(), { step: 99 })
const group = (i: number) => (i < 3 ? 1 : i < 5 ? 2 : 3)
</script>

<template>
  <div class="fm">
    <section
      v-for="(g, i) in gates" :key="g.name" class="col"
      :class="{ on: step >= group(i) }" :style="{ '--i': i }"
    >
      <header>{{ g.name }}</header>
      <div v-for="f in failures[i]" :key="f.name" class="f">
        <Icon name="x" />
        <b>{{ f.name }}</b>
      </div>
    </section>
  </div>
</template>

<style scoped>
.fm {
  height: 510px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
  transition-delay: calc(var(--i) % 3 * 90ms);
}

.col:not(.on) {
  opacity: 0.14;
  transform: translateY(16px);
}

header {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
  padding-bottom: 10px;
  border-bottom: 5px solid var(--z-ink);
}

.f {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 12px;
  background: #fff1ee;
  border-top: 4px solid var(--ns-red);
}

.f :deep(.ns-icon) {
  font-size: 24px;
  color: var(--ns-red);
}

.f b {
  font-size: 20px;
  line-height: 1.25;
  text-wrap: pretty;
}
</style>
