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

[click] Hands up if you'd merge it. Most hands go up. That's fine, it looks fine.

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
clicks: 2
transition: gate | gate-back
---

# Six gates between a request and production

<GateMap :step="$clicks" />

<!--
4:00 to 5:00

- This is the map for the rest of the hour. Each gate asks one question.

[click] Three before any code exists: research, plan, slice. These are the cheapest places to catch a mistake.

[click] Three after the diff: verify, review, production.

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
class: ns
clicks: 2
---

# Research, plan, implement. Scale it to the task.

<RpiScale :step="$clicks" />

<!--
5:00 to 6:15

[click] Three phases, each starting with a fresh context and handing a markdown file to the next. Research maps how things work today. Plan decides what changes and how we'll verify it. Implement follows the plan.
- The 40 to 60% context band is a ceiling, not a target, and it's my rule of thumb, not a law.
- The phase prompts started from HumanLayer's research, plan, implement prompts.

[click] Most of my work isn't the full sequence. Small change: talk to the agent directly. Medium: plan, then implement. Large, messy or risky: all three.

- Source: my posts. https://www.huuhka.net/research-plan-implement/ and https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/
-->

---
part: Research
class: ns
clicks: 3
---

# Follow one claim back to the code

<ClaimTrace :step="$clicks" />

<!--
6:15 to 7:45

- The research agent wrote three confident claims. They all read well.

[click] Claim one checks out. The list endpoint scopes by the session's team.

[click] Claim three is false on the new path. The export takes the team id from the query string if one is present.

[click] Claim two was never checked. It's an assumption, so label it as one.

- Say: "Research should reduce uncertainty about this change, not produce a nice document."
- Pick one claim the plan depends on and open the file yourself.
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

<SectionGate :current="1" title="Grill the plan, keep the answers" question="Which decision has nobody made yet?" />

<!--
10:45. Plan, about 8 and a half minutes including a 3-minute demo.
-->

---
part: Plan
class: ns
clicks: 3
---

# Let the agent grill you on the plan

<PlanArgument :step="$clicks" />

<!--
10:45 to 12:45

- The plan is the cheapest place to change your mind. Nothing is built yet.
- The agent's first plan is usually a good baseline. This one is too. It also accepts a teamId parameter, because that's how filtering usually works. Nobody decided that. It just appeared.

[click] So I don't rewrite the plan. I ask the agent to grill me: one question at a time, until every open decision has an answer. Here it asks where the team comes from on export. I push back the other way too: what if teamId belongs to another team?

[click] The plan barely changes. One line goes. One decision and two concrete examples come in, including the failure case.

[click] The answer doesn't stay in the chat. It's written to a decision file the next agent will find, with the evidence it needs: a check that can fail. That's the file on the Monday slide.
- The plan also reuses the serializer and tests header, rows and escaping. Those lines are off the slide to keep it readable.

- Say: "The plan is usually fine. The grilling finds the one decision nobody made."
- Matt Pocock's grill-me skill: the agent interviews you "relentlessly about a plan or design until every branch of the design tree is resolved". grill-with-docs does the same and updates GLOSSARY.md and ADRs as it goes. He calls these his most popular skills and uses them for every change. https://github.com/mattpocock/skills
- Quote from my early-2026 workflow post. https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/
- GitHub Next's Chopin names this failure: an "agent silently decided something without a human realising it". Accepting teamId is exactly that kind of decision. https://githubnext.com/projects/chopin/
-->

---
part: Plan
class: ns
clicks: 2
---

# Say what you expect before the agent answers

<div class="ns-ask">
  <div class="ask-q">
    <p>What must stay true when someone sends a <code>teamId</code> that isn't theirs?</p>
    <span>20 seconds. Say it out loud.</span>
  </div>
  <div class="ask-ev">
    <Show :step="$clicks" :at="1" class="ev">
      <b>Aidan Harding</b>
      <p>"Ask before you tell."</p>
    </Show>
    <Show :step="$clicks" :at="2" class="ev">
      <b>Honeycomb, on team plan reviews</b>
      <p>"Our velocity did not seem to go down."</p>
    </Show>
  </div>
</div>

<!--
12:45 to 14:30

- Ask the room first. Wait the full 20 seconds. Take two answers.
- The point: you form an expectation before the agent gives you its default. Otherwise you anchor on its answer.

[click] Aidan Harding's learning skill tells the agent: "Ask before you tell." It asks for your view before giving its own. It also asks you to name what convinced you before you approve a load-bearing decision. https://aquiva.com/blog/putting-learning-in-the-loop

