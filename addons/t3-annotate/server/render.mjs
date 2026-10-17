// Renders one slide at a click state in headless Chromium and bakes the
// annotation marks into the picture, so the agent sees what the presenter saw.
import { chromium } from 'playwright-chromium'

let browser = null

async function getBrowser() {
  if (!browser || !browser.isConnected()) browser = await chromium.launch()
  return browser
}

export async function closeRenderer() {
  const b = browser
  browser = null
  await b?.close().catch(() => {})
}

/**
 * @param {string} devUrl  the running Slidev dev server
 * @param {{no: number, clicks: number}} slide
 * @param {{width: number, height: number}} canvas
 * @param {{boxes: Array, strokes: Array}} marks  in slide canvas pixels
 * @returns {Promise<Buffer>} PNG bytes
 */
export async function renderSlide(devUrl, slide, canvas, marks) {
  const page = await (await getBrowser()).newPage({ viewport: { width: canvas.width, height: canvas.height } })
  try {
    await page.goto(`${devUrl}/${slide.no}?embedded=true&clicks=${slide.clicks}`, { waitUntil: 'networkidle', timeout: 20_000 })
    await page.waitForSelector('#slide-content', { timeout: 5_000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(600) // let click reveals and transitions settle
    await page.evaluate(({ marks, canvas }) => {
      const ns = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(ns, 'svg')
      svg.setAttribute('width', canvas.width)
      svg.setAttribute('height', canvas.height)
      svg.setAttribute('viewBox', `0 0 ${canvas.width} ${canvas.height}`)
      svg.style.cssText = 'position:absolute;inset:0;z-index:2147483647;pointer-events:none;overflow:visible'
      for (const b of marks.boxes) {
        const r = document.createElementNS(ns, 'rect')
        Object.entries({ x: b.x - 3, y: b.y - 3, width: b.w + 6, height: b.h + 6, rx: 4, fill: 'rgba(14,165,233,0.08)', stroke: '#0ea5e9', 'stroke-width': 3 })
          .forEach(([k, v]) => r.setAttribute(k, v))
        if (b.kind === 'region') r.setAttribute('stroke-dasharray', '10 6')
        svg.append(r)
        if (b.label) {
          const t = document.createElementNS(ns, 'text')
          Object.entries({ x: b.x - 3, y: Math.max(b.y - 10, 18), fill: '#0369a1', 'font-size': 18, 'font-weight': 700, 'font-family': 'system-ui, sans-serif', 'paint-order': 'stroke', stroke: 'white', 'stroke-width': 4 })
            .forEach(([k, v]) => t.setAttribute(k, v))
          t.textContent = b.label
          svg.append(t)
        }
      }
      for (const s of marks.strokes) {
        const p = document.createElementNS(ns, 'path')
        p.setAttribute('d', s.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' '))
        Object.entries({ fill: 'none', stroke: '#ef4444', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
          .forEach(([k, v]) => p.setAttribute(k, v))
        svg.append(p)
      }
      document.querySelector('#slide-content').append(svg)
    }, { marks, canvas })
    return await page.locator('#slide-content').screenshot({ type: 'png' })
  } finally {
    await page.close().catch(() => {})
  }
}
