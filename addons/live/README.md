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
npm run live -- --deck no-slop --deploy   # rebuild and upload the viewer first
```

This starts the deck's normal dev server (`start:<deck>`), so the presenter
view, the phone remote (`--remote`), notes, the annotate addon and everything
else work as usual. The command prints the audience URL.

- **Ctrl+C** ends the talk: viewers see "This talk isn't live right now".
- **A crash** keeps viewers on the last slide with a "Presenter reconnecting…"
  notice. Run `npm run live` again to continue.
- **m1 or m4**: run it on whichever machine has the dev server. Starting it on
  the other machine takes over, and the first one stops publishing.
- `npm run live:stop -- --deck <deck>` ends a talk by hand, for example after
  a crash. It also stops a dev server that is still publishing.
- `npm run live:url` prints the audience URL.

Viewers follow the presenter view, the phone remote, and play tabs on
`localhost`. Everything else that moves the dev server's shared state goes
through the same path.

## Update the viewer page

The viewer is a static build of the deck. Rebuild it whenever the slides
change:

```bash
npm run live:deploy -- --deck no-slop
```

The site holds one deck at a time, at the root of the domain. Deploying a deck
replaces the previous one. Old `/<deck>/` links open the same page.
`npm run live` warns when the site shows a different deck than the one you
start; add `--deploy` to fix it.

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
 (m1 or m4)       publisher            (one room per deck)                          (Azure Static Web App)
```

- **Publisher** (`server/`). Runs inside the dev server. It forwards Slidev's
  shared `nav` and `drawings` state (`serverRef.onChanged`) and interactive
  slide state to the relay over one WebSocket. The presenter tab also reports
  its position straight from the router, before it renders. Slidev's own
  report waits for a 10 ms debounce and the presenter view's render. The
  publisher sends that faster report first and reconciles with Slidev's state
  800 ms later.
- **Relay** (`live/relay`). A Worker with one Durable Object per deck. It keeps
  the latest state for late joiners, and survives hibernation by storing it.
  It accepts one publisher, authenticated with the publish key. Viewers are
  read-only: any message from them closes their socket.
- **Viewer** (`client/follower.ts`). Feeds the relay's messages into Slidev's
  own shared state, so slides, clicks and transitions behave like a local
  follower window. A router guard rejects every navigation the presenter did
  not make (swipes, links, keys), and shortcuts are locked.
- **Interactive state**. Components that keep state with `useSynced` in
  `no-slop-deck/lib/sync.ts` use the `slidev-live-sync` BroadcastChannel. The
  dev tabs forward that channel to the dev server. The viewer replays it, and
  answers late-mounting components that ask for the current value.

## Security

- The publish key lives in Azure Key Vault and is read with `az` at start.
  The Worker only stores its SHA-256 (`wrangler secret`). Nothing secret is in
  the repo.
- The dev server stays on the LAN and Tailscale, as before. The live routes
  (`/__slidev-live/*`) accept only loopback and Tailscale addresses, with a
  custom header that blocks cross-site posts.
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

The time is keypress to the viewer's first frame on the new step. About 22 ms
of it is the network round trip through Cloudflare, and the tail is the
viewer mounting the next slide. The audience's own connection adds to this.

## Costs and limits

- Azure Static Web Apps Free and Cloudflare Workers Free with Durable Objects.
  A 200-viewer talk is well inside the free allowance. Viewer pings are
  answered without waking the object.
- One deck on the site at a time, and one publisher per deck.
