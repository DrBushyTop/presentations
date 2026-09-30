---
theme: zure
title: The no slop engineer
titleTemplate: "%s · Pasi Huuhka"
author: Pasi Huuhka
info: |
  Practices for shipping agent-written code you can explain. ESPC 2026, 60 minutes.
  Split variant: every build step is its own slide, joined by view transitions.
  Generated from slides.md. Do not edit.
class: text-left
highlighter: shiki
lineNumbers: false
transition: shift | shift-back
aspectRatio: 16/9
canvasWidth: 1280
colorSchema: light
download: true
exportFilename: no-slop-engineer-split
fonts:
  provider: google
  sans: Inter
  mono: JetBrains Mono
  weights: 200,400,600,700,800
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
-->

---
part: Would you ship this?
class: ns allow-whitespace
transition: view-transition
---

# Would you merge this?

<PrCard :step="0" />

<!--
0:30 to 2:00

- A normal-looking PR. Green tests, lint, build, a review bot, one approval.
- Give the room 20 seconds to read the diff.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Would you ship this?
class: ns allow-whitespace
transition: view-transition
---

# Would you merge this?

<PrCard :step="1" />

<!--
(Step 1 of 2)

Hands up if you'd merge it. Most hands go up. That's fine, it looks fine.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Would you ship this?
class: ns
---

# Would you merge this?

<PrCard :step="2" />

<!--
(Step 2 of 2)

One question nobody on this PR asked: which team's tasks can this export return? Don't answer yet. We'll come back to it in the verification part.

- It's a teaching example with a seeded defect. I'll say that again when we open it up.
-->

---
layout: none
transition: view-transition
class: allow-whitespace
---

<div class="ns-dark ns-statement">
  <p class="big">Slop is a change accepted <em>without evidence</em> about how it behaves.</p>
  <Show :step="0" :at="1" class="small">It doesn't matter who wrote it. It matters what anyone checked.</Show>
</div>

<!--
2:00 to 3:00

- This is my working definition for the talk, not a dictionary one.
- Slop isn't "AI code". It's accepting a change on vibes: green checks, a confident summary, a reviewer who skimmed.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
layout: none
---

<div class="ns-dark ns-statement">
  <p class="big">Slop is a change accepted <em>without evidence</em> about how it behaves.</p>
  <Show :step="1" :at="1" class="small">It doesn't matter who wrote it. It matters what anyone checked.</Show>
</div>

<!--
(Step 1 of 1)

Humans write slop too. I have. The difference now is volume.
-->

---
part: Would you ship this?
class: ns allow-whitespace
transition: view-transition
---

# Agents write faster than we can read

<ReadRace :step="0" />

<!--
3:00 to 4:00


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Would you ship this?
class: ns allow-whitespace
transition: view-transition
---

# Agents write faster than we can read

<ReadRace :step="1" />

<!--
(Step 1 of 2)

Start the race. Left: model output at about 15 times human reading pace. Right: you, reading at about 238 words a minute.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Would you ship this?
class: ns
---

# Agents write faster than we can read

<ReadRace :step="2" />

<!--
(Step 2 of 2)

The backlog is the real number. Everything in it gets accepted on trust or read later, which usually means never.

- Say: "The bottleneck moved from writing code to understanding it."
- Source: GitHub Next, Chopin. Their estimate is about 238 words a minute read and roughly 4,500 words a minute generated, which they round to 1 to 15. https://githubnext.com/projects/chopin/
- If asked: Anthropic's randomised study (52 mostly junior engineers) found AI-assisted learners scored 50% vs 67% on comprehension. That was learning a new library, not production review. https://www.anthropic.com/research/AI-assistance-coding-skills
-->

---
part: Would you ship this?
class: ns allow-whitespace
transition: view-transition
---

# Six gates between a request and production

<GateMap :step="0" />

<!--
4:00 to 5:00

- This is the map for the rest of the hour. Each gate asks one question.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Would you ship this?
class: ns allow-whitespace
transition: view-transition
---

# Six gates between a request and production

<GateMap :step="1" />

<!--
(Step 1 of 2)

Three before any code exists: research, plan, slice. These are the cheapest places to catch a mistake.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Would you ship this?
class: ns
transition: gate | gate-back
---

# Six gates between a request and production

<GateMap :step="2" />

<!--
(Step 2 of 2)

Three after the diff: verify, review, production.

- Scale this to the task. A typo fix doesn't go through six gates. A change to who can see what does.
-->

---
layout: none
---

<SectionGate :current="0" title="Find the fact that changes the plan" question="What do we actually know, and what are we assuming?" />

<!--
5:00. Research, about 6 minutes including a 3-minute demo.
-->

---
part: Research
class: ns allow-whitespace
transition: view-transition
---

# Research, plan, implement. Scale it to the task.

<RpiScale :step="0" />

