<!--
  Cover artwork: an agent writing faster than anyone can read. Fluent,
  confident output scrolls past; one line in it is the bug the talk is about.
-->
<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { prefersReducedMotion, useIsActive } from '../lib/active'

const script = [
  ['say', 'I traced the task list and reused its query.'],
  ['cmd', '$ git switch -c agent/export-csv'],
  ['add', '+ export async function exportTasks(req: Request) {'],
  ['add', '+   const session = await requireSession(req)'],
  ['bug', '+   const teamId = req.query.teamId ?? session.teamId'],
  ['add', '+   const rows = await db.tasks.findMany({ where: { teamId } })'],
  ['add', '+   return csv(rows, ["id", "title", "status", "due"])'],
  ['add', '+ }'],
  ['cmd', '$ npm test'],
  ['ok', '  ✓ exports CSV header (4 ms)'],
  ['ok', '  ✓ exports my team\'s tasks (11 ms)'],
  ['ok', '  ✓ escapes commas in titles (3 ms)'],
  ['ok', '  24 passed · 0 failed'],
  ['say', 'All tests pass. The export reuses the existing scoping.'],
  ['cmd', '$ gh pr create --fill'],
  ['say', 'Opened #482. Review bot: no issues found.'],
  ['add', '+ it("exports a UTF-8 BOM for Excel", async () => {'],
  ['add', '+   expect(res.headers["content-type"]).toContain("text/csv")'],
  ['add', '+ })'],
  ['say', 'I also tidied the serializer and renamed two helpers.'],
  ['add', '+ const toRow = (t: Task) => [t.id, t.title, t.status, t.due]'],
  ['ok', '  ✓ lint · ✓ typecheck · ✓ build'],
  ['say', 'Ready to merge. Summary: small, well-tested change.'],
] as const

const active = useIsActive()
const shown = ref<{ id: number, kind: string, text: string, typed: number }[]>([])
let timer = 0
let n = 0

function push() {
  const [kind, text] = script[n % script.length]
  shown.value.push({ id: n, kind, text, typed: 0 })
  if (shown.value.length > 26) shown.value.shift()
  n++
}

function frame() {
  const last = shown.value[shown.value.length - 1]
  if (!last || last.typed >= last.text.length) push()
  else last.typed = Math.min(last.text.length, last.typed + 5)
}

watch(active, (on) => {
  clearInterval(timer)
  if (!on) return
  if (prefersReducedMotion()) {
    while (shown.value.length < 22) push()
    shown.value.forEach(l => (l.typed = l.text.length))
    return
  }
  if (!shown.value.length) for (let i = 0; i < 14; i++) { push(); shown.value[shown.value.length - 1].typed = 999 }
  timer = window.setInterval(frame, 28)
}, { immediate: true })

onBeforeUnmount(() => clearInterval(timer))

const lines = computed(() => shown.value.map(l => ({ ...l, visible: l.text.slice(0, l.typed) })))
</script>

<template>
  <div class="stream" aria-hidden="true">
    <div class="rail">
      <div v-for="l in lines" :key="l.id" class="line" :class="l.kind">{{ l.visible }}</div>
    </div>
  </div>
</template>

<style scoped>
.stream {
  position: absolute;
  inset: 0;
  background: var(--z-ink);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 0 40px 48px;
  mask-image: linear-gradient(to bottom, transparent 0%, #000 42%);
}

.rail {
  width: 100%;
}

.line {
  font-family: var(--ns-mono);
  font-size: 15px;
  line-height: 1.75;
  white-space: pre;
  overflow: hidden;
  text-overflow: clip;
  color: #8c8c8c;
}

.line.say {
  font-family: var(--z-font-text);
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  margin: 6px 0;
}

.line.add {
  color: var(--z-teal-300);
}

.line.bug {
  color: var(--z-teal-300);
}

.line.ok {
  color: var(--ns-frozen);
}

.line.cmd {
  color: #c9c9c9;
}
</style>
