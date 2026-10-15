<!--
  Speaker intro, closer to the Papers, Please (Lucas Pope, 2013) screen: the
  booth with its height chart, speech bubbles over the face, the counter, and
  the desk with straight, overlapping documents in the game's style. Pasi's
  papers check out, then his agent's PR has no evidence: the stamp drawer
  slides out, denies it four times, slides back, and the shutter comes down.
  0 papers, please · 1 purpose of visit, the photo matches · 2 the MVP permit,
  the names match · 3 the agent's PR, evidence missing · 4 DENIED, shutter
  The booth sprite is the 72x72 portrait with its background cut away.
  Overview and print show the final, denied state without motion.
-->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'
import { useIsActive } from '../lib/active'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const { $renderContext } = useSlideContext()
const still = computed(() => !['slide', 'presenter'].includes($renderContext.value as string))
const s = computed(() => (still.value ? 4 : props.step))

const lines = [
  { at: 0, who: 'inspector', t: 'Papers, please.' },
  { at: 1, who: 'inspector', t: 'Purpose of visit?' },
  { at: 1, who: 'pasi', t: 'A talk. About slop.' },
  { at: 2, who: 'inspector', t: 'Two categories?' },
  { at: 2, who: 'pasi', t: 'Pipelines, then prompts.' },
  { at: 3, who: 'pasi', t: 'Also, my agent\'s PR.' },
  { at: 3, who: 'inspector', t: 'Evidence?' },
  { at: 3, who: 'pasi', t: 'All checks green.' },
]
// Like the game, new bubbles push the oldest ones off the top.
const shown = computed(() => lines.filter(l => s.value >= l.at).slice(-4))

// The PR slides under the DENIED stamper once per mark. Positions are in
// desk coordinates; each move brings one mark's spot under the stamper.
const stampPoint = [476, 358]
const pr = { left: 292, top: 158 }
const marks = [
  { x: 118, y: 120, turn: -7 },
  { x: 248, y: 214, turn: 6 },
  { x: 120, y: 316, turn: 3 },
  { x: 246, y: 404, turn: -9 },
  { x: 128, y: 474, turn: 7 },
  { x: 186, y: 262, turn: -4 },
]
const prMoves = computed(() => Object.fromEntries(marks.flatMap((m, i) => [
  [`--m${i + 1}x`, `${stampPoint[0] - pr.left - m.x}px`],
  [`--m${i + 1}y`, `${stampPoint[1] - pr.top - m.y}px`],
])))
// Each mark lands as the stamp hits the paper, 0.504s apart (see press).
const markDelay = (i: number) => `${(0.846 + i * 0.504).toFixed(3)}s`

