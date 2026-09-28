---
theme: zure
addons:
  - slidev-addon-shared-mermaid
title: Modernizing databases
titleTemplate: '%s · Zure'
author: Pasi Huuhka
info: |
  A short, practical companion to an application modernization workshop.
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
exportFilename: modernizing-databases
fonts:
  provider: google
  sans: Inter
  mono: JetBrains Mono
  weights: '200,400,600,700,800'
seoMeta:
  ogTitle: Modernizing databases
  ogDescription: How to choose a target, reduce migration risk and prove that the system still works.
---

<div class="zcover database-cover">
  <div class="zcover-text">
    <p class="eyebrow">Application modernization, continued</p>
    <h1>Modernizing<br />databases</h1>
    <p class="zcover-sub">Choose deliberately. Move in small steps. Prove that the system still works.</p>
    <p class="zcover-meta">Pasi Huuhka · Zure · 2026</p>
  </div>
  <div class="zcover-art">
    <img src="/assets/cover-tree-seed-migration-subtle.png" alt="Watercolor old tree with two seed hollows while three birds migrate toward a younger grove" />
  </div>
</div>

<!--
Timing: about 45 seconds.

This is a short companion to the application modernization lab. I am not going
to teach every Azure SQL service or walk through migration tooling. The useful
question is narrower: what changes when the database is real, old and important?

My working rule for the whole talk is on the cover. Choose a target based on the
system you actually have. Change it in steps you can understand. Prove each step
with evidence from the old and new systems.

The order matters. Teams often jump straight to moving schema and data because
that part looks concrete. The difficult work starts earlier, with dependencies,
ownership and a baseline. It ends later, after cutover, when the new system has
survived real traffic.
-->

---
nofooter: true
layout: none
class: zsection
---

<div class="zdark zdark-center db-opening">
  <p class="eyebrow">One system</p>
  <div class="db-system-pair">
    <div class="db-system-box">Application</div>
    <div class="db-system-link"><span></span><span></span><span></span></div>
    <div class="db-system-box db-system-data">Database</div>
  </div>
  <p class="zbig">The application and database are one system.</p>
  <p class="zdark-note">A new runtime does not remove old data-layer constraints.</p>
</div>

<!--
Timing: about 1 minute.

This is the point I want to establish before talking about products. We can move
a .NET application to a current runtime, put it in Container Apps and clean up
the deployment. That is useful work. It does not remove SQL Agent jobs, linked
servers, old authentication, shared databases or a recovery process tied to one
specific server.

The boundary between application modernization and database modernization is
mainly an organizational convenience. At runtime there is one system. A decision
on either side changes the other side.

I would ask the room for one or two examples of hidden database coupling they
have seen. Scheduled jobs and cross-database queries usually get the discussion
moving. Keep this short. The next slide turns the point into a practical test.
-->

---
part: Why
class: workshop-proof-slide
---

# The workshop proves that the application can move

<div class="proof-bridge">
  <div class="proof-side proof-side-lab">
    <p class="proof-label">Workshop proof</p>
    <div class="proof-node">Build</div>
    <div class="proof-arrow">→</div>
    <div class="proof-node">Deploy</div>
    <div class="proof-arrow">→</div>
    <div class="proof-node">Start</div>
  </div>
  <div v-click="1" class="proof-divider"></div>
  <div v-click="1" class="proof-side proof-side-production">
    <p class="proof-label">Production proof</p>
    <div class="proof-evidence-grid">
      <span>Behaviour</span><span>Data</span><span>Performance</span><span>Recovery</span>
    </div>
  </div>
</div>

<div v-click="2" class="proof-verdict">"The application starts" is useful evidence. It is not enough.</div>

<p class="cite">Source: <a href="https://github.com/microsoft/MicroHack/tree/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization">Application Modernization with GitHub Copilot MicroHack</a></p>

<!--
Timing: about 1 minute.

The lab has a sensible boundary. It lets us practise assessment, remediation and
deployment without spending the day on a production migration. We should keep
that boundary clear instead of pretending the lab proves more than it does.

First click: production adds four kinds of evidence. Does the same business
behaviour still happen? Is the data complete and consistent? Is the important
workload at least as usable as before? Can we recover when something goes wrong?

Second click: landing on the home page proves the connection string works and
some queries succeed. It does not prove the application produces the same
business results. It definitely does not prove the recovery plan.

