---
theme: zure
title: App modernization lab
titleTemplate: '%s · Zure'
author: Pasi Huuhka
info: |
  A ten-minute introduction to the GitHub Copilot app modernization MicroHack.
  Three challenges, lab sign-in, local tools and lessons from the facilitator's run.
class: text-left
highlighter: shiki
lineNumbers: false
transition: none
aspectRatio: 16/9
canvasWidth: 1280
colorSchema: light
download: true
exportFilename: app-modernization-workshop-intro
fonts:
  provider: google
  sans: Inter
  mono: JetBrains Mono
  weights: '200,400,600,700,800'
---

<div class="zcover lab-cover">
  <div class="zcover-text">
    <p class="eyebrow">GitHub Copilot MicroHack</p>
    <h1>App modernization<br />lab</h1>
    <p class="zcover-sub">Workshop overview and setup</p>
    <p class="zcover-meta">Pasi Huuhka · Zure</p>
    <p class="intro-duration">10-minute workshop introduction</p>
  </div>
  <div class="lab-cover-art">
    <img src="/assets/cover-workshop.png" alt="An old brick workshop being renovated with new teal structural beams" />
  </div>
</div>

<!--
Timing: 0:00–0:15, 15 seconds.

I'm Pasi, and I'll get us started. This is an introduction to the lab, not a
ten-minute modernization demo. You'll do the work in the challenges.

We will build the agent setup, upgrade a .NET app and a Java app, and then
deploy them to Azure. First I'll show what each challenge asks for. Then we'll
get the right accounts and tools ready and cover the things that tripped me up.

Source for the lab scope:
https://github.com/microsoft/MicroHack/blob/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization/Readme.md
Cover artwork generated with Azure AI Foundry, not an architecture diagram.
-->

---
part: Today's agenda
class: lab-slide agenda-slide
---

<p class="eyebrow">Workshop schedule</p>

# Today's agenda

<div class="agenda-layout">
  <div class="agenda-list">
    <div class="agenda-item"><time>09:00–09:30</time><strong>Breakfast &amp; welcome</strong></div>
    <div class="agenda-item"><time>09:30–12:00</time><strong>Hack challenges</strong></div>
    <div class="agenda-item agenda-break"><time>12:00–13:00</time><strong>Lunch &amp; networking</strong></div>
    <div class="agenda-item"><time>13:30–15:30</time><strong>Hack challenges</strong></div>
    <div class="agenda-item"><time>15:30–16:00</time><strong>Wrap-up &amp; Q&amp;A</strong></div>
  </div>
  <aside class="agenda-rhythm">
    <div><span>While agents run</span><strong>Short talks between hands-on work.</strong></div>
    <div><span>Solution walkthroughs</span><strong>Compare approaches and work through key answers together.</strong></div>
  </aside>
</div>

<!--
Timing: 0:30–1:00, 30 seconds.

This is a working agenda, not a promise that every agent run will take the
same time. Start with breakfast and welcome, then use the morning and
afternoon for the challenges. Lunch begins at 12:00 and the afternoon
challenge block starts at 13:30. We close together at 15:30.

Help participants as questions come up during the challenges.
If several people are waiting for agents or deployments, use that time for a
short presentation or a walkthrough of a solution. Do not let a long-running
agent make the room feel stalled.
-->

---
part: Meet Pasi
layout: none
class: speaker-intro-slide
nofooter: true
---

<div class="speaker-intro">
  <section class="speaker-identity">
    <p class="speaker-kicker">Your workshop host · Zure</p>
    <h1>Pasi<br />Huuhka<span>.</span></h1>
    <div class="speaker-focus">
      <span class="speaker-kicker">What I work on</span>
      <p>AI app dev<br /><span>&amp; SRE</span></p>
    </div>
  </section>
  <section class="speaker-experience" aria-label="Experience and community">
    <div class="speaker-stat">
      <div class="speaker-number">13<span>years</span></div>
      <p>Working on<br /><strong>Azure</strong></p>
    </div>
    <div class="speaker-stat">
      <div class="speaker-number">6<span>years</span></div>
      <p>Microsoft<br /><strong>Foundry &amp; DevOps MVP</strong></p>
    </div>
    <div class="speaker-stat">
      <div class="speaker-number">~7<span>years</span></div>
      <p>Organizing the<br /><strong>Finland Azure<br />User Group</strong></p>
    </div>
  </section>
