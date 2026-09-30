<!--
  A plan that loses an argument.
  1 the challenge · 2 the plan changes · 3 exclusions and the evidence it needs
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
</script>

<template>
  <div class="arg">
    <section class="doc">
      <header><span class="ns-mono">plan.md</span></header>
      <ol>
        <li>Add <code>GET /tasks/export</code> that returns CSV.</li>
        <li class="target" :class="{ struck: step >= 2, flagged: step >= 1 }">Accept a <code>teamId</code> query parameter to filter.</li>
        <div class="ins" :class="{ on: step >= 2 }"><div>
          <li class="new is-decision">Decision: export only the caller's team. Ignore <code>teamId</code>.</li>
          <li class="new">Example: Team A exports exactly its 2 rows.</li>
          <li class="new">Example: a forged <code>teamId</code> still returns those 2 rows.</li>
        </div></div>
        <div class="ins" :class="{ on: step >= 3 }"><div>
          <li class="new out">Out of scope: jobs, streaming, formatting.</li>
          <li class="new ev">Evidence: a two-team check that fails without the filter.</li>
        </div></div>
      </ol>
    </section>

    <aside class="margin">
      <div class="note me" :class="{ on: step >= 1 }">
        <b>Me</b>
        <p>What if <code>teamId</code> belongs to another team?</p>
      </div>
      <div class="note agent" :class="{ on: step >= 2 }">
        <b>Planning agent</b>
        <p>It leaks their tasks. Session team only now.</p>
      </div>
      <div class="note stamp" :class="{ on: step >= 3 }">
        <b>Decision recorded</b>
        <p>It needs a check that can fail.</p>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.arg {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 28px;
  height: 500px;
}

.doc {
  border: 1px solid var(--ns-line);
  background: #fff;
  box-shadow: 0 20px 50px -30px rgba(26, 26, 26, 0.35);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.doc header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--ns-line);
  font-size: var(--ns-label);
  color: var(--z-grey-600);
}

.req {
  font-weight: 600;
  color: var(--z-ink);
}

ol {
  list-style: none;
  margin: 0;
  padding: 10px 22px;
  counter-reset: none;
}

li {
  position: relative;
  margin: 0;
  max-width: none;
  padding: 9px 12px;
  font-size: 23px;
  line-height: 1.35;
  transition: background 500ms var(--ns-ease), color 500ms var(--ns-ease);
}

li::before {
  display: none !important;
}

code {
  font-family: var(--ns-mono);
  font-size: 0.86em;
  background: var(--ns-soft);
  padding: 1px 5px;
}

.target.flagged {
  background: #fff1ee;
}

.target::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  top: 50%;
  height: 2px;
  background: var(--ns-red);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 600ms var(--ns-ease);
}

.target.struck {
  color: var(--z-grey-600);
}

.target.struck::after {
  transform: scaleX(1);
}

.ins {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 700ms var(--ns-ease);
}

.ins > div {
  overflow: hidden;
}

.ins.on {
  grid-template-rows: 1fr;
}

.new {
  background: #e3f4f6;
}

.new.is-decision {
  font-weight: 700;
}

.new.out {
  background: var(--ns-soft);
}

.margin {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 64px;
}

.note {
  padding: 14px 18px;
  transition: opacity 500ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.note:not(.on) {
  opacity: 0;
  transform: translateX(22px);
}

.note b {
  font-size: var(--ns-label);
  letter-spacing: 0.02em;
}

.note p {
  margin: 4px 0 0;
  font-size: 22px;
  line-height: 1.32;
  max-width: none;
}

.me {
  background: var(--ns-red);
  color: #fff;
}

.me code {
  background: rgba(255, 255, 255, 0.2);
}

.agent {
  background: var(--z-ink);
  color: #fff;
}

.stamp {
  border: 3px solid var(--ns-teal);
  color: var(--ns-teal);
  margin-top: auto;
}

.stamp p {
  color: var(--z-ink);
}
</style>
