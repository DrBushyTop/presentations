---
theme: zure
addons:
  - slidev-addon-rehearsal
  - slidev-addon-shared-mermaid
title: Skills, tools and agent boundaries
titleTemplate: '%s · Zure'
author: Pasi Huuhka
info: |
  A short talk about where instructions belong and when to use a separate agent.
  Based on two blog posts, with an updated preference for skills over role-specific agent prompts.
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
exportFilename: skills-tools-and-agent-boundaries
fonts:
  provider: google
  sans: Inter
  mono: JetBrains Mono
  weights: '200,400,600,700,800'
seoMeta:
  ogTitle: Skills, tools and agent boundaries
  ogDescription: Reusable instructions belong in skills. Separate agents need a reason.
---

<div class="zcover blocks-cover">
  <div class="zcover-text">
    <p class="eyebrow">A mental model for coding agent configuration</p>
    <h1>Skills, tools<br />and agent<br />boundaries</h1>
    <p class="zcover-sub">Where should the instructions live?<br />When do I need another agent?</p>
    <p class="zcover-meta">Pasi Huuhka · Zure · September 2026</p>
  </div>
  <div class="blocks-cover-art" role="img" aria-label="One reusable skill can load into the primary agent or a subagent. Each agent has its own context.">
    <div class="cover-skill">
      <span>Reusable instructions</span>
      <strong>SKILL.md</strong>
    </div>
    <div class="cover-branches"><span>load</span><span>load</span></div>
    <div class="cover-sessions">
      <div><span>Context A</span><strong>Primary</strong><i></i><i></i><i></i></div>
      <div><span>Context B</span><strong>Subagent</strong><i></i><i></i><i></i></div>
    </div>
    <p class="cover-caption">Same instructions. Separate contexts.</p>
  </div>
</div>

<!--
About eight minutes. This is a companion to "How I develop with coding agents",
not another walkthrough of that workflow. Skip model preferences, QRSPI,
implementation slices, browser verification and review loops.

The starting points are "A mental model for LLM tooling primitives", published
23 November 2025, and "Primary vs Subagents in LLM harnesses", published
15 January 2026. The preference for putting reusable roles and procedures into
skills is my updated view as of September 2026, not a claim from the older posts.

Here, agent means a running session. Agent configuration means the setup for
that session. Those are easy to confuse when both are called an "agent".
-->

---
part: Configuration
class: blocks-slide
---

# Give each kind of configuration one job

<div class="responsibility-map">
  <div class="responsibility-row">
    <div class="responsibility-name"><span>Request</span><strong>Command</strong></div>
    <div class="responsibility-detail"><strong>What to do now</strong><code>/check-docs payments</code></div>
  </div>
  <div class="responsibility-row">
    <div class="responsibility-name"><span>Repository</span><strong>AGENTS.md</strong></div>
    <div v-click="1" class="responsibility-detail"><strong>What this repo expects</strong><span>Documentation lives in <code>/docs</code></span></div>
  </div>
  <div class="responsibility-row responsibility-skill">
    <div class="responsibility-name"><span>Procedure</span><strong>Skill</strong></div>
    <div v-click="1" class="responsibility-detail"><strong>How to do this kind of work</strong><span>The docs-check procedure</span></div>
  </div>
  <div class="responsibility-row">
    <div class="responsibility-name"><span>Capabilities</span><strong>Tools + MCP</strong></div>
    <div v-click="2" class="responsibility-detail"><strong>What it can read or change</strong><span>Files · issue tracker</span></div>
  </div>
  <div class="responsibility-row">
    <div class="responsibility-name"><span>Execution</span><strong>Agent config</strong></div>
    <div v-click="2" class="responsibility-detail"><strong>How this session runs</strong><span>Model · tool access · permissions</span></div>
  </div>
</div>

<p class="cite">Adapted from <a href="https://www.huuhka.net/a-mental-model-for-llm-tooling-primitives/">Pasi Huuhka, LLM tooling mental model</a> · <a href="https://agentskills.io/home">Agent Skills</a> · <a href="https://modelcontextprotocol.io/docs/learn/architecture">MCP architecture</a></p>

