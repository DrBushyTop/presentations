<!--
  Polylane's context graph, redrawn: follow the edges from the repository in
  the PR to the cloud resources it can affect, then let a small model drop
  the ones that don't matter before the agent starts.
  0 the graph · 1 follow the edges · 2 filter, then hand to the agent
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

type N = { id: string, x: number, y: number, w: number, h: number, kind: string, name: string, drop?: boolean }
const nodes: N[] = [
  { id: 'repo', x: 0, y: 190, w: 230, h: 96, kind: 'Repository', name: 'checkout-edge' },
  { id: 'api', x: 400, y: 150, w: 240, h: 96, kind: 'Lambda function', name: 'checkout-api' },
  { id: 'report', x: 400, y: 280, w: 240, h: 96, kind: 'Cron job', name: 'nightly-report', drop: true },
  { id: 'mail', x: 400, y: 404, w: 240, h: 96, kind: 'Worker', name: 'email-sender', drop: true },
  { id: 'queue', x: 880, y: 0, w: 256, h: 96, kind: 'SQS queue', name: 'orders-events' },
  { id: 'db', x: 880, y: 150, w: 256, h: 96, kind: 'RDS instance', name: 'orders-db' },
]

const edges = [
  { d: 'M230,238 C315,238 315,198 400,198', label: 'deploys_to', lx: 250, ly: 186 },
  { d: 'M230,238 C315,238 315,328 400,328', label: '', lx: 0, ly: 0, drop: true },
  { d: 'M230,238 C315,238 315,452 400,452', label: '', lx: 0, ly: 0, drop: true },
  { d: 'M880,48 C760,48 760,198 640,198', label: 'triggers', lx: 690, ly: 92 },
  { d: 'M640,198 L880,198', label: 'connects_to', lx: 745, ly: 186 },
]
</script>

<template>
  <div class="graph" :class="{ walk: step >= 1, filter: step >= 2 }">
    <svg class="edges" viewBox="0 0 1136 500" aria-hidden="true">
      <g v-for="(e, i) in edges" :key="i" :class="{ drop: e.drop }">
        <path :d="e.d" class="edge" pathLength="1" :style="{ '--i': i }" />
        <text v-if="e.label" :x="e.lx" :y="e.ly" class="lbl">{{ e.label }}</text>
      </g>
      <path d="M1008,246 L1008,318" class="edge agent-edge" pathLength="1" />
      <path d="M640,214 C760,214 760,392 880,392" class="edge agent-edge" pathLength="1" />
    </svg>

    <div
      v-for="n in nodes" :key="n.id" class="node" :class="[n.id, { drop: n.drop }]"
      :style="{ left: n.x + 'px', top: n.y + 'px', width: n.w + 'px', height: n.h + 'px' }"
    >
      <small>{{ n.kind }}</small>
      <b class="ns-mono">{{ n.name }}</b>
      <Icon v-if="n.drop" name="x" class="gone" />
    </div>

    <div class="pr"><span class="ns-mono">PR #1207</span> adds a migration</div>
    <div class="small-model">A small model drops the rest</div>

    <div class="agent">
      <small>Agent gets</small>
      <b>The diff, description and commits</b>
      <b>Only the three that matter</b>
    </div>
  </div>
</template>

<style scoped>
.graph {
  position: relative;
  width: 1136px;
  height: 500px;
}

.edges {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.edge {
  fill: none;
  stroke: #c9c9c6;
  stroke-width: 3;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke 500ms var(--ns-ease), opacity 500ms var(--ns-ease);
}

.walk .edge {
  stroke: var(--ns-teal);
  stroke-width: 4;
  animation: draw 900ms var(--ns-ease) both;
  animation-delay: calc(var(--i) * 180ms);
}

@keyframes draw {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}

.filter .drop .edge {
  stroke: #d9d9d6;
  stroke-width: 3;
  opacity: 0.6;
}

.agent-edge {
  opacity: 0;
}

.filter .agent-edge {
  opacity: 1;
  stroke: var(--z-ink);
  animation: draw 900ms var(--ns-ease) both 300ms;
}

.lbl {
  font-family: var(--ns-mono);
  font-size: 18px;
  fill: var(--z-grey-600);
}

.walk .lbl {
  fill: var(--ns-teal);
  font-weight: 700;
}

.node {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 0 18px;
  background: #fff;
  border: 2px solid var(--z-ink);
  transition: opacity 500ms var(--ns-ease), border-color 500ms var(--ns-ease), background 500ms var(--ns-ease);
}

.node small {
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
}

.node b {
  font-size: 21px;
}

.node.repo {
  background: var(--z-ink);
  color: #fff;
}

.node.repo small {
  color: #bdbdbd;
}

.walk .node:not(.repo) {
  border-color: var(--ns-teal);
  background: #e8f6f8;
}

.filter .node.drop {
  opacity: 0.35;
  background: #fff;
  border-color: #c9c9c6;
}

.gone {
  position: absolute;
  right: -42px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 30px;
  color: var(--ns-red);
  opacity: 0;
}

.filter .gone {
  opacity: 1;
}

.pr {
  position: absolute;
  left: 0;
  top: 304px;
  width: 230px;
  padding: 10px 14px;
  border: 3px solid var(--ns-red);
  color: var(--ns-red);
  font-size: 19px;
  font-weight: 700;
}

.small-model {
  position: absolute;
  left: 726px;
  top: 418px;
  width: 146px;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--ns-red);
  opacity: 0;
  transition: opacity 500ms var(--ns-ease);
}

.filter .small-model {
  opacity: 1;
}

.agent {
  position: absolute;
  left: 880px;
  top: 318px;
  width: 256px;
  height: 182px;
  padding: 16px 18px;
  background: var(--z-ink);
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 600ms var(--ns-ease) 500ms, transform 700ms var(--ns-ease) 500ms;
}

.filter .agent {
  opacity: 1;
  transform: none;
}

.agent small {
  font-size: var(--ns-label);
  color: #bdbdbd;
  font-weight: 700;
}

.agent b {
  font-size: 21px;
  line-height: 1.25;
}

@media (prefers-reduced-motion: reduce) {
  .walk .edge,
  .filter .agent-edge {
    animation: none;
  }
}
</style>
