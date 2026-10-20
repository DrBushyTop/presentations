<script setup lang="ts">
import { useNav } from '@slidev/client'
import IconButton from '@slidev/client/internals/IconButton.vue'
import { recorder } from '@slidev/client/logic/recording.ts'
import { currentCamera } from '@slidev/client/state/storage.ts'
import { computed } from 'vue'
import { status } from './camera'
import CameraBubble from './CameraBubble.vue'

// The camera bubble from the presenter view, where Slidev has no button for
// it. It brings the voice too if a microphone is picked in Slidev's recording
// devices. The dot says whether viewers get them, and why not.
const { isPresenter, isEmbedded } = useNav()
const { showAvatar, streamCamera, toggleAvatar } = recorder
const on = computed(() => !!(showAvatar.value && streamCamera.value))

const title = computed(() => {
  if (currentCamera.value === 'none') return 'No camera picked in Slidev\'s recording devices'
  const { state, reason } = status.value
  const voice = streamCamera.value?.getAudioTracks().length ? ' and hear you' : ''
  const viewers = state === 'connecting'
    ? 'Connecting the camera to viewers…'
    : state === 'live'
      ? `Viewers see the camera${voice}.`
      : state === 'failed' ? `Viewers don't get the camera. ${reason}` : ''
  return [on.value ? 'Turn the camera off' : 'Turn the camera on', viewers].filter(Boolean).join('\n')
})
</script>

<template>
  <template v-if="isPresenter && !isEmbedded">
    <IconButton
      :title="title"
      :active="on"
      :class="{ 'text-green-500': on, 'shallow': currentCamera === 'none' }"
      @click="toggleAvatar"
    >
      <div class="i-carbon:user-avatar" />
      <span v-if="status.state !== 'off'" class="slidev-live-dot" :data-state="status.state" />
    </IconButton>
    <CameraBubble v-if="on" />
  </template>
</template>
