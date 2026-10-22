<!--
  My own project, where the talk's examples come from. First what the product
  does, so the room knows the words the examples use: study, task,
  prototype, session, replay, finding. Then the numbers, from the repo's
  harness report as of 22 Oct 2026 (master at e0f2868); refresh them before
  the talk. Then the three rules it runs on.
  0 the product · 1 the numbers · 2 how it's built
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 99 })

const steps = [
  { id: 'study', name: 'A researcher', p: 'sets up a study and its tasks' },
  { id: 'try', name: 'A participant', p: 'tries a prototype app' },
  { id: 'session', name: 'The session', p: 'records screen, voice and a transcript' },
  { id: 'finding', name: 'Findings', p: 'for the team, and for agents through MCP' },
]
const tasks = ['Sign up', 'Find the report', 'Share it']
const wave = [5, 9, 14, 8, 16, 11, 6, 12, 15, 7, 10, 4, 13, 9, 6]

const stats = [
  { n: '11', t: 'days old' },
  { n: '288', t: 'merged PRs' },
  { n: '1,103', t: 'agent threads' },
  { n: '0', t: 'approvals required', key: true },
]

const bets = [
  { h: 'Humans steer', p: 'Decisions live in the issue' },
  { h: 'Agents own delivery', p: 'One agent, one worktree, one PR' },
  { h: 'Code holds the line', p: 'Checks refuse, not prose' },
]
</script>

