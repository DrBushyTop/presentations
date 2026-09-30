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
      <div class="arrow split"><span /><span /></div>
      <div class="pair">
        <div class="node plain"><small>Agent writes</small><b>the export</b></div>
        <div class="node plain"><small>Agent writes</small><b>the tests</b></div>
      </div>
      <div class="arrow join"><span /><span /></div>
      <div class="node green"><small>Result</small><b>24 passed</b><span>They agree. Nothing independent was checked.</span></div>
    </div>

    <div class="row bottom" :class="{ on: step >= 1 }" style="view-transition-name: ns-same-bottom">
      <div class="node ok-o"><small>Decision from the plan</small><b>Caller's team only</b></div>
      <div class="arrow straight"><span /></div>
      <div class="node plain wide"><small>You write first</small><b>What a forged <code>teamId</code> must return</b></div>
      <div class="arrow straight"><span /></div>
      <div class="node red"><small>Result</small><b>1 failed</b><span>Team B's canary row leaks.</span></div>
    </div>

    <p class="take" :class="{ on: step >= 2 }">Write down the expected result before you read the generated test.</p>
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node {
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.node small {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0.75;
}

.node b {
  font-size: 22px;
  line-height: 1.22;
}

.node span {
  font-size: 17px;
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

.split span:nth-child(1) { transform: rotate(-36deg); transform-origin: left center; }
.split span:nth-child(2) { transform: rotate(36deg); transform-origin: left center; }
.join span:nth-child(1) { transform: rotate(36deg); transform-origin: right center; }
.join span:nth-child(2) { transform: rotate(-36deg); transform-origin: right center; }

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
