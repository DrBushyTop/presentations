---
theme: zure
addons:
  - slidev-addon-rehearsal
title: The no slop engineer
duration: 60min
rehearsal:
  targetMinutes: 60
titleTemplate: '%s · Pasi Huuhka'
author: Pasi Huuhka
info: |
  Practices for shipping agent-written code you can explain. ESPC 2026, 60 minutes.
  Click-build variant: each slide builds with clicks.
class: text-left
highlighter: shiki
lineNumbers: false
transition: shift | shift-back
aspectRatio: 16/9
canvasWidth: 1280
colorSchema: light
download: true
exportFilename: no-slop-engineer
fonts:
  provider: google
  sans: Inter
  mono: JetBrains Mono
  weights: '200,400,600,700,800'
layout: none
---

<div class="ns-cover">
  <div class="ns-cover-text">
    <h1>The <span>no slop</span><br />engineer</h1>
    <p class="sub">Practices for shipping agent-written code you can explain</p>
    <p class="meta">Pasi Huuhka · Zure · ESPC 2026</p>
  </div>
  <div class="ns-cover-art"><AgentStream /></div>
</div>

<!--
About 30 seconds.

- Let the stream run for a moment before speaking.
- Say: "That's an agent writing code faster than any of us can read it. Everything it says sounds reasonable. Keep an eye on it, we'll come back to one of those lines."
- I'm Pasi, from Zure. This talk is about the practices I use so that code I didn't type is still code I can explain.
- Timings in the notes are estimates per slide, not rehearsed. Rehearse before deciding what to cut.
-->

---
layout: none
clicks: 4
nofooter: true
---

<PapersPleaseBooth :step="$clicks" />

<!--
About 1 minute. A nod to Papers, Please, the border inspector game. The inspector checks my credentials, then my agent's PR.

- Papers, please.
[click] Purpose of visit: a talk about slop. DevOps and development were my background; now most of my work is AI: dev tooling that helps organisations run AI-assisted development, alongside normal dev projects. AI architect at Zure. Azure since 2014, 150+ customers.
[click] Microsoft MVP since 2020, in two categories: Developer Technologies for the DevOps side and Foundry for AI. Pipelines, then prompts.
[click] My papers check out. Then I hand over my agent's PR. All checks green, zero new tests, a summary that says it works. The inspector asks for evidence. There isn't any.
[click] Merge denied. Let the six stamps land and the shutter come down before speaking.
- "In the game, nothing gets through without the inspector checking the papers. That's the job now. Papers, please, for every PR."

Sources:
- AI architect at Zure, Azure since 2014, AI in every project, MVP categories: Pasi.
- 150+ customers: https://sessionize.com/pasi-huuhka/
- MVP since June 2020: https://www.huuhka.net/ive-been-awarded-the-microsoft-azure-mvp-title/
- Both portraits were generated from my own recent photo, using the game's official screenshots as a style reference. The booth portrait is 72x72 pixels with its background removed; the passport photo is 48x48 with 5 colours and shows me straight on. Both use flat shading and nearest-neighbour scaling. Papers, Please is by Lucas Pope (3909 LLC); the fonts are Silkscreen and VT323.
- Visual reference: https://www.papersplea.se/presskit/
- The booth sprite's head and neck are the original portrait. The body below was redrawn with an image model, using a photo for the build, then snapped to the sprite's pixel grid. The head sits at about 1.75 on the height chart.
- The layout follows the game: the height chart behind the entrant, speech bubbles over the face, the counter, the date and weight panel, and the stamp drawer that pulls out from the right edge. The panel shows the first day of ESPC 2026 (30 Nov to 3 Dec) in the game's date format and the talk length in place of the weight.
- The documents follow the game's: the passport has chip labels, the country in spaced outline letters, an entry visa block with the conference dates and an empty stamp box, and the machine-readable zone; the work record is an identity supplement tag; and the MVP permit is a scalloped entry permit in the MVP logo's blue and white, with a red seal. They lie straight, as in the game, so the pixel type stays crisp; only the stamp marks are tilted. The marks copy the game's ENTRY DENIED stamp, solid ink with the paper showing through, reading MERGE DENIED with the conference date. The stamp drawer is drawn after the game's: cylinder knobs, stamps with a rounded top face and an engraved label, hex studs and guide rods either side, a light, and the alignment strip lying over the stamps.
- The passport number, issue and expiry years are props.
- The PR is a prop. Its branch, agent/export-csv, is the one the agent works on in the cover stream.
-->

---
part: Would you ship this?
class: ns
clicks: 1
---

# Four green pull requests

<BrokenPrs :step="$clicks" />

<!--
About 1.5 minutes.

- Four normal-looking PRs. Tests, lint, review bot and an approval on every one. Give the room a few seconds to scan them.

[click] Each one is wrong, and each in a different way.
- #482: the export's tests only check that Team A rows are present. They never check what else comes back. We'll see this one in the verify part.
- #517: the sidebar reads the server's storage module straight from browser code. It works, and it's the shortcut every later change will copy.
- #530: built layer by layer over four days, 1,940 lines in one PR. The first time anyone ran it in a browser was during review.
- #541: four lines. Creating an index without CONCURRENTLY locks writes to the orders table while it builds. That's Polylane's example; we'll come back to it in production.
- Say: "None of these is exotic. Green checks just don't tell you which of them you're looking at."
- #482 is the demo app's export with a seeded defect. The other three are illustrative.
- Intercom's name for what happens under volume: "humans start rubber-stamping. Glancing at a diff, skimming the description, clicking approve." https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe/
-->

---
layout: none
clicks: 1
---

<div class="ns-dark ns-statement">
  <p class="big">Slop is a change accepted <em>without evidence</em> about how it behaves.</p>
  <Show :step="$clicks" :at="1" class="small">It doesn't matter who wrote it. It matters what anyone checked.</Show>
</div>

<!--
About 1 minute.

- This is my working definition for the talk, not a dictionary one.
- Slop isn't "AI code". It's accepting a change on vibes: green checks, a confident summary, a reviewer who skimmed.

[click] Humans write slop too. I have. The difference now is volume.
-->

---
part: Would you ship this?
class: ns
clicks: 2
---

# Agents write faster than we can read

<ReadRace :step="$clicks" />

<!--
About 1 minute.

[click] Start the race. Left: model output at about 15 times human reading pace. Right: you, reading at about 238 words a minute.

[click] The backlog is the real number. Everything in it gets accepted on trust or read later, which usually means never.

- Say: "The bottleneck moved from writing code to understanding it."
- Source: GitHub Next, Chopin. They put reading at about 238 words a minute and generation at roughly 4,500 tokens a minute, and call the ratio about 1 to 15. Their own figures give nearer 1 to 19, so 15 is the conservative number. https://githubnext.com/projects/chopin/
- If asked: Anthropic's randomised study (52 mostly junior engineers) found AI-assisted learners scored 50% vs 67% on comprehension. That was learning a new library, not production review. https://www.anthropic.com/research/AI-assistance-coding-skills
-->

---
part: Would you ship this?
class: ns
clicks: 2
---

# Where are you the bottleneck?

<Bottleneck :step="$clicks" />

<!--
About 1 minute.

- The other bottleneck is you as the relay. Everything the agent can't reach goes through you: you copy the error out of the browser, answer a question the code could have answered, paste in the bug report from Slack, tell it which CI check failed.
- Each relay is slow, and it's lossy. You summarise, you forget a detail, the agent fills the gap with a guess. And the agent can't loop on its own work while you're in the middle.