<!--
5:00 to 6:15


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Research
class: ns allow-whitespace
transition: view-transition
---

# Research, plan, implement. Scale it to the task.

<RpiScale :step="1" />

<!--
(Step 1 of 2)

Three phases, each starting with a fresh context and handing a markdown file to the next. Research maps how things work today. Plan decides what changes and how we'll verify it. Implement follows the plan.
- The 40 to 60% context band is my rule of thumb, not a law.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Research
class: ns
---

# Research, plan, implement. Scale it to the task.

<RpiScale :step="2" />

<!--
(Step 2 of 2)

Most of my work isn't the full sequence. Small change: talk to the agent directly. Medium: plan, then implement. Large, messy or risky: all three.

- Source: my posts. https://www.huuhka.net/research-plan-implement/ and https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/
-->

---
part: Research
class: ns allow-whitespace
transition: view-transition
---

# Follow one claim back to the code

<ClaimTrace :step="0" />

<!--
6:15 to 7:15

- The research agent wrote three confident claims. They all read well.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Research
class: ns allow-whitespace
transition: view-transition
---

# Follow one claim back to the code

<ClaimTrace :step="1" />

<!--
(Step 1 of 3)

Claim one checks out. The list endpoint scopes by the session's team.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Research
class: ns allow-whitespace
transition: view-transition
---

# Follow one claim back to the code

<ClaimTrace :step="2" />

<!--
(Step 2 of 3)

Claim three is false on the new path. The export takes the team id from the query string if one is present.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Research
class: ns
---

# Follow one claim back to the code

<ClaimTrace :step="3" />

<!--
(Step 3 of 3)

Claim two was never checked. It's an assumption, so label it as one.

- Say: "Research should reduce uncertainty about this change, not produce a nice document."
- Pick one claim the plan depends on and open the file yourself.
-->

---
part: Research
class: ns allow-whitespace
transition: view-transition
---

# My research agent was wrong twice while I prepared this talk

<div class="ns-wrong">
  <div class="w-row">
    <div class="w-claim"><span>The research said</span><p>The small-stacks interview is with John Fawcett.</p></div>
    <Show :step="0" :at="1" fx="left" class="w-fix"><span>The source says</span><p>It's Dillon Mulroy. Fawcett wrote a different post.</p></Show>
  </div>
  <div class="w-row">
    <div class="w-claim"><span>The research said</span><p>Niall Murphy linked Aidan Harding's "Coding with AI" from 2025.</p></div>
    <Show :step="0" :at="2" fx="left" class="w-fix"><span>The source says</span><p>He linked "Putting learning in the loop" from July 2026.</p></Show>
  </div>
  <Show :step="0" :at="2" class="w-take">Both summaries read well. Both would have ended up on a slide.</Show>
</div>

<!--
7:15 to 7:45

- A real example. I use agents for research too.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Research
class: ns allow-whitespace
transition: view-transition
---

# My research agent was wrong twice while I prepared this talk

<div class="ns-wrong">
  <div class="w-row">
    <div class="w-claim"><span>The research said</span><p>The small-stacks interview is with John Fawcett.</p></div>
    <Show :step="1" :at="1" fx="left" class="w-fix"><span>The source says</span><p>It's Dillon Mulroy. Fawcett wrote a different post.</p></Show>
  </div>
  <div class="w-row">
    <div class="w-claim"><span>The research said</span><p>Niall Murphy linked Aidan Harding's "Coding with AI" from 2025.</p></div>
    <Show :step="1" :at="2" fx="left" class="w-fix"><span>The source says</span><p>He linked "Putting learning in the loop" from July 2026.</p></Show>
  </div>
  <Show :step="1" :at="2" class="w-take">Both summaries read well. Both would have ended up on a slide.</Show>
</div>

<!--
(Step 1 of 2)

The podcast about small stacked PRs is Dillon Mulroy. The first summary confidently named someone else.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Research
class: ns
---

# My research agent was wrong twice while I prepared this talk

<div class="ns-wrong">
  <div class="w-row">
    <div class="w-claim"><span>The research said</span><p>The small-stacks interview is with John Fawcett.</p></div>
    <Show :step="2" :at="1" fx="left" class="w-fix"><span>The source says</span><p>It's Dillon Mulroy. Fawcett wrote a different post.</p></Show>
  </div>
  <div class="w-row">
    <div class="w-claim"><span>The research said</span><p>Niall Murphy linked Aidan Harding's "Coding with AI" from 2025.</p></div>
    <Show :step="2" :at="2" fx="left" class="w-fix"><span>The source says</span><p>He linked "Putting learning in the loop" from July 2026.</p></Show>
  </div>
  <Show :step="2" :at="2" class="w-take">Both summaries read well. Both would have ended up on a slide.</Show>
</div>

<!--
(Step 2 of 2)

