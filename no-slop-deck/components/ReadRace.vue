<!--
  Agent output against human reading pace, running live.
  GitHub Next's Chopin estimate: people read about 238 words a minute; model
  output runs about 15 times faster. 0 idle · 1 race runs · 2 the backlog
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useClock, useIsActive } from '../lib/active'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const READ_WPS = 238 / 60
const WRITE_WPS = READ_WPS * 15

const corpus = (`I traced how the task list derives the current team and reused the same query for the export.
The new endpoint streams rows as CSV with a header, escapes commas and quotes, and adds a byte order mark so the file opens cleanly in spreadsheet tools.
I added tests for the header, for my team's tasks and for escaping. All 24 tests pass. I also tidied the serializer, renamed two helpers for clarity and updated the README with an example request.
The change is small and self-contained. It follows existing patterns in the codebase and should be safe to merge. Next I can add pagination for very large teams, a background job for exports over ten thousand rows and an audit event for each download.
I reviewed the diff again and found no issues. The query accepts an optional team identifier so administrators can export other teams when needed, falling back to the session team for everyone else.`)
  .split(/\s+/)

const active = useIsActive()
const t = useClock(() => active.value && props.step >= 1)

const written = computed(() => Math.floor(t.value * WRITE_WPS))
const read = computed(() => Math.floor(t.value * READ_WPS))
const backlog = computed(() => Math.max(0, written.value - read.value))

const agentWords = computed(() => {
  const out: string[] = []
  const start = Math.max(0, written.value - 150)
  for (let i = start; i < written.value; i++) out.push(corpus[i % corpus.length])
  return out
})

const humanWords = computed(() => corpus.slice(0, 96))
const fmt = (n: number) => n.toLocaleString('en-US')
</script>

<template>
  <div class="race">
    <section class="lane agent">
      <header><span>Agent writes</span><b class="ns-mono">{{ fmt(written) }}</b></header>
      <div class="text"><p>{{ agentWords.join(' ') }}</p></div>
    </section>
    <section class="lane human">
      <header><span>You read</span><b class="ns-mono">{{ fmt(read) }}</b></header>
      <div class="text"><p><template v-for="(w, i) in humanWords" :key="i"><span :class="{ read: i < read, at: i === read }">{{ w }}</span>{{ ' ' }}</template></p></div>
    </section>
    <div class="backlog" :class="{ on: step >= 2 }" style="view-transition-name: ns-backlog">
      <span class="n ns-mono">{{ fmt(backlog) }}</span>
      <span class="l">words nobody has read yet</span>
      <span class="x">15×</span>
    </div>
  </div>
</template>

<style scoped>
.race {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  gap: 18px 22px;
  height: 500px;
}

.lane {
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--ns-line);
}

.lane header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 14px 20px;
  font-size: 20px;
  font-weight: 700;
  border-bottom: 1px solid var(--ns-line);
}

.lane header b {
  font-size: 22px;
  font-variant-numeric: tabular-nums;
}

.agent {
  background: var(--z-ink);
  color: #fff;
  border-color: var(--z-ink);
}

.agent header {
  border-color: #333;
}

.agent header b {
  color: var(--ns-frozen);
}

.text {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.agent .text {
  mask-image: linear-gradient(to bottom, transparent, #000 45%);
}

.human .text {
  justify-content: flex-start;
}

.text p {
  margin: 0;
  font-size: 17px;
  line-height: 1.55;
  max-width: none;
}

.agent .text p {
  color: #cfcfcf;
}

.human .text span {
  color: #b5b5b5;
  transition: color 200ms linear;
}

.human .text span.read {
  color: var(--z-ink);
}

.human .text span.at {
  background: var(--ns-teal);
  color: #fff;
}

.backlog {
  grid-column: 1 / -1;
  display: flex;
  align-items: baseline;
  gap: 18px;
  padding: 14px 24px;
  background: var(--ns-red);
  color: #fff;
  transition: opacity 500ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.backlog:not(.on) {
  opacity: 0;
  transform: translateY(14px);
}

.backlog .n {
  font-size: 40px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 4.2ch;
}

.backlog .l {
  font-size: 24px;
  font-weight: 700;
  flex: 1;
}

.backlog .x {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
</style>
