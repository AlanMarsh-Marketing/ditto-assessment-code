---
name: ditto-design
description: Use this skill to generate well-branded interfaces and assets for Ditto, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colours, type, fonts, assets, and UI components for prototyping.
user-invocable: true
---

Read `readme.md` within this skill, then explore the other files as needed.

If creating visual artifacts (slides, mocks, prototypes), copy assets out and create static HTML files. If working on production code, read the rules here to design correctly with this brand.

If invoked without other guidance, ask what the user wants to build, then act as an expert designer producing HTML artifacts or production code as needed.

## Quick reference

**Brand colours**
- Orange `#fd4e19` — primary, leads every layout
- Purple `#350063` — headlines, dark surfaces, default heading colour
- Lime `#d6de24` — data, highlights
- Tint cyan `#e4ffff` — page background option only
- Neutrals: body text `#000000`, secondary text `#595959`

**Colour rules**
- Never use gradients — true hex values only
- Backgrounds: white, `#350063`, or `#e4ffff` only
- On purple: text in orange or white only
- Orange only with purple or white — not with any other colour
- Purple only with orange or white — not with any other colour
- Headlines default purple; use orange only for emphasis or decoration

**Type — Poppins only**
- H1 40px Light · H2 32px Regular · H3 24px Medium · H4 19px SemiBold
- Body 16px Regular, black `#000000`
- Eyebrow: 12–16px, SemiBold/Medium, orange `#fd4e19`, sentence case — never capitalised
- Caption: 11px Regular, `#595959`
- Bold (700) not used. No italics.

**Writing**
- Sentence case everywhere — headings, titles, eyebrows, bullets
- Standard English spelling (colour, personalisation)
- Bullet markers are **always brand orange `#fd4e19`** in every list, on any background (use `list-style:none` + an explicit orange `•` span — a default disc inherits the text colour); use "and"/"or" not &/+
- No emoji, no ALL CAPS, no italics

**Icons**
- **Always use Ditto brand icons — applies to everything you create** (slides, docs, prototypes, UI, exported assets). Never use generic, third-party or ad-hoc sets (Lucide, Font Awesome, Material), emoji, unicode glyphs or hand-drawn shapes. If an affordance isn't in the set, pick the closest brand icon and flag the gap.
- 84 brand SVGs in `assets/icons/` — purple ink + orange accent; load via `<ditto-icon name="…">`
- On purple backgrounds: set `--icon-ink:#fff` or use `<ditto-icon tone="on-purple">`
- **Utility icons** (`ui-chevron-down`, `ui-chevron-up`, `ui-back`, `ui-close`, `ui-tick`) are for **UI controls only** — select/dropdown arrows, accordion toggles, back buttons, close, checkbox ticks. 16–20px, purple ink on light / white on purple. Never on a slide, in a doc, or in place of a brand icon for non-UI subjects (a "verified" tick is brand `approved`/`tick-filled`).
- Never on orange. Never emoji or hand-drawn substitutes
- Use standalone — not on coloured shapes
- In presentations, minimum icon size **40px** (keep sizing consistent across a deck)
- Prefer `-filled` variants at small sizes (≤24px)
- Product icons (`ditto-ID/verify/authenticate/protect`) only alongside the matching product name

**Logo**
- On white: `assets/logos/ditto-logo.png` (orange wordmark, purple dots)
- On purple: `assets/logos/ditto-logo-orange-white-dots.png` (orange wordmark, white dots)
- Small scale: `assets/logos/ditto-logo-purple.svg` (purple text, orange dots)

**Product logos** (`assets/logos/` — use only alongside a mention of that product; `-white` variant on purple, never on orange)
- Ditto Verify: `ditto-verify.png` / `ditto-verify-white.png`
- Ditto Authenticate: `ditto-authenticate.png` / `ditto-authenticate-white.png`
- Ditto Protect: `ditto-protect.png` / `ditto-protect-white.png`
- Ditto ID: `ditto-id.png` / `ditto-id-white.png`
- Ditto Intelligence: `ditto-intelligence.png` / `ditto-intelligence-white.png`

**Apertures**
- Signature shape: rectangle with notched top corner, rounded bottom on same side
- Always flush to at least two page edges — never floated
- Photo apertures for **presentation covers only** — fill the **right half** of the slide, touching the **top, right and bottom** edges, never floating
- Always centre the key subject clearly within the shape
- Use the `ApertureImage` component (fixed orientation, per-photo crop baked in)

