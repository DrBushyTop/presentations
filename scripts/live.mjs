// Live viewer for any deck: the audience follows the presenter on a public,
// read-only page. See addons/live/README.md.
//
//   npm run live:setup                    one-time Azure resources and publish key
//   npm run live:login                    sign in to Cloudflare (once per machine)
//   npm run live:relay                    deploy the Cloudflare relay
//   npm run live:deploy -- --deck <name>  build and upload the viewer page
//   npm run live -- --deck <name>         present: dev server that publishes; the
//                                         latest one started always takes the site
//   npm run live:stop [-- --deck <name>]  end whatever talk is live (or only that deck)
//   npm run live:url                      print the audience URL
//
// Nothing secret is stored in the repo. The publish key lives in Key Vault and
// is read with `az`; the relay only stores its SHA-256.

import { execFileSync, spawn } from 'node:child_process'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { hostname, tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chooseDeck, deckArgument, findDeck } from './decks.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = join(root, 'live/config.json')
const config = JSON.parse(readFileSync(configPath, 'utf8'))
const { azure } = config
const relayDir = join(root, 'live/relay')
// One build directory per deck, so two decks never build into the same place.
const liveDir = deck => join(root, 'dist/live', deck.name)
const siteDir = deck => join(liveDir(deck), 'site')
const host = hostname().split('.')[0]
const SWA_CLI = '@azure/static-web-apps-cli@2.0.10'

const [command = 'start', ...args] = process.argv.slice(2)
const flag = name => args.includes(`--${name}`)

