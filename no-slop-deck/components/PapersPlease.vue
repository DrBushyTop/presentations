<!--
  Speaker intro in the style of Papers, Please (Lucas Pope, 2013). The
  inspector checks Pasi's documents, then stamps the passport.
  0 papers, please · 1 purpose of visit, the photo matches · 2 the MVP permit,
  the names match · 3 ENTRY GRANTED
  Facts: AI architect at Zure (Pasi), Azure since 2014 (Pasi), 150+
  customers (Sessionize bio), Microsoft MVP since 2020 in DevTech and Foundry
  (Pasi, LinkedIn). Both portraits are generated from his own recent photo:
  the booth face as he is now, the passport photo straight on and printed.
  The sprites use 72x72 pixels and 9 colours for the booth, 48x48 pixels
  and 5 colours for the passport, enlarged with nearest-neighbour scaling.
  Overview and print show the final, stamped state without motion.
-->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useIsActive } from '../lib/active'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const stampPatternId = `pp-stamp-${useId()}`
const { $renderContext } = useSlideContext()
const still = computed(() => !['slide', 'presenter'].includes($renderContext.value as string))
const s = computed(() => (still.value ? 3 : props.step))

const lines = [
  { at: 0, who: 'Inspector', t: 'Papers, please.' },
  { at: 1, who: 'Inspector', t: 'Purpose of visit?' },
  { at: 1, who: 'Pasi', t: 'A talk. DevOps & dev to AI.' },
  { at: 2, who: 'Inspector', t: 'MVP in what?' },
  { at: 2, who: 'Pasi', t: 'DevOps and AI. Both.' },
  { at: 3, who: 'Inspector', t: 'Welcome to ESPC.' },
]

// Inspection lines join the facing edges of the highlighted fields.
const root = ref<HTMLElement>()
const face = ref<HTMLElement>()
const photo = ref<HTMLElement>()
const nameA = ref<HTMLElement>()
const nameB = ref<HTMLElement>()
const links = ref<{ photo: number[], name: number[] }>({ photo: [], name: [] })
function edge(el: HTMLElement | undefined, side: 'left' | 'right') {
  if (!root.value || !el) return [0, 0]
  const box = root.value.getBoundingClientRect()
  const k = root.value.offsetWidth / box.width
  const r = el.getBoundingClientRect()
  const style = getComputedStyle(el)
  const outline = parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth) / 2
  const angle = (parseFloat(style.getPropertyValue('--angle')) || 0) * Math.PI / 180
  const distance = (side === 'right' ? 1 : -1) * (el.offsetWidth / 2 + outline)
  return [
    (r.left + r.width / 2 - box.left) * k + distance * Math.cos(angle),
    (r.top + r.height / 2 - box.top) * k + distance * Math.sin(angle),
  ]
}
async function measure() {
  await nextTick()
  if (!root.value?.getBoundingClientRect().width) return
  links.value = { photo: [...edge(face.value, 'right'), ...edge(photo.value, 'left')], name: [...edge(nameA.value, 'right'), ...edge(nameB.value, 'left')] }
}
function inspectionPath(points: number[], turnX?: number) {
  const [x1, y1, x2, y2] = points
  const x = turnX ?? Math.round((x1 + x2) / 8) * 4
  return `M ${x1} ${y1} H ${x} V ${y2} H ${x2}`
}
let resizeObserver: ResizeObserver | undefined
onMounted(() => {
  resizeObserver = new ResizeObserver(measure)
  if (root.value) resizeObserver.observe(root.value)
  measure()
  setTimeout(measure, 600)
})
onBeforeUnmount(() => resizeObserver?.disconnect())
watch(() => props.step, () => { measure(); setTimeout(measure, 250) })
const active = useIsActive()
watch(active, (on) => { if (on) setTimeout(measure, 700) })
</script>

