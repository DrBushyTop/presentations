# How I develop with coding agents

A [Slidev](https://sli.dev) presentation about Pasi Huuhka's human-led
development workflow with coding agents, using the local Zure theme.

## Run

```bash
npm install
npm run dev
```

The presentation opens at `http://localhost:3030`. Presenter mode is available
at `/presenter/` and the slide overview at `/overview/`.

## Edit the presentation

The slide content and presenter notes are in `slides.md`. Presentation-specific
layouts are in `style.css`; the reusable theme remains under `theme/`.

The previous AKS and Azure Container Apps workshop is preserved in
`samples/aks-aca-workshop.md`. It contains more extensive examples of tables,
code blocks, Mermaid diagrams, click animations, citations, and presenter notes.
The earlier blank starter is preserved as `samples/starter.md`.

Run the archived sample with:

```bash
npm run sample
```

## Export

```bash
npm run build
npm run export
npm run export-pptx
```

## Theme conventions

- Use complete-sentence slide titles that state the takeaway.
- Prefer one exhibit or main idea per slide.
- Use `.exhibit` or `.exhibit-wide` for two-column content.
- Use `.col-label`, `.sowhat`, `.note`, and `.cite` for common treatments.
- Use `part:` in slide frontmatter to update the footer section label.
- Use `nofooter: true` on full-bleed section and closing slides.
- Use semantic `--z-*` CSS variables for any presentation-specific styling.

The theme source is in `theme/`, the persistent footer is in `global-top.vue`,
and static images are served from `public/assets/`.
