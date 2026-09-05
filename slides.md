---
theme: ./theme
title: How I develop with coding agents
titleTemplate: '%s · Zure'
author: Pasi Huuhka
info: |
  The workflow I currently use to develop software with coding agents.
class: text-left
highlighter: shiki
lineNumbers: false
drawings:
  enabled: true
  persist: false
transition: none
aspectRatio: 16/9
canvasWidth: 1280
colorSchema: light
download: true
exportFilename: how-i-develop-with-coding-agents
fonts:
  provider: google
  sans: Inter
  mono: JetBrains Mono
  weights: '400,600,700'
seoMeta:
  ogTitle: How I develop with coding agents
  ogDescription: How I research, structure, implement and review work with coding agents.
---

<div class="zcover">
  <div class="zcover-text">
    <p class="eyebrow">My current development workflow</p>
    <h1>How I develop<br />with coding agents</h1>
    <p class="zcover-sub">How I structure the work, switch models and check what they built.</p>
    <p class="zcover-meta">Pasi Huuhka · Zure · 2026</p>
  </div>
  <div class="zcover-art">
    <img src="/assets/cover-streams-to-lake.png" alt="Watercolor mountain streams converging into a lake" />
  </div>
</div>

<!--
This is a snapshot of what works for me right now. It is not meant to be the
correct way to work. The tools will change again soon enough.
-->

---
nofooter: true
layout: none
class: zsection
---

<div class="zdark zdark-center">
  <p class="eyebrow">The operating principle</p>
  <p class="zbig">The agent can write the code. I still own the decisions.</p>
  <p class="zdark-note">I want my assumptions out in the open before implementation makes them expensive.</p>
</div>

<!--
"Human in the loop" is too vague for me. I own the intent, the trade-offs and
the decision to accept the work.
-->

---
part: Operating model
---

# I add process when the task earns it

<div class="ceremony-grid">
  <div class="ceremony-card">
    <p class="ceremony-size">Small</p>
    <h2>Talk to the coding agent</h2>
    <p>The desired result and likely change are already clear.</p>
  </div>
  <div v-click="1" class="ceremony-card">
    <p class="ceremony-size">Medium</p>
    <h2>Structure → Implement</h2>
    <p>I write enough structure to make scope, slices and checks clear.</p>
  </div>
  <div v-click="2" class="ceremony-card ceremony-card-accent">
    <p class="ceremony-size">Large or risky</p>
    <h2>QRSPI</h2>
    <p>Questions, research and design. Then I usually implement from structure.</p>
  </div>
</div>

<div v-click="3" class="sowhat mt-6">
I do not want maximum ceremony. I want the least structure that gets me to the right result.
</div>

<p class="cite">Source: <a href="https://www.huuhka.net/research-plan-implement/">Pasi Huuhka, Research - Plan - Implement</a> · <a href="https://docs.humanlayer.com/guide/skills-workflows">HumanLayer workflow guide</a></p>

<!--
Small tasks should stay small. I add the full flow when the task is messy,
risky or expensive to redo.
-->

---
nofooter: true
layout: none
class: zsection
---

<div class="zsplit">
  <div class="zsection-body">
    <p class="eyebrow">Part 01</p>
    <h1>One way of working, several harnesses and models</h1>
    <p class="zsection-sub">I keep the habits even when I switch the tools underneath.</p>
  </div>
  <div class="zsplit-art">
    <img src="/assets/section-tools-converging-paths.png" alt="Several mountain paths converging into one route" />
  </div>
</div>

<!--
The tools are replaceable on purpose. For daily work, consistent habits matter
more to me than chasing the theoretically best UI for every model.
-->

---
part: Operating model
---

# I keep the workflow while I switch the tools

