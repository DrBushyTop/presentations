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

## No slop engineer planning page

`no-slop-engineer/` contains an interactive outline workbench with structure options,
case studies, timings, demo plans and a standalone source notebook. Run it with
`npm run start:no-slop-engineer`. See [its README](no-slop-engineer/README.md)
for the M1 Tailscale link and serving details.

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
