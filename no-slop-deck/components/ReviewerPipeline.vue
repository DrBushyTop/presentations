<!--
  A PR reviewer is mostly ordinary software with one model call in the middle.
  1 what the code owns · 2 the same shape runs /fix
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const stages = [
  { name: 'Event', note: 'PR opened or updated' },
  { name: 'Decide', note: 'Run at all? Which commits?' },
  { name: 'Context', note: 'Diff, files, plan' },
  { name: 'Model', note: 'One judgement', ai: true },
  { name: 'Validate', note: 'Parse, drop weak findings' },
  { name: 'Post', note: 'Comments on the PR' },
  { name: 'Record', note: 'Run state, for the next run' },
]
</script>

<template>
  <div class="pipe">
    <div class="row">
      <div v-for="(s, i) in stages" :key="s.name" class="st" :class="{ ai: s.ai }" :style="{ '--i': i }">
        <b>{{ s.name }}</b>
        <span>{{ s.note }}</span>
      </div>
    </div>

    <div class="owns" :class="{ on: step >= 1 }">
      <div class="brace left" />
      <div class="brace right" />
      <div class="cols">
        <b>Ordinary code owns everything else</b>
        <p>Triggers, commit range, retries, deduplication, timeouts, posting, and when to stop.</p>
      </div>
    </div>

    <div class="fix" :class="{ on: step >= 2 }">
      <span class="ns-mono">/fix</span>
      <p>Same shape: one bounded fix, pushed for review.</p>
    </div>
  </div>
</template>

<style scoped>
.pipe {
  height: 500px;
  display: grid;
  grid-template-rows: 210px 1fr auto;
  gap: 26px;
}

.row {
  display: flex;
  gap: 8px;
}

.st {
  flex: 1;
  border-top: 5px solid var(--z-ink);
  background: var(--ns-soft);
  padding: 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.st b {
  font-size: 22px;
}

.st span {
  font-size: 19px;
  line-height: 1.3;
  color: var(--z-ink-800);
}

.st.ai {
  flex: 0 0 118px;
  background: var(--ns-red);
  border-color: var(--ns-red);
  color: #fff;
}

.st.ai span {
  color: #fff;
}

.owns {
  position: relative;
  padding-top: 30px;
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
}

.owns:not(.on) {
  opacity: 0;
  transform: translateY(14px);
}

.brace {
  position: absolute;
  top: 0;
  height: 18px;
  border: 3px solid var(--z-ink);
  border-top: 0;
}

.brace.left { left: 0; width: calc(3 * (100% - 118px - 48px) / 6 + 16px); }
.brace.right { right: 0; width: calc(3 * (100% - 118px - 48px) / 6 + 16px); }

.cols {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.cols b {
  font-size: 25px;
  letter-spacing: -0.01em;
}

.cols p {
  font-size: 23px;
  line-height: 1.38;
  margin: 8px auto 0;
  max-width: none;
}

.fix {
  display: flex;
  gap: 22px;
  align-items: center;
  background: var(--z-ink);
  color: #fff;
  padding: 18px 24px;
  transition: opacity 600ms var(--ns-ease);
}

.fix:not(.on) {
  opacity: 0;
}

.fix span {
  font-size: 26px;
  color: var(--ns-frozen);
  font-weight: 700;
}

.fix p {
  margin: 0;
  font-size: 20px;
  line-height: 1.35;
  max-width: none;
}
</style>
