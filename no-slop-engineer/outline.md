# The no slop engineer

Proposed base, 27 September 2026. No Slidev deck or demo application yet.

Audience: mid-to-senior engineers.

60-minute slot: 52 minutes of material, including 14 minutes of demos, plus 3 minutes of demo flexibility and 5 minutes of questions. About 18 slides plus demo screens. These timings need rehearsal.

## Recommendation

Follow one change all the way through. Show the decisions and the evidence that change it. Compare this with the workflow-led and debate-led alternatives in the HTML workbench.

Use a small task-export teaching fixture unless an actual Bun Do development episode gives us a stronger story. A real episode is preferable when it can be explained and reproduced quickly.

## 0 to 4 minutes: Would you ship this?

Question: What would convince you this change is safe?

Exhibit: A plausible feature, a green check, and one unanswered behavior question.

Speaker notes: Define slop operationally: a change accepted without adequate evidence about its behavior and consequences. This is a proposed definition for the talk. Human code can qualify too. Give the audience twenty seconds to predict the failure before showing the answer. Keep workflow history to one sentence or one backup slide.

Risk: Opening with a cartoonishly bad agent makes the rest too easy. The first result should look reasonable.

## 4 to 10 minutes: Find the facts that change the decision

Question: What do we know, and what are we assuming?

Exhibit: A request path with one surprising boundary, plus a short facts / decisions / unknowns sheet.

Speaker notes: Do not rehearse library trivia. Research should reduce uncertainty about this change. Have the agent trace the existing path and show one finding that alters the plan. Ask a question you need answered, then verify the relevant code or documentation yourself.

Risk: A polished research summary can conceal an invented fact. Follow one claim back to its source.

## 10 to 18 minutes: Make the plan lose an argument

Question: What must remain true when the happy path fails?

Exhibit: The vague request becomes two explicit acceptance examples and one excluded behavior.

Speaker notes: Let the audience supply the missing condition before the agent offers its default. Record the decision and the evidence it needs. Add one minute on Chopin and Spec Kit as signs of attention moving upstream. A markdown file is useful only if somebody challenges it.

Risk: The planning artifact can become the next kind of slop. Keep only decisions that change implementation or verification.

## 18 to 24 minutes: Keep the change inside your understanding

Question: Can each unit be explained, exercised and reviewed?

Exhibit: Three vertical behavior slices with a visible acceptance condition for each.

Speaker notes: Distinguish a review unit from a deployment unit. A stack can reduce review size while the full feature still needs an integration check. Do not split solely into database, service and UI layers. Treat 300 to 800 lines as Dillon's example, not a quota. A ten-line authorization change can deserve more attention than a large mechanical edit.

Risk: Many tiny PRs can increase coordination cost. Pick meaningful behavior boundaries, not arbitrary line counts.

## 24 to 36 minutes: Green is a starting point

Question: Which claim did we actually test?

Exhibit: A green happy-path test beside a failing boundary check, followed by the corrected behavior.

Speaker notes: Use a prepared incorrect implementation and label it as seeded. A review agent proposes a concrete failure mechanism. Reproduce it independently, fix it, run the same check again, then deliberately reintroduce the bug to show the regression check fails. The independent expected result matters more than a second model agreeing.

Risk: Writing implementation and tests from the same mistaken assumption can make both agree. A passing browser flow cannot prove every hidden property.

## 36 to 43 minutes: Show the loop, including the stop

Question: What happens after repeated failure or a newer commit?

Exhibit: Step through trigger → inspect → bounded fix → check → accept, retry or stop.

Speaker notes: Start with a local review-and-fix loop. Then replace the trigger with a PR comment or CI result. Show commit identity, handled feedback, attempt budget and escalation. Allow at most two fixes in the demonstration. Ordinary code owns scheduling and state; the model interprets a finding. Avoid a whole agent orchestration framework.

Risk: "Until all reviewers agree" can burn time, oscillate or converge on the wrong answer. A stale CI result must not authorize a newer commit.

## 43 to 49 minutes: What could change our minds?

Question: When could stronger checks replace some human inspection?

Exhibit: Honeycomb / Intercom / Spotify compared, then one production signal linked back to a test.

Speaker notes: Give the counterargument a fair hearing. OpenAI and Uber already automate substantial workflows. Intercom selects changes for auto-approval; Spotify explicitly has not relaxed its size thresholds. Distinguish prevention from detection and recovery. Ask what telemetry is missing, and who owns the result if a plausible failure is unconfirmed.

Risk: Company anecdotes are not controlled comparisons. A rollback may be unsafe after a data migration. Do not promise zero incidents.

## 49 to 52 minutes: Leave with one change to make on Monday

Question: Which recurring correction could your repo check?

Exhibit: The original feature request, now connected to a decision, a small diff and a repeatable check.

Speaker notes: Ask the audience to name one missing behavioral check or repeated review comment. Keep a human owner for the decision. End on the artifact chain we built, with sources available separately.

Risk: A checklist without the case-study evidence feels like familiar advice. Reuse the actual artifacts.

## Production example

Use Polylane's September 21 production-review post. Explain the connection between the diff, affected resources and production telemetry. Distinguish observations from failure hypotheses and experimental impact forecasts. Give the policy for unconfirmed but plausible failures an explicit place.

Jev is an optional 30-second aside, disabled in the default plan. Adding it makes the default total 60.5 minutes, so trim elsewhere. It is for decision tasks, not the time-series forecast.

## Proposed case contract

A small team-task app adds a CSV export. The obvious implementation works; a tenant boundary does not.

Decision: Only tasks belonging to the authenticated team may appear in an export, regardless of query parameters.

Evidence: Team A exports exactly its two seeded rows. Team B's canary row never appears. A forged team identifier does not widen access.

Negative control: The seeded regression fails when the tenant predicate is removed.

Out of scope: No background export queue, large-file streaming, new identity system or spreadsheet formatting.

Preparation: Estimate 1 to 2 working days for a minimal fixture, bad/good commits, regression check and recordings. Not built yet.

## Risks to resolve next

- Select a real episode or explicitly label the seeded teaching defect.
- Rehearse the bad/good transition and show that the check detects the original error.
- Keep the software-factory counterargument fair without turning the talk into a company survey.
- Keep the production segment concrete. The export case is strongest on authorization; retention is stronger on operational impact.
- Preserve five minutes for questions. Use prepared artifacts when a live agent run stalls.

## Discussion

Which development episode would you most like to tell? What should the audience disagree with? Which operation deserves human inspection even when the checks are strong?

See [the source notebook](sources.md) for the reading and original links.
