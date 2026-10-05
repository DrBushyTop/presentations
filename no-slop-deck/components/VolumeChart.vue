<!--
  More change, more chances to break. Honeycomb and Spotify, self-reported.
  0 before · 1 after · 2 the reading
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const groups = [
  { who: 'Honeycomb', what: 'Merges on a peak weekday', bars: [{ l: 'Early 2025', v: 30 }, { l: 'April 2026', v: 74 }] },
  { who: 'Honeycomb', what: 'Incidents per quarter', bars: [{ l: '2024', v: 18.5 }, { l: 'Q1 2026', v: 32 }, { l: 'Q2 2026', v: 53 }] },
  { who: 'Spotify', what: 'Merged changes in August', bars: [{ l: '2025', v: 8100 }, { l: '2026', v: 17000 }] },
]
const fmt = (v: number) => v.toLocaleString('en-US')
</script>

<template>
  <div class="vol">
    <div class="groups">
      <section v-for="(g, gi) in groups" :key="g.what" class="g" :class="{ bad: gi === 1 }">
        <header><b>{{ g.what }}</b><span>{{ g.who }}</span></header>
        <div class="bars">
          <div
            v-for="(b, i) in g.bars" :key="b.l" class="bar"
            :class="{ first: i === 0 }"
            :style="{ '--h': (i === 0 || step >= 1 ? b.v : g.bars[0].v) / Math.max(...g.bars.map(x => x.v)), '--i': i }"
          >
            <span class="v ns-mono" :class="{ on: i === 0 || step >= 1 }">{{ fmt(b.v) }}</span>
            <div class="fill" :style="{ viewTransitionName: `ns-vol-${gi}-${i}` }" />
            <span class="l">{{ b.l }}</span>
          </div>
        </div>
      </section>
    </div>
    <p class="take" :class="{ on: step >= 2 }">Incidents grew with the volume of change.</p>
  </div>
</template>

<style scoped>
.vol {
  height: 510px;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 22px;
}

.groups {
  display: grid;
  grid-template-columns: 1fr 1.3fr 1fr;
  gap: 44px;
  min-height: 0;
}

.g {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 0;
}

header {
  display: flex;
  flex-direction: column;
  padding-bottom: 12px;
}

header b {
  font-size: 22px;
}

header span {
  font-size: var(--ns-label);
  color: var(--z-grey-600);
  font-weight: 600;
}

.bars {
  display: flex;
  gap: 14px;
  align-items: stretch;
  border-bottom: 2px solid var(--z-ink);
  min-height: 0;
}

.bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
}

.fill {
  height: calc(var(--h) * 78%);
  background: var(--z-ink);
  transition: height 1200ms var(--ns-ease);
  transition-delay: calc(var(--i) * 180ms);
}

.bar.first .fill {
  background: #bdbdba;
}

.bad .bar:not(.first) .fill {
  background: var(--ns-red);
}

.v {
  font-size: 22px;
  font-weight: 700;
  padding-bottom: 6px;
  transition: opacity 500ms var(--ns-ease);
  transition-delay: calc(var(--i) * 180ms + 600ms);
}

.v:not(.on) {
  opacity: 0;
}

.l {
  position: absolute;
  bottom: -30px;
  font-size: var(--ns-label);
  color: var(--z-grey-600);
  font-weight: 600;
}

.take {
  margin: 20px 0 0;
  max-width: none;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  transition: opacity 600ms var(--ns-ease);
}

.take:not(.on) {
  opacity: 0;
}
</style>