I would say this without criticizing the lab. The lab teaches the application
workflow. This talk supplies the missing production questions.
-->

---
nofooter: true
layout: none
class: zsection
---

<div class="zsplit">
  <div class="zsection-body">
    <p class="eyebrow">Part 01</p>
    <h1>Understand the system before choosing the service</h1>
    <p class="zsection-sub">The target should follow the dependencies, not the other way around.</p>
  </div>
  <div class="zsplit-art">
    <img src="/assets/section-hidden-root-network.png" alt="Watercolor forest cutaway showing hidden roots and mycelium connections" />
  </div>
</div>

<!--
Timing: about 20 seconds.

The next few slides are discovery and decision work. We first map the route,
then choose the Azure service. Starting with the product list tends to turn
requirements into after-the-fact justification.
-->

---
part: Process
class: lifecycle-slide
---

# Treat database modernization as a process, not a move

<div class="lifecycle-track">
  <div class="lifecycle-pair">
    <div class="lifecycle-step"><b>01</b><span>Discover</span></div>
    <div class="lifecycle-arrow">→</div>
    <div class="lifecycle-step"><b>02</b><span>Assess</span></div>
  </div>
  <div v-click="1" class="lifecycle-pair">
    <div class="lifecycle-arrow">→</div>
    <div class="lifecycle-step"><b>03</b><span>Baseline</span></div>
    <div class="lifecycle-arrow">→</div>
    <div class="lifecycle-step"><b>04</b><span>Remediate</span></div>
  </div>
  <div v-click="2" class="lifecycle-pair">
    <div class="lifecycle-arrow">→</div>
    <div class="lifecycle-step lifecycle-step-accent"><b>05</b><span>Migrate</span></div>
    <div class="lifecycle-arrow">→</div>
    <div class="lifecycle-step"><b>06</b><span>Validate</span></div>
  </div>
  <div v-click="3" class="lifecycle-pair">
    <div class="lifecycle-arrow">→</div>
    <div class="lifecycle-step"><b>07</b><span>Cut over</span></div>
    <div class="lifecycle-arrow">→</div>
    <div class="lifecycle-step"><b>08</b><span>Observe</span></div>
  </div>
</div>

<div v-click="4" class="lifecycle-underlay">The copy is step five.</div>

<p class="cite">Source: <a href="https://learn.microsoft.com/en-us/azure/azure-sql/migration-guides/database/sql-server-to-sql-database-guide?view=azuresql">SQL Server to Azure SQL Database migration guide</a></p>

<!--
Timing: about 1 minute 30 seconds.

Reveal this in pairs. I would spend most of the time before and after the red
migration step.

Discover means inventory, consumers and ownership. Assess means compatibility,
operations and workload requirements. Baseline records what the current system
does. Remediation removes blockers in the database and the application.

Migration is the actual schema and data movement. Validation compares the two
systems. Cutover moves traffic and responsibility. Observation checks the new
system under real use instead of declaring victory at the connection-string
change.

The last click is the opinionated part: the copy is step five. If the project
plan mostly describes export, import and a maintenance window, it is missing the
work that controls risk.

The labels are deliberately verbs. Each step should produce an artifact or a
decision. If it does not, it is probably just a meeting.
-->

---
part: Process
class: discovery-slide
---

# Compatibility is a graph, not a checkbox

<div class="dependency-map">
  <div class="dependency-hub">
    <img src="/assets/sql-server.svg" alt="" />
    <span>Current system</span>
  </div>

  <div class="dependency-row">
    <div class="dependency-card">
      <small>Application</small>
      <b>drivers</b><b>SQL</b><b>transactions</b>
    </div>
    <div v-click="1" class="dependency-card">
      <small>Database</small>
      <b>jobs</b><b>CLR</b><b>linked servers</b>
    </div>
    <div v-click="2" class="dependency-card">
      <small>Operations</small>
      <b>backup</b><b>RPO / RTO</b><b>network</b>
    </div>
    <div v-click="3" class="dependency-card">
      <small>Workload</small>
      <b>latency</b><b>IOPS</b><b>growth</b>
    </div>
  </div>

  <div v-click="4" class="assessment-tool">
    <img src="/assets/azure-migrate.svg" alt="" />
    <strong>Tooling finds incompatibilities</strong>
    <span>People supply ownership, criticality and acceptable risk.</span>
  </div>