<div class="stack-map">
  <div class="stack-layer stack-human">
    <span class="stack-label">Direction</span>
    <strong>Me</strong>
    <span>Intent · decisions · review · acceptance</span>
  </div>
  <div v-click="1" class="stack-connector">↓</div>
  <div v-click="1" class="stack-layer">
    <span class="stack-label">Workspace</span>
    <strong>T3 Code</strong>
    <span>The place where I juggle projects and conversations</span>
  </div>
  <div v-click="2" class="stack-connector">↓</div>
  <div v-click="2" class="stack-split">
    <div class="stack-layer"><span class="stack-label">Harness</span><strong>OpenCode</strong><span>Custom agents, commands, skills and providers</span></div>
    <div class="stack-layer"><span class="stack-label">Harness</span><strong>Codex</strong><span>Fast implementation and native tool loops</span></div>
  </div>
  <div v-click="3" class="stack-connector">↓</div>
  <div v-click="3" class="stack-layer stack-models">
    <span class="stack-label">Capacity</span>
    <strong>Foundry · GitHub Copilot · direct subscriptions</strong>
    <span>I use whichever available model fits the work</span>
  </div>
</div>

<p class="cite">Sources: <a href="https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md">T3 Code documentation</a> · <a href="https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/">How I currently develop with LLM models</a></p>

<!--
T3 Code is where I work. OpenCode and Codex still run the agents underneath.
The UI does not make those harnesses behave the same way.
-->

---
nofooter: true
layout: none
class: t3-workspace-slide
---

<img class="t3-workspace-image" src="/assets/t3-code-workspace.png" alt="T3 Code with a project list, an agent conversation and a live Slidev preview open side by side" />

<!--
T3 Code keeps active projects, the agent conversation and browser evidence in
one workspace. OpenCode and Codex still do the underlying agent work.
-->

---
part: Operating model
class: model-routes-slide
---

# I use three routes to model capacity

<table>
  <thead>
    <tr><th>Route</th><th>Why I use it</th></tr>
  </thead>
  <tbody>
    <tr v-click="1">
      <td><div class="route-cell"><span class="route-logo route-logo-foundry"><img src="/assets/azure-ai-foundry.svg" alt="" /></span><strong>Microsoft Foundry</strong></div></td>
      <td>Models hosted by a customer, or models I deploy for my own use</td>
    </tr>
    <tr v-click="2">
      <td><div class="route-cell"><span class="route-logo route-logo-copilot"><img src="/assets/github-copilot.svg" alt="" /></span><strong>GitHub Copilot</strong></div></td>
      <td>My primary route to Anthropic models</td>
    </tr>
    <tr v-click="3">
      <td><div class="route-cell"><span class="route-logo route-logo-openai"><img src="/assets/openai.svg" alt="" /></span><strong>Direct vendor subscriptions</strong></div></td>
      <td>Subsidized access when direct vendor use is allowed</td>
    </tr>
  </tbody>
</table>

<div v-click="4" class="sowhat mt-6">
The useful part is that I can change models without rebuilding how I work.
</div>

<p class="cite">Sources: <a href="https://www.huuhka.net/connecting-opencode-with-microsoft-foundry-models/">Connecting OpenCode with Microsoft Foundry models</a> · <a href="https://opencode.ai/v2/docs/providers">OpenCode provider documentation</a></p>

<!--
Foundry is especially useful when the model must run in a customer's
environment. I also use my own Foundry deployments.

GitHub Copilot is currently my main route to Anthropic models. Direct vendor
subscriptions can be cost-effective, but only when the project's data and
policy constraints allow them.

This is not a vendor comparison. Availability, pricing and rate limits change.
I want my workflow to survive those changes.
-->

---
part: Operating model
---

# The model is only one part of the setup

<div class="capability-grid">
  <div v-click="1" class="capability-card">
    <p class="col-label">Workflow state</p>
    <h2><code>dev_workflow</code></h2>
    <p>Keeps track of phases and marks later files stale when I rewind.</p>
  </div>
  <div v-click="1" class="capability-card">
    <p class="col-label">Visual creation</p>
    <h2>Image generation</h2>
    <p>Makes and edits assets as part of the same implementation loop.</p>
  </div>
  <div v-click="2" class="capability-card">
    <p class="col-label">Real application state</p>
    <h2>Browser tools</h2>
    <p>Give the agent the DOM, console, network, screenshots and interactions.</p>
  </div>
  <div v-click="2" class="capability-card">
    <p class="col-label">Reusable judgment</p>
    <h2>Skills</h2>
    <p>Add task-specific instructions when I need them.</p>
  </div>