</div>

<!--
Allow about 30 seconds for the speaker introduction.

I'm Pasi Huuhka from Zure. I've worked on Azure for 13 years and have been
a Microsoft MVP for six, now in Microsoft Foundry and DevOps.
My focus is AI application development and site reliability engineering.

I've also helped organize the Finland Azure User Group for roughly seven
years. That community connection is a good excuse for one quick announcement.

The experience figures and MVP wording are Pasi's supplied biography.
Keep the slide static so the introduction does not need extra clicks.
-->

---
part: IglooConf 2027
layout: none
class: igloo-promo-slide
nofooter: true
---

<div class="igloo-promo">
  <header class="igloo-heading">
    <div>
      <p class="igloo-kicker">Finland Azure User Group presents</p>
      <h1>IglooConf<span>27</span></h1>
    </div>
    <div class="igloo-date">
      <strong>4 &amp; 5 February 2027</strong>
      <span>Scandic Park Helsinki</span>
      <span>2 days · 2 tracks · All Azure</span>
    </div>
  </header>
  <p class="igloo-speaker-rule">Every speaker is an <strong>MVP</strong>, <strong>Regional Director</strong> or <strong>Microsoft product group member</strong>.</p>
  <section class="igloo-lineup" aria-label="All seven announced speakers for 2027">
    <p class="igloo-kicker">Announced for 2027 · More to come</p>
    <div class="igloo-speakers">
      <figure>
        <img src="/assets/iglooconf-2027/richard-campbell.png" alt="Richard Campbell" />
        <figcaption>Richard<br />Campbell</figcaption>
      </figure>
      <figure>
        <img src="/assets/iglooconf-2027/paula-januszkiewicz.jpg" alt="Paula Januszkiewicz" />
        <figcaption>Paula<br />Januszkiewicz</figcaption>
      </figure>
      <figure>
        <img src="/assets/iglooconf-2027/david-whitney.jpg" alt="David Whitney" />
        <figcaption>David<br />Whitney</figcaption>
      </figure>
      <figure>
        <img src="/assets/iglooconf-2027/sami-laiho.jpg" alt="Sami Laiho" />
        <figcaption>Sami<br />Laiho</figcaption>
      </figure>
      <figure>
        <img src="/assets/iglooconf-2027/jouni-heikniemi.jpg" alt="Jouni Heikniemi" />
        <figcaption>Jouni<br />Heikniemi</figcaption>
      </figure>
      <figure>
        <img src="/assets/iglooconf-2027/rik-hepworth.jpg" alt="Rik Hepworth" />
        <figcaption>Rik<br />Hepworth</figcaption>
      </figure>
      <figure>
        <img src="/assets/iglooconf-2027/sakari-nahi.png" alt="Sakari Nahi" />
        <figcaption>Sakari<br />Nahi</figcaption>
      </figure>
    </div>
  </section>
  <a class="igloo-ticket" href="https://www.iglooconf.fi/#tickets" target="_blank" rel="noopener noreferrer">
    <span class="igloo-ticket-status">Tickets<br />on sale now</span>
    <span class="igloo-ticket-url">www.iglooconf.fi</span>
    <span class="igloo-ticket-arrow" aria-hidden="true">↗</span>
  </a>
  <div class="igloo-sponsors" aria-label="IglooConf 2027 sponsors">
    <span>Sponsors</span>
    <img src="/assets/iglooconf-2027/sponsors/knowit.png" alt="Knowit" />
    <img src="/assets/iglooconf-2027/sponsors/arrow.png" alt="Arrow" />
    <img src="/assets/iglooconf-2027/sponsors/nordcloud.png" alt="Nordcloud, an IBM company" />
    <img src="/assets/iglooconf-2027/sponsors/zure.svg" alt="Zure" />
  </div>
</div>

<!--
Allow about 30 seconds for this announcement.

