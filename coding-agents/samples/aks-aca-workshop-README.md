# Workshop slide deck

Zure-styled [Slidev](https://sli.dev) deck for the AKS Automatic and Azure
Container Apps workshop. 121 slides: Lessons 01–08, six break slides, and four
appendices. Every slide carries presenter notes.

Sized for a room of **12 participants** — six pairs in the Kubernetes lab, three
groups of four in the closing decision exercise.

## Run

```bash
cd slides
npm install
npm run dev        # http://localhost:3030
```

Presenter mode is at `/presenter/`, the slide grid at `/overview/`.

To reuse the deck for another customer, change `customerName` once in the
opening frontmatter of `slides.md`. Customer-specific slide copy reads that
deck-level value.

## Demo workspaces

The live demos use Zellij inside Ghostty so one paste creates every observer and
a focused presenter shell. Install it once with `brew install zellij`, export the
workshop variables from the setup slide, then run a numbered workspace from the
repository root:

```bash
zsh slides/scripts/demo-workspace 02
```

Layouts live in `slides/zellij/demo-01.kdl` through `demo-06.kdl`. Read-only
observers start immediately in paired ACA and AKS columns; enqueue, failure and
deployment-change panes wait for Enter. Every scene keeps a focused presenter
shell. Outside Zellij the launcher creates its reserved `aks-workshop-demo-NN`
session; if it is running, the launcher adds a fresh tab from the current
layout before attaching, and if it has exited, the launcher replaces it. Inside
Zellij it opens the layout as a new tab.

The layouts call `slides/scripts/demo-command` for repeatable queue,
revision/replica/container, Pod, node and log observers. Demos 03–06 preload the
ACA and AKS trigger sequences, so the presenter never has to paste a command
into an individual pane.

## Export

```bash
npm run build                 # static site in slides/dist/
npm run export                # PDF (needs playwright-chromium)
npm run export-pptx           # PPTX; slides become images
```

A PDF is written to `dist/zure-aks-aca-workshop.pdf` at the repository root when
you run `npx slidev export --output ../dist/zure-aks-aca-workshop.pdf`.

## Files

| Path | Purpose |
| --- | --- |
| `slides.md` | All slide content |
| `theme/package.json` | Local Slidev theme metadata and defaults |
| `theme/styles/index.css` | Zure theme, design tokens, and light/dark variants |
| `theme/setup/mermaid.ts` | Mermaid configuration matched to the Zure palette |
| `global-top.vue` | Persistent footer (part label + slide number) |
| `public/assets/` | Cover, eight part motifs, and the break motif |

## Design system

Palette taken from the zure.com design tokens:

| Token | Value | Use |
| --- | --- | --- |
| Fierce red | `#DE1E05` | Emphasis, AKS, bullet marks, section rule |
| Frozen blue | `#037F91` | Structure — column labels, table headers, ACA |
| Ink | `#1A1A1A` | Titles and body text, dark slide backgrounds |
| Greys | `#F3F3F2` `#D9D9D6` `#666666` | Code surfaces, rules, citations |

Typeface is **Inter** (Google Fonts) as the closest freely available substitute
for Zure's licensed Neue Haas Grotesk.

The deck uses the shared **Zure** theme (`theme: zure`). Slidev supports one
theme per deck, so the two requested treatments are variants within that theme:
light is the default, while `.theme-dark` supplies the black-background token
set. Existing full-bleed dark slides use `.zdark`, which applies the same dark
tokens. Author slide colors with the semantic `--z-*` variables from the theme
rather than literal color values.

## Formatting rules

The deck follows the `academic-pptx` skill:

- White background on every content slide.
- **Action titles** — each title is a complete sentence stating the takeaway.
  Reading the titles alone tells the whole argument (ghost deck test).
- One exhibit per slide, with a "so what" annotation where it earns one.
- Evidence on the left, interpretation on the right.
- Three colours maximum; no decorative icons or accent rules under titles.
- Every borrowed claim carries an in-slide citation; full list on the
  References slide.
- Conclusions is the last main slide — it stays on screen during discussion.

## Authoring conventions

Per-slide frontmatter:

| Key | Effect |
| --- | --- |
| `part:` | Text shown in the persistent footer |
| `nofooter: true` | Hides the footer (cover, section dividers, conclusions) |
| `class: dense` | Smaller table type for the highest-row-count tables |
| `layout: none` + `class: zsection` | Full-bleed cover, divider, break or dark slide |
| `class: mermaid-inline` | Shrinks a diagram sharing its column with a code block |

Useful CSS classes: `.exhibit` / `.exhibit-wide` (two-column grid),
`.col-label`, `.sowhat`, `.note`, `.cite`, `.aks`, `.aca`, `.decision`.

Long code samples use Slidev's scrolling code blocks so they can stay complete
and still fit the slide:

````md
```yaml {1-7|8-11|12-14}{maxHeight:'418px'}
````

The stepped highlight groups advance on click and the block auto-scrolls to
bring the highlighted range into view. When nearby text explains those ranges,
use explicit click numbers so the explanation appears with its matching
highlight: keep the first item visible, then use `v-click="1"`,
`v-click="2"`, and so on. Do not place the whole list in a trailing
`<v-clicks>` block, which makes every code highlight run before any explanation
appears. End a stepped walkthrough with `|all` so the final view leaves the
complete code excerpt readable.

Independent interpretation bullets may still use `<v-clicks>` to reveal one at
a time. Evidence columns, appendices and the References slide are deliberately
*not* click-gated.

Mermaid flowcharts can use the local `<MermaidSteps>` controller to reveal
named nodes and edges in sync with explicit text clicks:

```vue
<MermaidSteps :steps="[
  { nodes: ['C', 'G'], focusNodes: ['G'], edges: ['C->G'] },
  { nodes: ['R'], edges: ['G->R'] },
]" />
```

Place it immediately after the Mermaid block inside the same wrapper. Node names
are the Mermaid IDs from the diagram; edges use `FROM->TO`. Use `at` when the
first matching text appears after click zero, for example
`{ at: 1, nodes: ['A'] }`. The component keeps earlier steps visible, dims future
steps, highlights the current node and draws the current edge. It uses the
existing Slidev click index and adds no clicks of its own.

## Presenter notes

Every slide has a note covering the beat of the slide: what to emphasise, what to
ask the room, what to avoid getting drawn into, and how it hands over to the next
slide. Open presenter mode (`/presenter/`) to see them. They assume a room of
twelve and name the two participation moments explicitly.

## Facilitation for 12 participants

| Moment | Format |
| --- | --- |
| Lesson 01 opening exercise | 60 seconds silent writing, then a show of hands per workload. Record the tally on a flipchart — you need it at 16:30. |
| Lesson 03 lab | Six pairs. Assign them yourself rather than letting the room self-organise. |
| Lesson 08 exercise | Three groups of four. Everyone does Scenario 1 so findings are comparable; A takes 2, B takes 3, C takes 5; Scenario 4 is walked through together. |

Three groups is deliberate: five groups would leave under two minutes each for
the readout, and four-person groups are large enough for disagreement but small
enough that nobody hides.

## Accuracy

Platform claims in the deck were validated against Microsoft Learn before
writing. Notable points that commonly go stale:

- The `approuting-istio` GatewayClass is the default only for **new AKS
  Automatic clusters on AKS 1.36+**.
- An **ACA environment private endpoint requires public network access to be
  disabled** — ACA couples the two settings, unlike ACR, Key Vault and Storage.
- **Service Bus Private Link is Premium-only**; the workshop deliberately uses
  Standard.
- ACA workload-profile environments need a **/27** subnet; legacy
  Consumption-only environments need **/23**.
- Azure Service Bus OpenTelemetry messaging spans are still experimental and
  require `Azure.Experimental.EnableActivitySource`.
- AKS Automatic defaults to **Azure RBAC only with local accounts disabled**, so
  there is no static kubeconfig. Terraform/Helm/CI must use a bearer token or the
  `kubelogin` exec plugin.

Re-check these before each delivery.