[click] Honeycomb's Tenant team leaned into review with plan, review, implement and finish skills. Team plan reviews spread understanding and velocity held. They later relaxed the heavy version for simple work. https://www.honeycomb.io/blog/embracing-code-review-bottleneck
- One line on tools, not on the slide: GitHub Next's Chopin and Spec Kit's assess extension (go, clarify or kill, before any spec exists) both move attention upstream. Don't demo them. https://githubnext.com/projects/chopin/
-->

---
part: Plan
class: ns
clicks: 3
---

# Could someone else explain it and debug it?

<TeamUnderstanding :step="$clicks" />

<!--
14:30 to 16:00

- Asking what you expect keeps you from anchoring. This is the team version of the same problem.
- Honeycomb's Tenant team first split into producers and reviewers: reviewers didn't produce, producers picked up more tasks. Their words: "knowledge concentration got amplified. We were each rapidly over-specializing in some portions of our stack."

[click] Their fix was to review the plan and the prompt given to the agent, as a team. "It started feeling like everyone was more aware of what was happening." Plans could be borrowed later for caveats. They don't do the strict version for everything now. https://www.honeycomb.io/blog/embracing-code-review-bottleneck

[click] Anthropic's randomised study: 52 mostly junior engineers learned the Trio library. The AI group averaged 50% on the quiz, the hand-coding group 67%. The largest gap was on debugging questions, which is the skill you need when this export breaks at 3am. People who asked conceptual questions scored 65% or more, people who delegated under 40%. They say that pattern is associated, not causal, and the sample was small. https://www.anthropic.com/research/AI-assistance-coding-skills

[click] Two questions before approving a plan. First: what user problem justifies this code? Spec Kit's assess extension ends in go, clarify or kill before any spec is written, and kill is a valid answer. https://github.com/github/spec-kit/blob/main/newsletters/2026-July.md
- Second: could someone other than the author explain this decision and investigate a failure? If not, the plan isn't done.
-->

---
layout: none
transition: gate | gate-back
---

<DemoSlide title="Grill the plan" :minutes="3" prompt="Propose the smallest export change. Then grill me: one question at a time, until every open decision is resolved. Write each decision to docs/decisions with a check that can fail." />

<!--
16:00 to 19:00. Live demo, 3 minutes.

1. Run the planning prompt with research.md as input.
2. Skim the plan. Most of it is fine. Point at the line that accepts teamId from the query.
3. Answer the agent's questions out loud. When it gets to the team, push back with the forged-id case.
4. Show the one-line change in the plan and the new decision file with its check.

Fallback: the grilling slide shows the same change.
-->

---
layout: none
---

<SectionGate :current="2" title="Put something working in front of a person" question="What can someone see and check today?" />

<!--
19:00. Slice, about 5 minutes. No demo.
-->

---
part: Slice
class: ns
clicks: 2
---

# Get a thin path working before the database is done

<TracerBullet :step="$clicks" />

<!--
19:00 to 20:45

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
20:45 to 22:15

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
22:15 to 23:45

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
23:45. Verify, about 11 minutes including a 5-minute demo.
-->

---
part: Verify
class: ns
clicks: 4
---

# Which claim did the tests check?

<ExportLab :step="$clicks" />

<!--
23:45 to 27:45. The tests on this slide really run, in the browser, against the code shown. Click line 3 to cycle versions and the request to forge a teamId.

- Back to our PR. Seeded defect, labelled. Three tests, all green. The CSV looks right.

[click] Same code, one query parameter. Signed in as Team A, asking for team-b. Team B's canary row is in my export. Still three green tests.

[click] Add the checks from the plan: a forged teamId returns only my rows, and Team A gets exactly two rows. One fails.

[click] Fix it: the team comes from the session only. Everything passes.

[click] Now the part people skip. Delete the filter entirely. Both boundary checks fail. That's the evidence the check can catch the bug. A check that can't fail proves nothing.

- The happy-path tests passed in every version. They were never testing the claim that mattered.
-->

---
part: Verify
class: ns
clicks: 2
transition: gate | gate-back
---

# Code and tests from one wrong assumption agree

<SameAssumption :step="$clicks" />

<!--
27:45 to 29:30

- If the same agent writes the code and the tests from the same assumption, they agree. 24 green tests, nothing independent checked.

[click] The fix is an expectation from somewhere else: the plan's decision. You write down what a forged teamId must return before reading the generated test.

[click] Say it plainly. Write the expected result first.

- Addy Osmani: "Tests are necessary. They are not sufficient." https://addyosmani.com/blog/comprehension-debt/
- A second model agreeing is not independent evidence either. The expectation has to come from the decision.
- Matt Pocock's tdd skill calls this the tautological test: "Expected values must come from an independent source of truth." https://github.com/mattpocock/skills
- Aidan Harding's joint review keeps the two sides apart: he and the agent record findings separately and share nothing until both are done, so "your framing and ideas can distract the agent" doesn't happen. https://aquiva.com/blog/putting-learning-in-the-loop
-->