A quick plug for IglooConf, organized by the Finland Azure User Group.
For my money, it's the best Azure event in Finland. Tickets have just gone
on sale. The upcoming event is February 4 and 5, 2027, at Scandic Park Helsinki.

The 2027 site already confirms Richard Campbell, Paula Januszkiewicz,
David Whitney and Sami Laiho. Jouni Heikniemi, Rik Hepworth and Sakari Nahi
are also confirmed. More speakers and the programme are still to come.

Every speaker is a Microsoft MVP, Microsoft Regional Director or member
of a Microsoft product group. Two days, two tracks, technical talks.

Invite people to visit www.iglooconf.fi for tickets and the growing lineup.
The large address is clickable. Keep the slide static for a short announcement.

The slide includes all seven speakers announced as of September 10, 2026.
Portraits come from their speaker cards on the official 2027 event site.
The sponsor strip uses the site's logos for Knowit, Arrow, Nordcloud and Zure.
References stay in these notes, not in a visible source footer.

Official sources for the announced lineup, portraits, sponsors and tickets:
https://www.iglooconf.fi/
https://www.iglooconf.fi/#speakers
https://www.iglooconf.fi/#tickets
https://www.iglooconf.fi/#sponsors
-->

---
layout: none
class: links-only-slide
nofooter: true
---

<div class="links-only">
  <div>zure.ly/hack-links</div>
  <img src="/assets/hack-links-qr.svg" alt="QR code for https://zure.ly/hack-links" />
</div>

<!--
Timing: 0:15–0:30, 15 seconds.

Invite everyone to open https://zure.ly/hack-links or scan the QR code.
The site has Intro, Install, Login, and Walkthroughs & tips steps.
Leave this slide up while people open it. They can use the site throughout the lab.
-->

---
part: Challenge 1
class: lab-slide
clicks: 1
---

<p class="eyebrow">Challenge 1 · Build the foundation</p>

# Give the agent instructions and tools

<div class="foundation-grid">
  <div class="foundation-card">
    <span class="artifact-type">Custom agent</span>
    <h2>The workflow</h2>
    <div class="file-exhibit"><span>.github / agents</span><code>*.agent.md</code></div>
    <p>Phases, approval gates<br />and allowed tools</p>
  </div>
  <div class="foundation-card">
    <span class="artifact-type">Skill</span>
    <h2>The migration rules</h2>
    <div class="file-exhibit"><span>.github / skills / …</span><code>SKILL.md</code></div>
    <p>When to use it<br />and what to check</p>
  </div>
  <div class="foundation-card">
    <span class="artifact-type">MCP</span>
    <h2>The tool connections</h2>
    <div class="file-exhibit"><span>.vscode</span><code>mcp.json</code></div>
    <p>Configure servers.<br />Check the tool picker.</p>
  </div>
</div>

<div v-click="1" class="gated-loop">
  <span>Assess</span><b>→</b><span>Review plan</span><b>→</b><span>Execute</span><b>→</b><span>Validate</span>
  <small>You approve the plan before changes begin.</small>
</div>


<!--
Timing: 0:30–1:30, 1 minute.

You do not need to write everything from scratch. The challenge supplies
templates and .NET and Java reference versions. Replace the placeholders.

The agent file describes the phased workflow and tool access. The skill holds
the migration rules and checks. MCP connects tools. These are the lab's
practical starting points, not hard boundaries between all agent products.

Click 1. Keep the assess, plan, execute, validate loop. Read the assessment,
review the plan, then let the agent act. Check the result yourself.

For MCP, use "MCP: List Servers" in VS Code. The appmod tool families come from
the app modernization extensions, not from adding an appmod entry to mcp.json.
Install the GitHub Copilot modernization extension for this lab. The current
extension supports both .NET and Java.

Source:
https://github.com/microsoft/MicroHack/blob/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization/challenges/challenge-01.md
https://github.com/microsoft/MicroHack/blob/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization/walkthrough/challenge-01/solution-01.md
-->

---
part: Challenge 2
class: lab-slide
clicks: 2
---