function run(cmd, cmdArgs, options = {}) {
  return execFileSync(cmd, cmdArgs, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'], ...options })?.trim() ?? ''
}

// stderr is dropped: az prints preview warnings there.
function az(...azArgs) {
  return execFileSync('az', [...azArgs, '--subscription', azure.subscription, '-o', 'tsv'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
}

function azTry(...azArgs) {
  try {
    return az(...azArgs)
  }
  catch {
    return undefined
  }
}

function requireAz() {
  try {
    execFileSync('az', ['account', 'show', '-o', 'none'], { stdio: 'ignore' })
  }
  catch {
    fail('Azure CLI is not signed in. Run `az login` first.')
  }
}

function fail(message) {
  console.error(`\n${message}\n`)
  process.exit(1)
}

function relayUrl() {
  const url = process.env.SLIDEV_LIVE_RELAY ?? config.relay
  if (!url) fail('The relay is not deployed yet. Run `npm run live:login`, then `npm run live:relay`.')
  return url
}

function publishKey() {
  if (process.env.SLIDEV_LIVE_KEY) return process.env.SLIDEV_LIVE_KEY
  requireAz()
  const key = azTry('keyvault', 'secret', 'show', '--vault-name', azure.keyVault, '--name', azure.keySecret, '--query', 'value')
  if (!key) fail(`Could not read the publish key from Key Vault ${azure.keyVault}. Run \`npm run live:setup\`, or check your access.`)
  return key
}

// Identifies a viewer build by its sources, so `npm run live` can tell whether
// the site is up to date, on any machine.
function buildId(deck) {
  const listed = run('git', ['ls-files', '-co', '--exclude-standard', '-z', '--', deck.dir, 'addons', 'themes', 'package-lock.json', 'live/config.json'], { cwd: root })
  const hash = createHash('sha256')
  for (const file of listed.split('\0').filter(Boolean).sort()) {
    const path = join(root, file)
    if (!existsSync(path) || !statSync(path).isFile()) continue
    hash.update(file).update('\0').update(readFileSync(path)).update('\0')
  }
  return hash.digest('hex').slice(0, 16)
}

// The relay's HTTP routes, authenticated with the publish key.
async function relayCall(route, key, params = {}, method = 'GET') {
  const url = `${relayUrl().replace(/^ws/, 'http')}${route}?${new URLSearchParams(params)}`
  const res = await fetch(url, { method, headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`${route}: ${res.status}`)
  return res.json()
}

async function relayStatus(key) {
  try {
    return await relayCall('/status', key)
  }
  catch {
    return undefined
  }
}

// What the site serves: { deck, build }, or undefined if that cannot be told.
async function siteInfo() {
  try {
    const res = await fetch(new URL('live.json', viewerUrl()), { cache: 'no-store', signal: AbortSignal.timeout(8000) })
    return res.ok ? await res.json() : undefined
  }
  catch {
    return undefined
  }
}

// The audience address: the custom domain from live/config.json, or the
// Static Web App's default host while there is none.
// One deck at a time, at the root of the site.
function viewerUrl() {
  const site = process.env.SLIDEV_LIVE_SITE ?? config.siteUrl
  if (site) return `${site.replace(/\/$/, '')}/`
  requireAz()
  const host = azTry('staticwebapp', 'show', '-n', azure.staticWebApp, '-g', azure.resourceGroup, '--query', 'defaultHostname')
  return host ? `https://${host}/` : undefined
}

async function setup() {
  requireAz()
  const { resourceGroup: rg, location } = azure
  console.log(`Resource group ${rg}`)
  az('group', 'create', '-n', rg, '-l', location, '--query', 'id')

  console.log(`Static Web App ${azure.staticWebApp} (Free)`)
  if (!azTry('staticwebapp', 'show', '-n', azure.staticWebApp, '-g', rg, '--query', 'id'))
    az('staticwebapp', 'create', '-n', azure.staticWebApp, '-g', rg, '-l', location, '--sku', 'Free', '--query', 'id')

  console.log(`Key Vault ${azure.keyVault}`)
  let vault = azTry('keyvault', 'show', '-n', azure.keyVault, '-g', rg, '--query', 'id')
  if (!vault)
    vault = az('keyvault', 'create', '-n', azure.keyVault, '-g', rg, '-l', location, '--enable-rbac-authorization', 'true', '--query', 'id')

  const me = run('az', ['ad', 'signed-in-user', 'show', '--query', 'id', '-o', 'tsv'])
  const role = 'Key Vault Secrets Officer'
  if (!azTry('role', 'assignment', 'list', '--assignee', me, '--role', role, '--scope', vault, '--query', '[0].id')) {
    console.log(`Granting yourself ${role}`)
    az('role', 'assignment', 'create', '--assignee-object-id', me, '--assignee-principal-type', 'User', '--role', role, '--scope', vault, '--query', 'id')
  }

  // Role assignments take a while to apply. Retry until the vault lets us in.
  for (let attempt = 1; ; attempt++) {
    const existing = azTry('keyvault', 'secret', 'list', '--vault-name', azure.keyVault, '--query', `[?name=='${azure.keySecret}'].name | [0]`)
    if (existing !== undefined) {
      if (!existing) {
        console.log('Creating the publish key')
        const file = join(tmpdir(), `live-key-${process.pid}`)
        writeFileSync(file, randomBytes(32).toString('base64url'), { mode: 0o600 })
        try {
          az('keyvault', 'secret', 'set', '--vault-name', azure.keyVault, '--name', azure.keySecret, '--file', file, '--encoding', 'utf-8', '--query', 'id')
        }
        finally {
          rmSync(file, { force: true })
        }
      }
      break
    }
    if (attempt === 20) fail('Key Vault access did not become ready. Run `npm run live:setup` again in a minute.')
    console.log('Waiting for Key Vault access…')
    await new Promise(r => setTimeout(r, 10_000))
  }

  console.log('\nAzure is ready. Next: `npm run live:login` (once), then `npm run live:relay`.')
}

function wrangler(wranglerArgs, options = {}) {
  if (!existsSync(join(relayDir, 'node_modules'))) run('npm', ['ci', '--no-audit', '--no-fund'], { cwd: relayDir, stdio: 'inherit' })
  return run('npx', ['wrangler', ...wranglerArgs], { cwd: relayDir, ...options })
}

function deployRelay() {
  const key = publishKey()
  console.log('Deploying the relay Worker')
  const output = wrangler(['deploy'])
  console.log(output)
  const https = output.match(/https:\/\/[\w.-]+\.workers\.dev/)?.[0]
  if (!https) fail('Could not find the workers.dev URL in the wrangler output. Set "relay" in live/config.json by hand.')

  console.log('Storing the SHA-256 of the publish key in the Worker')
  const digest = createHash('sha256').update(key).digest('hex')
  wrangler(['secret', 'put', 'PUBLISH_KEY_SHA256'], { input: digest, stdio: ['pipe', 'inherit', 'inherit'] })

  config.relay = https.replace(/^https:/, 'wss:')
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
  console.log(`\nRelay: ${config.relay} (saved to live/config.json, commit it).`)
}

function withoutLiveEnv() {
  return Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('SLIDEV_LIVE_')))
}

// The site holds one deck at a time, served from the root of the domain.
function buildViewer(deck, build) {
  const site = siteDir(deck)
  rmSync(site, { recursive: true, force: true })
  console.log(`Building the viewer for ${deck.name}`)
  run('npx', [
    'slidev', 'build', 'slides.md',
    '--out', site,
    '--base', '/',
    // Memory routing keeps the slide out of the URL: nothing to edit, no back button.
    '--router-mode', 'memory',
    '--without-notes',
    '--no-download',
  ], {
    cwd: join(root, deck.dir),
    stdio: 'inherit',
    // Only what the viewer bundle needs: no key or session in the build.
    env: { ...withoutLiveEnv(), SLIDEV_LIVE_VIEWER: '1', SLIDEV_LIVE_RELAY: relayUrl(), SLIDEV_LIVE_DECK: deck.name, SLIDEV_LIVE_BUILD: build },
  })
  // Leftovers from Slidev's own hosting helpers.
  for (const file of ['_redirects', '404.html']) rmSync(join(site, file), { force: true })

  // What the site serves. `npm run live` checks it, and viewers reload when
  // it matches the talk on stage.
  writeFileSync(join(site, 'live.json'), `${JSON.stringify({ deck: deck.name, build })}\n`)

  // Every other path (old /<deck>/ links too) gets the viewer.
  writeFileSync(join(site, 'staticwebapp.config.json'), `${JSON.stringify({
    routes: [
      { route: '/assets/*', headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    ],
    navigationFallback: { rewrite: '/index.html', exclude: ['/assets/*', '/live.json'] },
    globalHeaders: {
      'cache-control': 'no-cache',
      'referrer-policy': 'no-referrer',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
    },
  }, null, 2)}\n`)
}

async function deployViewer(deck) {
  const build = process.env.SLIDEV_LIVE_BUILD || buildId(deck)
  buildViewer(deck, build)
  if (flag('build-only')) return console.log(`\nBuilt ${siteDir(deck)}`)
  // Started by `npm run live`: upload only while that presentation holds the
  // stage. If that cannot be confirmed, do not upload; it retries later.
  const session = process.env.SLIDEV_LIVE_SESSION
  if (session && !(await holdsStage(session, publishKey()))) {
    console.log('\nNot uploading: this presentation does not hold the live site.')
    process.exit(3)
  }
  requireAz()
  const token = az('staticwebapp', 'secrets', 'list', '-n', azure.staticWebApp, '-g', azure.resourceGroup, '--query', 'properties.apiKey')
  console.log('Uploading to Azure Static Web Apps')
  // The token goes through the environment, not the command line.
  // Run next to the site: from the repo root the CLI picks up other
  // staticwebapp.config.json files, and it refuses to run inside the site.
  run('npx', ['-y', SWA_CLI, 'deploy', 'site', '--swa-config-location', 'site', '--env', 'production'], {
    cwd: liveDir(deck),
    stdio: 'inherit',
    env: { ...process.env, SWA_CLI_DEPLOYMENT_TOKEN: token },
  })
  console.log(`\nViewer: ${viewerUrl()}`)
}

const sleep = ms => new Promise(done => setTimeout(done, ms))

// Waits for the dev server to claim the stage (it does as it starts), up to
// two minutes. False once it was replaced or stopped, or the relay is out of
// reach.
async function holdsStage(session, key) {
  for (let i = 0; i < 24; i++) {
    const stage = await relayStatus(key)
    if (stage?.session === session) return !stage.stopped
    if (stage?.retired?.includes(session)) return false
    await sleep(5000)
  }
  return false
}

// Ends the talk for viewers. With a session, only if that presentation is
// still the one on stage; with a deck, only if that deck is on stage.
async function stopTalk(key, params) {
  try {
    return await relayCall('/stop', key, params, 'POST')
  }
  catch (error) {
    console.error(`Could not reach the relay: ${error.message}`)
    return undefined
  }
}

// Builds and uploads the viewer next to the dev server, so presenting starts
// right away. Output goes to a log file, not over the dev server's.
function deployInBackground(deck, env, onExit) {
  mkdirSync(liveDir(deck), { recursive: true })
  const logPath = join(liveDir(deck), 'deploy.log')
  const log = createWriteStream(logPath)
  // Its own process group, so stopping it also stops the upload it runs.
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), 'deploy', '--deck', deck.name], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env,
    detached: true,
  })
  child.stop = () => {
    try {
      process.kill(-child.pid, 'SIGTERM')
    }
    catch {}
  }
  child.stdout.pipe(log)
  child.stderr.pipe(log)
  child.on('exit', (code) => {
    if (code === 0) console.log(`\n[live] The site now shows this version of ${deck.name}. Viewers reload to it.`)
    else if (code !== null && code !== 3) console.error(`\n[live] Updating the site failed (${code}). See ${logPath}`)
    onExit(code)
  })
  console.log(`\n[live] Updating the site to this version of ${deck.name} in the background (log: ${logPath}).`)
  console.log('[live] Viewers switch over by themselves when it is up, in a minute or two.')
  return child
}

