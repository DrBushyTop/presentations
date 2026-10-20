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

Viewers follow the presenter view, the phone remote, the phone clicker
([slidev-addon-clicker](../clicker/README.md)) and play tabs. While
live, only `localhost` and Tailscale addresses can change the deck: Slidev's
dev server takes slide changes, drawings and slide edits from anyone who can
reach it, and those would now reach every viewer. Use the phone clicker over
Tailscale, or start with `--trust-lan` to let the local network in too (only
on a network you trust; not on venue Wi-Fi).

## Share your screen

Slidev's Screen Mirror goes to viewers too while `npm run live` publishes. In
the presenter view, switch the Current pane from Slides to Screen Mirror,
press Start Screen Mirroring and pick a window, a tab or the whole screen. The
pane shows it as usual, and viewers see it over the slides until you switch
the pane back to Slides, end it from the browser's own bar, or close the
presenter tab. The picker leaves out the presenter view itself, and the
browser's bar can switch what is shared without stopping. Mirroring the screen
that shows the slides sends viewers a video of them, so switch back to Slides
after a demo.

- One tab shares at a time. Starting the mirror in another presenter tab takes
  over; the first tab's pane keeps showing it to you only.
- A dropped connection reconnects by itself while the mirror is on.
- A dot next to Current shows whether viewers get the share: amber while it
  connects, green when they do, red when they don't. Its tooltip says why.
- Slidev remembers the pane. After a reload, press Start Screen Mirroring
  again.
- In Firefox and Zen, ending it from the browser's bar leaves the last frame
  in the pane, a Slidev quirk. Viewers go back to the slides all the same.
- Recordings and slide screenshots are never shared. With
  `npm run start:<deck>`, the mirror stays local, as in stock Slidev.

Text stays sharp: the capture comes down to at most 1920 x 1080, VP8 at up to
2.5 Mbps and 30 fps, and it drops frames before resolution. Zoom in on code
and UIs as you would for the room. Measured with code on screen:

| What moves | Viewers get |
| --- | --- |
| Nothing (a still screen) | about 1 frame a second; a change shows in about 60 ms |
| An animated demo | 30 fps at about 0.9 Mbps |
| Scrolling the whole screen | 29 fps at the full 2.5 Mbps, blurred until it stops |

The video reaches viewers about 1.3 s after the click, and then trails the
screen by 35 to 50 ms (p50) on a good connection.

## Camera and voice

The presenter view's nav bar has a camera button while `npm run live`
publishes. It turns on Slidev's camera bubble over the Current pane, and
viewers see it on the same spot of the slide, mirrored as Slidev shows it,
on any screen size, phones in portrait too. They see it over the slides and
over a screen share. If a microphone is picked in Slidev's recording devices,
viewers hear it too. Pick both in a play view's recording menu.

Drag the bubble's edge to move it, and the dot on the edge to resize it. Both
show when the pointer comes near. Clicks and drawing go through the rest of
the bubble to the slide, and while drawing it has no handles. Viewers follow
as you drag, and the presenter view remembers the place.

- A dot on the camera button shows whether viewers get it: amber while it
  connects, green when they do, red when they don't. The button's tooltip
  says why.
- A play view's own camera button works too. Viewers then see the bubble where
  it sits on that tab's slide, and follow it when you move it there.
- One tab sends its camera at a time. Turning it on in another tab takes over.
- The presenter view's bubble never shows in play tabs, such as the
  projector's: the room sees you in person.

Browsers only play sound once the viewer has touched the page, so until then
a "Turn on sound" button shows, and the first tap anywhere turns it on. After
that a speaker button opens a panel with mute and a volume slider. The volume
starts at half. The tab remembers a mute, the page the volume. Turning the
volume up unmutes. In the room, phones playing the voice can echo the
speaker: ask people there to mute. iPhones and iPads ignore a page's volume,
so there the speaker button just mutes: their own volume buttons set it.
Turning the bubble off, or closing the tab, ends both.

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

The screen share and camera need a Cloudflare Realtime app (Realtime, SFU,
in the Cloudflare dashboard). Its App ID and API token are in the vault as
`realtime-app-id` and `realtime-api-token`. `npm run live:screen-setup`
copies them into the Worker's secrets.

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
- **Screen, camera and voice** (`client/push.ts`, `client/media.ts`). The
  presenter's tab sends its tracks to Cloudflare Realtime, an SFU, through
  the dev server, which adds the publish key. The relay keeps the SFU session
  and tells viewers what is on. Each viewer opens one Realtime connection when
  the page opens and keeps it for the whole talk. A share then only adds a
  track to it, which takes a fraction of a second even for a crowd, while
  opening connections is rate-limited: from one public IP, about two and a half
  a second. The Worker makes the Realtime calls and signs each viewer's session,
  so a viewer can only change its own. The screen is Slidev's Screen Mirror:
  `client/share.ts` wraps its component (`ScreenCaptureMirror.vue`) and
  publishes the capture that a click in its pane starts. After a Slidev
  upgrade, check that the mirror still reaches viewers. The camera is
  Slidev's bubble, sent by whichever tab turns it on (`client/camera.ts`).
  Its place goes as data: the centre and width as fractions of the slide,
  through the dev server and the relay, which keeps it for late joiners.
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
- Only the dev server, with the key, can publish a screen or camera. Viewers
  get a signed token for their own Realtime session, valid for 12 hours, and
  only while a talk is live. Their Realtime requests have budgets per minute:
  for the whole audience, for one network (2,500 connections, enough for a
  2,000-seat venue behind one IP reconnecting once), for one viewer (40) and
  for one share (6,000 pulls). A flood can still keep new viewers from
  joining for a minute, but cannot run up the Realtime bill without limit.
- Ending a share, replacing it, stopping the talk or another talk taking
  over closes its tracks at Cloudflare, retried until Cloudflare confirms,
  so a viewer who ignores the relay stops receiving too, and the presenter's
  tab stops sending.
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
- Cloudflare Realtime counts the data sent to viewers, with 1,000 GB a month
  free. A share sends each viewer up to 2.5 Mbps, far less for a still screen:
  200 viewers watching an hour of constant motion take about 225 GB. The camera
  adds up to 0.6 Mbps per viewer, the voice about 0.04 Mbps per viewer who has not muted it.
- Realtime connects directly or over STUN. A network that blocks WebRTC
  (some corporate Wi-Fi) gets the slides but not the share or camera; a TURN
  server would fix that.
- One talk on the site at a time.
- The relay is a public `workers.dev` endpoint. Someone flooding it with
  requests could use up the free plan's 100,000 requests a day, and the relay
  would refuse new viewers until midnight UTC. A Cloudflare rate-limiting rule
  needs the relay on a Cloudflare-managed domain instead of `workers.dev`.
