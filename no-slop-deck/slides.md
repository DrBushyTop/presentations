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
- Source: GitHub Next, Chopin. Their estimate is about 238 words a minute read and roughly 4,500 words a minute generated, which they round to 1 to 15. https://githubnext.com/projects/chopin/
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
- The 40 to 60% context band is my rule of thumb, not a law.

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
6:15 to 7:15

- The research agent wrote three confident claims. They all read well.

[click] Claim one checks out. The list endpoint scopes by the session's team.

[click] Claim three is false on the new path. The export takes the team id from the query string if one is present.

[click] Claim two was never checked. It's an assumption, so label it as one.

- Say: "Research should reduce uncertainty about this change, not produce a nice document."
- Pick one claim the plan depends on and open the file yourself.
-->

---
part: Research
class: ns
clicks: 2
---

# My research agent was wrong twice while I prepared this talk

<div class="ns-wrong">
  <div class="w-row">
    <div class="w-claim"><span>The research said</span><p>The small-stacks interview is with John Fawcett.</p></div>
    <Show :step="$clicks" :at="1" fx="left" class="w-fix"><span>The source says</span><p>It's Dillon Mulroy. Fawcett wrote a different post.</p></Show>
  </div>
  <div class="w-row">
    <div class="w-claim"><span>The research said</span><p>Niall Murphy linked Aidan Harding's "Coding with AI" from 2025.</p></div>
    <Show :step="$clicks" :at="2" fx="left" class="w-fix"><span>The source says</span><p>He linked "Putting learning in the loop" from July 2026.</p></Show>
  </div>
  <Show :step="$clicks" :at="2" class="w-take">Both summaries read well. Both would have ended up on a slide.</Show>
</div>

<!--
7:15 to 7:45

- A real example. I use agents for research too.

[click] The podcast about small stacked PRs is Dillon Mulroy. The first summary confidently named someone else.

[click] Niall Murphy's post links Aidan Harding's July 2026 piece, not the older one the chat named.

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
class: ns
clicks: 3
---

# The plan is where I do most of the thinking

<PlanArgument :step="$clicks" />

<!--
10:45 to 12:45

- The plan is the cheapest place to change your mind. Nothing is built yet.
- The agent's first plan is reasonable. It also accepts a teamId parameter, because that's how filtering usually works.

[click] I argue with it. What if teamId belongs to another team?

[click] The plan changes. One decision and two concrete examples, including the failure case.

[click] Exclusions matter as much. And the decision needs evidence, a check that can fail.

- Say: "A markdown file is only useful if somebody challenges it."
- Quote from my early-2026 workflow post. https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/
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
      <p>His planning skill asks what convinced you before you approve a decision the design depends on.</p>
    </Show>
    <Show :step="$clicks" :at="2" class="ev">
      <b>Honeycomb</b>
      <p>Team plan reviews spread understanding. "Our velocity did not seem to go down." They relaxed it for small tasks.</p>
    </Show>
    <Show :step="$clicks" :at="2" class="ev tools">
      <p>Chopin and Spec Kit are pushing tools the same way: more attention on the plan.</p>
    </Show>
  </div>
</div>

<!--
12:45 to 14:30

- Ask the room first. Wait the full 20 seconds. Take two answers.
- The point: you form an expectation before the agent gives you its default. Otherwise you anchor on its answer.

[click] Aidan Harding's version: his planning skill makes you say what convinced you before approving a load-bearing decision. https://aquiva.com/blog/putting-learning-in-the-loop

[click] Honeycomb's Tenant team leaned into review with plan, review, implement and finish skills. Velocity held. They later relaxed the heavy version for simple work. https://www.honeycomb.io/blog/embracing-code-review-bottleneck
- One line on tools: GitHub Next's Chopin and Spec Kit's assess step both move attention upstream. Don't demo them. https://githubnext.com/projects/chopin/
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

<SectionGate :current="2" title="Keep the change inside your understanding" question="Can each piece be explained, exercised and reviewed?" />

<!--
17:30. Slice, about 5 minutes. No demo.
-->

---
part: Slice
class: ns
clicks: 2
---

# Size is not risk

<SizeRisk :step="$clicks" />

<!--
17:30 to 19:00

- Both minimaps use the same scale, one row per line. The rename is huge. The auth change is a speck.

[click] The rename needs a mechanical check. The ten lines need a person and a boundary test, because they change who can delete what.

[click] Line count predicts review time. It doesn't predict blast radius.
-->

---
part: Slice
class: ns
clicks: 2
---

# One giant PR becomes a stack you can review

<StackSplit :step="$clicks" />

<!--
19:00 to 20:30

- An agent happily produces 1,000 lines in one go.

[click] GitHub's example splits it into four layers: data types, search API, chat grounding, UI. CI runs on every layer.