Niall Murphy's post links Aidan Harding's July 2026 piece, not the older one the chat named.

- I only caught these because I opened every source before citing it. That's the practice: one click back to the source.
-->

---
layout: none
transition: gate | gate-back
---

<DemoSlide title="Trace the path" :minutes="3" prompt="Trace how the task list derives the current team. Show where the query is scoped and where an export could bypass it. Separate facts from assumptions." />

<!--
7:45 to 10:45. Live demo, 3 minutes.

1. Run the research prompt against the demo repo.
2. Open research.md. Pick the claim about team scoping.
3. Jump to routes/export.ts yourself and show the query fallback.
4. Mark it as a fact, and mark "reuse the list query" as an assumption.

If the run stalls, go back two slides. The claim-trace slide covers the same ground.
-->

---
layout: none
---

<SectionGate :current="1" title="Make the plan lose an argument" question="What must stay true when the happy path fails?" />

<!--
10:45. Plan, about 7 minutes including a 3-minute demo.
-->

---
part: Plan
class: ns allow-whitespace
transition: view-transition
---

# The plan is where I do most of the thinking

<PlanArgument :step="0" />

<!--
10:45 to 12:45

- The plan is the cheapest place to change your mind. Nothing is built yet.
- The agent's first plan is reasonable. It also accepts a teamId parameter, because that's how filtering usually works.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Plan
class: ns allow-whitespace
transition: view-transition
---

# The plan is where I do most of the thinking

<PlanArgument :step="1" />

<!--
(Step 1 of 3)

I argue with it. What if teamId belongs to another team?


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Plan
class: ns allow-whitespace
transition: view-transition
---

# The plan is where I do most of the thinking

<PlanArgument :step="2" />

<!--
(Step 2 of 3)

The plan changes. One decision and two concrete examples, including the failure case.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Plan
class: ns
---

# The plan is where I do most of the thinking

<PlanArgument :step="3" />

<!--
(Step 3 of 3)

Exclusions matter as much. And the decision needs evidence, a check that can fail.
- The plan also reuses the serializer and tests header, rows and escaping. Those lines are off the slide to keep it readable.

- Say: "A markdown file is only useful if somebody challenges it."
- Quote from my early-2026 workflow post. https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/
-->

---
part: Plan
class: ns allow-whitespace
transition: view-transition
---

# Say what you expect before the agent answers

<div class="ns-ask">
  <div class="ask-q">
    <p>What must stay true when someone sends a <code>teamId</code> that isn't theirs?</p>
    <span>20 seconds. Say it out loud.</span>
  </div>
  <div class="ask-ev">
    <Show :step="0" :at="1" class="ev">
      <b>Aidan Harding</b>
      <p>Before approving a key decision: what convinced you?</p>
    </Show>
    <Show :step="0" :at="2" class="ev">
      <b>Honeycomb, on team plan reviews</b>
      <p>"Our velocity did not seem to go down."</p>
    </Show>
  </div>
</div>

<!--
12:45 to 14:30

- Ask the room first. Wait the full 20 seconds. Take two answers.
- The point: you form an expectation before the agent gives you its default. Otherwise you anchor on its answer.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Plan
class: ns allow-whitespace
transition: view-transition
---

# Say what you expect before the agent answers

<div class="ns-ask">
  <div class="ask-q">
    <p>What must stay true when someone sends a <code>teamId</code> that isn't theirs?</p>
    <span>20 seconds. Say it out loud.</span>
  </div>
  <div class="ask-ev">
    <Show :step="1" :at="1" class="ev">
      <b>Aidan Harding</b>
      <p>Before approving a key decision: what convinced you?</p>
    </Show>
    <Show :step="1" :at="2" class="ev">
      <b>Honeycomb, on team plan reviews</b>
      <p>"Our velocity did not seem to go down."</p>
    </Show>
  </div>
</div>

<!--
(Step 1 of 2)

Aidan Harding's version: his planning skill makes you say what convinced you before approving a load-bearing decision. https://aquiva.com/blog/putting-learning-in-the-loop


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Plan
class: ns
---

# Say what you expect before the agent answers

<div class="ns-ask">
  <div class="ask-q">
    <p>What must stay true when someone sends a <code>teamId</code> that isn't theirs?</p>
    <span>20 seconds. Say it out loud.</span>
  </div>
  <div class="ask-ev">
    <Show :step="2" :at="1" class="ev">
      <b>Aidan Harding</b>
      <p>Before approving a key decision: what convinced you?</p>
    </Show>
    <Show :step="2" :at="2" class="ev">
      <b>Honeycomb, on team plan reviews</b>
      <p>"Our velocity did not seem to go down."</p>
    </Show>
  </div>
</div>

<!--
(Step 2 of 2)