</div>

<p class="cite">Source: <a href="https://www.huuhka.net/browser-verification-for-coding-agents-chrome-devtools-mcp-vs-agent-browser/">Browser verification for coding agents</a></p>

<!--
The model matters, but the surrounding tools decide what it can inspect, change
and verify.
-->

---
nofooter: true
layout: none
class: zsection
---

<div class="zsplit">
  <div class="zsection-body">
    <p class="eyebrow">Part 02</p>
    <h1>For large work, I use QRSPI</h1>
    <p class="zsection-sub">Usually structure goes straight to implementation. I add a separate plan only when it buys me something.</p>
  </div>
  <div class="zsplit-art">
    <img src="/assets/section-qrspi-cloud-mountains.png" alt="Layered mountain ridges resolving through cloud" />
  </div>
</div>

<!--
QRSPI is still useful shorthand. My current version puts more into spec and
structure, so I often skip the old separate plan step.
-->

---
part: QRSPI
---

# My current QRSPI flow usually skips the separate plan

<div class="phase-flow">
  <div class="phase-box"><span>Q</span><strong>Questions</strong><small>Bound the investigation</small></div>
  <div v-click="1" class="phase-arrow">→</div>
  <div v-click="1" class="phase-box"><span>R</span><strong>Research</strong><small>Map the current state</small></div>
  <div v-click="2" class="phase-arrow">→</div>
  <div v-click="2" class="phase-box phase-box-wide"><span>S</span><strong>Spec / design</strong><small>Choose the desired state</small></div>
  <div v-click="3" class="phase-arrow">→</div>
  <div v-click="3" class="phase-box"><span>↳</span><strong>Structure</strong><small>Create testable slices</small></div>
  <div v-click="4" class="phase-arrow">→</div>
  <div v-click="4" class="phase-box"><span>I</span><strong>Implement</strong><small>Execute and verify</small></div>
</div>

<div class="flow-artifacts">
  <span>questions.md</span><span v-click="1">research.md</span><span v-click="2">design.md</span><span v-click="3">structure.md</span><span v-click="4">code + evidence</span>
</div>

<div v-click="5" class="optional-plan mt-5">
  <span>Optional / legacy P</span>
  <strong>I add a detailed plan only when <code>structure.md</code> is not enough to implement safely.</strong>
</div>

<p class="cite">Source: <a href="https://docs.humanlayer.com/explanation/workflow-phases">HumanLayer, How workflow phases fit together</a></p>

<!--
The letters matter less than the handoffs. My dev tool supports both routes.
Usually it goes from structure to implementation. A separate plan still works.
-->

---
part: QRSPI
---

# I separate questions the agent can answer from decisions only I can make

<div class="exhibit">
<div v-click="1">

<p class="col-label">The agent should investigate</p>

- Where does the current behavior live?
- Which patterns and tests already exist?
- What constraints are encoded in code or docs?
- Which assumptions can be verified externally?

</div>
<div v-click="2">

<p class="col-label">I should decide</p>

- Which trade-off is acceptable?
- What is explicitly out of scope?
- Which behavior is the product promise?
- What evidence is enough to ship?

</div>
</div>

<div v-click="3" class="sowhat mt-6">
The agent should not ask me things it can find in the repo. The repo should not make product decisions for me.
</div>

<!--
The research-question agent explicitly checks that each question is objective
and answerable from code, documentation or existing artifacts.
-->

---
part: QRSPI
---

# Research tells the next agent where to look

<div class="exhibit exhibit-wide">
<div v-click="1">

<p class="col-label">Research records</p>

- Relevant files with precise locations
- How the current flow actually works
- Existing patterns worth following
- Prior decisions and known constraints
- Open questions that evidence cannot resolve