[click] Read it top-down to understand the goal. Review it bottom-up, because each layer depends on the one below.

- Caveat: splitting after generation makes review smaller. It doesn't undo a bad design decision.
- Source: https://github.blog/engineering/turn-one-giant-ai-generated-pull-request-to-a-reviewable-stack/
-->

---
part: Slice
class: ns
clicks: 1
transition: gate | gate-back
---

# Slice by behaviour, then prove each slice

<div class="ns-slices">
  <div class="sl"><span class="n">1</span><b>My team's export, behind a flag</b><p>Team A downloads its two rows.</p></div>
  <div class="sl"><span class="n">2</span><b>Enforce the boundary</b><p>A forged <code>teamId</code> returns the same two rows.</p></div>
  <div class="sl"><span class="n">3</span><b>UI and an export signal</b><p>The button works in a browser. Exports are counted per team.</p></div>
</div>
<Show :step="$clicks" :at="1" class="ns-quote"><p>"A single human still owns the output."</p><span>Dillon Mulroy, who reads every generated line and keeps PRs at 300 to 800 lines</span></Show>

<!--
20:30 to 22:15

- Don't slice by layer (database, service, UI). Slice by behaviour, so each slice has something you can exercise.
- Each slice has an acceptance condition you can check.
- A review unit isn't a deployment unit. The whole feature still needs an integration check.

[click] Dillon Mulroy on The Weekly Dev's Brew. 300 to 800 lines is his practice, not a safety threshold. https://www.wordman.dev/podcast/dillon-mulroy-i-enjoy-coding-less-than-ever/
- A ten-line authorization change can deserve more attention than a big mechanical edit.
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
class: ns
clicks: 4
---

# Which claim did the tests check?

<ExportLab :step="$clicks" />

<!--
22:15 to 26:15. The tests on this slide really run, in the browser, against the code shown. Click line 3 to cycle versions and the request to forge a teamId.

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
26:15 to 28:00

- If the same agent writes the code and the tests from the same assumption, they agree. 24 green tests, nothing independent checked.

[click] The fix is an expectation from somewhere else: the plan's decision. You write down what a forged teamId must return before reading the generated test.

[click] Say it plainly. Write the expected result first.

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
33:00. Review, about 10 minutes including a 3-minute demo.
-->

---
part: Review
class: ns
clicks: 2
---

# Review in two loops

<ReviewLoops :step="$clicks" />

<!--
33:00 to 34:15

- The inner loop runs on my machine before any PR exists: edit, tests, a browser check, a local reviewer agent. Seconds per turn.

[click] The outer loop is the PR: CI, reviewers from other providers, a babysitter working the feedback, and a person who merges. Minutes per turn, and other people's attention.

[click] Most findings should die inside. Every finding that reaches the PR costs someone else's time.
-->

---
part: Review
class: ns
clicks: 2
---

# The AI part is surprisingly small

<ReviewerPipeline :step="$clicks" />

<!--
34:15 to 35:15

- I've built a few PR reviewers. The model call is one stage.

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
35:15 to 36:45

[click] Reviewers from other model families. The model that wrote the code shares its own blind spots. Another family, or a provider's review bot, may catch what it missed. This picture is illustrative. I found no credible public data on overlap between providers, so measure your own.
- The reviewers I use: GitHub Copilot code review, my own reviewer bot, and a different model family run locally.

[click] The babysitter: a local agent run that watches the PR, reads comments and CI, makes one bounded fix, pushes, and waits. I'm building a babysit skill for this. It'll get a demo when it's ready.

[click] Where it goes wrong: reviewers undoing each other, acting on a CI result from an older commit, commits landing after approval that nobody reviewed, and prompt injection. An agent that acts on PR comments will act on a malicious one.
-->

---
part: Review
class: ns
clicks: 3
---

# How many reviews before it can merge?

<ReviewBudget :step="$clicks" />

<!--
36:45 to 38:45. The controls work. Change reviewers, rounds or the lens live if there's time.

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
    <p>It names a mechanism, a reproducible request or a failing check.</p>
    <p>It is above the severity bar you set for this change.</p>
    <p>The change's risk warrants that reviewer at all.</p>
  </Show>
  <Show :step="$clicks" :at="2" class="col end">
    <h3>The loop ends when</h3>
    <p>A round finds nothing above the bar.</p>
    <p>The budget of rounds, minutes or money runs out. A person decides.</p>
    <p>Reviewers disagree. A person decides.</p>
    <p>A new commit lands. Every earlier approval and CI result is stale.</p>
  </Show>
</div>

<!--
38:45 to 39:45

[click] What earns a fix. "Consider handling errors" doesn't. A reproducible request does.

