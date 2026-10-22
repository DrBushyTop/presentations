<!--
  Placeholder: my own project, where agents merge their own PRs. Numbers are
  from the repo's harness report as of 22 Oct 2026 (master at e0f2868);
  refresh them before the talk. The four layers go from advice to enforcement.
  0 the numbers · 1 the four layers
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const stats = [
  { n: '11', t: 'days since the first commit' },
  { n: '288', t: 'merged PRs' },
  { n: '1,103', t: 'agent threads on two machines' },
  { n: '0', t: 'human approvals required to merge', key: true },
]
const layers = [
  { name: 'Map', verb: 'tells', t: 'A 67-line AGENTS.md that routes each task to a skill', ex: ['AGENTS.md', 'CONTEXT.md', 'docs/decisions.md'] },
  { name: 'Playbooks', verb: 'guides', t: 'Skills that own one workflow end to end', ex: ['worktree-delivery', 'verify', 'repository-checks'] },
  { name: 'Gates', verb: 'blocks', t: 'Refuse the change, and say how to fix it', ex: ['pre-commit hook', 'architecture tests', 'local CI, required'] },
  { name: 'Record', verb: 'proves', t: 'The PR body says what was checked', ex: ['verification', 'review findings', 'before and after media'] },
]
</script>

<template>
  <div class="or">
    <div class="stats">
      <div v-for="s in stats" :key="s.t" class="stat" :class="{ key: s.key }">
        <b>{{ s.n }}</b>
        <span>{{ s.t }}</span>
      </div>
    </div>
    <div class="layers" :class="{ on: step >= 1 }">
      <div class="scale"><span>Advice</span><span>Enforcement</span></div>
      <div v-for="(l, i) in layers" :key="l.name" class="layer" :style="{ '--i': i }">
        <header><b>{{ l.name }}</b><em>{{ l.verb }}</em></header>
        <p>{{ l.t }}</p>
        <ul class="ns-mono">
          <li v-for="e in l.ex" :key="e">{{ e }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.or {
  height: 510px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 30px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
  background: var(--ns-soft);
  border-top: 5px solid var(--z-ink);
}

.stat b {
  font-size: 60px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
}

.stat span {
  font-size: 19px;
  line-height: 1.3;
  color: var(--z-ink-800);
}

.stat.key {
  background: var(--z-ink);
  color: #fff;
  border-color: var(--ns-frozen);
}

.stat.key b { color: var(--ns-frozen); }
.stat.key span { color: #e6e6e6; }

.layers {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: auto 1fr;
  gap: 12px 18px;
  min-height: 0;
}

.scale {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  padding-bottom: 8px;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
  border-bottom: 5px solid;
  border-image: linear-gradient(to right, #c9c9c6, var(--ns-teal)) 1;
  transition: opacity 600ms var(--ns-ease);
}

.scale span:last-child { color: var(--ns-teal); }

.layer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  border: 2px solid var(--z-ink);
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
  transition-delay: calc(var(--i) * 100ms);
}

.layer:nth-child(n + 4) {
  background: #e6f4f6;
  border-color: var(--ns-teal);
}

.layer header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.layer b { font-size: 26px; }

.layer em {
  font-style: normal;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--ns-teal);
}

.layer p {
  margin: 0;
  max-width: none;
  font-size: 20px;
  line-height: 1.35;
  color: var(--z-ink-800);
}

.layer ul {
  margin: auto 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.layer li {
  padding: 6px 10px;
  background: var(--ns-soft);
  font-size: 16px;
}

.layer:nth-child(n + 4) li {
  background: #fff;
}

.layers:not(.on) .layer,
.layers:not(.on) .scale {
  opacity: 0;
}

.layers:not(.on) .layer {
  transform: translateY(16px);
}
</style>
