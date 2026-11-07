---
theme: zure
addons:
  - slidev-addon-rehearsal
  - slidev-addon-t3-annotate
  - slidev-addon-live
  - slidev-addon-clicker
title: Hill climbing a UI
duration: 40min
rehearsal:
  targetMinutes: 40
titleTemplate: '%s · Pasi Huuhka'
author: Pasi Huuhka
info: |
  Is UI hill climbing worth using? 48 hours, 23 rounds and 190 PRs on Zpotlight. Internal, 30 to 45 minutes.
class: text-left
highlighter: shiki
lineNumbers: false
transition: fade
aspectRatio: 16/9
canvasWidth: 1280
colorSchema: light
download: true
exportFilename: hill-climb
fonts:
  provider: google
  sans: Inter
  mono: JetBrains Mono
  weights: '200,400,600,700,800'
layout: none
---

<Cover />

<!--
Let the line draw itself before speaking. That line is the real run: the mean of two model reviewers, round by round. The red line is the goal. It never gets there. That's the talk.
-->

---
layout: none
nofooter: true
clicks: 1
---

<TheQuestion :step="$clicks" />

<!--
- This is internal, and the question is plain: should we use this technique?
- [click] Two days, 4 to 6 November. 23 rounds, 190 PRs created in the window. 246 agent threads: 225 on m1 and 21 lanes on m4.
- My answer comes at the end, and it's a qualified yes.
-->

---
layout: none
nofooter: true
---

<PartGate :current="0" />

<!-- Why I tried this at all. -->

---
class: hc
part: Why
clicks: 3
---

# Where it came from

<Inspiration :step="$clicks" />

<!--
- Karpathy's autoresearch: agents run experiments and keep what works.
- [click] Poteto gave the plain definition: "some kind of rubric or a way to judge or score something", then "have an agent continually try to make improvements".
- [click] Theo's video landed on 3 November.
- [click] I started the next morning. No plan was harmed in the making of this.
-->

---
class: hc
part: Why
clicks: 2
---

# Hill climbing

<HillConcept :step="$clicks" />

<!--
- The agent can only see what's near it. It tries a step, measures, keeps it if the score goes up.
- [click] Watch it climb. It backs out of steps that go down.
- It stops when no step nearby is higher. It doesn't know that's the top of anything.
- [click] Lift the fog. A taller peak was there all along. This is the classic failure, and it's coming back at the end.
-->

---
class: hc
part: Why
clicks: 1
---

# Two kinds of hill

<TwoHills :step="$clicks" />

<!--
- With tests, evals or latency, a program gives the score. Theo's MCP eval went from 66 of 85 to 63 of 85. Nobody argues with that, and it tells you to cut context.
- [click] UI has no such program. A model gives the score, and it moves. In Theo's run a rival's score rose from 8.3 to 9.1 on screenshots nobody changed. His line: give the same screenshot to the same model three times and you get three different scores.
- So the instrument is noisy, and that shapes everything after this.
-->

---
class: hc
part: Why
clicks: 4
---

# Theo's run

<TheoRun :step="$clicks" />

<!--
- Video: "Agents Sucked At UI (Until Today)", 31:44. A council of Opus, Sol and Muse, plus Gemini as a jester whose score is ignored.
- [click] The goal of 9 took three rounds, about 1 to 1.5 hours.
- [click] This is the best part. Put Claude Code and Codex in the same frame, and the same UI scores 7 to 7.4. Scores depend on the comparison.
- [click] 9.5 took about ten more runs.
- [click] Then 10. About 18 hours, five models, $250 to $400, 17.6 hours of agent time.
- He suggested hiding the target from sub-agents. I took that into my prompt.
-->

---
class: hc
part: Why
---

# Zpotlight

<WhatIsZpotlight />

<!--
- Some of you saw this in the no-slop deck.
- Our user research tool. A researcher sets tasks, a participant tries a prototype, the session records screen, voice and transcript, and findings go to the team and to agents through MCP.
- It was a fair target: real, in daily use, with a fixed look from Zure Portal UI, so nobody could win by restyling.
-->

---
layout: none
nofooter: true
---

<PartGate :current="1" />

<!-- How it was set up. -->

