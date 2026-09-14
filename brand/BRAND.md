# Ditto brand rule — read before writing any component

This app is skinned entirely from the Ditto Design System handoff bundle in
this folder. **Every colour, font, radius and spacing value must come from
`ditto-tokens.css` (wired into Tailwind's theme in `app/globals.css`) — never
hardcode a hex value, invent a palette, or reach for a non-Poppins font.**

This file is the quiz-app-scoped summary. The full reference lives alongside
it:

- `readme.md` — full guidelines (colour, type, components, iconography, logo,
  card styles, UI patterns)
- `SKILL.md` — condensed version of the same
- `guidelines/*.card.html` — live specimen cards for buttons, badges,
  callouts, cards, avatars, aperture images
- `ditto-tokens.css` / `ditto-tokens.json` — the tokens, source of truth
- `../components/ds/` — the components below, ported to TypeScript

## Non-negotiables

- **Colour**: no gradients, true hex only. Page backgrounds are white,
  `#350063` (purple), or `#e4ffff` (tint cyan) — nothing else. On purple,
  text is orange or white only. Orange pairs only with purple or white;
  purple pairs only with orange or white. Headings default purple; orange is
  for emphasis/action, not the default heading colour.
- **Type**: Poppins only, self-hosted via `next/font/local` (see
  `lib/fonts.ts`) — never a CDN font or a different typeface. Weight 700
  (bold) is never used. No italics.
- **Writing**: sentence case everywhere (headings, buttons, eyebrows) — never
  ALL CAPS. Standard English spelling (colour, personalise, organisation).
  "and"/"or", not `&`/`+`. No emoji. Bullet markers are always explicit brand
  orange (`list-style:none` + an orange `•` span) — a default disc inherits
  text colour and renders wrong.
- **Icons**: Ditto brand icons only (`brand/icons/`, rendered via the
  `BrandIcon` component) — never Lucide, Font Awesome, Material, emoji or
  hand-drawn shapes. If an affordance is missing, pick the closest brand icon
  and flag the gap; don't substitute another library. `ui-*` icons
  (`ui-chevron-down`, `ui-back`, `ui-close`, `ui-tick`, …) are for UI-control
  furniture only (dropdowns, back/close, checkbox ticks) — a "correct"/
  "verified" mark in content is the brand `approved` or `tick-filled` icon,
  not `ui-tick`.
- **Cards**: five permitted styles only — (1) no fill + `#D7CCE0` stroke,
  (2) `#F9F4FF` fill no stroke, (3) `#e4ffff` fill no stroke, (4) `#350063`
  fill no stroke, (5) no fill + orange stroke (highlights only, not default
  styling). No shadows anywhere, no left-edge accent stripes — signal status
  with a `Badge` or a whole-card pale tint + uniform 1px border.
- **Apertures / photo crops**: cover-only. Never use a photo aperture inside
  the quiz-taking flow (per `../../quiz-assessment-ui-brief.md`) — a
  solid-colour aperture panel is acceptable as a decorative edge on a result
  or certificate screen only.
- **Never invent** stats, scores, quotes or outcomes in placeholder content —
  use `[STAT NEEDED]` rather than making up a number.

## Components (`components/ds/`)

| Component | Notes |
| --- | --- |
| `Button` | `primary` (orange) / `secondary` (purple) / `outline` / `ghost`. One primary per screen. |
| `Card` | `tone`: white / subtle / purple / orange / dark — maps to the five permitted styles. |
| `Badge` | `tone` orange/purple, `soft` for the 050-tint variant. Status, difficulty, category. |
| `StatCallout` | Score, pass rate, time taken — number is always brand orange, Regular weight. |
| `Avatar` | Circular portrait, optional white ring. |
| `Logo` | Wraps the correct wordmark for the background (`color` / `purple` / `white`). |
| `IconFeature` | Icon + heading + body, `stack` or `row` layout. |
| `ApertureImage` | Signature notched-corner photo crop — cover/result contexts only, not quiz questions. |
| `BrandIcon` | Inlines an SVG from `brand/icons/` so `--icon-ink`/`--icon-accent` recolour correctly; `tone="on-purple"` for dark surfaces. |

## UI patterns not yet componentised

Form fields, selection controls (radio/checkbox/toggle), feedback alerts,
tabs/breadcrumbs and sidebar nav are documented as rules in `readme.md` /
`SKILL.md` but don't have ported components yet — build them from the tokens
when the taking-experience step needs them, following the specimen cards in
`guidelines/`. Selected radio/checkbox always fills brand orange; focus rings
are always a 1px/3px orange (or red, on error) ring — never a shadow.
