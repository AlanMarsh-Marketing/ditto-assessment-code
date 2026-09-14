@AGENTS.md

# Ditto assessments — project conventions

Self-hosted quiz/assessment platform for Ditto's sales and partner
enablement. Next.js (App Router) + TypeScript + Tailwind + Framer Motion.
Notion (`@notionhq/client`) is the only persistence layer — no database, no
ORM, no auth, no admin UI. Full spec: `../ditto-quiz-tool-prompt-final.md`.

This is a production tool added to weekly. Favour boring, durable choices;
optimise for how easy it is to add a new quiz months from now.

## Brand — read before writing any component

**Read `brand/BRAND.md` first.** Every colour, font, radius and spacing
value must come from `brand/ditto-tokens.css` (wired into Tailwind's theme in
`app/globals.css`) — never hardcode a hex value, invent a palette, or use a
non-Poppins font. Icons only from `brand/icons/` via the `BrandIcon`
component — never a generic icon library or emoji. `components/ds/` holds
the ported design-system primitives (Button, Card, Badge, StatCallout,
Avatar, Logo, IconFeature, ApertureImage, BrandIcon) — build UI from these,
extending rather than duplicating them.

## Stack notes

- **Next.js 16** — this is a new major version; conventions may differ from
  older Next.js docs/training data. `AGENTS.md` (imported above) points at
  the bundled docs in `node_modules/next/dist/docs/` — check there before
  assuming an older-Next.js pattern (e.g. layout/page prop typing) still
  applies.
- Poppins is self-hosted via `next/font/local` (`lib/fonts.ts`), not a CDN —
  keep it that way for offline/privacy parity with the design system.
- Tailwind v4, CSS-first config (`@theme inline` in `app/globals.css`) — no
  `tailwind.config.js`. Tailwind's default spacing scale and font-weight
  utilities already match the brand's 8px grid and weight tokens exactly
  (see the comment at the bottom of `globals.css`); custom `text-h1`…
  `text-caption` utilities expose the brand type scale.
- Hosting: Vercel Hobby (free) tier for now, no custom domain yet — deploys
  to the default `*.vercel.app` URL until `learn.ditto.id` DNS is ready.
  Design background Notion writes around Hobby's ~10s function duration cap
  (use Next's `after()`, not an assumed long-running process).

## Content model (quiz schema)

Each quiz is `/quizzes/<slug>.json`. `lib/quiz-schema.ts` is the Zod schema
(source of truth for field names/rules — read it rather than trusting this
summary to stay perfectly in sync); `lib/quizzes.ts` loads and validates by
filename slug (and checks the file's `slug` field matches the filename).
`npm run validate:quizzes` (via `tsx`) validates every file and is wired in
as `prebuild`, so `npm run build` fails loudly on a bad quiz — no separate
step to remember.

- **Quiz**: `slug` (kebab-case, must match the filename), `title`,
  `description`, `status` (`draft`/`live`/`closed`), `audience` (free text),
  `settings`, `identityFields` (≥1), `questions` (≥1).
- **`settings`**: `showFeedbackImmediately`, `showScoreAtEnd` (bool),
  `passMark` — **percentage 0–100, or `null` for no pass mark** (chosen over
  a raw score because quizzes vary in question count/mix, so percentage is
  the only unit that stays meaningful across all of them; `null` is fully
  supported for quizzes that shouldn't gate on a score at all — see
  `objection-handling-scenarios.json`), `shuffleQuestions` (bool),
  `timePerQuestionSeconds` (number or `null`).
- **`identityFields`**: ordered `{key, label, type: text|email|select,
  required, options?}` — `options` required (non-empty) iff `type ===
  "select"`, rejected otherwise. Keys must be unique per quiz.
- **Questions** (`lib/quiz-schema.ts`'s `QuestionSchema`, a discriminated
  union on `type`): `single` (one correct option), `multi` (correct option
  set, all-or-nothing), `trueFalse`, `order` (`items` + `correctOrder` —
  validated as an exact permutation), `shortText` (free text, unscored),
  `confidence` (fixed 1–5 scale, unscored). Every type shares `id` (unique
  per quiz), `prompt`, optional `context` (scenario text), optional
  `explanation`, optional `tags`. `SCORED_QUESTION_TYPES` /
  `isScoredQuestion()` in `lib/quiz-schema.ts` is the one place that encodes
  which types count toward Score/Max score — `shortText` and `confidence`
  never do.
- Cross-field checks (superRefine, not just per-field): unique question ids,
  unique identity-field keys, option/item ids referenced by
  `correctOptionId`/`correctOptionIds`/`correctOrder` must actually exist and
  contain no duplicates, `correctOrder` must be an exact permutation of
  `items`.
- **Example quizzes**: `partner-onboarding-basics` (live, passMark 70,
  single/multi/trueFalse/shortText), `objection-handling-scenarios` (live, no
  passMark, shuffled, 60s/question, includes `order` + `confidence` +
  scenario `context`), `product-fundamentals-quickcheck` (**draft** — only
  reachable via `?preview=1` once the taking experience exists, 30s/question,
  trueFalse/single/order/confidence). Between them all 6 question types and
  both `passMark` states are exercised — replace their content, don't
  restructure their shape, when adding a real quiz.

## Notion conventions

`npm run setup:notion` (`scripts/setup-notion.ts`) creates the Responses and
Answers databases as children of `NOTION_PARENT_PAGE_ID`, with the exact
properties from the build prompt's "Notion setup" tables — read that script
rather than this summary for the authoritative property list. It's
idempotent: it looks for existing `child_database` blocks titled "Responses"
/ "Answers" under the parent page and reports their ids instead of
duplicating them; if it finds only one of the two, it stops rather than
guessing. Real ids are in the untracked `.env` (never commit them — see
`.env.example` for the shape); this repo's actual databases already exist
under the "Ditto Assessments" Notion page.

**Data sources — a wrinkle worth knowing.** `@notionhq/client` (installed:
v5.x) defaults to Notion API version `2025-09-03`, which introduced "data
sources" as a layer under databases — a database's actual properties/rows
live on its data source, and page creation/relations/queries all target a
`data_source_id`, not the `database_id` directly. `NOTION_RESPONSES_DB_ID` /
`NOTION_ANSWERS_DB_ID` stay plain database ids (matching the original spec),
and `lib/notion.ts`'s `getPrimaryDataSourceId(databaseId)` resolves the one
data source under each at runtime (cached per process) — always go through
that helper rather than assuming a database id works directly as a
`data_source_id` in a new call. The "Answers" relation on Responses and the
"Response" relation on Answers were created together as one dual-property
relation (`scripts/setup-notion.ts`), so both sides stay in sync
automatically.

The write path (queued/concurrency-limited answer writes, retried, logged
on total failure) lands in step 4 — see the "Writing responses" section of
the build prompt. `lib/notion.ts` already has a small `withRetry()` helper
for that.

## Build order

Working through `../ditto-quiz-tool-prompt-final.md`'s build order, stopping
for review after each step:

1. ✅ Repo scaffold, tokens wired into Tailwind, branded static page (`/`).
2. ✅ Quiz schema (Zod), three example quiz files.
3. ✅ `setup:notion` script, Responses + Answers databases (created — see
   "Notion conventions" above).
4. Taking experience end to end, writing to Notion.
5. Embed route (`/embed/[slug]`) + `public/embed.js` snippet.
