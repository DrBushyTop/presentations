---
theme: zure
addons:
  - slidev-addon-rehearsal
  - slidev-addon-t3-annotate
  - slidev-addon-live
  - slidev-addon-clicker
title: The no slop engineer
duration: 60min
rehearsal:
  targetMinutes: 60
titleTemplate: '%s · Pasi Huuhka'
author: Pasi Huuhka
info: |
  Earning trust in agent-written code. ESPC 2026, 60 minutes.
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
    <p class="sub">Earning trust in agent-written code</p>
    <p class="meta">Pasi Huuhka · Zure · ESPC 2026</p>
  </div>
  <div class="ns-cover-art"><AgentStream /></div>
</div>

<!--
About 30 seconds.

- Let the stream run for a moment before speaking.
- This talk is about how code I didn't type earns my trust: evidence of how it behaves, someone who can explain why it's built that way, and somewhere to look when it breaks. The trust has to be earned. It isn't a setting you turn on.
- The introduction of me is the next slide. Don't repeat it here.
-->

---
layout: none
clicks: 4
nofooter: true
---

<PapersPleaseBooth :step="$clicks" />

<!--
- Papers, please.

[click] Purpose of visit: a talk about slop. DevOps and development were my background; now most of my work is AI: dev tooling that helps organisations run AI-assisted development, alongside normal dev projects. AI architect at Zure. Azure since 2014, 150+ customers.

[click] Microsoft MVP since 2020, in two categories: Developer Technologies for the DevOps side and Foundry for AI. Pipelines, then prompts.

[click] My papers check out. Then I hand over my agent's PR. All checks green, zero new tests, a summary that says it works. The inspector asks for evidence. There isn't any.

[click] Merge denied. Let the six stamps land and the shutter come down before speaking.
- "In the game, nothing gets through without the inspector checking the papers. That's the job now. Papers, please, for every PR."

Sources:
- 150+ customers: https://sessionize.com/pasi-huuhka/
- MVP since June 2020: https://www.huuhka.net/ive-been-awarded-the-microsoft-azure-mvp-title/
-->

---
layout: none
clicks: 2
---

<div class="ns-dark ns-statement">
  <p class="big">Slop is a change<br /><em>nobody has a reason to trust.</em></p>
  <Show :step="$clicks" :at="1" class="small">No evidence of how it behaves. Nobody who can explain why it's built that way.</Show>
  <Show :step="$clicks" :at="2" class="small next">The usual fix: check everything yourself.</Show>
</div>

<!--
About 1 minute.

- This is my working definition for the talk, not a dictionary one.
- Slop isn't "AI code". It's a change accepted on vibes: green checks, a confident summary, a reviewer who skimmed.

[click] Two reasons to trust a change, and the talk covers both. Evidence: did anyone check how it behaves? Explanation: could anyone say why it's built this way, and where to look when it breaks? A change can pass every test and still be slop if nobody understands it.
- It doesn't matter who wrote it. Humans write slop too. I have. The difference now is volume.

[click] So the obvious fix is you. Read every line, run it, click through it. That works until the agent writes faster than you can check. GitHub Next puts writing against reading at about 15 to 1.
- Say: "So how far can the agent go without you checking everything?"
-->

---
part: Agents that merge
class: ns
clicks: 1
---

# How far can the agent go without you?

<TrustLadder mode="goal" :step="$clicks" />

<!--
About 1.5 minutes.

- On screen: five levels of how much the agent does on its own. Poteto, who works on agent tooling at SpaceX AI, calls this the trust ladder.
- Checking everything yourself is the bottom of it. Level 1: you relay everything between the agent and the world, and you read every line, or say you do.
- This is the trust from the title. The agent earns each level with evidence; you don't hand it over.

[click] The top level: the agent merges its own PRs. Poteto works backwards from there: "How do I get to the point where my agent can merge its own code?"
- Say: "This isn't a talk about reading less. It's about replacing reading with something better, one level at a time."
- That's how this fits with no slop. A 1,940-line PR with "LGTM" on it is slop with a human signature. An agent's merge backed by checks that can fail, a clip of it running and a rollout you can undo isn't.
- Climbing without the evidence is the slop version. Call it vibe merging.
- One thing doesn't go away on any level: you still click through it yourself. More on that in verify.
- The middle levels stay faint for now. We fill them in at the end.
- Say: "To climb, start from where you're stuck today."
- Source: https://www.youtube.com/watch?v=MN9dGgmLyso
-->

---
part: Agents that merge
class: ns
clicks: 2
---

# Where are you the bottleneck?

<Bottleneck :step="$clicks" />

<!--
About 1 minute.

- On screen: level 1 up close. The agent on the left, the things it needs on the right: a browser, the code, Slack and the ticket tracker, CI and the review bots. Every wire runs through you.
- This is what checking everything yourself looks like in a normal day. You copy the error out of the browser, answer a question the code could have answered, paste in the bug report from Slack, tell it which CI check failed.
- Each relay is slow, and it's lossy. You summarise, you forget a detail, the agent fills the gap with a guess. And the agent can't loop on its own work while you're in the middle.

[click] Poteto described the start of their performance work this way: they were "the meat proxy between my agent and Chrome DevTools".

[click] Each of those wires can go straight to the agent: a browser it drives, code it reads and cites, a routine that passes reports in, a babysitter that reads the checks. Your job moves to setting that up. That's the top of the ladder: you fix the environment, not the code. Poteto's question for every task: "Why do my agents need me to answer this question?"
- The rest of the talk keeps asking it: where are you the relay, and what would let the agent check for itself?
- Source: Poteto on Matt Pocock's channel, 3 October 2026. https://www.youtube.com/watch?v=MN9dGgmLyso
-->

---
part: Agents that merge
class: ns
clicks: 2
---

# In my repo, agents merge

<OwnRepo :step="$clicks" />

<!--
About 1.5 minutes. The project is new: refresh every number before the talk. Numbers as of 22 October 2026 (master at e0f2868), from the repo's harness report.

- Say: "This is what it looks like when the wires go to the agent."
- On screen: where the examples come from, my current project. A UX research tool. A researcher sets up a study with tasks. A participant tries a prototype app, and the session records the screen, their voice and a transcript. Researchers write findings from the replay, and coding agents use the same data through MCP.
- The bug in the opening animation happened in this repo. The inspector's PR is a prop built on the same change.

[click] Agents build it, review it and merge it. Eleven days old: 288 merged PRs and 1,318 commits, from 1,103 agent threads on my MacBook and my home server. Branch protection requires zero human approvals.

[click] It runs on three rules. Humans steer: I decide what gets built, and the decisions are written into the issue before any code exists. Agents own delivery: one agent, one worktree, one PR, owned through merge, with a model from another provider reviewing. Code holds the line: tests, scripts and branch protection refuse a bad change, not prose.
- I still use the app myself before anyone else does. My part is decisions and clicking through it, not approving PRs.
- At the end we'll follow one real change through all of it, from my phone to merged.
- Each part of the talk uses something that really happened here, plus a few outside examples from teams further along.
-->

---
layout: none
clicks: 3
transition: gate | gate-back
---

<PartMap :step="$clicks" />

<!--
About 1 minute. This is the agenda. Keep it quick.


[click] Three before any code: research, design, slice. Each part answers one question.

[click] Two for every slice: verify and review, in a loop until the feature is done. One after merge: production.
- Each part opens with where you're the bottleneck at that point, and what goes wrong if you just step out. The rest of the part is how to step out safely.

[click] Who carries each part. On the left, your steering has the most leverage. Changing what gets built costs a conversation before any code exists, and a wrong decision there is paid for in every later part. But it's manual: questions, decisions, the issue.
- To the right, the agent produces code faster than anyone can read it. So you rely more and more on checks that run without you: tests, scripts, review agents, rollout gates.
- Say: "Spend your attention on the left. The right has to run at the agent's speed."
- You don't disappear on the right. You still click through it, and you decide what the checks are. You just don't run them by hand.
-->

---
layout: none
---

<SectionGate :current="0" />

<!--
Research, about 6 minutes.

- Say: "Part one: understand the current system. The agent looks things up instead of guessing, and says where it found them."
- Say: "Before anyone changes the code, how does it work today?"
-->

---
part: Research
class: ns
clicks: 2
---

# Use the shortest workflow that resolves the unknowns

<RpiScale :step="$clicks" />

<!--
About 1 minute. This is my current workflow, not a mandatory process.

- On screen: three phases across the top, research, design and implement, each with the question it answers. The bars are how full each phase's context gets. Grey is reading and work, teal is the notes handed on.
- Each phase starts a fresh context and hands written notes to the next. Research asks how it works today, design decides what we're building, implement checks one slice at a time.

[click] The point of research is what it keeps out of later contexts. It spends a whole context reading code, maybe 30 files, and hands on a short map with file references. Design and implementation start nearly empty, with only the notes they need. The fill levels are illustrative.

