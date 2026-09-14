# Ditto Design System

> Everything you need to build for Ditto — fast, frictionless, and on-brand.

Ditto is a digital-identity platform. Its products are **Ditto Protect, Ditto Authenticate, Ditto Verify, Ditto ID** and a shared **Ditto Intelligence** layer.

---

## Using this system

Link the **one** global stylesheet — it `@import`s every token and font file, so all CSS variables and Poppins become available:

```html
<link rel="stylesheet" href="styles.css">
```

Then style everything by **token name — never hard-code hex or font values.** The tokens are plain CSS custom properties on `:root`:

```css
.headline { color: var(--ditto-purple); font-family: var(--font-sans); font-weight: var(--fw-medium); }
.cta      { background: var(--action-primary); color: var(--text-on-brand); }
.panel    { background: var(--tint-cyan); border: 1px solid var(--border-subtle); }
```

See **Colors › Token reference** and **Type** below for the full variable list.

**React components** are bundled in `_ds_bundle.js` and exposed on a global namespace:

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
<script>
  const { Button, Card, Badge } = window.DittoDesignSystem_b6143a;
</script>
```

The namespace is `DittoDesignSystem_b6143a` — run `check_design_system` to confirm it if a snippet ever fails to resolve. **Starting points:** for a presentation copy `templates/ditto-deck/`; for an A4 document (Word / Google Docs style) copy `templates/ditto-doc/` (see Templates).

---

## Brand

### 01 Logo

Two wordmark variants:

- **On white (standard):** orange wordmark, purple dots — `assets/logos/ditto-logo.png`
- **On purple:** orange wordmark, white dots — `assets/logos/ditto-logo-orange-white-dots.png`
- **Small-scale exception:** purple text, orange dots — `assets/logos/ditto-logo-purple.svg` — use only where the logo is very small (e.g. slide footer)

Clear space: maintain at least the height of the "t" ascender on all sides. Never distort, recolour outside these three variants, or place on an orange background.

### 02 Product logos

Five product-specific logos for use **only alongside a mention of the matching product**. Two colour variants each — **purple on white** backgrounds, **white on purple** backgrounds. All in `assets/logos/`:

| Product | On white | On purple |
| --- | --- | --- |
| Ditto Verify | `ditto-verify.png` | `ditto-verify-white.png` |
| Ditto Authenticate | `ditto-authenticate.png` | `ditto-authenticate-white.png` |
| Ditto Protect | `ditto-protect.png` | `ditto-protect-white.png` |
| Ditto ID | `ditto-id.png` | `ditto-id-white.png` |
| Ditto Intelligence | `ditto-intelligence.png` | `ditto-intelligence-white.png` |

Never place on an orange background.

### 03 Apertures

The signature Ditto shape: a rectangle with a **notch cut from one top corner** and the **bottom corner on that same side rounded**. Rules:

- Always anchored flush to **at least two page edges** — never floated
- **Photo apertures are for presentation covers only.** On covers the shape fills the **right half** of the slide, touching the **top, right and bottom** edges — never floating. Use the `ApertureImage` component, which has this fixed orientation and the per-photo crop baked in
- Subject in any photo must be **clearly visible and centred within the shape** — crop/offset the image to achieve this; do not simply centre the photo
- Minimum **20px clearance** between the aperture edge and any surrounding text or other elements
- Do not use apertures behind body text

### 04 Dot graphic

Two forms: the **paired dot SVG** (`assets/logos/dots-main.svg` / `assets/logos/dots-on-purple.svg`) and a **single oversized circle**.

**Paired dot SVG (concentric dots derived from the logo):**

- On white: orange + purple version (`dots-main.svg`)
- On purple: white + orange version (`dots-on-purple.svg`)
- Do not use on orange or any other background colour
- Circles must always be used concentrically — never stretch into ovals or other shapes
- Do not add outlines, shading, borders, strokes, gradients, or any colour other than specified

**Single dot:**

- One dot, one colour, one size per design
- Orange on purple, or purple on white, or orange on white, or tint cyan `#e4ffff` on white
- Exact brand hex only — no tints, shades or opacity (this rule is specific to dots)
- Oversized, bleeding off a corner or edge to frame nearby content
- Never scatter multiple dots or mix sizes/colours
- Do not place behind text unless the dot fully frames the text box with ≥32px clearance
- Do not place in front of text