<p class="eyebrow">Challenge 2 · Upgrade the applications</p>

# Assess together. Upgrade separately.

<div class="upgrade-map">
  <div class="app-pair">
    <div><span>PhotoAlbum</span><strong>.NET</strong></div>
    <div><span>PhotoAlbum-Java</span><strong>Java / Spring Boot</strong></div>
  </div>
  <div class="pair-connectors"><span>↓</span><span>↓</span></div>
  <div class="batch-assessment">
    <strong>One batch assessment</strong>
    <span>Upgrade + cloud readiness · Full analysis · Run locally</span>
  </div>
  <div v-click="1" class="upgrade-results">
    <div><span>↓ Upgrade .NET app</span><strong>.NET 10</strong></div>
    <div><span>↓ Upgrade Java app</span><strong>Java 25 · Spring Boot 4.0</strong></div>
  </div>
  <div v-click="2" class="completion-bar">Review the changes · Check builds and tests · Commit and push both repos</div>
</div>


<!--
Timing: 1:30–2:45, 1 minute 15 seconds.

The two sample applications are PhotoAlbum and PhotoAlbum-Java. Work in your
own copies, not the upstream sample repositories. I'll show a fork workaround
later if GitHub returns a 404.

Create the repositories config and assess both apps together. Select Upgrade
and Cloud readiness, Full analysis, and local execution. Read the aggregate
report and each application's report. The reports explain the suggested work.

Click 1. The lab requires separate upgrades because the two apps use different
languages. Run modernize from each app's directory. These are the lab's stated
targets, not a claim about the newest releases on the day of the workshop.
Have the required SDKs available and follow the current assessment guidance.

Click 2. Do not stop at a green agent summary. Inspect the changes and the build
or test evidence. Commit and push both applications before challenge 3.
The assessment and upgrades can take several minutes.

Source:
https://github.com/microsoft/MicroHack/blob/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization/challenges/challenge-02.md
https://github.com/microsoft/MicroHack/blob/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization/walkthrough/challenge-02/solution-02.md
-->

---
part: Challenge 3
class: lab-slide
clicks: 1
---

<p class="eyebrow">Challenge 3 · Modernize and deploy</p>

# Finish with two working apps in Azure

<div class="deployment-map">
  <div class="plan-exhibit">
    <span class="artifact-type">One cloud modernization plan</span>
    <h2>The upgrades are already done.</h2>
    <p>Fix cloud readiness.<br />Provision infrastructure.<br />Deploy both applications.</p>
    <div class="plan-review">Review the plan and merge its PR.</div>
  </div>
  <div class="deploy-arrow">→</div>
  <div class="azure-exhibit">
    <span class="artifact-type">Azure Container Apps</span>
    <div class="deployed-app"><strong>PhotoAlbum-Java</strong><span>Resources + frontend</span></div>
    <div class="deployed-app"><strong>PhotoAlbum</strong><span>Resources + frontend</span></div>
    <div v-click="1" class="validation-result">Open both frontend URLs.<br /><strong>Check that the apps work.</strong></div>
  </div>
</div>


<!--
Timing: 2:45–4:00, 1 minute 15 seconds.

Tell the planner that the runtime upgrades are complete. Otherwise it can
repeat recommendations from the earlier assessment. Focus this plan on cloud
readiness, Azure infrastructure and deployment for both apps. If an Oracle
dependency exists, the lab asks you to migrate it to PostgreSQL.

Review and merge the plan pull request. Pull the plan into each local app repo
and execute it. Check the branch and plan path in the generated output.

The walkthrough has a useful warning: a plan can finish without provisioning
or deploying the .NET app. If that happens, create a second explicit plan:
"Provision Azure resources and deploy the app." Then review and execute it.

Click 1. An agent saying "done" is not the success criterion. Check the Azure
resources and open each frontend. Both applications should run.

Plan generation and execution may each take 15 to 20 minutes. The ten minutes
on the cover is the intro length, not the lab duration.

Source:
https://github.com/microsoft/MicroHack/blob/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization/challenges/challenge-03.md
https://github.com/microsoft/MicroHack/blob/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization/walkthrough/challenge-03/solution-03.md
-->

