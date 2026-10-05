<!--
  Layer by layer against tracer bullets, over the same four days.
  Rows are layers, columns are days. The eye marks a day when a person can
  see and check something working.
  0 layer by layer · 1 tracer bullets · 2 the rule
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const layers = ['UI', 'API', 'Data']
const days = [1, 2, 3, 4]

// Which (layer, day) cells hold work, and whether that work is a stub.
const layered: Record<string, 'real'> = {
  'Data-1': 'real', 'Data-2': 'real',
  'API-2': 'real', 'API-3': 'real',
  'UI-3': 'real', 'UI-4': 'real',
}
const tracer: Record<string, 'real' | 'stub'> = {
  'UI-1': 'real', 'API-1': 'real', 'Data-1': 'stub',
  'UI-2': 'real', 'API-2': 'real', 'Data-2': 'real',
  'UI-3': 'real', 'API-3': 'real', 'Data-3': 'real',
  'UI-4': 'real', 'API-4': 'real', 'Data-4': 'real',
}

const panels = [
  { key: 'layered', title: 'Layer by layer', cells: layered as Record<string, string>, seen: [4], first: 'Day 4', at: 0 },
  { key: 'tracer', title: 'Tracer bullets', cells: tracer as Record<string, string>, seen: [1, 2, 3, 4], first: 'Day 1', at: 1 },
]
</script>

<template>
  <div class="tb">
    <section v-for="p in panels" :key="p.key" class="panel" :class="[p.key, { on: step >= p.at }]">
      <header>
        <b>{{ p.title }}</b>
        <span>A person first sees it working on <em>{{ p.first }}</em></span>
      </header>
      <div class="grid">
        <div class="corner" />
        <div v-for="d in days" :key="'h' + d" class="day">Day {{ d }}</div>
        <template v-for="l in layers" :key="l">
          <div class="layer">{{ l }}</div>
          <div
            v-for="d in days" :key="l + d" class="cell"
            :class="p.cells[`${l}-${d}`]"
            :style="{ '--d': d, '--r': layers.indexOf(l) }"
          >
            <span v-if="p.cells[`${l}-${d}`] === 'stub'">fixture</span>
          </div>
        </template>
        <div class="corner" />
        <div v-for="d in days" :key="'e' + d" class="seen" :class="{ yes: p.seen.includes(d) }" :style="{ '--d': d }">
          <Icon v-if="p.seen.includes(d)" name="eye" />
        </div>
      </div>
    </section>
    <p class="take" :class="{ on: step >= 2 }">Stub what isn't ready. Keep the path end to end, and put it in front of a person.</p>
  </div>
</template>

<style scoped>
.tb {
  height: 510px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  gap: 20px 44px;
}

.panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  transition: opacity 600ms var(--ns-ease);
}

.panel:not(.on) {
  opacity: 0.12;
}

header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--z-ink);
  margin-bottom: 14px;
}

header b {
  font-size: 27px;
  letter-spacing: -0.02em;
}

header span {
  font-size: 18px;
  color: var(--z-ink-800);
}

header em {
  font-style: normal;
  font-weight: 800;
}

.layered header em {
  color: var(--ns-red);
}

.tracer header em {
  color: var(--ns-teal);
}

.grid {
  flex: 1;
  display: grid;
  grid-template-columns: 64px repeat(4, 1fr);
  grid-template-rows: auto repeat(3, 1fr) 44px;
  gap: 8px;
}

.day {
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
  text-align: center;
}

.layer {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 800;
}

.cell {
  position: relative;
  background: var(--ns-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell.real,
.cell.stub {
  transition: transform 600ms var(--ns-ease), opacity 500ms var(--ns-ease);
  transition-delay: calc(var(--d) * 220ms + var(--r) * 60ms);
}

.cell.real {
  background: var(--z-ink);
}

.tracer .cell.real {
  background: var(--ns-teal);
  margin: 0 12%;
}

.cell.stub {
  background: repeating-linear-gradient(135deg, #fff 0 6px, var(--z-teal-100) 6px 12px);
  border: 2px dashed var(--ns-teal);
  margin: 0 12%;
}

.cell.stub span {
  font-size: 17px;
  font-weight: 700;
  color: var(--ns-teal);
  background: #fff;
  padding: 1px 4px;
}

.panel:not(.on) .cell.real,
.panel:not(.on) .cell.stub {
  opacity: 0;
  transform: scaleY(0.2);
}

.seen {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: var(--ns-teal);
  transition: opacity 400ms var(--ns-ease), transform 500ms var(--ns-ease);
  transition-delay: calc(var(--d) * 220ms + 300ms);
}

.layered .seen {
  color: var(--ns-red);
}

.panel:not(.on) .seen {
  opacity: 0;
  transform: translateY(-8px);
}

.take {
  grid-column: 1 / -1;
  margin: 0;
  max-width: none;
  padding: 16px 22px;
  background: var(--z-ink);
  color: #fff;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.01em;
  transition: opacity 600ms var(--ns-ease);
}

.take:not(.on) {
  opacity: 0;
}
</style>
