<!--
  The plan has to work for the team, not only the author.
  Left: Honeycomb's Tenant team, before and after reviewing plans together.
  Right: a question about my repo three weeks after a decision. Someone who
  didn't build it answers from the decision log. The decision is the repo's
  (docs/decisions.md, 17 Oct); the conversation is illustrative.
  0 producers and reviewers · 1 team plan review · 2 three weeks later · 3 the question
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

    <section class="later" :class="{ on: step >= 2 }">
      <header>Three weeks later</header>
      <div class="msg q">
        <small><Icon name="user" />A researcher</small>
        <p>"Why did my session stop recording the screen?"</p>
      </div>
      <div class="msg a">
        <small><Icon name="user" />On call, didn't build it</small>
        <p>"It hit its 2 GiB budget. Only the screen stops; voice keeps going. We decided that in plan review."</p>
        <span class="ns-mono">docs/decisions.md · 17 Oct</span>
      </div>
    </section>

    <div class="ask" :class="{ on: step >= 3 }">
      <b>Before approving a plan</b>
      <span>Could someone other than the author explain it and debug a failure?</span>
    </div>
  </div>
</template>

<style scoped>
.team {
  height: 510px;
  display: grid;
  grid-template-columns: 1fr 440px;
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

.later {
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.later:not(.on) {
  opacity: 0;
  transform: translateY(12px);
}

.msg {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
}

.msg small {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
}

.msg small :deep(.ns-icon) {
  font-size: 20px;
}

.msg p {
  margin: 0;
  max-width: none;
  font-size: 23px;
  line-height: 1.3;
  font-weight: 700;
}

.msg.q {
  background: #fff1ee;
  border-left: 6px solid var(--ns-red);
}

.msg.a {
  flex: 1;
  background: #e6f4f6;
  border-left: 6px solid var(--ns-teal);
}

.msg.a small :deep(.ns-icon) {
  color: var(--ns-teal);
}

.msg.a span {
  margin-top: auto;
  align-self: flex-start;
  padding: 4px 10px;
  background: #fff;
  font-size: 16px;
  font-weight: 700;
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
