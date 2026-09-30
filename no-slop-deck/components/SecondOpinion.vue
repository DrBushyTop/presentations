<!--
  The PR buys a second opinion, and a babysitter can work the feedback.
  1 reviewers from other model families · 2 the babysitter · 3 how it goes wrong
  The finding positions are illustrative, not measured.
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

type F = { y: number, kind: 'real' | 'nit' | 'leak' }
const lanes: { name: string, f: F[] }[] = [
  { name: 'The model that wrote it', f: [{ y: 0.1, kind: 'nit' }, { y: 0.34, kind: 'real' }, { y: 0.82, kind: 'nit' }] },
  { name: 'Another model family', f: [{ y: 0.1, kind: 'nit' }, { y: 0.5, kind: 'real' }, { y: 0.66, kind: 'leak' }, { y: 0.82, kind: 'nit' }] },
  { name: 'A provider\'s review bot', f: [{ y: 0.2, kind: 'nit' }, { y: 0.34, kind: 'real' }, { y: 0.5, kind: 'real' }, { y: 0.9, kind: 'nit' }, { y: 0.95, kind: 'nit' }] },
]

const loop = ['Watch the PR', 'Read comments and CI', 'Make one bounded fix', 'Push and wait']
const risks = ['Reviewers undo each other', 'CI result from an older commit', 'Commits after approval', 'Instructions hidden in a comment']
</script>

<template>
  <div class="second">
    <section class="reviewers" :class="{ on: step >= 1 }">
      <div class="diff" aria-hidden="true"><span v-for="n in 26" :key="n" :style="{ width: 30 + ((n * 37) % 60) + '%' }" /></div>
      <div v-for="(l, li) in lanes" :key="l.name" class="lane" :style="{ '--l': li }">
        <div class="track">
          <span v-for="(f, fi) in l.f" :key="fi" class="dot" :class="f.kind" :style="{ top: f.y * 100 + '%', '--d': fi }" />
          <span v-if="l.f.some(f => f.kind === 'leak')" class="leak-label" :style="{ top: '66%' }">the tenant leak</span>
        </div>
        <div class="name">{{ l.name }}</div>
      </div>
      <div class="key"><i class="real" /> real <i class="nit" /> noise <em>Illustrative. Measure your own.</em></div>
    </section>

    <section class="sitter">
      <div class="head" :class="{ on: step >= 2 }">
        <b>The babysitter</b>
      </div>
      <ol class="cycle" :class="{ on: step >= 2 }">
        <li v-for="(c, i) in loop" :key="c" :style="{ '--i': i }"><span class="ns-mono">{{ i + 1 }}</span>{{ c }}</li>
      </ol>
      <div class="risks" :class="{ on: step >= 3 }">
        <b>Where it goes wrong</b>
        <ul>
          <li v-for="(r, i) in risks" :key="r" :style="{ '--i': i }"><Icon name="alert" /> {{ r }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.second {
  height: 500px;
  display: grid;
  grid-template-columns: 560px 1fr;
  gap: 48px;
}

.reviewers {
  display: grid;
  grid-template-columns: 70px repeat(3, 1fr);
  grid-template-rows: 1fr auto;
  column-gap: 18px;
}

.diff {
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px 0 70px;
  border-right: 2px solid var(--z-ink);
  padding-right: 10px;
}

.diff span {
  height: 3px;
  background: #bdbdba;
}

.lane {
  display: flex;
  flex-direction: column;
}

.track {
  position: relative;
  flex: 1;
  border-left: 1px dashed var(--ns-line);
  margin-left: 50%;
}

.dot {
  position: absolute;
  left: -11px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  transition: transform 600ms var(--ns-ease), opacity 400ms var(--ns-ease);
  transition-delay: calc(var(--l) * 160ms + var(--d) * 60ms);
}

.dot.real { background: var(--z-ink); }
.dot.nit { background: #fff; border: 3px solid #b0b0ad; }
.dot.leak { background: var(--ns-red); width: 28px; height: 28px; left: -14px; }

.reviewers:not(.on) .dot {
  opacity: 0;
  transform: scale(0.3);
}

.leak-label {
  position: absolute;
  left: 22px;
  transform: translateY(-2px);
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--ns-red);
  white-space: nowrap;
  transition: opacity 500ms var(--ns-ease) 700ms;
}

.reviewers:not(.on) .leak-label {
  opacity: 0;
}

.name {
  height: 70px;
  padding-top: 12px;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;
}

.key {
  grid-column: 2 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--ns-label);
  color: var(--z-grey-600);
}

.key i {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
}

.key i.real { background: var(--z-ink); }
.key i.nit { border: 3px solid #b0b0ad; margin-left: 10px; }
.key em { margin-left: auto; font-style: normal; }

.sitter {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.head,
.cycle,
.risks {
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
}

.head:not(.on),
.cycle:not(.on),
.risks:not(.on) {
  opacity: 0;
  transform: translateX(18px);
}

.head b {
  display: block;
  font-size: 30px;
  letter-spacing: -0.02em;
}

.head span {
  font-size: 20px;
  color: var(--z-ink-800);
}

.cycle {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cycle li,
.risks li {
  margin: 0;
  max-width: none;
}

.cycle li::before,
.risks li::before {
  display: none !important;
}

.cycle li {
  background: var(--ns-soft);
  padding: 12px 14px;
  font-size: 21px;
  font-weight: 650;
  display: flex;
  gap: 10px;
  align-items: baseline;
}

.cycle li span {
  color: var(--ns-teal);
  font-size: var(--ns-label);
}

.risks {
  margin-top: auto;
}

.risks b {
  font-size: 20px;
  color: var(--ns-red);
}

.risks ul {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.risks li {
  font-size: 21px;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #f3c2ba;
  background: #fff5f3;
}

.risks li :deep(.ns-icon) {
  color: var(--ns-red);
}
</style>