### 05 Iconography

**84 brand SVG icons** in `assets/icons/` — purple ink (`#350063`) + orange accent (`#fd4e19`) + occasional white details.

**Always use Ditto brand icons — a system-wide rule.** Every icon in anything an agent creates — slides, docs, prototypes, UI, exported assets — must come from this set (via `<ditto-icon name="…">` or the inline SVG). Never use generic, third-party or ad-hoc icon sets (Lucide, Font Awesome, Material, emoji, unicode glyphs or hand-drawn shapes). If an affordance you need (chevron, close, etc.) isn't in the set, pick the closest brand icon and flag the gap — do not substitute another library.

**Colour rules:**

- On white/light surfaces: use as supplied
- On purple surfaces: purple ink → white; orange and white stay unchanged
- Never place icons on an orange background

**Sizing:** render at a consistent pixel size within a given context. Prefer **`-filled` variants at small sizes** (≤24px).

**Restricted icons:** `ditto-ID`, `ditto-verify`, `ditto-authenticate`, `ditto-protect` — use **only alongside a mention of the matching product**.

**Usage:** use icons standalone — do not place them onto individual shapes or coloured containers. **In presentations, render icons at a minimum of 40px** (keep sizing consistent across a deck).

### 06 Imagery

Warm, customer-first photography of happy, confident people, often with a device. Available in `assets/photos/`. Use in aperture shapes; always centre the key subject clearly within the shape. Aperture photos are for **presentation covers only**.

**Per-image crop — you must apply these.** `object-fit:cover` alone centres each photo and pushes the subject off. Copy the exact `object-position` (and scale where noted) onto the `<img>` inside the aperture so the subject lands correctly:

| File | `object-position` | Notes |
| --- | --- | --- |
| `woman-phone-city.jpeg` | `0% 25%` | |
| `person-trading-phone.jpg` | `50% 30%` | |
| `couple-phone-street.jpg` | `40% 25%` | |
| `woman-phone-city-night.jpg` | `50% 20%` | |
| `woman-earbuds-orange-jacket.jpg` | `75% 20%` | also `transform:scale(1.15); transform-origin:75% 20%` |
| `man-phone-urban.jpg` | `30% 10%` | |
| `man-shared-workspace.jpg` | `50% 15%` | |
| `man-walking-phone.jpg` | `40% 15%` | |
| `couple-working-office.jpg` | `50% 20%` | |

New photos: preview in the **06 Imagery** card, tune `object-position` until the subject is centred in the aperture, then record the value here.

### 07 Feature cards

Five permitted card styles only — no other colours, strokes, highlights or stylings:

1. No fill, `#D7CCE0` stroke
2. `#F9F4FF` fill, no stroke
3. Tint cyan `#e4ffff` fill, no stroke
4. Brand purple `#350063` fill, no stroke
5. No fill, orange `#fd4e19` stroke

Orange stroke is for **highlights / feature callouts only** — not as standard card styling. Default cards use styles 1–4.

**On a brand purple background, use only white-fill or `#F9F4FF`-fill cards (no stroke)** — none of the other styles.

**No accent stripes.** Never add a coloured bar, stripe or thick border to one edge of a card or container — no `border-left: 4px solid red`, no inset severity bar down the left side, no top/bottom accent rule. A card's border is uniform on all four sides (1px `#D7CCE0`, or the orange highlight stroke) or absent. To signal severity, status or category, use a **badge/pill** inside the card (see the Badge component and the Feedback & alerts UI card), or the whole-card pale tint fill with a matching 1px border on all sides — never an edge stripe.

**Divider lines** are a separate element — always use `#D7CCE0`.

### 08 Colour restrictions