</div>

<p class="cite">Sources: <a href="https://learn.microsoft.com/en-us/data-migration/sql-server/database/assessment-rules">SQL Database assessment rules</a> · <a href="https://learn.microsoft.com/en-us/azure/migrate/tutorial-assess-sql?view=migrate">Assess SQL instances with Azure Migrate</a></p>

<!--
Timing: about 1 minute 30 seconds.

Start with the application side because that is where the workshop has already
built some intuition. Connection strings are the obvious dependency. Raw SQL,
provider versions, transaction behaviour, retries and latency assumptions are
usually more interesting.

Then reveal the database itself. SQL Agent, CLR, linked servers, cross-database
queries and filesystem access can decide the target before we discuss service
tiers.

Operations often decide whether a technically compatible target is acceptable.
Ask for the real RPO and RTO. Ask who restores the database and when they last
proved it. Ask about retention, residency and private networking.

The final reveal is the workload. I do not want to map a 16-core server to 16
vCores and call that sizing. Capture peaks, query latency, I/O, blocking,
connections and growth. Azure Migrate can collect and assess much of this, but
the tool does not know which month-end job keeps the business alive.
-->

---
part: Decide
class: target-choice-slide
---

# Pick the highest-level managed service that fits the system

<div class="target-axis">
  <span>more compatibility</span>
  <span>more change</span>
</div>

<div class="target-ladder">
  <div class="target-card">
    <span class="target-level">01</span>
    <img src="/assets/azure-sql-vm.svg" alt="" />
    <strong>SQL Server<br />on Azure VM</strong>
    <small>Keep OS and instance assumptions</small>
  </div>
  <div v-click="1" class="target-card target-card-mi">
    <span class="target-level">02</span>
    <img src="/assets/sql-managed-instance.svg" alt="" />
    <strong>Azure SQL<br />Managed Instance</strong>
    <small>Keep most instance semantics</small>
  </div>
  <div v-click="2" class="target-card target-card-db">
    <span class="target-level">03</span>
    <img src="/assets/sql-database.svg" alt="" />
    <strong>Azure SQL<br />Database</strong>
    <small>Move to a database-scoped model</small>
  </div>
  <div v-click="3" class="target-card target-card-engine">
    <span class="target-level">04</span>
    <img src="/assets/postgresql.svg" alt="" />
    <strong>PostgreSQL<br />or another store</strong>
    <small>Choose an intentional engine change</small>
  </div>
</div>

<div v-click="4" class="target-warning">Managed Instance can be the final architecture.</div>

<p class="cite">Sources: <a href="https://learn.microsoft.com/en-us/azure/azure-sql/database/features-comparison?view=azuresql">Azure SQL Database and Managed Instance feature comparison</a> · <a href="https://learn.microsoft.com/en-us/azure/azure-sql/migration-guides/database/sql-server-to-sql-database-guide?view=azuresql">SQL Database migration guide</a></p>

<!--
Timing: about 2 minutes.

This is intentionally not a good-to-bad ladder. It is a compatibility-to-change
axis.

SQL Server on an Azure VM buys infrastructure relocation and Azure integration,
but the team still owns the database server. Managed Instance removes much of
that work while retaining many instance-level features. SQL Database pushes the
application toward a database-scoped model. PostgreSQL or another data store is
an engine or architecture decision, not a routine SQL Server migration.

The selection rule is in the title. Use the highest-level managed service that
satisfies the real requirements. Do not choose SQL Database because it sounds
more modern and then discover that an important job, cross-database query or
security model has nowhere to go.

The last click matters. Managed Instance is not an embarrassing halfway point.
For an application that needs instance semantics, it can be the right final
architecture. Conversely, moving a shared SQL Server into one large Managed
Instance does not decompose the application. Those are different projects.
-->

---
part: Prove
class: baseline-slide
---

# Measure the old system before changing it

<div class="baseline-layout">
  <div class="baseline-input">
    <small>Known workload</small>
    <div class="baseline-pulse"></div>
    <span>normal day</span><span>month end</span><span>failure case</span>
  </div>
  <div class="baseline-arrow">→</div>
  <div class="baseline-system">
    <span class="baseline-db"></span>
    <strong>Current system</strong>
  </div>
  <div class="baseline-arrow">→</div>
  <div class="baseline-evidence">
    <div v-click="1"><b>80 ms</b><span>P95 query</span></div>
    <div v-click="2"><b>800/s</b><span>peak throughput</span></div>
    <div v-click="3"><b>0.05%</b><span>error rate</span></div>
  </div>
