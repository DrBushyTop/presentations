<!--
  Opens each part: where you're the bottleneck at this gate, and what goes
  wrong if you step out with nothing in your place. The slide title names the
  bottleneck. The rest of the part is the fix, so it isn't shown here.
  Left, the relay: messages queue up and every one goes through you.
  Right, the real artifact once you're gone.
  0 the relay you do today · 1 you step out, and what happens
-->
<script setup lang="ts">
import { computed } from 'vue'
import { relays } from '../lib/failures'

const props = withDefaults(defineProps<{ gate: number, step?: number }>(), { step: 99 })
const rows = computed(() => relays[props.gate])
</script>

<template>
  <div class="hf" :class="{ two: rows.length > 1, out: step >= 1 }">
    <div class="labels">
      <span class="today"><Icon name="user" />Today, through you</span>
      <span class="gone"><Icon name="x" />If you just step out</span>
    </div>
    <div v-for="r in rows" :key="r.name" class="row">
      <div class="relay">
        <div class="msg">
          <span class="ghost g2" />
          <span class="ghost g1" />
          <div class="card">
            <span class="from"><Icon :name="r.fromIcon ?? 'bot'" />{{ r.from }}</span>
            <p class="ask">{{ r.ask }}</p>
          </div>
        </div>
        <div class="wire">
          <span class="tag wait"><Icon name="clock" />Waits for you</span>
          <span class="tag go"><Icon name="arrow" />Carries on without you</span>
        </div>
        <div class="you">
          <span class="avatar"><Icon name="user" /></span>
          <b>{{ r.you }}</b>
        </div>
      </div>
      <div class="fail">
        <b class="name">{{ r.name }}</b>
        <div class="doc">
          <span class="src"><Icon :name="r.icon" />{{ r.source }}</span>
          <p class="ev" :class="{ code: r.code }">{{ r.evidence }}</p>
          <span v-if="r.note" class="note"><Icon name="alert" />{{ r.note }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hf {
  height: 510px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.labels,
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 56px;
}

.labels span {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: var(--ns-label);
  font-weight: 700;
  padding-bottom: 8px;
  border-bottom: 2px solid currentColor;
}

.labels .today { color: var(--z-ink); }
.labels .gone { color: var(--ns-red); }

.row {
  flex: 1;
  min-height: 0;
}

/* The relay: the agent's message, the queue behind it, a wire down to you. */
.relay {
  display: flex;
  flex-direction: column;
}

.msg {
  position: relative;
  margin-bottom: 22px;
}

.card {
  position: relative;
  z-index: 2;
  padding: 18px 24px 22px;
  background: var(--z-ink);
  color: #fff;
}

.ghost {
  position: absolute;
  inset: 0;
  background: var(--z-ink);
}

/* Each card sits on a white edge so the stack reads as cards, not a shadow. */
.card,
.g1 { box-shadow: 0 3px 0 #fff; }
.g1 { z-index: 1; transform: translateY(12px) scaleX(0.94); opacity: 0.55; }
.g2 { z-index: 0; transform: translateY(24px) scaleX(0.88); opacity: 0.25; }

.from {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--ns-frozen);
}

.ask {
  margin: 8px 0 0;
  max-width: none;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.wire {
  flex: 1;
  min-height: 24px;
  display: grid;
  align-items: center;
  margin-left: 44px;
  padding-left: 26px;
  border-left: 4px solid var(--z-ink);
  transition: border-color 600ms var(--ns-ease);
}

.tag {
  grid-area: 1 / 1;
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--z-grey-600);
  transition: opacity 500ms var(--ns-ease);
}

.tag.go { color: var(--ns-red); }
.hf:not(.out) .tag.go,
.out .tag.wait { opacity: 0; }

.you {
  display: flex;
  gap: 22px;
  align-items: center;
  transition: opacity 600ms var(--ns-ease);
}

.avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  border: 5px solid var(--ns-red);
  background: #fff1ee;
  color: var(--ns-red);
  font-size: 50px;
  transition: border-color 600ms var(--ns-ease), background 600ms var(--ns-ease), color 600ms var(--ns-ease);
}

.you b {
  font-size: 34px;
  line-height: 1.15;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

/* Stepped out: the wire and the seat are empty. */
.out .wire { border-left-style: dashed; border-color: #c4c4c0; }
.out .avatar { border-style: dashed; border-color: #c4c4c0; background: #fff; color: #c4c4c0; }
.out .you b { opacity: 0.3; }

/* The failure, as the artifact it left behind. */
.fail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease), filter 600ms var(--ns-ease);
}

.hf:not(.out) .fail,
.hf:not(.out) .labels .gone {
  opacity: 0;
}

.hf:not(.out) .fail {
  transform: translateX(-24px);
  filter: blur(5px);
}

.labels .gone {
  transition: opacity 500ms var(--ns-ease);
}

.name {
  padding-left: 16px;
  border-left: 6px solid var(--ns-red);
  font-size: 38px;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.doc {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 2px solid var(--ns-line);
  background: #fff;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.07);
}

.src {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 22px;
  background: var(--ns-soft);
  border-bottom: 2px solid var(--ns-line);
  font-size: var(--ns-label);
  font-weight: 700;
  color: var(--z-grey-600);
}

.ev {
  flex: 1;
  margin: 0;
  max-width: none;
  display: flex;
  align-items: center;
  padding: 18px 26px;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--z-ink);
  white-space: pre-wrap;
}

.ev.code {
  font-family: var(--ns-mono);
  font-size: 25px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
}

.note {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 22px;
  background: #fff1ee;
  border-left: 6px solid var(--ns-red);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
}

.note :deep(.ns-icon) {
  color: var(--ns-red);
}

/* Verify has two relays, so each one is compact. */
.two { gap: 16px; }
.two .row { gap: 56px; }
.two .msg { margin-bottom: 14px; }
.two .card { padding: 10px 18px 12px; }
.two .g1 { transform: translateY(7px) scaleX(0.94); }
.two .g2 { transform: translateY(14px) scaleX(0.88); }
.two .tag { gap: 8px; font-size: 16px; }
.two .from { font-size: 15px; }
.two .ask { margin-top: 2px; font-size: 22px; }
.two .wire { min-height: 10px; margin-left: 28px; padding-left: 18px; border-left-width: 3px; }
.two .you { gap: 16px; }
.two .avatar { width: 60px; height: 60px; border-width: 4px; font-size: 32px; }
.two .you b { font-size: 24px; }
.two .fail { gap: 8px; }
.two .name { font-size: 26px; border-left-width: 5px; }
.two .src { padding: 6px 16px; font-size: 15px; }
.two .ev { padding: 8px 18px; }
.two .ev.code { font-size: 19px; line-height: 1.4; }
.two .note { padding: 7px 16px; font-size: 18px; border-left-width: 5px; }
</style>