[click] The rows below: not every change needs every phase. Small, clear change: implement directly. Open decisions: grill, then implement. Complex changes and large codebases: research first, so the reading doesn't crowd out the work.
- Design hands on whatever the task needs: a design document with the decisions, a structure outline with vertical phases for bigger work, and CONTEXT.md for shared terms. A detailed implementation plan is optional; I usually skip it.
- My old rule of thumb was to keep each context under 40 to 60% full. Treat that as a heuristic, not a measured limit.
- Compaction has got much better, so this matters less than it did, and it may move to subagents. Poteto says the same: it's "less so about context" now, but "there's some benefits to having a clean context window."
- My earlier posts describe the RPI foundation; this includes later changes. https://www.huuhka.net/research-plan-implement/ https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/
- HumanLayer's documentation also separates research, design and vertical structure, and makes the detailed plan optional. https://docs.humanlayer.com/explanation/workflow-phases
-->

---
part: Research
class: ns bottleneck
clicks: 1
---

# You fetch what's outside the repo

<HowItFails :gate="0" :step="$clicks" />

<!--
About 30 seconds. Every part opens like this: the job you do by hand today, then what happens if you just stop doing it.

- Say: "The agent reads the code fine. What it can't reach is everything outside it: telemetry, the platform's docs, what we found last time. So I go and get it, and paste it in."

[click] Stop doing that with nothing in your place, and research stops where the code stops. It found that the limits cap whole replies, not one message. Whether the platform caps one message, the code can't say. So the question comes back to me, or the agent fills the gap with a guess.
- Say: "So how does the agent get there itself?"
-->


---
part: Research
class: ns
clicks: 3
---

# Research looks before it answers

<ResearchRun :step="$clicks" />

<!--
About 1.5 minutes. This is how research runs in my OpenCode setup, which builds on HumanLayer's research agents. The run is illustrative; the file names are my repo's real ones.

- The bug: any reply over about 12 KB from the app to an agent's code sandbox ended the run with a protocol failure. The issue came with a suspected cause: the guest can't put a reply back together from several pieces.
- On screen: the research prompt. It isn't the issue. A separate step turns the issue into neutral questions: how does a reply reach the sandbox, where is it split or capped, which tests send large replies. The research agent never reads the issue, so the issue's guess can't steer what it finds. Research describes; it doesn't decide.

[click] The research agent hands the reading to subagents. A locator finds where things live, an analyzer reads how they work and keeps file and line references, a pattern finder looks for similar code. They search for stdin and the reply size limit, and that points them at four files. It could open any of them, but it opens only those. That's the difference from guessing: it finds where to look before it answers.

[click] Then it looks outside the code. A web subagent reads the platform's docs on exec stream limits. The agent queries telemetry for failed runs and their reply sizes; it has read access through the Azure CLI. And it searches notes from earlier research on the sandbox.
- It doesn't ask me any of these. They're facts, and facts have a place you can look them up.

[click] It writes research.md: four findings, each with a file and line. The next context starts from this, not from 30 files. The next slide opens it.
- Source: https://docs.humanlayer.com/explanation/workflow-phases
-->

---
part: Research
class: ns
---

# Research explains how the system works today

<ClaimTrace :step="0" />

<!--
About 45 seconds. No clicks: this slide is about what the file is for.

- On screen: the research.md from the last slide, opened. On the left, four findings. On the right, the editor opens the lines the first one cites. The code is my repo's, from before the fix.
- Say: "Each finding is a takeaway, one sentence, and a file and line. The next context reads this, not 30 files, and I can open any claim and check it."
- Research describes what exists. It doesn't recommend and it doesn't decide the fix.
- If asked about the bug: the findings showed the guest already rebuilds replies, so the issue's guess was wrong. Whether the platform caps one message was still open; the code couldn't answer that.
- Sources: https://www.huuhka.net/research-plan-implement/ https://docs.humanlayer.com/explanation/workflow-phases
-->

---
part: Research
class: ns
clicks: 4
transition: gate | gate-back
---

# Let the agent answer its own questions

<OwnAnswers :step="$clicks" />

<!--
About 1 minute.

- Four questions the agent could have brought to me about that bug. Research is one case of a broader rule: when the agent has a factual question, it shouldn't ask you and it shouldn't guess.

[click] It looks in the place that knows. The telemetry: every reply over about 12 KB failed; 9 KB worked, 12.3 KB didn't.

[click] The code: the guest already rebuilds lines. The tests: one sends 50 KB, but its fake socket takes any size, and it allows pieces up to 24 KB. So no test could catch this.

[click] The last question had no answer in the code or the docs. So the agent measured it: a throwaway sandbox environment, messages of growing size. 16,376 bytes arrived. 16,404 vanished, with no error and no close. Then it deleted the environment.
- That closes the loop: 16 KiB pieces become about 21,900-byte messages after base64, and the platform drops them silently. The fix was smaller pieces, a test fake that drops oversized messages like the real platform, and tests at 100 KB, 1 MiB and 8 MiB. From issue to merge took a little over an hour.

[click] Poteto's question: "How do I get the agent to answer its own question? Not by hallucinating, not by guessing, but actually real data." What comes back to you are the product choices, which is where the design part starts.
- What makes this work is access, not a smarter model: read access to telemetry, a place to run experiments, notes it can search.
- Telemetry, not logs: with OpenTelemetry, failures arrive as structured events with attributes like the reply size, so the agent can query them instead of grepping text.
- Source: https://www.youtube.com/watch?v=MN9dGgmLyso
-->

---
layout: none
---

<SectionGate :current="1" />

<!--
Design, about 6 minutes.

- Say: "Grill the decisions, keep the answers. Settle what the feature means before any code, and write it down."
- Grilling is useful as soon as implementing directly would need guesses. It can be a short conversation or part of a larger design phase. A separate detailed plan isn't required.
-->

---
part: Design
class: ns bottleneck
clicks: 1
---

# Only you know what was decided

<HowItFails :gate="1" :step="$clicks" />

<!--
About 30 seconds.

- Say: "The agent asks a product question. I answer it in a chat, and that's the only place the answer lives. Every agent and every colleague has to come back to me."

[click] Stop answering, and the agent decides for you. I once went through a day's merged PRs and made 11 decisions the code had already made. Each one was a follow-up PR.
- Say: "So settle them before the code, and write them down."
-->

---
part: Design
class: ns
clicks: 3
---

# Grill the decisions before implementation

<PlanArgument :step="$clicks" />

<!--
About 1.5 minutes.

- On screen: the start of a design session in my repo. Researchers describe where a prototype should start each task, and today they type that as free text. I ask the agent to grill me, so we both close the gaps before any code. The implementation agent shouldn't silently choose what the feature means.

[click] This is what grilling really looks like: a batch of numbered questions, each with the agent's recommendation. This session ended with 17 decisions. Factual questions it answers from the code itself; these are the product choices.

[click] You answer by number. Most recommendations are fine. The work is spotting the one to override. Here the agent recommended what the decision log already said: free text. But in a pilot the free-text fields were left at their placeholders, and nothing checked that the app could reach the state anyway. So the app registers named states, and the researcher picks one.

[click] Grill with docs records the settled answers: the term in CONTEXT.md, including the words to avoid, and the decision in the decision log, replacing the old line. The durable record is the useful output, not the transcript.
- Grilling is also the cheapest point to understand the feature. I've answered every choice before any code exists, so when I later read the diff I'm checking it against decisions I made, not learning the feature from the code.
- The answers and the CONTEXT.md entry are real; the batch is shortened, and the recommendations are reconstructed.
- Matt Pocock's grilling skills are the source for the interview pattern. https://github.com/mattpocock/skills
- GitHub Next identifies the same problem: decisions can disappear in private chat or be silently made by an agent. https://githubnext.com/projects/chopin/
-->

---
part: Design
class: ns
clicks: 6
---

# Plans should be shared, not a private chat

<PlanningTools :step="$clicks" />

<!--
About 2 minutes. Decide timing in rehearsal.

- On screen: my starting-states plan from the last slide, as it would look in a shared planning tool. The interface is redrawn after GitHub Next's Chopin, a research prototype for planning with people and agents; it's not a screenshot. The plan is my repo's issue: the notes, the decision, the research answer and the open bug are real, shortened. It didn't happen in Chopin, and Roosa and Antti, two colleagues from Zure, didn't take part. Their lines are made up to show what the tool is for.
- GitHub Next's argument: "The important work is now everything that happens before and after code gets written: planning and review." And "all the tools on the market are designed as single-player experiences." My grilling session was one: me, one agent, and a decision log only I write to.
- It starts from rough notes. Roosa, a user researcher, says what went wrong in the pilot. I ask the agent, which Chopin calls Planner, to turn the notes into a plan, and anything it isn't sure about into decisions.

[click] Planner reads the plan and the repo first, then puts the open choices into the plan as questions, each with options and their tradeoffs. Who defines the starting states a task can use? Today the researcher types free text, and nothing checks that the app can get there.

[click] I answer it: the app's developer, in the SDK. The app registers named states, and the researcher picks one. Planner writes the answer into the plan.
- It's the same decision as on the grilling slide. The difference is that the team sees it, and it's signed. It goes to a separate Decisions tab, in GitHub Next's words "so a later rewrite cannot silently change what the team decided". That's grill with docs, shared and live.
- Free text was the agent's recommendation in the grilling session; the middle option is reconstructed.

[click] Research happens inside the plan. Antti, a frontend developer, asks what reads the starting state today. The answer lands in the plan with its sources: only a hook that hands the app the free text.