</div>

<div v-click="4" class="baseline-note">If we did not measure it before, we cannot compare it after.</div>

<p class="cite">Source: <a href="https://learn.microsoft.com/en-us/azure/azure-sql/migration-guides/database/sql-server-to-sql-database-guide?view=azuresql">Microsoft database migration testing guidance</a></p>

<!--
Timing: about 1 minute 30 seconds.

A baseline is more than average CPU. Capture business behaviour and the workload
shape that matters. A quiet Tuesday afternoon may tell us nothing about month
end, imports or a morning traffic spike.

Reveal the example measures one at a time. The numbers are illustrative. The
point is to agree on what we will compare before the target exists. Useful data
can include API latency, query latency, throughput, blocking, deadlocks,
connections, error rate, I/O and database growth.

The current system may already be slow or unreliable. That is fine. The baseline
is evidence, not praise. It lets us separate old problems from migration
regressions.

I would also capture representative queries and business transactions now. Once
people know a migration is under way, memories become surprisingly optimistic.
If we wait until after the move to define acceptable behaviour, the target keeps
moving with the discussion.
-->

---
part: Process
class: unknowns-slide
---

# Reduce the number of unknowns in each step

<div class="unknowns-comparison">
  <div class="unknowns-column unknowns-bigbang">
    <p class="unknowns-label">One release</p>
    <div class="unknowns-blocks">
      <span>.NET upgrade</span><span>new ORM</span><span>Azure SQL</span><span>managed identity</span><span>schema redesign</span>
    </div>
    <div class="unknowns-question">
      <i>?</i>
      <strong>Five changes.<br />One failure.</strong>
      <span>What broke?</span>
    </div>
  </div>

  <div v-click="1" class="unknowns-column unknowns-sequence">
    <p class="unknowns-label">Deliberate sequence</p>
    <div class="sequence-track">
      <span><b>01</b>Characterize</span><i>↓</i><span><b>02</b>Change</span><i>↓</i><span><b>03</b>Verify</span><i>↓</i><span><b>04</b>Next change</span>
    </div>
  </div>
</div>

<div v-click="2" class="unknowns-callout">The right sequence depends on the dependencies. The principle does not.</div>

<!--
Timing: about 1 minute 30 seconds.

The left side is tempting because all of these changes may be desirable. Doing
them together creates a very large debugging surface. When the invoice total is
wrong or the checkout path is slow, which change owns the problem?

Reveal the deliberate sequence. Characterize the current behaviour, make one
bounded change, verify it and only then take the next step. The database can move
before the application, after it or in a coordinated release. There is no one
correct order for every system.

The stable principle is to reduce unknowns. For one application I may first
upgrade .NET while leaving the database alone. For another, moving SQL Server to
Managed Instance may remove an infrastructure deadline before we touch the app.

This is also where I would push back on a giant "modernization release". A large
programme can still deliver in small verified steps. The programme boundary does
not need to become the deployment boundary.
-->

---
part: Move
class: migration-path-slide
---

# Downtime tolerance chooses the shape of the move

<div class="migration-modes">
  <div class="migration-mode">
    <p class="migration-label">Offline</p>
    <div class="migration-flow">
      <span class="migration-db">Source</span><i>stop</i><span class="migration-copy">copy</span><i>start</i><span class="migration-db migration-db-target">Target</span>
    </div>
    <small>Simple path · longer outage</small>
  </div>

  <div v-click="1" class="migration-mode migration-mode-online">
    <p class="migration-label">Online</p>
    <img class="migration-service-icon" src="/assets/database-migration-service.svg" alt="" />
    <div class="migration-flow online-flow">
      <span class="migration-db">Source</span>
      <span class="sync-lines"><i></i><i></i><i></i></span>
      <span class="migration-db migration-db-target">Target</span>
    </div>
    <small>Initial copy · continuous sync · short cutover</small>
  </div>
</div>

<div v-click="2" class="migration-footnote">Online reduces outage. It adds moving parts, drift and cutover work.</div>

<p class="cite">Source: <a href="https://learn.microsoft.com/en-us/azure/azure-sql/migration-guides/database/sql-server-to-sql-database-guide?view=azuresql">SQL Server to Azure SQL Database migration methods</a></p>