// Stamp drawer art, in 2x pixel units, after the game's: hex studs and
// guide rods either side of each stamp, a cylinder knob, a body with a
// rounded top face, a ledge and a label panel, and a lower block that only
// shows below the strip when pressed. The red stamp sits at x 72 so it
// lands on stampPoint.
const stamps = [
  { kind: 'red', c: 72, label: 'Denied' },
  { kind: 'green', c: 185, label: 'Approved' },
]
// Body silhouette: rounded top corners, then straight sides to y 76.
const bodyRows = [[18, 1, 30], [19, 1, 33], [20, 1, 35], [21, 1, 36], [22, 2, 37], [24, 52, 38]]
// Hex stud seen side-on: a lit top facet, the face, and a dark underside.
const stud = [[8, 'tn-h2'], [10, 'tn-h2'], [12, 'tn-h1'], [14, 'tn-h1'], [14, 'tn-h1'], [14, 'tn-h5'], [14, 'tn-h5'], [14, 'tn-h5'], [14, 'tn-h5'], [14, 'tn-h3'], [12, 'tn-h3'], [10, 'tn-h4'], [8, 'tn-h4']] as const
// Knob: oval cap, then the cylinder.
const capRows = [[0, 7], [1, 9], [2, 11], [3, 12], [4, 12], [5, 12], [6, 12], [7, 12]]
const dots = (from: number, to: number, step: number) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step)

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
  const outline = (parseFloat(style.outlineOffset) || 0) + (parseFloat(style.outlineWidth) || 0) / 2
  return [
    (side === 'right' ? r.right - box.left : r.left - box.left) * k + (side === 'right' ? outline : -outline),
    (r.top + r.height / 2 - box.top) * k,
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
  <div ref="root" class="ppb" :class="[`s${s}`, { still }]">
    <section class="booth">
      <div class="wall">
        <div v-for="n in 9" :key="n" class="mark-line" :style="{ top: `${(n - 1) * 46 + 18}px` }">
          <span>1.{{ 10 - n }}</span>
        </div>
        <img class="entrant" src="/pasi-booth-entrant.png" alt="Pixel portrait of Pasi Huuhka">
        <div ref="face" class="face-box" :class="{ inspect: s === 1 }" />
        <ol class="bubbles">
          <li v-for="l in shown" :key="l.t" :class="l.who">{{ l.t }}</li>
        </ol>
        <div class="shutter" aria-hidden="true" />
      </div>
      <div class="counter">
        <i class="grip left" /><i class="grip right" />
        <div class="slot" />
      </div>
      <footer class="panel">
        <span class="lcd">2026.11.30</span>
        <div class="speaker" aria-hidden="true"><i v-for="n in 12" :key="n" /></div>
        <span class="no">01</span>
        <span class="lcd">60 min</span>
      </footer>
    </section>

    <section class="desk">
      <!-- Passport: the first intro's structure with the game's details,
           chip labels, the country in spaced outline letters, a security
           hatch, an entry visa block and the machine-readable zone. -->
      <article class="doc passport">
        <header class="ph">
          <div><b>Republic of Azure</b><small>Passport · Passeport</small></div>
          <svg class="crest" viewBox="0 0 14 16" aria-hidden="true"><path d="M0 0h14v9h-1v2h-2v2H9v2H5v-2H3v-2H1V9H0Z M2 2v7h1v2h2v2h4v-2h2V9h1V2Z M9 3h2v2h-1v2H9v2H8v2H6v-2h1V7h1V5h1Z" fill-rule="evenodd" /></svg>
        </header>
        <div class="country"><i /><span>Azure</span></div>
        <div ref="nameA" class="pname" :class="{ inspect: s === 2 }">Huuhka, Pasi</div>
        <div class="prole">AI architect</div>
        <div class="pgrid">
          <div ref="photo" class="photo" :class="{ inspect: s === 1 }"><img src="/pasi-passport-papers-please.png" alt="Passport portrait of Pasi Huuhka"></div>
          <dl>
            <dt>No.</dt><dd>NSE-0482</dd>
            <dt>Emp.</dt><dd>Zure</dd>
            <dt>Azure</dt><dd>2014</dd>
            <dt>Iss.</dt><dd>2026</dd>
            <dt>Exp.</dt><dd>2036</dd>
          </dl>
        </div>
        <div class="visa">
          <div class="visa-top">
            <span class="visa-label">Entry visa</span>
            <dl>
              <dt>Dest.</dt><dd>ESPC 2026</dd>
              <dt>Valid</dt><dd>30.11–3.12</dd>
              <dt>Type</dt><dd>Speaker</dd>
            </dl>
          </div>
          <div class="stamp-here">Stamp here</div>
        </div>
        <div class="mrz" aria-label="Machine-readable zone">
          <div>P&lt;AZRHUUHKA&lt;&lt;PASI&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
          <div>NSE0482&lt;&lt;AZURE2014&lt;&lt;ESPC2026&lt;&lt;&lt;&lt;&lt;&lt;</div>
        </div>
      </article>

      <!-- Work record, shaped like the identity supplement tag. -->
      <article class="doc record" :class="{ on: s >= 1 }">
        <i class="hole" />
        <h3>Work<br>record</h3>
        <div class="frame">
          <div class="row"><b class="chip">Past</b><span>DevOps</span></div>
          <div class="row"><b class="chip">Now</b><span>AI Dev</span></div>
          <div class="band">Work</div>
          <p>AI dev tooling for orgs.<br>AI in every project.</p>
        </div>
        <small>Keep on person</small>
        <div class="foot"><b class="chip">Customers</b><span>150+</span></div>
      </article>

      <!-- MVP permit: the game's entry permit in the MVP logo's blue and
           white, with the four squares, the MVP block and a red seal. -->
      <article class="doc permit" :class="{ on: s >= 2 }">
        <div class="sheet">
          <div class="mvp">
            <div class="ms"><span class="squares" aria-hidden="true"><i /><i /><i /><i /></span>Microsoft</div>
            <div class="mvp-block"><b>MVP</b><small>Most Valuable<br>Professional</small></div>
          </div>
          <h3>Award permit</h3>
          <p>Recognition is hereby granted to</p>
          <div ref="nameB" class="line name" :class="{ inspect: s === 2 }">Huuhka, Pasi</div>
          <p>in the categories</p>
          <div class="cats">
            <div><b>Dev Tech</b><span>DevOps</span></div>
            <div><b>Foundry</b><span>AI</span></div>
          </div>
          <div class="field"><span>Since</span><b class="line">2020</b></div>
          <div class="ministry"><span class="seal">MVP</span>MVP Program</div>
        </div>
      </article>

      <article class="doc pr" :class="{ on: s >= 3 }" :style="prMoves">
        <i class="hole" />
        <h3>Pull request <span>#482</span></h3>
        <div class="pr-title">Add CSV export</div>
        <div class="frame">
          <div class="row"><b class="chip">Branch</b><span>agent/export-csv</span></div>
          <div class="row"><b class="chip">Diff</b><span>+3,912 −211</span></div>
          <div class="row"><b class="chip">Files</b><span>47</span></div>
          <div class="row"><b class="chip">Tests</b><span>+0</span></div>
          <div class="row"><b class="chip">Checks</b><span class="ok">All green</span></div>
          <div class="band">Summary</div>
          <p>"It all works."</p>
        </div>
        <div class="foot"><b class="chip">Evidence</b><span class="evidence" :class="{ inspect: s === 3 }">None</span></div>
        <div class="pcode">PR&lt;482&lt;AGENT&lt;EXPORT&lt;CSV&lt;&lt;&lt;</div>
        <span
          v-for="(m, i) in marks"
          :key="i"
          class="denied"
          :style="{ left: `${m.x}px`, top: `${m.y}px`, '--turn': `${m.turn}deg`, '--delay': markDelay(i) }"
        >
          <i class="dm-date">2026.11.30</i>
          <b>Merge<br>denied</b>
          <svg class="dm-x" viewBox="0 0 7 7" aria-hidden="true"><path d="M0 0h2v1h1v1h1V1h1V0h2v1H6v1H5v1H4v1h1v1h1v1h1v1H5V6H4V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0Z" /></svg>
          <svg class="dm-shield" viewBox="0 0 10 12" aria-hidden="true"><path d="M0 1h3V0h4v1h3v6H9v2H8v1H7v1H6v1H4v-1H3v-1H2V9H1V7H0Z M6 3h2v1h-2Z M5 4h2v1h-2Z M4 5h2v1h-2Z M3 6h2v1h-2Z M2 7h2v1h-2Z" fill-rule="evenodd" /></svg>
        </span>
      </article>

      <!-- The stamp drawer: tucked off the right edge with its end showing,
           pulled out only for the denial. The strip lies over the stamps, as
           in the game, so a pressed stamp shows below it. -->
      <div class="stamper" aria-hidden="true">
        <svg viewBox="0 0 256 100" shape-rendering="crispEdges">
          <g class="plate">
            <rect x="0" y="22" width="256" height="42" class="tn-p0" />
            <rect x="0" y="22" width="256" height="1" class="tn-p2" />
            <rect x="0" y="23" width="256" height="1" class="tn-p1" />
            <rect x="0" y="61" width="256" height="3" class="tn-p3" />
            <rect x="0" y="22" width="1" height="42" class="tn-p1" />
            <rect v-for="y in dots(25, 59, 3)" :key="y" x="12" :y="y" width="1" height="2" class="tn-p3" />
            <path d="M3 43h1v-1h1v-1h1v-1h1v-1h1v13H7v-1H6v-1H5v-1H4v-1H3Z" class="tn-p3" />
            <rect v-for="[x, y] in [[38, 27], [92, 57], [170, 29], [205, 58], [250, 40], [6, 30]]" :key="`${x}-${y}`" :x="x" :y="y" width="1" height="1" class="tn-p2" />
            <rect x="247" y="27" width="3" height="3" class="tn-p3" />
            <rect x="248" y="27" width="1" height="1" class="tn-p2" />
          </g>
          <g v-for="st in stamps" :key="st.kind" :class="['st', st.kind]">
            <g v-for="bx in [st.c - 56, st.c + 42]" :key="bx">
              <g v-for="by in [25, 42]" :key="by">
                <rect v-for="([w, cls], r) in stud" :key="r" :x="bx + (14 - w) / 2" :y="by + r" :width="w" height="1" :class="cls" />
                <rect :x="bx + 12" :y="by + 4" width="2" height="6" class="tn-h3" />
              </g>
            </g>
            <g v-for="rx in [st.c - 41, st.c + 39]" :key="rx">
              <rect :x="rx" y="14" width="3" height="76" class="tn-p0" />
              <rect :x="rx" y="14" width="1" height="76" class="tn-p2" />
              <rect :x="rx + 2" y="14" width="1" height="76" class="tn-p3" />
              <rect :x="rx" y="14" width="3" height="1" class="tn-p2" />
            </g>
            <g class="press">
              <rect v-for="[y, h, w] in bodyRows" :key="y" :x="st.c - w" :y="y" :width="w * 2" :height="h" class="tn-t" />
              <rect :x="st.c - 30" y="18" width="60" height="1" class="tn-hl" />
              <rect :x="st.c - 33" y="19" width="66" height="1" class="tn-hl" />
              <rect :x="st.c - 38" y="24" width="2" height="18" class="tn-l" />
              <rect :x="st.c + 36" y="24" width="2" height="18" class="tn-r" />
              <rect :x="st.c - 34" y="24" width="68" height="1" class="tn-hl" />
              <rect :x="st.c - 11" y="29" width="22" height="7" class="tn-s" />
              <rect :x="st.c - 9" y="30" width="18" height="5" class="tn-s2" />
              <rect :x="st.c - 38" y="42" width="76" height="2" class="tn-hl" />
              <rect :x="st.c - 38" y="44" width="76" height="20" class="tn-f" />
              <rect :x="st.c + 36" y="44" width="2" height="20" class="tn-r" />
              <rect :x="st.c - 30" y="47" width="60" height="14" class="tn-pn" />
              <rect :x="st.c - 30" y="47" width="60" height="1" class="tn-s2" />
              <rect :x="st.c - 30" y="61" width="60" height="1" class="tn-hl" />
              <rect :x="st.c - 38" y="64" width="76" height="12" class="tn-d" />
              <path :d="`M${st.c - 7} 67h14v2h-2v2h-2v2h-2v2h-2v-2h-2v-2h-2v-2h-2Z`" class="tn-f" />
              <rect v-for="[y, w] in capRows" :key="y" :x="st.c - w" :y="y" :width="w * 2" height="1" class="tn-k1" />
              <rect :x="st.c - 6" y="2" width="10" height="4" class="tn-k2" />
              <rect :x="st.c - 4" y="3" width="5" height="2" class="tn-k3" />
              <rect :x="st.c - 12" y="8" width="24" height="1" class="tn-k4" />
              <rect :x="st.c - 12" y="9" width="24" height="19" class="tn-k0" />
              <rect :x="st.c - 12" y="9" width="2" height="19" class="tn-k4" />
              <rect :x="st.c - 8" y="9" width="4" height="19" class="tn-k1" />
              <rect :x="st.c + 6" y="9" width="6" height="19" class="tn-k4" />
              <rect :x="st.c - 11" y="28" width="22" height="1" class="tn-k5" />
              <rect :x="st.c - 9" y="29" width="18" height="1" class="tn-k5" />
            </g>
          </g>
        </svg>
        <!-- Text stays in HTML so it is measured at its rendered size. -->
        <span v-for="st in stamps" :key="st.kind" :class="['lbl', st.kind]" :style="{ left: `${st.c * 2 - 60}px` }">{{ st.label }}</span>
        <div class="strip"><span>Align document beneath stamp</span><i class="light" /></div>
      </div>
    </section>

    <svg class="links" viewBox="0 0 1280 720" aria-hidden="true">
      <g :class="{ on: s === 1 }">
        <path v-if="links.photo.length" :d="inspectionPath(links.photo)" />
        <text v-if="links.photo.length" :x="(links.photo[0] + links.photo[2]) / 2" :y="Math.min(links.photo[1], links.photo[3]) - 12" text-anchor="middle">Match</text>
      </g>
      <g :class="{ on: s === 2 }">
        <!-- Turn just before the permit, so the label sits on the low run. -->
        <path v-if="links.name.length" :d="inspectionPath(links.name, links.name[2] - 16)" />
        <text v-if="links.name.length" :x="(links.name[0] + links.name[2]) / 2" :y="links.name[1] - 12" text-anchor="middle">Match</text>
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

.ppb {
  --paper: #e6dbb9;
  --ink: #3a3127;
  --red: #c0392b;
  --green: #526b2a;
  position: absolute;
  inset: 0;
  z-index: 20;
  background: #241f22;
  font-family: 'PP Type', monospace;
  color: var(--ink);
  overflow: hidden;
}

/* ---------- Booth ---------- */

.booth {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 430px;
  border-right: 6px solid #141012;
}

.wall {
  position: absolute;
  inset: 0 0 270px;
  overflow: hidden;
  background: #2f2427;
}

.mark-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 10px;
  background: #1f181a;
}