- Do not use gradients. Brand colours in their true values only — never as gradients
- Light tints (orange/purple ramps and secondary tints) may be used **only for subtle fills and data steps — keep usage to a minimum.** Never tint the three core brand colours in titles, copy, logos, dots or icons; those stay exact hex
- Do not mix brand colours in titles and copy
- On purple backgrounds: text in orange or white only
- Page backgrounds: white, brand purple `#350063`, or tint cyan `#e4ffff` only — no gradients
- In headline and subtitle fonts: use purple as default. Orange only to add colour to a page or highlight features
- Do not combine brand orange with any colour other than brand purple or white
- Do not combine brand purple with any colour other than orange or white

---

## Colors

### 01 Primary colours

| Name | Token | Hex | Use |
| --- | --- | --- | --- |
| Ditto orange | `--ditto-orange` | `#fd4e19` | Primary brand — leads on every layout |
| Ditto purple | `--ditto-purple` | `#350063` | Ground — headlines, dark surfaces, icon strokes |
| Lime | `--ditto-lime` | `#d6de24` | Spark — data, highlights |

### 02 Secondary colours (digital tints — backgrounds and fills only)

| Name | Token | Hex |
| --- | --- | --- |
| Tint cyan | `--tint-cyan` | `#e4ffff` |
| Tint mint | `--tint-mint` | `#c1ffc7` |
| Tint lime | `--tint-lime` | `#f2ffd6` |

### 03 Orange tints

Tint/shade scale from the primary brand orange — for subtle fills and data steps only.

### 04 Purple tints

Deep purple grounding scale — for subtle fills and data steps only.

### 05 Neutrals

Grey scale for text, lines and subtle surfaces (`#000000` → `#ffffff`). Secondary text uses `#595959`.

### Token reference

Reference tokens by name — never hard-code hex. Full definitions in `tokens/colors.css`.

**Palette:** `--ditto-orange` · `--ditto-purple` · `--ditto-lime` · `--ditto-black` · `--ditto-white` **Ramps:** `--orange-050…700` · `--purple-050…900` · `--lime-100…600` · `--grey-050…900` **Tints:** `--tint-cyan` · `--tint-mint` · `--tint-lime`

**Semantic aliases (prefer these):**

| Role | Token |
| --- | --- |
| Headline text | `--text-strong` |
| Body text | `--text-body` |
| Secondary / caption text | `--text-muted` (`#595959`) |
| Text on orange/purple fills | `--text-on-brand` |
| Accent text | `--text-accent` |
| Page / card surface | `--surface-page` / `--surface-card` |
| Purple surface | `--surface-purple` |
| Orange surface | `--surface-brand` |
| Cyan-tint surface | `--tint-cyan` |
| Divider / hairline | `--border-subtle` (`#D7CCE0`) |
| Icon linework / accent | `--icon-ink` / `--icon-accent` |
| Primary action + hover/active | `--action-primary` / `-hover` / `-active` |
| Focus ring | `--focus-ring` |
| Chart series 1–3 | `--chart-1` / `--chart-2` / `--chart-3` |
| Table header fill / text | `--table-head` / `--table-head-fg` |

---

## Type

**Typeface: Poppins only.** Self-hosted woff2 in `assets/fonts/`. Never use another typeface.

### 01 Headings

Weight reduces as size increases:

| Level | Size token | Size | Weight |
| --- | --- | --- | --- |
| H1 | `--fs-h1` | 40px | Light (300) |
| H2 | `--fs-h2` | 32px | Regular (400) |
| H3 | `--fs-h3` | 26px | Medium (500) |
| H4 | `--fs-h4` | 21px | SemiBold (600) |

Hero display sizes above H1: `--fs-hero` (64px), `--fs-display` (48px). Colour: `#350063` (brand purple) as default. Use orange only to add emphasis or colour — not as the default headline colour.

### 02 Subtitles and body

- Lead / subtitle: 19px (`--fs-lead`), Regular
- Body: 16px (`--fs-body`), Regular
- Small body: 14px (`--fs-sm`), Regular

Body copy colour: `#000000`. Secondary/caption text: `#595959`.

### 03 Eyebrow & caption

