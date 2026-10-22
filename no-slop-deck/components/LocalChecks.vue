<!--
  Three of my repo's architecture rules failing at commit, then the full local
  CI run before merge. Rule ids, messages and the Day each rule arrived come
  from the repo (tests/Discovery.Architecture.Tests/SourceRules.cs, git log);
  the edited files and lines are illustrative, and long Fix lines are
  shortened. The rail on the right lists the rules by the day they arrived.
  0 time-provider · 1 handler-project-access · 2 retriable-transactions ·
  3 local CI and merge
  The frames share one grid cell and crossfade, so nothing shifts.
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const checks = [
  {
    verb: 'edit',
    file: 'Features/Retention/PurgeExpired.cs',
    add: 'var cutoff = DateTimeOffset.UtcNow - policy.KeepFor;',
    id: 'time-provider',
    line: 48,
    what: 'Reads the wall clock through DateTimeOffset.UtcNow.',
    fix: 'Inject TimeProvider and call time.GetUtcNow(), or use ctx.Now inside an action handler.',
    why: 'Tests and retention rules need a controllable clock.',
    after: 'injects TimeProvider',
  },
  {
    verb: 'add',
    file: 'Features/Findings/ArchiveFinding.cs',
    add: 'public static async Task<IResult> Handle(ArchiveFinding req, ActionContext ctx, …)',
    id: 'handler-project-access',
    line: 12,
    what: 'Handlers in this file take ActionContext ctx but never call ctx.Access.RequireAsync.',
    fix: 'Make the first statement of each project-scoped handler ctx.Access.RequireAsync(projectId, role, ct).',
    why: 'Non-members must get 404 before any work.',
    after: 'adds the access check',
  },
  {
    verb: 'edit',
    file: 'Features/Invitations/EditInvitation.cs',
    add: 'await using var tx = await db.Database.BeginTransactionAsync(ct);',
    id: 'retriable-transactions',
    line: 31,
    what: 'Begins a user transaction, but nothing in this file runs it through the execution strategy.',
    fix: 'Run the whole unit inside db.Database.CreateExecutionStrategy().ExecuteAsync(...).',
    why: 'SQL Server\'s retrying strategy refuses a bare user transaction, so the action returns 500 there while SQLite tests pass (#215).',
    after: 'wraps it in the strategy',
  },
]

const rules = [
  { day: 'Day 1', name: 'Features stay independent', id: 'feature-isolation' },
  { day: 'Day 1', name: 'Time from TimeProvider', id: 'time-provider', walk: 0 },
  { day: 'Day 1', name: 'Access check comes first', id: 'handler-project-access', walk: 1 },
  { day: 'Day 4', name: 'Every failure names its fix', id: 'Fix · Why · Don\'t' },
  { day: 'Day 5', name: 'MCP matches the API', id: 'ApiParityTests' },
  { day: 'Day 6', name: 'Transactions survive retries', id: 'after a 500 in production', walk: 2 },
]
</script>

<template>
  <div class="lc">
    <section class="term ns-mono">
      <header><i /><i /><i /><span>my repo · agent worktree</span></header>
      <div class="frames">
        <div v-for="(c, i) in checks" :key="c.id" class="frame" :class="{ on: step === i }">
          <p class="who"><b>agent</b> {{ c.verb }} {{ c.file }}</p>
          <p class="diff">+ {{ c.add }}</p>
          <p class="cmd">$ git commit <em>pre-commit runs scripts/check</em></p>
          <p class="steps"><span class="ok">✓ format</span><span class="ok">✓ build</span><span class="bad">✗ architecture</span></p>
          <div class="err">
            <p class="id">✗ [{{ c.id }}] {{ c.file.split('/').pop() }}:{{ c.line }}</p>
            <p class="what">{{ c.what }}</p>
            <dl>
              <dt>Fix</dt><dd>{{ c.fix }}</dd>
              <dt>Why</dt><dd>{{ c.why }}</dd>
              <dt class="dont">Don't</dt><dd>add a baseline/allowlist entry or weaken the rule to make this pass.</dd>
            </dl>
          </div>
          <p class="after"><b>agent</b> {{ c.after }}, commits again <span class="ok">✓</span></p>
        </div>

        <div class="frame" :class="{ on: step >= 3 }">
          <p class="cmd">$ scripts/ci <em>full suite, before the PR can merge</em></p>
          <p class="steps col">
            <span class="ok">✓ checks</span>
            <span class="ok">✓ architecture <em>13 rules</em></span>
            <span class="ok">✓ api <em>2,404 tests on SQL Server</em></span>
            <span class="ok">✓ web <em>1,087 tests</em></span>
          </p>
          <p class="rec">pass recorded for HEAD a41c9e0</p>
          <p class="cmd gap">$ scripts/pr merge</p>
          <p class="steps col">
            <span class="ok">✓ PR body: problem, scope, verification, review, media</span>
            <span class="ok">✓ local-ci passed on this exact commit</span>
          </p>
          <p class="done">Merged. The suite ran on the agent's machine;<br>GitHub only checked the result.</p>
        </div>
      </div>
    </section>

    <aside class="rail">
      <h3>My repo's rules, by the day they arrived</h3>
      <ol>
        <li
          v-for="r in rules"
          :key="r.name"
          :class="{ on: r.walk === step, past: step >= 3 || (r.walk !== undefined && r.walk < step) }"
        >
          <span class="day ns-mono">{{ r.day }}</span>
          <span class="name">{{ r.name }}</span>
          <span class="rid ns-mono">{{ r.id }}</span>
        </li>
      </ol>
    </aside>
  </div>