<!--
Timing: about 1 minute.

Once the target and remediation work are clear, downtime tolerance shapes the
movement method.

Offline is easier to reason about. Stop writes, copy schema and data, validate,
then start against the target. It may be completely acceptable for a small
internal system or a planned weekend outage.

Online migration starts with an initial copy and then keeps source changes in
sync. The final outage can be much shorter. The trade-off is another system to
operate and verify. Schema can drift. Replication can lag. Teams need a clear
point where writes stop, the final changes drain and applications switch.

I would avoid treating zero downtime as a free requirement. Ask what one hour of
downtime costs. Then compare that with the engineering and operational cost of
an online path. Sometimes the simple path is the responsible one.
-->

---
nofooter: true
layout: none
class: zsection
---

<div class="zsplit">
  <div class="zsection-body">
    <p class="eyebrow">Part 02</p>
    <h1>Prove the system before and after the move</h1>
    <p class="zsection-sub">The old and new systems need comparable evidence.</p>
  </div>
  <div class="zsplit-art">
    <img src="/assets/section-bird-flyway.png" alt="Watercolor flock following a river corridor from a wetland toward a distant alpine lake" />
  </div>
</div>

<!--
Timing: about 20 seconds.

The migration mechanism gets data to the target. It does not tell us whether
the result is correct. The rest of the talk is about creating evidence we can
compare before, during and after the cutover.
-->

---
part: Prove
class: golden-tests-slide
---

# The running system is often the only complete specification

<div class="golden-flow">
  <div class="golden-input">
    <small>Known input</small>
    <strong>Create order #4172</strong>
  </div>
  <div class="golden-split">
    <div class="golden-lane">
      <span>Legacy app + database</span>
      <i>→</i>
      <b>€128.40 · status paid</b>
    </div>
    <div v-click="1" class="golden-lane golden-lane-new">
      <span>Modern app + database</span>
      <i>→</i>
      <b>€128.40 · status paid</b>
    </div>
  </div>
  <div v-click="2" class="golden-match">Same business result</div>
</div>

<p class="cite">Sources: <a href="https://learn.microsoft.com/en-us/azure/azure-sql/migration-guides/database/sql-server-to-sql-database-guide?view=azuresql">Migration validation guidance</a> · <a href="https://github.com/microsoft/MicroHack/tree/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization">GitHub Copilot App Modernization MicroHack</a></p>

<!--
Timing: about 1 minute 30 seconds.

Legacy systems rarely come with a complete and current specification. The
running system contains years of decisions, accidents and business rules. Some
of them only exist in stored procedures or in the interaction between code and
data.

A characterization or golden test takes a known input through the old system and
records the important output. Run the same case against the modernized system.
The goal is the same business result, not identical implementation details.

Useful cases are business-shaped: create an order, calculate an invoice, cancel
a transaction, search historical data, produce a month-end report. Choose the
paths where an unnoticed difference would cost money or trust.

These tests do not need to be beautiful. They need to be deterministic enough
to run repeatedly. Building them before the migration is one of the best ways
to turn an argument about confidence into an observable comparison.
-->

---
part: Prove
class: validation-slide
---

# Validate the system from four angles

<div class="validation-grid">
  <div class="validation-card">
    <span class="validation-number">01</span>
    <strong>Schema</strong>
    <small>objects · indexes · constraints · permissions</small>
  </div>
  <div v-click="1" class="validation-card">
    <span class="validation-number">02</span>
    <strong>Data</strong>
    <small>counts · totals · ranges · integrity</small>
  </div>
  <div v-click="2" class="validation-card validation-card-accent">
    <span class="validation-number">03</span>
    <strong>Behaviour</strong>
    <small>golden business flows</small>
  </div>
  <div v-click="3" class="validation-card">
    <span class="validation-number">04</span>
    <strong>Performance</strong>
    <small>latency · throughput · errors</small>
  </div>
</div>

<div v-click="4" class="validation-query">
  <code>same tests(source)</code><span>≈</span><code>same tests(target)</code>
</div>

<p class="cite">Source: <a href="https://learn.microsoft.com/en-us/azure/azure-sql/migration-guides/database/sql-server-to-sql-database-guide?view=azuresql">Microsoft database migration testing guidance</a></p>