---
layout: default
class: hc
part: Setup
clicks: 4
---

# The prompt

<ThePrompt :step="$clicks" />

<!--
- Verbatim, shortened by one sentence or two. 4 November, 09:01.
- [click] Put it through a council.
- [click] The stopping rule. 9.5, all members. This one sentence cost a lot of money.
- [click] Theo's tip. The members don't know the number.
- [click] And score higher than the rivals, consistently, in all rankings.
- Each PR also had to show what changed, with pins on screenshots. Remember that, because it feeds the hit markers.
-->

---
class: hc
part: Setup
clicks: 3
---

# The pre-study

<PreStudy :step="$clicks" />

<!--
- Before any code, one thread built the benchmark. About 50 images reviewed.
- [click] 31 kept in the reference set.
- [click] 16 shortlisted across 6 products, each mapped to the part of Zpotlight it should beat: Frame.io for capture (C to pause, I/O range), Sentry for reading a session (one timeline, synced events), Linear for findings (1/2/3/H keys), Maze for task results, Dovetail and Condens for evidence and search. Fullstory, PostHog and Jam didn't make it.
- [click] It came with warnings. Linear and Dovetail images are staged marketing, so score the pattern and not the polish. Stills can't show interaction. And nobody used the rivals hands-on.
- The images themselves stay out of this deck. The repo is public.
-->

---
class: hc
part: Setup
clicks: 1
---

# One score sheet

<ScoreSheet :step="$clicks" />

<!--
- Nine rows scored here, one per job in the product. A tenth, phone, was de-emphasised later. Five criteria: clarity, density, speed, feedback, craft.
- This is Opus in round 1, filling in. Overall 6.4. The rows used most scored lowest.
- [click] Then the rival column. Every row has a named rival to beat.
- Opus said: "Competent, honest and clean, but slow at the things a researcher does for hours."
-->

---
class: hc
part: Setup
clicks: 1
---

# The council

<Council :step="$clicks" />

<!--
- Two members: Opus 5.5 and GPT-6.1 Sol, both at xhigh, read-only. The brief makes each a principal product designer: "Be strict, specific and honest; flattery wastes everyone's time."
- Each gets the same four inputs. Seven walkthroughs run on the live app, so they judge behaviour, not just pictures.
- [click] Two separate reports per round.
-->

---
class: hc
part: Setup
clicks: 3
---

# One round

<Orchestrator :step="$clicks" />

<!--
- The dot is one round. Council, merge into a brief, lanes build, land, checks.
- [click] The orchestrator is one long thread. 512 runs, about 5,000 items. It never touches UI code.
- [click] A lane is one agent in one worktree. One PR, one commit per item. Lanes don't spawn subagents.
- [click] My job was the rules. I changed those, and it's the next section.
-->

---
class: hc
part: Setup
clicks: 4
---

# What a member returned

<CouncilReport :step="$clicks" />

<!--
A real report: Opus, round 1.
- Scores. Row A, 5.5, against Frame.io at 8.8.
- [click] Overall and one blunt sentence.
- [click] Why the rival wins, in concrete steps.
- [click] Up to 15 ranked changes, with file names and size. This list is what builds the next round.
- [click] Broken things it hit on the walkthrough, with steps to repeat. This one: a search hit claims 9:14 AM, while the line sits at 0:40. A real bug, found by a design reviewer.
-->

---
class: hc
part: Setup
clicks: 1
---

# Every round's first ask

<ReportRuns :step="$clicks" />

<!--
- Each square is the top item from Opus, by row. It plays through all 22.
- Early asks are structural. Late asks get small and specific. That's a useful signal in itself.
- [click] Sol alongside Opus. Sol was often more literal: "the pin was around x420 while the writing field..." A member measuring pixels is a good sign. Sol's top item couldn't be parsed for seven rounds, so the rail is Opus only.
-->

---
layout: none
nofooter: true
---

<PartGate :current="2" />

<!-- What I changed along the way. -->

---
class: hc
part: Climb
clicks: 3
---

# The rules changed

<RuleTrack :step="$clicks" />