- Eyebrow (small): 12px, SemiBold, `#fd4e19`, tracking `0.04em`
- Eyebrow (medium): 14px, Medium, `#fd4e19`, tracking `0.04em`
- Eyebrow (large): 16px, Medium, `#fd4e19`, tracking `0.04em`
- Caption / secondary text: 11px, Regular, `#595959`

**⚠ Eyebrows are never capitalised — sentence case only (e.g. "Key features", not "KEY FEATURES" or "Key Features"). Do not italicise, change weight, change colour, or underline.**

### 04 Weights

| Weight | Token | Value | Use |
| --- | --- | --- | --- |
| Light | `--fw-light` | 300 | Large display headings only |
| Regular | `--fw-regular` | 400 | Body copy, always |
| Medium | `--fw-medium` | 500 | Subheadings, eyebrows ≥12px |
| SemiBold | `--fw-semibold` | 600 | Small labels, emphasis, H4, stat numbers |

**Bold (`--fw-bold`, 700) is not used.**

**Other type tokens:** family `--font-sans` · line-heights `--lh-tight/-snug/-normal/-relaxed` · tracking `--ls-tight/-normal/-eyebrow` · caption/label size `--fs-caption` / `--fs-label` (11px). Full definitions in `tokens/typography.css`.

### 05 Writing style

**Do:**

- Write in sentence case — headings, titles, eyebrows, bullets, everything
- Use standard English spelling (colour, not color; personalisation, not personalization)
- Use semibold sparingly for emphasis where the font is small
- **Bullet markers are always brand orange `#fd4e19`** — in every list, on any background. A `<ul>` disc inherits the `<li>` text colour, so it renders black/white by default: set `list-style:none` and prepend an explicit orange `•` (`<span style="color:var(--ditto-orange)">•</span>`). Marker colour is orange even when the list text is black or white
- Use "and" and "or" in full — avoid & and + unless space requires

**Don't:**

- Capitalise entire words or phrases (no ALL CAPS anywhere)
- Capitalise eyebrow labels, overline headings or subtitles beyond sentence case
- Use italics — use semibold for emphasis instead
- Use emoji

---

## Components

React primitives exported from `_ds_bundle.js` under `window.DittoDesignSystem_b6143a`:

| Component | Use |
| --- | --- |
| `Button` | Primary, secondary, ghost — 6px/8px radius, never fully pill; never add glows or drop shadows |
| `Badge` | White on orange, white on purple, or 050-tint versions only |
| `Card` | Five permitted styles only (see Feature cards above) |
| `StatCallout` | Orange numbers (Regular weight), supporting label |
| `IconFeature` | Icon + label — standalone, not on a coloured shape |
| `Avatar` | Circular portrait, consistent white border or no border |
| `Logo` | Wraps the correct wordmark variant for the background |
| `ApertureImage` | Photo in the aperture shape with the correct per-filename crop baked in |

See `.prompt.md` beside each component for usage notes and props.

### UI patterns (`group="UI"` cards)

Digital-product UI conventions that aren't (yet) coded components — documented as specimen cards in `guidelines/ui-*.card.html`. Build these from the tokens; they follow the same flat, hairline-bordered, orange-accented language as the rest of the system.

| Card | Rule |
| --- | --- |
| Form fields (`ui-01`) | 1.5px hairline border, 6px radius (`--radius-xs`); focus is a 3px pale ring in the field colour (orange normally, red on error), never a shadow; labels purple-medium; errors show a red border + message |
| Selection controls (`ui-02`) | Checkbox / radio / toggle — selected state always fills brand orange (white check/knob, orange radio dot); never purple or lime; disabled drops to grey |
| Feedback & alerts (`ui-03`) | Four semantic states — success green, info purple, warning orange, danger red; pale tint fill + 1px matching border, flat |
| Navigation (`ui-04`) | Tabs, links, breadcrumbs — active path marked orange (3px underline on the active tab; orange inline links underlined on hover); current breadcrumb in purple |
| Sidebar navigation · light (`ui-05`) | Vertical nav on white — items brand-purple text; hover = pale purple (`--purple-050`) fill; active = solid brand-purple fill with white label and `tone="on-purple"` icon; 10px radius, 20px icons, flat |
| Sidebar navigation · dark (`ui-06`) | Vertical nav on a brand-purple rail — items white at 72%; hover `#491A73`, active `#5D3382`, both white label; icons `tone="on-purple"`; 10px radius, 20px icons, flat |
| Utility icons (`ui-07`) | Five UI-only glyphs — `ui-chevron-down`, `ui-chevron-up`, `ui-back`, `ui-close`, `ui-tick`; 16–20px inside controls; purple ink on light, white on purple |