</div>
<div v-click="2">

<p class="col-label">Research does not</p>

- Fix the issue
- Choose the future architecture
- Paste entire files into the handoff
- Pretend uncertainty has disappeared

<div class="note mt-5">
The research file points to the smallest set of code the next agent needs to read.
</div>

</div>
</div>

<p class="cite">Sources: <a href="https://www.huuhka.net/research-plan-implement/">Research - Plan - Implement</a> · <a href="https://www.huuhka.net/primary-vs-subagents-in-llm-harnesses/">Primary vs subagents</a></p>

<!--
I want a short guide to the relevant code. I do not want a second copy of the
repository or a redesign I did not ask for.
-->

---
part: QRSPI
---

# I argue with the spec until the open questions are actually closed

<div class="exhibit">
<div v-click="1">

<p class="col-label">The design discussion</p>

- States current and desired behavior
- Makes exclusions explicit
- Presents options with a recommendation
- Keeps unresolved decisions visibly open
- Records rejected alternatives and risks

</div>
<div v-click="2">

<p class="col-label">When the idea is still fuzzy</p>

<p><code>/grill-me</code> pressure-tests the idea through questions.</p>

<p><code>/grill-with-docs</code> also writes settled vocabulary to <code>CONTEXT.md</code> and durable decisions to ADRs.</p>

<div class="sowhat mt-4">
These skills help me think. They do not do the thinking for me.
</div>

</div>
</div>

<p class="cite">Sources: <a href="https://www.aihero.dev/skills-grill-me">Matt Pocock, grill-me</a> · <a href="https://www.aihero.dev/skills-grill-with-docs">grill-with-docs</a></p>

<!--
I do not want to agree with every recommendation. I push on terminology, scope
and decisions that will be hard to reverse.
-->

---
nofooter: true
layout: none
class: image-only-slide
---

<img class="full-slide-image full-slide-image-contain" src="/assets/grilling-questions.png" alt="Agent discussion challenging an ownership model and recommending explicit accountable, managing and data-access owners" />

<!--
This is what grilling looks like in practice. The agent is not merely producing
a cleaner version of my first idea. It spots that "owner" hides several
different responsibilities, asks whether the model is sufficient and proposes
a concrete default.

The useful part is the disagreement. I want vague terms and convenient
assumptions challenged before they settle into the structure and then the code.
-->

---
part: QRSPI
---

# I split the structure into slices I can run and check

<div class="slice-grid">
  <div v-click="1" class="slice-card">
    <span class="slice-number">01</span>
    <h2>Thin path</h2>
    <p>Connect the minimum layers needed for one observable behavior.</p>
    <small>Verify: the path can be called or seen.</small>
  </div>
  <div v-click="2" class="slice-card">
    <span class="slice-number">02</span>
    <h2>Real behavior</h2>
    <p>Replace the stub with the real data, rules or integration.</p>
    <small>Verify: meaningful automated checks pass.</small>
  </div>
  <div v-click="3" class="slice-card">
    <span class="slice-number">03</span>
    <h2>Hardening</h2>
    <p>Add failure states, observability and operational edges.</p>
    <small>Verify: adversarial paths are covered.</small>
  </div>
</div>

<div v-click="4" class="sowhat mt-6">
A slice can cross several layers. What matters is that I can run it, see it or query it.
</div>

<p class="cite">Source: <a href="https://docs.humanlayer.com/explanation/workflow-phases">HumanLayer workflow phases</a></p>

<!--
Database, service, API and UI are not useful slices by themselves. They can
leave me with a pile of code and nothing I can check end to end.
-->

---
nofooter: true
layout: none
class: zsection
---

<div class="zdark zdark-center">
  <p class="eyebrow">The hard part</p>
  <p class="zbig">Keep a working mental model of the codebase.</p>
  <p class="zdark-note">Agents make that harder.</p>
</div>

<!--
This may be the most important point in the talk. Good software work depends on
a useful mental model: where responsibilities live, how data moves, which
assumptions hold and what a change might disturb.

