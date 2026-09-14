# Ditto assessments

Self-hosted quiz and assessment platform for Ditto's sales and partner
enablement. Next.js + TypeScript + Tailwind, brand system self-contained in
`brand/`, Notion as the results backend (added in a later step). Full spec:
[`../ditto-quiz-tool-prompt-final.md`](../ditto-quiz-tool-prompt-final.md).

**Status: all 5 build-order steps done** — repo scaffold + brand tokens,
the quiz content model, the Notion backend, the taking experience
(`/q/[slug]`, resume-safe, writes real Response + Answer rows to Notion in
the background), and now the embed route + snippet (`/embed/[slug]` +
`public/embed.js`). See `CLAUDE.md`'s "Build order" and "Taking experience"
sections for the implementation details. Not yet deployed — see "Deploy"
below.

## Adding a quiz

Add a new `/quizzes/<slug>.json` (slug must match the filename) following
the shape in `lib/quiz-schema.ts` — the three example files are the easiest
starting point to copy. Run `npm run validate:quizzes` to check it (or just
`npm run build`, which runs it automatically); a bad file prints exactly
which field is wrong rather than failing silently.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the brand sampler
page, or [http://localhost:3000/q/partner-onboarding-basics](http://localhost:3000/q/partner-onboarding-basics)
(and the other two slugs in `/quizzes`) to take a quiz. A `draft` quiz
(`product-fundamentals-quickcheck`) needs `?preview=1` and never writes to
Notion regardless of `.env`.

## Brand system

Everything under `brand/` is the Ditto Design System handoff bundle
(tokens, fonts, icons, logos, component source, full guidelines). **Read
[`brand/BRAND.md`](brand/BRAND.md) before touching any UI** — every colour,
font, radius and spacing value must come from `brand/ditto-tokens.css`.
Ported, ready-to-use React components live in `components/ds/`.

## Notion backend

`npm run setup:notion` creates the Responses and Answers databases under
`NOTION_PARENT_PAGE_ID` (see `.env.example` for the four required vars) — it's
idempotent, safe to re-run. It only creates the databases and their
properties; Notion's API can't create saved views, so create these by hand
once, in the Notion UI (the setup script prints this same list):

- Responses grouped by Quiz, sorted by Submitted descending
- Responses filtered to Passed = false
- Answers grouped by Question ID, filtered to one quiz — distractor analysis
- Answers grouped by Tags, with the Correct checkbox rolled up — topic-level weakness
- Answers filtered to Type = shortText — free text in one place for Notion AI to summarise

A response failing to save is logged as structured JSON to the server
console (Vercel function logs in production) with a short reference code —
the same code shown to the taker on a discreet line on the score screen, so
a lost response gets reported back to you rather than disappearing
silently.

## Embedding

The app is fully usable on its own subdomain (`/q/[slug]`), or drop a quiz
into any other page — a WordPress page, for example — with one snippet:

```html
<script src="https://learn.ditto.id/embed.js" data-quiz="partner-onboarding-basics"></script>
```

Paste it where the quiz should appear (a WordPress "Custom HTML" block
works well) — it inserts a responsive iframe right there and resizes it
automatically as the quiz moves from intro → question → end, each a
different height. No extra markup, no manual iframe sizing. Swap
`data-quiz` for any other quiz's slug.

Only `status: "live"` quizzes work by default — `closed` shows the same
closed message as the full site, and `draft` 404s unless you also add
`data-preview="1"` (mirrors `/q/[slug]`'s own `?preview=1`); a previewed
draft never writes to Notion, same as everywhere else. Optionally set
`data-height="600"` to change the iframe's height before the first real
measurement arrives (default 480).

Multiple quizzes on one page: paste the snippet again with a different
`data-quiz` — each `<script>` tag creates its own independent iframe.

## Deploy

Not deployed yet. Target is Vercel's free (Hobby) tier, no custom domain for
now — deploying to the default `*.vercel.app` URL until the `learn.ditto.id`
subdomain is ready. Exact deploy steps will be documented here once the app
does something worth deploying (after step 3/4).
