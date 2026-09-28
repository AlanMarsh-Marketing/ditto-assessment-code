# Writing a Ditto assessment quiz

Each quiz is a single JSON file in `/quizzes/<slug>.json`. The filename
(without `.json`) must exactly match the `slug` field inside it. Every file
is validated automatically — `npm run validate:quizzes`, and again
automatically before every build/deploy — so a typo or a bad reference
fails loudly with the exact field that's wrong, rather than shipping
something broken.

**Fastest way to start a new one**: copy the closest existing file in
`/quizzes` and edit it, rather than writing one from scratch — see "Which
example to copy" below.

---

## Top-level fields

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | kebab-case (`partner-onboarding-basics`), must match the filename |
| `title` | string | shown on the intro screen and in Notion's Quiz column |
| `description` | string | shown under the title on the intro screen |
| `status` | `"draft"` \| `"live"` \| `"closed"` | see below |
| `audience` | string | free text (e.g. `"Ditto Connect partners"`) — shown as the eyebrow above the title, and in Notion's Audience column |
| `settings` | object | see below |
| `identityFields` | array, ≥1 | the intro-screen form — see below |
| `questions` | array, ≥1 | see below |

### `status`

- **`"draft"`** — only reachable by adding `?preview=1` to the URL (or
  `data-preview="1"` on the embed snippet). Fully interactive, but **never**
  writes to Notion, no matter what's answered. Use this while you're still
  writing/reviewing a quiz.
- **`"live"`** — normal. Reachable at the plain URL, writes real responses
  to Notion.
- **`"closed"`** — shows a branded "this assessment is no longer accepting
  responses" message. No questions render, nothing writes anywhere. Use
  this to retire a quiz without deleting it (its past responses stay in
  Notion either way).

### `settings`

| Field | Type | Effect |
| --- | --- | --- |
| `showFeedbackImmediately` | bool | `true`: after answering, correct/incorrect shows on the tiles plus the question's `explanation`, then a *Next* button. `false`: just a *Next* button, no reveal. |
| `showScoreAtEnd` | bool | `true`: end screen shows the score %, pass/fail badge, and the per-tag "By topic" breakdown. `false`: end screen shows a generic "Thanks — your responses have been recorded" instead — nothing about the score is revealed to the taker. Either way, the real score is still recorded in Notion. |
| `passMark` | number (0–100) or `null` | **Percentage** of Score/Max score needed to pass — not a raw point total (quizzes vary in question count/mix, so percentage is the only unit that stays comparable). `null` means this quiz has no pass/fail concept at all: no badge shows, and Notion's `Passed` checkbox stays unchecked for every response. |
| `shuffleQuestions` | bool | `true`: a fresh random question order each attempt (locked in for that attempt, survives a reload). `false`: same order as written in the file. |
| `timePerQuestionSeconds` | number or `null` | `null`: untimed. A number: shows a countdown ring per question; hitting zero locks in whatever's selected (or nothing) and auto-advances. |

---

## `identityFields`

The config-driven form shown on the intro screen, before question one.
Ordered array — fields render top to bottom in the order you list them.

```json
{ "key": "firstName", "label": "First name", "type": "text", "required": true }
```

| Field | Notes |
| --- | --- |
| `key` | identifier-shaped (`firstName`, not `first name`) — must be unique within the quiz |
| `label` | shown to the taker |
| `type` | `"text"` \| `"email"` \| `"select"` |
| `required` | bool |
| `options` | **required** (non-empty array of strings) if `type` is `"select"`; not allowed otherwise |

**How these map onto Notion's Responses table** (best-effort, not
configurable per-field): the **first** field in the array → `Respondent`
column; the first field with `type: "email"` → `Email` column; the first
field whose `key` or `label` contains "partner" or "company" (case
insensitive) → `Partner` column. Whatever doesn't match any of those still
lands in `Identity (raw)` as a JSON dump — nothing is ever lost, the three
named columns are just a convenience for the common cases.

---

## Questions

Every question, regardless of type, shares:

| Field | Required? | Notes |
| --- | --- | --- |
| `id` | yes | unique within the quiz; also what Notion's `Question ID` column shows |
| `prompt` | yes | the question stem |
| `context` | no | scenario-setting text, shown in a tinted card **above** the prompt |
| `explanation` | no | shown after answering, only when `showFeedbackImmediately` is on |
| `tags` | no | array of strings — drives the end screen's "By topic" breakdown and Notion's `Tags` column. A question can carry more than one tag and counts toward each. |