<!--
Each flag is on the real score line.
- Grey: the start. "If you want, you can parallelize." Around round 8 I demoted phone.
- [click] Teal, speed. After round 13: maximum four lanes on m1 and m4, one merged brief. From round 15 lanes land themselves. After 17 the council stops waiting for checks.
- [click] Ink, quality. Rival scores frozen after round 13. Round 16: "We can do big fixes too."
- [click] Red. Round 19, blind. Round 23, stop.
- Nothing here was planned. Each rule came from reading a thread and getting annoyed.
-->

---
class: hc
part: Climb
clicks: 2
---

# Limiting fan-out

<FanOut :step="$clicks" />

<!--
Estimates for a 10-PR round, from the analysis of rounds 5 to 14.
- One agent: 145 to 175 minutes. Shown at 160.
- [click] Fan-out looks great: 4.2 times faster on the build. Then the red bar. 48 minutes of building, 42 of joining. Overall only 2.2 times faster.
- [click] Three lanes: about 50 plus 15 to 20. About 70 minutes. Fewer agents, and faster.
- Rounds 5 to 11: join 39 percent of the time, build 41, council 19.
-->

---
class: hc
part: Climb
clicks: 1
---

# Why the join hurt

<Lanes :step="$clicks" />

<!--
- 152 of 456 PR pairs shared a file. SessionReviewPage.tsx was in 33 of 108 commits. About 17 percent of added lines didn't survive.
- [click] Lanes give each file one owner. Round 14: 4 agents, 16 PRs, 39 minutes, against 10 agents, 10 PRs, about 55. Merging got down to about 40 seconds per PR.
- Fewer agents gave more PRs. Parallelism is limited by the shape of the code, not the number of agents.
-->

---
class: hc
part: Climb
clicks: 2
---

# CI in the way

<CiQueue :step="$clicks" />

<!--
- verify.sh ran in series, about 20 minutes. In rounds 14 and 15, checks took 31 to 33 minutes, and the council waited behind them. It also skipped SQL and Blob until round 16, which hid three SQL failures.
- [click] scripts/ci runs in parallel on a separate instance: 8m17 to 10m18. The council no longer waits.
- [click] Honest result: rounds did not get shorter. Bigger items filled the time. We spent the saved time on larger work, which is a choice, but don't claim it as a speedup.
-->

---
class: hc
part: Climb
---

# Running out of Sol

<QuotaRoutes />

<!--
- Overnight, Sol's quota was the limit, so the rules gave a fallback order.
- Codex first. Foundry costs real money. OpenCode with Copilot is free, with a limit of 50 images per request. Otherwise wait for one quota reset.
- This matters for the results: Sol's route changed between rounds, which is one more source of noise.
-->

---
layout: none
nofooter: true
---

<PartGate :current="3" />

<!-- What came out. -->

---
layout: none
nofooter: true
clicks: 3
---

<Flipbook :step="$clicks" />

<!--
One screen, 23 rounds. All data here is synthetic. It plays by itself. Drag the rail on the right to go to a round, in this window or the presenter view.
- [click] Findings, before and after. It wipes by itself. Drag anywhere on the screen to compare.
- [click] Task results.
- [click] The Reader.
- It looks better. Everyone agrees on that. Now the numbers.
-->

---
class: hc
part: Results
clicks: 4
---

# The scores

<ScoreChart :step="$clicks" />

<!--
Each member's own frozen weights across all rounds, so the line is consistent.
- Round 1: 6.42 and 6.39.
- [click] Round 4: over 8 in three rounds, like Theo's.
- [click] Round 18: 9.22 and 9.06. The goal looks reachable.
- [click] Round 19. I made them blind. 8.64 and 8.65.
- [click] Then flat. Round 22: 8.67 and 8.70.
-->

---
class: hc
part: Results
clicks: 1
hide: true
---

# Every row

<RowHeat :step="$clicks" />

<!--
- Mean of both members. Red is low, yellow is about 8, blue is high.
- Capture and reading started the lowest and rose the most. Those are the rows used most.
- [click] Blind rounds. Every row steps back at once. A whole product doesn't get worse overnight, so this is the instrument changing.
-->

---
class: hc
part: Results
clicks: 1
---

# The memory leak

<Anchor :step="$clicks" />