Both sidebar cards are **live prototypes** — hover previews the hover fill and clicking selects a new active item (one active at a time). Reuse that interaction pattern when building nav.

_Icons in any UI pattern must be Ditto brand icons — see the system-wide rule under Iconography._

**Status icons.** Alerts and inline hints use the brand circular status glyphs: filled `tick-filled`, `info-filled`, `exclamation-filled`, `cross-filled` inside alerts (set `--icon-accent` to the state colour — green / purple / orange / red); outline `info` and `exclamation` for inline hints and helper text. Never draw your own circle-and-bar glyph.

**Utility icons (`ui-*` names in `assets/icons/`).** `ui-chevron-down`, `ui-chevron-up`, `ui-back`, `ui-close`, `ui-tick` exist **only** for interface control affordances: dropdown/select arrows, accordion toggles, back buttons, close/dismiss, checkbox and selected-row ticks. Render them via `<ditto-icon name="ui-close">` at 16–20px (24px max). They are utility furniture, not brand expression — never use one on a slide, in a document, or as a content icon, and never in place of a brand icon where the subject isn't a UI control (a tick meaning "verified"/"approved" is the brand `approved` or `tick-filled` icon). Purple ink `#350063` on light surfaces; on brand-purple backgrounds recolour to white with `tone="on-purple"` (or `--icon-ink:#fff`). No orange accent.

---

## Files

```
styles.css              — link this; imports all tokens
tokens/
  colors.css            — CSS custom properties for all palette values
  typography.css        — font sizes, weights, tracking, line-height
  effects.css           — radii, aperture clip-path, focus ring, motion
  fonts.css             — @font-face (Poppins woff2)
  base.css              — reset + utilities
components/
  core/                 — Button, Badge, Card, StatCallout, IconFeature, Avatar, Logo, ApertureImage
guidelines/             — specimen cards shown in the Design System tab (Brand, Colors, Type, UI)
assets/
  logos/                — wordmarks, product logos, dot SVGs
  icons/                — 84 brand SVGs + ditto-icon.js web component
  photos/               — photo library for aperture use
  fonts/                — Poppins woff2 files
  maps/                 — world-map.svg (country-highlighted)
  team/                 — team portrait photos
templates/
  ditto-deck/           — presentation deck template (DC)
  ditto-doc/            — A4 document template (DC)
```

---

## Templates

### `templates/ditto-deck/` — presentation deck

A ready-to-use 30-slide deck (`DittoDeck.dc.html`), 1280×720 per slide, wired to the design system via `ds-base.js`. Use it as the starting point for any Ditto presentation — duplicate a slide's markup to add more of that layout. Tweakable props (presenter name/role/email, accent, etc.) are declared on the DC. Slides:

