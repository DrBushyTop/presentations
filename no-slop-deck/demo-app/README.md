# Docket demo app

A small team task list used as the starting codebase for "The no slop engineer" talk. Two demo accounts each see only their own team's tasks.

CSV export is deliberately missing. It is the change the talk demonstrates.

Requires Node 24 or newer (it uses the built-in `node:sqlite`).

## Commands

Run these in `no-slop-deck/demo-app/`. From the repository root, use the `npm run demo:*` aliases instead.

| Task | Command | Root alias |
|---|---|---|
| Install | `npm ci` | `npm run demo:install` |
| Develop | `npm run dev` | `npm run demo:dev` |
| Typecheck, lint, test, build | `npm run check` | `npm run demo:check` |
| Production | `npm run build && npm start` | `npm run demo:start` |
| Reset data | `npm run reset` | `npm run demo:reset` |

`npm run dev` starts the API on port 4323 and Vite on port 5176. Open http://localhost:5176.

`npm start` serves the built UI and the API together on http://localhost:4323. Set `PORT` to change it.

`npm run reset` restores the seed data in `data/tasks.sqlite` and signs everyone out. The dev server can stay running.

## Demo data

| Account | Team | Tasks |
|---|---|---|
| Alex Rivera | Team A | A-101 to A-105 |
| Blair Chen | Team B | B-201 to B-205 |

B-201 "CANARY: Team B only" should never appear for Alex. If it does, team scoping is broken.

The sign-in screen is an account picker for the demo, not real authentication.

## Layout

```
src/
  server.ts            starts Fastify, opens data/tasks.sqlite
  app.ts               registers cookies, routes and (in production) the built UI
  routes/session.ts    GET /api/demo/accounts, GET /api/session, POST /api/demo/login, POST /api/logout
  routes/tasks.ts      GET /api/tasks?status=open|done (team comes from the session)
  lib/db.ts            schema and seed data
  lib/session.ts       cookie sessions, 8 hour lifetime
  lib/tasks.ts         findTasks query with optional team and status filters
  shared/contracts.ts  types shared by server and browser
  client/              React UI; talks to the server only over HTTP
  app.test.ts          integration tests (Fastify inject, in-memory SQLite)
```

ESLint stops browser code from importing server modules.