<template>
  <div class="or">
    <div class="flow">
      <template v-for="(s, i) in steps" :key="s.id">
        <i v-if="i" class="arrow" aria-hidden="true"><Icon name="arrow" /></i>
        <section class="step" :style="{ '--i': i }">
          <div class="pic" :class="'pic-' + s.id" aria-hidden="true">
            <template v-if="s.id === 'study'">
              <span class="chip ns-mono">Study</span>
              <span v-for="(t, k) in tasks" :key="t" class="task"><em>{{ k + 1 }}</em>{{ t }}</span>
            </template>

            <template v-else-if="s.id === 'try'">
              <span class="phone">
                <i class="bar w60" /><i class="bar w90" /><i class="card" /><i class="btn" />
                <i class="tap" />
              </span>
            </template>

            <template v-else-if="s.id === 'session'">
              <span class="screen">
                <i class="rec ns-mono">REC 0:42</i>
                <i class="bar w60" /><i class="bar w80" /><i class="bar w40" />
              </span>
              <span class="scrub"><i /></span>
              <span class="wave"><i v-for="(h, k) in wave" :key="k" :style="{ height: h + 'px' }" /></span>
              <span class="said">"Where would the report be?"</span>
            </template>

            <template v-else>
              <span class="finding">
                <b>Finding</b>
                <i class="bar w90" /><i class="bar w70" /><i class="bar w80" />
              </span>
              <span class="mcp ns-mono"><Icon name="bot" />agent reads it</span>
            </template>
          </div>
          <b class="name">{{ s.name }}</b>
          <p>{{ s.p }}</p>
        </section>
      </template>
    </div>

    <div class="stats" :class="{ on: step >= 1 }">
      <div v-for="(s, i) in stats" :key="s.t" class="stat" :class="{ key: s.key }" :style="{ '--i': i }">
        <b>{{ s.n }}</b>
        <span>{{ s.t }}</span>
      </div>
    </div>

    <div class="bets" :class="{ on: step >= 2 }">
      <div v-for="(b, i) in bets" :key="b.h" class="bet" :style="{ '--i': i }">
        <b><em>{{ i + 1 }}</em>{{ b.h }}</b>
        <span>{{ b.p }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.or {
  height: 510px;
  display: grid;
  grid-template-rows: 1fr auto auto;
  gap: 24px;
}

/* ---------- What the product does ---------- */

.flow {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36px minmax(0, 1fr) 36px minmax(0, 1fr) 36px minmax(0, 1fr);
  align-items: start;
  min-height: 0;
}

.arrow {
  display: grid;
  place-items: center;
  height: 214px;
  font-size: 26px;
  color: var(--ns-teal);
}

.step {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.pic {
  position: relative;
  height: 214px;
  margin-bottom: 10px;
  padding: 18px;
  background: var(--ns-soft);
  border-top: 5px solid var(--z-ink);
  overflow: hidden;
}

.name {
  font-size: 24px;
  line-height: 1.2;
}

.step p {
  margin: 0;
  max-width: none;
  font-size: 19px;
  line-height: 1.3;
  color: var(--z-ink-800);
  text-wrap: balance;
}

.bar {
  display: block;
  height: 8px;
  border-radius: 4px;
  background: #cfd5d7;
}

.w40 { width: 40%; }
.w60 { width: 60%; }
.w70 { width: 70%; }
.w80 { width: 80%; }
.w90 { width: 90%; }

/* A study: its tasks in order */
.pic-study {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chip {
  align-self: flex-start;
  padding: 2px 8px;
  background: var(--z-ink);
  color: #fff;
  font-size: 15px;
}

.task {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: #fff;
  font-size: 18px;
}

.task em {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--ns-teal);
  color: #fff;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
}

/* A prototype on a phone, with a tap */
.pic-try {
  display: grid;
  place-items: center;
  padding: 10px;
}

.phone {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 108px;
  height: 184px;
  padding: 20px 12px;
  background: #fff;
  border: 3px solid var(--z-ink);
  border-radius: 14px;
}

.phone .card {
  display: block;
  height: 52px;
  border-radius: 4px;
  background: #e6f4f6;
}

.phone .btn {
  display: block;
  height: 18px;
  margin-top: auto;
  border-radius: 4px;
  background: var(--ns-teal);
}

.tap {
  position: absolute;
  right: 18px;
  bottom: 14px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(3, 127, 145, 0.5);
  animation: tap 2.4s var(--ns-ease) infinite;
}

@keyframes tap {
  0%, 30% { transform: scale(0.4); opacity: 0; }
  40% { opacity: 1; }
  80%, 100% { transform: scale(1.6); opacity: 0; }
}

/* The session: screen, playhead, voice, transcript */
.pic-session {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.screen {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 92px;
  padding: 30px 12px 12px;
  background: var(--z-ink);
}

.screen .bar { background: #4a4a4a; }

.rec {
  position: absolute;
  right: 8px;
  top: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-style: normal;
  color: #fff;
}

.rec::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ns-red, #d6261c);
  animation: blink 1.4s steps(2, jump-none) infinite;
}

@keyframes blink {
  50% { opacity: 0.2; }
}

.scrub {
  position: relative;
  height: 4px;
  background: #cfd5d7;
}

.scrub i {
  position: absolute;
  inset: 0 58% 0 0;
  background: var(--ns-teal);
}

.wave {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 20px;
}

.wave i {
  flex: 1;
  border-radius: 2px;
  background: var(--ns-teal);
  opacity: 0.6;
}

.said {
  font-size: 16px;
  font-style: italic;
  white-space: nowrap;
  color: var(--z-ink-800);
}

/* A finding, and an agent reading it */
.pic-finding {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.finding {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 12px 14px;
  background: #fff;
  border-left: 4px solid var(--ns-teal);
}

.finding b {
  font-size: 16px;
}

.mcp {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  background: var(--z-ink);
  color: #fff;
  font-size: 15px;
}

.mcp :deep(.ns-icon) {
  font-size: 18px;
  color: var(--ns-frozen);
}

/* ---------- The numbers ---------- */

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 10px 18px;
  background: var(--ns-soft);
  border-top: 4px solid var(--z-ink);
}

.stat b {
  font-size: 40px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
}

.stat span {
  font-size: 18px;
  color: var(--z-ink-800);
}

.stat.key {
  background: var(--z-ink);
  border-color: var(--ns-frozen);
}

.stat.key b { color: var(--ns-frozen); }
.stat.key span { color: #e6e6e6; }

/* ---------- How it's built ---------- */

.bets {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.bet {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0 12px;
  padding-top: 10px;
  border-top: 3px solid var(--ns-teal);
}

.bet b {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 21px;
}

.bet em {
  font-style: normal;
  font-weight: 300;
  color: var(--ns-teal);
}

.bet span {
  font-size: 18px;
  color: var(--z-ink-800);
}

.stat,
.bet {
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
  transition-delay: calc(var(--i) * 90ms);
}

.stats:not(.on) .stat,
.bets:not(.on) .bet {
  opacity: 0;
  transform: translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .tap,
  .rec::before {
    animation: none;
  }
}
</style>