---
layout: none
transition: gate | gate-back
---

<DemoSlide title="Break it, fix it, break it again" :minutes="5" prompt="Review the export against the stated invariant. Give a reproducible request and the expected result for any finding. Do not accept test count as evidence." />

<!--
29:30 to 34:30. Live demo, 5 minutes.

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
34:30. Review, about 12 minutes including a 3-minute demo.
-->

---
part: Review
class: ns
clicks: 2
---

# Review in two loops

<ReviewLoops :step="$clicks" />

<!--
34:30 to 35:30

- The inner loop runs on my machine before any PR exists: edit, tests, a browser check, a local reviewer agent. Seconds per turn.

[click] The outer loop is the PR: CI, reviewers from other providers, a babysitter working the feedback, and a person who merges. Minutes per turn, and other people's attention.

[click] Most findings should die inside. Every finding that reaches the PR costs someone else's time. Next slide: what the local reviewer looks like.
-->

---
part: Review
class: ns
clicks: 2
---

# After every slice, send in the adversaries

<LocalAdversaries :step="$clicks" />

<!--
35:30 to 37:00

- This is the local reviewer. When a slice is done, before the next one starts, I ask the agent to review what it just built as an adversary. It runs as a subagent, so it starts with a fresh context. It still gets the plan file, or the functional lens has nothing to check against.
- A fresh context isn't independence. The main agent writes the reviewer's prompt, and its framing can leak in. Keep the prompt to the plan and the diff, not the builder's explanation. For the slices that matter, form your own findings before reading the agent's, as Aidan Harding does.
- One adversary is a fine start. Here the functional one finds the forged teamId leak.