.mark-line span {
  position: absolute;
  left: 6px;
  top: -6px;
  padding-right: 6px;
  background: #2f2427;
  font-size: 22px;
  line-height: 1;
  color: #5a474a;
}

/* The sprite has blank margins either side of the shoulders. Keep the
   face over .face-box when changing these. */
.entrant {
  position: absolute;
  left: -9px;
  top: 68px;
  width: 448px;
  max-width: none;
  height: 400px;
  image-rendering: pixelated;
}

/* Only the face is outlined when the photo is checked. */
.face-box {
  position: absolute;
  left: 131px;
  top: 92px;
  width: 172px;
  height: 196px;
  outline: 4px solid transparent;
  transition: outline-color 300ms;
}

.bubbles {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
}

.bubbles li {
  flex: none;
  margin: 0;
  padding: 6px 14px 8px;
  max-width: 92%;
  font-size: 28px;
  line-height: 1;
  background: #ece5df;
  color: #2a2024;
  clip-path: polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px));
  animation: bubble-in 240ms steps(3) both;
}

.bubbles li::before {
  display: none !important;
}

.bubbles li.pasi {
  align-self: flex-end;
}

.bubbles li.inspector {
  align-self: flex-start;
  background: #3f3c31;
  color: #e6dbb9;
}