---
part: Lab credentials
class: lab-slide credentials-slide
clicks: 1
---

<p class="eyebrow">Before you start</p>

# Start with your lab credentials

<div class="setup-grid">
  <div class="setup-reference">
    <p class="credentials-caption">MicroHack → Credentials <span>Example values</span></p>
    <img class="credentials-image" src="/assets/credentials-example.png" alt="MicroHack Credentials example showing Entra ID TAP, Entra ID Username and Github SSO Login User. All values are placeholders." />
    <div class="credentials-reminder"><strong>emea.microhack.cloud/login</strong><p>Sign in with the credentials you are given.<br />Lab materials + Credentials are inside.</p></div>
  </div>
  <div class="sign-in-flow">
    <div class="sign-in-step">
      <span class="step-number">1</span>
      <div><h2>github.com → Sign in</h2><p>Enter <strong>Github SSO Login User</strong><br />from the Credentials tab.</p></div>
    </div>
    <div class="sign-in-step">
      <span class="step-number">2</span>
      <div><h2>Continue through Entra SSO</h2><p>Use <strong>Entra ID Username</strong> + <strong>TAP</strong><br />on the Microsoft sign-in page.</p></div>
    </div>
    <div v-click="1" class="azure-sign-in">
      <h2>Azure uses the Entra identity too</h2>
      <p><strong>portal.azure.com</strong><br />Select the lab subscription.</p>
      <span>Subscription and resource group are in the same Credentials tab.</span>
    </div>
  </div>
</div>


<!--
Timing: 4:00–5:30, 1 minute 30 seconds.

First send participants to https://emea.microhack.cloud/login. They will be
provided with credentials to log in to that portal. Their lab materials and
the Credentials tab are inside. Those portal login credentials are the entry
point; the Credentials tab then supplies the GitHub and Entra lab identities.
Ask participants to open that tab and keep it available.
The screenshot is cropped to the three relevant fields, with enlarged labels
and placeholder values. They must use their own values, not this slide.
All account details are in that same tab. Lower down, the original page also
has the portal URL, resource group and subscription ID.

Start with a separate browser profile or private window to avoid your personal
GitHub account being selected. At github.com, enter the value labelled
"Github SSO Login User". Follow the organization's SSO redirect. On the
Microsoft Entra page, use "Entra ID Username" and its Temporary Access Pass.
The TAP is for the Entra sign-in flow, not a GitHub password or an API token.
Follow any first-sign-in prompts. Ask a facilitator if the TAP has expired.

Click 1. Azure authentication is separate from GitHub authentication. Use the
lab Entra identity at portal.azure.com. Select the lab subscription from the
Credentials tab, not a personal one. Ask a facilitator about access or
subscription problems; do not put passwords or TAPs into agent prompts.

The lab-specific SSO sequence comes from Pasi's facilitator notes and the
supplied MicroHack credentials example.
-->

---
part: Local setup
class: lab-slide tools-slide
clicks: 1
---

<p class="eyebrow">Setup · zure.ly/hack-links</p>

# Get the local tools ready

<div class="tools-grid">
  <div class="install-list">
    <div class="install-group">
      <h2>Editor</h2>
      <p>VS Code + GitHub Copilot</p>
      <span>GitHub Copilot modernization extension</span>
    </div>
    <div class="install-group">
      <h2>Command line</h2>
      <p>Git · GitHub CLI <code>gh</code><br />Copilot CLI <code>copilot</code> · <code>modernize</code></p>
    </div>
    <div class="install-group">
      <h2>Build and deploy</h2>
      <p>.NET SDK · Azure CLI <code>az</code></p>
    </div>
    <div class="install-group optional-tools">
      <h2>Install when the task needs them</h2>
      <p>JDK + Maven · Docker · <code>azd</code></p>
    </div>
  </div>
  <div class="client-sign-in">
    <h2>Sign in to each client</h2>
    <div class="auth-client"><span>VS Code / Copilot</span><strong>Sign in with GitHub</strong></div>
    <div class="auth-client"><span>GitHub CLI</span><code>gh auth login</code></div>
    <div class="auth-client"><span>Copilot CLI</span><code>copilot → /login</code></div>
    <div class="auth-client azure-auth-client"><span>Azure CLI · <strong>Entra account</strong></span><code>az login</code></div>
    <div v-click="1" class="check-account">
      <strong>Check the lab identity and subscription.</strong>
      <p><code>gh auth status</code> · <code>az account show</code><br />Select your lab subscription before deploying.</p>
    </div>
  </div>
