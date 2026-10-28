<!--
  The plan has to work for the team, not only the author. Honeycomb's Tenant
  team, before and after reviewing plans together.
  0 producers and reviewers · 1 team plan review · 2 the question
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
</script>

<template>
  <div class="team">
    <section class="col split">
      <header>Split into producers and reviewers</header>
      <div class="pic" aria-hidden="true">
        <span class="who"><Icon name="user" /><small>Producer</small></span>
        <span class="prs"><i v-for="n in 3" :key="n" class="ns-mono">PR</i><Icon name="arrow" /></span>
        <span class="who"><Icon name="user" /><small>Reviewer</small></span>
      </div>
      <p>"Knowledge concentration got amplified."</p>
      <small class="cap">Each person knew more and more about less of the stack.</small>
    </section>

    <section class="col joint" :class="{ on: step >= 1 }">
      <header>Review the plan together</header>
      <div class="pic" aria-hidden="true">
        <span class="who"><Icon name="user" /></span>
        <span class="who"><Icon name="user" /></span>
        <span class="plan ns-mono">plan.md</span>
        <span class="who"><Icon name="user" /></span>
        <span class="who"><Icon name="user" /></span>
      </div>
      <p>"Everyone was more aware of what was happening."</p>
      <small class="cap">Now for the bigger and riskier changes, not every one.</small>
    </section>

    <div class="ask" :class="{ on: step >= 2 }">
      <b>Before approving a plan</b>
      <span>Could someone other than the author explain it and debug a failure?</span>
    </div>
  </div>
</template>

<style scoped>
.team {
  height: 510px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  column-gap: 44px;
  row-gap: 22px;
}

header {
  font-size: 22px;
  font-weight: 800;
  padding-bottom: 10px;
  border-bottom: 4px solid var(--ns-red);
}

.joint header {
  border-color: var(--ns-teal);
}

.col {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-bottom: 6px;
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.col p {
  margin: 0;
  font-size: 27px;
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

.cap {
  margin-top: auto;
  font-size: var(--ns-label);
  font-weight: 600;
  color: var(--z-grey-600);
}

.pic {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 12px;
  background: var(--ns-soft);
}

.who {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 56px;
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
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-bottom: 28px;
  font-size: 24px;
}

.prs i {
  padding: 2px 6px;
  font-style: normal;
  font-size: 17px;
  font-weight: 700;
  background: #fff;
  border: 2px solid var(--z-ink);
}

.plan {
  padding: 10px 14px;
  background: #e3f4f6;
  border: 2px solid var(--ns-teal);
  font-size: var(--ns-label);
  font-weight: 700;
}

.joint .who {
  color: var(--ns-teal);
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
