# Zure Slidev presentations

This repository contains reusable Slidev themes and individual presentations.

## Presentations

- `coding-agents/` contains **How I develop with coding agents**.
- `database-modernization/` contains the initial **Modernizing databases** deck.
- `agent-building-blocks/` contains **Skills, tools and agent boundaries**,
  a six-slide companion on configuration, reusable skills, context and subagents.
- `workshop-intro/` contains an eight-slide, ten-minute **App modernization lab**
  introduction, including setup and lab troubleshooting tips.

Run the coding agents deck:

```bash
npm install
npm run dev
```

Run the database modernization deck:

```bash
npm run dev:database-modernization
```

Run the skills and agent boundaries deck:

```bash
npm run dev:agent-building-blocks
```

Build all decks:

```bash
npm run build:all
```

Run the workshop intro:

```bash
npm run dev:workshop-intro
```

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
