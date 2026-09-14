# Ditto assessments

Self-hosted quiz and assessment platform for Ditto's sales and partner
enablement. Next.js + TypeScript + Tailwind, brand system self-contained in
`brand/`, Notion as the results backend (added in a later step). Full spec:
[`../ditto-quiz-tool-prompt-final.md`](../ditto-quiz-tool-prompt-final.md).

**Status: step 3 of 5** — repo scaffold + brand tokens (step 1), the quiz
content model (step 2), and the Notion backend (step 3) are done. The
Responses and Answers databases already exist under the "Ditto Assessments"
Notion page. No taking experience yet — nothing writes to Notion until step
4. See `CLAUDE.md`'s "Build order" for what's next.

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

Open [http://localhost:3000](http://localhost:3000) — this currently shows a
brand sampler page (buttons, cards, stat callouts, icons), not a quiz.

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

Nothing writes to these yet — that's step 4 (the taking experience).

## Deploy

Not deployed yet. Target is Vercel's free (Hobby) tier, no custom domain for
now — deploying to the default `*.vercel.app` URL until the `learn.ditto.id`
subdomain is ready. Exact deploy steps will be documented here once the app
does something worth deploying (after step 3/4).