</div>


<!--
Timing: 5:30–7:00, 1 minute 30 seconds.

Open zure.ly/hack-links for the official install pages and lab materials.
Start with the editor, Copilot and modernization extension, Git, GitHub CLI,
Copilot CLI, modernize, .NET SDK and Azure CLI. The modernize CLI is a separate
installation from GitHub CLI and Copilot CLI.

Install other tools when the assessment, build or deployment task needs them.
JDK and Maven are for Java builds; azd is only needed for deployment workflows
that use it. Install and start Docker if the task requires local containers.
The lab's upgrade targets are .NET 10 and JDK 25. Use the SDK version requested
by each project; the starting apps may need earlier SDKs too. If a tool install
or MCP server needs Node.js or PowerShell, follow that tool's prerequisites.
Reopen the terminal after installation so new commands are on PATH.

During my run, signing in to one client did not leave every other
client usable. I did not isolate the exact cause. My practical instruction is
to sign in separately in VS Code, GitHub CLI and Copilot CLI, with the same
lab GitHub identity. Use "gh auth login", choose GitHub.com and browser login,
then complete the device authorization. In Copilot CLI, use "/login".
Do not assume that a browser session means every CLI is authenticated.

Click 1. Check "gh auth status" and the account displayed in Copilot.
Launch "modernize" after gh authentication and confirm the expected account.
If a client already uses a personal account, switch to the lab account.
No need to authenticate every client again if it already shows the correct one.

Sign in to Azure CLI with "az login", using the lab Entra username and TAP in
the Microsoft browser sign-in flow. This is not the GitHub SSO username.
Choose the lab tenant and subscription when prompted. Check "az account show".
If needed, run "az account set --subscription <LAB-SUBSCRIPTION-ID>", using the
subscription ID in the Credentials tab. If the generated deployment uses Azure
Developer CLI, also run "azd auth login" with the same lab Entra identity.

Don't wait here for every install to finish. Invite anyone blocked on sign-in
to get help while the others begin challenge 1.

Sources:
https://github.com/microsoft/MicroHack/blob/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization/Readme.md
https://learn.microsoft.com/azure/developer/github-copilot-app-modernization/modernization-agent/quickstart
https://cli.github.com/manual/gh_auth_login
https://cli.github.com/manual/gh_auth_status
https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli
https://learn.microsoft.com/cli/azure/authenticate-azure-cli-interactively
https://learn.microsoft.com/cli/azure/manage-azure-subscriptions-azure-cli
The multi-client workaround comes from Pasi's facilitator notes.
-->

---
part: Lab tips
class: lab-slide
clicks: 1
---

<p class="eyebrow">What tripped me up · Links and repositories</p>

# If you hit a 404, keep moving

<div class="walkthrough-rescue">
  <div><h2>Walkthrough link fails?</h2><p>Open Walkthroughs &amp; tips on the site.</p></div>
  <div class="short-url">zure.ly/hack-links</div>
</div>

<div class="fork-rescue">
  <h2>Sample repo won't fork?</h2>
  <div class="repo-route">
    <div><span>1</span><strong>Clone the sample</strong><small>Keep its Git history.</small></div>
    <b>→</b>
    <div><span>2</span><strong>Create your repo</strong><small>Empty repo in your lab account.</small></div>
    <b>→</b>
    <div><span>3</span><strong>Point origin to it</strong><small>Then push your branch.</small></div>
  </div>
  <div v-click="1" class="remote-command">
    <code>git remote set-url origin &lt;YOUR-REPO-URL&gt;</code>
    <p>Check <code>git remote -v</code> before pushing. Repeat for both samples.</p>
  </div>
