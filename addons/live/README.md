# slidev-addon-live

Let the audience follow a talk on their own devices. They open
`https://live.huuhka.net/` and see exactly what the presenter shows:
the same slide, click step, transitions, presenter cursor, drawings and
interactive slide state. The page is read-only. Viewers cannot move away from
the presenter's slide, and nothing on the presenter's machine is exposed.

Every deck lists the addon in its headmatter. It does nothing unless
`npm run live` (or a viewer build) turns it on.

## Present

```bash
npm run live -- --deck no-slop            # or just `npm run live` and pick a deck
```

This starts the deck's normal dev server (`start:<deck>`), so the presenter
view, notes, the annotate addon and everything else work as usual. The
command prints the audience URL.

- **The latest one started wins.** The site shows one talk at a time. Starting
  a deck, on either machine, takes the site over from whatever was live. A dev
  server left running somewhere stops publishing and says so in its terminal.
  It cannot take the site back, even when its network returns. Run
  `npm run live` there again if you do want it back. A dev server that cannot
  reach the relay in its first two minutes does not go live at all; start it
  again once the network is up.
- **The site follows.** While your talk holds the stage, `npm run live` keeps
  the site on this version of the deck. It deploys in the background when the
  site has another deck or an older build, whoever put it there (log in
  `dist/live/<deck>/deploy.log`). Viewers see "The next talk is starting" or
  "Updating the slides" and reload by themselves when it is up, in a minute or
  two. If a deploy fails, viewers follow the version of the deck already on
  the site, and it retries after 5 minutes. A replaced dev server abandons its
  own upload. `--deploy` forces an update; `--no-deploy` skips it, and viewers
  follow the version on the site.
- **Ctrl+C** ends the talk: viewers see "This talk isn't live right now". On a
  dev server that was already replaced, it leaves the new talk alone.
- **A crash** keeps viewers on the last slide with a "Presenter reconnecting…"
  notice. Run `npm run live` again to continue.
- `npm run live:stop` ends whatever talk is live, for example after a crash.
  `-- --deck <deck>` stops it only if that deck is live.
- `npm run live:url` prints the audience URL.

Viewers follow the presenter view, the phone remote, and play tabs. While
live, only `localhost` and Tailscale addresses can change the deck: Slidev's
dev server takes slide changes, drawings and slide edits from anyone who can
reach it, and those would now reach every viewer. Use the phone remote over
Tailscale, or start with `--trust-lan` to let the local network in too (only
on a network you trust; not on venue Wi-Fi).

## Update the viewer page

`npm run live` keeps the site up to date. To update it without presenting:

```bash
npm run live:deploy -- --deck no-slop
```

The site holds one deck at a time, at the root of the domain. Deploying a deck
replaces the previous one. Old `/<deck>/` links open the same page.
`live.json` on the site names the deck and a hash of its sources, so any
machine can tell whether the site is current.

The build uses `--without-notes`, memory routing (no slide number in the URL,
no back button), and turns off presenter mode, PDF download, the exporter,
recording and the context menu. The rehearsal addon skips its notes snapshot.

## One-time setup

Done once already. Repeat only to rebuild from scratch.

```bash
az login
npm run live:setup        # resource group, Static Web App (Free), Key Vault, publish key
npm run live:login        # Cloudflare sign-in for the relay's own wrangler
npm run live:relay        # Cloudflare Worker, stores the key's SHA-256
```

`live/config.json` holds the resource names, the relay URL and the site URL.
None of it is secret.

To present from another machine, sign in with `az login`. Your account
needs **Key Vault Secrets Officer** on the vault, which `live:setup` grants.
`npm run live:login` is only needed to redeploy the relay. Wrangler is a
dependency of `live/relay` only, installed on first use.

The custom domain is a CNAME from `live.huuhka.net` to the Static Web App's
default host, added with `az staticwebapp hostname set`.

## How it works

```text
presenter tab ──► dev server ──wss──► Cloudflare Worker + Durable Object ──wss──► viewers
 (m1 or m4)       publisher            (one stage for all decks)                    (Azure Static Web App)
```

