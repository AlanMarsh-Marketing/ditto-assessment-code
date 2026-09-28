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
  `submitQuizAttempt` (`app/q/[slug]/actions.ts`) does the Notion writes
  in-process rather than via `after()` — the client just doesn't `await` the
  action before moving to the end screen (see "Taking experience" below), so
  the writes still complete inside the same invocation, well inside Hobby's
  function-duration cap for a handful of small API calls.

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
guessing.

Beyond that original table, two things were added after the initial build,
both backfilled onto the already-existing databases via the same idempotent
script (re-running `setup:notion` is always safe, it only adds what's
missing):
- Responses gets two `show_original` rollups off the Answers relation —
  **"Answer text"** and **"Answer correct?"** — so the Responses grid shows
  a compact per-response answer summary without opening anything.
- Answers gets a **"Correct answer"** rich-text column: the human-readable
  *expected* answer (via `lib/scoring.ts`'s `formatCorrectAnswerText`),
  independent of what the taker actually submitted — blank for
  `shortText`/`confidence`, which have no correct answer. This sits
  alongside the existing `Answer` (what was given) and `Correct` (whether
  it matched), so a reviewer sees given/expected/right-or-wrong together
  without cross-referencing the quiz JSON.

Real ids are in the untracked `.env` (never commit them — see
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

The write path (`app/q/[slug]/actions.ts`'s `submitQuizAttempt`) creates the
Response page, then one Answer page per question via
`mapWithConcurrency(quiz.questions, 3, …)` (`lib/concurrency.ts`), each
wrapped in `withRetry()` (`lib/notion.ts`, 2 retries, exponential backoff).
It **never trusts a client-sent score** — `lib/scoring.ts`'s pure functions
(`scoreQuiz`, `isAnswerCorrect`, `formatAnswerText`) are the one place
scoring/formatting logic lives, called independently by both the client
(instant end-screen render) and the server action (the authoritative Notion
record), from the same raw per-question answers. On any failure (response
write, or any answer write, after retries) it logs the complete submission
as structured JSON (`console.error`, picked up by Vercel's function logs —
the only record of a lost response, since there's no dashboard or alerting)
and returns a short reference code, shown as a discreet line on the score
screen. Verified end-to-end, including a deliberately forced failure (bad
`NOTION_ANSWERS_DB_ID`) — logged output included the full submission, the
real Notion error, and the same reference code shown to the taker.

## Taking experience (`app/q/[slug]/`, `components/quiz/`)

`QuizRunner` (client component) owns intro → one question per screen → end.
It keeps a `sessionRef` (plain ref, not state) as the single source of truth
for identity/order/responses/timing — every handler reads and writes
through it, so nothing depends on a `setState` closure being fresh when two
things happen in the same tick (e.g. answering and advancing on one click,
for `shortText`/`confidence`). **This bit onto a real bug once**: an early
version of the `order` question had its own component call back into a
`useState` closure to report the finished sequence instead of passing the
freshly-computed array — same-tick staleness, silently scored the
second-to-last state. Fixed by having `OrderPicker` pass its own computed
array to `onLock` directly. Worth remembering if a similar "child finishes
an interaction and reports it in the same synchronous call as its last
`onChange`" pattern comes up again.

- **Resume-safety**: `lib/quiz-storage.ts` persists the session to
  `localStorage` (keyed `ditto-quiz:<slug>`) on every state-changing action.
  `status: "completed"` blocks resuming into an editable attempt — reloading
  re-derives and re-shows the same result from the stored responses (via
  `scoreQuiz`) instead. A **Retake** button on `EndScreen` (`onRetake` →
  `QuizRunner.handleRetake`) clears that stored session and returns to the
  intro screen for a genuinely new attempt — this isn't editing the
  previous submission, it creates a fresh Notion Response/Answer set on the
  next completion, so "no edit-after-submit" still holds. Always shown, not
  just after a fail: the badge copy ("Not yet — retake with your manager")
  already implied a retake path before one actually existed. No limit on
  how many times — an honor-system feature for an internal enablement tool,
  not an anti-cheat boundary; a determined person could always have cleared
  storage manually anyway.
- **`order` questions** render as tap-to-build-a-sequence, not literal
  drag-and-drop — more reliable at 375px, no drag library dependency. The
  item pool is shuffled via a seed derived from the question id
  (`lib/shuffle.ts`'s `seededShuffle`), so the JSON file's `items` array
  order is irrelevant to gameplay (only `correctOrder` matters).
- **Timers** (`timePerQuestionSeconds`): one `setInterval` per question,
  auto-locking whatever's selected (or nothing) at zero and auto-advancing
  shortly after (longer pause if feedback is on, so there's time to read it).
- **Respondent/Email/Partner** on the Notion Response row are a best-effort
  mapping from the fully config-driven `identityFields` (`deriveIdentitySummary`
  in `lib/scoring.ts`): first field → Respondent, first `type: "email"` field
  → Email, first field whose key/label matches `/partner|company/i` →
  Partner. `Identity (raw)` is the reliable full JSON dump; these three are
  just convenience columns and are blank when a quiz has no matching field.
- **Brand bug fixed along the way**: `brand/ditto-tokens.css`'s own
  `.ditto-eyebrow` class hardcodes `text-transform: uppercase`, contradicting
  its own documentation (readme.md, SKILL.md, and the tokens.json comment all
  say eyebrows are sentence-case, never capitalised) three times over.
  Overridden in `app/globals.css` (not in `brand/`, which stays an untouched
  reference copy) — sided with the repeated written rule over the one class
  that disagreed with it.

## Embedding (`app/embed/[slug]/`, `public/embed.js`)

`/embed/[slug]` renders the same `QuizRunner` as `/q/[slug]` (via the shared
`resolveQuizOrNotFound` in `lib/quiz-request.ts`), just without full-viewport
centering — `QuizRunner`/`IntroScreen`/`EndScreen`/`ClosedScreen` all take an
`embed` prop that swaps `minHeight: "100dvh"` for a compact, top-aligned
layout. `EmbedResizeReporter` posts the page's content height to the parent
window on mount and on every `ResizeObserver` change; `public/embed.js`
(pasted as one `<script data-quiz="slug">` tag into e.g. a WordPress page)
creates the iframe and resizes it on those messages.

**A real bug here too**: the resize reporter first measured
`document.documentElement.scrollHeight`. That's `max(content, viewport)` —
once the parent grows the iframe to fit a tall screen (the intro form), the
document root can never report *smaller* for a shorter one (a question with
no explanation panel yet), because its own `scrollHeight` floors at the
iframe's current (already-tall) viewport height. Confirmed by testing an
actual embed in a browser, not just reading the code — the iframe visibly
failed to shrink between screens. Fixed by measuring a dedicated
`#ditto-embed-content` wrapper (`EMBED_CONTENT_ID`) instead, which is sized
by its own content regardless of the iframe's current height.

`draft` needs `data-preview="1"` on the script tag (in addition to the
quiz's own `?preview=1` gate) to be embeddable at all — same never-writes
guarantee as everywhere else.

## Build order

Working through `../ditto-quiz-tool-prompt-final.md`'s build order, stopping
for review after each step:

1. ✅ Repo scaffold, tokens wired into Tailwind, branded static page (`/`).
2. ✅ Quiz schema (Zod), three example quiz files.
3. ✅ `setup:notion` script, Responses + Answers databases (created — see
   "Notion conventions" above).
4. ✅ Taking experience end to end, writing to Notion (see "Taking
   experience" above) — verified with real Notion writes across all 6
   question types, the no-passMark + shuffled quiz, draft/preview gating,
   the closed-quiz screen, resume-safety, 375px layout, and a forced
   write-failure.
5. ✅ Embed route (`/embed/[slug]`) + `public/embed.js` snippet (see
   "Embedding" above) — verified in a real browser (not just code review):
   a script tag in a plain HTML page correctly creates the iframe and
   resizes it across intro → question → feedback, including catching and
   fixing a real shrink-never-happens bug in the first version of the
   resize logic.

All five build-order steps are done. Remaining before this is a real
production tool: deploy to Vercel (see README's "Deploy" section), point
`learn.ditto.id` at it once DNS is ready, and decide whether to keep or
clear the two test attempts ("Jordan" / "Alex") already sitting in the real
Notion Responses/Answers databases from step 4's live testing.
