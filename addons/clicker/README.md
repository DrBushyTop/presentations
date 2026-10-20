# slidev-addon-clicker

A phone clicker for a talk: Back and Next, nothing else. Each press takes one
step, click steps included, the same as the arrow keys on the laptop. It also
keeps Slidev's presenter views together. Dev server only (`slidev` without
`build`).

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

- **Next** (the big button) and **Back** step through clicks and slides. The
  middle shows the slide and its click steps.
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