[click] Poteto, who works on agent tooling at SpaceX AI, described the start of their performance work this way: they were "the meat proxy between my agent and Chrome DevTools".

[click] Each of those wires can go straight to the agent: a browser it drives, code it reads and cites, a routine that passes reports in, a babysitter that reads the checks. Your job moves to setting that up. Poteto's question for every task: "Why do my agents need me to answer this question?"
- The rest of the talk keeps asking it: where are you the relay, and what would let the agent check for itself?
- Source: Poteto on Matt Pocock's channel, 3 October 2026. https://www.youtube.com/watch?v=MN9dGgmLyso
-->

---
part: Would you ship this?
class: ns
clicks: 3
---

# Six gates between a request and production

<GateMap :step="$clicks" />

<!--
About 1 minute.

- This is the map for the talk. Each gate asks one question.

[click] Three before implementation: understand the current system, discuss the design, and decide how to slice the work. Use the phases that the task needs. A detailed implementation plan is optional.

[click] Then a loop for every slice: build it, verify it, review it, and go round again for the next one. It's not a waterfall. Verify and review happen many times a day.

[click] Production once it merges.

- Scale this to the task. A typo fix doesn't go through six gates. A change to who can see what does.
-->

---
part: Would you ship this?
class: ns
clicks: 3
transition: gate | gate-back
---

# How agent work goes wrong

<FailureMap :step="$clicks" />

<!--
About 1 minute. Don't read the cards out. Each part opens with its own and shows what it looks like.

- These are the failures I keep seeing, placed under the gate that catches each one most cheaply.
[click] Before implementation: the agent guesses instead of looking, picks what the feature means, or builds everything before anyone looks.
[click] For every slice: it takes the shortcut, its tests only confirm the code, nobody runs it, and review either rubber-stamps or never stops.
[click] After merge: it passes CI and breaks under real traffic, and the same mistake comes back next week.
- The four PRs from the start are four of these.
-->

---
layout: none
---

<SectionGate :current="0" title="Understand the current system" question="What does the code do today?" />

<!--
Research, including a prepared walkthrough of real artifacts.

- Say: "Let's go back to the request and see what should have happened. Export the team's tasks as CSV. No code yet."
- The divider log describes the baseline: session, list route and the missing export. Research maps what exists before design decides what should change. This is an explanatory diagram, not a recorded agent run.
-->

---
part: Research
class: ns
clicks: 1
---

# What goes wrong without research

<HowItFails :gate="0" :step="$clicks" />

<!--
About 1 minute.

- Two ways research fails, or gets skipped.
- Guessing: the agent answers a factual question from its priors. "The list probably hides done tasks." It sounds right, and nothing on screen says it was a guess.
- Rediscovery: every phase reads the same 30 files again, and the reading crowds out the work.
[click] The fixes: answer from the system itself, with a reference you can open, and do the reading once so later contexts start from a short map.
-->

---
part: Research
class: ns
clicks: 2
transition: gate | gate-back
---

# Use the shortest workflow that resolves the unknowns

<RpiScale :step="$clicks" />

<!--
About 1 minute. This is my current workflow, not a mandatory process.

- Each phase starts a fresh context and hands written notes to the next. Research asks how it works today, design decides what we're building, implement checks one slice at a time.
[click] The point of research is what it keeps out of later contexts. It spends a whole context reading code, maybe 30 files, and hands on a short map with file references. Design and implementation start nearly empty, with only the notes they need. The fill levels are illustrative.
[click] So research isn't only for unfamiliar code. Use it for complex changes and large codebases, where the reading would otherwise crowd out the work. Small, clear change: implement directly. Open decisions: grill, then implement.
- Design hands on whatever the task needs: a design document with the decisions, a structure outline with vertical phases for bigger work, and CONTEXT.md for shared terms. A detailed implementation plan is optional; I usually skip it.
- My old rule of thumb was to keep each context under 40 to 60% full. Treat that as a heuristic, not a measured limit.
- My earlier posts describe the RPI foundation; this includes later changes. https://www.huuhka.net/research-plan-implement/ https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/
- HumanLayer's documentation also separates research, design and vertical structure, and makes the detailed plan optional. https://docs.humanlayer.com/explanation/workflow-phases
-->

---
layout: none
---

<DemoSlide title="Map the current state" :minutes="3" prepared agent="Research walkthrough" prompt="How does the task list work today? Trace the session, the team filter and the shared query. Where are those boundaries in the code? Describe existing behavior with file references." />

<!--
Prepared walkthrough, about 3 minutes.

- Use the real research artifact Pasi generates against the demo-app baseline. The application has a task list and no export yet. Do not manufacture a mistaken research answer for this demonstration.
1. Open the research questions and the completed current-state map.
2. Show which files the agent located and how it traced the request through session, route and query.
3. Follow one useful reference into the actual code. The route supplies the team scope; the shared query applies its input filters.
4. Show how this compact map lets the design conversation start without rediscovering the system.
- Current preparation status: the baseline app is being completed by another agent. Replace the walkthrough with the actual artifact when Pasi has run his own research skills.
- Research is not a code review or a future design proposal. https://www.huuhka.net/research-plan-implement/ https://docs.humanlayer.com/explanation/workflow-phases
-->

---
part: Research
class: ns
clicks: 3
---

# Research explains how the system works today

<ClaimTrace :step="$clicks" />

<!--
Recap of the prepared research example, about 1 minute.

- This is what a research document looks like: every finding has a heading that states the takeaway, one sentence, and a file and line you can open. The editor on the right is the cited code. Line numbers are the demo app's real source.
- First finding: the session cookie resolves to a user and their team.
[click] The list route passes the session's team to findTasks. The client can filter by status, not by team.
[click] findTasks adds the team filter only when it's given a team. Scoping lives in the caller. That's the fact design needs.
[click] Only session and task routes are registered. There is no export today.
- Research describes what exists. It doesn't recommend and it doesn't decide the new endpoint's behavior.
- The findings are shortened from what the create-research skill writes. The point is the shape: takeaway, sentence, a reference you can open.
- Following a reference is about understanding an important fact. The example does not depend on research being wrong.
- Sources: https://www.huuhka.net/research-plan-implement/ https://docs.humanlayer.com/explanation/workflow-phases
-->

---
part: Research
class: ns
clicks: 2
transition: gate | gate-back
---

# Let the agent answer its own questions

<OwnAnswers :step="$clicks" />

<!--
About 1 minute.

- Research is one case of a broader rule: when the agent has a factual question, it shouldn't ask you and it shouldn't guess.
[click] It looks in the place that knows: the code, the database, the tickets, its own past sessions. Every answer comes back with something you can open. The first answer is the demo app's real code. The other three are illustrative.
- Past sessions are underrated. Poteto built a recall skill for exactly this: a new chat on the same problem pulls in what the last few chats learned.
[click] Poteto's question: "How do I get the agent to answer its own question? Not by hallucinating, not by guessing, but actually real data." What comes back to you are the product choices, which is where the design part starts.
- What makes this work is access, not a smarter model: read access to the database, a ticket tracker integration, transcripts it can search.
- Source: https://www.youtube.com/watch?v=MN9dGgmLyso
-->

---
layout: none
---

<SectionGate :current="1" title="Grill the decisions, keep the answers" question="What are we actually building?" />

<!--
Design. Grilling is useful as soon as implementing directly would require guesses. It can be part of a lightweight discussion or a larger design phase. A separate detailed plan is not required.
- The divider log shows the same workflow: ask about choices, use code to answer factual questions, and record the decisions in CONTEXT.md.
-->

