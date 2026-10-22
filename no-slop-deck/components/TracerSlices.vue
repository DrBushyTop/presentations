<!--
  My repo's starting states (#526) as tracer bullets. Every slice runs
  through the task form, the API and the SDK in the app, and ends with
  something a person can check on a local instance. Slice one is #527;
  the others are #528, #529 and #532. A fifth, removing the old hooks, is
  left out.
  0 the first slice · 1 the rest · 2 Matt Pocock's rule
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const slices = [
  { title: 'Register, pick, apply', check: 'A task opens on the state picked in the form.', stub: true },
  { title: 'When the app can\'t be prepared', check: 'A broken state offers Try again and Skip.' },
  { title: 'Guidance and checks', check: 'A bad state fails a check that names the fix.' },
  { title: 'Several participants at once', check: 'Two people in one prototype keep their own data.' },
]
const layers = ['Form', 'API', 'SDK']
</script>

<template>
  <div class="ts">
    <div class="row">
      <section v-for="(s, i) in slices" :key="s.title" class="slice" :class="{ on: i === 0 || step >= 1, first: i === 0 }" :style="{ '--i': i }">
        <header>
          <span class="n">{{ i + 1 }}</span>
          <b>{{ s.title }}</b>
        </header>
        <div class="bullet">
          <div v-for="l in layers" :key="l" class="lv" :class="{ stub: s.stub && l === 'SDK' }">
            <i />
            <span>{{ l }}<template v-if="s.stub && l === 'SDK'">: one demo app</template></span>
          </div>
        </div>
        <div class="check">
          <Icon name="eye" />
          <p>{{ s.check }}</p>
        </div>
        <div v-if="s.stub" class="badge">First. The rest wait for it.</div>
      </section>
    </div>
    <div class="rule" :class="{ on: step >= 2 }">
      <p>"A completed slice is demoable or verifiable on its own."</p>
      <span>Matt Pocock, to-tickets skill</span>
    </div>
  </div>
</template>

<style scoped>
.ts {
  height: 510px;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 22px;
}

.row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  min-height: 0;
}

.slice {
  display: flex;
  flex-direction: column;
  background: var(--ns-soft);
  padding: 18px 18px 16px;
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
  transition-delay: calc(var(--i) * 110ms);
}

.slice.first {
  background: #fff;
  box-shadow: 0 0 0 3px var(--ns-teal), 0 22px 44px -26px rgba(3, 127, 145, 0.6);
}

.slice:not(.on) {
  opacity: 0.12;
  transform: translateY(14px);
}

header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 92px;
}

.n {
  font-size: 44px;
  font-weight: 200;
  line-height: 1;
  color: var(--ns-teal);
}

header b {
  font-size: 22px;
  line-height: 1.2;
}

.bullet {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 14px 0 16px;
  padding-left: 4px;
}

.bullet::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 10px;
  bottom: 10px;
  width: 3px;
  background: var(--ns-teal);
}

.lv {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: var(--ns-label);
  font-weight: 700;
}

.lv i {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--ns-teal);
  z-index: 1;
}

.lv.stub i {
  background: #fff;
  border: 3px dashed var(--ns-teal);
}

.lv.stub span {
  color: var(--ns-teal);
}

.check {
  margin-top: auto;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding-top: 12px;
  border-top: 1px solid var(--ns-line);
}

.check :deep(.ns-icon) {
  font-size: 22px;
  color: var(--ns-teal);
  margin-top: 2px;
}

.check p {
  margin: 0;
  font-size: 20px;
  line-height: 1.32;
  max-width: none;
}

.badge {
  margin-top: 12px;
  padding: 6px 10px;
  background: var(--ns-teal);
  color: #fff;
  font-size: var(--ns-label);
  font-weight: 700;
}

.rule {
  display: flex;
  align-items: baseline;
  gap: 22px;
  padding: 16px 22px;
  background: var(--z-ink);
  color: #fff;
  transition: opacity 600ms var(--ns-ease);
}

.rule:not(.on) {
  opacity: 0;
}

.rule p {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.01em;
  max-width: none;
}

.rule span {
  font-size: 17px;
  color: #cfcfcf;
  white-space: nowrap;
}
</style>