**Dot graphic**
- One dot, one colour, one size — oversized, bleeding off a corner
- On white: orange, purple, or tint cyan. On purple: white/orange only
- Never stretched into ovals. Never on orange backgrounds

**Cards — five styles only**
1. No fill, `#D7CCE0` stroke
2. `#F9F4FF` fill, no stroke
3. `#e4ffff` fill, no stroke
4. `#350063` fill, no stroke
5. No fill, orange stroke

On a **purple page**, use only style 2 (`#F9F4FF` fill) or white fill — no stroke, no other styles.

**Never use an edge accent stripe** — no `border-left`/`border-top` colour bar, no inset severity stripe on a card, panel, alert or list row. Borders are uniform on all four sides or absent. Signal severity/status/category with a badge inside the card, or a whole-card pale tint + 1px matching border.

**Hallucination rule:** never invent stats, quotes, customers or outcomes. Use `[STAT NEEDED]` placeholders.

## UI patterns

Digital-product UI conventions live as `group="UI"` specimen cards in `guidelines/ui-*.card.html`. Build from tokens; flat, hairline-bordered, orange-accented — no shadows.

- **Form fields** — 1.5px hairline border, 6px radius (`--radius-xs`); focus = 3px pale ring in the field colour (orange, red on error), never a shadow; labels purple-medium; errors show a red border + message below
- **Selection controls** — checkbox / radio / toggle; selected always fills brand orange (white check/knob, orange radio dot); never purple/lime; disabled → grey
- **Feedback & alerts** — success green, info purple, warning orange, danger red; pale tint fill + 1px matching border, flat
- **Navigation** — tabs / links / breadcrumbs; active path marked orange (3px underline on active tab; orange inline links, underline on hover); current breadcrumb purple
- **Sidebar · light** — on white; items brand-purple text, hover `--purple-050` fill, active solid brand-purple fill + white label + `tone="on-purple"` icon
- **Sidebar · dark** — brand-purple rail; items white@72%, hover `#491A73`, active `#5D3382`, white labels, `tone="on-purple"` icons
- Sidebars are **live prototypes** (hover previews, click selects; one active at a time) — reuse that pattern for nav
- Icons in any UI must be Ditto brand icons (see Icons rule); control affordances use the `ui-*` utility icons
- **Utility icons** (`ui-07`) — `ui-chevron-down` / `ui-chevron-up` / `ui-back` / `ui-close` / `ui-tick`, 16–20px inside controls, white on purple surfaces; UI only

## Key files

- `styles.css` — link this; use CSS vars, never raw hex
- `tokens/` — colours, typography, effects, spacing
- `components/core/` — Button, Badge, Card, StatCallout, IconFeature, Avatar, Logo, ApertureImage
- `guidelines/ui-*.card.html` — UI patterns (form fields, selection controls, alerts, navigation, sidebar light/dark, utility icons) — see UI patterns above
- **Always use Ditto brand icons** in everything you create (`assets/icons/`, via `<ditto-icon>`) — never generic, third-party, emoji or hand-drawn icons
- `assets/` — logos, icons, photos, fonts, maps, team photos
- `templates/ditto-deck/` — presentation deck DC template
- `templates/ditto-doc/` — A4 document DC template (Word / Google Docs style)
- `templates/partner-playbook/` — Connect Partner Program playbook reference: the three published Ditto Protect playbooks (every page + source PDFs). Replicate these layouts exactly when building a new playbook — this set has its own stylings, unique to it. **Playbook rules (playbooks ONLY, a separate design series):** A5 landscape 210 × 148 mm; `assets/playbook-partner/cover-background.png` full-bleed on every cover; replicate the closest published playbook's layout, design and stylings as closely as possible rather than designing new pages; running headers `Ditto Protect • [title]` weight 500 in #595959 on white pages; all page titles weight 500 and never bolder; divider pages carry one circle per part — large circle = the incoming part, small circles = parts already read (left) and still to come (right), so part 2 of 4 is small · LARGE · small · small; never carry playbook stylings into other artefacts
- `assets/playbook-partner/` — playbook-ONLY assets: `cover-background.png` (full-bleed on every cover), `connect-lockup-light/dark.svg` (foot-of-cover lockup + pipe divider + Ditto Protect logo), `connect-icon-light.svg` / `connect-icon-main.svg` (top-right page mark — light on purple pages, main on white). Never use these outside a Partner Program playbook.
- `readme.md` — full guidelines reference