<!--
Timing: about 1 minute 30 seconds.

Schema checks answer whether the expected objects arrived. Do not forget
permissions, indexes and constraints. A table count alone can look good while
the target behaves very differently.

Data reconciliation starts with counts but should follow business boundaries.
Compare totals by date or customer, null distributions, key ranges and
referential integrity. Hashes can help where they are practical, but no single
checksum replaces understanding the data.

Behaviour is the golden-test layer from the previous slide. Performance compares
the baseline under a representative workload.

The final reveal is the habit I want people to remember: run the same validation
against source and target, then compare. Avoid writing one query for the source
and a conveniently different one for the target. Keep the evidence reproducible
so it can run again after another remediation or migration rehearsal.
-->

---
part: Prove
class: performance-slide
---

# Correct but ten times slower is still broken

<div class="perf-table">
  <div class="perf-row perf-head"><span></span><span>Before</span><span>After</span></div>
  <div class="perf-row"><strong>P50 query</strong><span>12 ms</span><span class="perf-good">10 ms</span></div>
  <div v-click="1" class="perf-row"><strong>P95 query</strong><span>80 ms</span><span>85 ms</span></div>
  <div v-click="2" class="perf-row"><strong>Checkout API</strong><span>180 ms</span><span class="perf-bad">1.8 s</span></div>
  <div v-click="3" class="perf-row"><strong>Peak throughput</strong><span>800/s</span><span class="perf-bad">310/s</span></div>
</div>

<div v-click="4" class="perf-verdict">A green functional test can still hide a failed migration.</div>

<p class="cite">Source: <a href="https://learn.microsoft.com/en-us/azure/azure-sql/migration-guides/database/sql-server-to-sql-database-guide?view=azuresql">Post-migration validation and performance testing</a></p>

<!--
Timing: about 1 minute.

Walk down the table. Median latency can improve while the tail and peak workload
get much worse. Users and batch processes usually notice the tail.

The numbers are illustrative. I would replace them with the project's own
service-level objectives and the baseline captured earlier. Also compare query
plans, waits, throttling and application retry behaviour when the aggregate
number changes.

A managed service has different resource boundaries and operational behaviour.
The old server may have hidden a poor query with excess memory or local storage.
The new target may expose that assumption. That does not automatically mean the
target is wrong. It means sizing and query behaviour need investigation.

The last line is the reason performance belongs in acceptance criteria. If the
only gate is "all tests pass", a functionally correct but unusable system can
reach production with a green pipeline.
-->

---
part: Cutover
class: cutover-slide
---

# A cutover needs a way forward and a way back

<div class="cutover-map">
  <div class="cutover-app">Applications</div>
  <div class="cutover-switch">
    <span class="switch-line switch-old"></span>
    <button class="switch-knob" aria-label="traffic switch"></button>
    <span class="switch-line switch-new"></span>
  </div>
  <div class="cutover-targets">
    <div class="cutover-db cutover-db-old"><span></span><b>Source</b><small>known state</small></div>
    <div v-click="1" class="cutover-db cutover-db-new"><span></span><b>Target</b><small>ready state</small></div>
  </div>
</div>

<div v-click="2" class="cutover-gates">
  <span>final sync</span><span>validation</span><span>traffic switch</span><span>health window</span>
</div>

<div v-click="3" class="rollback-rule">Write down the rollback trigger before the maintenance window.</div>

<!--
Timing: about 1 minute 30 seconds.

Cutover is a coordinated change to traffic, data authority and operations. The
source begins as the known system. The target must reach a defined ready state
before it receives production traffic.

Reveal the gates. Finish replication or the final copy. Run the agreed validation.
Switch applications and dependent jobs. Then hold a health window where the team
watches business metrics, errors, latency and data movement.

The rollback rule is deliberately written before the maintenance window. Under
pressure, teams can spend too long hoping a bad situation improves. Define who
can call rollback, what measurements trigger it and what happens to writes that
landed on the target.

Rollback gets harder after the new system accepts writes. That may require reverse
sync, replay or a business decision to continue forward. "Change the connection
string back" is not a complete rollback plan once data has diverged.
-->

---
part: After
class: after-equivalence-slide
---

# Establish equivalence. Then use the new platform