---
part: Design
class: ns
clicks: 1
transition: gate | gate-back
---

# What goes wrong without design

<HowItFails :gate="1" :step="$clicks" />

<!--
About 1 minute.

- The agent can't know what you meant, so it decides. "I assumed the export includes all tasks" is a product decision made by an implementation agent.
- And the decisions live in one person's chat. Nobody else can explain or debug them.
[click] The fixes: grill the open choices before any code, record them where the team can read them, and review the plan together.
-->

---
layout: none
---

<DemoSlide title="Grill the design" :minutes="3" prepared agent="Design walkthrough" prompt="Let's resolve what the export should do. Grill me on the choices that would otherwise become guesses. Explore the code for factual answers, and record our agreed decisions with grill with docs." />

<!--
Prepared walkthrough, about 3 minutes.

- Use the real design conversation and CONTEXT.md that Pasi generates after the research run. Do not invent a flawed plan for the agent to repair.
1. Start from the product request and the current-state map.
2. Show one meaningful question with its options, the answer and why it changes the feature.
3. Show another question about the output or scope so grilling reads as a design conversation rather than a security quiz.
4. Open the durable record produced by grill with docs. The choices remain available outside the chat.
- In my normal workflow, I often proceed from approved design and a vertical structure outline to implementation. A detailed plan can be skipped.
- Preparation status: the real conversation and artifact will be added after Pasi runs his skills.
- Sources: https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/ https://docs.humanlayer.com/explanation/workflow-phases https://github.com/mattpocock/skills
-->

---
part: Design
class: ns
clicks: 3
---

# Grill the decisions before implementation

<PlanArgument :step="$clicks" />

<!--
About 1 minute. Keep this at the level of the design discussion.

- The feature request was to download the team's tasks for weekly reporting. Now ask the agent to grill you on the plan, so you both close the gaps in your understanding. The implementation agent should not silently choose the feature's meaning.
[click] This is what grilling really looks like: a batch of numbered questions, each with the agent's recommendation. Real sessions run to dozens. Factual questions it answers from the code itself; these are the product choices.
[click] You answer by number. Most recommendations are fine. The work is spotting the one to override: here the agent assumed all tasks, and the person wants what the list shows.
[click] Grill with docs records the settled answers in CONTEXT.md and a decision record. The durable record is the useful output, not the transcript.
- Grilling is also the cheapest point to understand the feature. I've answered every choice before any code exists, so when I later read the diff I'm checking it against decisions I made, not learning the feature from the code.
- Only the caller-team boundary is fixed for the teaching case. The filter, columns and limits will come from Pasi's real design run.
- This is the next step above implementing directly when a task has unclear choices. It works within a design phase or as a short conversation. No separate plan file is required.
- Matt Pocock's grilling skills are the source for the interview pattern. https://github.com/mattpocock/skills
- GitHub Next identifies the same problem: decisions can disappear in private chat or be silently made by an agent. https://githubnext.com/projects/chopin/
-->

---
part: Design
class: ns
clicks: 2
---

# Planning needs better tools

<PlanningTools :step="$clicks" />

<!--
About 1 minute. Add material now; decide timing in rehearsal.

- GitHub Next's Chopin is a research prototype for collaborative planning with people and agents. The diagram is an explanatory redraw, not a screenshot of the product.
[click] A plan can be a place for research, decision-specific discussion and visual explanation. Chopin is exploring a shared MDX editor, comment threads and interactive diagrams, with decisions that teammates can trace.
[click] HumanLayer invests in the workflow around those artifacts: objective research, a design discussion and an outline of vertical phases before implementation. The current default does not require a detailed code-level plan.
- The point is that tool builders are putting attention into the work before implementation. Do not turn this into three live product demos or claim these prototypes are generally available.
- Sources: https://githubnext.com/projects/chopin/ https://docs.humanlayer.com/explanation/workflow-phases https://docs.humanlayer.com/reference/skills-workflows
-->

---
part: Design
class: ns
clicks: 3
transition: gate | gate-back
---

# Could someone else explain it and debug it?

<TeamUnderstanding :step="$clicks" />

<!--
About 1.5 minutes.

- Answering first keeps you from anchoring. This is the team version of the same problem.
- Honeycomb's Tenant team first split into producers and reviewers: reviewers didn't produce, producers picked up more tasks. Their words: "knowledge concentration got amplified. We were each rapidly over-specializing in some portions of our stack."

[click] Their fix was to review the plan and the prompt given to the agent, as a team. "It started feeling like everyone was more aware of what was happening." Plans could be borrowed later for caveats. They don't do the strict version for everything now. https://www.honeycomb.io/blog/embracing-code-review-bottleneck

[click] Anthropic's randomised study: 52 mostly junior engineers learned the Trio library. The AI group averaged 50% on the quiz, the hand-coding group 67%. The largest gap was on debugging questions, which is the skill you need when this export breaks at 3am. People who asked conceptual questions scored 65% or more, people who delegated under 40%. They say that pattern is associated, not causal, and the sample was small. https://www.anthropic.com/research/AI-assistance-coding-skills

[click] Two questions before approving a plan. First: what user problem justifies this code? Spec Kit's assess extension ends in go, clarify or kill before any spec is written, and kill is a valid answer. https://github.com/github/spec-kit/blob/main/newsletters/2026-July.md
- Second: could someone other than the author explain this decision and investigate a failure? If not, the plan isn't done.
-->

---
layout: none
---

<SectionGate :current="2" title="Put something working in front of a person" question="What can someone see and check today?" />

<!--
Slice, about 6 minutes. No demo.
-->

---
part: Slice
class: ns
clicks: 1
---

# What goes wrong without slicing

<HowItFails :gate="2" :step="$clicks" />

<!--
About 1 minute.

- An agent will happily finish every layer before anyone has clicked anything. Day four is when you find out the columns are wrong.
- And the reverse mistake: a four-line PR gets approved in seconds because it's small.
[click] The fixes: a thin working path on day one, and review effort set by blast radius, not by line count.
-->

---
part: Slice
class: ns
clicks: 2
---

# Get a thin path working before the database is done

<TracerBullet :step="$clicks" />

<!--
About 2 minutes.

- The usual split is by layer: data first, then the API, then the UI. Nobody sees anything work until day four. That's when you find out the columns are wrong, or the whole idea is.

[click] Tracer bullets go the other way. A narrow path through every layer on day one. The data can be an in-memory fixture behind the same interface. The path is real, so a person can click it.

[click] Every day after that ends with something a person can check. Stubs are fine. A slice with no visible result isn't.

- This matters more with agents. An agent will happily finish all four layers before you've looked at anything. A running prototype on day one is the cheapest review you'll get.
- The term comes from The Pragmatic Programmer. Matt Pocock's skills use it for how agents should cut work. https://github.com/mattpocock/skills
-->

---
part: Slice
class: ns
clicks: 2
---

# The export, one tracer bullet at a time

<TracerSlices :step="$clicks" />

<!--
About 1.5 minutes.

- Slice one ships with fixture data. The product owner clicks Export on day one and tells you the columns are wrong before anyone writes a query.

[click] Each later slice replaces a stub or widens the path, and each ends with a check a person can run. Slice two is where the tenant boundary lives, so it gets its own check. That's the one we'll break in the verify part.

[click] Matt Pocock's rule, from his to-tickets skill: each slice cuts a narrow but complete path through every layer, is demoable or verifiable on its own, and fits in one fresh agent context. https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md