// Keeps the site in step with this presentation for as long as it holds the
// stage: deploys when the site has another deck or build (whoever uploaded
// it, and whenever), and tells the relay which build viewers should run.
// Stops, and abandons its own upload, once another presentation takes over.
function keepSiteInStep({ deck, build, viewerBuild, session, key, env, noDeploy, force }) {
  let held = false
  let done = false
  let busy = false
  let deploying
  let retryAt = 0

  async function setViewerBuild(next) {
    if (next === viewerBuild) return
    try {
      await relayCall('/build', key, { session, build: next }, 'POST')
      viewerBuild = next
    }
    catch {}
  }

  async function check() {
    if (done || busy) return
    busy = true
    try {
      const stage = await relayStatus(key)
      if (!stage) return
      const holds = stage.session === session && !stage.stopped
      if (holds) held = true
      if (!holds && (held || stage.session === session || stage.retired?.includes(session))) {
        done = true
        deploying?.stop()
        return
      }
      // Only the presentation on stage touches the site. Until the dev
      // server's claim arrives, wait.
      if (!holds || deploying || Date.now() < retryAt) return
      const site = await siteInfo()
      if (!site) return
      if (site.deck === deck.name && site.build === build && !force) {
        if (held) await setViewerBuild(build)
        return
      }
      // Without a deploy, viewers follow whatever version of this deck the
      // site has.
      if (noDeploy) {
        if (held && site.deck === deck.name) await setViewerBuild(site.build)
        return
      }
      force = false
      deploying = deployInBackground(deck, env, async (code) => {
        deploying = undefined
        if (code !== 0 && !done) {
          retryAt = Date.now() + 5 * 60_000
          const now = await siteInfo()
          if (now?.deck === deck.name && now.build !== viewerBuild) {
            await setViewerBuild(now.build)
            console.error('[live] Viewers follow the version of the slides already on the site. Retrying in 5 minutes.')
          }
        }
        check()
      })
    }
    finally {
      busy = false
    }
  }

  check()
  const timer = setInterval(check, 10_000)
  return () => {
    done = true
    clearInterval(timer)
    deploying?.stop()
  }
}