<div class="equivalence-bridge">
  <div class="equivalence-side">
    <p class="equivalence-label">Migration</p>
    <div class="equivalence-db"><span></span></div>
    <strong>Same business result</strong>
  </div>
  <div class="equivalence-divider"><span>then</span></div>
  <div v-click="1" class="equivalence-side equivalence-modernize">
    <p class="equivalence-label">Modernization</p>
    <div class="modernize-petals">
      <span>Identity</span><span>Network</span><span>HA/DR</span><span>Observability</span><span>Data model</span>
    </div>
  </div>
</div>

<div v-click="2" class="equivalence-note">Do not split a database simply because the project says "cloud".</div>

<p class="cite">Sources: <a href="https://learn.microsoft.com/en-us/azure/azure-sql/database/features-comparison?view=azuresql">Azure SQL feature comparison</a> · <a href="https://learn.microsoft.com/en-us/azure/azure-sql/migration-guides/database/sql-server-to-sql-database-guide?view=azuresql">Post-migration guidance</a></p>

<!--
Timing: about 1 minute 30 seconds.

Migration and modernization can overlap, but I like keeping two acceptance
ideas separate. First establish that the business system works on the target.
Then exploit the platform in further bounded changes.

Those changes may include managed identity, private connectivity, retention and
recovery policy, right-sizing, query tuning, better monitoring or a different
data model. Each deserves its own reason and verification.

The final click is a warning against architecture by fashion. Moving a large
shared database to Azure does not make it a microservice architecture. Splitting
it without stable ownership and domain boundaries can create distributed
transactions, duplicated data and a much harder operational problem.

If decomposition is valuable, do it incrementally around real application
boundaries. A database migration can create a safer place to start that work. It
does not need to finish every architectural ambition in the same release.
-->

---
part: AI
class: ai-role-slide
---

# AI can accelerate the change. It cannot supply the evidence

<div class="ai-process">
  <div class="ai-band">
    <img class="ai-copilot-icon" src="/assets/github-copilot.svg" alt="" />
    <strong>GitHub Copilot modernization</strong>
    <small>inspect · explain · remediate · generate · diagnose</small>
  </div>
  <div class="ai-steps">
    <span>Discover</span><span>Assess</span><span>Plan</span><span>Remediate</span><span>Validate</span>
  </div>
  <div v-click="1" class="ai-proof-band">
    <strong>Tests + telemetry + comparison</strong>
    <small>decide whether the result is acceptable</small>
  </div>
</div>

<div v-click="2" class="ai-warning">Faster change makes deterministic feedback more important.</div>

<p class="cite">Source: <a href="https://learn.microsoft.com/en-us/dotnet/azure/migration/appmod/overview">GitHub Copilot modernization documentation</a></p>

<!--
Timing: about 1 minute 30 seconds.

GitHub Copilot modernization fits throughout this process. It can find database
usage in a large codebase, explain old data-access code, identify provider and
authentication dependencies, propose changes, generate tests and help diagnose
failures. The current predefined tasks also cover managed-identity-based moves
to Azure SQL Database, Managed Instance and Azure PostgreSQL.

That is acceleration. It is not evidence that the migration preserved behaviour.
The model can also generate a convincing explanation for a wrong result.

Reveal the lower band. Tests, telemetry and direct comparison decide whether we
accept the change. This is the same gated loop the workshop uses for application
modernization, applied to the data layer.

The final click is my main AI point. When change becomes cheaper and faster, we
can produce more mistakes per hour too. Deterministic feedback, clear boundaries
and review become more valuable, not less.
-->

---
nofooter: true
layout: none
class: zend
---

<div class="zdark zdark-center db-closing">
  <p class="eyebrow">The working loop</p>
  <div class="closing-loop">
    <span>Assess</span><i>→</i><span>Baseline</span><i>→</i><span>Change one thing</span><i>→</i><span>Verify</span><i>↺</i>
  </div>
  <p class="zbig">Move only as fast as you can prove.</p>
</div>

<!--
Timing: about 45 seconds.

I would close by reading the loop once, then stop.

Assess the real system. Capture a known-good baseline. Make one bounded change.
Verify it against the evidence. Repeat until the system has moved and the old
infrastructure can be retired.

This is slower than a confident demo and much faster than debugging several
unknown changes during a production cutover.

If there is time for questions, the useful prompt is: which part of this loop is
currently weakest in your own systems? In many organizations it is discovery or
baseline, not the migration tool.
-->
