<!--
  OpenAI's dependency model from "Harness engineering", redrawn: inside one
  business domain, code may depend only forward through six layers, and
  cross-cutting concerns enter through Providers. Arrows are imports: a layer
  may import the layers before it. The Service-to-UI edge and the lint message
  are our illustration, not quoted from the post.
  0 the allowed direction · 1 a forbidden edge fails a lint · 2 the takeaway
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const layers = ['Types', 'Config', 'Repo', 'Service', 'Runtime', 'UI']
// Column centres in the 1136 wide drawing.
const W = 1136
const col = (i: number) => 80 + i * ((W - 160) / 5)
</script>

<template>
  <div class="arch" :class="`s${Math.min(step, 2)}`">
    <svg class="draw" :viewBox="`0 0 ${W} 300`" aria-hidden="true">
      <defs>
        <marker id="ar-ok" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" /></marker>
        <marker id="ar-bad" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" /></marker>
      </defs>
      <text x="0" y="22" class="cap">Inside one business domain. A layer may import only the layers before it.</text>

      <!-- allowed: each layer imports the one before it -->
      <g class="ok">
        <path v-for="i in 5" :key="i" :d="`M${col(i) - 30},120 C${col(i) - 60},70 ${col(i - 1) + 60},70 ${col(i - 1) + 30},120`" marker-end="url(#ar-ok)" />
      </g>

      <g v-for="(l, i) in layers" :key="l" class="layer" :class="{ hit: i === 3 || i === 5 }">
        <rect :x="col(i) - 78" y="122" width="156" height="78" />
        <text :x="col(i)" y="170" text-anchor="middle">{{ l }}</text>
      </g>

      <!-- forbidden: Service importing UI, against the direction -->
      <g class="bad">
        <path :d="`M${col(3)},200 C${col(3)},280 ${col(5)},280 ${col(5)},206`" marker-end="url(#ar-bad)" />
        <text :x="col(4)" y="288" text-anchor="middle">Service imports UI</text>
      </g>
    </svg>

    <div class="prov">
      <b>Providers</b>
      <span>auth · connectors · telemetry · feature flags</span>
      <em>the one way in for cross-cutting code</em>
    </div>

    <div class="lint ns-mono">
      <p class="hd"><b>✗</b> structural test · layer-deps</p>
      <p class="msg">service/exports.ts imports ui/columnLabels.ts. Service may not import UI. Move the labels to types/ and import them from there.</p>
    </div>

    <p class="take">Choose the boundaries. Let the checks enforce them.</p>
  </div>
</template>

<style scoped>
.arch {
  height: 510px;
  display: grid;
  grid-template-rows: 300px auto auto 1fr;
  row-gap: 14px;
}

.draw {
  width: 100%;
  height: 300px;
  overflow: visible;
}

.cap {
  font-family: var(--z-font-text);
  font-size: var(--ns-label);
  font-weight: 700;
  fill: var(--z-grey-600);
}

.layer rect {
  fill: #fff;
  stroke: var(--z-ink);
  stroke-width: 3;
}

.layer text {
  font-family: var(--z-font-display);
  font-size: 26px;
  font-weight: 800;
  fill: var(--z-ink);
}

.ok path {
  fill: none;
  stroke: var(--ns-teal);
  stroke-width: 3;
}

.ok marker path,
#ar-ok path {
  fill: var(--ns-teal);
}

#ar-bad path {
  fill: var(--ns-red);
}

.bad {
  opacity: 0;
  transition: opacity 500ms var(--ns-ease);
}

.bad path {
  fill: none;
  stroke: var(--ns-red);
  stroke-width: 4;
  stroke-dasharray: 9 7;
}

.bad text {
  font-family: var(--z-font-text);
  font-size: 19px;
  font-weight: 700;
  fill: var(--ns-red);
  paint-order: stroke;
  stroke: #fff;
  stroke-width: 10px;
}

.layer.hit rect {
  transition: stroke 500ms var(--ns-ease), fill 500ms var(--ns-ease);
}

.s1 .bad,
.s2 .bad {
  opacity: 1;
}

.s1 .layer.hit rect,
.s2 .layer.hit rect {
  stroke: var(--ns-red);
  fill: #fff1ee;
}

.prov {
  display: flex;
  align-items: baseline;
  gap: 18px;
  padding: 12px 18px;
  background: var(--ns-soft);
  border-left: 0;
}

.prov b {
  font-size: 22px;
}

.prov span {
  font-size: 20px;
}

.prov em {
  margin-left: auto;
  font-style: normal;
  font-size: var(--ns-label);
  color: var(--z-grey-600);
}

.lint {
  padding: 12px 18px;
  background: var(--z-ink);
  transition: opacity 500ms var(--ns-ease) 200ms;
}

.s0 .lint {
  opacity: 0;
}

.lint p {
  margin: 0;
  max-width: none;
}

.lint .hd {
  font-size: 16px;
  color: #ff9d8f;
}

.lint .hd b {
  color: var(--z-red-400);
  margin-right: 6px;
}

.lint .msg {
  margin-top: 4px;
  font-family: var(--z-font-text);
  font-size: 21px;
  font-weight: 700;
  color: #fff;
}

.take {
  align-self: end;
  margin: 0;
  max-width: none;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.01em;
  transition: opacity 500ms var(--ns-ease);
}

.s0 .take,
.s1 .take {
  opacity: 0;
}
</style>