<template>
  <div ref="root" class="pp" :class="[`s${s}`, { still }]">
    <header class="top">
      <b>Checkpoint · ESPC 2026</b>
      <div class="queue" aria-hidden="true"><i v-for="n in 18" :key="n" :style="{ '--n': n }" /></div>
      <span>Day 1</span>
    </header>

    <section class="booth">
      <div ref="face" class="window" :class="{ inspect: s === 1 }">
        <img src="/pasi-pixel-papers-please.png" alt="Pixel portrait of Pasi Huuhka">
      </div>
      <ol class="transcript">
        <li v-for="(l, i) in lines" :key="i" :class="{ on: s >= l.at, them: l.who === 'Pasi' }">
          <b>{{ l.who }}</b><span>{{ l.t }}</span>
        </li>
      </ol>
    </section>

    <section class="desk">
      <article class="doc passport">
        <header class="ph"><div>Republic of Azure<small>Passport</small></div><span class="seal" aria-hidden="true">
          <svg viewBox="0 0 12 12"><path d="M3 0h6v1h2v2h1v6h-1v2H9v1H3v-1H1V9H0V3h1V1h2Z M3 1v1H2v1H1v6h1v1h1v1h6v-1h1V9h1V3h-1V2H9V1Z" fill="currentColor" fill-rule="evenodd" /></svg>
          <span>AZ</span>
        </span></header>
        <div class="id">
          <div ref="photo" class="photo" :class="{ inspect: s === 1 }"><img src="/pasi-passport-papers-please.png" alt="Passport portrait of Pasi Huuhka"></div>
          <dl>
            <dt>Name</dt>
            <dd ref="nameA" :class="{ inspect: s === 2 }">Huuhka, Pasi</dd>
            <dt>Role</dt>
            <dd>AI architect</dd>
            <dt>Employer</dt>
            <dd>Zure</dd>
          </dl>
        </div>
        <div class="fields">
          <div class="f"><dt>Passport no.</dt><dd>NSE-0482</dd></div>
          <div class="f"><dt>Issued</dt><dd>2026</dd></div>
          <div class="f"><dt>Azure since</dt><dd class="big">2014</dd></div>
          <div class="f"><dt>Career</dt><dd>DevOps &amp; dev<br>to AI</dd></div>
          <div class="f"><dt>Destination</dt><dd>ESPC 2026</dd></div>
          <div class="f"><dt>Entry type</dt><dd>Speaker</dd></div>
        </div>
        <div class="mrz" aria-label="Machine-readable zone">
          <div>P&lt;AZRHUUHKA&lt;&lt;PASI&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
          <div>NSE0482&lt;&lt;2026&lt;&lt;AZURE2014&lt;&lt;ESPC2026&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
        </div>
        <div class="stamp" role="img" aria-label="Entry granted for ESPC 2026">
          <svg viewBox="0 0 72 28" aria-hidden="true">
            <defs>
              <pattern :id="stampPatternId" width="2" height="2" patternUnits="userSpaceOnUse">
                <path d="M0 0h1v1H0Z M1 1h1v1H1Z" fill="currentColor" />
              </pattern>
            </defs>
            <path d="M0 0h72v28H0Z M2 2v24h68V2Z" :fill="`url(#${stampPatternId})`" fill-rule="evenodd" />
            <path d="M0 0h6v1H1v5H0Z M66 0h6v6h-1V1h-5Z M0 22h1v5h5v1H0Z M71 22h1v6h-6v-1h5Z" fill="currentColor" />
            <path d="M3 9H52 M53 2V26" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1 1" />
            <path d="M56 8h2v2h3V8h3v2h3V8h2v11h-1v2h-2v2h-2v2h-3v-1h-2v-2h-2v-3h-1Z M59 20h2v-2h2v-2h2v-2h2v-3h-2v2h-2v2h-2v2h-2Z" fill="currentColor" fill-rule="evenodd" />
          </svg>
          <span class="stamp-date">ESPC 2026</span>
          <span class="stamp-verdict"><span>Entry</span><span>Granted</span></span>
        </div>
      </article>

      <article class="doc record" :class="{ on: s >= 1 }">
        <header>Work record</header>
        <ul>
          <li>DevOps &amp; dev to AI</li>
          <li>AI dev tooling for orgs</li>
          <li>AI in every project for years</li>
          <li><b>150+</b> customers</li>
        </ul>
      </article>

      <article class="doc permit" :class="{ on: s >= 2 }">
        <header>Microsoft MVP · Entry permit</header>
        <dl>
          <dt>Name</dt><dd ref="nameB" :class="{ inspect: s === 2 }">Huuhka, Pasi</dd>
          <dt>Since</dt><dd>2020</dd>
        </dl>
        <div class="cats">
          <div><small>Category 1</small><b>Dev Tech</b><span>DevOps</span></div>
          <div><small>Category 2</small><b>Foundry</b><span>AI</span></div>
        </div>
      </article>
    </section>

    <svg class="links" viewBox="0 0 1280 720" aria-hidden="true">
      <g :class="{ on: s === 1 }">
        <path v-if="links.photo.length" :d="inspectionPath(links.photo)" />
        <text v-if="links.photo.length" :x="(links.photo[0] + links.photo[2]) / 2" :y="(links.photo[1] + links.photo[3]) / 2 - 12" text-anchor="middle">Match</text>
      </g>
      <g :class="{ on: s === 2 }">
        <path v-if="links.name.length" :d="inspectionPath(links.name, 848)" />
        <text v-if="links.name.length" x="848" :y="(links.name[1] + links.name[3]) / 2 - 12" text-anchor="middle">Match</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