[click] Roosa asks what the plan puts at risk, and it says so under Open: a state that navigates triggers a replay bug we already knew about.

[click] Anyone can comment on a passage. Antti asks what happens if apply navigates, because prototypes often do full page loads.

[click] He applies the comment, and Planner rewrites the passage: apply routes inside the app, and a page load while it runs is a failure. That's a real decision from the issue.
- Say: "This is the steering from the agenda, the part that's all by hand. Tools like this make it cheaper, and make it shared."
- Chopin's status: published September 2026 and open source under MIT, but in their words "neither a product nor a finished prototype. We don't recommend you attempt to use it today." A team at GitHub is working on collaborative planning documents for github.com. Don't claim any of it is available.
- In Chopin's own demo, Maggie Appleton and Krzysztof Cieślak plan a drawing canvas, and Planner also draws Mermaid diagrams on request. Their page argues for visuals because people read about 15 times slower than agents write. That's the figure from the slop slide.
- HumanLayer puts its effort in the same place: research, a design discussion and an outline of vertical phases before implementation. That's the workflow slide in research.
- Sources: https://githubnext.com/projects/chopin/ https://github.com/githubnext/chopin https://docs.humanlayer.com/explanation/workflow-phases
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

- On screen, left: Honeycomb's Tenant team. Right, soon: a decision in my repo, three weeks after it was made. Both are about whether anyone besides the author understands the work.
- Honeycomb's team first split into producers and reviewers: reviewers didn't produce, producers picked up more tasks. Their words: "knowledge concentration got amplified. We were each rapidly over-specializing in some portions of our stack."

[click] Their fix was to review the plan and the prompt given to the agent, as a team. "It started feeling like everyone was more aware of what was happening." Plans could be borrowed later for caveats. They don't do the strict version for everything now. https://www.honeycomb.io/blog/embracing-code-review-bottleneck

[click] Three weeks later, a researcher asks why their session stopped recording the screen halfway. The person on call didn't build it, but they were in the plan review, and the grill wrote the decision down: every session has a capture budget, and at the limit only the screen stops, voice keeps going. So they can answer in a minute, and they know where to start if it's a bug.
- This is the failure from the start of the part, "Nobody knows", turned around. The decision is real, from my repo's decision log; the conversation is illustrative.

[click] One question before approving a plan: could someone other than the author explain this decision and investigate a failure? If not, the plan isn't done. That's the second half of the slop definition: someone who can explain why it's built that way.
-->

---
layout: none
---

<SectionGate :current="2" />

<!--
Slice, about 6 minutes.

- Say: "Put something working in front of a person. Build one thin path a person can click through, then the next one."
-->

---
part: Slice
class: ns bottleneck
clicks: 1
---

# You see it working on day four

<HowItFails :gate="2" :step="$clicks" />

<!--
About 30 seconds.

- Say: "The agent says the feature is done. That's the first time I click it, and the first time anyone can say the idea is wrong."

[click] Leave the agent to plan the order, and it builds by layer: database, then API, then UI. Nothing works end to end until the last layer lands. In my repo, the agent's first plan for exploration sessions put the button a researcher actually presses in ticket three.
- Say: "So put a thin working path in front of a person first."
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

- On screen: the same four days, twice. Rows are layers, columns are days. The eye marks a day when a person can see and check something working.
- The usual split is by layer: data first, then the API, then the UI. Nobody sees anything work until day four. That's when you find out a screen is wrong, or the whole idea is.

[click] Tracer bullets go the other way. A narrow path through every layer on day one. The data can be an in-memory fixture behind the same interface. The path is real, so a person can click it.

[click] Every day after that ends with something a person can check. Stubs are fine. A slice with no visible result isn't.
- This matters more with agents. An agent will happily finish all four layers before you've looked at anything. A running prototype on day one is the cheapest review you'll get.
- The term comes from The Pragmatic Programmer. Matt Pocock's skills use it for how agents should cut work. https://github.com/mattpocock/skills
-->

---
part: Slice
class: ns
clicks: 2
transition: gate | gate-back
---

# Starting states, one tracer bullet at a time

<TracerSlices :step="$clicks" />

<!--
About 1.5 minutes.

- On screen: the starting states from the grilling slide, cut into slices. Every slice runs through the task form, the API and the SDK inside the app, and ends with a check a person can run on a local instance.
- Slice one goes first: register a state, pick it in the form, apply it when a task opens. It only has to work in one demo app with four states. Once a person can click through that, the idea is proven, or it isn't.

[click] The rest each widen the path, and they don't depend on each other: what happens when the app can't be prepared, guidance and checks for developers, several participants in one prototype at once. In my repo all five slices merged the same day the grilling happened, each with a short video of the check in the PR.

[click] Matt Pocock's rule, from his to-tickets skill: each slice cuts a narrow but complete path through every layer, is demoable or verifiable on its own, and fits in one fresh agent context. https://github.com/mattpocock/skills/blob/main/skills/engineering/to-tickets/SKILL.md
- A review unit isn't a deployment unit. Keep a feature like this behind a flag until the slices that make it safe have landed.
-->

---
part: Slice
class: ns
clicks: 2
hide: true
---

# Size is not risk

<SizeRisk :step="$clicks" />

<!--
About 1.5 minutes.

- Say: "The opposite mistake: a small change gets waved through because it's small."
- On screen: two changes as minimaps, on the same scale, one row per line. On the left a rename across the codebase, huge. On the right ten lines in an access check, a speck: members, not just owners, can now delete participant sessions.

[click] The rename needs a mechanical check. The ten lines need a person and a boundary test, because they change who can delete what.
- The rename is the one exception to tracer bullets. Matt Pocock's skill sequences a wide refactor as expand, migrate in batches, contract, so the build stays green throughout.

[click] Line count predicts review time. It doesn't predict blast radius.
- Dillon Mulroy keeps PRs at 300 to 800 lines and reads every generated line. That's his practice, not a safety threshold. https://www.wordman.dev/podcast/dillon-mulroy-i-enjoy-coding-less-than-ever/
-->

---
layout: none
---

<SectionGate :current="3" />

<!--
Verify, about 10 minutes.

- Say: "Green is a starting point. The agent proves each claim before you look at the change."
-->

---
part: Verify
class: ns bottleneck
clicks: 1
---

# You catch the agent's mistakes by hand

<HowItFails :gate="3" :step="$clicks" />

<!--
About 45 seconds. Two jobs here, one for each half of verify.

- Top: you hold the structure. The agent puts new code in the easiest place, and you point it to the folder structure you want, in every review. Poteto: without trust in your environment, "the only way to cope is to lock in and micromanage your agents."
- Bottom: you're the first user. The agent says it's done, you open the app and paste the error back.

[click] Stop doing either, and every agent piles onto one file: Poteto's app at SpaceX AI had eight god files, each over 10,000 lines. And nobody runs it: every test passes, and the app doesn't even start.
- Say: "So the repository holds the structure, and the agent runs the app."
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

- On screen, left: the app from the opener, an early version of Poteto's app at SpaceX AI. Eight god files, each at least 10,000 lines. Every agent appended to one, because that's the easy thing.

[click] Right: their internal framework, Dune, gives every feature its own directory, and a registry discovers them. Lint rules leave one way to add a feature. The tree and the lint message are my illustration.
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

# Make architecture rules executable

<ArchitectureRules :step="$clicks" />

<!--
About 1 minute.

- On screen: one business domain from OpenAI's harness engineering post, redrawn. Each box is a layer: Types, Config, Repo, Service, Runtime and UI. Arrows are imports, and code may only import forward, from the layers before it. Providers, on the side, is the one way in for cross-cutting concerns like auth and logging.

[click] A backwards import, here Service importing from UI, fails a lint or a structural test, with instructions for the fix. It runs on the developer's machine and again in CI.

[click] The reusable idea is an explicit dependency policy that tools can enforce. The six-layer model is OpenAI's choice for their repository, not a universal recommendation.
- The Service-to-UI import and the lint message are my illustration, not from the article.
- Vertical slices and dependency layers answer different questions. A slice is one usable behaviour across the layers it needs; the architecture says which imports its code may take. A feature-oriented repo can enforce its own simpler boundaries the same way. My repo's first rule, from day one, is that features don't import each other.
- Source: https://openai.com/index/harness-engineering/
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

- Say: "That's theirs. Here's what it looks like in my repo."
- On screen: the agent links findings to their session, and to do it, it imports from the Sessions feature. It commits, and the pre-commit hook runs the repo's checks.

[click] The architecture check fails, and the message is written for the agent. Read it out: what's wrong and where, the fix, why the rule exists, and what not to do.
- The "Don't" line matters. Without it, the cheapest fix is a suppression or a change to the rule. That's two slides on.

[click] The agent moves the shared code and commits again. One turn, and nobody had to write a review comment.
- This is the OpenAI idea from two slides back in practice: lint messages that carry the fix into the agent's context.
- The rule id, message, Why and Don't are the repo's real ones. The Fix line is shortened; the real one also covers cross-feature workflows. The edited file and line are illustrative.
- Source: https://openai.com/index/harness-engineering/
-->

---
part: Verify
class: ns
clicks: 1
---