</template>

<style scoped>
.lc {
  height: 510px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 372px;
  gap: 30px;
}

.term {
  min-width: 0;
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
  padding: 11px 18px;
  border-bottom: 1px solid #333;
  font-size: 15px;
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

.frames {
  flex: 1;
  display: grid;
  padding: 16px 22px 18px;
  min-height: 0;
}

.frame {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: opacity 450ms var(--ns-ease);
}

.frame:not(.on) {
  opacity: 0;
  pointer-events: none;
}

.frame p {
  margin: 0;
  max-width: none;
  font-size: 17px;
  line-height: 1.6;
}

.who b,
.after b {
  color: var(--ns-frozen);
  font-weight: 700;
  margin-right: 6px;
}

.who {
  color: #bdbdbd;
}

.diff {
  color: var(--ns-frozen);
  padding-left: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cmd {
  margin-top: 10px !important;
  color: #8f8f8f;
}

.frame .cmd:first-child {
  margin-top: 0 !important;
}

.cmd em,
.steps em {
  font-style: normal;
  color: #6f6f6f;
  margin-left: 12px;
}

.steps {
  display: flex;
  gap: 22px;
  padding-left: 16px;
}

.steps.col {
  flex-direction: column;
  gap: 0;
}

.ok { color: var(--ns-frozen); }
.bad { color: #ff9d8f; }

.err {
  margin: 10px 0 0 16px;
  padding: 12px 16px 13px;
  border: 1px solid rgba(255, 120, 100, 0.45);
  background: rgba(222, 30, 5, 0.12);
}

.err .id {
  color: #ff9d8f;
}

.err .what {
  margin-top: 2px !important;
  color: #fff;
  font-family: var(--z-font-text);
  font-size: 20px !important;
  font-weight: 700;
  line-height: 1.3 !important;
}

.err dl {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 3px 8px;
  margin: 8px 0 0;
  font-family: var(--z-font-text);
  font-size: 18px;
  line-height: 1.34;
}

.err dt {
  color: var(--ns-frozen);
  font-weight: 700;
}

.err dt.dont {
  color: #ff9d8f;
}

.err dd {
  margin: 0;
  color: #e6e6e6;
}

.after {
  margin-top: auto !important;
  color: #bdbdbd;
}

.after .ok {
  margin-left: 12px;
}

.rec {
  padding-left: 16px;
  color: #8f8f8f;
}

.cmd.gap {
  margin-top: 18px !important;
}

.done {
  margin-top: auto !important;
  color: #fff;
  font-family: var(--z-font-text);
  font-weight: 800;
  font-size: 22px !important;
}

.rail {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.rail h3 {
  margin: 0 0 10px;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
}

.rail ol {
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.rail li {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  column-gap: 8px;
  padding: 6px 12px 7px;
  border-left: 4px solid var(--ns-line);
  background: transparent;
  transition: background 400ms var(--ns-ease), border-color 400ms var(--ns-ease);
}

.day {
  grid-row: 1 / 3;
  padding-top: 3px;
  font-size: 15px;
  color: var(--z-grey-600);
}

.name {
  font-size: 19px;
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
  color: var(--z-ink-800);
}

.rid {
  font-size: 14px;
  color: var(--z-grey-600);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rail li.past {
  border-left-color: var(--ns-teal);
}

.rail li.on {
  border-left-color: var(--ns-red);
  background: #fff5f3;
}

.rail li.on .name {
  color: var(--z-ink);
  font-weight: 800;
}

</style>