- A review unit isn't a deployment unit. Keep the export behind a flag until slice two lands.
-->

---
part: Slice
class: ns
clicks: 2
transition: gate | gate-back
---

# Size is not risk

<SizeRisk :step="$clicks" />

<!--
About 1.5 minutes.

- Both minimaps use the same scale, one row per line. The rename is huge. The auth change is a speck.

[click] The rename needs a mechanical check. The ten lines need a person and a boundary test, because they change who can delete what.
- The rename is the one exception to tracer bullets. Matt Pocock's skill sequences a wide refactor as expand, migrate in batches, contract, so the build stays green throughout.

[click] Line count predicts review time. It doesn't predict blast radius.
- Dillon Mulroy keeps PRs at 300 to 800 lines and reads every generated line. That's his practice, not a safety threshold. https://www.wordman.dev/podcast/dillon-mulroy-i-enjoy-coding-less-than-ever/
-->

---
layout: none
---

<SectionGate :current="3" title="Green is a starting point" question="Which claim did we actually test?" />

<!--
Verify, about 6 minutes. No demo.
-->

---
part: Verify
class: ns
clicks: 1
---

# What goes wrong without verification

<HowItFails :gate="3" :step="$clicks" />

<!--
About 1 minute.

- Three failures. The agent does the easy thing: a browser module reads server storage because it works.
- It writes tests that check the code against itself. The example is exaggerated, but tests that only repeat the implementation's assumptions are common.
- And nobody runs it. Three tests pass and the button downloads an empty file.
[click] The fixes: rules that fail locally and say how to repair the problem, expectations taken from the decision, and an agent that runs the app and checks it like a user.
-->

---
part: Verify
class: ns
clicks: 2
---

# Catch repeatable mistakes locally

<LocalChecks :step="$clicks" />

<!--
About 1 minute.

- Types, ordinary linters and tests cover different questions. Add repository-specific lints when a rule is clear and repeated, such as a browser module importing server storage.
[click] Run these checks in the local implementation loop. CI repeats them; a predictable violation should usually be fixed before anyone reviews the PR.
[click] The failure message tells the agent which boundary it crossed and how to repair it. It then reruns the check. A failure that says only "bad import" wastes another turn.
- This is an illustrative diagnostic. OpenAI's harness team explicitly describes custom lints whose error messages carry remediation instructions into the agent's context.
- Mechanical checks can enforce structure. They cannot decide what this feature should mean, which is why we still need the behavioral example that follows.
- Source: https://openai.com/index/harness-engineering/
-->

---
part: Verify
class: ns
clicks: 2
---

# Make architecture rules executable

<ArchitectureRules :step="$clicks" />

<!--
About 1 minute. This is the architecture example Pasi requested from OpenAI's harness blog.

- Redrawn from the blog's stated dependency model. Each business domain uses Types, Config, Repo, Service, Runtime and UI. Dependencies are restricted to allowed forward edges. Providers is the explicit entry point for cross-cutting concerns.
[click] A disallowed dependency is a lint or structural-test failure, with instructions for the fix. This can run on the developer's machine and again in CI.
[click] The reusable idea is an explicit dependency policy that tools can enforce. The six-layer model is OpenAI's choice for that repository, not a universal architecture recommendation.
- Arrows are imports: each layer may import the ones before it, the forward direction the article describes. The Service-to-UI import and the lint message are my illustration, not from the article.
- Vertical slice delivery and dependency layers answer different questions. A slice is one usable behavior across the needed layers; the architecture defines which dependencies its code may take. A feature-oriented repo can enforce its own simpler boundaries with the same mechanism.
- Source: https://openai.com/index/harness-engineering/
-->

---
part: Verify
class: ns
clicks: 2
---

# Make the right way the only way

<OneWay :step="$clicks" />

<!--
About 1 minute.

- Poteto again. The first versions of their app were eight god files, each at least 10,000 lines. Every agent appended to one, because that's the easy thing.
[click] Their internal framework, Dune, gives every feature its own directory, and a registry discovers them. Lint rules leave one way to add a feature. The tree and the lint message here are my illustration.
- The habit behind it: watch how agents fail, and each time ask "how do I turn this into a lint rule? How do I make it so that the codebase makes this impossible?"
- The same thinking applies to the agent's own tooling. Agents kept writing their own scripts to verify their work, differently each time, so they moved the deterministic part into a CLI inside the verification skill. The agent keeps the judgement, the script does the mechanics.
[click] Their words: "an environment where it's actually very hard to write bad code."
- Source: https://www.youtube.com/watch?v=MN9dGgmLyso
-->

---
part: Verify
class: ns
clicks: 2
---

# Let the agent run the app and check it

<RunTheApp :step="$clicks" />

<!--
About 1 minute.

- Lints and tests check the code. This checks the behaviour, the way a person would, except the agent does it.
- Start a fresh instance with known data. In the demo app that's npm run reset and npm run dev. The seed data includes awkward titles on purpose: A-102 has a comma, A-103 has double quotes.
[click] Reproduce it in a browser the agent controls: export, then open the file as a table. A-102 splits into four columns because the comma isn't quoted. The agent's parse check says the same: four fields where three were expected. The bug is illustrative; the data is the demo app's.
[click] Fix it, then repeat exactly the same action with the same data. Every row has three columns. Same action before and after is the evidence.
- Ask the agent to record both runs. The two clips go into the PR, and they show a reviewer the bug and the fix in under a minute. We'll see that again in the review loop.
- Poteto calls this the single most important skill to have: giving the agent "hands and eyes". Every app at their company has its own verification skill, and it was the first skill that let them climb what they call the trust ladder. https://www.youtube.com/watch?v=MN9dGgmLyso
- OpenAI made their app bootable per git worktree so Codex could launch one instance per change, and wired Chrome DevTools into the agent so it could "reproduce bugs, validate fixes, and reason about UI behavior directly". Logs and metrics come from a local stack per worktree that's torn down when the task ends. https://openai.com/index/harness-engineering/
- What you need to make this work: one command to start the app, one command to reset to known data, data that makes a mistake visible, and a browser the agent can drive. Most projects have the first, few have the other three.
-->

---
part: Verify
class: ns
clicks: 2
transition: gate | gate-back
---

# Run one copy of the app per agent

<ParallelApps :step="$clicks" />

<!--
About 1 minute.

- One agent checking its work in a browser is good. It gets much better when several can do it at once on the same machine.
[click] Each agent works in its own worktree and starts its own copy of the app: its own ports, its own seeded data, its own browser. Three agents verify three different changes at the same time, and none of them waits for another or breaks another's data. The worktree names and ports are illustrative.
[click] What usually stops it is small. Fixed ports: our own demo app hard-codes Vite on 5176 and its proxy to 4323, so a second copy collides. One shared database or cache. One browser profile with one login. Each is a short fix: read ports from the environment, keep seed data per worktree, give every agent its own browser.
- OpenAI made their app bootable per git worktree for exactly this, with a local logs and metrics stack per worktree that's torn down when the task ends. https://openai.com/index/harness-engineering/
- This is what makes parallel agents practical. Without it, every extra agent is another thing you have to sequence by hand.
-->

---
layout: none
---

<SectionGate :current="4" title="Show the loop, including the stop" question="How many reviews before it can merge?" />

<!--
Review, about 11 minutes including a 3-minute demo.
-->

---
part: Review
class: ns
clicks: 1
---

# What goes wrong in review

<HowItFails :gate="4" :step="$clicks" />

<!--
About 1 minute.

