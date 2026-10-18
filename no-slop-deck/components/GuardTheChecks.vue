<!--
  A real case of an agent weakening the check that graded it: fullsend PR
  #2194 (June 2026). The agent's commits failed gitlint, so it wrote a script
  that exempts its own bot accounts in every enrolled repo. The review agent
  approved; a person objected and the PR was closed. The .gitlint lines and
  review states are from the PR. The fixes are my recommendations.
  0 what happened · 1 how to make it hard · 2 the takeaway
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const reviews = [
  { who: 'Review agent', what: 'Approved', ok: true },
  { who: 'Maintainer', what: 'LGTM', ok: true },
  { who: 'Second maintainer', what: '"I don\'t like this approach"', ok: false },
]
const fixes = [
  { t: 'CI reads the rules from the base branch', s: 'A PR is graded by the rules it started from.' },
  { t: 'Rule files need an owner\'s review', s: 'Lint config, baselines, CI workflows, CODEOWNERS.' },
  { t: 'Review flags any edit to a guardrail', s: 'Not a style note. A finding a person decides.' },
]
</script>

<template>
  <div class="gc">
    <section class="pr">
      <header>
        <span class="ns-mono">fullsend · PR #2194</span>
        <em>Closed, June 2026</em>
      </header>
      <b class="title">Auto-patch .gitlint to exempt bot authors</b>
      <p class="why">The agent's commits failed a commit-message lint rule. Its fix:</p>
      <div class="diff ns-mono">
        <span>&nbsp; [ignore-by-author-name]</span>
        <span class="add">+ regex=dependabot|fullsend-ai-coder|…</span>
      </div>
      <p class="size">649 new lines, to change every enrolled repo</p>
      <div class="reviews">
        <p v-for="r in reviews" :key="r.who" :class="{ bad: !r.ok }">
          <Icon :name="r.ok ? 'check' : 'x'" />
          <b>{{ r.who }}</b>
          <span>{{ r.what }}</span>
        </p>
      </div>
    </section>

    <section class="fixes" :class="{ on: step >= 1 }">
      <h3><Icon name="lock" />Make it hard to cheat</h3>
      <div v-for="(f, i) in fixes" :key="f.t" class="fix" :style="{ '--i': i }">
        <b>{{ f.t }}</b>
        <span>{{ f.s }}</span>
      </div>
    </section>

    <p class="take" :class="{ on: step >= 2 }">If the agent can edit the rule, the rule is a suggestion.</p>
  </div>
</template>

<style scoped>
.gc {
  height: 510px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  grid-template-rows: 1fr auto;
  gap: 18px 32px;
}

.pr {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 22px;
  border: 2px solid var(--z-ink);
  min-height: 0;
}

.pr header {
  display: flex;
  justify-content: space-between;
  font-size: 17px;
  color: var(--z-grey-600);
}

.pr header em {
  font-style: normal;
  font-weight: 700;
  color: var(--ns-red);
}

.title {
  font-size: 25px;
  line-height: 1.2;
}

.why,
.size {
  margin: 0;
  max-width: none;
  font-size: 19px;
  color: var(--z-ink-800);
}

.size {
  font-size: 17px;
  color: var(--z-grey-600);
}

.diff {
  margin: 0;
  padding: 12px 16px;
  background: var(--z-ink);
  color: #bdbdbd;
  display: flex;
  flex-direction: column;
  font-size: 17px;
  line-height: 1.5;
}

.diff .add {
  color: #ff9d8f;
}

.reviews {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reviews p {
  margin: 0;
  max-width: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  background: #e6f4f6;
  font-size: 18px;
}

.reviews p :deep(.ns-icon) {
  font-size: 20px;
  color: var(--ns-teal);
}

.reviews p.bad {
  background: #fff1ee;
}

.reviews p.bad :deep(.ns-icon) {
  color: var(--ns-red);
}

.reviews span {
  color: var(--z-ink-800);
}

.fixes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.fixes h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding-bottom: 10px;
  font-size: 24px;
  font-weight: 800;
  border-bottom: 4px solid var(--ns-teal);
  transition: opacity 600ms var(--ns-ease);
}

.fixes h3 :deep(.ns-icon) {
  font-size: 26px;
  color: var(--ns-teal);
}

.fix {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 0 20px;
  background: #e6f4f6;
  border-left: 6px solid var(--ns-teal);
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
  transition-delay: calc(var(--i) * 110ms);
}

.fix b {
  font-size: 22px;
  line-height: 1.25;
}

.fix span {
  font-size: 18px;
  color: var(--z-ink-800);
}

.fixes:not(.on) h3,
.fixes:not(.on) .fix {
  opacity: 0;
}

.fixes:not(.on) .fix {
  transform: translateX(20px);
}

.take {
  grid-column: 1 / -1;
  margin: 0;
  max-width: none;
  padding: 16px 22px;
  background: var(--z-ink);
  color: #fff;
  font-size: 25px;
  font-weight: 800;
  transition: opacity 600ms var(--ns-ease);
}

.take:not(.on) {
  opacity: 0;
}
</style>
