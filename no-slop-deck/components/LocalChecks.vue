<!--
  One of my repo's architecture rules failing at commit, the way an agent
  meets it. The rule id, message, Why and Don't are the repo's
  (tests/Discovery.Architecture.Tests/SourceRules.cs); the Fix line is
  shortened, and the edited file and line are illustrative.
  0 the agent edits and commits · 1 the failure, up close · 2 it fixes it
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
</script>

<template>
  <div class="lc" :class="'s' + Math.min(step, 2)">
    <section class="term ns-mono">
      <header><i /><i /><i /><span>my repo · agent worktree</span></header>
      <div class="body">
        <p class="who"><b>agent</b> edits Features/Findings/WriteFinding.cs</p>
        <p class="diff">+ using Discovery.Api.Features.Sessions;</p>
        <p class="cmd">$ git commit -m "Link findings to their session"</p>
        <p class="steps">
          <span class="ok">✓ format</span>
          <span class="ok">✓ build</span>
          <span class="arch">{{ step >= 1 ? '✗' : '…' }} architecture</span>
        </p>
      </div>
    </section>

    <section class="err">
      <p class="id ns-mono">✗ [feature-isolation] WriteFinding.cs:3</p>
      <p class="what">Features/Findings references Discovery.Api.Features.Sessions from Features/Sessions.</p>
      <dl>
        <dt>Fix</dt>
        <dd>Only Findings uses it: move it into Features/Findings/. Both use it: move it to Infrastructure/.</dd>
        <dt>Why</dt>
        <dd>Vertical slices: a feature changes and ships without editing another feature.</dd>
        <dt class="dont">Don't</dt>
        <dd>add a baseline/allowlist entry or weaken the rule to make this pass.</dd>
      </dl>
    </section>

    <p class="after ns-mono"><b>agent</b> moves the shared code to Infrastructure/, commits again <span class="ok">✓</span></p>
  </div>
</template>

<style scoped>
.lc {
  height: 510px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.term {
  background: var(--z-ink);
  color: #d6d6d6;
}

.term header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
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

.body {
  padding: 10px 24px 12px;
}

.body p,
.after {
  margin: 0;
  max-width: none;
  font-size: 20px;
  line-height: 1.5;
}

.who b,
.after b {
  color: var(--ns-frozen);
  margin-right: 8px;
}

.diff {
  padding-left: 18px;
  color: var(--ns-frozen);
}

.cmd {
  margin-top: 4px !important;
  color: #8f8f8f;
}

.steps {
  display: flex;
  gap: 26px;
  padding-left: 18px;
}

.ok { color: var(--ns-frozen); }
.arch { color: #8f8f8f; transition: color 300ms var(--ns-ease); }
.lc:not(.s0) .arch { color: #ff9d8f; }

/* The failure, large enough to read from the back of the room. */
.err {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  background: #fff;
  border: 2px solid var(--ns-line);
  border-left: 8px solid var(--ns-red);
  box-shadow: 0 14px 40px rgb(0 0 0 / 0.08);
  transition: opacity 500ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.lc.s0 .err {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}

.err p {
  margin: 0;
  max-width: none;
}

.id {
  font-size: 20px;
  color: var(--ns-red);
}

.what {
  font-size: 25px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.err dl {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 6px 14px;
  margin: 4px 0 0;
  font-size: 21px;
  line-height: 1.3;
}

.err dt {
  font-weight: 800;
  color: var(--ns-teal);
}

.err dt.dont {
  color: var(--ns-red);
}

.err dd {
  margin: 0;
  color: var(--z-ink-800);
}

.after {
  color: var(--z-ink-800);
  transition: opacity 500ms var(--ns-ease);
}

.after b {
  color: var(--ns-teal);
}

.after .ok {
  color: var(--ns-teal);
  margin-left: 10px;
}

.lc:not(.s2) .after {
  opacity: 0;
}
</style>