@keyframes bubble-in {
  from { opacity: 0; transform: translateY(8px); }
}

/* The shutter drops once the stamps are done. Gaps between the slats let
   the silhouette show through. */
.shutter {
  position: absolute;
  inset: 0;
  z-index: 3;
  background:
    linear-gradient(90deg, transparent 0 58px, #1a1416 58px 66px, transparent 66px calc(100% - 66px), #1a1416 calc(100% - 66px) calc(100% - 58px), transparent 0),
    repeating-linear-gradient(180deg, #4a4446 0 4px, #3b3537 4px 22px, #2e292a 22px 30px, rgba(12, 9, 10, 0.94) 30px 46px);
  transform: translateY(-101%);
}

.s4 .shutter {
  animation: shutter-down 720ms steps(8) 4.5s both;
}

.still .shutter {
  animation: none;
  transform: none;
}

@keyframes shutter-down {
  from { transform: translateY(-101%); }
  to { transform: none; }
}

.counter {
  position: absolute;
  left: 0;
  right: 0;
  top: 450px;
  height: 160px;
  background: #555b46;
  border-top: 26px solid #6b7058;
  box-shadow: inset 0 -6px 0 #474c3a;
}

.grip {
  position: absolute;
  top: -34px;
  width: 52px;
  height: 64px;
  background: repeating-linear-gradient(90deg, #7d826a 0 6px, #5d6250 6px 12px);
}

.grip.left {
  left: 0;
}

.grip.right {
  right: 0;
}

.slot {
  position: absolute;
  left: 90px;
  right: 90px;
  top: -10px;
  height: 6px;
  background: #141012;
}

.panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 110px;
  padding: 0 16px 12px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  background: #3e3024;
  border-top: 6px solid #5b4733;
}

.lcd {
  padding: 2px 8px;
  border: 3px solid #5b4733;
  background: #2b2119;
  font-size: 26px;
  line-height: 1;
  color: #7c6448;
}

.speaker {
  align-self: flex-start;
  margin-top: -16px;
  width: 92px;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  background: #5b4f3f;
  border: 4px solid #2b2119;
}

.speaker i {
  height: 12px;
  background: #2b2119;
}

.no {
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  font-size: 24px;
  color: #7c6448;
}
/* ---------- Desk and documents ---------- */

.desk {
  position: absolute;
  left: 436px;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: #241f22;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath fill='%23372e2c' d='M0 0h2v2H0z'/%3E%3C/svg%3E");
}

/* Documents stay straight, as on the game's desk, so the pixel type stays
   crisp. Only the stamp marks are tilted. */
.doc {
  position: absolute;
  box-shadow: 6px 6px 0 rgba(10, 8, 9, 0.55);
  transition: opacity 200ms steps(3), transform 240ms steps(4);
}

.doc dt,
.chip {
  display: inline-block;
  font-family: 'PP Label', monospace;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}

.doc dd {
  margin: 0;
}

.inspect {
  outline: 4px dashed var(--red) !important;
  outline-offset: 3px;
}

/* ---------- Passport ---------- */

.passport {
  left: 18px;
  top: 56px;
  width: 318px;
  height: 616px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  background-color: #ebe5dc;
  background-image: repeating-linear-gradient(135deg, transparent 0 7px, rgba(63, 102, 132, 0.07) 7px 8px);
  border: 4px solid #3f6684;
  color: #3b3437;
}

.ph {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #3f6684;
  color: #e3ecf2;
}

.ph b {
  display: block;
  font-family: 'PP Label', monospace;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
}

.ph small {
  display: block;
  margin-top: 2px;
  font-size: 20px;
  line-height: 1;
  color: #b9cddb;
}

.crest {
  width: 28px;
  height: 32px;
  fill: #e3ecf2;
  shape-rendering: crispEdges;
}

.country {
  margin: 14px 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.country i {
  flex: 1;
  height: 3px;
  background: repeating-linear-gradient(90deg, #a9a29d 0 12px, transparent 12px 18px);
}

.country span {
  font-family: 'PP Label', monospace;
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #ebe5dc;
  text-shadow: 2px 0 #8d8683, -2px 0 #8d8683, 0 2px #8d8683, 0 -2px #8d8683;
}

.pname {
  align-self: flex-start;
  margin: 12px 16px 0;
  font-size: 32px;
  line-height: 1;
}

.prole {
  margin: 4px 16px 0;
  font-size: 24px;
  line-height: 1;
  color: #7d7578;
}

.pgrid {
  margin: 12px 16px 0;
  display: grid;
  grid-template-columns: 112px 1fr;
  gap: 14px;
}

.photo {
  height: 140px;
  padding: 4px 4px 0;
  background: #9b9590;
  transition: outline-color 300ms;
}

.photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.passport dl {
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  align-content: start;
  align-items: center;
  gap: 6px 8px;
}

.passport dt {
  padding: 1px 4px;
  background: #8e9aa6;
  color: #ebe5dc;
}

.passport dd {
  font-size: 24px;
  line-height: 1;
  white-space: nowrap;
}

.visa {
  flex: 1;
  margin: 14px 16px 14px;
  padding: 8px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 4px dotted #c9a227;
}

.visa-top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.visa-label {
  width: 70px;
  font-size: 26px;
  line-height: 0.9;
  text-transform: uppercase;
  color: #c39a1c;
  text-shadow: 1px 0 #c39a1c;
}

/* Left empty: this entrant's papers are fine. */
.stamp-here {
  flex: 1;
  display: grid;
  place-items: center;
  border: 3px dashed #d8c27a;
  font-family: 'PP Label', monospace;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  color: #cbb46a;
}

.visa dt {
  background: #c9a227;
}

.mrz {
  margin-top: auto;
  padding: 8px 16px 10px;
  overflow: hidden;
  border-top: 3px dashed #a9a29d;
  font-size: 17px;
  line-height: 1.15;
  letter-spacing: 0.02em;
  white-space: pre;
  color: #4a4034;
}

/* ---------- Work record: the identity supplement tag ---------- */

.record {
  left: 326px;
  top: 112px;
  width: 230px;
  height: 500px;
  z-index: 2;
  padding: 18px 16px 14px;
  display: flex;
  flex-direction: column;
  background: #ece2d2;
  color: #3b3437;
  clip-path: polygon(30px 0, 100% 0, 100% 100%, 0 100%, 0 30px);
}

.hole {
  position: absolute;
  left: 18px;
  top: 22px;
  width: 16px;
  height: 16px;
  background: #241f22;
  clip-path: polygon(4px 0, 12px 0, 12px 4px, 16px 4px, 16px 12px, 12px 12px, 12px 16px, 4px 16px, 4px 12px, 0 12px, 0 4px, 4px 4px);
}

.record h3,
.pr h3 {
  margin: 0 0 12px;
  padding: 0;
  text-align: center;
  font-family: 'PP Type', monospace;
  font-size: 38px;
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #7a7090;
}

.frame {
  padding: 10px;
  border: 3px dotted #a59cb0;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 0;
}

.row .chip,
.foot .chip,
.band {
  padding: 2px 6px;
  background: #8a7f9c;
  color: #ece2d2;
}

.row span {
  font-size: 26px;
  line-height: 1;
  white-space: nowrap;
}

.band {
  margin: 10px 0 6px;
  font-family: 'PP Label', monospace;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}

.frame p {
  margin: 0;
  font-size: 26px;
  line-height: 1.05;
}

.record small {
  margin-top: auto;
  text-align: center;
  font-size: 20px;
  color: #8a7f9c;
}

.foot {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.record .foot span {
  font-size: 34px;
  line-height: 1;
  color: #b8322a;
}

.record:not(.on),
.permit:not(.on) {
  opacity: 0;
  transform: translateX(28px);
}

/* ---------- MVP permit ---------- */

.permit {
  left: 540px;
  top: 56px;
  width: 294px;
  height: 570px;
  z-index: 3;
  box-shadow: none;
  filter: drop-shadow(6px 6px 0 rgba(10, 8, 9, 0.55));
}

.sheet {
  position: absolute;
  inset: 0;
  padding: 22px 28px 20px;
  display: flex;
  flex-direction: column;
  background: #e5ecf2;
  color: #44566a;
  -webkit-mask:
    radial-gradient(circle at 0 50%, transparent 6px, #000 7px) left / 14px 18px repeat-y,
    radial-gradient(circle at 100% 50%, transparent 6px, #000 7px) right / 14px 18px repeat-y,
    linear-gradient(#000, #000) center / calc(100% - 28px) 100% no-repeat;
  mask:
    radial-gradient(circle at 0 50%, transparent 6px, #000 7px) left / 14px 18px repeat-y,
    radial-gradient(circle at 100% 50%, transparent 6px, #000 7px) right / 14px 18px repeat-y,
    linear-gradient(#000, #000) center / calc(100% - 28px) 100% no-repeat;
}

.sheet::before {
  content: '';
  position: absolute;
  inset: 12px 18px;
  border: 3px solid #a6bacb;
  pointer-events: none;
}

/* After the MVP logo: the four squares, then the blue MVP block. */
.mvp {
  margin-bottom: 10px;
}

.ms {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'PP Label', monospace;
  font-size: 16px;
  font-weight: 700;
  color: #6f7c88;
}

.squares {
  display: grid;
  grid-template-columns: 10px 10px;
  gap: 2px;
}

.squares i {
  height: 10px;
}

.squares i:nth-child(1) { background: #d0603f; }
.squares i:nth-child(2) { background: #7fa53a; }
.squares i:nth-child(3) { background: #3d8fd6; }
.squares i:nth-child(4) { background: #e0b73a; }

.mvp-block {
  margin-top: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #2f6cab;
  color: #f2f6fa;
}

.mvp-block b {
  font-family: 'PP Label', monospace;
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
}

.mvp-block small {
  font-size: 20px;
  line-height: 0.95;
  color: #cfe0f0;
}

.permit h3 {
  margin: 0 0 8px;
  padding: 0 0 6px;
  text-align: center;
  font-family: 'PP Type', monospace;
  font-size: 38px;
  font-weight: 400;
  line-height: 1;
  color: #4c6a88;
  border-bottom: 3px dotted #a6bacb;
}

.permit p {
  margin: 0;
  font-size: 22px;
  line-height: 1.05;
}

.line {
  display: block;
  padding: 0 0 2px;
  text-align: center;
  font-weight: 400;
  border-bottom: 3px solid #7f97ad;
}

.name {
  align-self: stretch;
  margin: 8px 0 10px;
  font-size: 28px;
  line-height: 1;
  text-transform: uppercase;
  color: #2f4f7a;
}

.cats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

.cats div {
  padding: 4px 6px;
  border: 3px solid #2f6cab;
  display: flex;
  flex-direction: column;
}

.cats b {
  font-weight: 400;
  font-size: 26px;
  line-height: 1;
  color: #2f4f7a;
}

.cats span {
  font-family: 'PP Label', monospace;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  color: #2f6cab;
}

.field {
  display: grid;
  grid-template-columns: 70px 1fr;
  align-items: end;
  gap: 8px;
  margin-top: 14px;
  font-size: 24px;
  line-height: 1;
}

.field b {
  font-size: 26px;
  color: #2f4f7a;
}

.ministry {
  position: relative;
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: #4c6a88;
}

.ministry::before {
  content: '';
  flex: 1;
  height: 3px;
  background: #a6bacb;
}

.seal {
  position: absolute;
  left: 18px;
  bottom: -6px;
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(205, 72, 58, 0.82);
  font-family: 'PP Label', monospace;
  font-size: 16px;
  font-weight: 700;
  color: #f2d9cf;
  transform: rotate(-10deg);
}

/* ---------- The PR ---------- */

.pr {
  left: 292px;
  top: 158px;
  width: 360px;
  height: 520px;
  z-index: 4;
  padding: 18px 18px 12px;
  display: flex;
  flex-direction: column;
  background: #eeeae6;
  color: #3b3437;
  clip-path: polygon(30px 0, 100% 0, 100% 100%, 0 100%, 0 30px);
}

.pr h3 {
  margin-bottom: 8px;
}

.pr .row {
  padding: 6px 0;
}

.pr h3 span {
  color: #a59cb0;
}

.pr-title {
  margin-bottom: 10px;
  text-align: center;
  font-size: 30px;
  line-height: 1;
}

.pr .chip,
.pr .band {
  color: #eeeae6;
}

.ok {
  color: #4f7a2a;
}

.pr .foot {
  margin-top: auto;
}

.evidence {
  padding: 0 6px;
  font-size: 36px;
  line-height: 1;
  text-transform: uppercase;
  color: #b8322a;
  transition: outline-color 300ms;
}

.pr .pcode {
  padding: 8px 0 0;
  font-size: 22px;
  text-align: center;
  color: #8a8288;
}

.pr:not(.on) {
  opacity: 0;
  transform: translate(-300px, 30px);
}

/* The game's ENTRY DENIED stamp: solid ink with the paper showing through
   everywhere else, a checkered rim, the date over a dotted rule, blocky
   type, an X, and a shield behind a checkered divider. */
.denied {
  --ink: #92201f;
  position: absolute;
  z-index: 2;
  width: 196px;
  height: 84px;
  margin: -42px 0 0 -98px;
  color: var(--ink);
  opacity: 0;
  transform: rotate(var(--turn));
}

.denied::before,
.denied::after {
  content: '';
  position: absolute;
  background: conic-gradient(var(--ink) 25%, transparent 0 50%, var(--ink) 0 75%, transparent 0) 0 0 / 6px 6px;
}

/* Rim: the checker masked down to a 6px ring. */
.denied::before {
  inset: 0;
  padding: 6px;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}

/* Divider before the shield. */
.denied::after {
  top: 6px;
  bottom: 6px;
  right: 42px;
  width: 6px;
}

.dm-date {
  position: absolute;
  left: 12px;
  top: 7px;
  padding-bottom: 2px;
  border-bottom: 3px dotted var(--ink);
  width: 114px;
  font-family: 'PP Type', monospace;
  font-size: 22px;
  font-style: normal;
  line-height: 0.9;
}

.denied b {
  position: absolute;
  left: 11px;
  bottom: 8px;
  font-family: 'PP Label', monospace;
  font-size: 21px;
  font-weight: 700;
  line-height: 0.95;
  text-transform: uppercase;
}

.denied svg {
  position: absolute;
  fill: var(--ink);
  shape-rendering: crispEdges;
}

.dm-x {
  right: 54px;
  bottom: 12px;
  width: 21px;
}

.dm-shield {
  right: 9px;
  top: 21px;
  width: 30px;
}

/* The drawer slides out, the PR moves under the stamper six times, the
   stamp comes down each time, and the drawer slides back. A mark appears
   at each press: 0.45s + 3.6s × (start + 3%), see markDelay. */
.s4 .stamper {
  animation: drawer 4.4s both;
}

.s4 .pr {
  animation: deny-moves 3.6s 0.45s both;
}

.s4 .denied {
  animation: mark-in 1ms var(--delay) both;
}

.s4 .st.red .press {
  animation: press 3.6s 0.45s both;
}

.still .stamper,
.still .pr,
.still .st.red .press {
  animation: none;
}

.still .denied {
  animation: none;
  opacity: 1;
}

@keyframes drawer {
  0% { transform: translateX(480px); animation-timing-function: steps(5); }
  10%, 90% { transform: none; animation-timing-function: steps(5); }
  100% { transform: translateX(480px); }
}

@keyframes deny-moves {
  0% { transform: none; animation-timing-function: steps(3); }
  8%, 15% { transform: translate(var(--m1x), var(--m1y)); animation-timing-function: steps(3); }
  22%, 29% { transform: translate(var(--m2x), var(--m2y)); animation-timing-function: steps(3); }
  36%, 43% { transform: translate(var(--m3x), var(--m3y)); animation-timing-function: steps(3); }
  50%, 57% { transform: translate(var(--m4x), var(--m4y)); animation-timing-function: steps(3); }
  64%, 71% { transform: translate(var(--m5x), var(--m5y)); animation-timing-function: steps(3); }
  78%, 85% { transform: translate(var(--m6x), var(--m6y)); animation-timing-function: steps(4); }
  100% { transform: none; }
}

@keyframes mark-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes press {
  0%, 9%, 14%, 23%, 28%, 37%, 42%, 51%, 56%, 65%, 70%, 79%, 84%, 100% { transform: none; }
  11%, 12%, 25%, 26%, 39%, 40%, 53%, 54%, 67%, 68%, 81%, 82% { transform: translateY(var(--press, 20px)); }
}

/* ---------- Stamp drawer ---------- */

/* Retracted, only the 32px end with its arrow shows at the desk's edge. */
.stamper {
  position: absolute;
  left: 332px;
  top: 218px;
  z-index: 6;
  width: 512px;
  height: 200px;
  transform: translateX(480px);
}

.stamper svg {
  display: block;
  width: 100%;
  height: 100%;
}

.tn-p0 { fill: #6d6860; }
.tn-p1 { fill: #7c776e; }
.tn-p2 { fill: #959086; }
.tn-p3 { fill: #45413b; }

.tn-h0 { fill: #4c4843; }
.tn-h1 { fill: #8d887e; }
.tn-h2 { fill: #a6a196; }
.tn-h3 { fill: #57534c; }
.tn-h4 { fill: #3a3631; }
.tn-h5 { fill: #79746b; }

.tn-k0 { fill: #5d5953; }
.tn-k1 { fill: #7a756c; }
.tn-k2 { fill: #8e897f; }
.tn-k3 { fill: #a5a095; }
.tn-k4 { fill: #47433e; }
.tn-k5 { fill: #3a3631; }

.st.red .tn-t { fill: #a3262a; }
.st.red .tn-hl { fill: #c23b3b; }
.st.red .tn-l { fill: #b23034; }
.st.red .tn-r { fill: #7c1b1e; }
.st.red .tn-s { fill: #7e1b1e; }
.st.red .tn-s2 { fill: #5f1416; }
.st.red .tn-f { fill: #8b2124; }
.st.red .tn-pn { fill: #6f181b; }
.st.red .tn-d { fill: #661618; }

.st.green .tn-t { fill: #6c9726; }
.st.green .tn-hl { fill: #8cbb3c; }
.st.green .tn-l { fill: #7aa62e; }
.st.green .tn-r { fill: #4b6d19; }
.st.green .tn-s { fill: #50751b; }
.st.green .tn-s2 { fill: #3d5a14; }
.st.green .tn-f { fill: #5a8220; }
.st.green .tn-pn { fill: #476819; }
.st.green .tn-d { fill: #3e5c15; }

.stamper .lbl,
.strip span {
  font-family: 'PP Label', monospace;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

/* Engraved into the label panel, units 47 to 61. */
.stamper .lbl {
  position: absolute;
  top: 100px;
  width: 120px;
  text-align: center;
  text-shadow: 0 2px rgba(0, 0, 0, 0.4);
}

.lbl.red { color: #c9373a; }
.lbl.green { color: #86b536; }

.s4 .lbl.red {
  --press: 40px;
  animation: press 3.6s 0.45s both;
}

.still .lbl.red {
  animation: none;
}

/* The strip lies over the stamps and rods; documents show through it. */
.strip {
  position: absolute;
  left: 0;
  right: 0;
  top: 128px;
  height: 24px;
  display: grid;
  place-items: center;
  background: rgba(52, 48, 44, 0.86);
  border-top: 2px solid #7c776e;
}

.strip span {
  color: #8f897d;
}

.light {
  position: absolute;
  right: 12px;
  top: 6px;
  width: 8px;
  height: 10px;
  background: #d03a2c;
  box-shadow: 0 0 0 2px #2f2b27, inset 2px 2px 0 #ff8a73;
}

/* ---------- Inspection lines ---------- */

.links {
  position: absolute;
  inset: 0;
  z-index: 8;
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
  .doc {
    transition: opacity 200ms;
  }

  .s4 .pr,
  .s4 .st.red .press,
  .s4 .lbl.red,
  .s4 .stamper {
    animation: none;
  }
}
</style>
