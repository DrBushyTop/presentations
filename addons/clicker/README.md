# slidev-addon-clicker

A phone clicker for a talk: Back and Next, and a clock that says whether
you're on pace. Each press takes one step, click steps included, the same as
the arrow keys on the laptop. It also keeps Slidev's presenter views together.
Dev server only (`slidev` without `build`).

Every deck lists it in its headmatter:

```yaml
addons:
  - slidev-addon-clicker
```

## Use

Start the deck as usual (`npm run live -- --deck no-slop` or
`npm run start:<deck>`). The terminal prints the clicker's address and a QR
code for it:

```
  phone clicker       > http://m4.example.ts.net:3131/clicker
```

Scan it with a phone on Tailscale. The address uses the machine's tailnet name
(MagicDNS), or its Tailscale IP when the `tailscale` command is missing. Add
the page to the home screen for a full-screen clicker.

- **Next** (the right two thirds) and **Back** (the left third) step through
  clicks and slides. Above them are the slide and its click steps.
- The clock at the top is Slidev's timer, the one in the presenter view. Play
  starts it, pause pauses it, and **Reset** shows while it's paused. The
  rehearsal addon's recording is separate: start it in the presenter view.
- The laptop's presenter view takes the step, so transitions, notes and live
  viewers follow as they do from the keyboard. Without a presenter view, a play
  view on `localhost` takes it.
- A press names the step the phone saw, and a tab on another step ignores it,
  so a double tap cannot skip two steps.
- "Nothing moved" means no presenter view took the step. Open one on the
  laptop.
- A Bluetooth clicker or keyboard paired with the phone works on the page too
  (arrows, Page Up/Down).
- Over plain http the page cannot keep the phone awake. Set Auto-Lock to a few
  minutes, or Never, for the talk.

## Pace

Put `checkpoint` on a slide with the time into the talk when that slide
should come up, such as on a section divider:

```yaml
---
layout: none
checkpoint: "10:30"
---
```

Use `mm:ss` in quotes, or `10min`. A checkpoint takes its name from the next
`part` at or after it, so a divider is named after the section it opens. The
headmatter's `duration` is the end.

With the clock running, the phone shows the next checkpoint, how many slides
until it, and the time left, or how late you are in red. On a checkpoint slide
it shows how far ahead or behind you arrived; within 30 seconds counts as on
time. The phone reads the checkpoints when it loads the page: reload it after
changing them.

## Who can press

Only `localhost` and Tailscale addresses can press, and the local network with
`npm run live -- --trust-lan`. Anyone who reaches the dev server can open the
page and see the slide number. The page only reads Slidev's state: it never
writes it.

## Presenter views stay together

In Slidev, presenter views ignore each other's moves and follow play views
only. Moving from a second presenter view, such as Slidev's phone remote, moved
the audience but not the laptop, and the laptop's next step or reload pulled
everyone back. With this addon:

- Presenter views follow each other, unless the sync control in the presenter
  view turns receiving off.
- A presenter view that loads or reloads mid-talk joins at the current step
  instead of sending everyone to the slide in its URL. After a dev server
  restart, the URL wins, as before.

Still Slidev's own behaviour: its overview and entry pages, opened on
`localhost`, report slide 1, and the presenter and viewers jump there. Open
them over the Tailscale address, or not during a talk.
