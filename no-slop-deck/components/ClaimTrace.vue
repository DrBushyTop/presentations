<!--
  What a research document looks like, using the demo app. Each finding has
  a takeaway heading, one sentence and a file:line citation. The editor on the
  right opens the cited lines. Line numbers and code are the demo app's real
  source (no-slop-deck/demo-app/src).
  0 the session · 1 the list route · 2 the shared query · 3 no export yet
  Every click keeps the same layout: findings dim or light, and the editor
  crossfades between files in one grid cell.
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

type Line = { n?: number, t: string, hit?: boolean }
const findings: { h: string, p: string, cite: string, file: string, lines: Line[] }[] = [
  {
    h: 'The session cookie resolves to a user and their team',
    p: 'readSession joins sessions, users and teams.',
    cite: 'src/lib/session.ts:16-27',
    file: 'src/lib/session.ts',
    lines: [
      { n: 16, t: 'export function readSession(db, request) {' },
      { n: 17, t: '  const token = request.cookies[sessionCookie]' },
      { n: 18, t: '  if (!token) return null' },
      { n: 19, t: '  const user = db.prepare(`' },
      { n: 20, t: '    SELECT users.id, users.name,', hit: true },
      { n: 21, t: '      users.team_id AS teamId, ...', hit: true },
      { n: 22, t: '    FROM sessions', hit: true },
      { n: 23, t: '    JOIN users ON users.id = sessions.user_id', hit: true },
      { n: 24, t: '    JOIN teams ON teams.id = users.team_id', hit: true },
      { n: 25, t: '  `).get(token, Date.now())' },
      { n: 26, t: '  return user ? { user } : null' },
      { n: 27, t: '}' },
    ],
  },
  {
    h: 'The list route passes the session team to the query',
    p: 'The client can filter by status, not by team.',
    cite: 'src/routes/tasks.ts:15-18',
    file: 'src/routes/tasks.ts',
    lines: [
      { n: 8, t: "app.get('/api/tasks', {" },
      { t: '  ...' },
      { n: 15, t: '}, async (request) => {' },
      { n: 16, t: '  const session = requireSession(db, request)', hit: true },
      { n: 17, t: '  const tasks = findTasks(db, {', hit: true },
      { t: '    teamId: session.user.teamId,', hit: true },
      { t: '    status: request.query.status })', hit: true },
      { n: 18, t: '  return { tasks }' },
      { n: 19, t: '})' },
    ],
  },
  {
    h: 'The shared query filters by team only when given one',
    p: 'Scoping lives in the caller, not in findTasks.',
    cite: 'src/lib/tasks.ts:9-15',
    file: 'src/lib/tasks.ts',
    lines: [
      { n: 9, t: 'export function findTasks(db, filter = {}) {' },
      { n: 10, t: '  const conditions = []' },
      { n: 11, t: '  const values = []' },
      { n: 12, t: '  if (filter.teamId !== undefined) {', hit: true },
      { n: 13, t: "    conditions.push('team_id = ?')", hit: true },
      { n: 14, t: '    values.push(filter.teamId)', hit: true },
      { n: 15, t: '  }', hit: true },
      { n: 16, t: '  if (filter.status !== undefined) {' },
    ],
  },
  {
    h: 'Only session and task routes are registered',
    p: 'There is no export endpoint today.',
    cite: 'src/app.ts:15-16',
    file: 'src/app.ts',
    lines: [
      { n: 9, t: 'export async function createApp(db, options) {' },
      { n: 10, t: '  const app = Fastify({ ... })' },
      { n: 14, t: '  await app.register(cookie)' },
      { n: 15, t: '  await sessionRoutes(app, db)', hit: true },
      { n: 16, t: '  await taskRoutes(app, db)', hit: true },
      { n: 18, t: '  if (options.serveClient) { ... }' },
      { n: 21, t: '  return app' },
      { n: 22, t: '}' },
    ],
  },
]
</script>

<template>
  <div class="research">
    <section class="doc">
      <header class="ns-mono">research.md</header>
      <article
        v-for="(f, i) in findings" :key="f.cite"
        class="finding" :class="{ now: i === Math.min(step, 3), past: i < step }"
      >
        <h3>{{ f.h }}</h3>
        <p>{{ f.p }}</p>
        <code class="ref">{{ f.cite }}</code>
      </article>
    </section>

    <section class="editor ns-mono">
      <div v-for="(f, i) in findings" :key="f.file" class="file" :class="{ on: i === Math.min(step, 3) }">
        <header><span class="tab">{{ f.file }}</span><em>opened from {{ f.cite }}</em></header>
        <div class="code">
          <div v-for="(l, k) in f.lines" :key="k" class="ln" :class="{ hit: l.hit }">
            <i>{{ l.n ?? '' }}</i><span>{{ l.t }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.research {
  height: 476px;
  display: grid;
  grid-template-columns: 500px 1fr;
  gap: 28px;
}

.doc {
  border: 1px solid var(--ns-line);
  background: #fff;
  box-shadow: 0 24px 60px -34px rgba(26, 26, 26, 0.4);
  display: flex;
  flex-direction: column;
}

.doc header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--ns-line);
  font-size: 16px;
  color: var(--z-grey-600);
}

.finding {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 6px 20px;
  border-bottom: 1px solid var(--ns-line);
  opacity: 0.32;
  transition: opacity 500ms var(--ns-ease), background 500ms var(--ns-ease);
}

.finding:last-child {
  border-bottom: 0;
}

.finding.past {
  opacity: 0.7;
}

.finding.now {
  opacity: 1;
  background: #e8f6f8;
}

h3 {
  margin: 0;
  font-family: var(--z-font-display);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.finding p {
  margin: 0;
  max-width: none;
  font-size: 18px;
  line-height: 1.3;
  color: var(--z-ink-800);
}

.ref {
  align-self: flex-start;
  margin-top: 3px;
  padding: 1px 8px;
  font-family: var(--ns-mono);
  font-size: 16px;
  color: var(--ns-teal);
  background: #fff;
  border: 1px solid #a9d9df;
}

.finding.now .ref {
  background: var(--ns-teal);
  border-color: var(--ns-teal);
  color: #fff;
}

.editor {
  display: grid;
  background: var(--z-ink);
  box-shadow: 0 30px 70px -40px rgba(26, 26, 26, 0.6);
}

.file {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  transition: opacity 450ms var(--ns-ease);
}

.file:not(.on) {
  opacity: 0;
}

.file header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  font-size: 16px;
}

.tab {
  padding: 12px 18px;
  color: #fff;
  background: #262626;
  border-right: 1px solid #333;
  box-shadow: inset 0 -3px 0 var(--ns-frozen);
}

.file header em {
  padding-right: 18px;
  font-style: normal;
  color: #7a7a7a;
}

.code {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 0;
}

.ln {
  display: grid;
  grid-template-columns: 52px 1fr;
  font-size: 18px;
  line-height: 1.65;
  color: #bdbdbd;
  white-space: pre;
}

.ln i {
  font-style: normal;
  text-align: right;
  padding-right: 16px;
  color: #5f5f5f;
}

.ln.hit {
  background: rgba(3, 127, 145, 0.45);
  color: #fff;
}

.ln.hit i {
  color: var(--ns-frozen);
}
</style>
