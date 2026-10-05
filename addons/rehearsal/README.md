# Rehearsal timing

A local Slidev addon for recording time spent on each slide. All five primary
repository decks enable it in their headmatter. The workspace package is linked by `npm install`.

## Use

1. Start a deck with its normal `npm run dev:*` or `npm run start:*` command.
2. Open presenter view. For the no-slop deck running on port 3131, use
   `http://localhost:3131/presenter/1?password=slides`.
3. Click **Rehearse** in the presenter bar, set the target, and click **Start rehearsal**.
4. Present normally. The bar shows a red dot, the total so far and the target.
   Use the pause button next to it for interruptions, and the play button to resume.
5. Click the timer and then **Finish rehearsal** to review the run.

While recording, the panel shows the total against the target, the time on the
current slide, and how far you are ahead of or behind an even split of the target
across the slides. Even pace is a rough guide: it assumes every slide takes the
same time.

Slide changes close the previous visit and begin another. Going back adds another
visit to that slide's total. Click reveals stay within the same visit. Pausing and
resuming on the same slide continues that visit. Navigation while paused starts
no timers; resuming records the slide then on screen. Finish includes the current
slide. Skipped slides show as unvisited.

Switching to a demo or PR in another tab keeps recording. Leaving presenter mode
pauses recording. The addon is hidden in audience, overview, embedded and export
views. Its report stays outside the slide canvas.

## Results and storage

The panel shows the selected run's total, slides visited and selected cuts, a
timeline coloured by section, section totals and every slide. Newest runs are
listed first. It also exports cumulative totals in deck order. Revisits count in cumulative totals, so these
are totals through the deck rather than timestamps of the first visit.

Sort by duration to find expensive slides. After pausing or finishing, select
potential cuts to estimate time saved and the remaining presentation duration.
CSV contains the slide report and cut selections. JSON includes every visit and
the deck's titles, section labels, Markdown and raw speaker notes as they were
when the run began.

**Report** downloads a standalone HTML page. Open it locally without a
server or internet connection. It is ordered by importance:

1. The measured total against the target, how much to cut, the slide where the
   run passed the target, and a projection for skipped slides at the run's median
   pace. Slides visited, paused time, median slide time and revisits sit beside it.
2. A timeline of the whole run in deck order. Section bands sit above one segment
   per slide, sized by time, with the target line and the overrun marked. Hover a
   segment for details and click it to open that slide.
3. A section table with slide counts, start times, totals and shares. Click a row
   to list its slides.
4. The longest slides, slides you went back to, slides under five seconds and
   slides you skipped.
5. The path through the deck: slide number over measured time in the order you
   presented, with jumps back in red.
6. Every slide with its time, visits and running start time. Expand a slide for
   its speaker notes, markup, frontmatter and individual visits. Sort, filter by
   section, and search titles, markup and notes.

Tick slides to plan cuts. The timeline, headline and toolbar update with the time
saved and the new total. **Save copy with cuts** writes those selections into a
new HTML file. **Print** prints the summary and charts. Reports from older runs
still show timings, but cannot recover content that was not captured at the time.

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