Honeycomb's Tenant team leaned into review with plan, review, implement and finish skills. Team plan reviews spread understanding and velocity held. They later relaxed the heavy version for simple work. https://www.honeycomb.io/blog/embracing-code-review-bottleneck
- One line on tools, not on the slide: GitHub Next's Chopin and Spec Kit's assess step both move attention upstream. Don't demo them. https://githubnext.com/projects/chopin/
-->

---
layout: none
transition: gate | gate-back
---

<DemoSlide title="Argue with the plan" :minutes="3" prompt="Propose the smallest export change. State the tenant invariant, one negative example, what is out of scope, and how each slice will be verified." />

<!--
14:30 to 17:30. Live demo, 3 minutes.

1. Run the planning prompt with research.md as input.
2. Read the plan aloud. Find where it accepts teamId from the query.
3. Push back in the chat. Watch it add the invariant and the forged-id example.
4. Show the exclusions and the verification section.

Fallback: the plan-argument slide shows the same edit.
-->

---
layout: none
---

<SectionGate :current="2" title="Put something working in front of a person" question="What can someone see and check today?" />

<!--
17:30. Slice, about 5 minutes. No demo.
-->

---
part: Slice
class: ns allow-whitespace
transition: view-transition
---

# Get a thin path working before the database is done

<TracerBullet :step="0" />

<!--
17:30 to 19:15

- The usual split is by layer: data first, then the API, then the UI. Nobody sees anything work until day four. That's when you find out the columns are wrong, or the whole idea is.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Slice
class: ns allow-whitespace
transition: view-transition
---

# Get a thin path working before the database is done

<TracerBullet :step="1" />

<!--
(Step 1 of 2)

Tracer bullets go the other way. A narrow path through every layer on day one. The data can be an in-memory fixture behind the same interface. The path is real, so a person can click it.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Slice
class: ns
---

# Get a thin path working before the database is done

<TracerBullet :step="2" />

<!--
(Step 2 of 2)

Every day after that ends with something a person can check. Stubs are fine. A slice with no visible result isn't.

- This matters more with agents. An agent will happily finish all four layers before you've looked at anything. A running prototype on day one is the cheapest review you'll get.
- The term comes from The Pragmatic Programmer. Matt Pocock's skills use it for how agents should cut work. https://github.com/mattpocock/skills
-->

---
part: Slice
class: ns allow-whitespace
transition: view-transition
---

# The export, one tracer bullet at a time

<TracerSlices :step="0" />

<!--
19:15 to 20:45

- Slice one ships with fixture data. The product owner clicks Export on day one and tells you the columns are wrong before anyone writes a query.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Slice
class: ns allow-whitespace
transition: view-transition
---

# The export, one tracer bullet at a time

<TracerSlices :step="1" />

<!--
(Step 1 of 2)

Each later slice replaces a stub or widens the path, and each ends with a check a person can run. Slice two is where the tenant boundary lives, so it gets its own check. That's the one we'll break in the verify part.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Slice
class: ns
---

# The export, one tracer bullet at a time

<TracerSlices :step="2" />

<!--
(Step 2 of 2)

Matt Pocock's rule, from his to-tickets skill: each slice cuts a narrow but complete path through every layer, is demoable or verifiable on its own, and fits in one fresh agent context. https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md

- A review unit isn't a deployment unit. Keep the export behind a flag until slice two lands.
-->

---
part: Slice
class: ns allow-whitespace
transition: view-transition
---

# Size is not risk

<SizeRisk :step="0" />

<!--
20:45 to 22:15

- Both minimaps use the same scale, one row per line. The rename is huge. The auth change is a speck.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Slice
class: ns allow-whitespace
transition: view-transition
---

# Size is not risk

<SizeRisk :step="1" />

<!--
(Step 1 of 2)

The rename needs a mechanical check. The ten lines need a person and a boundary test, because they change who can delete what.
- The rename is the one exception to tracer bullets. Matt Pocock's skill sequences a wide refactor as expand, migrate in batches, contract, so the build stays green throughout.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Slice
class: ns
transition: gate | gate-back
---

# Size is not risk

<SizeRisk :step="2" />

<!--
(Step 2 of 2)

Line count predicts review time. It doesn't predict blast radius.
- Dillon Mulroy keeps PRs at 300 to 800 lines and reads every generated line. That's his practice, not a safety threshold. https://www.wordman.dev/podcast/dillon-mulroy-i-enjoy-coding-less-than-ever/
-->

---
layout: none
---

<SectionGate :current="3" title="Green is a starting point" question="Which claim did we actually test?" />

<!--
22:15. Verify, about 11 minutes including a 5-minute demo.
-->

---
part: Verify
class: ns allow-whitespace
transition: view-transition
---

# Which claim did the tests check?

<ExportLab :step="0" />

<!--
22:15 to 26:15. The tests on this slide really run, in the browser, against the code shown. Click line 3 to cycle versions and the request to forge a teamId.

