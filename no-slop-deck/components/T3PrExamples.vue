<template>
  <div class="examples">
    <article class="example">
      <header>
        <a href="https://github.com/pingdotgg/t3code/pull/11354" target="_blank" rel="noopener noreferrer">PR #11354 ↗</a>
        <span>Merged 12 Sep 2026</span>
      </header>
      <h2>The browser sent an unfinished draft</h2>

      <div class="drafts">
        <p class="trigger">Agent presses <kbd>Enter</kbd> in the preview</p>
        <div class="state before">
          <span>Before</span>
          <div class="draft">
            <code>Still writing...</code>
            <strong>Sent</strong>
          </div>
        </div>
        <div class="state after">
          <span>After</span>
          <div class="draft">
            <code>Still writing...</code>
            <strong>Draft kept</strong>
          </div>
        </div>
      </div>

      <nav aria-label="PR 11354 videos">
        <a href="https://github.com/user-attachments/assets/8b4c07cf-9f9d-408a-9bd7-cc88a29f961e" target="_blank" rel="noopener noreferrer">▶ Before · 10 s</a>
        <a href="https://github.com/user-attachments/assets/736c3026-9744-4446-8b7e-49eb8a8c2888" target="_blank" rel="noopener noreferrer">▶ After · 14 s</a>
      </nav>
    </article>

    <article class="example">
      <header>
        <span>Review bots on the same PR</span>
      </header>
      <h2>Two findings, settled by running it</h2>

      <div class="findings">
        <div class="finding kept">
          <p class="by"><b>Macroscope</b> · High</p>
          <p class="claim">Pasted HTML could run a script in the preview</p>
          <p class="end"><strong>Fixed</strong>Reproduced first, then checked again</p>
        </div>
        <div class="finding dropped">
          <p class="by"><b>CodeRabbit</b> · Major</p>
          <p class="claim">Selection won't move in text fields</p>
          <p class="end"><strong>Withdrawn</strong>The agent showed it works in Electron</p>
        </div>
      </div>

      <nav aria-label="PR 11354 review threads">
        <a href="https://github.com/pingdotgg/t3code/pull/11354#discussion_r3994847850" target="_blank" rel="noopener noreferrer">Fix thread ↗</a>
        <a href="https://github.com/pingdotgg/t3code/pull/11354#discussion_r3994836449" target="_blank" rel="noopener noreferrer">Withdrawal ↗</a>
      </nav>
    </article>
  </div>
</template>

<style scoped>
.examples {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  height: 510px;
}

.example {
  min-width: 0;
  padding: 22px;
  border: 1px solid var(--ns-line);
  background: #fff;
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 18px;
}

header a {
  font-weight: 700;
}

header span {
  color: var(--z-grey-600);
}

.example h2 {
  margin: 16px 0 0;
  font-size: 28px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.drafts {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
}

.example p {
  margin: 0;
  max-width: none;
}

.trigger {
  font-size: 20px;
  line-height: 1.4;
}

kbd {
  padding: 3px 8px;
  border: 1px solid var(--ns-line);
  border-bottom-width: 3px;
  border-radius: 5px;
  background: var(--ns-soft);
  font-family: var(--ns-mono);
  font-size: 18px;
}

.state {
  display: grid;
  grid-template-columns: 64px 1fr;
  align-items: center;
  gap: 12px;
  font-size: 20px;
}

.draft {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 18px 14px;
  border-left: 4px solid;
  background: var(--ns-soft);
}

.draft code {
  padding: 0;
  background: transparent;
  font-family: var(--ns-mono);
  font-size: 18px;
}

.draft strong {
  font-size: 18px;
  white-space: nowrap;
}

.before .draft { border-color: var(--ns-red); }
.before strong { color: var(--ns-red); }
.after .draft { border-color: var(--ns-teal); }
.after strong { color: var(--ns-teal); }

.findings {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.finding {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-left: 4px solid;
  background: var(--ns-soft);
}

.finding .by {
  font-size: 17px;
  color: var(--z-grey-600);
}

.finding .by b {
  color: var(--z-ink);
}

.finding .claim {
  font-size: 20px;
  line-height: 1.3;
}

.finding .end {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 17px;
  color: var(--z-ink-800);
}

.finding .end strong {
  font-size: 17px;
  white-space: nowrap;
}

.kept { border-color: var(--ns-teal); }
.kept .end strong { color: var(--ns-teal); }
.dropped { border-color: var(--z-grey-600); }
.dropped .end strong { color: var(--z-grey-600); }

nav {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

nav a {
  display: block;
  padding: 9px 12px;
  border: 1px solid var(--ns-teal);
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.example a {
  color: var(--ns-teal);
  text-decoration: none;
}

.example a:hover,
.example a:focus-visible {
  text-decoration: underline;
  text-underline-offset: 4px;
}
</style>