</div>


<!--
Timing: 7:00–8:15, 1 minute 15 seconds.

These are problems I hit in my run, not a claim that they happen to everyone.

Some "view walkthrough" or solution links returned 404 for participants.
Use zure.ly/hack-links. Read the walkthrough when the challenge is too terse.
You are here to practise modernization, not guess the author's next step.
The links page includes the walkthrough directory and each solution. If one is
inaccessible in the lab account, ask a facilitator rather than retrying.

Forking the sample also returned 404 in my run. First check that you are using
the lab account. If cloning the public sample works, use this fallback.
Create an empty destination repository where the lab account can push. Do not
initialize it with a README or license. If the managed account cannot create a
repository, ask a facilitator for an approved destination. Don't use a personal
account to work around lab access restrictions.

Click 1. In the cloned repo, change origin to your new repository, check it and
push the current branch. In the command, replace the whole placeholder,
including angle brackets, with your repo's actual URL.

Example commands for the .NET app:
git clone https://github.com/Azure-Samples/PhotoAlbum.git
cd PhotoAlbum
git remote set-url origin <YOUR-REPO-URL>
git remote -v
git push -u origin HEAD

Repeat with PhotoAlbum-Java. Use the actual repositories and branch names in
the modernize repositories config. You can ask Copilot to do the clone,
repository setup and remote update, but approve the destination before it
pushes. Never push to Azure-Samples.

Sources:
https://github.com/microsoft/MicroHack/tree/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization/walkthrough
https://docs.github.com/en/get-started/git-basics/managing-remote-repositories
-->

---
part: Lab tips
class: lab-slide
clicks: 1
---

<p class="eyebrow">What tripped me up · Azure deployment</p>

# Put the lab's policies in the prompt

<div class="policy-context">
  <div class="policy-failure"><span>My deployment blocker</span><strong>Subscription policies<br />required VNet configuration.</strong></div>
  <div class="policy-response"><span>Before you select Execute</span><strong>Add the constraints<br />to the plan's instructions.</strong></div>
</div>

<div class="prompt-exhibit">
  <span class="artifact-type">A more useful instruction than "try again"</span>
  <blockquote>
    Check the target subscription's policies. Update the deployment files
    to meet the required networking rules. Validate before retrying.
    Do not disable policies. Ask me if permissions block the fix.
  </blockquote>
</div>

<div v-click="1" class="lab-start">
  <span>Read the error → Fix the deployment files → Validate → Retry</span>
  <strong>Start with challenge 1. Ask early if you're blocked.</strong>
</div>


<!--
Timing: 8:15–10:00, 1 minute 45 seconds.

The modernize CLI repeatedly failed during deployment in my run. The
subscription had enforced virtual-network policies that the generated
deployment files did not satisfy. A plan can look reasonable and still be
wrong for the target subscription.

When the CLI lets you add instructions before executing the plan, make those
constraints explicit. This prompt is an example, not a guarantee. Add the
actual denial message and policy name once you have them. The original tip
was to tell the model to change deployment files to satisfy the policies.
"Make no mistakes" does not provide useful technical constraints.

If it fails, inspect the deployment error, identify the denied resource and
policy assignment, and let the agent propose a targeted infrastructure change.
Don't guess the required network topology from a generic VNet error. Don't
disable policy, change subscriptions or grant broad access just to get green.
If the agent cannot read the policy, ask a facilitator for the relevant rules.

Click 1. Review the changed deployment files and validate them before another
deployment attempt. Copilot CLI can help diagnose failures, but a confident
answer is not validation. Check the actual resources and both frontends after
deployment, as in challenge 3.

Close by pointing people back to challenge 1. Keep the solutions address
available in workshop chat as well as on the previous slide. Ask participants
to raise a hand early for account, repository-permission or policy blockers.

Sources:
https://learn.microsoft.com/azure/azure-resource-manager/troubleshooting/error-policy-requestdisallowedbypolicy
https://github.com/microsoft/MicroHack/blob/main/03-Azure/01-01-App%20Innovation/03_GHCPAppModernization/challenges/challenge-03.md
-->