- Back to our PR. Seeded defect, labelled. Three tests, all green. The CSV looks right.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Verify
class: ns allow-whitespace
transition: view-transition
---

# Which claim did the tests check?

<ExportLab :step="1" />

<!--
(Step 1 of 4)

Same code, one query parameter. Signed in as Team A, asking for team-b. Team B's canary row is in my export. Still three green tests.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Verify
class: ns allow-whitespace
transition: view-transition
---

# Which claim did the tests check?

<ExportLab :step="2" />

<!--
(Step 2 of 4)

Add the checks from the plan: a forged teamId returns only my rows, and Team A gets exactly two rows. One fails.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Verify
class: ns allow-whitespace
transition: view-transition
---

# Which claim did the tests check?

<ExportLab :step="3" />

<!--
(Step 3 of 4)

Fix it: the team comes from the session only. Everything passes.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Verify
class: ns
---

# Which claim did the tests check?

<ExportLab :step="4" />

<!--
(Step 4 of 4)

Now the part people skip. Delete the filter entirely. Both boundary checks fail. That's the evidence the check can catch the bug. A check that can't fail proves nothing.

- The happy-path tests passed in every version. They were never testing the claim that mattered.
-->

---
part: Verify
class: ns allow-whitespace
transition: view-transition
---

# Code and tests from one wrong assumption agree

<SameAssumption :step="0" />

<!--
26:15 to 28:00

- If the same agent writes the code and the tests from the same assumption, they agree. 24 green tests, nothing independent checked.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Verify
class: ns allow-whitespace
transition: view-transition
---

# Code and tests from one wrong assumption agree

<SameAssumption :step="1" />

<!--
(Step 1 of 2)

The fix is an expectation from somewhere else: the plan's decision. You write down what a forged teamId must return before reading the generated test.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Verify
class: ns
transition: gate | gate-back
---

# Code and tests from one wrong assumption agree

<SameAssumption :step="2" />

<!--
(Step 2 of 2)

Say it plainly. Write the expected result first.

- Addy Osmani: "Tests are necessary. They are not sufficient." https://addyosmani.com/blog/comprehension-debt/
- A second model agreeing is not independent evidence either. The expectation has to come from the decision.
-->

---
layout: none
transition: gate | gate-back
---

<DemoSlide title="Break it, fix it, break it again" :minutes="5" prompt="Review the export against the stated invariant. Give a reproducible request and the expected result for any finding. Do not accept test count as evidence." />

<!--
28:00 to 33:00. Live demo, 5 minutes.

1. Check out the seeded commit. Run the tests: green.
2. Run the review prompt. It should propose the forged teamId request.
3. Reproduce it yourself with curl as Team A. Show the canary row.
4. Add the boundary check. Watch it fail. Apply the fix. Green.
5. Remove the predicate. The check fails. Put it back.

Fallback: the export lab slide runs the same sequence live in the browser.
-->

---
layout: none
---

<SectionGate :current="4" title="Show the loop, including the stop" question="How many reviews before it can merge?" />

<!--
33:00. Review, about 10 and a half minutes including a 3-minute demo.
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# Review in two loops

<ReviewLoops :step="0" />

<!--
33:00 to 34:00

- The inner loop runs on my machine before any PR exists: edit, tests, a browser check, a local reviewer agent. Seconds per turn.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# Review in two loops

<ReviewLoops :step="1" />

<!--
(Step 1 of 2)

The outer loop is the PR: CI, reviewers from other providers, a babysitter working the feedback, and a person who merges. Minutes per turn, and other people's attention.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns
---

# Review in two loops

<ReviewLoops :step="2" />

<!--
(Step 2 of 2)

Most findings should die inside. Every finding that reaches the PR costs someone else's time. Next slide: what the local reviewer looks like.
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# After every slice, send in the adversaries

<LocalAdversaries :step="0" />

<!--
34:00 to 35:30

- This is the local reviewer. When a slice is done, before the next one starts, I ask the agent to review what it just built as an adversary. It runs as a subagent, so it starts with a fresh context and doesn't inherit the builder's assumptions.
- One adversary is a fine start. Here the functional one finds the forged teamId leak.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# After every slice, send in the adversaries

<LocalAdversaries :step="1" />

<!--
(Step 1 of 2)

