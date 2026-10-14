<!--
  The agent runs the app and checks the behaviour itself: start a fresh
  instance with known data, reproduce the problem in the browser, fix it, and
  repeat the same action. Commands, ports and seed data are the demo app's
  (README: npm run reset, npm run dev on 5176). A-102's title has a comma on
  purpose. The export endpoint is the one being built in the talk; the quoting
  bug is illustrative.
  0 start · 1 reproduce · 2 fix and repeat the same action
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const steps = ['Start a fresh instance', 'Reproduce it', 'Fix', 'Repeat the same action']
const cols = ['id', 'title', 'status']
</script>

<template>
  <div class="run">
    <ol class="rail">
      <li v-for="(s, i) in steps" :key="s" :class="{ on: i === 0 || (i === 1 && step >= 1) || step >= 2 }">
        <span class="ns-mono">{{ i + 1 }}</span>{{ s }}
      </li>
    </ol>

    <section class="term ns-mono">
      <header>worktree export-csv</header>
      <p class="cmd">$ npm run reset</p>
      <p class="dim">Restored the two demo accounts and ten tasks.</p>
      <p class="cmd">$ npm run dev</p>
      <p class="dim">API :4323 · UI :5176</p>
      <div class="swap">
        <div class="log" :class="{ on: step === 1 }">
          <p class="cmd">GET /api/tasks/export · 200</p>
          <p class="warn">row A-102: 4 fields, expected 3</p>
        </div>
        <div class="log" :class="{ on: step >= 2 }">
          <p class="cmd">agent: quote fields in export.ts</p>
          <p class="ok">5 rows · 3 fields each</p>
        </div>
      </div>
    </section>

    <section class="browser" :class="{ on: step >= 1 }">
      <header>
        <i /><i /><i />
        <span class="url ns-mono">localhost:5176 · tasks.csv</span>
        <em>agent's browser · the export opened as a table</em>
      </header>
      <div class="grid">
        <span v-for="c in cols" :key="c" class="hd">{{ c }}</span><span class="hd" />
        <span class="ns-mono">A-101</span><span>Draft Q4 roadmap</span><span>open</span><span />
        <span class="ns-mono">A-102</span>
        <span class="swapcell"><b class="fixed" :class="{ on: step >= 2 }">Fix login, then retest</b><b class="broke" :class="{ on: step < 2 }">Fix login</b></span>
        <span class="swapcell"><b class="fixed" :class="{ on: step >= 2 }">done</b><b class="broke bad" :class="{ on: step < 2 }">then retest</b></span>
        <span class="swapcell"><b class="broke bad" :class="{ on: step < 2 }">done</b></span>
        <span class="dim ns-mono">…</span><span class="dim">A-103 to A-105</span><span /><span />
      </div>
      <div class="verdict">
        <span class="v bad" :class="{ on: step === 1 }">A-102 splits into four columns. The comma isn't quoted.</span>
        <span class="v ok" :class="{ on: step >= 2 }">Same export, same data. Every row has three columns.</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.run {
  height: 510px;
  display: grid;
  grid-template-columns: 400px 1fr;
  grid-template-rows: auto 1fr;
  gap: 18px 24px;
}

.rail {
  grid-column: 1 / -1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.rail li {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0 0;
  border-top: 4px solid var(--ns-line);
  font-size: 20px;
  font-weight: 700;
  color: var(--z-grey-600);
  transition: border-color 500ms var(--ns-ease), color 500ms var(--ns-ease);
}

.rail li::before {
  display: none !important;
}

.rail li span {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--ns-line);
  color: #fff;
  font-size: 16px;
  transition: background 500ms var(--ns-ease);
}

.rail li.on {
  border-color: var(--ns-teal);
  color: var(--z-ink);
}

.rail li.on span {
  background: var(--ns-teal);
}

.term {
  background: var(--z-ink);
  color: #d6d6d6;
  padding: 0 0 16px;
  display: flex;
  flex-direction: column;
}

.term header {
  padding: 12px 18px;
  border-bottom: 1px solid #333;
  font-size: 16px;
  color: #8f8f8f;
  margin-bottom: 10px;
}

.term p {
  margin: 0;
  max-width: none;
  padding: 0 18px;
  font-size: 18px;
  line-height: 1.6;
}

.cmd { color: #f2f2f2; }
.dim { color: #7a7a7a; }
.warn { color: #ff9d8f; }
.ok { color: var(--ns-frozen); }

.swap {
  margin-top: auto;
  display: grid;
  padding-top: 14px;
  border-top: 1px solid #333;
}

.log {
  grid-area: 1 / 1;
  transition: opacity 450ms var(--ns-ease);
}

.log:not(.on) {
  opacity: 0;
}

.browser {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ns-line);
  background: #fff;
  box-shadow: 0 24px 60px -34px rgba(26, 26, 26, 0.45);
  transition: opacity 600ms var(--ns-ease);
}

.browser:not(.on) {
  opacity: 0.15;
}

.browser header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 16px;
  background: var(--ns-soft);
  border-bottom: 1px solid var(--ns-line);
}

.browser header i {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #cfcfcc;
}

.url {
  flex: 1;
  margin-left: 6px;
  padding: 4px 10px;
  background: #fff;
  font-size: 16px;
}

.browser header em {
  flex-basis: 100%;
  font-style: normal;
  font-size: 16px;
  font-weight: 700;
  color: var(--ns-teal);
}

.grid {
  flex: 1;
  display: grid;
  grid-template-columns: 90px 1.6fr 0.9fr 0.7fr;
  align-content: center;
  padding: 10px 22px;
}

.grid > span {
  display: flex;
  align-items: center;
  min-height: 52px;
  padding: 0 10px;
  border-bottom: 1px solid var(--ns-line);
  font-size: 20px;
}

.grid .hd {
  min-height: 38px;
  font-size: 17px;
  font-weight: 700;
  color: var(--z-grey-600);
  border-bottom: 2px solid var(--z-ink);
}

.grid .dim {
  color: var(--z-grey-600);
}

.swapcell {
  display: grid !important;
  align-items: center;
}

.swapcell b {
  grid-area: 1 / 1;
  font-weight: 400;
  transition: opacity 500ms var(--ns-ease);
}

.swapcell b:not(.on) {
  opacity: 0;
}

.swapcell b.bad {
  margin: 0 -10px;
  padding: 4px 10px;
  background: #ffe2dc;
  color: var(--ns-red);
  font-weight: 700;
}

.swapcell b.fixed {
  color: var(--ns-teal);
  font-weight: 700;
}

.verdict {
  display: grid;
}

.v {
  grid-area: 1 / 1;
  padding: 14px 22px;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  transition: opacity 500ms var(--ns-ease);
}

.v.bad { background: var(--ns-red); }
.v.ok { background: var(--ns-teal); }

.v:not(.on) {
  opacity: 0;
}
</style>