Scoring is all-or-nothing per question (no partial credit). `shortText` and
`confidence` are **never** scored — captured for analysis, not marked
right/wrong (Notion's `Unscored` checkbox is true for those two, always).

### `single` — one correct answer

```json
{
  "id": "q1",
  "type": "single",
  "prompt": "Which Ditto product verifies a document is genuine?",
  "tags": ["product-knowledge"],
  "options": [
    { "id": "a", "label": "Ditto Verify" },
    { "id": "b", "label": "Ditto Protect" }
  ],
  "correctOptionId": "a",
  "explanation": "Ditto Verify checks documents; Protect covers fraud signals."
}
```
Needs ≥2 options. `correctOptionId` must be one of the option ids.

### `multi` — several correct answers, all-or-nothing

```json
{
  "id": "q2",
  "type": "multi",
  "prompt": "Select all that apply.",
  "options": [
    { "id": "a", "label": "..." },
    { "id": "b", "label": "..." },
    { "id": "c", "label": "..." }
  ],
  "correctOptionIds": ["a", "c"]
}
```
Needs ≥2 options and ≥1 correct id. Marked correct only if the taker's
selection is the **exact** set — missing one or including an extra both
count as wrong. The taker toggles options freely, then clicks a separate
"Submit answer" button to lock it in.

### `trueFalse`

```json
{
  "id": "q3",
  "type": "trueFalse",
  "prompt": "A partner can share their own login with a customer.",
  "correctAnswer": false
}
```

### `order` — arrange into the correct sequence

```json
{
  "id": "q4",
  "type": "order",
  "prompt": "Put these steps in the order they happen.",
  "items": [
    { "id": "capture", "label": "Customer photographs their ID" },
    { "id": "extract", "label": "Document data is extracted" },
    { "id": "result", "label": "A pass/fail result is returned" }
  ],
  "correctOrder": ["capture", "extract", "result"]
}
```
`correctOrder` must be an exact permutation of `items`' ids (same ids, no
duplicates, nothing missing) — the build fails loudly if it isn't. **The
order `items` are listed in the JSON file doesn't matter** — the app always
presents them shuffled to the taker (a stable per-question shuffle, not
random each render), so don't bother scrambling them yourself in the file;
write them in whatever order reads clearly, and get the real answer right
only in `correctOrder`. On screen this is tap-to-build-a-sequence (tap in
order, tap again to undo), not drag-and-drop.

### `shortText` — free text, unscored

```json
{
  "id": "q5",
  "type": "shortText",
  "prompt": "In your own words, why should a customer use Ditto?",
  "placeholder": "e.g. Verify who someone is in seconds, not days.",
  "maxLength": 280
}
```
`placeholder` and `maxLength` are both optional.

### `confidence` — fixed 1–5 self-assessment, unscored

```json
{
  "id": "q6",
  "type": "confidence",
  "prompt": "How confident do you feel about this topic?",
  "lowLabel": "Not confident",
  "highLabel": "Very confident"
}
```
The scale is always 1–5 — it isn't configurable. `lowLabel`/`highLabel` are
optional captions under the two ends of the scale.

---

## Validation rules worth knowing

Beyond the per-field types above, `npm run validate:quizzes` also checks,
across the whole file:

- Every question `id` is unique within the quiz.
- Every `identityFields[].key` is unique within the quiz.
- `single`'s `correctOptionId`, and every id in `multi`'s
  `correctOptionIds`, must actually be one of that question's `options`.
- `order`'s `correctOrder` must be an exact permutation of that question's
  `items` — same set, same length, no duplicates.

A failure prints exactly which field, on which question, is wrong — it
won't silently ship a quiz where the "correct" answer doesn't exist.

---

## Which example to copy

| File | Good starting point for... |
| --- | --- |
| `partner-onboarding-basics.json` | A standard quiz: fixed order, `passMark` set, `single`/`multi`/`trueFalse`/`shortText`, a `select` identity field |
| `objection-handling-scenarios.json` | Shuffled questions, no `passMark`, timed, a scenario `context`, `order` + `confidence` |
| `product-fundamentals-quickcheck.json` | A short, timed quick-check with all four scored types plus `confidence` |

---

## Publishing

1. Add or edit `/quizzes/<slug>.json` (locally, or directly in GitHub's web
   editor).
2. Commit and push (or commit directly to `main` on GitHub). Vercel
   redeploys automatically within about a minute.
3. While drafting, keep `status: "draft"` and review at
   `/q/<slug>?preview=1` — nothing you do there reaches Notion.
4. When it's ready, flip `status` to `"live"` and push again. It's now
   reachable at the plain `/q/<slug>` URL and starts writing real responses.
5. To embed it elsewhere: `<script src=".../embed.js" data-quiz="<slug>">`
   — see the README's "Embedding" section.

A taker can always click **Retake** on the end screen to start a fresh
attempt (this creates a new Notion response, it doesn't edit the previous
one) — there's no limit on retakes.
