<!--
  The agent runs the app and checks the behaviour itself: start a fresh
  instance with known data, reproduce the problem in the browser, fix it, and
  repeat the same action. From my repo's PR #535: the session player stayed
  on the first screen after an in-app route change (#476). The commands,
  ports, seeded session and the two moments (?at=2412 and ?at=4145) are the
  PR's; the screens are redrawn, not screenshots.
  0 start · 1 reproduce · 2 fix and repeat the same action
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const steps = ['Start a fresh instance', 'Reproduce it', 'Fix', 'Repeat the same action']
const invoices = ['2024-116', '2024-117', '2024-118', '2024-119']
</script>

<template>
  <div class="run">
    <ol class="rail">
      <li v-for="(s, i) in steps" :key="s" :class="{ on: i === 0 || (i === 1 && step >= 1) || step >= 2 }">
        <span class="ns-mono">{{ i + 1 }}</span>{{ s }}
      </li>
    </ol>

    <section class="term ns-mono">
      <header>worktree replay-routes</header>
      <p class="cmd">$ scripts/dev/instance.sh start</p>
      <p class="dim">api :5300 · web :5301</p>
      <p class="cmd">$ scripts/verify seed</p>
      <p class="dim">session: list → invoice → list</p>
      <div class="swap">
        <div class="log" :class="{ on: step === 1 }">
          <p class="cmd">open replay at 0:02</p>
          <p class="warn">✗ still the list, Inbox 6</p>
        </div>
        <div class="log" :class="{ on: step >= 2 }">
          <p class="cmd">agent fixes ReplayPlayer</p>
          <p class="ok">✓ 0:02 invoice 2024-118</p>
          <p class="ok">✓ 0:04 list, Inbox 5</p>
        </div>
      </div>
    </section>

    <section class="browser" :class="{ on: step >= 1 }">
      <header>
        <i /><i /><i />
        <span class="url ns-mono">localhost:5301 · session replay</span>
        <em>agent's browser · the recorded session, played back</em>
      </header>
      <div class="player">
        <div class="screen">
          <div class="view list" :class="{ on: step < 2, bad: step === 1 }">
            <p class="h">Invoices <span>Inbox 6</span></p>
            <p v-for="n in invoices" :key="n" class="inv" :class="{ me: n === '2024-118' }">
              <span class="ns-mono">{{ n }}</span><i /><em>open</em>
            </p>
          </div>
          <div class="view detail" :class="{ on: step >= 2 }">
            <p class="h">Invoice 2024-118</p>
            <p class="bar" /><p class="bar short" /><p class="bar" />
            <p class="btns"><span>Approve</span><span>Reject</span></p>
          </div>
        </div>
        <div class="scrub">
          <div class="track">
            <i class="tick" style="left: 0%" />
            <i class="tick" style="left: 38%" />
            <i class="tick" style="left: 72%" />
            <b class="head" style="left: 46%" />
          </div>
          <div class="marks ns-mono">
            <span style="left: 0%">list</span>
            <span style="left: 38%">→ invoice</span>
            <span style="left: 72%">→ list</span>
          </div>
        </div>
      </div>
      <div class="verdict">
        <span class="v bad" :class="{ on: step === 1 }">After the route change, the replay stays on the list.</span>
        <span class="v ok" :class="{ on: step >= 2 }">Same session, same moment. The replay shows the invoice.</span>
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

.player {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 22px 14px;
  min-height: 0;
}

.screen {
  flex: 1;
  display: grid;
  border: 1px solid var(--ns-line);
  background: #fafaf8;
  min-height: 0;
}

.view {
  grid-area: 1 / 1;
  padding: 12px 18px;
  transition: opacity 500ms var(--ns-ease), box-shadow 500ms var(--ns-ease);
}

.view:not(.on) {
  opacity: 0;
}

.view.bad {
  box-shadow: inset 0 0 0 3px var(--ns-red);
}

.view p {
  margin: 0;
  max-width: none;
}

.view .h {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 6px;
  font-size: 21px;
  font-weight: 800;
}

.view .h span {
  font-size: 16px;
  font-weight: 700;
  color: var(--z-grey-600);
}

.inv {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 5px 0;
  border-bottom: 1px solid var(--ns-line);
  font-size: 17px;
}

.inv i {
  flex: 1;
  height: 8px;
  background: #e4e4e0;
}

.inv em {
  font-style: normal;
  font-size: 16px;
  color: var(--z-grey-600);
}

.inv.me span {
  font-weight: 700;
}

.bar {
  height: 12px;
  margin: 12px 0 !important;
  background: #e4e4e0;
}

.bar.short {
  width: 55%;
}

.btns {
  display: flex;
  gap: 10px;
  margin-top: 16px !important;
}

.btns span {
  padding: 6px 14px;
  font-size: 16px;
  font-weight: 700;
  border: 2px solid var(--z-ink);
}

.btns span:first-child {
  background: var(--z-ink);
  color: #fff;
}

.scrub {
  position: relative;
}

.track {
  position: relative;
  height: 6px;
  margin: 6px 0;
  background: var(--ns-line);
}

.tick {
  position: absolute;
  top: -5px;
  width: 3px;
  height: 16px;
  background: var(--z-grey-600);
}

.head {
  position: absolute;
  top: -8px;
  width: 22px;
  height: 22px;
  margin-left: -11px;
  border-radius: 50%;
  background: var(--ns-teal);
  box-shadow: 0 0 0 4px #fff;
}

.marks {
  position: relative;
  height: 22px;
}

.marks span {
  position: absolute;
  top: 2px;
  font-size: 15px;
  white-space: nowrap;
  color: var(--z-grey-600);
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
