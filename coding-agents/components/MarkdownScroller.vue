<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

type MarkdownStep = {
  at: number
  start: number
  end: number
  label: string
}

const props = withDefaults(defineProps<{
  filename: string
  lines: string[]
  steps: MarkdownStep[]
  wrap?: boolean
}>(), {
  wrap: false,
})

const pane = ref<HTMLElement>()
const lineElements = ref<HTMLElement[]>([])
const { $clicks, $clicksContext } = useSlideContext()
const registrationKey = {}

const activeStep = computed(() => {
  const click = Math.max($clicks.value, 0)
  return [...props.steps].reverse().find(step => step.at <= click) ?? props.steps[0]
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
  if (/^[a-z-]+:/.test(line))
    return 'frontmatter-key'
  if (line.startsWith('|'))
    return 'table-row'
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
  const lastClick = Math.max(0, ...props.steps.map(step => step.at))
  if (lastClick > 0)
    $clicksContext.register(registrationKey, $clicksContext.calculateSince(1, lastClick))
  syncScroll()
})

onBeforeUnmount(() => {
  $clicksContext.unregister(registrationKey)
})
</script>

<template>
  <div class="structure-code-shell" :class="{ 'is-wrapped': wrap }">
    <div class="structure-code-header">
      <span>{{ filename }}</span>
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
