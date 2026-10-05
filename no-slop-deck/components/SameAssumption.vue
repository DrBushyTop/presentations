<!--
  Code and tests written from the same wrong assumption agree with each other.
  1 an independent expectation · 2 the rule
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
</script>

<template>
  <div class="same">
    <div class="row top">
      <div class="node bad-o"><small>Assumption</small><b><code>teamId</code> may come from the query</b></div>
      <svg class="curve" viewBox="0 0 70 150" aria-hidden="true">
        <path d="M6,75 C34,75 30,34.5 60,34.5" /><path d="M52,27.5 L61,34.5 L52,41.5" />
        <path d="M6,75 C34,75 30,115.5 60,115.5" /><path d="M52,108.5 L61,115.5 L52,122.5" />
      </svg>
      <div class="pair">
        <div class="node plain"><small>Agent writes</small><b>the export</b></div>
        <div class="node plain"><small>Agent writes</small><b>the tests</b></div>
      </div>
      <svg class="curve" viewBox="0 0 70 150" aria-hidden="true">
        <path d="M8,34.5 C38,34.5 34,75 62,75" /><path d="M8,115.5 C38,115.5 34,75 62,75" />
        <path d="M54,68 L63,75 L54,82" />
      </svg>
      <div class="node green"><small>Result</small><b>3 passed</b><span>They agree. Nothing independent was checked.</span></div>
    </div>

    <div class="row bottom" :class="{ on: step >= 1 }" style="view-transition-name: ns-same-bottom">
      <div class="node ok-o"><small>Agreed behavior</small><b>Caller's team only</b></div>
      <div class="arrow straight"><span /></div>
      <div class="node plain wide"><small>Expected result</small><b>A-101 and A-102.<br />No Team B rows.</b></div>
      <div class="arrow straight"><span /></div>
      <div class="node red"><small>Result</small><b>1 failed</b><span>Team B's canary row leaks.</span></div>
    </div>

    <p class="take" :class="{ on: step >= 2 }">Write the expected result before reading the generated test.</p>
  </div>
</template>

<style scoped>
.same {
  height: 500px;
  display: grid;
  grid-template-rows: 1fr 1fr auto;
  gap: 22px;
}

.row {
  display: grid;
  grid-template-columns: 260px 70px 300px 70px 1fr;
  align-items: center;
}

.bottom {
  border-top: 1px solid var(--ns-line);
  padding-top: 22px;
  transition: opacity 600ms var(--ns-ease), transform 800ms var(--ns-ease);
}

.bottom:not(.on) {
  opacity: 0;
  transform: translateY(20px);
}

.pair {
  height: 150px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pair .node {
  flex: 1;
  justify-content: center;
}

.curve {
  width: 70px;
  height: 150px;
  overflow: visible;
}

.curve path {
  fill: none;
  stroke: var(--z-ink);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.node {
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.node small {
  font-size: var(--ns-label);
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0.75;
}

.node b {
  font-size: 22px;
  line-height: 1.22;
}

.node span {
  font-size: 19px;
  line-height: 1.3;
}

code {
  font-family: var(--ns-mono);
  font-size: 0.85em;
}

.bad-o { border: 3px solid var(--ns-red); color: var(--ns-red); }
.bad-o b { color: var(--z-ink); }
.ok-o { border: 3px solid var(--ns-teal); color: var(--ns-teal); }
.ok-o b { color: var(--z-ink); }
.plain { background: var(--ns-soft); }
.green { background: var(--ns-teal); color: #fff; min-height: 150px; justify-content: center; }
.red { background: var(--ns-red); color: #fff; min-height: 130px; justify-content: center; }
.green b, .red b { font-size: 34px; letter-spacing: -0.02em; }

.arrow {
  position: relative;
  height: 130px;
}

.arrow span {
  position: absolute;
  left: 10px;
  right: 10px;
  height: 3px;
  background: var(--z-ink);
  top: 50%;
}

.arrow span::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -6px;
  width: 12px;
  height: 12px;
  border-top: 3px solid var(--z-ink);
  border-right: 3px solid var(--z-ink);
  transform: rotate(45deg);
}


.take {
  margin: 0;
  max-width: none;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
  transition: opacity 500ms var(--ns-ease);
}

.take:not(.on) {
  opacity: 0;
}
</style>