Writing code used to build that model almost by accident. When an agent writes
most of the code, I lose that source of understanding. It is now easy to accept
plausible changes faster than I can absorb the system they create.

Research and structure force me to reconstruct the map before implementation.
Grilling forces unclear terms, hidden assumptions and unresolved decisions into
the open. Small slices and review help me update the map as the code changes.

None of this is perfect. A document can be wrong. A review can miss something.
I can believe I understand a system when I do not. The process reduces that
risk. It does not remove it.
-->

---
nofooter: true
layout: none
class: zsection
---

<div class="zsplit">
  <div class="zsection-body">
    <p class="eyebrow">Part 03</p>
    <h1>Implementation happens in small slices, with checks and a second opinion</h1>
    <p class="zsection-sub">The model can make local decisions. It cannot quietly redesign the task.</p>
  </div>
  <div class="zsplit-art">
    <img src="/assets/section-execution-staged-path.png" alt="One mountain path crossing four distinct terrain shelves" />
  </div>
</div>

<!--
Model speed matters here. Most of the open-ended thinking should already have
happened in research, design and structure.
-->

---
part: Execution
class: slice-evidence-loop-slide
---

# Every slice runs the same build, review and evidence loop

<div class="slice-evidence-loop">

```mermaid {theme:'base'}
flowchart TB
  subgraph BUILD[" "]
    direction LR
    P["structure.md<br/><b>testable slices</b>"]
    S["Take <b>slice n</b>"]
    B["Implement<br/><b>+ self-check</b>"]
    R["Adversarial review<br/><b>security + function</b>"]
    P --> S --> B --> R

    F["Fix findings<br/><b>and re-submit</b>"]
    R -->|findings| F
    F -->|same session| R
  end

  subgraph PROVE[" "]
    direction LR
    A["Automated gates<br/><b>tests · lint · types · build</b>"]
    V["Runtime proof<br/><b>browser · API · logs</b>"]
    H["Human review<br/><b>optional</b>"]
    N["Take <b>slice n+1</b><br/>↻"]
    A --> V --> H --> N
  end

  BUILD -->|clean| PROVE

  classDef artifact fill:#f3f3f2,stroke:#666666,stroke-width:2px,color:#1a1a1a
  classDef work fill:#ffffff,stroke:#037f91,stroke-width:2px,color:#1a1a1a
  classDef reviewer fill:#fff5f3,stroke:#de1e05,stroke-width:3px,color:#1a1a1a
  classDef gate fill:#ffffff,stroke:#666666,stroke-width:2px,color:#1a1a1a
  classDef human fill:#fff5f3,stroke:#de1e05,stroke-width:2px,color:#1a1a1a
  style BUILD fill:none,stroke:none
  style PROVE fill:none,stroke:none
  class P artifact
  class S,B,F,N work
  class R reviewer
  class A,V gate
  class H human
```

<MermaidSteps :steps="[
  { at: 0, nodes: ['P', 'S', 'B'], focusNodes: ['S'], edges: ['P->S', 'S->B'] },
  { at: 1, nodes: ['R'], focusNodes: ['R'], edges: ['B->R'] },
  { at: 2, nodes: ['F'], focusNodes: ['F', 'R'], edges: ['R->F', 'F->R'] },
  { at: 3, nodes: ['A', 'V'], focusNodes: ['A', 'V'], edges: ['BUILD->PROVE', 'A->V'] },
  { at: 4, nodes: ['H', 'N'], focusNodes: ['H', 'N'], edges: ['V->H', 'H->N'] },
]" />

</div>

<!--
Start from the approved structure or plan document and take one testable slice.
The builder implements it and self-checks before handing it to a separate
adversary. The adversary checks both functionality and security: the diff, edge
cases, tests, runtime behaviour and anything the builder quietly omitted.

When it finds problems, the builder fixes them and sends the work back to the
same review session. That matters because the reviewer retains the original
claims, its earlier findings and the evidence it asked for. They continue until
the reviewer has no findings left. Review is a loop, not a handoff.