<!--
- That's what I wrote in round 18. Members could read earlier rounds, including their own scores.
- [click] One rule change: don't open any earlier report. 9.22 to 8.64, 9.06 to 8.65. Every row stepped back at once. A whole product doesn't get worse overnight, so this was the instrument changing.
- Sol had also moved Frame.io from 8.7 to 9.0 and Linear from 8.5 to 8.9 on unchanged images, which is why the rival scores had been frozen.
- If you run a council, assume it remembers unless you've made that impossible.
-->

---
class: hc
part: Results
clicks: 2
hide: true
---

# The blind test

<Calibration :step="$clicks" />

<!--
- Round 23. Old master and the final build, scored blind. Final build scored twice to measure noise. That's the thick mark on the right.
- [click] Opus +1.87, about 22 times its noise. Sol +0.94, about 8 times. So the gain is real.
- Rows beating the top rival: Opus 6, Sol 1 or 2, master 0. Caveats: Sol ran on Copilot for all three, so it isn't comparable with its Codex rounds, and three screens don't exist on master.
- [click] The chart suggested +2.8. The real gain is about a third to two thirds of that.
-->

---
layout: none
nofooter: true
clicks: 2
---

<HitMarkers :step="$clicks" />

<!--
Click once on the slide window before the talk, or the browser keeps it silent. On a fresh checkout run `npm run sounds:hill-climb` first.
- Calm screen. "Every PR had to show what changed."
- [click] Let it run for 12 seconds. Don't talk over it. When the last pin lands the screen shakes, drains to grey and the ending sound plays for 7 seconds. After the yell, Game Over builds from the left while the calls play. Let that finish too.
- [click] After the sound, the payoff. First review to last blind round: Opus 6.42 to 8.67, Sol 6.39 to 8.70. Phone is out of both.
- If asked: old master and the final build, scored side by side and blind in round 23, gain +1.87 and +0.94, about 22 and 8 times the noise. Old master itself scored 7.00 and 7.62 there, higher than in round 1, and Sol's round 23 ran on Copilot, not Codex.
- The pins are real, from the PR images, and the feed lines are real pin captions. They come from many screens, so the positions are mapped onto this one. It's a joke with true numbers: 1,274 pins in total, 855 on after-images, and the ones on this screen are the laptop-width ones.
-->

---
class: hc
part: Results
---

# The designer study

<StudyFlow />

<!--
- Scores are the instrument. People are the check.
- One hour, Zure participants, hands-on in production copies of old and new. Order counterbalanced. Then blind pairs of original against master, on a scale of minus 2 to plus 2.
- Images sit under content hashes so nobody can tell which is which, including from the URL.
-->

---
class: hc
part: Results
---

# What designers said

<StudyResults />

<!--
PLACEHOLDER. Fill in hill-climb/lib/study.ts.
The four questions from the study plan: same direction as the council, same size, what the council missed, what's overbuilt.
-->

---
layout: none
nofooter: true
---

<PartGate :current="4" />

<!-- So was it worth it? -->

---
class: hc
part: Verdict
clicks: 1
---

# Cost

<Cost :step="$clicks" />

<!--
List price, not what was paid. Subscriptions and the Copilot flat rate cover most of this. Foundry was real money.
- Implementation first, all of it Claude: $1,134 in total. That's $861 on m1 and $212 on m4 during the climb, and $61 after the merge.
- [click] Council, orchestrator, review. GPT was $92, all in council and review. The whole thing comes to $1,539.
- Two cancelled m4 turns have no usage data. Session logs put m4 about $5 higher.
- About 2.6 billion of 2.66 billion Claude input tokens were cache reads. Without caching this would be a different slide.
-->

---
class: hc
part: Verdict
clicks: 2
---

# Where the gain came from

<Stagnation :step="$clicks" />

<!--
- Rounds 1 to 4: +1.82 in about 9 hours.
- [click] Rounds 4 to 18: +0.91 in about 25 hours, and that's the phase with memory, so it's hatched. Treat it as an upper limit.
- [click] Rounds 19 to 22, blind: +0.04 in about 7 hours. That's the plateau.
-->

---
class: hc
part: Verdict
clicks: 3
---

# When to stop

<ScoreCost :step="$clicks" />

