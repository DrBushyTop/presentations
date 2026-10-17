# slidev-addon-t3-annotate

Chat with a T3 Code agent about the running deck. Point at things on a slide,
say what should change, and watch the agent work and reply. Works in the
presenter view and the normal play view, only on the dev server (`slidev`
without `build`).

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
- **Chat** (speech bubble) opens the chat panel.
  - The header picks the conversation: a new chat, one of this deck's earlier
    chats, or another open thread in the project.
  - While the agent works, the panel shows its current step (reading a file,
    running a command) and then its reply. The nav button pulses while it
    works and shows a dot when a reply arrives with the panel closed.
  - Attached notes sit above the message box, each with a screenshot of the
    slide at that click step and the picks and drawings on it. Sent notes stay
    in the history as thumbnails that jump to their slide.
  - Enter sends, Shift+Enter adds a line. A message without notes is fine.
  - Model and effort come from T3's live catalog and apply to new chats.

### When the deck changes

The agent's edits hot-reload, and the chat keeps going:

- Slide content, frontmatter and styles update in place. Nothing is lost.
- If slides are added, removed or reordered above a note, the note moves with
  its slide. An unfinished note also takes the view along, so it stays on the
  slide it describes.
- Headmatter edits and dev server restarts reload the page. The message, the
  notes and the deck's chats are in local storage (per deck). The open panels
  and an unfinished note are in session storage (per tab), so they come back.
  Screenshots that were still rendering are rendered again.

## What the agent gets

Every message ends with a short context block: the slide you are on and its
source lines. The first message of a chat also names the deck file and the dev
server URL. For each note the agent gets the slide number and click step,
source file and line range, the comment, picked elements (selector, text,
trimmed HTML, the Vue component that rendered them) and a reference to the
attached screenshot. Up to 8 screenshots are attached. The chat shows only
what you wrote.

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
  the chat panel.
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
the system temp directory. Sent ones stay there for 14 days so the chat
history can show them. Replies are rendered from Markdown on the dev server
with `markdown-it`, raw HTML off.