A clean review is not the end. The automated gates still have to pass: tests,
linters, type checks and the build. Then validate the running behaviour through
the browser, API, logs or whatever interface makes the result observable.
Failures go back into the same fix-and-review loop.

Human review is shown as optional because I do sometimes skip it for low-risk
work. I have also been bitten by doing that. That is life, but it should be a
conscious trade-off rather than an assumption that the evidence is infallible.

Once the slice is accepted, take slice n+1 and repeat. The unit of progress is a
verified slice, not a large batch of generated code.

I want a separate reviewer looking for holes, not the builder defending code it
just wrote. I normally read the work after this loop, with the critique and
evidence telling me where to focus.
-->

---
part: Execution
---

# I pick models by task. I do not need one permanent winner

<table>
  <thead>
    <tr><th>Work</th><th>Usual choice</th><th>Why</th></tr>
  </thead>
  <tbody>
    <tr v-click="1"><td>Normal implementation</td><td><strong>GPT‑5.6 Sol</strong>, medium or high reasoning</td><td>Fast, capable and token-efficient enough to keep the loop tight</td></tr>
    <tr v-click="2"><td>UI design and visual refinement</td><td><strong>Opus-class model</strong> with Impeccable</td><td>Strong visual judgment improves when paired with an explicit design vocabulary</td></tr>
    <tr v-click="3"><td>Bounded or lower-value work</td><td>Whatever suitable capacity is available</td><td>Clear instructions and checks matter more than model prestige</td></tr>
  </tbody>
</table>

<div v-click="4" class="sowhat mt-6">
I spend the expensive reasoning on uncertain work. A good structure makes the rest cheaper.
</div>

<p class="cite">Sources: <a href="https://developers.openai.com/api/docs/models/gpt-5.6-sol">Official OpenAI GPT‑5.6 Sol model documentation</a> · <a href="https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/">Earlier workflow snapshot</a></p>

<!--
The primary HL agents plus the coding and adversarial-review subagents now pin
GPT-5.6 Sol. Medium/high Sol is the present default described here; lightweight
locator, test and build helpers remain on a smaller model.
-->

---
part: Execution
---

# For UI work, the browser is part of the loop

<div class="ui-loop">
  <div class="ui-step"><span>01</span><strong>Give direction</strong><small>Product intent, references and constraints</small></div>
  <div v-click="1" class="ui-arrow">→</div>
  <div v-click="1" class="ui-step"><span>02</span><strong>Generate</strong><small>Opus + Impeccable + image generation</small></div>
  <div v-click="2" class="ui-arrow">→</div>
  <div v-click="2" class="ui-step"><span>03</span><strong>Observe</strong><small>Rendered UI, DOM, console and network</small></div>
  <div v-click="3" class="ui-arrow">→</div>
  <div v-click="3" class="ui-step"><span>04</span><strong>Challenge</strong><small>Responsive states, errors and interaction edges</small></div>
</div>

<div v-click="3" class="exhibit mt-7">
<div>
<p class="col-label">Impeccable adds vocabulary</p>
<p>Design context plus focused moves such as critique, polish, distill, typeset and audit.</p>
</div>
<div>
<p class="col-label">The browser adds evidence</p>
<p>I judge the implementation by what rendered and behaved. Plausible-looking component code is not enough.</p>
</div>
</div>

<p class="cite">Sources: <a href="https://impeccable.style/docs/impeccable/">Impeccable documentation</a> · <a href="https://www.huuhka.net/browser-verification-for-coding-agents-chrome-devtools-mcp-vs-agent-browser/">Browser verification for coding agents</a></p>

<!--
Impeccable gives the model useful design language and saved product context.
The browser tells it what actually happened.
-->

---
part: Execution
class: impeccable-slide
---

# Impeccable gives the agent verbs for visual work