<!--
Score on the y axis, money on the x axis. Mean of both members, real spend by round from the provider turns on both machines.
- The first $227 reached 8.23. That's +0.84 for every $100.
- [click] Rounds 4 to 10 still pay, at +0.12 per $100. Then it carries on up to 9.14 at about $1,000.
- [click] Now the blind rounds. They sit at 8.67, on later and better builds. So anything above that line can't be real. I've shaded it: memory, not design. And blind, the rate is +0.02 per $100.
- [click] So my sweet spot is rounds 4 to 10, about $230 to $540. Round 4 gives the cheap wins, and by round 10 the curve meets the level it ended on.
- Be straight about the limit. Scores before round 19 weren't blind, so round 4 and round 10 are upper bounds. Blind rescoring of those two builds would settle it. The calibration councils cost about $10 a run, so that's cheap.
- Stopping at round 10 has a cost the score can't see: round 11 removed a 5-second stall and round 13 stopped a written note being lost. Those are real fixes. The designer study should say whether the late rounds were worth it.
-->

---
class: hc
part: Verdict
clicks: 1
---

# Too high a goal

<TooHigh :step="$clicks" />

<!--
- Same chart, with room left for the goal. We stopped at 8.68, which is the small part on the left. The goal needs another 0.82.
- [click] Blind, a round added about +0.01. Run that forward: about 80 more rounds, 160 hours, and about $5,800 at the $73 a blind round cost. The analysis gave under 5 percent chance of ever reaching it, so that line is the kind version.
- A goal the instrument can't confirm doesn't stop the loop. It only spends money. Theo got 10 from a council that saw its own history. I got 8.9 from one that didn't.
-->

---
class: hc
part: Verdict
clicks: 3
---

# Which peak is this?

<FogReturns :step="$clicks" />

<!--
Same hill as the start. The fog closes in, because this is where the run left us: flat at 8.68, and unable to see what's around us. Three explanations fit, and the data can't separate them.
- [click] A local peak. The rulings fenced the climb: the fixed Portal UI look, one search box, the Reader as an opt-in. In round 18 Opus said of the distance from pin to dock: "That's the price of the ruling, and I have no design that beats it." The big-moves workshop in round 16 was an attempt to jump off, and no jump shows in the scores.
- [click] Noise. A blind round added about +0.01, and repeat scores of one build differ by about 0.1. We could still be climbing without being able to see it.
- [click] The top of the scale. The brief calls 10 reference-quality work, and the frozen rival scores stop at 9.0. A strict blind reviewer may simply not go much above this for any real product.
- More rounds of the same loop won't tell these apart. That's the real finding: the method can't report what stopped it.
-->

---
class: hc
part: Verdict
clicks: 1
---

# It added more than it removed

<Bloat :step="$clicks" />

<!--
- The brief says "Prefer removing things." The result is +17,344 and −4,028 in web/src, plus over 23,000 lines of tests by round 22.
- Score loops reward adding: a missing feature is easy to see, and an unneeded one isn't.
- [click] High findings in diff review rose late. The review tool changed too, so this isn't a clean trend, but it's a reason to stop.
-->

---
layout: none
nofooter: true
clicks: 2
---

<Verdict :step="$clicks" />

<!--
- Worth it for a while. A UI that reviewers rated about 6.4 got a real, repeatable gain in a couple of days.
- [click] Decide the stop rule on the slope, not on a number.
- [click] If members can see their history, your chart is wrong.
-->

---
class: hc
part: Verdict
clicks: 2
---

# Next time

<Recipe :step="$clicks" />

<!--
- Blind from round 1 and freeze rival scores in the first round.
- [click] Lanes with file owners. Score the same build twice before you start, so you know your noise.
- [click] Agree a stop rule up front. I'd use three flat rounds. And end with people.
-->

---
layout: none
nofooter: true
clicks: 2
---

<NextHill :step="$clicks" />

<!--
- The analysis suggested a second climb with the opposite goal.
- [click] Remove code. The bars are a sketch, not data. This is the answer to the fog: small steps can't get you off a peak, so you change the start or the rules. This climb changes the rule.
- [click] The UI score becomes a floor of about 8.6, not a target. A score works better as a guard rail.
- Questions.
-->
