<!--
  Line count is not risk. Both minimaps use the same scale: one row per line.
  1 what each change needs · 2 the takeaway
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

function minimap(lines: number, cols: number, rowGap: number, colW: number) {
  let d = ''
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const perCol = Math.ceil(lines / cols)
  for (let i = 0; i < lines; i++) {
    const c = Math.floor(i / perCol)
    const r = i % perCol
    const indent = Math.floor(rnd() * 4) * 5
    const w = 12 + rnd() * (colW - 20 - indent)
    d += `M${c * (colW + 10) + indent},${r * rowGap + 1}h${w.toFixed(1)}`
  }
  return d
}

const big = minimap(1900, 10, 1.5, 46)
const small = minimap(10, 1, 1.5, 46)
</script>

<template>
  <div class="risk">
    <section class="change">
      <header>
        <b>Rename <code>owner</code> to <code>assignee</code></b>
        <span class="ns-mono">1,900 lines · 212 files</span>
      </header>
      <svg class="map" viewBox="0 0 560 290" preserveAspectRatio="xMinYMin meet" aria-hidden="true">
        <path :d="big" />
      </svg>
      <div class="needs ok" :class="{ on: step >= 1 }">
        <b>A mechanical check</b>
        <span>It builds, the same tests pass, and no logic changed.</span>
      </div>
    </section>

    <section class="change">
      <header>
        <b>Let members delete team tasks</b>
        <span class="ns-mono">10 lines · 1 file</span>
      </header>
      <div class="small-row">
        <svg class="map tiny" viewBox="0 0 56 16" aria-hidden="true"><path :d="small" /></svg>
        <div class="code ns-mono">
          <div class="del">- if (!session.isAdmin(team)) throw forbidden()</div>
          <div class="add">+ if (!session.isMember(team)) throw forbidden()</div>
          <div>{{ '  ' }}await db.tasks.delete({ where: { id } })</div>
        </div>
      </div>
      <div class="needs bad" :class="{ on: step >= 1 }">
        <b>A person, and a test at the boundary</b>
        <span>Who else just gained the right to delete?</span>
      </div>
    </section>

    <p class="take" :class="{ on: step >= 2 }">Line count tells you how long a review takes. It tells you nothing about what can break.</p>
  </div>
</template>

<style scoped>
.risk {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  grid-template-rows: 1fr auto;
  gap: 18px 40px;
  height: 500px;
}

.change {
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--z-ink);
}

header b {
  font-size: 24px;
  letter-spacing: -0.01em;
}

header span {
  font-size: 17px;
  color: var(--z-grey-600);
}

code {
  font-family: var(--ns-mono);
  font-size: 0.85em;
}

.map {
  flex: 1;
  min-height: 0;
  width: 100%;
  margin: 14px 0;
}

.map path {
  stroke: #a9a9a6;
  stroke-width: 1;
  fill: none;
}

.small-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 18px;
}

.map.tiny {
  flex: none;
  width: 62px;
  height: 18px;
  margin: 0;
}

.map.tiny path {
  stroke: var(--ns-red);
}

.code {
  flex: 1;
  min-width: 0;
  margin: 0;
  background: var(--z-ink);
  color: #cfcfcf;
  font-size: 15px;
  line-height: 1.8;
  padding: 16px 18px;
  white-space: pre;
  overflow: hidden;
}

.del { color: #ff9a8a; }
.add { color: var(--z-teal-300); }

.needs {
  padding: 14px 18px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: opacity 500ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.needs:not(.on) {
  opacity: 0;
  transform: translateY(12px);
}

.needs b {
  font-size: 22px;
}

.needs span {
  font-size: 18px;
  opacity: 0.92;
}

.needs.ok { background: var(--ns-teal); }
.needs.bad { background: var(--ns-red); }

.take {
  grid-column: 1 / -1;
  margin: 0;
  max-width: none;
  font-size: 25px;
  font-weight: 700;
  letter-spacing: -0.01em;
  transition: opacity 500ms var(--ns-ease);
}

.take:not(.on) {
  opacity: 0;
}
</style>
