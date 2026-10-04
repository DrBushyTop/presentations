# Rehearsal timing

A local Slidev addon for recording time spent on each slide. All five primary
repository decks enable it in their headmatter. The workspace package is linked by `npm install`.

## Use

1. Start a deck with its normal `npm run dev:*` or `npm run start:*` command.
2. Open presenter view. For the no-slop deck running on port 3131, use
   `http://localhost:3131/presenter/1?password=slides`.
3. Click **Rehearsal**, set the target, and click **Start rehearsal**.
4. Present normally. Use **Pause rehearsal** for interruptions.
5. Open **Rehearsal** and click **Finish rehearsal** to review the run.

Slide changes close the previous visit and begin another. Going back adds another
visit to that slide's total. Click reveals stay within the same visit. Pausing and
resuming on the same slide continues that visit. Navigation while paused starts
no timers; resuming records the slide then on screen. Finish includes the current
slide. Skipped slides show as unvisited.

Switching to a demo or PR in another tab keeps recording. Leaving presenter mode
pauses recording. The addon is hidden in audience, overview, embedded and export
views. Its report stays outside the slide canvas.

## Results and storage

The report shows slide totals, visit counts, section totals, the overall target,
and how many slides you visited. Partial runs are labelled. It also shows
cumulative totals in deck order. Revisits count in cumulative totals, so these
are totals through the deck rather than timestamps of the first visit.

Sort by duration to find expensive slides. After pausing or finishing, select
potential cuts to estimate time saved and the remaining presentation duration.
CSV contains the slide report and cut selections. JSON includes every visit and
the deck's titles, section labels, Markdown and raw speaker notes as they were
when the run began. **Export HTML report** downloads a standalone page with slide
and section charts, source content, individual visits and the full raw data.
Open it locally without a server or internet connection. Sort by duration, filter
by section, search content, and select potential cuts. **Save report with selected
cuts** saves those selections into a new HTML file. **Print / save PDF** opens the
browser print dialog. Reports from older runs still show timings, but cannot
recover content that was not captured at the time.

Runs are saved in browser local storage once per second and on slide changes.
Reloading recovers an unfinished run. Click **Resume rehearsal** to continue;
time spent with the page closed is excluded. If you edit or reorder slides during
a run, recording pauses and you must finish that run before starting a new one.
An unexpected browser crash can lose the last second. Storage is specific to the browser profile and origin, including
its port. Export results before moving to another browser or clearing storage.

Recording uses the Web Locks API to prevent two presenter tabs on the same origin
from recording the same deck at once. Open the deck on localhost or HTTPS.
An HTTP address on another machine does not provide the required secure context.

## Configuration

Enable the addon in a deck's headmatter:

```yaml
addons:
  - slidev-addon-rehearsal
rehearsal:
  targetMinutes: 60
```

The target defaults to 30 minutes. The no-slop deck uses 60 and the workshop intro
uses 10. The rehearsal timer operates independently of Slidev's built-in timer.
A deck's `exportFilename`, or its title when absent, identifies its saved runs.
Keep that value distinct for decks hosted on the same origin.

Slides with headings use Slidev's parsed titles. Slides without titles appear as
`Slide N`; add a `title` field to their frontmatter if a more descriptive label is
needed. Section totals follow the most recent `part` field.

Run timing tests with `npm run test:rehearsal`. Build decks with
`npm run build:all` and run `npm run check:slides` to check their layouts.
