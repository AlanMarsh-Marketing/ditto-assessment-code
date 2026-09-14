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

## Content model (quiz schema) — added in step 2

Not yet built. Each quiz will be a single JSON file in `/quizzes/<slug>.json`,
validated against a Zod schema at build time. See the "Content model" section
of `../ditto-quiz-tool-prompt-final.md` for the full field list
(`identityFields`, question types, `settings`, etc.) — this section of
CLAUDE.md should be filled in with the concrete schema summary once step 2
lands, so future sessions don't have to re-read the full prompt.

`passMark` is a **percentage (0–100) or `null`** compared against
`Score / Max score`, not a raw point total — chosen because quizzes vary in
question count/mix, so percentage is the only unit that stays meaningful
across quizzes. `order` questions score all-or-nothing (exact sequence
required), matching `single`/`multi`/`trueFalse`.

## Notion conventions — added in step 3

Not yet built. `setup:notion` script, the Responses/Answers databases, and
the write path (concurrency-limited, retried, logged on failure) land in
step 3 — see the "Notion setup" and "Writing responses" sections of the
build prompt. Record the concrete DB property names/IDs here once created.

## Build order

Working through `../ditto-quiz-tool-prompt-final.md`'s build order, stopping
for review after each step:

1. ✅ Repo scaffold, tokens wired into Tailwind, branded static page (`/`).
2. Quiz schema (Zod), three example quiz files.
3. `setup:notion` script, Responses + Answers databases.
4. Taking experience end to end, writing to Notion.
5. Embed route (`/embed/[slug]`) + `public/embed.js` snippet.