async function start(deck) {
  const relay = relayUrl()
  const key = publishKey()
  const build = buildId(deck)
  const session = randomUUID()
  const url = viewerUrl()
  const [stage, site] = await Promise.all([relayStatus(key), siteInfo()])

  // The latest presentation started always takes the live site.
  if (stage?.deck && !stage.stopped && (stage.connected || stage.live))
    console.log(`\nTaking over the live site from ${stage.deck} on ${stage.host}.`)

  // With --no-deploy, viewers run the version of this deck the site has.
  const noDeploy = flag('no-deploy')
  const viewerBuild = noDeploy && site?.deck === deck.name ? site.build : build
  if (noDeploy && site?.deck && site.deck !== deck.name)
    console.warn(`\nThe site shows ${site.deck}, not ${deck.name}. Viewers wait until it is deployed.`)

  const env = {
    ...process.env,
    SLIDEV_LIVE_RELAY: relay,
    SLIDEV_LIVE_DECK: deck.name,
    SLIDEV_LIVE_KEY: key,
    SLIDEV_LIVE_SESSION: session,
    SLIDEV_LIVE_BUILD: viewerBuild,
    // While live, only localhost and Tailscale may change the deck (phone
    // remote included). --trust-lan also lets the local network in.
    ...(flag('trust-lan') ? { SLIDEV_LIVE_TRUST_LAN: '1' } : {}),
  }
  const stopSync = keepSiteInStep({
    deck,
    build,
    viewerBuild,
    session,
    key,
    env: { ...env, SLIDEV_LIVE_BUILD: build },
    noDeploy,
    force: flag('deploy'),
  })

  console.log(`\nLive: viewers follow this dev server through ${relay}`)
  if (url) console.log(`Audience URL: ${url}`)
  console.log('Ctrl+C ends the talk for viewers. A crash keeps them on the last slide.\n')

  let interrupted = false
  // Ctrl+C reaches the dev server too. Wait for it, then end the talk.
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { interrupted = true })

  const child = spawn('npm', ['run', `start:${deck.name}`], { stdio: 'inherit', env })
  child.on('exit', async (code, signal) => {
    stopSync()
    if (interrupted || signal === 'SIGINT' || signal === 'SIGTERM') {
      const result = await stopTalk(key, { session })
      if (result?.stopped) console.log('\nThe talk is no longer live for viewers.')
      else if (result?.deck) console.log(`\n${result.deck} on ${result.host} had taken over the live site. It stays live.`)
      process.exit(0)
    }
    console.error(`\nThe dev server exited (${code ?? signal}). Viewers stay on the last slide.`)
    console.error(`Restart with \`npm run live -- --deck ${deck.name}\`, or end it with \`npm run live:stop\`.`)
    process.exit(code ?? 1)
  })
}

async function stop() {
  const name = deckArgument(args)
  const result = await stopTalk(publishKey(), name ? { deck: findDeck(name).name } : {})
  if (!result) process.exit(1)
  if (result.stopped) console.log(`${result.deck} is no longer live for viewers.`)
  else if (result.deck && !result.stopped && name) console.log(`Nothing stopped: the live site shows ${result.deck}, not ${name}.`)
  else console.log('Nothing is live.')
}

const needsDeck = ['start', 'deploy'].includes(command)
const deck = needsDeck ? await chooseDeck(args, `run live (${command})`, `npm run live -- --deck no-slop`) : undefined

switch (command) {
  case 'setup': await setup(); break
  case 'login': wrangler(['login'], { stdio: 'inherit' }); break
  case 'relay': deployRelay(); break
  case 'deploy': await deployViewer(deck); break
  case 'start': await start(deck); break
  case 'stop': await stop(); break
  case 'url': console.log(viewerUrl() ?? 'The Static Web App does not exist yet. Run `npm run live:setup`.'); break
  default: fail(`Unknown command "${command}". Use setup, login, relay, deploy, start, stop or url.`)
}
