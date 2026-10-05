# Presentation repository instructions

## Slide layout

- Inspect every changed slide in the browser at 1280 x 720.
- Check the final click state as well as the initial state.
- Use the full height between the title and the footer. Do not leave the lower third empty unless the whitespace is deliberate and visually balanced.
- Prefer making the main diagram, image or exhibit taller over adding more text.
- No visible content may overlap the footer band.
- Covers and section dividers should use the full canvas.

## Live presentation

- Keep slide text short. Put explanations, examples and caveats in speaker notes.
- Reveal related ideas in paced groups. Do not reveal every small label with a separate click.
- Replace removed text with a diagram, image or other useful visual when the slide would otherwise feel unfinished.

## Verification

- Build the changed deck before finishing.
- Review the overview and representative full-size slides in the collaborative browser.
- Check for clipping, tiny text, broken click states, missing assets and unused vertical space.

## Layout check

- Run `npm run check:slides -- <deck>` after changing slides. The pre-commit hook checks every deck when the theme changes, and otherwise only decks with staged changes.
- A failure names the slide and the rule: `empty-bottom`, `gap`, `overflow`, `footer` or `tiny-text`. Fix the layout. Do not lower the thresholds.
- Use `class: allow-whitespace` only when the empty space is deliberate, and say why in the speaker notes.
- `scripts/slide-check-baseline.json` lists violations that already existed. Remove a slide's entry once it is fixed. Never add new entries by hand.
