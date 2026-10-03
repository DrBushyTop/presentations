---
theme: zure
title: The no slop engineer
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
    <h1>The no <span>slop</span><br />engineer</h1>
    <p class="sub">Practices for shipping agent-written code you can explain</p>
    <p class="meta">Pasi Huuhka · Zure · ESPC 2026</p>
  </div>
  <div class="ns-cover-art"><AgentStream /></div>
</div>

<!--
0:00 to 0:30

- Let the stream run for a moment before speaking.
- Say: "That's an agent writing code faster than any of us can read it. Everything it says sounds reasonable. Keep an eye on it, we'll come back to one of those lines."
- I'm Pasi, from Zure. This talk is about the practices I use so that code I didn't type is still code I can explain.
- The timings below are rehearsal notes from the earlier version. This expanded draft keeps the full Polylane section and adds material; rehearse before deciding what to cut.
-->

---
layout: none
---

<SpeakerIntro />

<!--
About 20 seconds. Static apart from the entrance.

- I'm Pasi. I've worked on Azure since 2014, with more than 150 customers, and I've been a Microsoft MVP since 2020.
- The bottom row is every post on my blog. Blue dots are the ones tagged AI: 11 of the 13 I've written this year.
- That's the work this talk comes from.

Sources:
- Azure since 2014: Pasi. Sessionize says "since 2013"; the slide uses 2014.
- 150+ customers, DevOps Architect at Zure: https://sessionize.com/pasi-huuhka/ (title may be out of date)
- MVP since June 2020: https://www.linkedin.com/in/pasihuuhka/ and https://www.huuhka.net/ive-been-awarded-the-microsoft-azure-mvp-title/
- 55 posts and their dates: https://www.huuhka.net (list on 3 Oct 2026)
- 16 tagged AI: https://www.huuhka.net/tag/ai/
- Photo: Sessionize profile image, taken December 2024.
-->

---
part: Would you ship this?
class: ns
clicks: 2
---

# Would you merge this?

<PrCard :step="$clicks" />

<!--
0:30 to 2:00

- A normal-looking PR. Green tests, lint, build, a review bot, one approval.
- Give the room 20 seconds to read the diff.

[click] Hands up if you'd merge it. If most hands go up, that's fine, it looks fine.
- If hands stay down, or someone calls out req.query.teamId: "Some of you spotted the boundary. What check would convince the rest of us?" Same talk from here, just with the room ahead of me.

[click] One question nobody on this PR asked: which team's tasks can this export return? Don't answer yet. We'll come back to it in the verification part.

- It's a teaching example with a seeded defect. I'll say that again when we open it up.
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
2:00 to 3:00

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
3:00 to 4:00

[click] Start the race. Left: model output at about 15 times human reading pace. Right: you, reading at about 238 words a minute.

[click] The backlog is the real number. Everything in it gets accepted on trust or read later, which usually means never.

- Say: "The bottleneck moved from writing code to understanding it."
- Source: GitHub Next, Chopin. They put reading at about 238 words a minute and generation at roughly 4,500 tokens a minute, and call the ratio about 1 to 15. Their own figures give nearer 1 to 19, so 15 is the conservative number. https://githubnext.com/projects/chopin/
- If asked: Anthropic's randomised study (52 mostly junior engineers) found AI-assisted learners scored 50% vs 67% on comprehension. That was learning a new library, not production review. https://www.anthropic.com/research/AI-assistance-coding-skills
-->

---
part: Would you ship this?
class: ns
clicks: 3
transition: gate | gate-back
---

# Six gates between a request and production

<GateMap :step="$clicks" />

<!--
4:00 to 5:00

- This is the map for the talk. Each gate asks one question.

[click] Three before implementation: understand the current system, discuss the design, and decide how to slice the work. Use the phases that the task needs. A detailed implementation plan is optional.

[click] Then a loop for every slice: build it, verify it, review it, and go round again for the next one. It's not a waterfall. Verify and review happen many times a day.

[click] Production once it merges.

- Scale this to the task. A typo fix doesn't go through six gates. A change to who can see what does.
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
transition: gate | gate-back
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
clicks: 2
transition: gate | gate-back
---

# Form an expectation before reading the answer

<div class="ns-ask">
  <div class="ask-q">
    <p>Team A asks for Team B's tasks. What should the export return?</p>
  </div>
  <div class="ask-ev">
    <Show :step="$clicks" :at="1" class="ev">
      <b>Your expected result</b>
      <p>Team A's rows. No Team B rows.</p>
    </Show>
    <Show :step="$clicks" :at="2" class="ev">
      <b>Then inspect the agent's answer</b>
      <p>Does it preserve that boundary? What check would prove it?</p>
    </Show>
  </div>
</div>

<!--
About 1 minute.