- Two opposite failures. The rubber stamp: 1,940 lines and "LGTM" two minutes later.
- The endless loop: bots keep finding things, fixes create new findings, two reviewers undo each other.
[click] The fixes: agents review every slice before a person is asked, you watch the clip before reading the diff, and a stop rule ends the loop.
-->

---
part: Review
class: ns
clicks: 2
---

# Review in two loops

<ReviewLoops :step="$clicks" />

<!--
About 1 minute.

- The inner loop runs on my machine before the PR: implement, run tests and lints, inspect the browser, then instruct reviewer subagents to examine the change. This is a normal prompt or workflow instruction, not a separate review service.
[click] The PR loop adds CI and third-party review bots. A local babysitter watches the feedback, checks the current commit, makes a bounded fix and waits for new results.
[click] Repeated, mechanical mistakes should be caught locally. PR review buys another view and catches risks the earlier checks missed.
- Speed varies with the task and the agents. The distinction is where the feedback arrives and whose attention it uses, not a promise that every local review takes seconds.
-->

---
part: Review
class: ns
clicks: 2
---

# Review runs inside every slice

<LocalAdversaries :step="$clicks" />

<!--
About 1 minute.

- I don't ask for a review after the work. It's part of the instruction I give the implementer before it starts: after each slice, run the review subagents, fix what matters, rerun the checks, commit, and only then come back to me.
- The agent builds the slice first.
[click] Then, without me: review subagents with different questions. Functional checks the agreed behavior, non-functional checks limits and failures, security checks authority and untrusted input. They run in parallel. The agent fixes what it judges worth fixing, reruns the checks and commits the slice. A commit per slice keeps every step easy to review and easy to undo. I usually trust its judgement on which findings matter at this point.
- Before the commit it records a short clip of the feature. It already drives the browser for the checks, so the clip costs almost nothing.
[click] The agent comes back with a short report: slice committed, a clip, what it fixed, what it skipped and why, checks green. My attention is needed only after the models have checked the obvious issues.
- I watch the clip before I read the diff. Thirty seconds tells me what the slice does, so I read the code knowing what it's for. If the clip surprises me, that's the first thing to ask about. Then I decide: next slice, or a PR for this one. The clips go into the PR description, so a reviewer sees the feature before the code too.
- OpenAI's harness team does this end to end: the agent records a video of the bug, fixes it, and records a second video of the fix before opening the PR. https://openai.com/index/harness-engineering/
- Fresh context helps the reviewer look at the change without the builder's whole conversation. It isn't full independence. Pass the decisions and the diff, not a persuasive explanation of why the implementation is right.
- The findings in the report are illustrative.
- Sources: https://www.huuhka.net/primary-vs-subagents-in-llm-harnesses/ https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/
-->

---
part: Review
class: ns
clicks: 2
---

# Write the stop rule before the loop starts

<div class="ns-rules">
  <Show :step="$clicks" :at="1" class="col">
    <h3>A finding earns a fix when</h3>
    <p>It comes with a repro or a failing check.</p>
    <p>It's above the severity bar for this change.</p>
    <p>The change is risky enough for that reviewer.</p>
  </Show>
  <Show :step="$clicks" :at="2" class="col end">
    <h3>The loop ends when</h3>
    <p>A round finds nothing above the bar.</p>
    <p>The budget runs out. A person decides.</p>
    <p>Reviewers disagree. A person decides.</p>
    <p>A new commit lands. Old approvals are stale.</p>
  </Show>
</div>

<!--
About 45 seconds.

- The local loop needs a stop before we run it. Write it down first.

[click] What earns a fix. "Consider handling errors" doesn't. A reproducible request does.

[click] What ends the loop. The budget is rounds, minutes or money. The budget and a disagreement end in a person, not another retry. A new commit makes every earlier approval and CI result stale.

- Polylane's first prototype took nearly 7 minutes at the median. After a 30-step budget, a fresh review for each new commit and other changes, their review turn's median is 94 seconds. Budgets aren't just about cost. https://polylane.com/blog/how-we-prevent-slop-from-hitting-prod/
- In the prepared PR examples that follow, point out the actual fix budget and stop decision. Keep the walkthrough to a few worthwhile findings.
-->

---
part: Review
class: ns
clicks: 3
---

# The PR is where you buy a second opinion

<SecondOpinion :step="$clicks" />

<!--
About 1 minute.

[click] Reviewers from other model families. The model that wrote the code shares its own blind spots. Another family, or a provider's review bot, may catch what it missed. This picture is illustrative. I found no credible public data on overlap between providers, so measure your own.
- The reviewers I use: GitHub Copilot code review, my own reviewer bot, and a different model family run locally.

[click] The babysitter: a local agent run that watches the PR, reads comments and CI, makes one bounded fix, pushes, and waits. I'm building a babysit skill for this. It'll get a demo when it's ready.

[click] Where it goes wrong: reviewers undoing each other, acting on a CI result from an older commit, commits landing after approval that nobody reviewed, and prompt injection. An agent that acts on PR comments will act on a malicious one.
-->

---
layout: none
---

<DemoSlide title="Review bots and a local babysitter" :minutes="3" prepared agent="T3 Code · two real PRs" prompt="Follow the review comments, the local fixes and the next CI run. Which findings deserve action? Which commit do the checks cover? Where does the babysitter stop?" />

<!--
Prepared walkthrough in T3 Code, about 3 minutes.

- The public PR examples and clips are linked on the following slide. Use them for the verification and review walkthrough. A live babysitter run needs separately prepared local artifacts.
1. PR one: show the different bots' actual comments. Pick a useful finding and some overlap or noise.
2. PR two: compare the one-line CSS change with the recorded behavior and measurements. Check which commit the approval covers.
3. If the live babysitter is ready, show its fix, push, next CI results and actual stop or escalation. A new commit requires new evidence.
- Keep the local implementation/subagent loop on the earlier diagram. These PRs demonstrate the outer loop.
- Preparation status: the public PRs and recordings are selected. The babysit skill was previously under construction; show it only once the real workflow is ready. Do not imply a working integration we have not observed.
- Source for the bot architecture and bounded fixes: https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/
-->

---
part: Review
class: ns
---

# Two real PRs from T3 Code

<T3PrExamples />

<!--
About 1 minute. Use these links for the walkthrough introduced on the preceding slide. Both examples are merged PRs with playable recordings and explicit agent credits. The PR numbers and video buttons open the original sources in a new tab. Both cards stay visible so we can choose a link while presenting.

- PR #11354, merged 12 September 2026, fixes background preview Enter sending the human's unfinished composer draft. Play the 10-second before clip, then the 14-second after clip. The draft diagram on this slide is an illustration; the linked clips show the actual app. The PR credits GPT-6-Astra in Codex and reports 105 focused tests. Native macOS remained unverified.
- For the review walkthrough, show a finding that earned a fix and one that did not. The agent reproduced a clipboard sanitization bug before fixing it, then repeated the check: https://github.com/pingdotgg/t3code/pull/11354#discussion_r3994847850
- Macroscope and CodeRabbit both questioned native text selection behavior. The agent checked the bundled Electron runtime; CodeRabbit withdrew its finding after that verification: https://github.com/pingdotgg/t3code/pull/11354#discussion_r3994836449
- PR #15265, merged 3 October 2026, changes one production line containing two CSS selectors. The selector excerpt on this slide shows the replacement, not the full source line. The PR reports 4,316 elements restyled before and 5 after one small DOM mutation. This is not the count for the whole typing session.
- The comparison video is 14.48 seconds; the stress video is 47.32 seconds. Both use 4× CPU throttling. The PR includes production-build traces, a real-data copy, a larger stress copy, and visual checks across 32 banner-layout, theme and width combinations.
- GPT-6-Astra in Codex found and fixed the performance issue. Claude Opus 5.5 in Claude Code measured it and opened the PR, both inside T3 Code. The measurements are the authors' reported results, not a benchmark we independently reran.
- These public artifacts show agent development, verification and review responses. They do not establish the configuration or budget of an unattended babysitter.

