<!--
  Six of my repo's rules at a glance, each with what it catches, then the full
  suite that runs on the agent's machine before a merge. The rules are from
  tests/Discovery.Architecture.Tests; test counts are from 21 October. Each
  card gets its own tint so the grid doesn't read as one grey block.
  0 the rules · 1 the full local suite before merge
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const rules = [
  { name: 'Features stay independent', catches: 'A feature imports another feature', tone: 'teal' },
  { name: 'Time comes from TimeProvider', catches: 'Code reads the wall clock', tone: 'lime' },
  { name: 'Access check comes first', catches: 'A handler skips the project check', tone: 'red' },
  { name: 'Transactions survive retries', catches: 'A bare transaction, a 500 on SQL Server', tone: 'grey' },
  { name: 'MCP matches the API', catches: 'An action only one of them has', tone: 'frozen' },
  { name: 'Every failure names its fix', catches: 'A check that fails without a Fix line', tone: 'solid' },
]

const suite = ['13 architecture rules', '2,404 API tests on SQL Server', '1,087 web tests']
</script>

<template>
  <div class="rc">
    <ol class="grid">
      <li v-for="(r, i) in rules" :key="r.name" :class="r.tone">
        <span class="n ns-mono">{{ i + 1 }}</span>
        <div>
          <b>{{ r.name }}</b>
          <p>{{ r.catches }}</p>
        </div>
      </li>
    </ol>

    <div class="suite" :class="{ on: step >= 1 }">
      <span class="lead">Before merge, on the agent's machine, for the exact commit</span>
      <span v-for="s in suite" :key="s" class="ok"><Icon name="check" />{{ s }}</span>
    </div>
  </div>
</template>

<style scoped>
.rc {
  height: 510px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.grid {
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 14px;
}

.grid li {
  --accent: var(--ns-teal);
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  background: var(--tint);
  border-left: 6px solid var(--accent);
}

.grid li.teal { --tint: #e6f3f5; }
.grid li.lime { --tint: #f5f9dc; --accent: #8a9c00; }
.grid li.red { --tint: #fff1ee; --accent: var(--ns-red); }
.grid li.grey { --tint: var(--ns-soft); --accent: var(--z-ink); }
.grid li.frozen { --tint: #e3f9fc; --accent: var(--ns-frozen); }

.grid li.solid {
  --tint: var(--ns-teal);
  --accent: var(--ns-frozen);
  color: #fff;
}

.n {
  font-size: 30px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.15;
}

.grid li.lime .n { color: #6f7d00; }

.grid b {
  display: block;
  font-size: 26px;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.grid p {
  margin: 8px 0 0;
  max-width: none;
  font-size: 21px;
  line-height: 1.3;
  color: var(--z-ink-800);
}

.grid li.solid p { color: #e6f6f8; }

.suite {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 28px;
  padding: 14px 24px;
  background: var(--z-ink);
  color: #fff;
  font-size: 21px;
  transition: opacity 600ms var(--ns-ease), transform 700ms var(--ns-ease);
}

.suite:not(.on) {
  opacity: 0;
  transform: translateY(14px);
}

.lead {
  width: 100%;
  font-weight: 800;
  font-size: 22px;
}

.suite .ok {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--ns-frozen);
  font-weight: 700;
}
</style>
