<!--
  What a research document looks like, from my repo's issue #257 (MCP
  replies over about 12 KB failing). Each finding has a takeaway heading, one
  sentence and a file:line citation. The editor on the right opens the cited
  lines. Paths are shortened from src/Discovery.Api/Infrastructure/; line
  numbers and code are real at commit af31181, with long lines wrapped and a
  few arguments elided.
  0 the reply frame · 1 the 16 KiB pieces · 2 the limits · 3 the guest
  Every click keeps the same layout: findings dim or light, and the editor
  crossfades between files in one grid cell.
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

type Line = { n?: number, t: string, hit?: boolean }
const findings: { h: string, p: string, cite: string, file: string, lines: Line[] }[] = [
  {
    h: 'The host frames each reply as one JSON object',
    p: 'With a stream open it sends the frame; otherwise it writes a file.',
    cite: 'McpCode/CodeExecution.cs:137-145',
    file: 'McpCode/CodeExecution.cs',
    lines: [
      { n: 137, t: 'var reply = CodeJson.FrameBytes(new' },
      { n: 138, t: '{' },
      { n: 139, t: '    version = 2,' },
      { n: 140, t: '    runId,' },
      { n: 141, t: '    sequence,' },
      { n: 142, t: '    result = safe,' },
      { n: 143, t: '});' },
      { n: 144, t: 'if (stream is not null)', hit: true },
      { t: '    await stream.Send(reply, ct);', hit: true },
      { n: 145, t: 'else await client.Write(id,', hit: true },
      { t: '    CallReplyPath(sequence), reply, ct);', hit: true },
    ],
  },
  {
    h: 'Send cuts a reply into 16,384-byte pieces',
    p: 'Each piece goes base64 into its own WebSocket message, then a newline.',
    cite: 'McpCode/AcaExecStream.cs:55-61',
    file: 'McpCode/AcaExecStream.cs',
    lines: [
      { n: 55, t: '// A reply can exceed a platform frame.' },
      { t: '// Keep its chunks together, …' },
      { n: 56, t: 'for (var offset = 0; offset < bytes.Length;', hit: true },
      { t: '     offset += 16384)', hit: true },
      { n: 57, t: '{' },
      { n: 58, t: '    var frame = CodeJson.FrameBytes(new {', hit: true },
      { t: '        type = "stdin",', hit: true },
      { t: '        data = Convert.ToBase64String(…) });', hit: true },
      { n: 59, t: '    await socket.SendAsync(frame, …);', hit: true },
      { n: 60, t: '}' },
      { n: 61, t: 'await socket.SendAsync("{\\"type\\":\\"stdin\\",' },
      { t: '    \\"data\\":\\"Cg==\\"}"u8.ToArray(), …);' },
    ],
  },
  {
    h: 'The limits cap whole replies, not one message',
    p: 'The 16 KiB piece size appears only as a literal.',
    cite: 'McpCode/CodeJson.cs:17-20',
    file: 'McpCode/CodeJson.cs',
    lines: [
      { n: 14, t: 'public static class CodeJson' },
      { n: 15, t: '{' },
      { n: 16, t: '    public const int SourceBytes = RequestBytes;' },
      { n: 17, t: '    public const int RequestBytes = 64 * 1024;', hit: true },
      { n: 18, t: '    public const int ReplyBytes =', hit: true },
      { t: '        8 * 1024 * 1024;', hit: true },
      { n: 19, t: '    public const int FinalBytes = 64 * 1024;', hit: true },
      { n: 20, t: '    public const int ConcurrentCalls = 8;', hit: true },
    ],
  },
  {
    h: 'The guest rebuilds each reply from whole lines',
    p: 'It never sees how many messages carried a line.',
    cite: 'resources/worker-v2.mjs:49-53',
    file: 'McpCode/resources/worker-v2.mjs',
    lines: [
      { n: 47, t: 'if (streaming) void (async () => {' },
      { n: 48, t: '  try {' },
      { n: 49, t: '    for await (const line of incoming) {', hit: true },
      { n: 50, t: '      if (Buffer.byteLength(line) > 8388608)' },
      { t: '        throw new Error(\'byte_limit\');' },
      { n: 51, t: '      const reply = JSON.parse(line);', hit: true },
      { n: 52, t: '      if (reply.version !== 2 || …)' },
      { t: '        throw new Error(\'invalid_reply\');' },
      { n: 53, t: '      replies.get(reply.sequence)', hit: true },
      { t: '        .resolve(reply.result);', hit: true },
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
        <header><span class="tab">{{ f.file }}</span><em>opened at lines {{ f.cite.split(':')[1] }}</em></header>
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