<!--
Start with the request. A command is a convenient entry point with task-specific
arguments. It should not need to contain the entire procedure.

Click 1. Repository instructions carry local facts and conventions. Keep them
short and correct. Skills carry reusable task instructions, examples and
optional scripts or reference material. Compatible clients discover skills
through metadata and load the full instructions when needed.

Click 2. Tools perform operations. MCP connects the client to servers that can
offer tools, resources and prompts. A skill can teach the agent to use an MCP
tool or a CLI, so skills do not replace those capabilities.

Agent configuration still has a job. It selects execution settings supported
by the client, such as model, tool access and permissions. Actual enforcement
belongs to the runtime, not to a sentence asking the model to behave.

This is my separation of responsibilities, not a universal file-format map.
Products overlap. A slash command may invoke a skill, a skill may request a
subagent, and an agent configuration may preload skills. AGENTS.md loading and
precedence also depend on the client. The examples here are illustrative.

The 2025 post worried about loading too much MCP metadata. Do not turn that into
a blanket claim that MCP always fills the context. Discovery and loading vary
by client. The useful principle is to load only what the current task needs.

Runtime configuration example:
https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields
-->

---
part: My updated view
class: blocks-slide
---

# I'd now put the reusable role in a skill

<div class="role-migration">
  <div class="old-agent">
    <p class="diagram-label">My earlier model · November 2025</p>
    <h2>Custom docs agent</h2>
    <div class="bundled-procedure">
      <strong>Role + procedure</strong>
      <span>What to check</span>
      <span>How to report findings</span>
    </div>
    <div class="bundled-runtime"><strong>Execution settings</strong><span>Model · tools · permissions</span></div>
  </div>
  <div class="migration-arrow" aria-hidden="true">→</div>
  <div class="new-skill">
    <p class="diagram-label">My preferred default now</p>
    <div v-click="1" class="reusable-procedure">
      <span>Load when needed</span>
      <strong><code>docs-check/SKILL.md</code></strong>
      <small>Procedure · examples · report format</small>
    </div>
    <div v-click="1" class="skill-consumers">
      <div><span>↓</span><strong>Primary agent</strong></div>
      <div><span>↓</span><strong>Subagent</strong></div>
    </div>
    <div v-click="2" class="retained-runtime"><span>Keep configured</span><strong>Model · tool access · permissions</strong></div>
  </div>
</div>

<div v-click="2" class="blocks-takeaway">Instructions can be reusable. Permissions still need enforcement.</div>

<p class="cite">Revises my <a href="https://www.huuhka.net/a-mental-model-for-llm-tooling-primitives/">2025 mental model</a> · <a href="https://agentskills.io/home">Agent Skills</a> · <a href="https://code.claude.com/docs/en/sub-agents#preload-skills-into-subagents">Claude Code, skills in subagents</a></p>

<!--
The old post put much of HOW the agent should act into the custom agent
configuration. I would now move reusable roles, procedures and output contracts
into loadable skills by default. That includes orchestration instructions when
they are reusable, rather than wiring every workflow into a permanent agent.

Click 1. This is a packaging change. The same docs-check instructions can be
used in the current conversation or loaded into a delegated session. I do not
need two copies of the procedure or a permanently named docs specialist.
Skill availability and activation must be arranged in the receiving client.

Click 2. I am not removing the agent configuration layer. A distinct tool
allowlist, permission policy, model or isolation setting can still justify a
custom execution profile. Keep that profile thin and have it load the skill.
"Do not edit files" in a skill is an instruction, not a read-only sandbox.

This is a preference, not a universal replacement rule. A product may couple
skills and agent settings, and some skills depend on tools that another client
does not provide. Portable instructions do not guarantee portable execution.

The official Claude Code documentation demonstrates preloading skills into a
subagent. That supports the composition, not a vendor recommendation that
everyone should replace their custom agents.
-->

---
part: Context
class: blocks-slide context-window-slide
clicks: 5
---

# The context window fills as the agent works

<ContextWindow />