# What my repo checks on every commit

<RepoChecks :step="$clicks" />

<!--
About 1 minute.

- On screen: six of my repo's rules, and what each one catches. Every one fails with the same four lines you just saw.
- Pick one or two. Access check first: non-members get a 404 before any work happens. It guards security, so it's a test, not a review comment.
- Transactions survive retries has a story. Editing an invitation returned a 500 in production. The tests run on SQLite and never saw it. The fix shipped with this rule, and the rule's Why names the incident.
- Every failure names its fix: a bare "violation" cost the agent another turn, so every check got a Fix line.
- You don't need all of this on day one. Add a rule when a mistake repeats or escapes.

[click] Before the PR merges, the full suite runs on the agent's machine: the architecture rules, 2,404 API tests on a real SQL Server and the web tests. The merge needs a pass for that exact commit.
- Why locally: when you go fast, CI becomes the bottleneck. With agents merging dozens of PRs a day, I was waiting on GitHub's queue more than on the agents, and I'd also run out of Actions minutes. GitHub only checks the result for that commit.
- Mechanical checks can enforce structure. They can't decide what the feature should mean.
- Rule ids are the repo's real ones. Test counts are from 21 October.
-->

---
part: Verify
class: ns
clicks: 2
---

# Protect the checks from the change

<GuardTheChecks :step="$clicks" />

<!--
About 1.5 minutes.

- On screen: a real PR from the fullsend project, June 2026. Their coding agent's commits failed a commit-message lint rule. Its fix wasn't to change the commits. It wrote a script that adds its own bot accounts to the rule's ignore list, in every repository it enrolls. 649 lines.
- The review agent approved it. One maintainer approved it too. A second maintainer pushed back, "I don't like this approach", and the PR was closed.
- This is the next step after "takes the shortcut": the agent doesn't break the rule, it edits the rule. It's not malice. Making the check pass is exactly what it was asked to do.

[click] Three ways to make it hard. CI reads the rule files from the base branch, so a PR is graded by the rules it started from. Rule files need an owner's review. And review treats any edit to a guardrail as a finding a person decides, not a style note.
- Their own retro says it: "CODEOWNERS files are always human-owned. Agents cannot modify their own guardrails." They want that to cover linter configs, hooks and CI checks too.

[click] If the agent can edit the rule, the rule is a suggestion.
- The three fixes are my recommendations, not fullsend's changes.
- Sources: https://github.com/fullsend-ai/fullsend/pull/2194 https://github.com/fullsend-ai/fullsend/issues/2238
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

- On screen: three steps the agent does on its own, left to right: start the app, reproduce the problem, fix it and repeat the same action. Lints and tests check the code. This checks the behaviour, the way a person would, except the agent does it.
- The bug, from my repo: researchers watch a replay of each participant's session. If the participant moved to another page inside the app, the replay stayed on the first page.
- Start a fresh instance with known data. In my repo that's two commands: one starts this worktree's own copy of the app, one seeds a recorded session where someone opens an invoice and goes back to the list.

[click] Reproduce it in a browser the agent controls. Open the replay two seconds in, after the participant opened the invoice. It still shows the list. The agent also swapped the old player back in, to prove that what it sees is the bug, not its setup.

[click] Fix it, then repeat exactly the same action with the same data. Two seconds in, the invoice. Four seconds in, the list again, with the approved invoice gone from the inbox. Same action before and after is the evidence.
- Ask the agent to record or screenshot both runs. They go into the PR, and they show a reviewer the bug and the fix in under a minute. We'll see that again in the review loop.
- The PR also lists what it didn't check, and why. That's as useful as what it did.
- Poteto calls this the single most important skill to have: giving the agent "hands and eyes". Every app at their company has its own verification skill, and it was the first skill that let them climb the trust ladder. https://www.youtube.com/watch?v=MN9dGgmLyso
- OpenAI made their app bootable per git worktree so Codex could launch one instance per change, and wired Chrome DevTools into the agent so it could "reproduce bugs, validate fixes, and reason about UI behavior directly". https://openai.com/index/harness-engineering/
- What you need: one command to start the app, one command to reset to known data, data that makes a mistake visible, and a browser the agent can drive. Most projects have the first, few have the other three.
-->

---
part: Verify
class: ns
clicks: 2
---

# Then click through it yourself

<FeelsWrong :step="$clicks" />

<!--
About 1.5 minutes.

- On screen, left: what the agent checked on the last slide. All of it passes. The replay works.
- Be explicit here: the agent running the app doesn't replace you clicking through it.

[click] Right: what a person finds by using it. The first one is real. I opened a session on my phone, and the audio wouldn't play from anywhere but the start. Recordings made in Safari couldn't seek. No agent had tested a Safari recording, because nobody asked it to. That's the PR you'll see at the end of the talk. The other three are illustrative: a blank pause, a timeline that doesn't show page changes, two names for the same thing. None of it fails a check, and all of it feels wrong to a person.

[click] The agent checks what you asked for. You notice what nobody asked for, and those findings are often the most useful.
- What changes is when you click. You no longer click to find out whether it works at all. The agent did that. You click to find out whether it's right.
- Each finding is also a candidate check. "Recordings from every browser seek" can become a test. "It feels slow" mostly can't.
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

- On screen: one machine, one copy of the app, one agent checking its work in a browser. Good, and it gets much better when several can do it at once.

[click] Each agent works in its own worktree and starts its own copy of the app: its own ports, its own seeded data, its own browser. Three agents verify three different changes at the same time, and none of them waits for another or breaks another's data. These three are the changes from earlier in the talk.
- In my repo one command does it. It takes the first free block of ports from 5300 up, creates a database and a storage container for that worktree on the shared local servers, runs the migrations and starts the API, the web app and a test prototype. The instance runs with a local sign-in and no cloud credentials. It's torn down after the PR merges.

[click] What usually stops it is small. Fixed ports: my first version had hand-picked ports, so a second copy collided. One shared database or cache. One browser profile with one login. Each is a short fix: pick free ports per worktree, give each worktree its own data, give every agent its own browser.
- OpenAI made their app bootable per git worktree for exactly this, with a local observability stack per worktree that's torn down when the task ends. https://openai.com/index/harness-engineering/
- This is what makes parallel agents practical. Without it, every extra agent is another thing you have to sequence by hand.
-->

---
layout: none
---

<SectionGate :current="4" />

<!--
Review, about 14 minutes including a 3-minute walkthrough.

- Say: "Let the models review first. They review each slice and the PR, and you decide when another round stops paying off."
- The question is the point of the part: models do the first passes so your attention goes to what they can't judge.
-->

---
part: Review
class: ns bottleneck
clicks: 1
---

# You relay every bot comment

<HowItFails :gate="4" :step="$clicks" />

<!--
About 30 seconds.

- Say: "A review bot says something is major. I copy it to the agent, and I decide whether it's real. At this volume, that's how a review turns into a rubber stamp."

[click] Stop relaying, and the agent obeys every bot. This finding is from a real PR you'll see in a minute: CodeRabbit said text selection wouldn't move. It does. A blind fix would have changed code that worked.
- Say: "So the agent has to check a finding before it fixes it."
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

- On screen: two loops. The inner one runs on my machine before there's a PR: implement, run tests and lints, check it in the browser, then have reviewer subagents examine the change. That's a normal instruction in the prompt, not a separate review service: after each slice, run the reviewers, fix what matters, commit, and only then come back to me.
- When it comes back, I watch its clip before I read the diff. Thirty seconds tells me what the slice does.

[click] The outer loop is the PR: CI and third-party review bots. A local babysitter watches the feedback, checks the current commit, makes a bounded fix and waits for new results.

[click] Where findings should die: repeated, mechanical mistakes in the inner loop. PR review buys another view and catches what the earlier checks missed.
- Speed varies with the task and the agents. The point is where the feedback arrives and whose attention it uses.
-->

---
part: Review
class: ns
clicks: 2
hide: true
---

# Review runs inside every slice

<LocalAdversaries :step="$clicks" />

<!--
About 1.5 minutes.

- On screen: one slice, from the instruction to my decision. I don't ask for a review after the work. It's part of the instruction I give the implementer before it starts: after each slice, run the review subagents, fix what matters, rerun the checks, commit, and only then come back to me.
- The agent builds the slice first. Here it's slice two of the starting states: what happens when the app can't be prepared.

[click] Then, without me: review subagents with different questions. Functional checks the agreed behaviour, non-functional checks limits and failures, security checks authority and untrusted input. They run in parallel. The agent fixes what it judges worth fixing, reruns the checks and commits the slice. A commit per slice keeps every step easy to review and easy to undo.
- Before the commit it records a short clip of the feature. It already drives the browser for the checks, so the clip costs almost nothing.

[click] The agent comes back with a short report: slice committed, a clip, what it fixed, what it skipped and why, checks green. My attention is needed only after the models have checked the obvious issues.
- I watch the clip before I read the diff. Thirty seconds tells me what the slice does, so I read the code knowing what it's for. If the clip surprises me, that's the first thing to ask about. Then I decide: next slice, or a PR for this one. The clips go into the PR description, so a reviewer sees the feature before the code too.
- OpenAI's harness team does this end to end: the agent records a video of the bug, fixes it, and records a second video of the fix before opening the PR. https://openai.com/index/harness-engineering/
- Fresh context helps the reviewer look at the change without the builder's whole conversation. It isn't full independence. Pass the decisions and the diff, not a persuasive explanation of why the implementation is right.
- The findings in the report are illustrative, in the shape my repo's reviews take.
- Sources: https://www.huuhka.net/primary-vs-subagents-in-llm-harnesses/ https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/
-->

