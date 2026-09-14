# Ditto assessments

Self-hosted quiz and assessment platform for Ditto's sales and partner
enablement. Next.js + TypeScript + Tailwind, brand system self-contained in
`brand/`, Notion as the results backend (added in a later step). Full spec:
[`../ditto-quiz-tool-prompt-final.md`](../ditto-quiz-tool-prompt-final.md).

**Status: step 1 of 5** — repo scaffold, brand tokens wired into Tailwind,
one branded static page (`/`) proving the design system renders correctly.
No quiz content, no Notion integration yet. See `CLAUDE.md`'s "Build order"
for what's next.

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

## Env vars

None yet — `NOTION_TOKEN`, `NOTION_PARENT_PAGE_ID`, `NOTION_RESPONSES_DB_ID`
and `NOTION_ANSWERS_DB_ID` land with the Notion setup step, along with a
`.env.example`.

## Deploy

Not deployed yet. Target is Vercel's free (Hobby) tier, no custom domain for
now — deploying to the default `*.vercel.app` URL until the `learn.ditto.id`
subdomain is ready. Exact deploy steps will be documented here once the app
does something worth deploying (after step 3/4).
