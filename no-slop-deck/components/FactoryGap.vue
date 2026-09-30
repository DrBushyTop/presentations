<!--
  Polylane's opening point, redrawn: every check in the software factory
  reads the diff; none of them knows the production system it lands on.
  0 the pipeline · 1 what each stage looks at · 2 the question to answer
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const stages = ['Agent writes the code', 'Types and tests', 'Linter and formatter', 'Code review']
</script>

<template>
  <div class="gap">
    <div class="line">
      <template v-for="(s, i) in stages" :key="s">
        <div class="st" :style="{ '--i': i }">
          <b>{{ s }}</b>
          <span class="reads" :class="{ on: step >= 1 }">reads the diff</span>
        </div>
        <div class="arr" />
      </template>
      <div class="q">
        <b>Is this okay for prod?</b>
        <span class="reads none" :class="{ on: step >= 1 }">nothing checks this</span>
      </div>
      <div class="arr" />
      <div class="st deploy"><b>Deploy</b></div>
    </div>

    <div class="brace" :class="{ on: step >= 1 }">
      <div class="b-diff"><span>Everything we have looks at the code</span></div>
      <div class="b-prod"><span>It lands on production traffic</span></div>
    </div>

    <blockquote class="quote" :class="{ on: step >= 2 }">
      <p>"Would this change, once merged and deployed, have a negative impact on production?"</p>
      <span>Polylane</span>
    </blockquote>
  </div>
</template>

<style scoped>
.gap {
  height: 510px;
  display: grid;
  grid-template-rows: 190px auto 1fr;
  gap: 22px;
}

.line {
  display: grid;
  grid-template-columns: 1fr 34px 1fr 34px 1fr 34px 1fr 34px 1.25fr 34px 0.8fr;
  align-items: stretch;
}

.st,
.q {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 14px;
  background: var(--ns-soft);
  border-top: 5px solid var(--z-ink);
}

.st b,
.q b {
  font-size: 22px;
  line-height: 1.2;
}

.q {
  background: #fff1ee;
  border: 3px dashed var(--ns-red);
  border-top-width: 5px;
  border-top-style: solid;
}

.q b {
  color: var(--ns-red);
  font-size: 24px;
}

.deploy {
  background: var(--z-ink);
  color: #fff;
  justify-content: center;
}

.reads {
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--ns-teal);
  transition: opacity 500ms var(--ns-ease), transform 600ms var(--ns-ease);
}

.reads.none {
  color: var(--ns-red);
}

.reads:not(.on) {
  opacity: 0;
  transform: translateY(8px);
}

.arr {
  position: relative;
}

.arr::before {
  content: '';
  position: absolute;
  left: 6px;
  right: 8px;
  top: 50%;
  height: 3px;
  background: var(--z-ink);
}

.arr::after {
  content: '';
  position: absolute;
  right: 7px;
  top: calc(50% - 6px);
  width: 11px;
  height: 11px;
  border-top: 3px solid var(--z-ink);
  border-right: 3px solid var(--z-ink);
  transform: rotate(45deg);
}

.brace {
  display: grid;
  grid-template-columns: 1fr 34px 1fr 34px 1fr 34px 1fr 34px 1.25fr 34px 0.8fr;
  transition: opacity 600ms var(--ns-ease);
}

.brace:not(.on) {
  opacity: 0;
}

.brace > div {
  border: 3px solid var(--z-ink);
  border-top: 0;
  height: 22px;
  position: relative;
}

.b-diff {
  grid-column: 1 / 8;
}

.b-prod {
  grid-column: 9 / 12;
  border-color: var(--ns-red) !important;
}

.brace span {
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
}

.b-prod span {
  color: var(--ns-red);
}

.quote {
  margin: 44px 0 0;
  padding: 22px 26px;
  background: var(--z-ink);
  color: #fff;
  border: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  transition: opacity 600ms var(--ns-ease);
}

.quote:not(.on) {
  opacity: 0;
}

.quote p {
  margin: 0;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.02em;
  max-width: none;
  color: #fff;
}

.quote span {
  font-size: var(--ns-label);
  color: #bdbdbd;
}
</style>