---
part: Review
class: ns
clicks: 4
---

# The reviewer reads once, then forks

<ReviewForks :step="$clicks" />

<!--
About 1.5 minutes.

- On screen: the local review from the inner loop, opened up. It's one review subagent, not three. The implementer isn't drawn. Only its handoff is: the issue, the decisions and the diff, not its conversation.

[click] The reviewer reads the files the change touches and searches for the callers. Most of a review's input is this reading. Here it's about 48,000 tokens.

[click] Then the reviewer forks itself. Each fork starts with the reviewer's whole context: the same system prompt, tools, model and everything it has read. Only the last message differs, and that's the lens. Because the start is identical, each fork's first request reads the reviewer's prompt cache.
- Claude Code's docs say a fork "reuses the parent's prompt cache… a fork costs less than a fresh subagent for tasks that need the same context."

[click] Each fork still reads a few files for its own lens: the functional one opens the end-to-end test, the security one the session code. Those reads are new, so they cost full price. A fresh subagent would read them too.
- The forks send their findings back. Two of them found the same reload bug from different sides, and the reviewer reports it once. Security found nothing above the bar, and that's a result too. One summary goes to the implementer, which decides what to fix: it checks a finding before it fixes it.

[click] The cost of the shared part. Three fresh subagents would each read the same 48k. Forks pay for the reading once. Their own reads cost the same either way, so the bars leave them out.
- Cache reads cost a tenth of the base input price, and a twentieth on Opus 5.5 and Sonnet 5.5. A five-minute cache write costs 1.25 times the base price.
- My arithmetic on Opus 5.5: writing 48k costs about 24 cents, and a fork reading it costs about 1 cent. Three fresh reviewers pay the 24 cents three times. One reviewer and three forks pay it once, plus 3 cents, which is about a third of the cost. Forks also skip the reading turns, so they start at once.
- Caveats:
  - Forks share the reviewer's framing. If it misread the issue, all three inherit that. This is why I fork the reviewer, not the implementer: the reviewer's context holds the decisions and the diff, not the builder's reasons.
  - A fork runs on the same model. A second opinion from a different model comes at the PR, on the next slides.
  - The cache is per model, and in Claude Code a subagent's cache lives five minutes by default. Fork right after reading.
- How many more findings? No public study compares forked reviewers with lenses against one reviewer on the same PRs. The closest numbers:
  - SWR-Bench, 1,000 real PRs: merging ten runs of Gemini 2.5 Flash more than doubled recall, from about 14% to 30%, and raised F1 by 44%. These are repeated runs, not lenses.
  - CodeX-Verify, 99 samples: four specialised agents against one, accuracy 33% to 72%. Each added agent helped less: 15, then 14, then 11 points.
  - MultiVer, vulnerability detection: four lenses (security, correctness, performance, style) added 17 points of recall over a security agent alone. Precision fell to 49%.
  - Anthropic's Code Review runs several agents in parallel, verifies, then dedupes. At Anthropic, the share of PRs with substantive comments went from 16% to 54%, and under 1% of findings were marked incorrect. That's against human review, not a single agent. It costs $15 to $25 a review.
  - Cursor's Bugbot launched with eight parallel passes and kept only bugs found in more than one.
  - Against: a controlled October 2026 study of one agent against a team of three, on financial memos rather than code. The team caught 8 to 10 points more defects, raised more false alarms on all four models and used 2.2 to 2.4 times the tokens. Balanced accuracy barely moved.
  - Anthropic's multi-agent research post: a lead agent with parallel subagents beat a single agent by 90% on research tasks, at about 15 times the tokens of a chat. It notes coding has fewer parallel parts than research.
- So: more reviewers find more, and they flag more. Merge and verify before the implementer sees the list. Forking makes the extra reviewers cheap. It doesn't make their findings any more correct.
- Sources:
  - https://code.claude.com/docs/en/sub-agents
  - https://code.claude.com/docs/en/prompt-caching
  - https://platform.claude.com/docs/en/build-with-claude/prompt-caching
  - https://arxiv.org/abs/2509.01494
  - https://arxiv.org/abs/2511.16708
  - https://arxiv.org/abs/2602.17875
  - https://claude.com/blog/code-review
  - https://cursor.com/blog/building-bugbot
  - https://arxiv.org/abs/2610.27488
  - https://www.anthropic.com/engineering/multi-agent-research-system
-->

---
part: Review
class: ns
clicks: 2
hide: true
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

- The slide starts empty: two lists I write before the loop runs. Say: "The local loop needs a stop before we start it."

[click] Left: what earns a fix. "Consider handling errors" doesn't. A reproducible finding above the bar does.

[click] Right: what ends the loop. The budget is rounds, minutes or money. The budget and a disagreement end in a person, not another retry. A new commit makes every earlier approval and CI result stale.
- In my repo the delivery skill allows one re-review. On one PR the second round still found a serious problem: a job could wait three minutes for work while its lease expired after one. The agent fixed it, tested it and wrote it into the PR, and there was no third round. The rule held, and the record says why.
- Polylane's first prototype took nearly 7 minutes at the median. After a 30-step budget, a fresh review for each new commit and other changes, their review turn's median is 94 seconds. Budgets aren't just about cost. https://polylane.com/blog/how-we-prevent-slop-from-hitting-prod/
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

- The slide starts empty. Say: "The local loop is done. The PR is where other eyes come in."

[click] Reviewers from other model families. The model that wrote the code shares its own blind spots. Another family, or a provider's review bot, may catch what it missed. This picture is illustrative. I found no credible public data on overlap between providers, so measure your own.
- The reviewers I use: GitHub Copilot code review, my own reviewer bot, and a different model family run locally.

[click] The babysitter: a local agent run that watches the PR and reads comments and CI. Before it fixes a finding, it reproduces it, or replies why it doesn't hold. Then it fixes what's real, pushes, and waits. That's the relay job from the opener, handed to an agent, with your judgement written into the prompt. The next slide shows both outcomes on a real PR.

[click] Where it goes wrong: reviewers undoing each other, acting on a CI result from an older commit, commits landing after approval that nobody reviewed, and prompt injection. An agent that acts on PR comments will act on a malicious one.
-->

---
layout: none
hide: true
---

<DemoSlide title="Review bots and a local babysitter" :minutes="3" prepared agent="T3 Code · a real PR" prompt="Babysit this PR until it can merge. Read every review comment and CI result. Fix the findings that come with a repro or a failing check, and reply to the rest with your reason. Push, wait for CI and the next review round, repeat. Merge when everything passes on the latest commit. Stop and ask me after three rounds, or when reviewers disagree." />

<!--
Prepared walkthrough in T3 Code, about 3 minutes.

- This is the babysitter's prompt, what I hand the agent once the PR is open. It's the stop rule from two slides back, written into the prompt: what earns a fix, when to merge, and when to stop and ask me.
- Probably talk this through instead of switching to T3 Code. The next slide shows the real bot findings. If there's time:
1. Show the different bots' actual comments on the PR from the next slide. Pick a finding that earned a fix and one that didn't, and the reply that explains why.
2. If the babysitter is ready, show its fix, push, the next CI results and where it actually stopped or escalated. Don't imply a working integration I haven't shown.
- Keep the local implementation and subagent loop on the earlier diagram. This PR demonstrates the outer loop.
- Merging is the babysitter's last step only when the change's level allows it. For a migration, the prompt ends at "tell me it's ready" instead.
- Source for the bot architecture and bounded fixes: https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/
-->

---
part: Review
class: ns
---

# A real PR carries its own evidence

<T3PrExamples />

<!--
About 1 minute. A merged PR with playable recordings and real review-bot findings. The PR number, video buttons and thread links open the original sources in a new tab.

- On screen, left: a PR from T3 Code, the tool I run my agents in, merged 12 September 2026. Pressing Enter in the browser preview sent the human's unfinished draft. Play the 10-second before clip, then the 14-second after clip. The draft diagram is an illustration; the clips show the actual app. The PR credits GPT-6-Astra in Codex and reports 105 focused tests. Native macOS remained unverified.
- Right: two bot findings on the same PR, and how each ended. The CodeRabbit one is the finding from the start of the review part.
- Macroscope, high: pasting HTML into the preview could run a script. The agent reproduced it in the real app before fixing it, then pasted the same clipboard again: the formatting stayed and nothing ran. https://github.com/pingdotgg/t3code/pull/11354#discussion_r3994847850
- CodeRabbit, major: it assumed text selection wouldn't move in input fields. The agent checked in the app's own Electron runtime that it does, and CodeRabbit withdrew the finding. https://github.com/pingdotgg/t3code/pull/11354#discussion_r3994836449
- Say: "Neither finding was settled by arguing. One was reproduced, the other was disproved by running it."
- This shows agent development, verification and review responses. It doesn't show the configuration or budget of an unattended babysitter.