Sources:
- https://github.com/pingdotgg/t3code/pull/11354
- https://github.com/pingdotgg/t3code/pull/15265
-->

---
part: Review
class: ns
clicks: 2
---

# Test your reviewers on bugs you already found

<ReviewerBench :step="$clicks" />

<!--
About 1.5 minutes.

- "Measure your own" from the last slide, made concrete. This is how Uber benchmarks its review bot, uReview.
- Their words: "We built its benchmark from real pull requests with known bugs and graded them easy, medium, and hard. We score precision, recall, and F1 against those bugs, plus cost per review, latency, timeouts, and noise." https://www.uber.com/gb/en/blog/efficient-software-factory/

[click] Run the reviewer you use today. Count what it caught, what it missed, false alarms, minutes and cost.

[click] Rerun it when the model or the review prompt changes. Uber: "The frontier shifts every few weeks." Switching models improved their F1 and cut cost per PR. Rerunning after a prompt change is my addition.

- The PRs and results on screen are illustrative. Start with ten bugs your team already fixed. You don't need thousands.
-->

---
part: Review
class: ns
clicks: 3
transition: gate | gate-back
---

# How many reviews before it can merge?

<ReviewBudget :step="$clicks" />

<!--
About 2 minutes. The controls work. Change reviewers, rounds or the lens live if there's time.

- One reviewer, one round. It finds some real issues and some noise.

[click] Three reviewers from different providers. More real issues in round one, and a lot more noise to triage.

[click] Keep going to five rounds. Real findings drop fast. Noise doesn't. The stop marker is where a round finds less than half a real issue.

[click] The same run in money. For a manager, the model runs are the cheap part. People's time is the expensive part. Developers feel it as attention, managers see it as salary.

- Same stop rule as the local loop. Here the budget is other people's attention.
- The model is illustrative. Assumptions: 6 real issues, each reviewer catches a remaining one with p 0.35 (extra reviewers only partly independent), each fix adds 0.12 new issues, 2.5 noise findings per reviewer per round, 3 minutes to triage a finding, 8 to review a fix, €90 an hour, €0.60 per model run, 300 PRs a month.
- Uber benchmarks its review bots on precision, recall, F1, cost per review, latency and noise. That's the right shape of measurement. https://www.uber.com/gb/en/blog/efficient-software-factory/
-->

---
layout: none
---

<SectionGate :current="5" title="What happens after merge?" question="Who watches the rollout, what stops it, and how do we recover?" />

<!--
Production. Keep the counterargument, containing a bad change, the full Polylane case study and the Jev aside in this draft. Rehearsal will determine the cuts. The notes from here on give provisional durations, not clock times.
-->

---
part: Production
class: ns
clicks: 1
---

# What goes wrong after merge

<HowItFails :gate="5" :step="$clicks" />

<!--
About 1 minute.

- CI doesn't know production: the traffic, the locks, the queues. A four-line migration can block every write to a table.
- And the quiet one: the same correction, typed into review again and again.
[click] The fixes: checks that use what production knows, a small blast radius when something gets through, and turning repeated corrections into checks. That last one is the Monday takeaway.
-->

---
part: Production
class: ns
clicks: 4
---

# Some teams already skip reading every line

<AutomationDial :step="$clicks" />

<!--
About 2 minutes. Give this a fair hearing.

[click] People still approve every change. Dillon reads every line. Honeycomb's team reviews plans for bigger tickets and reads less of the code, but it auto-approves 0% of PRs on purpose. Uber keeps people in review and tests its review bots against past PRs with known bugs, scoring precision, recall, cost and noise.

[click] Machines approve some changes. Spotify's Fleet Management auto-merges most automated changes after checks. Its merged changes doubled, and it's watching PR size creep up. Intercom auto-approves over 19% of PRs, but only narrow ones, anyone can ask for a human, and the engineer who ships stays accountable.
- OpenAI's harness team made human review optional: "Humans may review pull requests, but aren't required to." They still understand the system, just not line by line. They own the rules: a fixed layer model, custom lints and structural tests, and plans and decision logs checked into the repo. Their words: "Human taste is captured once, then enforced continuously on every line of code." They also spent a fifth of their week cleaning up slop until they automated that too.
- Be fair to OpenAI's tradeoff: they also run "minimal blocking merge gates" and rerun flaky tests instead of blocking, because "corrections are cheap, and waiting is expensive." They add: "This would be irresponsible in a low-throughput environment." Reading less works when recovery is cheap.

[click] One team moved the other way. HumanLayer, whose research and planning workflow I borrowed earlier in this talk, went lights-off in July 2025: "Just read the specs and the tickets, background agents for all the small/medium stuff." Months later they were digging into "the codebase you stopped reading three months ago", and by November one co-founder spent two weeks rewriting by hand. Dex Horthy's 2026 AI Engineer keynote, "Why software factories fail", puts code review back: "For now, the judge is you." They kept the planning; plans now cut the review, they don't replace it.
- Dex's speed claim: you can "move 2-3x faster, safely" instead of chasing 10 to 100 times.
- My view: reading all the code gives the best quality I've seen. It's also the slowest option. Pick where on this line each change sits, don't default to one end.

[click] The common thread: every team that reads less of the code added more automated checks, and made recovery cheap.

