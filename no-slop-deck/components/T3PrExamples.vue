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

      <p class="lesson">Check a review finding against the running app.</p>
      <nav aria-label="PR 11354 videos">
        <a href="https://github.com/user-attachments/assets/8b4c07cf-9f9d-408a-9bd7-cc88a29f961e" target="_blank" rel="noopener noreferrer">▶ Before · 10 s</a>
        <a href="https://github.com/user-attachments/assets/736c3026-9744-4446-8b7e-49eb8a8c2888" target="_blank" rel="noopener noreferrer">▶ After · 14 s</a>
      </nav>
    </article>

    <article class="example">
      <header>
        <a href="https://github.com/pingdotgg/t3code/pull/15265" target="_blank" rel="noopener noreferrer">PR #15265 ↗</a>
        <span>Merged 3 Oct 2026</span>
      </header>
      <h2>A one-line fix for UI stalls</h2>

      <div class="restyles">
        <p class="metric-label">Elements restyled by a small DOM change</p>
        <div class="counts">
          <div><span>Before</span><strong class="before-count">4,316</strong></div>
          <span class="arrow" aria-hidden="true">→</span>
          <div><span>After</span><strong class="after-count">5</strong></div>
        </div>
        <div class="selector ns-mono">
          <div class="removed">- +:has([data-chat-composer-form])</div>
          <div class="added">+ +*</div>
        </div>
      </div>

      <p class="lesson">A small diff, backed by before/after measurements.</p>
      <nav aria-label="PR 15265 videos">
        <a href="https://gh-file-drop-api-prod-galwoqjslzlnws6s.oliver-boorstein.workers.dev/f/394e1521973c46e6/pr-b-real-4x.mp4" target="_blank" rel="noopener noreferrer">▶ Compare · 15 s</a>
        <a href="https://gh-file-drop-api-prod-galwoqjslzlnws6s.oliver-boorstein.workers.dev/f/78e9787a48b5e37a/pr-b-stress-4x.mp4" target="_blank" rel="noopener noreferrer">▶ Stress test · 47 s</a>
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
  min-height: 72px;
  font-size: 28px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.drafts,
.restyles {
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

.trigger,
.metric-label {
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
.before strong, .before-count { color: var(--ns-red); }
.after .draft { border-color: var(--ns-teal); }
.after strong, .after-count { color: var(--ns-teal); }

.counts {
  display: flex;
  align-items: center;
  gap: 28px;
}

.counts div {
  display: flex;
  flex-direction: column;
}

.counts div > span {
  font-size: 18px;
  color: var(--z-grey-600);
}

.counts strong {
  font-size: 72px;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.arrow {
  font-size: 40px;
  color: var(--z-grey-600);
}

.selector {
  padding: 12px 14px;
  background: var(--z-ink);
  font-size: 17px;
  line-height: 1.6;
}

.removed { color: #ff9a8a; }
.added { color: var(--z-teal-300); }

.example .lesson {
  min-height: 58px;
  margin: 18px 0 12px;
  font-size: 23px;
  line-height: 1.25;
  font-weight: 600;
}

nav {
  display: flex;
  gap: 12px;
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