@font-face {
  font-family: 'PP Label';
  src: url('/fonts/silkscreen-400.woff2') format('woff2');
  font-weight: 400;
}

@font-face {
  font-family: 'PP Label';
  src: url('/fonts/silkscreen-700.woff2') format('woff2');
  font-weight: 700;
}

@font-face {
  font-family: 'PP Type';
  src: url('/fonts/vt323.woff2') format('woff2');
}

.pp {
  --paper: #e6dbb9;
  --ink: #3a3127;
  --red: #c0392b;
  --green: #526b2a;
  position: absolute;
  inset: 0;
  z-index: 20;
  background: #2c2a24;
  font-family: 'PP Type', monospace;
  color: var(--ink);
  overflow: hidden;
}

/* ---------- Top: the checkpoint and the queue ---------- */

.top {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 0 28px;
  background: #3a3a30;
  border-bottom: 4px solid #23241d;
  font-family: 'PP Label', monospace;
  font-size: 18px;
  text-transform: uppercase;
  color: #d9cfae;
}

.queue {
  flex: 1;
  display: flex;
  gap: 14px;
  justify-content: flex-end;
}

.queue i {
  width: 10px;
  height: 22px;
  background: linear-gradient(#8c8a76 0 8px, #5d5c4c 8px);
  opacity: calc(1 - var(--n) * 0.04);
}

/* ---------- Booth ---------- */

.booth {
  position: absolute;
  left: 0;
  top: 60px;
  bottom: 0;
  width: 430px;
  padding: 26px 30px;
  background: #3d3f33;
  border-right: 6px solid #23241d;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.window {
  align-self: center;
  width: 308px;
  height: 308px;
  padding: 10px;
  background: #23241d;
  outline: 4px solid transparent;
  transition: outline-color 300ms;
}

.window img,
.photo img {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}

.transcript {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 14px 18px;
  background: var(--paper);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.transcript li {
  margin: 0;
  display: grid;
  grid-template-columns: 112px 1fr;
  align-items: baseline;
  font-size: 25px;
  line-height: 1.05;
  transition: opacity 300ms steps(3);
}

.transcript li::before {
  display: none !important;
}

.transcript li:not(.on) {
  opacity: 0;
}

.transcript b {
  font-family: 'PP Label', monospace;
  font-size: 14px;
  text-transform: uppercase;
  color: #7a6d55;
}

.transcript li.them b {
  color: var(--green);
}

/* ---------- Desk and documents ---------- */

.desk {
  position: absolute;
  left: 436px;
  right: 0;
  top: 60px;
  bottom: 0;
  background-color: #241f22;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath fill='%23372e2c' d='M0 0h2v2H0z'/%3E%3C/svg%3E");
}

.doc {
  --angle: 0deg;
  position: absolute;
  background: var(--paper);
  box-shadow: 4px 4px 0 #161315;
  transform: rotate(var(--angle));
  transition: opacity 200ms steps(3), transform 200ms steps(4);
}

.doc header {
  padding: 8px 14px;
  font-family: 'PP Label', monospace;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--paper);
}

dl {
  margin: 0;
}

dt {
  font-family: 'PP Label', monospace;
  font-size: 14px;
  text-transform: uppercase;
  color: #7a6d55;
}

dd {
  margin: 0 0 6px;
  font-size: 30px;
  line-height: 1;
}

.inspect {
  outline: 4px dashed var(--red) !important;
  outline-offset: 3px;
}

.passport {
  --angle: -1.5deg;
  left: 32px;
  top: 32px;
  width: 360px;
  height: 588px;
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 0 0 4px #a5a184, 4px 4px 0 #161315;
}

.passport header {
  background: #5a6b5a;
}

.ph small {
  display: block;
  margin-top: 4px;
  font-size: 14px;
  line-height: 1;
  color: #d7d4b7;
}

.id {
  display: grid;
  grid-template-columns: 152px 1fr;
  gap: 16px;
  padding: 14px 16px 10px;
}

.photo {
  width: 152px;
  height: 152px;
  background: #23241d;
  padding: 4px;
}

.id dt,
.fields dt {
  line-height: 1.15;
}

.id dd {
  margin-bottom: 4px;
}

.id dd:first-of-type {
  margin: 4px 0 0;
}

.id .inspect {
  outline-offset: 0;
}

.fields {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  padding: 8px 16px 0;
  border-top: 2px solid #b9b191;
}

.f {
  padding-bottom: 4px;
  border-bottom: 2px solid #c9c1a0;
}

.f dd {
  margin-bottom: 4px;
  font-size: 24px;
}

.fields .big {
  font-size: 40px;
}

.ph {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.seal {
  position: relative;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  font-size: 14px;
}

.seal svg,
.stamp svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  shape-rendering: crispEdges;
}

.seal span {
  position: relative;
}

.mrz {
  margin-top: auto;
  padding: 8px 16px 12px;
  background: rgba(58, 49, 39, 0.07);
  border-top: 2px solid rgba(58, 49, 39, 0.25);
  font-size: 16px;
  line-height: 1.1;
  letter-spacing: 0.04em;
  white-space: pre;
  color: #4a4034;
}

.stamp {
  position: absolute;
  left: 64px;
  bottom: 68px;
  z-index: 2;
  width: 216px;
  height: 84px;
  white-space: nowrap;
  color: var(--green);
  font-family: 'PP Label', monospace;
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  mix-blend-mode: multiply;
  opacity: 1;
  transform: rotate(-5deg);
  transition: transform 100ms steps(2), opacity 100ms steps(2);
}

.stamp-date {
  position: absolute;
  left: 9px;
  top: 6px;
  font-family: 'PP Type', monospace;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
}

.stamp-verdict {
  position: absolute;
  left: 9px;
  top: 30px;
  display: flex;
  flex-direction: column;
  line-height: 0.875;
}

.pp:not(.s3) .stamp {
  opacity: 0;
  transform: translateY(-12px) rotate(-5deg);
}

.record {
  --angle: 1.5deg;
  left: 432px;
  top: 32px;
  width: 380px;
}

.record header {
  background: #6b5a44;
}

.record ul {
  list-style: none;
  margin: 0;
  padding: 12px 18px 14px;
}

.record li {
  margin: 0;
  font-size: 27px;
  line-height: 1.25;
}

.record li::before {
  content: '- ';
  display: inline !important;
  position: static !important;
  background: none !important;
  color: #7a6d55;
}

.record b {
  font-weight: 400;
  font-size: 34px;
}

.permit {
  --angle: -1deg;
  left: 432px;
  top: 300px;
  width: 380px;
  background: #c8cfa8;
}

.permit header {
  background: #6f7a55;
}

.permit dl {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: 4px 14px;
  padding: 12px 18px 0;
}

.cats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 10px 18px 18px;
}

.cats div {
  padding: 8px;
  border: 4px solid #6f7a55;
  display: flex;
  flex-direction: column;
}

.cats small {
  font-family: 'PP Label', monospace;
  font-size: 14px;
  text-transform: uppercase;
  color: #5d6646;
}

.cats b {
  font-weight: 400;
  font-size: 40px;
  line-height: 1;
}

.cats span {
  font-family: 'PP Label', monospace;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--green);
}

.record:not(.on),
.permit:not(.on) {
  opacity: 0;
  transform: translateX(24px) rotate(var(--angle));
}

/* ---------- Inspection lines ---------- */

.links {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.links g {
  opacity: 0;
  transition: opacity 250ms steps(3);
}

.links g.on {
  opacity: 1;
}

.links path {
  fill: none;
  stroke: var(--red);
  stroke-width: 4;
  stroke-dasharray: 8 8;
  shape-rendering: crispEdges;
}

.links text {
  font-family: 'PP Label', monospace;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  fill: #fff;
  paint-order: stroke;
  stroke: var(--red);
  stroke-width: 8px;
}

.still,
.still * {
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .stamp,
  .doc {
    transition: opacity 200ms;
  }
}
</style>
