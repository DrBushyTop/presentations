<!--
  Poteto's trust ladder, worked backwards from "the agent merges its own
  code". Each rung moves one job from the person to the environment.
  The rung wording is mine, from the interview.
  goal: 0 where most of us are · 1 where this goes
  full: 1 the next two rungs · 2 the top two · 3 what never goes away, and where it stops
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ step?: number, mode?: 'goal' | 'full' }>(), { step: 0, mode: 'full' })

function on(i: number, g: number) {
  if (props.mode === 'goal') return i === 0 || (i === rungs.length - 1 && props.step >= 1)
  return props.step >= g
}

const rungs = [
  { t: 'You relay everything', you: 'Copy and paste', g: 0 },
  { t: 'It runs and checks its work', you: 'Read every line', g: 1 },
  { t: 'It reviews each slice', you: 'Read the risky slices', g: 1 },
  { t: 'It finds its own context', you: 'Answer product choices', g: 2 },
  { t: 'It merges its own PRs', you: 'Fix the environment', g: 2 },
]
</script>

<template>
  <div class="tl" :class="mode">
    <div class="steps">
      <section
        v-for="(r, i) in rungs" :key="r.t" class="rung"
        :class="{ on: on(i, r.g), top: i === rungs.length - 1 }"
        :style="{ '--h': 48 + i * 13 + '%', '--i': i }"
      >
        <span class="n">{{ i + 1 }}</span>
        <b>{{ r.t }}</b>
        <p><Icon name="user" />{{ r.you }}</p>
      </section>
    </div>
    <div v-if="mode === 'full'" class="always" :class="{ on: step >= 3 }">
      <Icon name="user" />
      <p>On every rung, you still click through it yourself.</p>
    </div>
    <div v-if="mode === 'full'" class="foot" :class="{ on: step >= 3 }">
      <p>Only where a bad change is cheap to undo, and the work can be checked.</p>
      <span>Poteto: "verifiability of the domain is an important aspect"</span>
    </div>
  </div>
</template>

<style scoped>
.tl {
  height: 510px;
  display: grid;
  grid-template-rows: 1fr auto auto;
  gap: 14px;
}

.tl.goal {
  grid-template-rows: 1fr;
}

.steps {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  align-items: end;
  min-height: 0;
  border-bottom: 5px solid var(--z-ink);
}

.rung {
  height: var(--h);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: var(--ns-soft);
  border-top: 5px solid var(--ns-teal);
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
  transition-delay: calc(var(--i) % 3 * 100ms);
}

.rung:first-child {
  border-color: var(--ns-red);
  background: #fff1ee;
}

.rung.top {
  background: var(--z-ink);
  color: #fff;
  border-color: var(--ns-frozen);
}

.rung:not(.on) {
  opacity: 0.1;
  transform: translateY(18px);
}

/* The opening only shows where we start and where this goes; the middle
   rungs stay in place, faint, until the close fills them in. */
.goal .rung:not(.on) {
  opacity: 0.16;
  transform: none;
}

.n {
  font-size: 40px;
  font-weight: 200;
  line-height: 1;
  color: var(--ns-teal);
}

.rung:first-child .n { color: var(--ns-red); }
.rung.top .n { color: var(--ns-frozen); }

.rung b {
  font-size: 22px;
  line-height: 1.2;
  text-wrap: balance;
}

.rung p {
  margin: auto 0 0;
  max-width: none;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 18px;
  line-height: 1.3;
  color: var(--z-ink-800);
}

.rung.top p {
  color: #e6e6e6;
}

.rung p :deep(.ns-icon) {
  margin-top: 2px;
  font-size: 18px;
}

.always {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 22px;
  background: var(--z-ink);
  color: #fff;
  transition: opacity 600ms var(--ns-ease);
}

.always :deep(.ns-icon) {
  font-size: 24px;
  color: var(--ns-frozen);
}

.always p {
  margin: 0;
  max-width: none;
  font-size: 23px;
  font-weight: 800;
}

.always:not(.on) {
  opacity: 0;
}

.foot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 22px;
  background: var(--ns-red);
  color: #fff;
  transition: opacity 600ms var(--ns-ease);
}

.foot:not(.on) {
  opacity: 0;
}

.foot p {
  margin: 0;
  max-width: none;
  font-size: 25px;
  font-weight: 800;
}

.foot span {
  font-size: 17px;
  color: #ffe2dc;
}
</style>