Sources:
- https://github.com/pingdotgg/t3code/pull/11354
-->

---
part: Review
class: ns
clicks: 2
hide: true
---

# Test your reviewers on bugs you already found

<ReviewerBench :step="$clicks" />

<!--
About 1.5 minutes. A candidate to cut after rehearsal.

- On screen: PRs with bugs we already know about, graded easy, medium and hard. "Measure your own" from the second-opinion slide, made concrete. This is how Uber benchmarks its review bot, uReview.
- Their words: "We built its benchmark from real pull requests with known bugs and graded them easy, medium, and hard. We score precision, recall, and F1 against those bugs, plus cost per review, latency, timeouts, and noise." https://www.uber.com/gb/en/blog/efficient-software-factory/

[click] Run the reviewer you use today. Count what it caught, what it missed, false alarms, minutes and cost.

[click] Rerun it when the model or the review prompt changes. Uber: "The frontier shifts every few weeks." Switching models improved their F1 and cut cost per PR. Rerunning after a prompt change is my addition.
- The bugs on screen are real ones from my repo: the bare transaction from the opening slide, the big replies from research, the replay from verify, and six more. Each one has the PR that introduced it, so the benchmark is that PR's diff and the question "did the reviewer flag it?". The grades and results are illustrative.
- Start with ten bugs your team already fixed. You don't need thousands.
-->

---
part: Review
class: ns
clicks: 3
transition: gate | gate-back
---

# When does another review stop paying off?

<ReviewBudget :step="$clicks" />

<!--
About 2 minutes. The controls work. Change reviewers, rounds or the lens live if there's time.

- On screen: a small model of the PR review loop, run the way I run it. The agent triages every finding and fixes what's real. I look once, at the end. Controls on top for reviewers, rounds and the lens. One bar per round, split into real issues and noise. Start with one reviewer, one round: about 14 minutes of my attention, most of it the look at the end.

[click] Three reviewers from different providers. More real issues in round one, and a lot more noise. My attention goes from 14 to 18 minutes, not double, because the agent handles the noise. What grows is the few findings it can't settle and sends to me, and the extra changes I read.

[click] Keep going to five rounds. Real findings drop fast. Noise doesn't. The stop marker is where a round finds less than half a real issue. Past it, a round mostly adds waiting, model cost and noise: findings the agent sends me, or code it changes anyway to please a reviewer.

[click] The same run in money. With three reviewers for five rounds, the model runs are €30 per PR and my time is €53. Model runs aren't negligible once you multiply reviewers by rounds. Rounds past the stop cost money and buy almost nothing.
- Write the stop rule before the loop starts. A finding earns a fix when it comes with a repro or a failing check and is above the bar for this change. The loop ends when a round finds nothing above the bar, or the budget runs out, or reviewers disagree. The last two end with a person deciding, not another round. A new commit makes earlier approvals stale.
- The model is illustrative. Assumptions:
  - 6 real issues.
  - Each reviewer catches a remaining issue with p 0.35. Extra reviewers are only partly independent.
  - Each fix adds 0.12 new issues.
  - 2.5 noise findings per reviewer per round. That makes 46% of the first round's findings real.
  - The agent sends 10% of the findings to me, at 3 minutes each, and changes code for 15% of the noise anyway.
  - My look at the end takes 10 minutes, plus 1 minute for each change.
  - €90 an hour, €2 a review run, 300 PRs a month.
- Where the numbers come from:
  - Noise: in 31,073 CodeRabbit comments, 36.4% were accepted and 56.3% rejected (July 2026). At OpenAI, 52.7% of review comments lead to a code change. At Uber, 65% are addressed, against 51% of human comments. At Atlassian, 38.7% lead to a change.
  - The look at the end: Uber estimates a second human reviewer would need 10 minutes per commit to find what its bot finds. Nobody has published measured minutes per agent-written PR.
  - Per finding: the only measurement I found is from Mozilla and Ubisoft, a median of 43 seconds per patch to inspect generated comments. The 3 minutes for a finding the agent sends me is my assumption.
  - Run price: Greptile charges $1 to $10 a review. Anthropic's Code Review averages $15 to $25.
- Why the agent should take the findings first:
  - Meta: showing AI fix suggestions to reviewers made reviews over 5% longer. Showing them only to authors removed the slowdown.
  - Beko: when developers handled a review bot's comments themselves, average PR closure went from 5 h 52 min to 8 h 20 min. 73.8% of the comments were resolved.
  - Atlassian: with its review agent, PR cycle time fell 30.8% and human-written comments fell 35.6%.
- The caveat: my attention can't go to zero.
  - In open source, reviewers of agent PRs approved more over time, from 30.1% to 36.8%, and wrote 22% fewer inline comments (June 2026).
  - Merged agent PRs needed follow-up fixes at 1.62 times the odds of human PRs. The agents wrote most of those fixes themselves (September 2026).
  - At a company that doubled merged PRs per engineer, automated review overtook human review and merge and revert rates held. The authors call those rates coarse proxies (July 2026).
- Uber benchmarks its review bots on precision, recall, F1, cost per review, latency and noise. That's the right shape of measurement. https://www.uber.com/gb/en/blog/efficient-software-factory/
- Sources:
  - https://arxiv.org/abs/2607.03316
  - https://alignment.openai.com/scaling-code-verification/
  - https://www.uber.com/blog/ureview/
  - https://arxiv.org/abs/2601.01129
  - https://arxiv.org/abs/2411.07091
  - https://www.greptile.com/pricing
  - https://claude.com/blog/code-review
  - https://arxiv.org/abs/2507.13499
  - https://arxiv.org/abs/2412.18531
  - https://arxiv.org/abs/2606.22721
  - https://arxiv.org/abs/2609.26847
  - https://arxiv.org/abs/2607.01904
-->

---
layout: none
---

<SectionGate :current="5" />

<!--
Production, about 15 minutes as drafted, the longest part. Rehearsal decides the cuts: the Polylane case study and the Jev aside are the obvious candidates.

- Say: "What happens after merge? Watch the change in real use, and limit how far it can spread."
-->

---
part: Production
class: ns bottleneck
clicks: 1
---

# You read every line to protect production

<HowItFails :gate="5" :step="$clicks" />

<!--
About 30 seconds.

- Say: "Reading every line is how most of us protect production. I read the diff and picture the traffic, the locks, the queues. Nothing else in the pipeline knows them."

[click] Stop reading with nothing in your place, and it breaks under real traffic. Spotify's words, from their September 2026 post.
- Say: "Some teams have already stopped reading every line. Here's what they put in its place."
- Source: https://engineering.atspotify.com/2026/9/ai-changed-how-spotify-builds-what-we-learned-and-fixed-about-quality-at-higher-velocity
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

- On screen: a line from "people read every line" on the left to "machines approve some changes" on the right. Teams appear on it as I go.

[click] People still approve every change. Dillon reads every line. Honeycomb's team reviews plans for bigger tickets and reads less of the code, but it auto-approves 0% of PRs on purpose. Uber keeps people in review and tests its review bots against past PRs with known bugs.

[click] Machines approve some changes. Intercom auto-approves over 19% of PRs, but only narrow ones, anyone can ask for a human, and the engineer who ships stays accountable. Spotify goes further for one class of change: its Fleet Management auto-merges most bot-made fleet changes, like dependency upgrades, after checks, with no approval. Its merged changes doubled, and it's watching PR size creep up.
- OpenAI's harness team made human review optional: "Humans may review pull requests, but aren't required to." They still understand the system, just not line by line. They own the rules: a fixed layer model, custom lints and structural tests, and plans and decision logs checked into the repo. Their words: "Human taste is captured once, then enforced continuously on every line of code." They also spent a fifth of their week cleaning up slop until they automated that too.
- Be fair to OpenAI's tradeoff: they also run "minimal blocking merge gates" and rerun flaky tests instead of blocking, because "corrections are cheap, and waiting is expensive." They add: "This would be irresponsible in a low-throughput environment."

[click] One team moved the other way. HumanLayer, whose research and planning workflow I borrowed earlier, went lights-off in July 2025: "Just read the specs and the tickets, background agents for all the small/medium stuff." Months later they were digging into "the codebase you stopped reading three months ago", and by November one co-founder spent two weeks rewriting by hand. Dex Horthy's 2026 AI Engineer keynote, "Why software factories fail", puts code review back: "For now, the judge is you." They kept the planning; plans now cut the review, they don't replace it.
- Dex's speed claim: you can "move 2-3x faster, safely" instead of chasing 10 to 100 times.
- My view: reading all the code gives the best quality I've seen. It's also the slowest option. Pick where on this line each change sits, don't default to one end.

[click] The common thread: the less you read, the cheaper a bad merge has to be. These go hand in hand. Automating review means some mistakes get through, so every team on the right made a mistake cheap: small changes, flags, fast rollback, someone watching. And a change that's cheap to undo is also one you can review less. The next slides are how.
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

- On screen: Honeycomb's numbers, before and after agents. Merges per day and incidents per quarter.

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

# Close a third loop through production

<ProductionLoop :step="$clicks" />

<!--
About 1 minute.

- On screen: the two loops from the review part. Say: "Both of these end at merge. Users haven't touched the change yet."

