# Zure Slidev presentations

This repository contains reusable Slidev themes and individual presentations.

## Presentations

- `coding-agents/` contains **How I develop with coding agents**.
- `database-modernization/` contains the initial **Modernizing databases** deck.
- `agent-building-blocks/` contains **Skills, tools and agent boundaries**,
  a six-slide companion on configuration, reusable skills, context and subagents.
- `workshop-intro/` contains an eight-slide, ten-minute **App modernization lab**
  introduction, including setup and lab troubleshooting tips.
- `no-slop-deck/` contains **The no slop engineer**, a 60-minute ESPC talk.
  Each slide builds with clicks. Components take a `step` prop set from
  `$clicks` instead of using `v-click`. The export lab and review budget
  slides are live: their controls work during the talk.

Run a deck interactively:

```bash
npm install
npm run dev
```

Or run a specific deck:

```bash
npm run dev:coding-agents
npm run dev:database-modernization
npm run dev:agent-building-blocks
npm run dev:workshop-intro
npm run dev:no-slop
```

`npm run build` builds every deck. Use `npm run export` or
`npm run export-pptx` to select one for export.

## Live viewer

The audience can follow any deck on their own devices at
`https://live.huuhka.net/`. The page is read-only and stays on the
presenter's slide. The latest deck started takes the site over and updates it
if needed. The presenter view can share a screen with viewers, and Slidev's
camera bubble goes to them too, with the voice.

```bash
npm run live -- --deck no-slop          # present; Ctrl+C ends the talk for viewers
npm run live:stop                       # end whatever talk is live
```

See [the live addon guide](addons/live/README.md) for setup, presenting from
m1 or m4, how it works and the measured latency.

## Phone clicker

Every deck's dev server has a Back and Next clicker for a phone on Tailscale at
`/clicker`. The terminal prints its address and a QR code. See
[the clicker addon guide](addons/clicker/README.md).

## Rehearsal timing

All five primary Slidev decks include a rehearsal timer in presenter view. Click **Rehearsal**
to start a run, pause for interruptions, and finish to see slide and section times.
Returning to a slide adds to its total. Results save locally and export as CSV or
JSON, or as an HTML report with charts, slide content and speaker notes. Select potential cuts to estimate time saved. The no-slop target is 60 minutes.

See [the rehearsal addon guide](addons/rehearsal/README.md) for usage, recovery and
browser requirements.

## Shared presentation code

- `themes/zure/` is the reusable Zure theme. It includes typography, layouts,
  the footer, branding and shared visual styles.
- `themes/shared/` is a Slidev addon containing Mermaid configuration and the
  `<MermaidSteps>` click controller. Add it beside the chosen theme in a deck's
  headmatter.

```yaml
theme: zure
addons:
  - slidev-addon-shared-mermaid
```

Each presentation keeps its own `slides.md`, `style.css`, components, assets and
Vite configuration in its directory.
