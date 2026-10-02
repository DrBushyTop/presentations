<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })
</script>

<template>
  <div class="research-map">
    <section class="facts">
      <header>What the research describes</header>
      <div :class="{ checked: step >= 1 }"><b>The session identifies the team.</b><span>Server-side session → user → team</span></div>
      <div :class="{ checked: step >= 2 }"><b>The list route applies the team filter.</b><span>The shared query uses the filters it receives.</span></div>
      <div :class="{ checked: step >= 3 }"><b>The app has a list, not an export.</b><span>Existing behavior is the starting point for design.</span></div>
    </section>
    <section class="path">
      <div class="node session" :class="{ lit: step >= 1 }"><small>Session</small><b class="ns-mono">Alex → team-a</b></div>
      <span class="arrow">↓</span>
      <div class="node" :class="{ lit: step >= 2 }"><small>List route</small><b class="ns-mono">findTasks({ teamId })</b><span>The team comes from the session.</span></div>
      <span class="arrow">↓</span>
      <div class="node" :class="{ lit: step >= 2 }"><small>Shared query</small><b class="ns-mono">WHERE team_id = ?</b><span>The route supplies the parameter.</span></div>
      <p :class="{ visible: step >= 3 }">A map of today's behavior, with references back to the code.</p>
    </section>
  </div>
</template>

<style scoped>
.research-map { height: 480px; display: grid; grid-template-columns: 1fr 1fr; gap: 44px; }
.facts { display: grid; grid-template-rows: 52px repeat(3, 1fr); border: 1px solid var(--ns-line); }header { font-size: 20px; font-weight: 700; padding: 15px 22px; border-bottom: 1px solid var(--ns-line); }.facts > div { padding: 24px 22px; display: flex; flex-direction: column; justify-content: center; gap: 10px; border-bottom: 1px solid var(--ns-line); transition: background 400ms; }.facts b { font-size: 25px; line-height: 1.25; }.facts span { font-size: 21px; line-height: 1.3; color: var(--z-grey-600); }.facts .checked { background: #e8f6f8; }
.path { display: flex; flex-direction: column; }.node { border: 2px solid var(--z-ink); padding: 10px 20px; display: flex; flex-direction: column; gap: 5px; transition: background 400ms, border-color 400ms; }.node small { font-size: 18px; font-weight: 700; color: var(--z-grey-600); }.node b { font-size: 23px; }.node span { font-size: 20px; }.node.lit { background: #e8f6f8; border-color: var(--ns-teal); }.session { background: var(--z-ink); color: white; }.session small { color: #bdbdbd; }.session.lit { color: var(--z-ink); }.session.lit small { color: var(--z-grey-600); }.arrow { align-self: center; font-size: 24px; line-height: 1.2; color: var(--ns-teal); }.path p { margin: auto 0 0; padding: 14px 20px; background: var(--z-ink); color: #fff; max-width: none; font-size: 22px; line-height: 1.3; font-weight: 800; opacity: 0; transition: opacity 500ms var(--ns-ease); }.path p.visible { opacity: 1; }
</style>
