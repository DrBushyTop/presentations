# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences.

1. Pasi Huuhka, running his research, design, structure and implementation agents against this codebase while preparing and giving "The no slop engineer" talk (ESPC 2026). The agents read the code; Pasi reads their artifacts.
2. Conference attendees, who see the UI only in brief glimpses: a screenshot on a slide or a few seconds of a live run. They need to grasp in one look whose tasks are on screen and which team they belong to.

Inside the fiction, the users are members of two small teams checking their team's task list.

## Product Purpose

Docket is a fictional team task list. It exists as a realistic starting codebase for a demonstrated change: "Let team members download their task list as CSV for weekly reporting." The baseline must work and stay small enough that agent research and design artifacts about it are readable on slides.

Success: the app runs reliably, the code has a real and traceable division of responsibility (session decides the team, the shared query filters by it), and any later cross-team data leak is visible at a glance.

## Positioning

Docket is not a product to sell. Its distinguishing job is to make team scoping obvious: the signed-in person, their team and that team's tasks must never be ambiguous, so a leaked row from the other team stands out on screen.

## Operating Context

- Local demo login selects one of two fixed accounts. It is an account selector, not production authentication.
- Team A (Alex Rivera): A-101 to A-105, three open and two done. Titles include a comma (A-102), double quotes (A-103) and a Finnish place name (A-104).
- Team B (Blair Chen): B-201 to B-205, three open and two done. B-201 "CANARY: Team B only" is a canary for isolation checks; B-202 "Salary review notes" is the sensitive row a leak would expose.
- `src/lib/db.ts` holds the exact seed rows.
- `npm run reset` restores this dataset and signs everyone out.
- Screenshots of the UI may appear on 16:9 slides next to agent output.

## Capabilities and Constraints

- Sign in as a demo account, switch account, sign out.
- View the team's tasks: all, open or done.
- Task editing is out of scope for the baseline.
- CSV export is deliberately absent. It is the change the talk demonstrates; do not pre-build it or leave placeholder affordances for it.
- Stack: TypeScript, React, Vite, Fastify, Node's built-in SQLite. Browser code talks to the server only through the HTTP API.

## Brand Commitments

Product name: Docket (fictional). No real company, customer or logo is implied.

## Evidence on Hand

The ten seeded tasks and two accounts above are the entire dataset. There are no real users, metrics or testimonials, and none may be invented.

## Product Principles

1. Scope is always visible. Who you are and which team you are looking at is on screen at all times.
2. Small and honest. Every feature on screen is real and wired to the API.
3. Readable by agents. Code paths stay short and traceable from route to query.
4. Leave room for the demonstrated change. Nothing in the baseline anticipates export.