[click] For riskier slices, run several in parallel, one lens each: functional (does it do what the plan says, including the failure case?), non-functional (errors, limits, performance, logs) and security (who can do something they shouldn't?). Add project-specific ones when you have them, like accessibility or data migration. The security one finds a CSV formula injection: a title starting with = runs as a formula in Excel.

[click] The main agent fixes the findings, reruns the checks, and only then starts slice three. Findings that need a decision come to me instead.

- The prompt, roughly: "Review the last slice against plan.md as three adversarial subagents in parallel: functional, non-functional and security. Report only findings with a reproducible request or a failing check. Fix them before starting the next slice."
- Same topology as my PR reviewer (a primary agent, parallel specialist lenses, a synthesis step), just run locally and earlier. https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/
- If asked about role agents: I don't make a standing "security agent" by default, and Dillon Mulroy calls role subagents trash. These are short-lived reviews with one question each, and they return findings with a file and line. https://www.huuhka.net/primary-vs-subagents-in-llm-harnesses/
- CSV injection is a real class of bug: OWASP documents it. https://owasp.org/www-community/attacks/CSV_Injection
-->

---
part: Review
class: ns
clicks: 2
---

# The AI part is surprisingly small

<ReviewerPipeline :step="$clicks" />

<!--
37:00 to 38:00

- That was the local reviewer. On the PR side, I've built a few reviewer bots. The model call is one stage.

[click] Ordinary code owns triggers, commit range, retries, deduplication, timeouts, posting, and the stop. The model owns one judgement, returned as structured output the code can validate.

[click] The same shape runs a /fix command, and it's the shape a babysitter uses.

- Reviews get wordy. Without severity and format limits, the bot creates toil, especially if branch policy requires every comment to be resolved.
- Source: https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/
-->

---
part: Review
class: ns
clicks: 3
---

# The PR is where you buy a second opinion

<SecondOpinion :step="$clicks" />

<!--
38:00 to 39:15

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

# Test your reviewers on bugs you already found

<ReviewerBench :step="$clicks" />

<!--
39:15 to 40:45

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
---

# How many reviews before it can merge?

<ReviewBudget :step="$clicks" />

<!--
40:45 to 42:30. The controls work. Change reviewers, rounds or the lens live if there's time.

- One reviewer, one round. It finds some real issues and some noise.

[click] Three reviewers from different providers. More real issues in round one, and a lot more noise to triage.

[click] Keep going to five rounds. Real findings drop fast. Noise doesn't. The stop marker is where a round finds less than half a real issue.

[click] The same run in money. For a manager, the model runs are the cheap part. People's time is the expensive part. Developers feel it as attention, managers see it as salary.

- The model is illustrative. Assumptions: 6 real issues, each reviewer catches a remaining one with p 0.35 (extra reviewers only partly independent), each fix adds 0.12 new issues, 2.5 noise findings per reviewer per round, 3 minutes to triage a finding, 8 to review a fix, €90 an hour, €0.60 per model run, 300 PRs a month.
- Uber benchmarks its review bots on precision, recall, F1, cost per review, latency and noise. That's the right shape of measurement. https://www.uber.com/gb/en/blog/efficient-software-factory/
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
42:30 to 43:15

[click] What earns a fix. "Consider handling errors" doesn't. A reproducible request does.

[click] What ends the loop. The budget is rounds, minutes or money. The budget and a disagreement end in a person, not another retry. A new commit makes every earlier approval and CI result stale.

- Polylane's first prototype took nearly 7 minutes at the median. After a 30-step budget, a fresh review for each new commit and other changes, their review turn's median is 94 seconds. Budgets aren't just about cost. https://polylane.com/blog/how-we-prevent-slop-from-hitting-prod/
- Allow at most two fixes in the demo.
-->

---
layout: none
transition: gate | gate-back
---

<DemoSlide title="A review loop that stops" :minutes="3" prompt="Review the last slice against plan.md as three adversarial subagents in parallel: functional, non-functional and security. Report only findings with a reproducible request or a failing check. Fix at most twice, then stop and list what is left." />

<!--
43:15 to 46:15. Live demo, 3 minutes.

1. Run the prompt on the fixed branch with one extra seeded issue, the formula injection.
2. Show the three subagents starting in parallel. Round one: a real finding and some noise. Show which ones earn a fix.
3. Round two: nothing above the bar. It stops and summarises.
4. Push a new commit. Show that the earlier review is now stale.

The babysit skill isn't ready yet. Mention it, don't demo it.
-->

---
layout: none
---

<SectionGate :current="5" title="What happens after merge?" question="Who watches the rollout, what stops it, and how do we recover?" />

<!--
46:15. Production. As built this part runs about 14 and a half minutes: the counterargument, containing a bad change, the Polylane case study (7 slides) and the Jev aside. Cut it back to about 5 minutes in rehearsal. The notes from here on give durations, not clock times.
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

# Every check we have looks at the diff

<FactoryGap :step="$clicks" />

<!--
About 1 minute. Start of the Polylane case study. Containment handles what gets through. This part tries to catch more before merge.

- The software factory: an agent writes the code, types and tests run, a linter, a code review. All of it reads the diff.

[click] None of it knows anything about the production system the diff lands on: the traffic, the locks, the queues.

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
- What changed is what we can show: the fact from research, the decision from the plan, a check that fails without the filter, a review that stopped for a stated reason, and a flagged rollout I'll watch with a signal that stops it.
- That's what "done" means in this talk.
-->

---
part: Close
class: ns
clicks: 2
---

# On Monday, turn one repeated correction into a check

<div class="ns-monday">
  <p class="lead">Pick the review comment you keep writing. Make the repository say it for you.</p>
  <div class="cols">
    <Show :step="$clicks" :at="1" class="term">
      <div class="bar"><span class="ns-mono">npm run check:slides</span><em>this deck</em></div>
      <div class="out ns-mono">
        <div class="bad">✗ slide 12 [empty-bottom] 47% empty</div>
        <div class="bad">✗ slide 19 [tiny-text] 12px</div>
        <div class="dim">Make the main exhibit taller.</div>
        <div class="dim">Do not add text to fill space.</div>
      </div>
      <p>The commit fails and says how to fix it.</p>
    </Show>
    <Show :step="$clicks" :at="2" class="term map">
      <div class="bar"><span class="ns-mono">AGENTS.md</span><em>about 100 lines, a map</em></div>
      <div class="out ns-mono">
        <div>→ docs/architecture.md</div>
        <div>→ docs/decisions/0007-export-scope.md</div>
        <div>→ plans/export-csv.md</div>
        <div class="dim">doc-gardening agent: 1 stale doc, PR opened</div>
      </div>
      <p>Write the decision where the next agent looks.</p>
    </Show>
  </div>
</div>

<!--
About 1.5 minutes.

- Ask the room: what's the comment you type most often in reviews? That's your first check.

[click] My example is from this deck's repository. Agents kept making the same layout mistakes, so a pre-commit script renders every slide and fails with a rule name and a fix. The agent reads the fix and corrects itself.
- The lines are shortened from the script's real output. The two failures are examples.
- OpenAI's harness team does the same with custom lints: "we write the error messages to inject remediation instructions into agent context." https://openai.com/index/harness-engineering/

[click] The other half: decisions the next agent can find. OpenAI keeps AGENTS.md at "roughly 100 lines", a map "with pointers to deeper sources of truth", and treats docs/ as the system of record. A recurring "doc-gardening" agent "scans for stale or obsolete documentation" and opens fix-up PRs. The export's tenant decision belongs in a file like 0007-export-scope.md, not only in a chat.
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
