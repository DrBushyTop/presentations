// Live viewer for any deck: the audience follows the presenter on a public,
// read-only page. See addons/live/README.md.
//
//   npm run live:setup                    one-time Azure resources and publish key
//   npm run live:login                    sign in to Cloudflare (once per machine)
//   npm run live:relay                    deploy the Cloudflare relay
//   npm run live:deploy -- --deck <name>  build and upload the viewer page
//   npm run live -- --deck <name>         present: dev server that publishes
//   npm run live:stop -- --deck <name>    mark the talk as not live
//   npm run live:url                      print the audience URL
//
// Nothing secret is stored in the repo. The publish key lives in Key Vault and
// is read with `az`; the relay only stores its SHA-256.

import { execFileSync, spawn } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chooseDeck } from './decks.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configPath = join(root, 'live/config.json')
const config = JSON.parse(readFileSync(configPath, 'utf8'))
const { azure } = config
const relayDir = join(root, 'live/relay')
const siteDir = join(root, 'dist/live/site')
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

// The site holds one deck at a time, served from the root of the domain.
function buildViewer(deck) {
  rmSync(siteDir, { recursive: true, force: true })
  console.log(`Building the viewer for ${deck.name}`)
  run('npx', [
    'slidev', 'build', 'slides.md',
    '--out', siteDir,
    '--base', '/',
    // Memory routing keeps the slide out of the URL: nothing to edit, no back button.
    '--router-mode', 'memory',
    '--without-notes',
    '--no-download',
  ], {
    cwd: join(root, deck.dir),
    stdio: 'inherit',
    env: { ...process.env, SLIDEV_LIVE_VIEWER: '1', SLIDEV_LIVE_RELAY: relayUrl(), SLIDEV_LIVE_DECK: deck.name },
  })
  // Leftovers from Slidev's own hosting helpers.
  for (const file of ['_redirects', '404.html']) rmSync(join(siteDir, file), { force: true })

  // Lets `npm run live` check that the site shows the deck being presented.
  writeFileSync(join(siteDir, 'live.json'), `${JSON.stringify({ deck: deck.name })}\n`)

  // Every other path (old /<deck>/ links too) gets the viewer.
  writeFileSync(join(siteDir, 'staticwebapp.config.json'), `${JSON.stringify({
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

function deployViewer(deck) {
  buildViewer(deck)
  if (flag('build-only')) return console.log(`\nBuilt ${siteDir}`)
  requireAz()
  const token = az('staticwebapp', 'secrets', 'list', '-n', azure.staticWebApp, '-g', azure.resourceGroup, '--query', 'properties.apiKey')
  console.log('Uploading to Azure Static Web Apps')
  // The token goes through the environment, not the command line.
  // Run next to the site: from the repo root the CLI picks up other
  // staticwebapp.config.json files, and it refuses to run inside the site.
  run('npx', ['-y', SWA_CLI, 'deploy', 'site', '--swa-config-location', 'site', '--env', 'production'], {
    cwd: dirname(siteDir),
    stdio: 'inherit',
    env: { ...process.env, SWA_CLI_DEPLOYMENT_TOKEN: token },
  })
  console.log(`\nViewer: ${viewerUrl()}`)
}

// Tells viewers the talk is over. Connecting replaces any old publisher.
async function sendStop(deck, key) {
  const ws = new WebSocket(`${relayUrl()}/publish/${deck.name}`, { headers: { authorization: `Bearer ${key}` } })
  await new Promise((done) => {
    const timer = setTimeout(done, 5000)
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ t: 'live', on: false, ts: Date.now() }))
      ws.close(1000)
    })
    ws.addEventListener('close', () => {
      clearTimeout(timer)
      done()
    })
    ws.addEventListener('error', () => {})
  })
}

// The deck the site serves, or undefined if that cannot be told.
async function deployedDeck(url) {
  try {
    const res = await fetch(new URL('live.json', url), { signal: AbortSignal.timeout(5000) })
    return res.ok ? (await res.json()).deck : undefined
  }
  catch {
    return undefined
  }
}

async function start(deck) {
  const relay = relayUrl()
  const key = publishKey()
  if (flag('deploy')) deployViewer(deck)
  const url = viewerUrl()
  const shown = url && await deployedDeck(url)
  if (shown && shown !== deck.name) {
    console.warn(`\nThe site shows ${shown}, not ${deck.name}. Viewers will not follow this talk.`)
    console.warn(`Deploy it first: npm run live -- --deck ${deck.name} --deploy`)
  }

  console.log(`\nLive: viewers follow this dev server through ${relay}`)
  if (url) console.log(`Audience URL: ${url}`)
  console.log('Ctrl+C ends the talk for viewers. A crash keeps them on the last slide.\n')

  let interrupted = false
  // Ctrl+C reaches the dev server too. Wait for it, then end the talk.
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { interrupted = true })

  const child = spawn('npm', ['run', `start:${deck.name}`], {
    stdio: 'inherit',
    env: { ...process.env, SLIDEV_LIVE_RELAY: relay, SLIDEV_LIVE_DECK: deck.name, SLIDEV_LIVE_KEY: key },
  })
  child.on('exit', async (code, signal) => {
    if (interrupted || signal === 'SIGINT' || signal === 'SIGTERM') {
      await sendStop(deck, key)
      console.log('\nThe talk is no longer live for viewers.')
      process.exit(0)
    }
    console.error(`\nThe dev server exited (${code ?? signal}). Viewers stay on the last slide.`)
    console.error(`Restart with \`npm run live -- --deck ${deck.name}\`, or end it with \`npm run live:stop -- --deck ${deck.name}\`.`)
    process.exit(code ?? 1)
  })
}

const needsDeck = ['start', 'deploy', 'stop'].includes(command)
const deck = needsDeck ? await chooseDeck(args, `run live (${command})`, `npm run live -- --deck no-slop`) : undefined

switch (command) {
  case 'setup': await setup(); break
  case 'login': wrangler(['login'], { stdio: 'inherit' }); break
  case 'relay': deployRelay(); break
  case 'deploy': deployViewer(deck); break
  case 'start': await start(deck); break
  case 'stop':
    await sendStop(deck, publishKey())
    console.log('The talk is no longer live for viewers.')
    break
  case 'url': console.log(viewerUrl() ?? 'The Static Web App does not exist yet. Run `npm run live:setup`.'); break
  default: fail(`Unknown command "${command}". Use setup, login, relay, deploy, start, stop or url.`)
}