- **Publisher** (`server/`). Runs inside the dev server. It forwards Slidev's
  shared `nav` and `drawings` state (`serverRef.onChanged`) and interactive
  slide state to the relay over one WebSocket. The presenter tab also reports
  its position straight from the router, before it renders. Slidev's own
  report waits for a 10 ms debounce and the presenter view's render. The
  publisher sends that faster report first and reconciles with Slidev's state
  800 ms later.
- **Relay** (`live/relay`). A Worker with one Durable Object, the stage. Each
  `npm run live` is a session. Until its first connection opens, within two
  minutes of starting, a session claims the stage, which starts it clean;
  afterwards it only resumes. The stage remembers replaced sessions and never
  takes them back, and only a session's newest connection may write. Ordering
  is by arrival at the relay, so the machines' clocks do not matter. The stage
  also holds the build viewers should run, which `npm run live` sets. It keeps
  the latest state for late joiners and survives hibernation by storing it.
  Viewers are read-only: any message from them closes their socket.
- **Viewer** (`client/follower.ts`). Feeds the relay's messages into Slidev's
  own shared state, so slides, clicks and transitions behave like a local
  follower window. A router guard rejects every navigation the presenter did
  not make (swipes, links, keys), and shortcuts are locked. It only follows
  the deck and build it was built from, since slide numbers can differ
  between builds. When the stage shows another deck, another build or a new
  talk, the page reloads once the site has it. A heartbeat replaces a socket
  that went quiet.
- **Interactive state**. Components that keep state with `useSynced` in
  `no-slop-deck/lib/sync.ts` use the `slidev-live-sync` BroadcastChannel. The
  dev tabs forward that channel to the dev server, which keeps each tab's
  changes in order. The viewer replays it, and answers late-mounting
  components that ask for the current value.

## Security

- The publish key lives in Azure Key Vault and is read with `az` at start.
  The Worker only stores its SHA-256 (`wrangler secret`). Nothing secret is in
  the repo or the viewer bundle.
- While live, the dev server only accepts changes (any request other than
  GET, plus MCP, open-in-editor and inspect) from loopback and Tailscale,
  unless `--trust-lan`, and only from its own pages: a page from another site
  open in the presenter's browser cannot post to it. The live routes
  (`/__slidev-live/*`) also need a custom header.
- Viewers keep only plain SVG shapes from drawings, so markup cannot run
  script on their devices. The relay checks the shape and size of everything
  it stores, and caps viewers at 2,000.
- The viewer bundle has no speaker notes and no presenter routes. The deck
  itself is public while deployed, as is this repository.

## Latency

`npm run live:latency -- --deck <deck> --viewer <url>` drives a presenter and
headless viewers in one local Chromium, so all timestamps share one clock.
Measured from m1 (Finland, Cloudflare ARN) against the deployed relay and
site, 60 to 80 steps:

| Setup | p50 | p90 | p99 |
| --- | --- | --- | --- |
| Slidev state only, 3 viewers | 52 ms | 111 ms | 150 ms |
| With the router report, 3 viewers | 32 ms | 79 ms | 109 ms |
| With the router report, 1 viewer | 32 ms | 53 ms | 78 ms |
| One stage, sanitised drawings, 2 viewers | 32 ms | 81 ms | 89 ms |

The time is keypress to the viewer's first frame with the new step in the
page. About 22 ms
of it is the network round trip through Cloudflare, and the tail is the
viewer mounting the next slide. The audience's own connection adds to this.

## Costs and limits

- Azure Static Web Apps Free and Cloudflare Workers Free with Durable Objects.
  A 200-viewer talk is well inside the free allowance. Viewer pings are
  answered without waking the object.
- One talk on the site at a time.
- The relay is a public `workers.dev` endpoint. Someone flooding it with
  requests could use up the free plan's 100,000 requests a day, and the relay
  would refuse new viewers until midnight UTC. A Cloudflare rate-limiting rule
  needs the relay on a Cloudflare-managed domain instead of `workers.dev`.