For riskier slices, run several in parallel, one lens each: functional (does it do what the plan says, including the failure case?), non-functional (errors, limits, performance, logs) and security (who can do something they shouldn't?). Add project-specific ones when you have them, like accessibility or data migration. The security one finds a CSV formula injection: a title starting with = runs as a formula in Excel.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns
---

# After every slice, send in the adversaries

<LocalAdversaries :step="2" />

<!--
(Step 2 of 2)

The main agent fixes the findings, reruns the checks, and only then starts slice three. Findings that need a decision come to me instead.

- The prompt, roughly: "Review the last slice as three adversarial subagents in parallel: functional, non-functional and security. Report only findings with a reproducible request or a failing check. Fix them before starting the next slice."
- Same topology as my PR reviewer (a primary agent, parallel specialist lenses, a synthesis step), just run locally and earlier. https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/ and https://www.huuhka.net/primary-vs-subagents-in-llm-harnesses/
- CSV injection is a real class of bug: OWASP documents it. https://owasp.org/www-community/attacks/CSV_Injection
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# The AI part is surprisingly small

<ReviewerPipeline :step="0" />

<!--
35:30 to 36:30

- That was the local reviewer. On the PR side, I've built a few reviewer bots. The model call is one stage.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# The AI part is surprisingly small

<ReviewerPipeline :step="1" />

<!--
(Step 1 of 2)

Ordinary code owns triggers, commit range, retries, deduplication, timeouts, posting, and the stop. The model owns one judgement, returned as structured output the code can validate.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns
---

# The AI part is surprisingly small

<ReviewerPipeline :step="2" />

<!--
(Step 2 of 2)

The same shape runs a /fix command, and it's the shape a babysitter uses.

- Reviews get wordy. Without severity and format limits, the bot creates toil, especially if branch policy requires every comment to be resolved.
- Source: https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# The PR is where you buy a second opinion

<SecondOpinion :step="0" />

<!--
36:30 to 37:45


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# The PR is where you buy a second opinion

<SecondOpinion :step="1" />

<!--
(Step 1 of 3)

Reviewers from other model families. The model that wrote the code shares its own blind spots. Another family, or a provider's review bot, may catch what it missed. This picture is illustrative. I found no credible public data on overlap between providers, so measure your own.
- The reviewers I use: GitHub Copilot code review, my own reviewer bot, and a different model family run locally.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# The PR is where you buy a second opinion

<SecondOpinion :step="2" />

<!--
(Step 2 of 3)

The babysitter: a local agent run that watches the PR, reads comments and CI, makes one bounded fix, pushes, and waits. I'm building a babysit skill for this. It'll get a demo when it's ready.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns
---

# The PR is where you buy a second opinion

<SecondOpinion :step="3" />

<!--
(Step 3 of 3)

Where it goes wrong: reviewers undoing each other, acting on a CI result from an older commit, commits landing after approval that nobody reviewed, and prompt injection. An agent that acts on PR comments will act on a malicious one.
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# How many reviews before it can merge?

<ReviewBudget :step="0" />

<!--
37:45 to 39:30. The controls work. Change reviewers, rounds or the lens live if there's time.

- One reviewer, one round. It finds some real issues and some noise.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# How many reviews before it can merge?

<ReviewBudget :step="1" />

<!--
(Step 1 of 3)

Three reviewers from different providers. More real issues in round one, and a lot more noise to triage.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# How many reviews before it can merge?

<ReviewBudget :step="2" />

<!--
(Step 2 of 3)

Keep going to five rounds. Real findings drop fast. Noise doesn't. The stop marker is where a round finds less than half a real issue.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns
---

# How many reviews before it can merge?

<ReviewBudget :step="3" />

<!--
(Step 3 of 3)

The same run in money. For a manager, the model runs are the cheap part. People's time is the expensive part. Developers feel it as attention, managers see it as salary.

- The model is illustrative. Assumptions: 6 real issues, each reviewer catches a remaining one with p 0.35 (extra reviewers only partly independent), each fix adds 0.12 new issues, 2.5 noise findings per reviewer per round, 3 minutes to triage a finding, 8 to review a fix, €90 an hour, €0.60 per model run, 300 PRs a month.
- Uber benchmarks its review bots on precision, recall, F1, cost per review, latency and noise. That's the right shape of measurement. https://www.uber.com/gb/en/blog/efficient-software-factory/
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# Write the stop rule before the loop starts

<div class="ns-rules">
  <Show :step="0" :at="1" class="col">
    <h3>A finding earns a fix when</h3>
    <p>It comes with a repro or a failing check.</p>
    <p>It's above the severity bar for this change.</p>
    <p>The change is risky enough for that reviewer.</p>
  </Show>
  <Show :step="0" :at="2" class="col end">
    <h3>The loop ends when</h3>
    <p>A round finds nothing above the bar.</p>
    <p>The budget runs out. A person decides.</p>
    <p>Reviewers disagree. A person decides.</p>
    <p>A new commit lands. Old approvals are stale.</p>
  </Show>
</div>

<!--
39:30 to 40:15


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns allow-whitespace
transition: view-transition
---

# Write the stop rule before the loop starts

<div class="ns-rules">
  <Show :step="1" :at="1" class="col">
    <h3>A finding earns a fix when</h3>
    <p>It comes with a repro or a failing check.</p>
    <p>It's above the severity bar for this change.</p>
    <p>The change is risky enough for that reviewer.</p>
  </Show>
  <Show :step="1" :at="2" class="col end">
    <h3>The loop ends when</h3>
    <p>A round finds nothing above the bar.</p>
    <p>The budget runs out. A person decides.</p>
    <p>Reviewers disagree. A person decides.</p>
    <p>A new commit lands. Old approvals are stale.</p>
  </Show>
</div>

<!--
(Step 1 of 2)

What earns a fix. "Consider handling errors" doesn't. A reproducible request does.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Review
class: ns
---

# Write the stop rule before the loop starts

<div class="ns-rules">
  <Show :step="2" :at="1" class="col">
    <h3>A finding earns a fix when</h3>
    <p>It comes with a repro or a failing check.</p>
    <p>It's above the severity bar for this change.</p>
    <p>The change is risky enough for that reviewer.</p>
  </Show>
  <Show :step="2" :at="2" class="col end">
    <h3>The loop ends when</h3>
    <p>A round finds nothing above the bar.</p>
    <p>The budget runs out. A person decides.</p>
    <p>Reviewers disagree. A person decides.</p>
    <p>A new commit lands. Old approvals are stale.</p>
  </Show>
</div>

<!--
(Step 2 of 2)

What ends the loop. The budget is rounds, minutes or money. The budget and a disagreement end in a person, not another retry. A new commit makes every earlier approval and CI result stale.

- Polylane got their production review from about 7 minutes to 94 seconds with a 30-step budget and a fresh review for each new commit. Budgets aren't just about cost. https://polylane.com/blog/how-we-prevent-slop-from-hitting-prod/
- Allow at most two fixes in the demo.
-->

---
layout: none
transition: gate | gate-back
---

<DemoSlide title="A review loop that stops" :minutes="3" prompt="Review the last slice as three adversarial subagents in parallel: functional, non-functional and security. Report only findings with a reproducible request or a failing check. Fix at most twice, then stop and list what is left." />

<!--
40:15 to 43:15. Live demo, 3 minutes.

1. Run the prompt on the fixed branch with one extra seeded issue, the formula injection.
2. Show the three subagents starting in parallel. Round one: a real finding and some noise. Show which ones earn a fix.
3. Round two: nothing above the bar. It stops and summarises.
4. Push a new commit. Show that the earlier review is now stale.

The babysit skill isn't ready yet. Mention it, don't demo it.
-->

---
layout: none
---

<SectionGate :current="5" title="What could change our minds?" question="When could stronger checks replace some human reading?" />

<!--
43:15. Production and the counterargument, about 5 minutes including the Jev aside.
-->

---
part: Production
class: ns allow-whitespace
transition: view-transition
---

# Some teams already skip reading every line

<AutomationDial :step="0" />

<!--
43:15 to 44:45. Give this a fair hearing.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Production
class: ns allow-whitespace
transition: view-transition
---

# Some teams already skip reading every line

<AutomationDial :step="1" />

<!--
(Step 1 of 3)

People and teams that keep reading. Dillon reads every line. Spotify's merged changes doubled and it kept its PR size thresholds. Honeycomb reviews plans as a team for bigger tickets.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Production
class: ns allow-whitespace
transition: view-transition
---

# Some teams already skip reading every line

<AutomationDial :step="2" />

<!--
(Step 2 of 3)

Teams that automate approval. Uber scores review bots on precision, recall, cost and noise. Intercom auto-approves over 19% of PRs, but only narrow ones, anyone can ask for a human, and the engineer who ships stays accountable. OpenAI's harness team made human review optional, and enforced structure with linters and tests. They also spent a fifth of their week cleaning up slop until they automated that too.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Production
class: ns
---

# Some teams already skip reading every line

<AutomationDial :step="3" />

<!--
(Step 3 of 3)

The common thread: every team that reads less of the code added more automated checks.

- Sources: https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe/ https://openai.com/index/harness-engineering/ https://engineering.atspotify.com/2026/9/ai-changed-how-spotify-builds-what-we-learned-and-fixed-about-quality-at-higher-velocity
- These are company reports, not controlled comparisons.
-->

---
part: Production
class: ns allow-whitespace
transition: view-transition
---

# More change means more chances to break

<VolumeChart :step="0" />

<!--
44:45 to 45:45


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Production
class: ns allow-whitespace
transition: view-transition
---

# More change means more chances to break

<VolumeChart :step="1" />

<!--
(Step 1 of 2)

Honeycomb: peak weekday merges went from about 30 to 74. Incidents went from 18.5 a quarter in 2024 to 32 and then 53 in the first two quarters of 2026. Spotify's merged changes roughly doubled.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Production
class: ns
---

# More change means more chances to break

<VolumeChart :step="2" />

<!--
(Step 2 of 2)

Honeycomb's reading is that incidents track change volume roughly linearly. Spotify found no AI-specific incident signature, but volume grew faster than some verification controls.

- Peak merges are a peak metric. The calendar average is about half.
- https://www.honeycomb.io/blog/30-70-prs-day-how-we-managed-not-wreck-systems
-->

---
part: Production
class: ns allow-whitespace
transition: view-transition
---

# Check the diff against production

<Trajectory :step="0" />

<!--
45:45 to 47:15

- Polylane connects a PR diff to the cloud resources it can affect, then reads their telemetry and a 24-hour forecast.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Production
class: ns allow-whitespace
transition: view-transition
---

# Check the diff against production

<Trajectory :step="1" />

<!--
(Step 1 of 3)

From that it builds failure trajectories. The rows here are our export example, not theirs.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Production
class: ns allow-whitespace
transition: view-transition
---

# Check the diff against production

<Trajectory :step="2" />

<!--
(Step 2 of 3)

Each one is confirmed, plausible or refuted, and every link carries evidence. A confirmed trajectory fails the check.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Production
class: ns
---

# Check the diff against production

<Trajectory :step="3" />

<!--
(Step 3 of 3)

Plausible ones pass. Missing evidence isn't proof of safety, it's a policy choice. Decide who owns a plausible failure before it happens.

- Their numbers, self-reported, no longer on the slide: median review time from about 7 minutes to 94 seconds after a 30-step budget and a fresh run per commit.
- A rollback isn't always safe, for example after a data migration.
-->

---
part: Production
class: ns allow-whitespace
transition: view-transition
---

# Aside: use a decision model for decisions

<JevBars :step="0" />

<!--
47:15 to 47:45. Thirty seconds, keep it moving.

- Not every step in an agent pipeline needs an LLM. Polylane replaced LLM calls with Jev, a typed decision model, for yes/no, choice and score questions.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Production
class: ns
transition: gate | gate-back
---

# Aside: use a decision model for decisions

<JevBars :step="1" />

<!--
(Step 1 of 1)

P90 latency from 4,752 to 508 milliseconds. Cost per thousand calls down 39%.

- Their workload, their numbers. It's for routing and ranking, not for writing code.
- https://polylane.com/blog/we-swapped-our-llms-for-jev/
-->

---
part: Close
class: ns
---

# Same pull request, with evidence

<PrCard mode="evidence" />

<!--
47:45 to 48:45

- Back to the PR from the start. The diff barely changed, one line.
- What changed is what we can show: the fact from research, the decision from the plan, a check that fails without the filter, a review that stopped for a stated reason, and a production signal we'll watch.
- That's what "done" means in this talk.
-->

---
part: Close
class: ns allow-whitespace
transition: view-transition
---

# On Monday, turn one repeated correction into a check

<div class="ns-monday">
  <p class="lead">Pick the review comment you keep writing. Make the repository say it for you.</p>
  <Show :step="0" :at="1" class="term">
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
48:45 to 50:00

- Ask the room: what's the comment you type most often in reviews? That's your first check.


(Build step. The empty space fills on the last step of this sequence.)
-->

---
part: Close
class: ns
---

# On Monday, turn one repeated correction into a check

<div class="ns-monday">
  <p class="lead">Pick the review comment you keep writing. Make the repository say it for you.</p>
  <Show :step="1" :at="1" class="term">
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
(Step 1 of 1)

My example is from this deck's repository. Agents kept making the same layout mistakes, so a pre-commit script renders every slide and fails with a rule name and a fix. The agent reads the fix and corrects itself.
- The lines shown are the script's real format. The two failures are examples.
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
50:00 to 52:00, then questions.

- Leave the closing question on screen during Q&A.
- The sources slide follows as backup.
-->

---
part: Sources
class: ns
---

# Sources

<div class="ns-sources">
  <p><b>Pasi Huuhka</b> Research, plan, implement · How I develop with LLMs, early 2026 · Building your own PR reviewer</p>
  <p><b>GitHub Next</b> Chopin · <b>GitHub</b> Spec Kit July 2026 · <b>Matt Pocock</b> Skills for real engineers</p>
  <p><b>Honeycomb</b> Embracing the code review bottleneck · 30 to 70 PRs a day</p>
  <p><b>Spotify</b> AI changed how Spotify builds · <b>Intercom</b> AI is approving our pull requests</p>
  <p><b>Uber</b> Running a software factory efficiently · <b>OpenAI</b> Harness engineering</p>
  <p><b>Polylane</b> How we prevent slop from hitting prod · We swapped our LLMs for Jev</p>
  <p><b>Aidan Harding</b> Putting learning in the loop · <b>Addy Osmani</b> Comprehension debt</p>
  <p><b>Dillon Mulroy</b> The Weekly Dev's Brew interview · <b>Anthropic</b> AI assistance and coding skills</p>
</div>

<!--
Backup slide. Full links are in the speaker notes of each slide and in the source notebook.
-->
