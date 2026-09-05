<script setup lang="ts">
import MarkdownScroller from './MarkdownScroller.vue'
import source from '../examples/impeccable-skill.md?raw'

const lines = source.trimEnd().split('\n')
const steps = [
  { at: 0, start: 1, end: 18, label: 'Scope and quality bar' },
  { at: 1, start: 20, end: 24, label: 'Load context and one playbook' },
  { at: 2, start: 26, end: 30, label: 'Preserve or deliberately redesign' },
  { at: 3, start: 32, end: 41, label: 'Choose the mode from the surface' },
  { at: 4, start: 43, end: 59, label: 'Commands route the work' },
  { at: 5, start: 60, end: 76, label: 'Each verb loads focused instructions' },
  { at: 6, start: 71, end: 86, label: 'Routing handles the rest' },
]
</script>

<template>
  <MarkdownScroller filename="skills/impeccable/SKILL.md" :lines="lines" :steps="steps" wrap />
</template>
