# The no slop engineer: source notebook

Research checked on 27 September 2026. This notebook keeps the reading separate from the proposed talk. Summaries are brief interpretations, not endorsements. Company results are self-reported unless the source says otherwise. Dates marked only 2026 were not pinned to an exact day in this pass.

## Starting conversations

- [Brainstorm No Slop Engineer](https://chatgpt.com/share/6ab8c9eb-a52c-83eb-836e-296426a7a647?ogimg=plain)
- [Find reputable AI engineering sources](https://chatgpt.com/share/6ab8ca1b-fd08-83ed-8b94-507df0d51356?ogimg=plain)

Both conversations were read from their public page data. Their search-result caches also contain irrelevant links; the archive below preserves their 42 actual citation destinations, not the whole search cache.

## Corrections and limits

- The interview is Dillon Mulroy. John Fawcett is a separate practitioner whose post was initially suggested in error.
- Niall Murphy links to Aidan Harding's July 2026 Putting Learning in the Loop. The earlier chat instead named the September 2025 Coding with AI post. Both are retained here.
- incident.io's DevEx article and Anthropic's long-running-agent article are from 2025. They are useful background, not recent summer 2026 evidence.
- Spotify keeps its existing thresholds. Its discussion does not establish that large PRs are safe.
- The newer Polylane production-review post is the main production reference. Its forecast is experimental; a plausible failure can lack confirming telemetry. Its prevented-incident metric is an operational proxy, not direct observation of an incident that would otherwise have happened.
- The Jev follow-up is an optional aside about bounded decisions. It is separate from the time-series forecasting model.
- USENIX and Signals pages are saved for later viewing. Their recordings were not watched in this pass. Boris Cherny's profile feed supports the described routine, but a stable post permalink and date are still needed for stage-ready attribution.
- Kiro's supplied planning URL redirects. Recheck specific product claims before using them.

## Foundation

### Research - Plan - Implement

[Pasi Huuhka](https://www.huuhka.net/research-plan-implement/) · 2025-12-17, updated 2026-04-19

Research maps current behavior; planning resolves scope and evidence. Scale the process to the task.

Limit: Do not turn a context-window heuristic into a universal numerical rule.

### How I currently develop with LLM models

[Pasi Huuhka](https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/) · 2026-02-25, updated 2026-04-19

Plans are where Pasi challenges assumptions. Browser checks complement tests.

Limit: A historical workflow snapshot. Model and orchestration choices are not the talk's thesis.

### Building your own PR reviewer with coding agents

[Pasi Huuhka](https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/) · 2026-03-11, updated 2026-06-28

Ordinary software owns triggering and orchestration; the agent performs a bounded review.

Limit: Use the architecture to explain loops, not a tour of the bot implementation.

## Core

### Embracing the code review bottleneck

[Fred Hebert / Honeycomb](https://www.honeycomb.io/blog/embracing-code-review-bottleneck) · 2026-07-22

Reviewing plans helped a team share understanding. They later relaxed the heavy workflow for simpler tasks.

Limit: A team experience, not proof that every change needs a planning ceremony.

### 30 to 70 PRs a day: How we managed to not wreck our systems

[Liz Fong-Jones / Honeycomb](https://www.honeycomb.io/blog/30-70-prs-day-how-we-managed-not-wreck-systems) · 2026

More change strained the delivery system. Incident counts also rose; existing operational practices mattered.

Limit: PR throughput is not product value. Keep incident counts, severity and per-change rates distinct.

### Why AI coding made me more productive and less happy

[Dillon Mulroy / The Weekly Dev's Brew](https://www.wordman.dev/podcast/dillon-mulroy-i-enjoy-coding-less-than-ever/) · 2026-09-10

A practitioner account of small stacked changes and reading the generated code.

Limit: 300 to 800 lines describes his practice, not a safety threshold. Read the transcript; the whole workflow need not be adopted.

### Turn one giant AI-generated pull request to a reviewable stack

[GitHub Engineering](https://github.blog/engineering/turn-one-giant-ai-generated-pull-request-to-a-reviewable-stack/) · 2026-08-04

Agents can help present a large change as ordered reviewable units.

Limit: Splitting after generation reduces review size but does not undo bad architectural decisions.

### Harness engineering

[OpenAI Engineering](https://openai.com/index/harness-engineering/) · 2026-02-11

The team enforced boundaries with linters and structural tests, and exposed runtime feedback to agents.

Limit: An internal product experiment with extensive automation. It also made human PR review optional; do not cite it as an argument for mandatory human review.

### DevEx matters for coding agents, too

[Rory Bain / incident.io](https://incident.io/blog/ai-developer-tools) · 2025-12-19

Faster compiler and lint feedback helps both people and agents correct changes sooner.

Limit: Useful older engineering evidence, not a post from the last two months.

### Can AI agents build real Stripe integrations?

[Stripe Engineering](https://stripe.com/blog/can-ai-agents-build-real-stripe-integrations) · 2026

The benchmark checks integration behavior rather than judging generated code alone.

Limit: A bounded benchmark cannot establish overall application correctness.

### How we prevent slop from hitting prod

[Vi Tran and Boris Tane / Polylane](https://polylane.com/blog/how-we-prevent-slop-from-hitting-prod/) · 2026-09-21

Connects a diff to affected resources and telemetry, then investigates potential failures.

Limit: Their shown rule fails confirmed trajectories, while plausible ones may pass. Missing evidence is a policy decision, not a proof of safety.

### Cognitive surrender in production management

[Niall Murphy](https://www.linkedin.com/posts/niallm_ive-been-thinking-about-whats-going-to-activity-7493075094060072960-l2j9) · Relative date only on page

Raises the risk of operators giving up their own model of a system.

Limit: Practitioner argument, not a quantified causal result. His comments link to Putting Learning in the Loop.

### Putting learning in the loop

[Aidan Harding](https://aquiva.com/blog/putting-learning-in-the-loop) · 2026-07-21

Ask for the engineer's expectation before showing the agent's answer; compare independently formed reviews.

Limit: Corrects the shared chat: this is the piece Niall linked, not the older Coding with AI post.

## Background

### AI amplifies your existing practices

[Honeycomb](https://www.honeycomb.io/blog/ai-amplifies-existing-practices-lessons-ai-first-strategy) · 2026

The organizational context matters when interpreting AI adoption results.

Limit: Read beside the later throughput and incident account.

### 2x, nine months later: We did it

[Darragh Curran / Fin](https://ideas.fin.ai/p/2x-nine-months-later) · 2026

A leadership account of changing the development system, including automated approval.

Limit: Self-reported organizational results; inspect denominators before quoting multipliers.

### Effective harnesses for long-running agents

[Anthropic Engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) · 2025-11-26

Incremental work, durable progress records and end-to-end browser checks helped long-running work.

Limit: Browser verification still misses some failures. This is older context, not a recent 2026 report.

### Building effective agents

[Anthropic Engineering](https://www.anthropic.com/engineering/building-effective-agents) · 2024-12-19

Simple workflows and explicit evaluation provide a starting point for agent design.

Limit: Older guidance; preserve its date.

### AI code review: More context, fewer bugs

[Cursor](https://cursor.com/guides/ai-code-review) · Living guide

Review benefits from surrounding code and repository context.

Limit: Product guidance, not an independent comparison of reviewer quality.

### Five takeaways from the Q2 software delivery pulse

[CircleCI](https://circleci.com/blog/five-takeaways-2026-q2-pulse/) · 2026-07-08

Feature-branch activity and main-branch throughput diverge in their delivery data.

Limit: Workflow runs are proxies; this observational dataset does not prove AI caused the gap.

### Learning opportunities skill

[Cat Hicks](https://github.com/DrCatHicks/learning-opportunities) · Living repository

A concrete approach to deliberate learning alongside agent-assisted coding.

Limit: A workflow artifact, not evidence that any particular intervention prevents skill loss.

### Coding with AI

[Aidan Harding](https://www.aidanharding.com/2025/09/coding-with-ai/) · 2025-09

An agent can hide the friction that would otherwise prompt an architectural rethink.

Limit: Older personal experience. Keep distinct from the July 2026 learning post.

### Comprehension debt

[Addy Osmani](https://addyosmani.com/blog/comprehension-debt/) · 2026

Names the gap between produced code and human understanding.

Limit: Useful language, not a measured quantity for this case study.

### Own the outer loop

[Addy Osmani](https://addyo.substack.com/p/own-the-outer-loop) · 2026

Places engineering judgment around increasingly automated execution.

Limit: Avoid turning a useful framing into another abstract loop taxonomy.

### Note on 24 September 2026

[Simon Willison](https://simonwillison.net/2026/Sep/24/harder/) · 2026-09-24

Argues that getting the benefit of coding agents demands more engineering discipline.

Limit: A short opinion, not a productivity study.

### Daily maintenance routines

[Boris Cherny](https://www.linkedin.com/in/bcherny) · 2026, relative dates

Describes recurring maintenance work followed by automated and human review.

Limit: The profile feed is unstable. Capture a direct post and exact date before using the reported counts on stage.

### Inside Kilo speed

[John Fawcett / Kilo](https://blog.kilo.ai/p/inside-kilo-speed-how-one-engineer) · 2026

Another practitioner's account of decomposing agent work.

Limit: The shared chat initially confused Fawcett with Mulroy. The small-stack interview is Mulroy.

## Counterpoint

### AI changed how Spotify builds

[Tyson Singer / Spotify](https://engineering.atspotify.com/2026/9/ai-changed-how-spotify-builds-what-we-learned-and-fixed-about-quality-at-higher-velocity) · 2026-09-16

Spotify reports no distinct direct AI-authored incident signature, while PR size and complexity are increasing.

Limit: They explicitly keep existing thresholds. This is not evidence that large changes are safe.

### AI is approving our pull requests: Here is how we made it safe

[Intercom / Fin](https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe/) · 2026

Some changes receive automated approval. The reviewer rejects changes that are too large or broad; the shipping engineer remains accountable.

Limit: Selected changes and an established delivery system. Revert-rate comparisons do not isolate the effect of AI.

### Running a software factory efficiently at Uber scale

[Uber Engineering](https://www.uber.com/gb/en/blog/efficient-software-factory/) · 2026-08-27

Managed workflows use task-specific benchmarks, cost per completed outcome and quality signals.

Limit: A substantial platform investment. It challenges blanket dismissal of factories, not the need for boundaries.

### Why software factories fail

[Dex Horthy / HumanLayer](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md) · 2026-07-22

HumanLayer read only specs and tickets from July 2025, ended up with code nobody could maintain, and put human code review back while keeping planning up front.

Limit: Essay version of the AI Engineer World's Fair 2026 keynote (https://www.youtube.com/watch?v=Ib5GBkD555M). Quotes come from the essay, not a checked transcript. It does not say they stopped reviewing plans.

### I am betting my company on proactive agents

[Boris Tane / Polylane](https://polylane.com/blog/proactive-agents/) · 2026-07-05

Distinguishes mitigation that restores a known state from code changes that go through review and CI.

Limit: Production goals still require engineering judgment. Rollback is not harmless in every system.

### Sub-agents are just wrong

[Polylane](https://polylane.com/blog/sub-agents-are-just-wrong/) · 2026-09-14

Their autofix pipeline moved from many coordinated agents to one agent.

Limit: A workload-specific result, despite the universal-sounding title.

### The autonomous codebase

[Dan Adler / Sourcegraph](https://sourcegraph.com/blog/the-autonomous-codebase) · 2026-09-21

Proposes narrow, authorized agents composed into triggered workflows.

Limit: A forward-looking argument. The author explicitly names unresolved identity, authorization and budget problems.

## Tooling

### Chopin

[GitHub Next](https://githubnext.com/projects/chopin/) · 2026

Collaborative planning with research and explicit decisions moves attention upstream of implementation.

Limit: An early research prototype. Use one screenshot or prepared artifact, not a live dependency.

### Spec Kit July 2026 newsletter

[GitHub](https://github.com/github/spec-kit/blob/main/newsletters/2026-July.md) · 2026-07

The assess extension asks whether an idea should be built before normal implementation work.

Limit: Tool evidence, not a requirement to introduce a large specification process.

### Planning agent documentation

[Kiro](https://kiro.dev/docs/cli/chat/planning-agent/) · Living docs

A planning-tool lead from the original conversation.

Limit: The supplied URL currently redirects. Recheck the destination before citing specific behavior.

## Optional aside

### We swapped our LLMs for Jev. It is 39% cheaper.

[Vi Tran and Boris Tane / Polylane](https://polylane.com/blog/we-swapped-our-llms-for-jev/) · 2026-09-25

Uses a decision model for routing, classification and ranking in their on-call agent.

Limit: An early, workload-specific cost and latency report. Jev is not the separate time-series forecasting model used in the production-review post.

## Watch later

### What do we do now, now that we are happy?

[Niall Murphy / USENIX](https://www.usenix.org/conference/srecon25emea/presentation/murphy) · 2025

Official talk page checked; recording retained for later viewing.

Limit: Recording not watched in this research pass. Do not treat its abstract as a verified transcript.

### Responsible use of ML in SRE work

[Laura Nolan and Niall Murphy / USENIX](https://www.usenix.org/conference/srecon25emea/presentation/nolan-dt) · 2025

Official session page on responsible delegation.

Limit: Session description checked; not a reviewed recording.

### Signals 2026

[Checkly](https://www.checklyhq.com/signals-2026/) · 2026-09-10 to 2026-09-11

Event page confirms the reliability and AI discussion and Niall's participation.

Limit: No recording reviewed. Attendee accounts are secondary evidence.

## Original citation destinations

These preserve every distinct destination attached to a citation in either shared conversation. Some are duplicates of the reading list; some are background leads. Inclusion here does not mean a page or recording was fully reviewed. The original Sourcegraph test hostname is preserved; use the canonical source in the annotated list above.

- [Why AI Coding Made Me More Productive - And Less Happy | Dillon Mulroy](https://www.wordman.dev/podcast/dillon-mulroy-i-enjoy-coding-less-than-ever/) · conversation 1
- [Chopin](https://githubnext.com/projects/chopin/) · conversation 1
- [https://raw.githubusercontent.com/DrBushyTop/presentations/master/coding-agents/slides.md](https://raw.githubusercontent.com/DrBushyTop/presentations/master/coding-agents/slides.md) · conversation 1
- [How I currently develop with LLM models (Early 2026) | Huuhka.net](https://www.huuhka.net/how-i-currently-develop-with-llm-models-early-2026/) · conversation 1
- [ESPC 2026 Speakers | Microsoft Experts & Community Leaders - ESPC](https://espc.tech/conference/espc-2026/submit-to-speak/) · conversation 1
- [Harness engineering: leveraging Codex in an agent-first world | OpenAI](https://openai.com/index/harness-engineering/) · conversation 1
- [Research - Plan - Implement | Huuhka.net](https://www.huuhka.net/research-plan-implement/) · conversation 1
- [GitHub - githubnext/chopin: Let's compose rich plans together · GitHub](https://github.com/githubnext/chopin) · conversation 1
- [spec-kit/docs/history.md at main · github/spec-kit · GitHub](https://github.com/github/spec-kit/blob/main/docs/history.md) · conversation 1
- [Built-in agents - Custom agents - Features - Docs - Kiro](https://kiro.dev/docs/cli/chat/planning-agent/) · conversation 1
- [Sub-agents are just wrong · Polylane](https://polylane.com/blog/sub-agents-are-just-wrong/) · conversation 1
- [Can AI agents build real Stripe integrations? We built a benchmark to find out](https://stripe.com/blog/can-ai-agents-build-real-stripe-integrations) · conversation 1
- [AI code review: more context, fewer bugs · Cursor](https://cursor.com/guides/ai-code-review) · conversation 1
- [Building your own PR reviewer with coding agents | Huuhka.net](https://www.huuhka.net/building-your-own-pr-reviewer-with-coding-agents/) · conversation 1
- [I'm Betting My Company on Proactive Agents · Polylane](https://polylane.com/blog/proactive-agents/) · conversation 1
- [ESPC26: Call for Speakers @ Sessionize.com](https://sessionize.com/espc26/) · conversation 1
- [AI Changed How Spotify Builds. What We Learned (and Fixed) About Quality at Higher Velocity | Spotify Engineering](https://engineering.atspotify.com/2026/9/ai-changed-how-spotify-builds-what-we-learned-and-fixed-about-quality-at-higher-velocity) · conversation 2
- [Running a Software Factory Efficiently at Uber Scale](https://www.uber.com/gb/en/blog/efficient-software-factory/) · conversation 2
- [Turn one giant AI-generated pull request to a reviewable stack - The GitHub Blog](https://github.blog/engineering/turn-one-giant-ai-generated-pull-request-to-a-reviewable-stack/) · conversation 2
- [The autonomous codebase | Sourcegraph](https://testwww.sourcegraph.com/blog/the-autonomous-codebase) · conversation 2
- [Boris Cherny - Anthropic | LinkedIn](https://www.linkedin.com/in/bcherny) · conversation 2
- [Why AI Coding Made Me More Pro…–The Weekly Dev's Brew – Apple Podcasts](https://podcasts.apple.com/ie/podcast/why-ai-coding-made-me-more-productive-and-less-happy/id1818009834?i=1000788830357) · conversation 2
- [I've been thinking about what's going to happen when we get a lot more AI in the mix in production management. In particular, I've been thinking about what happens when, for reasons of time pressure,… | Niall Murphy](https://www.linkedin.com/posts/niallm_ive-been-thinking-about-whats-going-to-activity-7493075094060072960-l2j9) · conversation 2
- [I’ve just spent two days at Signals 2026 in Berlin and I’m impressed by how tangibly the impact of AI on Site Reliability Engineering was discussed there. For me, in my role, one question stood out… | Stephan Koiteck](https://www.linkedin.com/posts/stephan-koiteck-6a87831b6_ive-just-spent-two-days-at-signals-2026-activity-7504858705868374016-cxkk) · conversation 2
- [5 key takeaways from the State of Software Delivery Q2 Pulse report - CircleCI](https://circleci.com/blog/five-takeaways-2026-q2-pulse/) · conversation 2
- [Simon Willison on llms](https://feeds.simonwillison.net/tags/llms/) · conversation 2
- [Simon Willison on coding-agents](https://simonwillison.net/tags/coding-agents/) · conversation 2
- [How I Came to Embrace the Code Review Bottleneck](https://www.honeycomb.io/blog/embracing-code-review-bottleneck) · conversation 2
- [30 to 70 PRs a Day: How We Managed to Not Wreck Our Systems](https://www.honeycomb.io/blog/30-70-prs-day-how-we-managed-not-wreck-systems) · conversation 2
- [AI is approving our pull requests: Here's how we made it safe - The Intercom Blog](https://www.intercom.com/blog/ai-is-approving-our-pull-requests-heres-how-we-made-it-safe/) · conversation 2
- [2× – nine months later: We did it - by Darragh Curran](https://ideas.fin.ai/p/2x-nine-months-later) · conversation 2
- [DevEx matters for coding agents, too | Blog | incident.io](https://incident.io/blog/ai-developer-tools) · conversation 2
- [Effective harnesses for long-running agents \ Anthropic](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) · conversation 2
- [Building Effective AI Agents \ Anthropic](https://www.anthropic.com/engineering/building-effective-agents) · conversation 2
- [Like many others, I’ve watched the explosion of “AI SRE” companies over the past few years with a mixture of interest and skepticism. When the founders first approached me, it was to become an… | Niall Murphy | 33 comments](https://www.linkedin.com/posts/niallm_like-many-others-ive-watched-the-explosion-activity-7487866847338381312-N7BB) · conversation 2
- [What Do We Do Now, Now That We’re Happy? | USENIX](https://www.usenix.org/conference/srecon25emea/presentation/murphy) · conversation 2
- [Responsible Use of ML in SRE Work: Between a (Thinking) Rock and a Hard Place | USENIX](https://www.usenix.org/conference/srecon25emea/presentation/nolan-dt) · conversation 2
- [Coding with AI – Aidan Harding](https://www.aidanharding.com/2025/09/coding-with-ai/) · conversation 2
- [John Fawcett](https://resume.j0.hn/) · conversation 2
- [Inside Kilo Speed: How One Engineer Shipped an AI Adoption Dashboard in Two Days](https://blog.kilo.ai/p/inside-kilo-speed-how-one-engineer) · conversation 2
- [Comprehension Debt - the hidden cost of AI generated code. | AddyOsmani.com](https://addyosmani.com/blog/comprehension-debt/) · conversation 2
- [Own the Outer Loop | AddyOsmani.com](https://addyosmani.com/blog/own-the-outer-loop/) · conversation 2

## Additional related links retained

- [Chopin repository](https://github.com/githubnext/chopin)
- [Spec Kit documentation](https://github.github.io/spec-kit/)
- [Pasi: browser verification for coding agents](https://www.huuhka.net/browser-verification-for-coding-agents-chrome-devtools-mcp-vs-agent-browser/)
- [Pasi: primary vs subagents](https://www.huuhka.net/primary-vs-subagents-in-llm-harnesses/)
- [Cat Hicks: learning opportunities](https://github.com/DrCatHicks/learning-opportunities)
- [Simon Willison: automated tests](https://simonwillison.net/2025/May/28/automated-tests/)
- [Original Addy Osmani outer-loop URL](https://addyosmani.com/blog/own-the-outer-loop/)
- [Boris Cherny maintenance post lead](https://x.com/bcherny/status/2088014489438621990) · permalink lead; not independently reviewed here
