<!--
  The local check run after a slice, as terminal output. The lint rule and
  paths are the demo app's real ones (eslint.config.js, no-restricted-imports).
  0 the failing run, with the fix in the message · 1 where it runs · 2 the rerun
  Both runs share one grid cell and crossfade, so nothing shifts.
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
</script>

<template>
  <div class="checks">
    <section class="term ns-mono">
      <header><i /><i /><i /><span>demo-app · after slice 2</span></header>
      <div class="runs">
        <div class="run" :class="{ on: step < 2 }">
          <p class="cmd">$ npm run check</p>
          <p class="st ok"><b>✓</b> tsc <em>types line up</em></p>
          <p class="st bad"><b>✗</b> eslint <em>1 error</em></p>
          <div class="err">
            <p class="loc">src/client/TaskList.tsx:4</p>
            <p class="code">import { findTasks } from '../lib/tasks.js'</p>
            <p class="msg">Browser code must use the HTTP API. Put shared request/response types in src/shared/contracts.ts.</p>
            <p class="rule">no-restricted-imports</p>
          </div>
          <p class="st skip"><b>·</b> vitest <em>not run</em></p>
        </div>
        <div class="run" :class="{ on: step >= 2 }">
          <p class="cmd">agent: edit src/client/TaskList.tsx</p>
          <p class="diff del">- import { findTasks } from '../lib/tasks.js'</p>
          <p class="diff add">+ import { api } from './api.js'</p>
          <p class="cmd gap">$ npm run check</p>
          <p class="st ok"><b>✓</b> tsc</p>
          <p class="st ok"><b>✓</b> eslint</p>
          <p class="st ok"><b>✓</b> vitest <em>11 passed</em></p>
          <p class="done">Slice 2 ready for review.</p>
        </div>
      </div>
    </section>

    <aside class="where" :class="{ on: step >= 1 }">
      <div class="lane now">
        <b>On your machine</b>
        <span>After every slice. Seconds.</span>
      </div>
      <i class="link" />
      <div class="lane">
        <b>In CI</b>
        <span>Same checks again, on every push.</span>
      </div>
      <p class="note">The error says how to fix it, so the agent repairs it in one turn.</p>
    </aside>
  </div>
</template>

<style scoped>
.checks {
  height: 510px;
  display: grid;
  grid-template-columns: 1fr 330px;
  gap: 32px;
}

.term {
  background: var(--z-ink);
  color: #d6d6d6;
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 70px -40px rgba(26, 26, 26, 0.6);
}

.term header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-bottom: 1px solid #333;
  font-size: 16px;
  color: #8f8f8f;
}

.term header i {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #3d3d3d;
}

.term header span {
  margin-left: 8px;
}

.runs {
  flex: 1;
  display: grid;
  padding: 18px 24px;
}

.run {
  grid-area: 1 / 1;
  transition: opacity 500ms var(--ns-ease);
}

.run:not(.on) {
  opacity: 0;
}

.run p {
  margin: 0;
  max-width: none;
  font-size: 20px;
  line-height: 1.55;
  white-space: pre-wrap;
}

.cmd {
  color: #8f8f8f;
}

.cmd.gap {
  margin-top: 14px !important;
}

.st b {
  display: inline-block;
  width: 26px;
}

.st em {
  font-style: normal;
  color: #7a7a7a;
  margin-left: 10px;
}

.st.ok b { color: var(--ns-frozen); }
.st.bad { color: #ff9d8f; }
.st.bad b { color: var(--z-red-400); }
.st.skip { color: #6a6a6a; }

.err {
  margin: 8px 0 10px 26px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 120, 100, 0.45);
  background: rgba(222, 30, 5, 0.12);
}

.err .loc { color: #bdbdbd; }
.err .code { color: #ff9d8f; }

.err .msg {
  margin-top: 6px !important;
  color: #fff;
  font-family: var(--z-font-text);
  font-size: 21px !important;
  font-weight: 700;
  line-height: 1.35 !important;
}

.err .rule {
  margin-top: 6px !important;
  color: #7a7a7a;
  font-size: 16px !important;
}

.diff.del { color: #ff9d8f; }
.diff.add { color: var(--ns-frozen); }

.done {
  margin-top: 16px !important;
  color: #fff;
  font-family: var(--z-font-text);
  font-weight: 700;
  font-size: 21px !important;
}

.where {
  display: flex;
  flex-direction: column;
  transition: opacity 600ms var(--ns-ease);
}

.where:not(.on) {
  opacity: 0;
}

.lane {
  padding: 18px 20px;
  border-top: 4px solid var(--z-ink);
  background: var(--ns-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lane.now {
  border-color: var(--ns-teal);
  background: #e3f4f6;
}

.lane b {
  font-size: 24px;
}

.lane span {
  font-size: 20px;
  line-height: 1.3;
  color: var(--z-ink-800);
}

.link {
  align-self: center;
  width: 3px;
  height: 34px;
  background: repeating-linear-gradient(to bottom, var(--z-ink) 0 6px, transparent 6px 11px);
}

.note {
  margin: auto 0 0;
  max-width: none;
  padding: 18px 20px;
  background: var(--z-ink);
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.3;
}
</style>