<p class="cite">Visual adapted from <a href="https://www.huuhka.net/primary-vs-subagents-in-llm-harnesses/">Pasi Huuhka, Primary vs subagents</a> · <a href="https://code.claude.com/docs/en/how-claude-code-works#the-context-window">Claude Code, context and compaction</a></p>

<!--
Start. Use the stacked-context picture from my blog to explain one running
session. The model receives the context supplied for this turn. That can include
system and repository instructions, the current request, tool definitions,
conversation history, loaded skills and selected file contents. Access to a
repository does not mean every file is already in context.

The fixed outline is a finite token budget, not a fixed number of messages.
Block sizes are illustrative, not token measurements. The response also needs
room. How input, output, reasoning and caches count depends on the model and
API. The diagram deliberately does not claim a particular limit or threshold.

Click 1. The runtime loads the chosen skill's full instructions into the same
context. It is still the same agent session. Discovery metadata can be present
before activation. Tool definitions may also load on demand.

Click 2. The model requests a tool call. The runtime executes it and returns the
result. The next model call can use that result along with the retained context.
This is why a long command output or a large file read consumes context even
when the human conversation looks short. The model is not reading files between
calls on its own.

Click 3. Repeat that loop and add more messages. Intermediate investigations
can take much more space than the final answer. The window itself does not grow
to accommodate them. Some systems clear or truncate older tool outputs before
they need to summarize the conversation.

Click 4. In a summary-based compaction, the runtime replaces older working
history with a shorter representation. Watch the older blocks collapse and
the recent turns move up. A summary can preserve the goal, findings and file
references, but it can omit details, constraints or uncertainty.

This is one simplified compaction strategy, not a promise that every client
preserves exactly these blocks. Systems differ in what they summarize, retain,
reload or discard, including skill instructions. Keep durable requirements in
the client's supported instruction files and inspect source material again when
exact details matter. Compaction does not undo edits or delete files on disk.

Click 5. The agent continues from the summary and the retained context. New
calls and results fill it again. This leads into the next slide: a subagent can
keep a large investigation out of the primary's context in the first place.

The animated stack adapts the primary-agent drawing in my January 2026 post.
The related Research - Plan - Implement drawing also uses stacked contexts,
but this slide does not repeat that development workflow:
https://www.huuhka.net/research-plan-implement/

Official explanation of the tool loop and context management:
https://code.claude.com/docs/en/how-claude-code-works

Presenter controls: use the normal next and previous click controls. There is
no autoplay. Going backwards reconstructs the earlier context. Reduced-motion
preferences and print output disable the animation while keeping every state.
-->

---
part: Context boundaries
class: blocks-slide
---

# Subagents keep the working context separate

<div class="context-diagram">
  <div class="primary-context">
    <p class="diagram-label">Primary agent</p>
    <h2>Own the conversation</h2>
    <div class="conversation-line"><span>User</span><strong>Are the payment docs accurate?</strong></div>
    <div class="primary-retains"><span>Keep here</span><strong>Intent · decisions · synthesis</strong></div>
    <div v-click="2" class="returned-result"><span>Use the result</span><strong>Explain the gaps.<br />Read more only where needed.</strong></div>
  </div>
  <div class="handoff-lane">
    <div v-click="1" class="handoff-out"><strong>Send</strong><span>Question<br />Scope + inputs<br />Skill to load</span><b aria-hidden="true">→</b></div>
    <div v-click="2" class="handoff-back"><b aria-hidden="true">←</b><strong>Return</strong><span>Findings<br />Evidence<br />State + gaps</span></div>
  </div>
  <div class="worker-context">
    <p class="diagram-label">Subagent · separate context</p>
    <h2>One bounded question</h2>
    <div v-click="1" class="worker-skill"><code>docs-check</code><span>Check the payment setup docs</span></div>
    <div v-click="1" class="investigation-stack"><span>Search results</span><span>File contents</span><span>Comparisons</span></div>
    <div v-click="2" class="worker-distillation"><strong>Distill before returning</strong><span>The working transcript stays here.</span></div>
  </div>
</div>

<div v-click="2" class="blocks-takeaway">If it returns every file it read, the split has missed the point.</div>

