<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

type MermaidStep = {
  at?: number
  nodes?: string[]
  focusNodes?: string[]
  edges?: string[]
}

const props = defineProps<{
  steps: MermaidStep[]
}>()

const anchor = ref<HTMLElement>()
const { $clicks, $clicksContext } = useSlideContext()
const registrationKey = {}

let frame = 0
let attempts = 0
let observedRoot: ShadowRoot | undefined
let rootObserver: MutationObserver | undefined

function registerClicks() {
  const lastClick = Math.max(
    0,
    ...props.steps.map((step, index) => step.at ?? index),
  )

  if (lastClick > 0)
    $clicksContext.register(registrationKey, $clicksContext.calculateSince(1, lastClick))
}

function findNode(svg: SVGElement, id: string) {
  return [...svg.querySelectorAll<SVGGElement>('g.node')]
    .find(node => node.id.includes(`-flowchart-${id}-`))
}

function findEdge(svg: SVGElement, edge: string) {
  const [from, to] = edge.split('->')
  if (!from || !to)
    return

  return [...svg.querySelectorAll<SVGPathElement>('path.flowchart-link')]
    .find(path => path.id.includes(`-L_${from}_${to}_`))
}

function findEdgeLabel(svg: SVGElement, edgePath: SVGPathElement) {
  const labelIdStart = edgePath.id.indexOf('L_')
  if (labelIdStart < 0)
    return

  const labelId = edgePath.id.slice(labelIdStart)

  return [...svg.querySelectorAll<SVGGElement>('g.edgeLabels > g.edgeLabel')]
    .find(group => group.querySelector<SVGGElement>('g.label')?.dataset.id === labelId)
    ?.querySelector<SVGForeignObjectElement>('foreignObject')
}

function ensureStyles(root: ShadowRoot) {
  if (root.querySelector('#zure-mermaid-steps'))
    return

  const style = document.createElement('style')
  style.id = 'zure-mermaid-steps'
  style.textContent = `
    .z-mermaid-step-target {
      opacity: 0.1;
      transition:
        opacity 220ms cubic-bezier(0.16, 1, 0.3, 1),
        filter 220ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .z-mermaid-step-revealed {
      opacity: 1;
    }

    g.node.z-mermaid-step-current {
      filter: drop-shadow(0 5px 8px color-mix(in srgb, var(--z-accent) 16%, transparent));
    }

    g.node.z-mermaid-step-current :is(rect, polygon, path, circle, ellipse) {
      stroke: var(--z-accent) !important;
      stroke-width: 3px !important;
    }

    path.flowchart-link.z-mermaid-step-current {
      stroke: var(--z-accent) !important;
      stroke-width: 3px !important;
      stroke-dasharray: var(--z-mermaid-path-length);
      animation: z-mermaid-draw 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    foreignObject.z-mermaid-step-edge-label {
      opacity: 0.1 !important;
      transition:
        opacity 220ms cubic-bezier(0.16, 1, 0.3, 1),
        color 220ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    foreignObject.z-mermaid-step-edge-label.z-mermaid-step-revealed {
      opacity: 1 !important;
    }

    foreignObject.z-mermaid-step-edge-label.z-mermaid-step-current .edgeLabel {
      color: var(--z-accent) !important;
    }

    @keyframes z-mermaid-draw {
      from { stroke-dashoffset: var(--z-mermaid-path-length); }
      to { stroke-dashoffset: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .z-mermaid-step-target {
        transition: opacity 100ms linear;
      }

      path.flowchart-link.z-mermaid-step-current {
        animation: none;
      }
    }
  `
  root.append(style)
}

function observeMermaid(root: ShadowRoot) {
  if (observedRoot === root)
    return

  rootObserver?.disconnect()
  observedRoot = root
  rootObserver = new MutationObserver(() => applyStepState())
  rootObserver.observe(root, { childList: true, subtree: true })
}

function applyStepState() {
  const host = anchor.value?.parentElement?.querySelector<HTMLElement>('.mermaid')
  const root = host?.shadowRoot
  const svg = root?.querySelector<SVGElement>('svg')

  if (!root || !svg)
    return false

  observeMermaid(root)
  ensureStyles(root)

  const nodes = new Map<string, SVGGElement>()
  const edges = new Map<string, {
    path: SVGPathElement
    label?: SVGForeignObjectElement
  }>()

  for (const step of props.steps) {
    for (const id of step.nodes ?? []) {
      const node = findNode(svg, id)
      if (node)
        nodes.set(id, node)
    }
    for (const id of step.focusNodes ?? []) {
      const node = findNode(svg, id)
      if (node)
        nodes.set(id, node)
    }
    for (const edgeId of step.edges ?? []) {
      const path = findEdge(svg, edgeId)
      if (path) {
        edges.set(edgeId, {
          path,
          label: findEdgeLabel(svg, path),
        })
      }
    }
  }

  const currentClick = Math.max($clicks.value, 0)
  let activeIndex = -1

  for (const [index, step] of props.steps.entries()) {
    if ((step.at ?? index) <= currentClick)
      activeIndex = index
  }

  const revealedNodes = new Set<string>()
  const revealedEdges = new Set<string>()

  for (let index = 0; index <= activeIndex; index++) {
    const step = props.steps[index]
    for (const id of step.nodes ?? [])
      revealedNodes.add(id)
    for (const edgeId of step.edges ?? [])
      revealedEdges.add(edgeId)
  }

  const activeStep = props.steps[activeIndex]
  const currentNodes = new Set(activeStep?.focusNodes ?? activeStep?.nodes ?? [])
  const currentEdges = new Set(activeStep?.edges ?? [])

  for (const [id, node] of nodes) {
    node.classList.add('z-mermaid-step-target')
    node.classList.toggle('z-mermaid-step-revealed', revealedNodes.has(id))
    node.classList.toggle('z-mermaid-step-current', currentNodes.has(id))
  }

  for (const [id, edge] of edges) {
    const revealed = revealedEdges.has(id)
    const current = currentEdges.has(id)

    edge.path.classList.add('z-mermaid-step-target', 'z-mermaid-step-edge')
    edge.path.classList.toggle('z-mermaid-step-revealed', revealed)
    edge.path.classList.toggle('z-mermaid-step-current', current)

    edge.label?.classList.add('z-mermaid-step-target', 'z-mermaid-step-edge-label')
    edge.label?.classList.toggle('z-mermaid-step-revealed', revealed)
    edge.label?.classList.toggle('z-mermaid-step-current', current)

    if (!edge.path.style.getPropertyValue('--z-mermaid-path-length'))
      edge.path.style.setProperty('--z-mermaid-path-length', `${Math.ceil(edge.path.getTotalLength())}`)
  }

  return true
}

function scheduleUpdate() {
  cancelAnimationFrame(frame)
  attempts = 0

  if (applyStepState())
    return

  const update = () => {
    if (applyStepState() || attempts++ > 120)
      return
    frame = requestAnimationFrame(update)
  }

  nextTick(update)
}

watch($clicks, scheduleUpdate, { flush: 'sync' })
onMounted(() => {
  registerClicks()
  scheduleUpdate()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  rootObserver?.disconnect()
  $clicksContext.unregister(registrationKey)
})
</script>

<template>
  <span ref="anchor" class="mermaid-steps-controller" aria-hidden="true" />
</template>

<style scoped>
.mermaid-steps-controller {
  display: none;
}
</style>