| # | Layout | When to use | Visual |
| --- | --- | --- | --- |
| 01 | Title / cover | Opens every deck | Aperture photo filling the right half (cover-only aperture use) |
| 02 | Agenda | Second slide — set expectations | Numbered contents list |
| 03 | Statement | Bold single-sentence thesis or transition | Full-bleed purple, large statement, single corner dot |
| 04 | Statistics | Three proof points side by side | Three stat callouts in a row, orange numbers |
| 05 | Feature | Explain one capability with a supporting image | Text + purple aperture flush to bottom-right |
| 06 | Big statistic | One headline number you want to land hard | One oversized number on purple, corner dot |
| 07 | Section divider | Break the deck into chapters | Giant orange section number + title |
| 07b | Chapter (split) | Chapter opener with a contents list | Purple ground, cyan aperture panel, white number/title |
| 07c | Chapter (split, white) | Chapter opener, lighter treatment | White ground, purple aperture panel, purple number |
| 08 | Chart & table | Quantitative data with a supporting table | Bar/line chart with purple-header table |
| 08b | Pie chart | Show composition / share of a whole | Single pie with legend |
| 08c | World map | Geographic reach or market coverage | Country-highlighted `world-map.svg`, orange/purple regions |
| 09 | Pull quote | **Real quotes only** — a genuine customer or leadership quote. Never as a generic large-text or statement layout (use 03 Statement for that) | Purple ground, brand quote mark, corner dot |
| 10 | Two column | Compare two things, or text beside detail | Side-by-side body content |
| 11 | Icon grid | 3–6 features/benefits at a glance | Brand-icon feature grid |
| 12 | Timeline | Roadmap or sequence over time | Quarterly milestones on a hairline, orange nodes |
| 13 | Three-column bullets | Three parallel lists of short points | Three parallel lists, orange bullets |
| 14 | Image statement | Emotive full-bleed moment with a short line | Full-bleed photo + solid purple aperture panel |
| 15 | Team | Introduce people (4–6) | Auto-grid (2×2 for 4, 3+2 for 5, 3×3 for 6); CEO first |
| 16 | Lead-in | Frame an argument or open a section | Eyebrow + large heading + lead paragraph, card-free |
| 17 | Numbered list | Ordered steps or a process | Big orange numerals with title + description, hairline dividers |
| 18 | Text + figure | Narrative beside proof points | Prose left, oversized orange stat figures right |
| 19 | Body statement | A claim with two supporting notes | Large heading + two footer text blocks (bold left, regular right) |
| 20 | Heading + copy | Dense long-form explanation | Left heading, right multi-paragraph column |
| 21 | Circle image | Emotive portrait beside a heading | Half-circle photo flush left, heading + body right |
| 22 | Tint cards | Three parallel offers/pillars | Centred heading + three tint cards (lime/cyan/mint), standalone icons |
| 23 | Stat trio | Three headline numbers with context | Three hairline-divided columns, oversized orange figures |
| 24 | Text + bar chart | Comparative data across categories | Left text, right grey panel with grouped horizontal bar chart |
| 25 | Split bullets | Detailed feature list beside a heading | White heading half + purple panel with white/orange bullets |
| 26 | End | Closes every deck | Purple, centred logo, `sales@ditto.id` / `ditto.id` in the lower corners |

To build a deck: copy this template, keep the cover/end slides, and mix the inner layouts as needed. For layout inspiration beyond these, see the layout reference below — but always follow the main design system for colours, type, icons and brand rules.

**Vary layouts across content pages.** Where possible, alter the layout from one content page to the next so the same structure and elements aren't repeated across consecutive slides — e.g. don't follow a bulleted slide with another identical bulleted slide. Alternate between text-led, stat-led, image, list, quote and two-column layouts to give the deck rhythm. Always stay on brand to the design system; vary the composition, not the visual language.

`uploads/Ditto-Protect-WORKING - DO NOT USE.pptx.pdf` — a Ditto Protect presentation included as a **layout reference only**. Use it for inspiration on slide composition and content arrangement. Do not derive new design rules or guidelines from it — follow the main design system for all colours, type, icons, logos and brand decisions.

---

### `templates/partner-playbook/` — Connect Partner Program playbook

**Usage rules — playbooks only.** These apply to Connect Partner Program playbooks and nowhere else; playbooks are a separate design series and their stylings must not be carried into decks, documents, product UI or any other artefact.

1. **A5 landscape** — 210 × 148 mm, every playbook, every page. Never A4, never 16:9.
2. **Cover background** — `assets/playbook-partner/cover-background.png`, full-bleed on every cover page. No crop, overlay tint, recolour or substitute.
3. **Copy the existing playbooks.** Read the closest published playbook first and replicate its layout, design and stylings as closely as possible — page furniture, type sizes, section numbering, spacing, card treatments. Reuse its pages rather than designing new ones.
4. **Running headers** — `Ditto Protect • [document title]` top-left of every page, weight 500, secondary text colour `#595959` on white pages.
5. **Page titles** — weight 500 on every page; never bolder than this anywhere in a playbook.
6. **Divider circles track progress.** One circle per part: the large circle carries the incoming part's title and copy, the small circles are the other parts — those to its left already read, those to its right still to come. A divider for part 2 of 4 reads: one small circle, the large circle, then two small circles. The row sits on a pale purple rail through the vertical centre of the page.
7. **Keep the series separate.** Where a playbook styling differs from the wider design system, the playbook wins inside a playbook — and stays inside it.

