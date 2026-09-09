<script setup lang="ts">
import { computed, useId } from 'vue'
import { useSlideContext } from '@slidev/client'
import ContextLabel from './ContextLabel.vue'

const { $clicks } = useSlideContext()
const id = useId().replace(/:/g, '')
const step = computed(() => Math.max(0, Math.min(5, $clicks.value)))

const phases = [
  {
    label: 'Start',
    title: ['Assemble the', 'current input'],
    detail: ['Instructions and the request', 'are already taking space.'],
    takeaway: 'The context window holds the current input, not the entire repository.',
    bottom: 177,
    meter: 0.26,
    status: 'Room available',
  },
  {
    label: 'Load a skill',
    title: ['Load instructions', 'when needed'],
    detail: ['The skill joins this context.', 'It does not create a new agent.'],
    takeaway: 'Loading a skill adds its instructions to the same context.',
    bottom: 219,
    meter: 0.4,
    status: 'Skill loaded',
  },
  {
    label: 'Use tools',
    title: ['Act, then read', 'the result'],
    detail: ['The model requests a tool.', 'The result joins the next input.'],
    takeaway: 'Tool calls and their results become part of later input.',
    bottom: 319,
    meter: 0.7,
    status: 'History growing',
  },
  {
    label: 'More turns',
    title: ['The working', 'history grows'],
    detail: ['Messages, calls and outputs', 'all use the available budget.'],
    takeaway: 'More work adds history. The context window has a limit.',
    bottom: 411,
    meter: 0.97,
    status: 'Near the limit',
  },
  {
    label: 'Compact',
    title: ['Replace older', 'history with a summary'],
    detail: ['Keep useful findings.', 'Some detail can be lost.'],
    takeaway: 'Compaction makes room by replacing detail, not by making the window larger.',
    bottom: 309,
    meter: 0.65,
    status: 'Room recovered',
  },
  {
    label: 'Continue',
    title: ['Continue from', 'what was retained'],
    detail: ['New work fills the space again.', 'Reread source files as needed.'],
    takeaway: 'The next turn uses the summary and retained context. File edits stay on disk.',
    bottom: 367,
    meter: 0.81,
    status: 'Work continues',
  },
]

const phase = computed(() => phases[step.value])
const compacted = computed(() => step.value >= 4)
const working = computed(() => [2, 3, 5].includes(step.value))
const roomTop = computed(() => phase.value.bottom + 8)
const roomHeight = computed(() => Math.max(0, 416 - roomTop.value))
const label = computed(() => `Context window, step ${step.value + 1} of 6. ${phase.value.takeaway}`)
</script>

