<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'
import AnnotateLayer from './AnnotateLayer.vue'
import ChatPanel from './ChatPanel.vue'
import { chat } from './chat.mjs'
import { followSlides } from './follow.mjs'
import { draft, ui } from './store.mjs'

const nav = useNav()
const available = computed(() => !nav.isPrintMode.value && !nav.isEmbedded.value)
followSlides(nav)
</script>

<template>
  <template v-if="available">
    <button
      class="slidev-icon-btn ta-nav" :class="{ on: ui.active }" type="button"
      :title="ui.active ? 'Stop annotating (Esc)' : 'Annotate the slide for an agent'"
      @click="ui.active = !ui.active"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2.5l9.5 4-4 1.5-1.5 4z" /><path d="M9 9l4 4" /></svg>
    </button>
    <button
      class="slidev-icon-btn ta-nav" :class="{ on: ui.trayOpen }" type="button"
      :title="chat.data?.thread.busy ? 'Chat · agent is working' : chat.unread ? 'Chat · new reply' : 'Chat with the deck agent'"
      @click="ui.trayOpen = !ui.trayOpen"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" /></svg>
      <span v-if="draft.annotations.length" class="ta-badge">{{ draft.annotations.length }}</span>
      <span v-if="chat.data?.thread.busy" class="ta-dot busy" />
      <span v-else-if="chat.unread" class="ta-dot unread" />
    </button>
    <Teleport to="body">
      <AnnotateLayer v-if="ui.active" />
      <ChatPanel v-if="ui.trayOpen" />
    </Teleport>
  </template>
</template>

<style scoped>
.ta-nav { position: relative; }
.ta-nav svg { width: 1.1em; height: 1.1em; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linejoin: round; stroke-linecap: round; }
.ta-nav.on { color: #2dd4bf; }
.ta-dot { position: absolute; bottom: 3px; right: 3px; width: 8px; height: 8px; border-radius: 50%; }
.ta-dot.busy { background: #2dd4bf; animation: ta-pulse 1.2s ease-in-out infinite; }
.ta-dot.unread { background: #22c55e; }
@keyframes ta-pulse { 50% { opacity: 0.3; } }
.ta-badge { position: absolute; top: 0; right: 0; min-width: 14px; height: 14px; padding: 0 3px; box-sizing: border-box; border-radius: 7px; background: #f59e0b; color: #1c1917; font-size: 10px; line-height: 14px; font-weight: 700; }
</style>
