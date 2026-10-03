<!--
  Speaker intro in the style of Papers, Please (Lucas Pope, 2013). The
  inspector checks Pasi's documents, then stamps the passport.
  0 papers, please · 1 purpose of visit, the photo matches · 2 the MVP permit,
  the names match · 3 APPROVED
  Facts: AI architect at Zure (Pasi), Azure since 2014 (Pasi), 150+
  customers (Sessionize bio), Microsoft MVP since 2020 in DevTech and Foundry
  (Pasi, LinkedIn). The portrait is generated from his Sessionize photo.
  Overview and print show the final, stamped state without motion.
-->
<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useIsActive } from '../lib/active'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const { $renderContext } = useSlideContext()
const still = computed(() => !['slide', 'presenter'].includes($renderContext.value as string))
const s = computed(() => (still.value ? 3 : props.step))

const lines = [
  { at: 0, who: 'Inspector', t: 'Papers, please.' },
  { at: 1, who: 'Inspector', t: 'Purpose of visit?' },
  { at: 1, who: 'Pasi', t: 'A talk. Dev, DevOps, now mostly AI.' },
  { at: 2, who: 'Inspector', t: 'MVP in what?' },
  { at: 2, who: 'Pasi', t: 'DevOps and AI. Both.' },
  { at: 3, who: 'Inspector', t: 'Welcome to ESPC.' },
]

// Inspection lines join two fields across documents. Measured from the DOM,
// because the documents are rotated.
const root = ref<HTMLElement>()
const face = ref<HTMLElement>()
const photo = ref<HTMLElement>()
const nameA = ref<HTMLElement>()
const nameB = ref<HTMLElement>()
const links = ref<{ photo: number[], name: number[] }>({ photo: [], name: [] })
function centre(el?: HTMLElement) {
  if (!root.value || !el) return [0, 0]
  const box = root.value.getBoundingClientRect()
  const k = root.value.offsetWidth / box.width
  const r = el.getBoundingClientRect()
  return [(r.left + r.width / 2 - box.left) * k, (r.top + r.height / 2 - box.top) * k]
}
async function measure() {
  await nextTick()
  links.value = { photo: [...centre(face.value), ...centre(photo.value)], name: [...centre(nameA.value), ...centre(nameB.value)] }
}
onMounted(() => { measure(); setTimeout(measure, 600) })
watch(() => props.step, measure)
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
        <img src="/pasi-pixel.png" alt="Pixel portrait of Pasi Huuhka">
      </div>
      <ol class="transcript">
        <li v-for="(l, i) in lines" :key="i" :class="{ on: s >= l.at, them: l.who === 'Pasi' }">
          <b>{{ l.who }}</b><span>{{ l.t }}</span>
        </li>
      </ol>
    </section>

    <section class="desk">
      <article class="doc passport">
        <header>Republic of Azure</header>
        <div class="id">
          <div ref="photo" class="photo" :class="{ inspect: s === 1 }"><img src="/pasi-pixel.png" alt=""></div>
          <dl>
            <dt>Name</dt>
            <dd ref="nameA" :class="{ inspect: s === 2 }">Huuhka, Pasi</dd>
            <dt>Role</dt>
            <dd>AI architect</dd>
          </dl>
        </div>
        <dl class="fields">
          <dt>Note</dt><dd>More dev than data</dd>
          <dt>Employer</dt><dd>Zure</dd>
          <dt>Azure since</dt><dd class="big">2014</dd>
        </dl>
        <div class="stamp" aria-hidden="true">Approved</div>
      </article>

      <article class="doc record" :class="{ on: s >= 1 }">
        <header>Work record</header>
        <ul>
          <li>Dev, then DevOps, now AI</li>
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
        <line v-if="links.photo.length" :x1="links.photo[0]" :y1="links.photo[1]" :x2="links.photo[2]" :y2="links.photo[3]" />
        <text v-if="links.photo.length" :x="(links.photo[0] + links.photo[2]) / 2" :y="(links.photo[1] + links.photo[3]) / 2 - 12" text-anchor="middle">Match</text>
      </g>
      <g :class="{ on: s === 2 }">
        <line v-if="links.name.length" :x1="links.name[0]" :y1="links.name[1]" :x2="links.name[2]" :y2="links.name[3]" />
        <text v-if="links.name.length" :x="(links.name[0] + links.name[2]) / 2" :y="(links.name[1] + links.name[3]) / 2 - 12" text-anchor="middle">Match</text>
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
  --green: #3f7d3a;
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
  gap: 22px;
}

.window {
  align-self: center;
  width: 276px;
  height: 276px;
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
  background: repeating-linear-gradient(0deg, #5b4636 0 46px, #523f30 46px 50px);
}

.doc {
  position: absolute;
  background: var(--paper);
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.35);
  transition: opacity 350ms steps(4), transform 450ms cubic-bezier(0.2, 0.9, 0.3, 1);
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
  left: 34px;
  top: 34px;
  width: 360px;
  height: 540px;
  transform: rotate(-1.5deg);
}

.passport header {
  background: #5a6b5a;
}

.id {
  display: grid;
  grid-template-columns: 148px 1fr;
  gap: 16px;
  padding: 16px;
}

.photo {
  width: 148px;
  height: 148px;
  background: #23241d;
  padding: 4px;
}

.fields {
  padding: 0 16px;
}

.fields .big {
  font-size: 72px;
}

.stamp {
  position: absolute;
  left: 44px;
  bottom: 44px;
  padding: 6px 16px;
  white-space: nowrap;
  border: 6px solid var(--green);
  color: var(--green);
  font-family: 'PP Label', monospace;
  font-size: 32px;
  font-weight: 700;
  text-transform: uppercase;
  transform: rotate(-14deg) scale(1);
  mix-blend-mode: multiply;
  opacity: 0.92;
  transition: transform 180ms cubic-bezier(0.5, 1.8, 0.5, 1), opacity 120ms;
}

.pp:not(.s3) .stamp {
  opacity: 0;
  transform: rotate(-14deg) scale(1.9);
}

.record {
  left: 430px;
  top: 30px;
  width: 380px;
  transform: rotate(1.5deg);
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
  left: 420px;
  top: 300px;
  width: 400px;
  background: #c8cfa8;
  transform: rotate(-1deg);
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
  padding: 10px 12px;
  border: 3px solid #6f7a55;
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
  transform: translateX(80px) rotate(4deg);
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

.links line {
  stroke: var(--red);
  stroke-width: 4;
  stroke-dasharray: 10 6;
}

.links text {
  font-family: 'PP Label', monospace;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  fill: #fff;
  paint-order: stroke;
  stroke: var(--red);
  stroke-width: 10px;
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