<template>
  <div class="context-playback" :data-context-step="step">
    <svg
      class="context-canvas"
      viewBox="0 0 1136 510"
      role="img"
      :aria-label="label"
    >
      <defs>
        <pattern :id="`${id}-space`" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M-2 2 2-2 M0 10 10 0 M8 12 12 8" stroke="#dbe9eb" stroke-width="1" />
        </pattern>
        <marker :id="`${id}-arrow`" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 9 5 1 9" fill="none" stroke="#037f91" stroke-width="1.5" />
        </marker>
      </defs>

      <!-- Persistent phase rail gives the animation a beginning and an end. -->
      <g v-for="(item, index) in phases" :key="item.label" :transform="`translate(${index * 190}, 0)`">
        <rect class="context-phase-line" width="176" height="3" y="31" :class="{ complete: index <= step }" />
        <ContextLabel x="0" y="24" width="176" class="context-phase-label" :class="{ current: index === step, complete: index < step }">
          <span class="context-phase-number">{{ index + 1 }}</span>
          <span class="context-phase-name">{{ item.label }}</span>
        </ContextLabel>
      </g>

      <!-- A fixed-size window makes reclaimed space visible during compaction. -->
      <rect class="context-window-frame" x="1" y="49" width="727" height="403" />
      <ContextLabel x="19" y="78" width="240" class="context-window-label">Context window</ContextLabel>
      <ContextLabel x="709" y="77" width="240" align="right" class="context-status" :class="{ warning: step === 3 }">{{ phase.status }}</ContextLabel>
      <rect x="19" y="87" width="690" height="4" fill="#e3e7e6" />
      <rect x="19" y="87" height="4" class="context-usage" :class="{ warning: step === 3 }" :style="{ width: `${690 * phase.meter}px` }" />

      <g class="context-space" :style="{ transform: `translate(19px, ${roomTop}px)`, opacity: roomHeight > 10 ? 1 : 0 }">
        <rect width="690" :style="{ height: `${roomHeight}px` }" :fill="`url(#${id}-space)`" />
        <ContextLabel x="345" :y="roomHeight / 2 + 6" width="350" align="center" class="context-space-label" :style="{ opacity: roomHeight > 50 ? 1 : 0 }">
          Available context
        </ContextLabel>
      </g>

      <g class="context-block context-instructions" transform="translate(19, 102)">
        <rect width="690" height="32" />
        <ContextLabel x="14" y="22" width="660">System + repository instructions · tool definitions</ContextLabel>
      </g>
      <g class="context-block context-request" transform="translate(19, 142)">
        <rect width="690" height="35" />
        <ContextLabel x="14" y="24" width="660"><span class="context-block-kind">User</span><span class="context-block-copy">Check the payment docs</span></ContextLabel>
      </g>
      <g
        class="context-block context-skill context-arrival"
        :class="{ visible: step >= 1 }"
        :style="{ transform: `translate(${step >= 1 ? 19 : -45}px, 185px)` }"
        :aria-hidden="step < 1"
      >
        <rect width="690" height="34" />
        <ContextLabel x="14" y="23" width="660"><span class="context-block-kind">Skill</span><span class="context-block-copy">docs-check instructions</span></ContextLabel>
      </g>

      <!-- Older tool history compresses into the summary at the same location. -->
      <g
        class="context-history"
        :class="{ visible: step >= 2 && !compacted, compressed: compacted }"
        :style="{ transform: `translate(19px, 227px) scale(1, ${compacted ? 0.32 : 1})` }"
        :aria-hidden="step < 2 || compacted"
      >
        <g class="context-block context-call context-call-entry">
          <rect width="690" height="30" />
          <ContextLabel x="14" y="21" width="660"><span class="context-block-kind">Model</span><span class="context-block-copy">Read the configuration</span></ContextLabel>
        </g>
        <g class="context-block context-result context-result-entry" transform="translate(0, 36)">
          <rect width="690" height="56" />
          <ContextLabel x="14" y="23" width="660"><span class="context-block-kind">Tool result</span><span class="context-block-copy">File contents + command output</span></ContextLabel>
          <path d="M126 37 H590 M126 45 H455" stroke="#c6dadd" stroke-width="4" />
        </g>
        <g
          class="context-block context-result context-arrival"
          :class="{ visible: step >= 3 }"
          :style="{ transform: `translate(0px, ${step >= 3 ? 100 : 82}px)` }"
          :aria-hidden="step < 3"
        >
          <rect width="690" height="44" />
          <ContextLabel x="14" y="28" width="660">More messages, tool calls and results</ContextLabel>
        </g>
      </g>

      <g
        class="context-block context-summary"
        :class="{ visible: compacted }"
        :style="{ transform: `translate(19px, 227px) scale(1, ${compacted ? 1 : 0.5})` }"
        :aria-hidden="!compacted"
      >
        <rect width="690" height="44" />
        <ContextLabel x="14" y="28" width="660"><span class="context-block-kind">Summary</span><span class="context-block-copy">Goal · findings · file references</span></ContextLabel>
      </g>
      <g
        class="context-block context-recent context-arrival"
        :class="{ visible: step >= 3 }"
        :style="{ transform: `translate(19px, ${compacted ? 279 : 379}px)` }"
        :aria-hidden="step < 3"
      >
        <rect width="690" height="32" />
        <ContextLabel x="14" y="22" width="660"><span class="context-block-kind context-kind-wide">Recent turns</span><span>Latest question + result</span></ContextLabel>
      </g>
      <g
        class="context-block context-result context-arrival context-new-work"
        :class="{ visible: step >= 5 }"
        :style="{ transform: `translate(${step >= 5 ? 19 : 80}px, 319px)` }"
        :aria-hidden="step < 5"
      >
        <rect width="690" height="48" />
        <ContextLabel x="14" y="29" width="660"><span class="context-block-kind">New work</span><span class="context-block-copy">Next tool call + result</span></ContextLabel>
      </g>

      <path d="M19 424 H709" stroke="#cbd3d3" stroke-dasharray="4 4" />
      <ContextLabel x="19" y="442" width="350" class="context-reserve">Reserve for the next response</ContextLabel>
      <ContextLabel x="709" y="442" width="250" align="right" class="context-scale-note">Illustrative sizes</ContextLabel>

      <!-- The model requests actions; the runtime runs the tools. -->
      <foreignObject x="817" y="49" width="319" height="154">
        <div xmlns="http://www.w3.org/1999/xhtml" class="context-explanation" aria-hidden="true">
          <p class="context-step-count">Step {{ step + 1 }} / 6</p>
          <h2 class="context-step-title">{{ phase.title[0] }}<br />{{ phase.title[1] }}</h2>
          <p class="context-step-detail">{{ phase.detail[0] }}<br />{{ phase.detail[1] }}</p>
        </div>
      </foreignObject>
      <path class="context-connector" d="M729 265 H847" :marker-end="`url(#${id}-arrow)`" />
      <ContextLabel x="787" y="253" width="110" align="center" class="context-wire-label">input</ContextLabel>
      <rect class="context-model" x="850" y="226" width="252" height="76" />
      <ContextLabel x="976" y="256" width="252" align="center" class="context-machine-title">Model</ContextLabel>
      <ContextLabel x="976" y="282" width="252" align="center" class="context-machine-detail">{{ step === 4 ? 'Summarize older history' : 'Choose the next action' }}</ContextLabel>
      <path class="context-connector" d="M880 303 V349" :marker-end="`url(#${id}-arrow)`" />
      <ContextLabel x="892" y="331" width="80" class="context-wire-label">call</ContextLabel>
      <rect class="context-tools" x="850" y="353" width="252" height="66" />
      <ContextLabel x="976" y="380" width="252" align="center" class="context-machine-title">Tools</ContextLabel>
      <ContextLabel x="976" y="403" width="252" align="center" class="context-machine-detail">Read files · run commands</ContextLabel>
      <path class="context-connector context-return" d="M849 389 H760 V313 H729" :marker-end="`url(#${id}-arrow)`" />
      <ContextLabel x="785" y="409" width="100" align="center" class="context-wire-label">result</ContextLabel>
      <ContextLabel x="817" y="444" width="319" class="context-scale-note">The runtime runs the loop.</ContextLabel>

      <!-- Finite, click-triggered motion. No timers or continuous animation. -->
      <g v-if="working" :key="`work-${step}`" class="context-tool-motion" aria-hidden="true">
        <circle class="context-input-packet" r="5" fill="#037f91" />
        <circle class="context-call-packet" r="5" fill="#037f91" />
        <circle class="context-result-packet" r="5" fill="#de1e05" />
      </g>

      <rect x="0" y="466" width="1136" height="44" fill="#fff5f3" />
      <rect x="0" y="466" width="5" height="44" fill="#de1e05" />
      <ContextLabel x="20" y="495" width="1100" class="context-takeaway">{{ phase.takeaway }}</ContextLabel>
    </svg>
    <span class="context-screen-reader" role="status" aria-live="polite">{{ label }}</span>
  </div>
