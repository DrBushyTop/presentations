# slidev-addon-t3-annotate

Point at things on a running deck, say what should change, and send it to a
T3 Code agent thread. Works in the presenter view and the normal play view,
only on the dev server (`slidev` without `build`).

Enable it in a deck's headmatter:

```yaml
addons:
  - slidev-addon-t3-annotate
```

## Use

Two buttons appear in the nav bar:

- **Annotate** (cursor icon) opens the picker over the slide.
  - **Select**: click an element. Shift or ⌘ adds more, clicking a picked one removes it. **Parent ↑** widens the pick.
  - **Area**: drag a box.
  - **Draw** / **Erase**: freehand marks in red.
  - **Slide note**: a comment about the whole slide.
  - Type the change and press Enter to attach it. Esc clears, Esc again exits.
- **Agent request** (speech bubble) opens the tray with the attached notes.
  - Each note shows a screenshot of the slide at that click step, with the picks and drawings on it.
  - The message box takes free text. A message with no notes is fine; the prompt then says which slide you are on.
  - **Send to**: a new thread, or a follow-up to one of the project's open threads. After a send the tray keeps the thread selected for the next follow-up.
  - Model and effort come from T3's live catalog and apply to new threads.
  - **Preview prompt** shows exactly what the agent will receive.

The draft survives reloads (local storage, per deck).

## What the agent gets

The prompt names the deck file, the dev server URL, and for each note: the
slide number and click step, source file and line range, the comment, picked
elements (selector, text, trimmed HTML, the Vue component that rendered them)
and a reference to the attached screenshot. Up to 8 screenshots are attached.

New threads open in the T3 project whose workspace is this repository (or a
worktree of it) with **full-access** runtime mode, so the agent can edit and
check the slides without asking.

## Sign-in and tokens

T3's MCP endpoint needs a bearer token. The dev server gets one on first use
with T3's outside-agent OAuth flow: it runs `t3 auth pairing create` to mint a
one-time pairing code (valid 2 minutes) and exchanges it for a token. Nothing
needs to be approved by hand.

- The token is kept only in the dev server's memory. It is never written to
  disk or sent to the browser.
- The T3 session is revoked when the dev server stops (Ctrl-C, SIGINT, SIGTERM, SIGHUP,
  normal exit, Slidev restart), after 2 hours of no use, or with **Sign out** in
  the tray.
- If a dev server is killed hard (`kill -9`, crash), its session is left
  behind. The next sign-in revokes sessions from dead dev servers. They show in
  `t3 auth session list` as `Slidev annotate · pid <n>`.

## Security limits

The `/__t3-annotate/` routes answer only loopback and Tailscale addresses,
because the decks listen on all interfaces. POST requests need a custom header
and a same-origin `Origin`, so another site open in the browser cannot call
them.

## Settings

| Variable | Default | Purpose |
| --- | --- | --- |
| `T3_ANNOTATE_URL` | port from `~/.t3/userdata/server-runtime.json` | T3 server origin |
| `T3CODE_CLI_PATH` | `~/.t3/bin/t3`, then `t3` on `PATH` | T3 CLI used for pairing and revoking |

Screenshots are rendered with Playwright Chromium (`playwright-chromium`) into
the system temp directory and deleted after they are sent.