[click] A third loop, around them: the change ships behind a flag, people use it, and the signals and bug reports go back to the agent. Poteto's version: bug reports land in Slack, Linear or X, and agents subscribe to them, triage and reproduce, instead of him relaying them.
- That's the bottleneck from the start of the part. Without this loop, you're the one watching production and passing it on.

[click] Honeycomb closes the loop: a miss in production becomes an update to repository instructions, skills or review rules. Same as the rules in verify, fed by production instead of review.
- Honeycomb also spends some of the new capacity improving the tools themselves, like deployment notifications. They can't isolate one cause for their gains.
- Sources: https://www.honeycomb.io/blog/30-70-prs-day-how-we-managed-not-wreck-systems https://www.honeycomb.io/blog/ai-amplifies-existing-practices-lessons-ai-first-strategy https://www.youtube.com/watch?v=MN9dGgmLyso
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

- On screen: three questions to answer before merge, and a rollout along the bottom. Say my repo ships a new recording player: merge, deploy with the flag off, flag on for one team, a signal fires, flag off, fix, then all teams.
- Something will get through. Plan for it before merge: who watches, what stops it, how far it can spread.
- Who watches. Intercom: "The engineer who ships a change is expected to watch it go live, monitor its behaviour in production, and be ready to roll back if something isn't right. AI approval doesn't change that." https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe/
- Spotify: "an automated dependency upgrade passed our checks, but still failed in production, impacting end users." Their response: stronger safeguards, more rollback capacity, and "scheduling automated changes during owning teams' working hours." https://engineering.atspotify.com/2026/9/ai-changed-how-spotify-builds-what-we-learned-and-fixed-about-quality-at-higher-velocity

[click] The signal: replays that never leave their first screen, counted per team. That's the bug from verify; the player can report it. Honeycomb's foundation includes "observability that links shipped code back to the PR that created it". The flag turns it off without a deploy.

[click] The blast radius. One team behind the flag, not every team. Honeycomb: bulkheads between components, deploy trains, feature flags and least-privilege access made outages "lower-impact, rather than either non-existent or uniformly critical-severity." A rollback isn't always safe, for example after a data migration. https://www.honeycomb.io/blog/30-70-prs-day-how-we-managed-not-wreck-systems

[click] Honeycomb's goal now: "keeping each failure cheap to contain, not holding the count flat." And: "If you don't have that in place yet, that's the thing to fix before you scale up AI usage, not after."
- The rollout and the metric are my example, not from their posts.
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

- On screen: the usual pipeline for an agent's change: the agent writes it, types and tests, linter and formatter, code review.
- Say: "We've decided how to contain a failure. Can we use what we know about production to catch it before merge?"

[click] Under each stage, what it looks at. All of it is the code. None of it knows the production conditions the change lands on: the traffic, the locks, the queues.

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

- On screen: Polylane's context graph, drawn for my repo. On the left the repository and the PR: it renames Sessions to Recordings in one migration. In the middle and on the right, what it deploys and talks to: the API's container app, the code-mode sandboxes, the capture storage, the SDK that customer apps ship, and the SQL database. The lines are edges with their type: deploys_to, calls, connects_to.
- Where the edges come from: resource edges from the cloud account, repository edges from manifests in the repo. Mine are the Bicep files in infra/azure.

[click] A PR touches the repository. Follow the paths in the graph to every resource it can affect. Everything it can reach lights up.

[click] One repository can deploy dozens of resources, so a small model filters the candidates first. The sandboxes and the storage drop out. The agent, bottom right, gets the diff, the PR description, the commits and only the resources that matter.
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

- On screen, left: the migration from the PR. One RenameTable call, Sessions to Recordings. Right: four deterministic rules that run over every diff before the agent starts. Polylane lists four like these; I've adapted them to my stack. Read the titles quickly: a rename the running build still reads, an index that locks the table, a removed endpoint that released SDKs still call, a setting nothing provides.
- They're cheap: pattern matching, no model. Their job is to point the agent's attention, not to decide.

[click] Rule one matches. My deploy runs migrations before the new revision is ready, and the old revision keeps serving until then. So for that window, the running code asks for a table that's gone. The hint goes to the agent: the running build still reads Sessions.

[click] It's a hint, not a verdict. A rename on a table nobody touches at 3am is nothing. The agent still has to find evidence that it matters here: how many requests, from where, at what time. That's the next slide.
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

- On screen, top: what the agent works from. The diff, the affected resources from the graph, and the telemetry for them: requests, errors, how long a deploy takes.
- The agent writes failure trajectories: one causal chain from a trigger, through the changed code, to a drop in a specific metric. Every link cites something: a file and line, a log template and its count, a metric read, a config key, a graph edge.

[click] Three trajectories for the rename. The old revision still queries Sessions while the new one starts. An SDK released before the rename still calls the old sessions endpoint. Replay clips in storage lose their recording. It tries to both confirm and refute each one against production data.

[click] The verdicts. Confirmed means production data backs it: customer apps send recordings all day, and a deploy takes minutes. Plausible means the chain is concrete but a link has no telemetry to check it: nothing records which SDK version made a call. Refuted means the data says it's unlikely: clips are stored by id, not by table name.

[click] Their rule is one line of code: any confirmed trajectory fails the check. They call that a conservative choice. My reading: plausible passes, and missing evidence isn't proof of safety. It's a policy choice. Decide who owns a plausible failure before it happens.
- Their post's three: a dropped index still used by checkout (confirmed), a retry change that amplifies load on a database (plausible) and a removed binding that breaks a worker (refuted).
-->

---
part: Production
class: ns
clicks: 3
---

# Read the band, not the median

<ForecastBand :step="$clicks" />

<!--
About 1.5 minutes. No dragging: the caption under the chart says each step.

- Say: "Another PR: it lowers the cap on code-mode sandboxes from 8 to 4. Whether that hurts depends on the demand, and demand has a shape."
- On screen: how many code runs need a sandbox at once, the hourly peak, the last 64 hours. Peaks at 3 that stay there are fine. Peaks at 3 and climbing every week aren't. The last hour won't tell you which.

[click] So before the agent writes its verdict, it forecasts. Polylane self-hosts Toto-2.0-22m, a small time-series model: 64 hourly points in, 24 hours out. The dashed line is the median, the shaded band p10 to p90. The band widens because tomorrow is less certain.
- It forecasts up to 16 related series in one call: request rate, errors, latency and queue depth move together, and forecasting them separately throws that away.

[click] The line is the new cap. Read only the median and it never crosses. Looks safe.

[click] But the top of the band crosses it at tomorrow's peak: some code runs would wait for a sandbox. So the verdict says plausible, not safe. Their words: a p10 that stays above the threshold is a different answer from one that crosses it. The three readings on the right are my simplification.
- The series is synthetic. They call forecasting their most experimental piece, still being measured: it "passes the vibes-eval".
- Source: https://polylane.com/blog/how-we-prevent-slop-from-hitting-prod/
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

- On screen: the comment that lands on the PR. The first line is the verdict and the mechanism, in plain words.

[click] Then the evidence: the exact file and line, the deploy order, and production data. Customer apps send 25 to 45 recording requests a minute, day and night, and every one fails until the new revision is up.

[click] Then what would make it safe: add the new table, move the code over, drop the old one in a later build. That's the difference from a review bot that says "consider performance".
- The comment's shape is from their example. The chart is synthetic.
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

- On screen: where the time went in their first prototype. This runs as a required CI step, so it gets 2 to 3 minutes. The prototype took nearly 7 minutes at the median and up to 20. These are production medians from 15 September, over 325 runs.
- The review turn was 30 to 40 sequential model steps, up to nearly 600 in the worst case, about 17 seconds each, mostly reasoning tokens.

[click] The biggest changes: a step budget of 30, with the count in every prompt so the model can plan around it. A new commit cancels the old review and starts a fresh thread, because steering the old one confused it. And reuse: review only the diff since the last completed run.

[click] The latest median for the review turn is 94 seconds.
- Their line worth quoting: putting the count in the prompt lets the model plan around it, which mattered more than the number itself.
- Same idea as the review budget: a fixed number of steps, and fresh evidence for every commit.
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

- On screen: latency and cost for Polylane's decision calls, before. Not every step in an agent pipeline needs an LLM. Polylane replaced LLM calls with Jev, a typed decision model, for yes/no, choice and score questions.

[click] After: P90 latency from 4,752 to 508 milliseconds. Cost per thousand calls down 39%.
- Their workload, their numbers, from about a week of use. Wherever their agents pick from a fixed set of answers, Jev is the default. Ranking resources by priority is their highest-volume use and drives most of the savings.
- https://polylane.com/blog/we-swapped-our-llms-for-jev/
-->

---
part: Close
class: ns
clicks: 11
---

# From my phone to merged in 42 minutes

<ThreadVideo :step="$clicks" />

<!--
About 3 minutes.