</template>

<style scoped>
.context-playback {
  height: 510px;
  width: 100%;
}

.context-canvas {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  font-family: 'Inter', sans-serif;
}

.context-phase-line {
  fill: #e2e3e1;
  transition: fill 300ms ease;
}

.context-phase-line.complete { fill: var(--z-teal); }
.context-phase-label { color: #767676; font-size: 17px; }
.context-phase-label.current { color: var(--z-teal); font-weight: 700; }
.context-phase-label.complete { color: var(--z-ink); }
.context-phase-number { font-size: 14px; }
.context-phase-name { margin-left: 10px; }
.context-window-frame { fill: #fafcfb; stroke: var(--z-teal); stroke-width: 2; }
.context-window-label { color: var(--z-ink); font-size: 21px; font-weight: 700; }
.context-status { color: var(--z-teal); font-size: 16px; font-weight: 600; }
.context-status.warning { color: var(--z-red); }
.context-usage { fill: var(--z-teal); transition: width 1100ms cubic-bezier(.22, 1, .36, 1), fill 400ms ease; }
.context-usage.warning { fill: var(--z-red); }
.context-space { transition: transform 950ms cubic-bezier(.22, 1, .36, 1), opacity 350ms ease; }
.context-space rect { transition: height 950ms cubic-bezier(.22, 1, .36, 1); }
.context-space-label { color: #547076; font-size: 19px; transition: opacity 250ms ease; }
.context-block { color: var(--z-ink); font-size: 18px; }
.context-block-kind { width: 112px; flex: 0 0 112px; font-size: 16px; font-weight: 700; }
.context-kind-wide { width: 134px; flex-basis: 134px; }
.context-block rect { stroke-width: 1; }
.context-instructions rect { fill: #333; stroke: #333; }
.context-instructions { color: white; font-size: 17px; }
.context-request rect { fill: white; stroke: #ccd2d1; }
.context-skill rect { fill: #e3f5f6; stroke: var(--z-teal); }
.context-skill .context-block-kind { color: var(--z-teal); }
.context-call rect { fill: white; stroke: #ccd2d1; }
.context-result rect { fill: #ecf3f4; stroke: #b9d8dc; }
.context-recent rect { fill: white; stroke: #ccd2d1; }
.context-summary rect { fill: #e3f5f6; stroke: var(--z-teal); stroke-width: 2; }
.context-summary .context-block-kind { color: var(--z-teal); }

.context-arrival,
.context-history,
.context-summary {
  opacity: 0;
  transform-box: view-box;
  transform-origin: 0 0;
  transition:
    transform 950ms cubic-bezier(.22, 1, .36, 1),
    opacity 400ms ease;
}

.context-arrival.visible,
.context-history.visible,
.context-summary.visible { opacity: 1; }
.context-history.compressed { transition-duration: 900ms, 450ms; }
.context-summary.visible { transition-delay: 220ms; }
.context-reserve { color: #626c6c; font-size: 14px; }
.context-scale-note { color: var(--z-grey-600); font-size: 14px; }
.context-explanation .context-step-count { color: var(--z-teal); font-size: 14px; font-weight: 700; letter-spacing: 1px; margin: 0 0 12px; text-transform: uppercase; }
.context-explanation .context-step-title { color: var(--z-ink); font-size: 25px; font-weight: 700; letter-spacing: -.4px; line-height: 30px; margin: 0 0 16px; }
.context-explanation .context-step-detail { color: #555; font-size: 18px; line-height: 25px; margin: 0; }
.context-connector { fill: none; stroke: var(--z-teal); stroke-width: 2; }
.context-wire-label { color: #577377; font-size: 14px; }
.context-model { fill: #e3f5f6; stroke: var(--z-teal); stroke-width: 2; }
.context-tools { fill: white; stroke: #bbc8c9; stroke-width: 1.5; }
.context-machine-title { color: var(--z-ink); font-size: 23px; font-weight: 700; }
.context-machine-detail { color: #555; font-size: 16px; }
.context-takeaway { color: var(--z-callout-text); font-size: 21px; font-weight: 600; }

.context-input-packet { animation: context-input 420ms ease-in-out both; }
.context-call-packet { animation: context-call 350ms 420ms ease-in-out both; }
.context-result-packet { animation: context-result 700ms 770ms ease-in-out both; }

.context-playback[data-context-step="2"] .context-call-entry {
  animation: context-row-arrival 400ms 420ms both;
}

.context-playback[data-context-step="2"] .context-result-entry {
  animation: context-row-arrival 500ms 1200ms both;
}

.context-playback[data-context-step="5"] .context-new-work {
  transition-delay: 900ms;
}

@keyframes context-row-arrival {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes context-input {
  0% { transform: translate(731px, 265px); opacity: 0; }
  20% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translate(846px, 265px); opacity: 0; }
}

@keyframes context-call {
  0% { transform: translate(880px, 306px); opacity: 0; }
  20% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translate(880px, 348px); opacity: 0; }
}

@keyframes context-result {
  0% { transform: translate(847px, 389px); opacity: 0; }
  10% { opacity: 1; }
  45% { transform: translate(760px, 389px); }
  80% { transform: translate(760px, 313px); opacity: 1; }
  100% { transform: translate(732px, 313px); opacity: 0; }
}

.context-screen-reader {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .context-canvas * {
    animation: none !important;
    transition: none !important;
  }
  .context-tool-motion { display: none; }
}

@media print {
  .context-canvas * {
    animation: none !important;
    transition: none !important;
  }
  .context-tool-motion { display: none; }
}
</style>
