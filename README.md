# Ditto assessments

Self-hosted quiz and assessment platform for Ditto's sales and partner
enablement. Next.js + TypeScript + Tailwind, brand system self-contained in
`brand/`, Notion as the results backend (added in a later step). Full spec:
[`../ditto-quiz-tool-prompt-final.md`](../ditto-quiz-tool-prompt-final.md).

**Status: step 4 of 5** — repo scaffold + brand tokens (step 1), the quiz
content model (step 2), the Notion backend (step 3), and the taking
experience (step 4) are all done: `/q/[slug]` runs the full intro → question
→ end flow for every question type, resume-safe, and writes real Response +
Answer rows to Notion in the background (never blocking the score screen).
Only the embed route is left. See `CLAUDE.md`'s "Build order" and "Taking
experience" sections for details.

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

## Deploy

Not deployed yet. Target is Vercel's free (Hobby) tier, no custom domain for
now — deploying to the default `*.vercel.app` URL until the `learn.ditto.id`
subdomain is ready. Exact deploy steps will be documented here once the app
does something worth deploying (after step 3/4).
