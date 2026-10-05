<!--
  Polylane runs cheap, deterministic rules over the diff before the agent
  starts, to point its attention at known deployment risks. The migration is
  the example from their post.
  0 the diff and the rules · 1 a rule matches · 2 a hint, not a verdict
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const rules = [
  { t: 'A migration that must run by hand, or in a set order', hit: false },
  { t: 'A table lock: CREATE INDEX without CONCURRENTLY, or a NOT NULL column with no default', hit: true },
  { t: 'An endpoint removed while the deployed version still calls it', hit: false },
  { t: 'A new env var or secret that nothing provisions', hit: false },
]
</script>

<template>
  <div class="heur" :class="{ scan: step >= 1, hint: step >= 2 }">
    <section class="diff ns-mono">
      <header>migrations/0114_order_search_trgm.sql</header>
      <div class="code">
        <div class="ln"><i>1</i>BEGIN;</div>
        <div class="ln"><i>2</i>ALTER TABLE orders ADD COLUMN search_text text;</div>
        <div class="ln hit"><i>3</i>CREATE INDEX orders_search_trgm</div>
        <div class="ln hit"><i>4</i>{{ '  ' }}ON orders USING gin (search_text gin_trgm_ops);</div>
        <div class="ln"><i>5</i>COMMIT;</div>
        <div class="beam" />
      </div>
      <div class="tag"><Icon name="alert" /><span>Hint to the agent: this locks writes to <b>orders</b></span></div>
    </section>

    <section class="rules">
      <header>Rules that run before the agent</header>
      <ol>
        <li v-for="(r, i) in rules" :key="i" :class="{ hit: r.hit }"><span class="ns-mono">{{ i + 1 }}</span>{{ r.t }}</li>
      </ol>
      <p class="note">A hint, not a verdict. The agent still has to find the evidence.</p>
    </section>
  </div>
</template>

<style scoped>
.heur {
  height: 510px;
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 32px;
}

.diff {
  background: var(--z-ink);
  color: #d6d6d6;
  display: flex;
  flex-direction: column;
}

.diff header {
  padding: 14px 20px;
  border-bottom: 1px solid #333;
  font-size: var(--ns-label);
  color: #9a9a9a;
}

.code {
  position: relative;
  padding: 18px 0;
  flex: 1;
  overflow: hidden;
}

.ln {
  font-size: var(--ns-code);
  line-height: 2.1;
  white-space: pre;
  padding-right: 16px;
  transition: background 500ms var(--ns-ease), color 500ms var(--ns-ease);
  transition-delay: 700ms;
}

.ln i {
  font-style: normal;
  display: inline-block;
  width: 46px;
  padding-right: 14px;
  text-align: right;
  color: #5c5c5c;
}

.scan .ln.hit {
  background: rgba(222, 30, 5, 0.5);
  color: #fff;
}

.beam {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(5, 195, 222, 0.35), transparent);
  opacity: 0;
}

.scan .beam {
  animation: sweep 1100ms var(--ns-ease-in) both;
}

@keyframes sweep {
  0% { top: 0; opacity: 1; }
  90% { opacity: 1; }
  100% { top: calc(100% - 40px); opacity: 0; }
}

.tag {
  margin: 0 20px 20px;
  padding: 14px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  font-family: var(--z-font-text);
  font-size: 21px;
  font-weight: 700;
  background: var(--ns-red);
  color: #fff;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 500ms var(--ns-ease) 900ms, transform 600ms var(--ns-ease) 900ms;
}

.scan .tag {
  opacity: 1;
  transform: none;
}

.rules {
  display: flex;
  flex-direction: column;
}

.rules header {
  font-size: 24px;
  font-weight: 800;
  padding-bottom: 12px;
  border-bottom: 3px solid var(--z-ink);
}

ol {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

li {
  flex: 1;
  margin: 0;
  max-width: none;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  font-size: 21px;
  line-height: 1.3;
  border-bottom: 1px solid var(--ns-line);
  transition: background 500ms var(--ns-ease), color 500ms var(--ns-ease);
  transition-delay: 700ms;
}

li::before {
  display: none !important;
}

li span {
  color: var(--ns-teal);
  font-size: var(--ns-label);
  font-weight: 700;
}

.scan li.hit {
  background: var(--ns-red);
  color: #fff;
}

.scan li.hit span {
  color: #fff;
}

.note {
  margin: 14px 0 0;
  max-width: none;
  padding: 14px 16px;
  background: var(--z-ink);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  transition: opacity 500ms var(--ns-ease);
}

.heur:not(.hint) .note {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .scan .beam { animation: none; }
}
</style>