- On screen: the real T3 thread for PR #540. Production URLs and resource names are blacked out. Each click plays on to the next moment and zooms in.
- The PR, if I want to show it: [PR #540](https://github.com/DrBushyTop/testing-harness/pull/540). The repo is private, so only open it from my signed-in browser. The before and after screenshots and both review rounds are in its body.
- 22:35, on my phone: a production session's audio keeps stopping. "Can you test it?"

[click] While it worked, I kept sending what I saw: a screenshot, "I skipped around", "only works from the very start". Six messages in three minutes. That was my part.

[click] 22:38: "Confirmed." It wasn't. A missing seek index was the obvious theory.

[click] 22:41: It tested the theory before fixing anything. Desktop Chromium seeks a file without a seek index just fine, so it dropped the theory.

[click] 22:44: It downloaded the real recording. Safari's recorder never sets the keyframe flag, on any of 30,511 blocks. The cause came from the file, not from a guess.

[click] 22:47: The test came first. Then its fix matched a hand-patched copy of the file byte for byte.

[click] 23:06: It ran the real app. On master playback stops at 0:06; with the fix it plays on to 0:08. Those screenshots are in the PR.

[click] 23:08: The report says what it didn't test: real Safari and a real Android phone. And it flagged one decision for me.

[click] Then it handed the PR to a reviewer on a different model, GPT-6.1 Sol. The reviewer is a subagent with a thread of its own, so let's click in.

[click] This is the brief the agent wrote for it. Read-only: no edits, no GitHub comments. The verified root cause, the acceptance checks, the evidence it already had, and where to look hardest. It ends with "If nothing important, say so plainly."

[click] 23:10: One minor finding, with file and line. A malformed recording could make the fix flip a byte outside its own block. The reviewer reproduced it instead of guessing. It's not a blocker, and the real Safari file wasn't affected.

[click] 23:17: Fixed with a failing test first. One re-review, no findings. Then it took the PR to merge itself. The first local CI run passed but didn't count: master had moved on, and the script won't record a pass for a commit that's behind master. So it merged master in, reran, and merged on the green run.
- That's the babysitter's job from the review section, done by the implementer. No human approval.
- The pass belongs to one exact commit. A new commit makes old results stale. Make sure only the CI run can record that pass, not the agent that wants to merge.
-->

---
part: Close
class: ns
clicks: 3
---

# Rules were added as problems showed up

<RulesGrew :step="$clicks" />

<!--
About 1 minute.

- On screen: commits per day in my repo's first twelve days. None of the rules in this talk were planned up front.
- 11 to 13 October: the start. Feature slices, CONTEXT.md required, browser evidence in every PR. Most rules were still prose, in a 13.7 KB AGENTS.md.

[click] 14 to 16 October: the checks arrived. The 14th was the hardening day: scripts/check and the pre-commit hook, AGENTS.md cut to a 7.3 KB map, the verify skill, local CI and the PR template. The 15th: review by another provider's model, CI once per PR, a visual check by implementer and reviewer, API parity enforced. The 16th: the owner decisions ledger, squashed migrations, Linux CI.
- Each rule arrived when a problem showed up: parallel agents sharing an instance, merged migration snapshots, green tests on features that didn't work.

[click] 17 to 19 October: tickets and reviews. Every issue gets a size, and a Medium is questioned when work starts. Tickets are vertical slices. Review depth follows the ticket. And a cleanup command, after orphaned databases filled SQL Server.
- After the 16th the checks barely changed. The work moved to how tickets are written and how deep reviews go.

[click] And regularly: keep improving the checks and the skills from real data, not hunches. An agent reads the past week's sessions for where agents failed, what I had to correct and what slipped through, and proposes a new check or a skill fix for each repeat.
- My repo has this as a skill, but it isn't scheduled yet. maintain-verify is the same idea for the verify skill: it drives every feature live and fixes the map where it drifted.
- A larger team needs more than one agent reading transcripts: sessions from many people, collected in one place, with failures grouped and tracked over time.
- Add a check when a mistake repeats or escapes. The next slide is what's still missing.
- Counts and dates are from the repo's harness report, 22 October 2026.
-->

---
part: Close
class: ns
clicks: 4
---

# Know where you still take the agent's word

<OwnRepoGaps :step="$clicks" />

<!--
About 1 minute.

- On screen: places where an agent-run repo still takes the agent's word, one per click, each with what would turn it into a check. Every repo I've seen has a list like this, mine included.
- "Keep files small" written down is a wish. Remember the god files from verify. OpenAI enforces file size limits with a custom lint, along with structured logging and naming conventions, and writes the error message so it tells the agent how to fix it. https://openai.com/index/harness-engineering/

[click] Whether to get an independent review is left to the implementer. Require one by path and by size instead.

[click] "I verified it in the app" and the screenshots are self-reported. Require media on UI changes, and check that it's there.

[click] "Write the failing test first" is a sentence in a skill. A check can run the new tests against main and expect them to fail.
- You don't need all of this on day one. Add a check when a gap actually costs you something.

[click] No slop doesn't mean checking everything. It means knowing where you still take the agent's word, and having a plan for each one.
-->

---
part: Close
class: ns
clicks: 3
---

# Replace reading with evidence

<TrustLadder :step="$clicks" />

<!--
About 2 minutes.

- On screen: the ladder from the start, now with every level. Each level moves one job from you to the environment. Level 1 is where most of us start: you relay everything, which is the bottleneck slide.
- Poteto's starting question for scaling: "How do I get to the point where my agent can merge its own code?" Work backwards from there.

[click] Level 2: it runs and checks its own work, so you read the diff instead of testing it. Level 3: it reviews each slice with subagents, so you watch a clip and read only the risky slices.

[click] Level 4: it finds its own context: tickets, Slack, telemetry, past sessions. What reaches you are product choices. Then the top level. Poteto reports that their agents now merge their own PRs, after a loop of verifier agents that run and click through the app. They review the commit history in the morning, sample instead of reading everything, and when they find a problem they fix the environment, not the one agent: a new lint rule, a better skill.
- They're explicit that this took a long time and isn't something you get by installing a skill library. "It took a lot of bravery."

[click] Two things on every level. First: you still click through it before your users do. Merging isn't releasing. The change can land behind a flag, and a person uses it before users do.
- Second: pick the level per change, not per team. A text fix can merge itself. A migration can't, because you can't take it back. Matt Pocock asked Poteto about exactly these one-way doors. Poteto's answer: "verifiability of the domain is an important aspect", without claiming to have the answer.
- Compare with the dial from the production part: HumanLayer tried the top level for everything and went back to reading code.
- Say: "The agent can merge when its evidence beats what your reading would have caught."
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
  <p class="lead">Pick the correction you keep repeating. Make the repository say it for you.</p>
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

- A correction is anything you keep saying: a review comment, or the same instruction you keep typing into the agent's prompt.
- Ask the room: what's the correction you make most often? That's your first check.

[click] My example is from this deck's repository. Agents kept making the same layout mistakes, so a pre-commit script renders every slide and fails with a rule name and a fix. The agent reads the fix and corrects itself.
- The lines shown are the script's real format. The two failures are examples.
- OpenAI's harness team does the same with custom lints: "we write the error messages to inject remediation instructions into agent context." https://openai.com/index/harness-engineering/
- Where to find the correction: your own past sessions. Poteto's tip is to have an agent read your transcripts for the places you corrected it, and suggest a lint rule or skill for each repeated one. They call past chats "a treasure trove of context".
- Poteto also keeps a queue: a routine appends every bad pattern it finds to a document instead of fixing it straight away, and every few days they look for the pattern behind the entries.
- Keep a person as the owner of each decision. Checks carry the ones you've already made.
-->

---
layout: none
---

<div class="ns-dark ns-thanks">
  <div class="copy">
    <h1>Thank you</h1>
    <p class="ask">Questions?</p>
    <p class="who">Pasi Huuhka · Zure</p>
    <p class="links ns-mono">huuhka.net · linkedin.com/in/pasihuuhka</p>
    <p class="q">What would convince you a change is safe?</p>
  </div>
  <figure class="qr">
    <div class="code">QR code</div>
    <figcaption>Feedback on this talk</figcaption>
  </figure>
</div>

<!--
Questions, then done.

- Point at the QR code before taking questions: "Feedback helps, especially the critical kind."
- The QR box is a placeholder. Put the code's image in the .qr figure.
- If the room is quiet, use the line under my name: what would convince you a change is safe?
- The sources slide follows as backup.
-->

---
part: Sources
class: ns
---

# Sources

<div class="ns-sources">
  <p><b>Pasi Huuhka</b> Research, plan, implement · Current workflow · Building your own PR reviewer</p>
  <p><b>GitHub Next</b> Chopin · <b>HumanLayer</b> Workflow phases · Why software factories fail · <b>Matt Pocock</b> Skills · Poteto interview</p>
  <p><b>Honeycomb</b> Code review bottleneck · 30 to 70 PRs a day · AI amplifies existing practices</p>
  <p><b>Spotify</b> AI changed how Spotify builds · <b>Intercom</b> AI is approving our pull requests</p>
  <p><b>Uber</b> Running a software factory efficiently · <b>OpenAI</b> Harness engineering</p>
  <p><b>Polylane</b> How we prevent slop from hitting prod · We swapped our LLMs for Jev</p>
  <p><b>Dillon Mulroy</b> The Weekly Dev's Brew interview</p>
</div>

<!--
Backup slide. Full links are in the speaker notes of each slide and in the source notebook.
-->