**Reference only.** The three published Ditto Protect playbooks — App assessments (18pp), 30-60-90 day plan (14pp), BANT template (12pp) — with every page rendered and the source PDFs alongside. This set has stylings unique to it; when building a new playbook, read the closest published PDF and replicate its layouts, page size, furniture, type sizes and section numbering exactly rather than restyling it or applying the wider document rules from this design system.

Source PDFs in `templates/partner-playbook/reference/`, page renders in `reference/pages/`.

**Playbook-only assets** live in `assets/playbook-partner/`. Deliberately outside the wider design system — use them in Connect Partner Program playbooks only, never in decks, documents, product UI or any other artefact.

| File | Use |
| --- | --- |
| `cover-background.png` | Full-bleed background on **every cover page** — no crop, tint or recolour. Source `cover-background.pdf` alongside it. |
| `connect-lockup-light.svg` | Foot-of-cover lockup on the purple cover: lockup, thin white pipe divider, then `assets/logos/ditto-protect-white.png`. |
| `connect-lockup-dark.svg` | Purple-and-orange alternative, for a white cover only. |
| `connect-icon-light.svg` | Top-right page mark on **purple** pages (cover, introduction, back cover). |
| `connect-icon-main.svg` | Top-right page mark on **white** pages. |

Cover composition: cover background full-bleed, `assets/logos/ditto-logo-orange-white-dots.svg` top-left, document title in white light weight lower-left, lockup at the foot. Interior pages carry the Connect icon top-right in place of the standard Ditto dots mark — same size and position on every page.

### `templates/ditto-doc/` — A4 document

A ready-to-use A4 document (`DittoDoc.dc.html`) for Word / Google Docs–style deliverables — briefs, reports, one-pagers. Explicitly paginated with `<doc-page size="a4">`, wired to the design system via `ds-base.js`, and **prints straight to A4**. Use it as the starting point for any Ditto branded document — duplicate a page's markup to add more of that layout. Type scale: body 10pt, subheadings 12pt, page headings 18pt, eyebrow 12pt, header/footer 9pt; orange bullets, purple headings, `#F9F4FF` tint pull-quotes.

| # | Page | When to use |
| --- | --- | --- |
| 1 | Cover | Opens every document — purple aperture (flush top/right, notched top-left, rounded bottom-left), white logo, orange eyebrow, large title, "Prepared by" |
| 2 | Contents | Numbered table of contents with page numbers |
| 3 | Chapter divider | Break the document into sections — purple aperture flush right/bottom, orange subtitle, large section title |
| 4 | Introduction (single column) | Standard body copy — eyebrow + heading + prose + orange bullets + tint pull-quote |
| 5 | The opportunity (two column) | Full-width heading, body flowing through two balanced columns |
| 6 | How Ditto works (single column + image) | Full-width copy with a full-width image and caption |
| 7 | Privacy by design (two column + image) | Two columns, image in one column |
| 8 | Plans (branded table) | Comparison/data table — purple header row, alternating `#F9F4FF` tint rows, orange dots for included items |
| 9 | End | Closes the document — logo, headline, short closing copy, "Prepared by" names and contact info |

To build a document: copy this template, keep the cover/contents/end pages, and mix the inner page layouts (single column, two column, with/without image, table) as needed. Vary the layout page to page for rhythm, and always follow the main design system for colours, type, icons and brand rules.

---

## Hallucination rule

Never invent statistics, quotes, customer names, dates or outcome claims. Use only verified figures or insert `[STAT NEEDED: …]` / `[QUOTE NEEDED: …]` placeholders.
