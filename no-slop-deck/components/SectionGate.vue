<!-- Part divider: the corridor of gates with the current one lit. -->
<script setup lang="ts">
import { useIsActive } from '../lib/active'

defineProps<{ current: number, title: string, question: string }>()
const active = useIsActive()
</script>

<template>
  <div class="ns-dark section" :class="{ go: active }">
    <div class="corridor"><GateMap variant="dark" :current="current" /></div>
    <div class="copy">
      <h1>{{ title }}</h1>
      <p>{{ question }}</p>
    </div>
  </div>
</template>

<style scoped>
.section {
  display: grid;
  grid-template-rows: 1fr auto;
}

.corridor {
  padding: 70px 72px 0;
  align-self: start;
}

.copy {
  padding: 0 72px 72px;
}

h1 {
  font-family: var(--z-font-display);
  font-size: 76px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.035em;
  color: #fff;
  max-width: 17ch;
  margin: 0 0 22px;
  text-wrap: balance;
}

p {
  font-size: 30px;
  line-height: 1.3;
  color: var(--ns-frozen);
  font-weight: 600;
  margin: 0;
  max-width: 40ch;
}

h1,
p {
  transition: opacity 700ms var(--ns-ease), transform 900ms var(--ns-ease), filter 700ms var(--ns-ease);
}

.section:not(.go) h1,
.section:not(.go) p {
  opacity: 0;
  transform: translateY(24px);
  filter: blur(6px);
}

.go h1 {
  transition-delay: 450ms;
}

.go p {
  transition-delay: 700ms;
}

@media (prefers-reduced-motion: reduce) {
  .section:not(.go) h1,
  .section:not(.go) p {
    transform: none;
    filter: none;
  }
}
</style>