- Ask for the audience's expectation before showing either the agent's suggestion or the expected result. Keep the pause natural; no timed exercise instruction on screen.
[click] For this teaching case, the agreed boundary is that the caller gets only their own team's rows.
[click] Now read the generated answer against that expectation. Agreement is not evidence that the boundary holds; ask for a check that could fail.
- The previous version used two detached quotations. Aidan Harding's ask-before-you-tell practice explains the mechanism; Honeycomb's team example belongs on the shared-understanding slide.
- Aidan's source: https://aquiva.com/blog/putting-learning-in-the-loop
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
16:15 to 17:45

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
17:45. Slice, about 5 minutes. No demo.
-->

---
part: Slice
class: ns
clicks: 2
---

# Get a thin path working before the database is done

<TracerBullet :step="$clicks" />

<!--
17:45 to 19:30

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
19:30 to 21:00

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
21:00 to 22:30

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
22:30. Verify, about 7 minutes. The export slide is the demo.
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
clicks: 4
---

# Which claim did the tests check?

<ExportLab :step="$clicks" />

<!--
Interactive verification example, about 5 minutes. This remains a labelled seeded teaching defect. The tests on the slide execute the export function shown.

- 1. Normal request. Team A asks without a query team. The output includes A-101 and A-102. Three happy-path tests pass. One of them checks that Team A rows are present; it never excludes Team B.
[click] 2. Forged request. Still signed in as Team A, now asking for team-b. B-201 and B-202 appear. The same three tests remain green because they run normal requests.
[click] 3. Add boundary checks. The forged request must return exactly A-101 and A-102. The normal request must return exactly two rows. The first check fails on the seeded version.
[click] 4. Fix. Derive the team from the session only. All five checks pass and the forged request returns Team A's rows.
[click] 5. Remove the filter as a negative control. All four rows appear. The two boundary checks fail, proving these checks detect the lost predicate.
- The scenario number and expected IDs remain visible. Distinguish the displayed request from the requests run inside the tests.
- Clicking line 3 or the request lets us revisit versions. The paced five-stage walkthrough is the main path.
- The slide is an executable explanation, not an assertion that an agent generated this defect in the real app.
-->

---
part: Verify
class: ns
clicks: 2
transition: gate | gate-back
---

# A passing test can repeat the same mistake

<SameAssumption :step="$clicks" />

<!--
About 1 minute. This continues the same three happy-path tests from the previous slide.

- The code accepts a query team. Tests written with the same assumption can validate format and expected presence while leaving the actual access boundary unchecked.
[click] Start instead from the agreed behavior. A forged query still returns A-101 and A-102, and no Team B rows. The expected result comes from the decision, not from copying the implementation's output.
[click] Write that expectation before inspecting the generated test. The new boundary test fails against the seeded code.
- The diagram makes the shared-assumption problem explicit. It is not a claim that every test generated by the same model is useless, or that another model can never help.
- Sources: https://github.com/mattpocock/skills https://aquiva.com/blog/putting-learning-in-the-loop https://addyosmani.com/blog/comprehension-debt/
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
- Start a fresh instance with known data. In the demo app that's npm run reset and npm run dev. The seed data includes B-201, a canary row that must never reach Team A.
[click] Reproduce it in a browser the agent controls: signed in as Alex from Team A, ask the export for team-b. The canary row comes back. The server log shows the same thing: six rows for a Team A session.
[click] Fix it, then repeat exactly the same action with the same data. Five rows, no canary. Same request before and after is the evidence.
- OpenAI made their app bootable per git worktree so Codex could launch one instance per change, and wired Chrome DevTools into the agent so it could "reproduce bugs, validate fixes, and reason about UI behavior directly". Logs and metrics come from a local stack per worktree that's torn down when the task ends. https://openai.com/index/harness-engineering/
- What you need to make this work: one command to start the app, one command to reset to known data, data that makes a mistake visible, and a browser the agent can drive. Most projects have the first, few have the other three.
-->

---
layout: none
---

<SectionGate :current="4" title="Show the loop, including the stop" question="How many reviews before it can merge?" />

<!--
29:15. Review, about 12 minutes including a 3-minute demo.
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
[click] The agent comes back with a short report: slice committed, what it fixed, what it skipped and why, checks green. Then I decide: next slice, or a PR for this one, depending on the task. My attention is needed only after the models have checked the obvious issues.
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
31:45 to 32:30

- The local loop needs a stop before we run it. Write it down first.

[click] What earns a fix. "Consider handling errors" doesn't. A reproducible request does.

[click] What ends the loop. The budget is rounds, minutes or money. The budget and a disagreement end in a person, not another retry. A new commit makes every earlier approval and CI result stale.

- Polylane's first prototype took nearly 7 minutes at the median. After a 30-step budget, a fresh review for each new commit and other changes, their review turn's median is 94 seconds. Budgets aren't just about cost. https://polylane.com/blog/how-we-prevent-slop-from-hitting-prod/
- In the prepared PR examples that follow, point out the actual fix budget and stop decision. Keep the walkthrough to a few worthwhile findings.
-->

---
layout: none
---

<DemoSlide title="Review bots and a local babysitter" :minutes="3" prepared agent="T3 Code · two real PRs" prompt="Follow the review comments, the local fixes and the next CI run. Which findings deserve action? Which commit do the checks cover? Where does the babysitter stop?" />

