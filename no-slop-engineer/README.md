# The no slop engineer

An interactive planning page for a 60-minute ESPC session aimed at mid-to-senior engineers. Five minutes are reserved for questions. This is an outline base, not a Slidev deck or a working demo application.

Open the running page through M1 Tailscale:

- [Outline workbench](https://m1.saiga-bleak.ts.net:8446/)
- [Source notebook](https://m1.saiga-bleak.ts.net:8446/sources.md)
- [Default outline](https://m1.saiga-bleak.ts.net:8446/outline.md)
- [Three other story options](https://m1.saiga-bleak.ts.net:8446/stories.html)

The workbench compares structures and case studies, edits section timings, explores reveal groups, simulates bounded review loops, and keeps working notes in browser storage. Export the outline to retain or share those notes. Notes do not synchronize between devices or write back to the repository.

## Run

```sh
npm run start:no-slop-engineer
```

This builds the static page and starts a server on `127.0.0.1:4317`. No extra dependencies are needed. The server exposes only the built workbench directory.

Rebuild after editing:

```sh
npm run build:no-slop-engineer
```

The build regenerates `sources.md` and `outline.md`, then copies the static files to `dist/no-slop-engineer`. Edit `sources.mjs` and `build.mjs` rather than their generated Markdown outputs. Existing Slidev decks are independent of this build.

## Tailscale

The current background server has its PID in `/tmp/no-slop-engineer-server.pid` and writes logs to `/tmp/no-slop-engineer-server.log`. It lasts until stopped or the machine restarts. It does not automatically restart after a reboot.

The dedicated Tailscale proxy uses HTTPS port 8446:

```sh
tailscale serve --bg --https=8446 http://127.0.0.1:4317
```

This leaves the existing Tailscale services on other ports in place. To remove this proxy:

```sh
tailscale serve --https=8446 off
```

After a reboot, start the server again with the npm command above. Check that the proxy still points to port 4317.

## Content

- `data.mjs` contains the structures, section notes, cases and cut suggestions.
- `sources.mjs` contains the annotated reading list.
- `conversation-links.json` preserves the 42 original citation destinations from the two shared chats.
- `app.mjs` contains interactions, local persistence and Markdown export.
- `outline.md` is the generated default outline, useful without JavaScript.
- `stories.html` compares three alternative story structures with the current plan.
- `sources.md` is the generated standalone source notebook.

The newer Polylane production-review post is the main production example. Jev is an optional 30-second aside and is off by default. All case-study demos and preparation estimates are proposals. The actual case and exact live-demo scope remain open for discussion.