- Numbers as of each post: Intercom April 2026, Spotify September 2026.
- Sources: https://www.honeycomb.io/blog/30-70-prs-day-how-we-managed-not-wreck-systems https://www.uber.com/gb/en/blog/efficient-software-factory/ https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe/ https://openai.com/index/harness-engineering/ https://engineering.atspotify.com/2026/9/ai-changed-how-spotify-builds-what-we-learned-and-fixed-about-quality-at-higher-velocity
- HumanLayer sources: essay version of the keynote https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md (keynote video https://www.youtube.com/watch?v=Ib5GBkD555M, July 2026), the "2-3x faster, safely" post https://x.com/dexhorthy/status/2081058573556306030 and HumanLayer's own summary: "read the code, seek leverage, and break skills into workflows" https://www.humanlayer.dev/blog/humanlayer-resources
- The quotes come from the essay and the post, not a checked video transcript.
- These are company reports, not controlled comparisons.
-->

---
part: Production
class: ns
clicks: 2
---

# More change means more chances to break

<VolumeChart :step="$clicks" />

<!--
About 1 minute.

[click] Honeycomb: peak weekday merges went from about 30 in early 2025 to 74 in April 2026. Incidents went from 18.5 a quarter in 2024 to 32 and then 53 in the first two quarters of 2026. Spotify's merged changes roughly doubled.

[click] Honeycomb's reading is that incidents track change volume roughly linearly. Careful: Q2 jumped to 53 while throughput held roughly flat, so this isn't a clean line. Their goal is keeping each failure cheap to contain with feature flags, bulkheads and least privilege, not holding the count flat. Spotify found no AI-specific incident signature, but volume grew faster than some verification controls.

- Peak merges are a peak metric. The calendar average is about half.
- https://www.honeycomb.io/blog/30-70-prs-day-how-we-managed-not-wreck-systems
-->

---
part: Production
class: ns
clicks: 2
---

# Invest in the feedback around the agent

<PlatformFeedback :step="$clicks" />

<!--
About 1 minute. Honeycomb's second part adds the practical work underneath the throughput figures.

- Their gains arrived alongside investments in delivery, fast CI, agent-accessible tools and team practices. Part one explicitly cautions that they cannot isolate one cause from the overlapping changes.
[click] Part two turns misses into updates to repository instructions, skills or review rules. Production signals can become constraints for the next change.
[click] Use some of the new capacity to improve the tools themselves. Their examples include deployment notifications and change visibility built with AI so people can understand what is shipping. Fast checks and readable CLIs are part of the agent's feedback loop.
- Their platform team owns CI/CD and the agent's working environment. They also describe Intercom's dedicated team-2x and shared plugin/skill infrastructure as a substantial investment, not merely buying model access.
- Keep this tied to the local lint example: a stable correction can become a check everyone gets next time. Some misses need design judgment rather than another brittle rule.
- Sources: https://www.honeycomb.io/blog/30-70-prs-day-how-we-managed-not-wreck-systems https://www.honeycomb.io/blog/ai-amplifies-existing-practices-lessons-ai-first-strategy
-->

---
part: Production
class: ns
clicks: 3
---

# Make a bad change cheap to contain

<ContainRollout :step="$clicks" />

<!--
About 1.5 minutes.

- Something will get through. Plan for it before merge: who watches, what stops it, how far it can spread.
- Intercom: "The engineer who ships a change is expected to watch it go live, monitor its behaviour in production, and be ready to roll back if something isn't right. AI approval doesn't change that." https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe/
- Spotify: "an automated dependency upgrade passed our checks, but still failed in production, impacting end users." Their response: stronger safeguards, more rollback capacity, and "scheduling automated changes during owning teams' working hours." https://engineering.atspotify.com/2026/9/ai-changed-how-spotify-builds-what-we-learned-and-fixed-about-quality-at-higher-velocity

[click] The signal: for our export, foreign rows in an export, per team. Honeycomb's foundation includes "observability that links shipped code back to the PR that created it". The flag turns it off without a deploy.

[click] The blast radius. One team behind the flag, not every team. Honeycomb: bulkheads between components, deploy trains, feature flags and least-privilege access made outages "lower-impact, rather than either non-existent or uniformly critical-severity." A rollback isn't always safe, for example after a data migration. https://www.honeycomb.io/blog/30-70-prs-day-how-we-managed-not-wreck-systems

[click] Honeycomb's goal now: "keeping each failure cheap to contain, not holding the count flat." And: "If you don't have that in place yet, that's the thing to fix before you scale up AI usage, not after."

- The rollout and the metric are our example, not from their posts.
-->

---
part: Production
class: ns
clicks: 2
---

# Our checks don't know production conditions

<FactoryGap :step="$clicks" />

<!--
About 1 minute. Start of the Polylane case study.

- Say: "We've decided how to contain a failure. Can we use what we know about production to catch it before merge?"

- The software factory: an agent writes the code, types and tests run, a linter, a code review. Tests even execute it, as we saw.

[click] None of it knows the production conditions it lands on: the traffic, the locks, the queues.

[click] Polylane's framing of the one question worth answering at PR time. They skip style, naming and coverage and answer only this, with a go or no-go comment on the PR.

- Source for this whole sequence: Vi Tran and Boris Tane, "How we prevent slop from hitting prod", 21 September 2026. https://polylane.com/blog/how-we-prevent-slop-from-hitting-prod/
- Polylane sells this as a product. I'm showing it for the ideas, which you can build with your own telemetry.
-->

---
part: Production
class: ns
clicks: 2
---

# Follow the graph from the repo to production

<ContextGraph :step="$clicks" />

<!--
About 1 minute.

- Polylane keeps a graph of cloud resources, repositories and the edges between them. The resource edges come from the connected cloud accounts. The repository edges come from manifests in the repo: Terraform, CloudFormation, Wrangler files.

[click] A PR touches the repository. Follow the paths in the graph to every resource it can affect.

[click] One repository can deploy dozens of resources, so a small model filters the candidates first. The agent gets the diff, the PR description, the commits and only the resources that matter.

- checkout-api, orders-db and orders-events are from their example. The cron job, the worker and PR #1207 are mine.
- Early exits: a docs, test or comment change, or a PR with no affected resources, ends the check straight away.
-->

---
part: Production
class: ns
clicks: 2
---

# Cheap rules point the agent at known risks

<DiffHeuristics :step="$clicks" />

<!--
About 1 minute.

- Before the agent starts, deterministic rules run over the diff. These four are the ones Polylane lists.

[click] This migration creates an index without CONCURRENTLY. On Postgres that takes a lock that blocks writes to orders for the whole build.

[click] It's a hint, not a verdict. The agent still has to find evidence that it matters here: how many writes, from where, at what time.

- Same idea as the Monday takeaway: turn a known mistake into a rule that runs every time.
-->

---
part: Production
class: ns
clicks: 3
---

# Trace each failure to a metric, then judge it

<Trajectory :step="$clicks" />

<!--
About 1.5 minutes.

- The agent writes failure trajectories: one causal chain from a trigger, through the changed code, to a drop in a specific metric. Every link cites something: a file and line, a log template and its count, a metric read, a config key, a graph edge.

[click] It tries to both confirm and refute each one against production.

[click] Confirmed means production data backs it. Plausible means the chain is concrete but a link is a guess with no telemetry to check it. Refuted means the data says it's unlikely.

[click] Their rule is one line of code: any confirmed trajectory fails the check. They call that a conservative choice. My reading: plausible passes, and missing evidence isn't proof of safety. It's a policy choice. Decide who owns a plausible failure before it happens.

- The three rows are our migration example. Their post uses a dropped index still used by checkout (confirmed), a retry change that amplifies load on orders-db (plausible) and a removed binding that breaks a worker (refuted).
- A rollback isn't always safe, for example after a data migration.
-->

---
part: Production
class: ns
clicks: 3
---

# Read the band, not the median

<ForecastBand :step="$clicks" />

<!--
About 1.5 minutes. The threshold line is draggable.

- Whether a change hurts depends on traffic, and traffic has a shape. A queue at 60% that stays there is fine. The same queue at 60% and climbing every week isn't. The last hour of metrics won't tell you which.

[click] Polylane forecasts the affected series before judging a trajectory. They self-host Toto-2.0-22m, a time-series model. 64 hourly points in, 24 hours out.

[click] It returns a band, p10 to p90, that widens with the horizon. It forecasts up to 16 related series together, because request rate, errors, latency and queue depth move together.

[click] The agent reads the band. Their words: a p10 that stays above the threshold a trajectory depends on is a different answer from one that crosses it. The three readings on screen are my simplification. Drag the line to show them.

- The series here is synthetic, shaped like the checkout-api chart in their post. They call forecasting their most experimental piece, still being measured.
-->

---
part: Production
class: ns
clicks: 2
---

# A no-go comes with the mechanism, the evidence and a fix

<NoGoComment :step="$clicks" />

<!--
About 1 minute.

- This is what lands on the PR. The first line is the mechanism, in plain words.

[click] Then the evidence: the exact file and line, and production data. Checkout writes to orders about 38 times a second, and every one of those waits while the index builds.

[click] Then what would make it safe. That's the difference from a review bot that says "consider performance".

- Redrawn from their example comment. The chart is synthetic.
-->

---
part: Production
class: ns
clicks: 2
---

# It has to fit inside CI

<LatencyBudget :step="$clicks" />

<!--
About 1 minute.

- This runs as a required CI step, so it gets 2 to 3 minutes. Their first prototype took nearly 7 minutes at the median and up to 20. These are production medians from 15 September, over 325 runs.
- The review turn was 30 to 40 sequential model steps, up to nearly 600 in the worst case, about 17 seconds each, mostly reasoning tokens.

[click] The biggest changes: a step budget of 30, with the count in every prompt so the model can plan around it. A new commit cancels the old review and starts a fresh thread, because steering the old one confused it. And reuse: review only the diff since the last completed run.

[click] The latest median for the review turn is 94 seconds.
- Their line worth quoting: putting the count in the prompt lets the model plan around it, which mattered more than the number itself.

- These are the stop rules from the review part again: a budget, and fresh evidence for every commit.
- Their success metric is prevented incidents: they flag a risk, an engineer pushes a fix, a new assessment says it's mitigated, and the PR merges. They report 2.3 per customer per week. That's a proxy, not an observed incident count.
-->

---
part: Production
class: ns
clicks: 1
transition: gate | gate-back
---

# Aside: use a decision model for decisions

<JevBars :step="$clicks" />

<!--
Thirty seconds, keep it moving. Same company as the case study.

- Not every step in an agent pipeline needs an LLM. Polylane replaced LLM calls with Jev, a typed decision model, for yes/no, choice and score questions.

[click] P90 latency from 4,752 to 508 milliseconds. Cost per thousand calls down 39%.

- Their workload, their numbers, from about a week of use. Wherever their agents pick from a fixed set of answers, Jev is the default. Ranking resources by priority is their highest-volume use and drives most of the savings.
- https://polylane.com/blog/we-swapped-our-llms-for-jev/
-->

---
part: Close
class: ns
---

# The same four PRs, with evidence

<BrokenPrs mode="evidence" />

<!--
About 1 minute.

- Back to the four PRs from the start. The checks at the top are the same. What's different is the line at the bottom: the evidence that would have caught each one.
- #482: a boundary check, taken from the design decision, that fails when the filter is removed.
- #517: a lint rule. Browser code may not import server modules. The demo app already has this rule.
- #530: four slices instead of one PR, each with a clip of it running before anyone reads the diff.
- #541: a production-aware check. Polylane's no-go comment: 38 writes a second would wait for the index build. Use CONCURRENTLY.
- None of these needs a better reviewer. Each one is evidence the agent could have produced, and that someone checked.
- That's what "done" means in this talk.
-->

---
part: Close
class: ns
clicks: 3
---

# Work backwards from agents that merge

<TrustLadder :step="$clicks" />

<!--
About 2 minutes.

- Poteto's starting question for scaling: "How do I get to the point where my agent can merge its own code?" Work backwards from there. Each rung moves one job from you to the environment.
- Rung one is where most of us start: you relay everything, which is the bottleneck slide.
[click] It runs and checks its own work, so you can read the diff instead of testing it. It reviews each slice with subagents, so you watch a clip and read code that's already been through a round.
[click] It finds its own context: tickets, Slack, telemetry, past sessions. Then the top rung. Poteto reports that their agents now merge their own PRs, after a loop of verifier agents that run and click through the app. They review the commit history in the morning, sample instead of reading everything, and when they find a problem they fix the environment, not the one agent: a new lint rule, a better skill.
- They're explicit that this took a long time and isn't something you get by installing a skill library. "It took a lot of bravery."
[click] And it only works where mistakes are cheap to undo and the work can be checked. Matt Pocock's follow-up question was about one-way doors, changes that can't be walked back. Poteto's answer: "verifiability of the domain is an important aspect", and they didn't claim to have the answer.
- Compare with the dial from the production part: HumanLayer tried the top rung and went back to reading code. Pick the rung per kind of change, not one for the whole team.
- Question for the room: what would have to be true for your agent to merge this? The list of failures is most of the answer.
- Source: https://www.youtube.com/watch?v=MN9dGgmLyso
-->

---
part: Close
class: ns
clicks: 1
---

# On Monday, turn one repeated correction into a check

<div class="ns-monday">
  <p class="lead">Pick the review comment you keep writing. Make the repository say it for you.</p>
  <Show :step="$clicks" :at="1" class="term">
    <div class="bar"><span class="ns-mono">npm run check:slides</span><em>this deck</em></div>
    <div class="out ns-mono">
      <div class="bad">✗ no-slop-deck slide 12 [empty-bottom] content ends at 402px, 47% of the band empty</div>
      <div class="bad">✗ no-slop-deck slide 19 [tiny-text] 12px "Illustrative model"</div>
      <div class="dim">empty-bottom: Make the main exhibit taller so it reaches the citation line.</div>
      <div class="dim">Do not add more text to fill space.</div>
    </div>
    <p>Agents kept leaving slides half empty. Now the commit fails and says how to fix it.</p>
  </Show>
</div>

<!--
About 1.5 minutes.

- Ask the room: what's the comment you type most often in reviews? That's your first check.

[click] My example is from this deck's repository. Agents kept making the same layout mistakes, so a pre-commit script renders every slide and fails with a rule name and a fix. The agent reads the fix and corrects itself.
- The lines shown are the script's real format. The two failures are examples.
- OpenAI's harness team does the same with custom lints: "we write the error messages to inject remediation instructions into agent context." https://openai.com/index/harness-engineering/
- Where to find the comment: your own past sessions. Poteto's tip is to have an agent read your transcripts for the places you corrected it, and suggest a lint rule or skill for each repeated one. They call past chats "a treasure trove of context".
- Poteto also keeps a queue: a routine appends every bad pattern it finds to a document instead of fixing it straight away, and every few days they look for the pattern behind the entries.
- Keep a person as the owner of each decision. Checks carry the ones you've already made.
-->

---
layout: none
---

<div class="ns-dark ns-thanks">
  <h1>Thank you</h1>
  <p class="who">Pasi Huuhka · Zure</p>
  <p class="links ns-mono">huuhka.net · linkedin.com/in/pasihuuhka</p>
  <p class="q">What would convince you a change is safe?</p>
</div>

<!--
About 2 minutes, then questions.

- Leave the closing question on screen during Q&A.
- The sources slide follows as backup.
-->

---
part: Sources
class: ns
---

# Sources

<div class="ns-sources">
  <p><b>Pasi Huuhka</b> Research, plan, implement · Current workflow · Building your own PR reviewer</p>
  <p><b>GitHub Next</b> Chopin · <b>HumanLayer</b> Workflow phases · Why software factories fail · <b>GitHub</b> Spec Kit · <b>Matt Pocock</b> Skills · Poteto interview</p>
  <p><b>Honeycomb</b> Code review bottleneck · 30 to 70 PRs a day · AI amplifies existing practices</p>
  <p><b>Spotify</b> AI changed how Spotify builds · <b>Intercom</b> AI is approving our pull requests</p>
  <p><b>Uber</b> Running a software factory efficiently · <b>OpenAI</b> Harness engineering</p>
  <p><b>Polylane</b> How we prevent slop from hitting prod · We swapped our LLMs for Jev</p>
  <p><b>Aidan Harding</b> Putting learning in the loop · <b>Addy Osmani</b> Comprehension debt</p>
  <p><b>Dillon Mulroy</b> The Weekly Dev's Brew interview · <b>Anthropic</b> AI assistance and coding skills</p>
</div>

<!--
Backup slide. Full links are in the speaker notes of each slide and in the source notebook.
-->
