<!--
  Persistent footer layer.

  Shows the deck title, current part, and slide number on regular slides.
  The cover is always clean. Section dividers, breaks and dark closing slides
  opt out with `nofooter: true` in their per-slide frontmatter.
-->
<template>
  <div v-if="showFooter" class="z-footer">
    <div class="z-track">
      <span>{{ deckTitle }}</span>
      <span v-if="part" class="on">{{ part }}</span>
    </div>
    <div class="z-no">
      {{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}
    </div>
  </div>
  <img v-if="showBrand" class="z-brand" :src="zureLogo" alt="Zure" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import zureLogo from './assets/zure-logo.svg?url'

const { $slidev } = useSlideContext()

const frontmatter = computed<Record<string, any>>(
  () => ($slidev?.nav?.currentSlideRoute?.meta?.slide?.frontmatter ?? {}) as Record<string, any>,
)

const showFooter = computed(
  () => $slidev.nav.currentPage > 1 && frontmatter.value.nofooter !== true,
)
const showBrand = computed(
  () => $slidev.nav.currentPage === 1 || showFooter.value,
)
const part = computed(() => frontmatter.value.part ?? '')
const deckTitle = computed(() => $slidev?.configs?.title ?? 'Presentation')
</script>