<div class="impeccable-grid">
  <div class="impeccable-copy">
    <p class="col-label">What it adds</p>
    <p>One installable skill for creating, evaluating, refining and hardening interfaces.</p>
    <div v-click="1" class="impeccable-commands">
      <code>/critique</code>
      <code>/polish</code>
      <code>/distill</code>
      <code>/typeset</code>
      <code>/audit</code>
    </div>
    <p v-click="2">It loads product and design context, names the kind of intervention, and checks common AI-generated UI defaults.</p>
  </div>
  <figure class="impeccable-shot">
    <img src="/assets/impeccable-homepage.png" alt="Impeccable homepage showing its design vocabulary and before-and-after interface example" />
    <figcaption>Impeccable homepage, captured 5 Sep 2026.</figcaption>
  </figure>
</div>

<div v-click="3" class="impeccable-caveat">
  <span>One tool, not the recipe</span>
  <p>Other skills, models or a good prompt may fit your stack better. Your mileage may vary.</p>
</div>

<p class="cite">Source: <a href="https://impeccable.style/">Impeccable</a> · <a href="https://impeccable.style/docs/impeccable/">Command documentation</a></p>

<!--
Impeccable is the tool I currently reach for because it gives the conversation
specific design verbs. It does not replace taste, product direction or browser
verification, and it is not the only way to get useful results.
-->

---
part: Execution
---

# I rarely parallelize inside one project. I do juggle several projects

<div class="exhibit">
<div v-click="1">

<p class="col-label">Inside one project</p>

- Default to a coherent, sequential slice
- Parallelize only genuinely independent work
- Avoid shared files, shared browser state and hidden dependencies
- Pay the extra coordination cost only when it buys something

</div>
<div v-click="2">

<p class="col-label">Across my work</p>

- Keep several projects moving at once
- Let one agent wait on tests while another project advances
- Preserve a separate mental model and artifact trail per project
- Return to each thread through its structure and evidence

</div>
</div>

<div v-click="3" class="sowhat mt-6">
Concurrency helps. A swarm is not a workflow by itself.
</div>

<!--
This has changed since the earlier blog post. I am more conservative about
parallel work inside one repo, but I still keep several projects moving.
-->

---
nofooter: true
layout: none
class: zsection
---

<div class="zsplit">
  <div class="zsection-body">
    <p class="eyebrow">Part 04</p>
    <h1>The next thing I want to improve is the harness</h1>
    <p class="zsection-sub">When I repeat the same review comment, I want the repo to enforce it.</p>
  </div>
  <div class="zsplit-art">
    <img src="/assets/section-harness-guided-path.png" alt="A mountain path held between ridges and marked by cairns" />
  </div>
</div>

<!--
This is the part I have not fully implemented yet. I want the repository to
catch more mistakes automatically before I spend time reviewing them.
-->

---
part: Harness engineering
---

# I want recurring rules in linters and tests

<div class="exhibit exhibit-wide">
<div v-click="1">

<p class="col-label">What I tell the agent</p>

```text
AGENTS.md
  → map to focused documentation
  → approved structures, plans and decision records
  → explicit project commands
```

<p>Give the agent a short map to the source of truth instead of one enormous instruction file.</p>

</div>
<div v-click="2">

<p class="col-label">What the repo checks</p>

- Custom linters for architecture and naming
- Structural tests for dependency direction
- Tests for behavioral contracts
- Browser checks for user-visible invariants
- Actionable failures that explain remediation

</div>
</div>

<div v-click="3" class="sowhat mt-6">
If I keep correcting the same thing, it should probably become a test, a linter, a tool or a short local doc.
</div>

<p class="cite">Source: <a href="https://openai.com/index/harness-engineering/">OpenAI, Harness engineering: leveraging Codex in an agent-first world</a></p>

<!--
The part I want from the OpenAI article is mechanical enforcement. Put the rule
in the repository so the agent gets a useful failure when it breaks it.
-->

---
part: Harness engineering
---

# I want better guardrails. I do not expect an autonomous software factory

<div class="exhibit">
<div v-click="1">

<p class="col-label">I am adopting</p>

- Repository-local sources of truth
- Progressive disclosure of context
- Executable structures and verification evidence
- Architectural invariants in linters and tests
- Continuous cleanup of recurring failure patterns