[click] What ends the loop. Note that the budget and a disagreement end in a person, not another retry. And a new commit invalidates old evidence.

- Polylane got their production review from about 7 minutes to 94 seconds with a 30-step budget and a fresh review for each new commit. Budgets aren't just about cost. https://polylane.com/blog/how-we-prevent-slop-from-hitting-prod/
- Allow at most two fixes in the demo.
-->

---
layout: none
transition: gate | gate-back
---

<DemoSlide title="A review loop that stops" :minutes="3" prompt="Review this diff against plan.md. Report only findings with a reproducible request or a failing check. Fix at most twice, then stop and list what is left." />

<!--
39:45 to 42:45. Live demo, 3 minutes.

1. Run the local review loop on the fixed branch with one extra seeded issue.
2. Round one: it reports a real finding and some noise. Show which ones earn a fix.
3. Round two: nothing above the bar. It stops and summarises.
4. Push a new commit. Show that the earlier review is now stale.

The babysit skill isn't ready yet. Mention it, don't demo it.
-->

---
layout: none
---

<SectionGate :current="5" title="What could change our minds?" question="When could stronger checks replace some human reading?" />

<!--
42:45. Production and the counterargument, about 5 minutes including the Jev aside.
-->

---
part: Production
class: ns
clicks: 3
---

# Some teams already read less by hand

<AutomationDial :step="$clicks" />

<!--
42:45 to 44:15. Give this a fair hearing.

[click] People and teams that keep reading. Dillon reads every line. Spotify's merged changes doubled and it kept its PR size thresholds. Honeycomb reviews plans as a team for bigger tickets.

[click] Teams that automate approval. Uber scores review bots on precision, recall, cost and noise. Intercom auto-approves over 19% of PRs, but only narrow ones, anyone can ask for a human, and the engineer who ships stays accountable. OpenAI's harness team made human review optional, and enforced structure with linters and tests. They also spent a fifth of their week cleaning up slop until they automated that too.

[click] The common thread: less reading by hand always came with more checking by machine.

- Sources: https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe/ https://openai.com/index/harness-engineering/ https://engineering.atspotify.com/2026/9/ai-changed-how-spotify-builds-what-we-learned-and-fixed-about-quality-at-higher-velocity
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
44:15 to 45:15

[click] Honeycomb: peak weekday merges went from about 30 to 74. Incidents went from 18.5 a quarter in 2024 to 32 and then 53 in the first two quarters of 2026. Spotify's merged changes roughly doubled.

[click] Honeycomb's reading is that incidents track change volume roughly linearly. Spotify found no AI-specific incident signature, but volume grew faster than some verification controls.

- Peak merges are a peak metric. The calendar average is about half.
- https://www.honeycomb.io/blog/30-70-prs-day-how-we-managed-not-wreck-systems
-->

---
part: Production
class: ns
clicks: 3
---

# Check the diff against production, not just the tests

<Trajectory :step="$clicks" />

<!--
45:15 to 46:45

- Polylane connects a PR diff to the cloud resources it can affect, then reads their telemetry and a 24-hour forecast.

[click] From that it builds failure trajectories. The rows here are our export example, not theirs.

[click] Each one is confirmed, plausible or refuted, and every link carries evidence. A confirmed trajectory fails the check.

[click] Plausible ones pass. Missing evidence isn't proof of safety, it's a policy choice. Decide who owns a plausible failure before it happens.

- Their numbers, self-reported: median review time from about 7 minutes to 94 seconds after a 30-step budget and a fresh run per commit.
- A rollback isn't always safe, for example after a data migration.
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
46:45 to 47:15. Thirty seconds, keep it moving.

- Not every step in an agent pipeline needs an LLM. Polylane replaced LLM calls with Jev, a typed decision model, for yes/no, choice and score questions.

[click] P90 latency from 4,752 to 508 milliseconds. Cost per thousand calls down 39%.

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
47:15 to 48:15

- Back to the PR from the start. The diff barely changed, one line.
- What changed is what we can show: the fact from research, the decision from the plan, a check that fails without the filter, a review that stopped for a stated reason, and a production signal we'll watch.
- That's what "done" means in this talk.
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
    <p>Agents kept leaving the bottom third of my slides empty. Now a script fails the commit and tells the agent how to fix it.</p>
  </Show>
</div>

<!--
48:15 to 49:45

- Ask the room: what's the comment you type most often in reviews? That's your first check.

[click] My example is from this deck's repository. Agents kept making the same layout mistakes, so a pre-commit script renders every slide and fails with a rule name and a fix. The agent reads the fix and corrects itself.
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
49:45 to 52:00, then questions.

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
  <p><b>GitHub Next</b> Chopin · <b>GitHub</b> Spec Kit July 2026 · Turning a giant AI PR into a stack</p>
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