<p class="cite">Sources: <a href="https://www.huuhka.net/primary-vs-subagents-in-llm-harnesses/">Pasi Huuhka, Primary vs subagents</a> · <a href="https://code.claude.com/docs/en/sub-agents#manage-subagent-context">Claude Code, subagent context</a></p>

<!--
Keep this about the information boundary, not the implementation or review
workflow from the other presentation. The primary remains responsible for user
interaction, overall task flow and combining results. It can do the work itself.

Click 1. Give the subagent a bounded question, the scope and relevant input
references, and the skill it should load. An example task is to compare the
payment setup docs against the supported configuration. Pass the relevant
document and code locations explicitly. Do not assume it knows the discussion.

Context inheritance differs by client and agent mode. Some workers start fresh;
others fork the parent conversation. The claim here is that their subsequent
investigation can stay outside the primary's context, not that all subagents
always begin with an empty history.

Click 2. Ask for a compact response. My blog's suggested contract was a result
in 3 to 7 bullets, evidence with path and line references, state as done,
partial or blocked, and any next input needed. Preserve uncertainty.

For this illustrative check, a response could be:
Result: The setup guide omits one required environment variable.
Evidence: The exact documentation section and configuration definition.
State: Partial. The static comparison is done, but setup was not executed.
Next input: A safe test environment, if runtime confirmation is required.

The primary can inspect the targeted evidence afterward. A summary is lossy,
and "done" is a worker's report rather than proof of correctness.

Separate context does not mean separate files, permissions or a security
boundary. Those need explicit runtime controls. Independent work can run in
parallel, but dependencies and shared state still need checking. Parallelism
is not the reason for the split shown here.
-->

---
part: The decision
class: blocks-slide
---

# Reuse and delegation are separate decisions

<div class="choice-matrix">
  <div class="matrix-corner">Where should<br />the work happen?</div>
  <div class="matrix-column">One-off instructions</div>
  <div class="matrix-column matrix-column-skill">Reusable procedure</div>
  <div class="matrix-row">Keep the<br />current context</div>
  <div class="matrix-cell"><span>Ask directly</span><strong>Explain this setting</strong><small>No new skill or session needed</small></div>
  <div class="matrix-cell matrix-cell-skill"><span>Load a skill</span><strong>Check one short guide</strong><small>Use <code>docs-check</code> in the primary</small></div>
  <div class="matrix-row">Separate the<br />working context</div>
  <div v-click="1" class="matrix-cell"><span>Delegate a bounded task</span><strong>Find where a setting is used</strong><small>Return the relevant locations</small></div>
  <div v-click="1" class="matrix-cell matrix-cell-skill"><span>Delegate + load a skill</span><strong>Compare a large docs set</strong><small>Same <code>docs-check</code>, compact result</small></div>
</div>

<div v-click="2" class="blocks-takeaway">Start with a skill for reuse. Add an agent boundary when the work needs one.</div>

<p class="cite">My synthesis of <a href="https://www.huuhka.net/a-mental-model-for-llm-tooling-primitives/">LLM tooling mental model</a> and <a href="https://www.huuhka.net/primary-vs-subagents-in-llm-harnesses/">Primary vs subagents</a> · <a href="https://agentskills.io/home">Agent Skills</a></p>

<!--
This matrix is my current decision aid, not a feature compatibility table.

The top row stays in the primary conversation. A one-off question can be a
normal request. A recurring procedure can be a skill loaded into that same
session. Specialization alone does not require another agent.

Click 1. The bottom row isolates the investigation. A one-off search can use
a generic worker. Repeated document checks can use the same skill in a worker.
A new context is worth considering when the intermediate material would
otherwise overwhelm the main conversation. Do not delegate a trivial read
just to satisfy a diagram.

Click 2. Decide what should be reused separately from where it should execute.
The primary can load orchestration instructions too. A role name is not a good
enough reason to create a permanent custom agent configuration.

An execution boundary may also be needed for different permissions, tools or
isolation. Then retain the relevant runtime configuration and load the skill
inside it. Neither a skill nor a separate context grants that enforcement by
itself.

That is the revision I would make to the original mental model. Keep the
reusable procedure portable. Keep the runtime settings explicit. Keep the
subagent's response smaller than its investigation.
-->
