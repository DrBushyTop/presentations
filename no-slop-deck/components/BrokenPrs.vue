<!--
  Four green pull requests, each wrong in a different way. The talk opens on
  them and closes on the same four with the evidence that would catch each.
  mode "hook":     0 four green PRs · 1 how each one goes wrong
  mode "evidence": the check that catches each one
  #482 is the demo app's export. The other three are illustrative; #541 is
  redrawn from Polylane's migration example.
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number, mode?: 'hook' | 'evidence' }>(), { step: 0, mode: 'hook' })

const prs = [
  {
    n: 482, title: 'Add CSV export for team tasks', size: ['+146', '−3', '4 files'],
    code: ["test('exports the team's tasks', () => {", "  expect(csv).toContain('A-101')", '})'],
    wrong: 'The tests only confirm what the code does',
    caught: 'A boundary check that fails without the filter',
  },
  {
    n: 517, title: 'Show sync status in the sidebar', size: ['+212', '−8', '6 files'],
    code: ['// ui/Sidebar.tsx', "import { db } from '../server/storage'", 'const last = db.lastSync()'],
    wrong: 'It took the shortcut across a boundary',
    caught: 'Lint: browser code may not import server modules',
  },
  {
    n: 530, title: 'Rework task filters', size: ['+1,940', '−612', '41 files'],
    code: ['schema → queries → routes → ui', '4 days, 1 PR', 'first run in a browser: in review'],
    wrong: 'Too big to read, and nobody ran it',
    caught: 'Four slices, each with a clip of it running',
  },
  {
    n: 541, title: 'Index orders by customer', size: ['+4', '−0', '1 file'],
    code: ['CREATE INDEX orders_customer_idx', '  ON orders (customer_id);'],
    wrong: 'Locks writes to orders in production',
    caught: 'No-go: 38 writes a second would wait',
  },
]
const checks = ['Tests', 'Lint', 'Review bot', 'Approved']
</script>

<template>
  <div class="bp" :class="mode">
    <article v-for="(p, i) in prs" :key="p.n" class="pr" :style="{ '--i': i }">
      <header>
        <b>{{ p.title }} <span>#{{ p.n }}</span></b>
      </header>
      <ul class="checks">
        <li v-for="c in checks" :key="c"><Icon name="check" />{{ c }}</li>
      </ul>
      <div class="code ns-mono">
        <span class="size"><em class="plus">{{ p.size[0] }}</em> <em class="minus">{{ p.size[1] }}</em> · {{ p.size[2] }}</span>
        <p v-for="l in p.code" :key="l">{{ l }}</p>
      </div>
      <div class="band">
        <p v-if="mode === 'hook'" class="wrong" :class="{ on: step >= 1 }"><Icon name="x" />{{ p.wrong }}</p>
        <p v-else class="caught on"><Icon name="check" />{{ p.caught }}</p>
      </div>
    </article>
  </div>
</template>

<style scoped>
.bp {
  height: 510px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px 22px;
}

.pr {
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--ns-line);
  background: #fff;
  box-shadow: 0 18px 40px -28px rgba(26, 26, 26, 0.4);
}

header {
  padding: 12px 16px 4px;
  white-space: nowrap;
}

header b {
  font-size: 21px;
  letter-spacing: -0.01em;
}

header b span {
  color: var(--z-grey-600);
  font-weight: 400;
}

.code {
  position: relative;
}

.size {
  position: absolute;
  top: 8px;
  right: 14px;
  font-size: 15px;
  white-space: nowrap;
  color: #9a9a9a;
}

.size em {
  font-style: normal;
  font-weight: 700;
}

.plus { color: var(--z-teal-300); }
.minus { color: #ff9d8f; }

.checks {
  list-style: none;
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 0 16px 10px;
}

.checks li {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  font-weight: 600;
  color: var(--ns-teal);
}

.checks li::before {
  display: none !important;
}

.code {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--z-ink);
  padding: 26px 16px 8px;
}

.code p {
  margin: 0;
  max-width: none;
  white-space: pre;
  font-size: 17px;
  line-height: 1.55;
  color: #d6d6d6;
}

.band {
  display: grid;
  min-height: 52px;
}

.band p {
  grid-area: 1 / 1;
  margin: 0;
  max-width: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  color: #fff;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.25;
  transition: opacity 500ms var(--ns-ease), clip-path 700ms var(--ns-ease);
  transition-delay: calc(var(--i) * 120ms);
}

.band :deep(.ns-icon) {
  font-size: 20px;
}

.wrong { background: var(--ns-red); }
.caught { background: var(--ns-teal); }

.wrong:not(.on) {
  clip-path: inset(0 100% 0 0);
}

.wrong.on {
  clip-path: inset(0 0 0 0);
}
</style>
