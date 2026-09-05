---
theme: zure
addons:
  - slidev-addon-shared-mermaid
title: Presentation title
titleTemplate: '%s · Zure'
author: Zure
info: |
  Add a short description of the presentation here.
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
exportFilename: presentation
fonts:
  provider: google
  sans: Inter
  mono: JetBrains Mono
  weights: '400,600,700'
seoMeta:
  ogTitle: Presentation title
  ogDescription: Add a short description of the presentation here.
---

<div class="zcover">
  <div class="zcover-text">
    <p class="eyebrow">Presentation eyebrow</p>
    <h1>Presentation<br />title</h1>
    <p class="zcover-sub">A concise subtitle that tells the audience what they will learn.</p>
    <p class="zcover-meta">Presenter · Occasion · Date</p>
  </div>
  <div class="zcover-art">
    <img src="/assets/cover-abstract.png" alt="Abstract geometric cover artwork" />
  </div>
</div>

<!--
Presenter notes live in HTML comments. Add the opening beat here.
-->

---
part: Introduction
---

# The presentation makes one clear argument

<div class="exhibit exhibit-wide">
<div>

<p class="col-label">The story</p>

1. Establish the situation and the audience's goal.
2. Present the evidence that changes the decision.
3. End with a concrete recommendation or next step.

</div>
<div>

<p class="col-label">Authoring principle</p>

Use a complete sentence for each slide title. Read together, the titles should
tell the whole story without the body copy.

<div class="sowhat mt-5">
One main idea per slide is usually enough.
</div>

</div>
</div>

<!--
Replace this slide with the agenda or narrative spine for the new presentation.
-->

---
nofooter: true
layout: none
class: zsection
---

<div class="zsplit">
  <div class="zsection-body">
    <p class="eyebrow">Part 01</p>
    <h1>Section title</h1>
    <p class="zsection-sub">Use a short sentence to explain what changes in this section.</p>
  </div>
  <div class="zsplit-art">
    <img src="/assets/cover-abstract.png" alt="Abstract geometric section artwork" />
  </div>
</div>

<!-- Duplicate this slide when the presentation needs a new chapter. -->

---
part: Section title
---

# Evidence on the left supports interpretation on the right

<div class="exhibit">
<div>

<p class="col-label">Evidence</p>

| Signal | What it shows |
| --- | --- |
| First observation | Add the relevant fact or result |
| Second observation | Add a useful comparison |
| Third observation | Add the implication |

</div>
<div>

<p class="col-label">Interpretation</p>

- Explain why the evidence matters.
- Make uncertainty explicit.
- Connect the finding to the audience's decision.

<div class="note mt-4">
Use this neutral callout for context, caveats, or instructions.
</div>

</div>
</div>

<!-- Add citations near the claims they support. -->

---
nofooter: true
layout: none
class: zend
---

<div class="zdark zdark-center">
  <p class="eyebrow">Takeaway</p>
  <p class="zbig">End on the sentence you want the audience to remember.</p>
  <p class="zdark-note">Add the decision, next step, or invitation for discussion.</p>
</div>

<!-- Keep the final slide useful when it remains on screen during discussion. -->