<!--
Prepared walkthrough in T3 Code, about 3 minutes.

- Choose two real PRs after Pasi has prepared them. Show the actual third-party review agents, their overlap or disagreement, and the local babysitter handling worthwhile findings.
1. PR one: show the different bots' actual comments. Pick a useful finding and some overlap or noise.
2. PR two: show the babysitter's local fix, push, current commit and next results. A new commit requires new evidence.
3. Show a stop or escalation rather than an endless request for more review.
- Keep the local implementation/subagent loop on the earlier diagram. These PRs demonstrate the outer loop.
- Preparation status: real PRs and recordings/screenshots still need to be selected. The babysit skill was previously under construction; show it only once the real workflow is ready. Do not imply a working integration we have not observed.
- Source for the bot architecture and bounded fixes: https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/
-->

---
part: Review
class: ns
clicks: 3
---

# The PR is where you buy a second opinion

<SecondOpinion :step="$clicks" />

<!--
36:30 to 37:45

[click] Reviewers from other model families. The model that wrote the code shares its own blind spots. Another family, or a provider's review bot, may catch what it missed. This picture is illustrative. I found no credible public data on overlap between providers, so measure your own.
- The reviewers I use: GitHub Copilot code review, my own reviewer bot, and a different model family run locally.

[click] The babysitter: a local agent run that watches the PR, reads comments and CI, makes one bounded fix, pushes, and waits. I'm building a babysit skill for this. It'll get a demo when it's ready.

[click] Where it goes wrong: reviewers undoing each other, acting on a CI result from an older commit, commits landing after approval that nobody reviewed, and prompt injection. An agent that acts on PR comments will act on a malicious one.
-->

---
part: Review
class: ns
clicks: 2
---

# The AI part is surprisingly small

<ReviewerPipeline :step="$clicks" />

<!--
35:30 to 36:30

- The PR examples show the agents, but the surrounding code owns most of the workflow. I've built a few reviewer bots. The model call is one stage.

[click] Ordinary code owns triggers, commit range, retries, deduplication, timeouts, posting, and the stop. The model owns one judgement, returned as structured output the code can validate.

[click] The same shape runs a /fix command, and it's the shape a babysitter uses.

- Reviews get wordy. Without severity and format limits, the bot creates toil, especially if branch policy requires every comment to be resolved.
- Source: https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/
-->

---
part: Review
class: ns
clicks: 2
---

# Test your reviewers on bugs you already found

<ReviewerBench :step="$clicks" />

<!--
37:45 to 39:15

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
39:15 to 41:00. The controls work. Change reviewers, rounds or the lens live if there's time.

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
clicks: 3
---

# Some teams already skip reading every line

<AutomationDial :step="$clicks" />

<!--
About 1.5 minutes. Give this a fair hearing.

[click] People still approve every change. Dillon reads every line. Honeycomb's team reviews plans for bigger tickets and reads less of the code, but it auto-approves 0% of PRs on purpose. Uber keeps people in review and tests its review bots against past PRs with known bugs, scoring precision, recall, cost and noise.

[click] Machines approve some changes. Spotify's Fleet Management auto-merges most automated changes after checks. Its merged changes doubled, and it's watching PR size creep up. Intercom auto-approves over 19% of PRs, but only narrow ones, anyone can ask for a human, and the engineer who ships stays accountable. OpenAI's harness team made human review optional, and enforced structure with linters and tests. They also spent a fifth of their week cleaning up slop until they automated that too.
- Be fair to OpenAI's tradeoff: they also run "minimal blocking merge gates" and rerun flaky tests instead of blocking, because "corrections are cheap, and waiting is expensive." They add: "This would be irresponsible in a low-throughput environment." Reading less works when recovery is cheap.

[click] The common thread: every team that reads less of the code added more automated checks, and made recovery cheap.

- Numbers as of each post: Intercom April 2026, Spotify September 2026.
- Sources: https://www.honeycomb.io/blog/30-70-prs-day-how-we-managed-not-wreck-systems https://www.uber.com/gb/en/blog/efficient-software-factory/ https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe/ https://openai.com/index/harness-engineering/ https://engineering.atspotify.com/2026/9/ai-changed-how-spotify-builds-what-we-learned-and-fixed-about-quality-at-higher-velocity
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

# Same pull request, with evidence

<PrCard mode="evidence" />

<!--
About 1 minute.

- Back to the PR from the start. The diff barely changed, one line.
- What changed is what we can show: the fact from research, the decision from design, a check that fails without the filter, a review that stopped for a stated reason, and a flagged rollout I'll watch with a signal that stops it.
- That's what "done" means in this talk.
- This is the illustrative closing checklist for the seeded export example. Align the research references, design decision and review stop with the real app artifacts before presenting those as observed results.
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
  <p><b>GitHub Next</b> Chopin · <b>HumanLayer</b> Workflow phases · <b>GitHub</b> Spec Kit · <b>Matt Pocock</b> Skills</p>
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
