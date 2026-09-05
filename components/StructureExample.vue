<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

const lines = [
  '---',
  'date: "2026-09-05T12:00:00Z"',
  'author: opencode',
  'type: structure-outline',
  'topic: "Cancel an active agent run"',
  'status: draft',
  'related_research: ".opencode/thoughts/rpi/run-cancel/research.md"',
  'related_design: ".opencode/thoughts/rpi/run-cancel/design.md"',
  '---',
  '',
  '# Cancel an active agent run',
  '',
  '## Design Summary',
  '',
  '- A user can cancel a running job from the project view.',
  '- Cancellation is idempotent and ends in an explicit `cancelled` state.',
  '',
  '## Patterns To Follow',
  '',
  '- Command handling: `src/server/runs/retryRun.ts`',
  '- Run actions: `src/ui/run/RunActions.tsx`',
  '',
  '## Phase Outline',
  '',
  '### Phase 1: Cancel one active run end to end',
  '',
  '- Goal: A running job can be cancelled and observed as cancelled.',
  '- Summary: Add the command, API route and project-view action as one slice.',
  '- Why this phase exists now: It proves the full path before hardening it.',
  '',
  '#### File Changes',
  '',
  '- `src/server/runs/cancelRun.ts`: stop the worker and persist `cancelled`.',
  '- `src/api/runs/[runId]/cancel.ts`: expose the idempotent command.',
  '- `src/ui/run/RunActions.tsx`: show Cancel only for active runs.',
  '- `tests/runs/cancelRun.test.ts`: cover running and terminal states.',
  '',
  '#### Validation',
  '',
  '- API test proves repeated cancellation is safe.',
  '- Browser check proves the action disappears and status updates.',
  '- Existing tests, lint, types and build pass.',
  '',
  '#### Phase Boundary',
  '',
  '- Retry, bulk cancellation and history filtering stay out.',
  '',
  '### Phase 2: Harden failures and reconnects',
  '',
  '- Goal: Cancellation remains correct when the worker is slow or disconnected.',
  '- File changes: add timeout handling, recovery and visible failure states.',
  '- Validation: exercise delayed acknowledgement and browser reconnect.',
  '',
  '## Risks Or Ordering Notes',
  '',
  '- Confirm whether the worker already exposes an abort signal.',
]

const steps = [
  { at: 0, start: 1, end: 16, label: 'Intent and approved direction' },
  { at: 1, start: 18, end: 21, label: 'Existing patterns with exact file references' },
  { at: 2, start: 25, end: 29, label: 'A slice with a meaningful verification boundary' },
  { at: 3, start: 31, end: 36, label: 'Concrete files and responsibilities' },
  { at: 4, start: 38, end: 45, label: 'Observable validation and explicit exclusions' },
  { at: 5, start: 47, end: 54, label: 'The next slice and unresolved risk' },
]

const pane = ref<HTMLElement>()
const lineElements = ref<HTMLElement[]>([])
const { $clicks, $clicksContext } = useSlideContext()
const registrationKey = {}

const activeStep = computed(() => {
  const click = Math.max($clicks.value, 0)
  return [...steps].reverse().find(step => step.at <= click) ?? steps[0]
})

function setLineElement(element: unknown, index: number) {
  if (element instanceof HTMLElement)
    lineElements.value[index] = element
}

function lineKind(line: string) {
  if (line === '---')
    return 'frontmatter-rule'
  if (line.startsWith('### '))
    return 'heading-three'
  if (line.startsWith('## '))
    return 'heading-two'
  if (line.startsWith('# '))
    return 'heading-one'
  if (/^[a-z_]+:/.test(line))
    return 'frontmatter-key'
  if (line.includes('`'))
    return 'contains-path'
  return ''
}

function syncScroll() {
  nextTick(() => {
    const step = activeStep.value
    const targetLine = Math.floor((step.start + step.end) / 2) - 1
    const target = lineElements.value[targetLine]
    const container = pane.value

    if (!target || !container)
      return

    const top = Math.max(
      0,
      target.offsetTop
        - container.offsetTop
        - container.clientHeight / 2
        + target.offsetHeight / 2,
    )
    container.scrollTo({ top, behavior: 'smooth' })
  })
}

watch($clicks, syncScroll, { flush: 'post' })

onMounted(() => {
  $clicksContext.register(registrationKey, $clicksContext.calculateSince(1, 5))
  syncScroll()
})

onBeforeUnmount(() => {
  $clicksContext.unregister(registrationKey)
})
</script>

<template>
  <div class="structure-code-shell">
    <div class="structure-code-header">
      <span>structure.md</span>
      <strong>{{ activeStep.label }}</strong>
    </div>
    <pre ref="pane" class="structure-code"><code><span
      v-for="(line, index) in lines"
      :key="index"
      :ref="element => setLineElement(element, index)"
      class="structure-code-line"
      :class="[
        lineKind(line),
        {
          'is-active': index + 1 >= activeStep.start && index + 1 <= activeStep.end,
          'is-muted': index + 1 < activeStep.start || index + 1 > activeStep.end,
        },
      ]"
    ><span class="structure-line-number">{{ String(index + 1).padStart(2, '0') }}</span><span>{{ line || ' ' }}</span></span></code></pre>
  </div>
</template>
