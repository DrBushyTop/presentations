<!--
  Make the right way the only way. The god files are Poteto's description of an
  early version of their app. Their Dune framework puts every feature
  in its own directory, found by a registry, with lint rules that leave one way
  to add a feature. The tree and lint message are illustrative.
  0 god files · 1 one directory per feature, and the rule · 2 the takeaway
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
// Bar heights are illustrative; Poteto said "at least 10,000 lines".
const gods = [10.2, 14.8, 11.6, 10.4, 12.9, 10.1, 16.3, 11.0]
</script>

<template>
  <div class="ow">
    <section class="before">
      <h3>Eight god files</h3>
      <div class="bars">
        <div v-for="(k, i) in gods" :key="i" class="bar" :style="{ height: (k / 16.3) * 100 + '%' }">
          <span v-if="i === 0" class="ns-mono">app.ts</span>
        </div>
      </div>
      <p class="cap ns-mono">10,000+ lines each. Every agent appends.</p>
    </section>

    <section class="after" :class="{ on: step >= 1 }">
      <h3>One directory per feature</h3>
      <div class="tree ns-mono">
        <p>features/</p>
        <p class="d">search/</p>
        <p class="f">route.ts · query.ts · view.tsx · search.test.ts</p>
        <p class="d">sync-status/</p>
        <p class="f">route.ts · query.ts · view.tsx · sync-status.test.ts</p>
        <p class="r">registry discovers every feature</p>
      </div>
      <div class="lint ns-mono">
        <p class="bad">✗ app.ts:10215 new route outside features/</p>
        <p class="dim">Create features/&lt;name&gt;/route.ts. The registry will find it.</p>
      </div>
    </section>

    <div class="foot" :class="{ on: step >= 2 }">
      <p>Build an environment where bad code is hard to write.</p>
    </div>
  </div>
</template>

<style scoped>
.ow {
  height: 510px;
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  grid-template-rows: 1fr auto;
  gap: 20px 32px;
}

h3 {
  margin: 0 0 12px;
  padding-bottom: 10px;
  font-size: 24px;
  font-weight: 800;
  border-bottom: 4px solid var(--ns-red);
}

.after h3 {
  border-color: var(--ns-teal);
}

section {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding-top: 8px;
}

.bar {
  position: relative;
  flex: 1;
  background: repeating-linear-gradient(to bottom, #f3b5aa 0 3px, #fff1ee 3px 6px);
  border-top: 4px solid var(--ns-red);
}

.bar span {
  position: absolute;
  top: -30px;
  left: 0;
  font-size: 16px;
  color: var(--ns-red);
  font-weight: 700;
}

.cap {
  margin: 12px 0 0;
  max-width: none;
  font-size: 17px;
  color: var(--z-grey-600);
}

.after {
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.after:not(.on) {
  opacity: 0.12;
  transform: translateX(20px);
}

.tree {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 14px 20px;
  background: var(--ns-soft);
}

.tree p {
  margin: 0;
  max-width: none;
  white-space: pre;
  font-size: 18px;
  line-height: 1.7;
}

.tree .d { font-weight: 700; padding-left: 1.5ch; }
.tree .f { color: var(--z-ink-800); padding-left: 3.5ch; }
.tree .r {
  margin-top: 8px;
  color: var(--ns-teal);
  font-weight: 700;
}

.lint {
  margin-top: 14px;
  padding: 12px 20px;
  background: var(--z-ink);
}

.lint p {
  margin: 0;
  max-width: none;
  font-size: 17px;
  line-height: 1.6;
}

.lint .bad { color: #ff9d8f; }
.lint .dim { color: #bdbdbd; }

.foot {
  grid-column: 1 / -1;
  display: flex;
  align-items: baseline;
  gap: 22px;
  padding: 16px 22px;
  background: var(--z-ink);
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
  color: #cfcfcf;
  white-space: nowrap;
}
</style>