</div>
<div v-click="2">

<p class="col-label">I am not assuming</p>

- More agents always produce a better result
- Human review is the bottleneck to eliminate
- Long autonomous runs generalize to every codebase
- Coordination and token cost disappear at scale
- A confident completion message is proof

</div>
</div>

<div v-click="3" class="note mt-6">
OpenAI says the result depends on how that repository is structured and tooled. I think that caveat matters.
</div>

<p class="cite">Source: <a href="https://openai.com/index/harness-engineering/">OpenAI harness engineering</a></p>

<!--
The experiment is impressive. I still would not make it my default. Maybe a
software factory works with an effectively infinite budget. I do not have one.
-->

---
part: Takeaways
---

# The parts I expect to keep

<div class="principle-grid">
  <div v-click="1"><span>01</span><strong>Scale the process</strong><small>Add structure when uncertainty or risk earns it.</small></div>
  <div v-click="1"><span>02</span><strong>Keep phases separate</strong><small>Facts, decisions, structure and code are different work.</small></div>
  <div v-click="2"><span>03</span><strong>Read the structure</strong><small>Read any separate plan too. Keep your own mental model.</small></div>
  <div v-click="2"><span>04</span><strong>Build in slices</strong><small>Every phase should end in observable evidence.</small></div>
  <div v-click="3"><span>05</span><strong>Use an adversary</strong><small>Try to prove the work is not done before trusting it.</small></div>
  <div v-click="3"><span>06</span><strong>Turn repeats into checks</strong><small>Move recurring guidance into tests, linters and tools.</small></div>
</div>

<!--
T3 Code, OpenCode, Codex and the models will change. I expect these habits to
stick around for longer.
-->

---
part: References
class: dense
---

# References and further reading

<div class="zrefs">

<div v-click="1">

**My workflow notes**

<p><a href="https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/">How I currently develop with LLM models</a> · <a href="https://www.huuhka.net/research-plan-implement/">Research - Plan - Implement</a> · <a href="https://www.huuhka.net/primary-vs-subagents-in-llm-harnesses/">Primary vs subagents in LLM harnesses</a></p>

<p><a href="https://www.huuhka.net/browser-verification-for-coding-agents-chrome-devtools-mcp-vs-agent-browser/">Browser verification for coding agents</a> · <a href="https://www.huuhka.net/connecting-opencode-with-microsoft-foundry-models/">Connecting OpenCode with Microsoft Foundry models</a></p>

</div>

<div v-click="2">

**Workflows and tools**

<p><a href="https://docs.humanlayer.com/explanation/workflow-phases">HumanLayer workflow phases</a> · <a href="https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md">T3 Code documentation</a> · <a href="https://opencode.ai/v2/docs/providers">OpenCode providers</a></p>

<p><a href="https://www.aihero.dev/skills-grill-me">Matt Pocock: grill-me</a> · <a href="https://www.aihero.dev/skills-grill-with-docs">grill-with-docs</a> · <a href="https://impeccable.style/docs/impeccable/">Impeccable</a></p>

</div>

<div v-click="3">

**Models and harness engineering**

<p><a href="https://developers.openai.com/api/docs/models/gpt-5.6-sol">Official OpenAI GPT‑5.6 Sol documentation</a> · <a href="https://openai.com/index/harness-engineering/">OpenAI harness engineering</a></p>

</div>

</div>

<!--
Keep this available after the talk. These are starting points, not endorsements
of every claim or every workflow default in the linked material.
-->

---
nofooter: true
layout: none
class: zend
---

<div class="zdark zdark-center">
  <p class="eyebrow">The takeaway</p>
  <p class="zbig">Use agents to get more done. Do not let them do your thinking.</p>
  <p class="zdark-note">Read the structure. Challenge the result. Check the evidence. Then make the call yourself.</p>
</div>

<!--
That is basically it. The agents can do more of the implementation. I still
need to understand the task and decide when the result is good enough.
-->
