<script setup>
import { defineAsyncComponent } from 'vue'

// The routes live on the dev server, so a static build leaves the whole addon out.
const NavButtons = import.meta.env.DEV ? defineAsyncComponent(() => import('./client/NavButtons.vue')) : null
</script>

<template>
  <NavButtons v-if="NavButtons" />
</template>
