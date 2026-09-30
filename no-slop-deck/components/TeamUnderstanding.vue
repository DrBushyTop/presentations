<!--
  The plan has to work for the team, not only the author.
  Left: Honeycomb's Tenant team, before and after reviewing plans together.
  Right: Anthropic's learning study, where debugging showed the largest gap.
  0 producers and reviewers · 1 team plan review · 2 the debugging gap · 3 two questions
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
</script>

<template>
  <div class="team">
    <section class="hc">
      <header>Honeycomb's Tenant team</header>

      <div class="row split">
        <div class="pic" aria-hidden="true">
          <span class="who"><Icon name="user" /><small>Producer</small></span>
          <span class="prs"><i v-for="n in 3" :key="n" class="ns-mono">PR</i><Icon name="arrow" /></span>
          <span class="who"><Icon name="user" /><small>Reviewer</small></span>
        </div>
        <p>"Knowledge concentration got amplified."</p>
      </div>

      <div class="row joint" :class="{ on: step >= 1 }">
        <div class="pic" aria-hidden="true">
          <span class="who"><Icon name="user" /></span>
          <span class="plan ns-mono">plan.md</span>
          <span class="who"><Icon name="user" /></span>
          <span class="who"><Icon name="user" /></span>
        </div>
        <p>Review the plan together: "everyone was more aware of what was happening."</p>
      </div>
    </section>

    <section class="an" :class="{ on: step >= 2 }">
      <header>Anthropic learning study</header>
      <small class="cap">Quiz after learning a new library</small>
      <div class="bars">
        <div class="bar"><span class="v ns-mono">67%</span><div style="height: 67%" /><small>Coded by hand</small></div>
        <div class="bar ai"><span class="v ns-mono">50%</span><div style="height: 50%" /><small>With AI help</small></div>
      </div>
      <p>The largest gap was on <b>debugging</b> questions.</p>
    </section>

    <div class="ask" :class="{ on: step >= 3 }">
      <b>Before approving a plan</b>
      <span>What user problem justifies this code?</span>
      <span>Could someone else explain it and debug a failure?</span>
    </div>
  </div>
</template>

<style scoped>
.team {
  height: 510px;
  display: grid;
  grid-template-columns: 1fr 400px;
  grid-template-rows: 1fr auto;
  column-gap: 44px;
  row-gap: 22px;
}

header {
  font-size: 22px;
  font-weight: 800;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--z-ink);
}

.hc {
  display: grid;
  grid-template-rows: auto 1fr 1fr;
}

.row {
  display: grid;
  grid-template-columns: 340px 1fr;
  align-items: center;
  gap: 26px;
  border-bottom: 1px solid var(--ns-line);
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.row p {
  margin: 0;
  font-size: 23px;
  line-height: 1.3;
  font-weight: 700;
  max-width: none;
}

.split p {
  color: var(--ns-red);
}

.joint p {
  color: var(--ns-teal);
}

.joint:not(.on) {
  opacity: 0;
  transform: translateY(12px);
}

.pic {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.who {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 40px;
  color: var(--z-ink);
}

.who small {
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
}

.prs {
  flex: 1;
  display: flex;
  gap: 8px;
  justify-content: center;
  padding-bottom: 24px;
}

.prs {
  align-items: center;
  font-size: 22px;
}

.prs i {
  padding: 2px 6px;
  font-style: normal;
  font-size: 16px;
  font-weight: 700;
  background: var(--ns-soft);
  border: 2px solid var(--z-ink);
}

.cap {
  font-size: var(--ns-label);
  color: var(--z-grey-600);
}

.plan {
  padding: 8px 12px;
  background: #e3f4f6;
  border: 2px solid var(--ns-teal);
  font-size: var(--ns-label);
  font-weight: 700;
}

.joint .who {
  color: var(--ns-teal);
}

.an {
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.an:not(.on) {
  opacity: 0;
  transform: translateY(12px);
}

.bars {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 26px;
  align-items: end;
  padding-top: 10px;
}

.bar {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 6px;
}

.bar div {
  background: #9a9a97;
  transition: height 1200ms var(--ns-ease);
}

.bar.ai div {
  background: var(--ns-red);
}

.bar .v {
  font-size: 28px;
  font-weight: 700;
}

.bar small {
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
}

.an p {
  margin: 0;
  font-size: 22px;
  line-height: 1.3;
  max-width: none;
}

.ask {
  grid-column: 1 / -1;
  display: flex;
  align-items: baseline;
  gap: 28px;
  padding: 16px 22px;
  background: var(--z-ink);
  color: #fff;
  transition: opacity 600ms var(--ns-ease);
}

.ask:not(.on) {
  opacity: 0;
}

.ask b {
  font-size: var(--ns-label);
  color: #bdbdbd;
  white-space: nowrap;
}

.ask span {
  font-size: 23px;
  font-weight: 800;
}
</style>
