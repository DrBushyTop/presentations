# Docket demo app

This is a standalone package with its own `package.json`. Run commands from this directory.

- `npm ci` once, then `npm run check` before finishing any change (typecheck, lint, tests, build).
- `npm run dev` runs the API on 4323 and the UI on 5176.
- `npm run reset` restores the seed data and signs everyone out.

Scope:

- Keep the app independent of the Slidev deck in `../`. Code snippets in the slides are teaching material, not this app's implementation.
- The task route takes the team from the session, never from the request. Keep that split: routes decide scope, `lib/tasks.ts` only filters.
- Browser code in `src/client/` uses the HTTP API. Shared types go in `src/shared/contracts.ts`.
- Tests use `createApp` with an in-memory database through Fastify `inject`. Test behaviour through HTTP, not private helpers.
