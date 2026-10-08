import { z } from "zod";

/**
 * Quiz content-model schema. See the "Content model" section of
 * ../../ditto-quiz-tool-prompt-final.md for the authoritative spec — this
 * file is the concrete implementation of it. Every `/quizzes/<slug>.json`
 * file is validated against `QuizSchema` (see scripts/validate-quizzes.ts,
 * wired into `npm run build` via the `prebuild` script) — a bad file fails
 * the build loudly rather than shipping broken content.
 *
 * `passMark` is a percentage (0–100) of Score/Max score, or `null` to skip
 * pass/fail entirely — chosen because quizzes vary in question count and
 * mix, so percentage is the only unit that stays meaningful across quizzes.
 * `order` questions score all-or-nothing (exact sequence), same as
 * `single`/`multi`/`trueFalse`. `shortText` and `confidence` are always
 * unscored (captured for analysis, not marked right/wrong) — matching the
 * Answers database's "Unscored" column.
 */

const id = z.string().trim().min(1, "id must not be empty");
const nonEmpty = z.string().trim().min(1, "must not be empty");

// ---------------------------------------------------------------------------
// Identity fields — the config-driven intro-screen questions.
// ---------------------------------------------------------------------------

export const IdentityFieldSchema = z
  .object({
    key: z
      .string()
      .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "key must be a valid identifier, e.g. firstName"),
    label: nonEmpty,
    type: z.enum(["text", "email", "select"]),
    required: z.boolean(),
    options: z.array(nonEmpty).optional(),
  })
  .superRefine((field, ctx) => {
    if (field.type === "select" && (!field.options || field.options.length === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: `identityField "${field.key}" has type "select" and needs a non-empty options array`,
      });
    }
    if (field.type !== "select" && field.options) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: `identityField "${field.key}" has type "${field.type}" — options is only valid on type "select"`,
      });
    }
  });
export type IdentityField = z.infer<typeof IdentityFieldSchema>;

// ---------------------------------------------------------------------------
// Questions — a discriminated union on `type`.
// ---------------------------------------------------------------------------

const QuestionCommon = {
  id,
  prompt: nonEmpty,
  context: z.string().trim().min(1).optional(),
  explanation: z.string().trim().min(1).optional(),
  tags: z.array(nonEmpty).optional(),
  /** With shuffleQuestions on, keep this question after all the shuffled ones (e.g. a closing self-assessment). */
  pinToEnd: z.boolean().optional(),
};

const OptionSchema = z.object({ id, label: nonEmpty });

export const SingleQuestionSchema = z.object({
  type: z.literal("single"),
  ...QuestionCommon,
  options: z.array(OptionSchema).min(2, "single needs at least 2 options"),
  correctOptionId: id,
});

export const MultiQuestionSchema = z.object({
  type: z.literal("multi"),
  ...QuestionCommon,
  options: z.array(OptionSchema).min(2, "multi needs at least 2 options"),
  correctOptionIds: z.array(id).min(1, "multi needs at least 1 correct option"),
});

export const TrueFalseQuestionSchema = z.object({
  type: z.literal("trueFalse"),
  ...QuestionCommon,
  correctAnswer: z.boolean(),
});

export const OrderQuestionSchema = z.object({
  type: z.literal("order"),
  ...QuestionCommon,
  items: z.array(OptionSchema).min(2, "order needs at least 2 items"),
  /** Item ids in the correct sequence — must be a permutation of `items`. */
  correctOrder: z.array(id).min(2),
});

export const ShortTextQuestionSchema = z.object({
  type: z.literal("shortText"),
  ...QuestionCommon,
  placeholder: z.string().optional(),
  maxLength: z.number().int().positive().optional(),
});

export const ConfidenceQuestionSchema = z.object({
  type: z.literal("confidence"),
  ...QuestionCommon,
  /** Endpoint labels for the fixed 1–5 scale, e.g. "Not confident" / "Very confident". */
  lowLabel: z.string().optional(),
  highLabel: z.string().optional(),
});

export const QuestionSchema = z.discriminatedUnion("type", [
  SingleQuestionSchema,
  MultiQuestionSchema,
  TrueFalseQuestionSchema,
  OrderQuestionSchema,
  ShortTextQuestionSchema,
  ConfidenceQuestionSchema,
]);
export type Question = z.infer<typeof QuestionSchema>;
export type QuestionType = Question["type"];

/** Question types that count toward Score/Max score. shortText and confidence never do. */
export const SCORED_QUESTION_TYPES: QuestionType[] = ["single", "multi", "trueFalse", "order"];
export function isScoredQuestion(type: QuestionType): boolean {
  return SCORED_QUESTION_TYPES.includes(type);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const QuizSettingsSchema = z.object({
  showFeedbackImmediately: z.boolean(),
  showScoreAtEnd: z.boolean(),
  /** Percentage (0–100) of Score/Max score required to pass, or null for no pass mark. */
  passMark: z.number().min(0).max(100).nullable(),
  shuffleQuestions: z.boolean(),
  timePerQuestionSeconds: z.number().positive().nullable(),
});
export type QuizSettings = z.infer<typeof QuizSettingsSchema>;

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

export const QuizSchema = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be kebab-case, e.g. partner-onboarding-basics"),
    title: nonEmpty,
    description: z.string(),
    status: z.enum(["draft", "live", "closed"]),
    audience: nonEmpty,
    settings: QuizSettingsSchema,
    identityFields: z.array(IdentityFieldSchema).min(1, "at least one identity field is required"),
    questions: z.array(QuestionSchema).min(1, "at least one question is required"),
  })
  .superRefine((quiz, ctx) => {
    // Unique identity field keys.
    const seenKeys = new Set<string>();
    for (const [i, field] of quiz.identityFields.entries()) {
      if (seenKeys.has(field.key)) {
        ctx.addIssue({
          code: "custom",
          path: ["identityFields", i, "key"],
          message: `duplicate identityField key "${field.key}"`,
        });
      }
      seenKeys.add(field.key);
    }

    // Unique question ids.
    const seenQuestionIds = new Set<string>();
    for (const [i, q] of quiz.questions.entries()) {
      if (seenQuestionIds.has(q.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["questions", i, "id"],
          message: `duplicate question id "${q.id}"`,
        });
      }
      seenQuestionIds.add(q.id);
    }

    // Per-question-type referential integrity.
    quiz.questions.forEach((q, i) => {
      if (q.type === "single") {
        const optionIds = new Set(q.options.map((o) => o.id));
        if (optionIds.size !== q.options.length) {
          ctx.addIssue({
            code: "custom",
            path: ["questions", i, "options"],
            message: `question "${q.id}" has duplicate option ids`,
          });
        }
        if (!optionIds.has(q.correctOptionId)) {
          ctx.addIssue({
            code: "custom",
            path: ["questions", i, "correctOptionId"],
            message: `question "${q.id}": correctOptionId "${q.correctOptionId}" is not one of its options`,
          });
        }
      }

      if (q.type === "multi") {
        const optionIds = new Set(q.options.map((o) => o.id));
        if (optionIds.size !== q.options.length) {
          ctx.addIssue({
            code: "custom",
            path: ["questions", i, "options"],
            message: `question "${q.id}" has duplicate option ids`,
          });
        }
        const unknown = q.correctOptionIds.filter((cid) => !optionIds.has(cid));
        if (unknown.length > 0) {
          ctx.addIssue({
            code: "custom",
            path: ["questions", i, "correctOptionIds"],
            message: `question "${q.id}": correctOptionIds ${JSON.stringify(unknown)} are not among its options`,
          });
        }
      }

      if (q.type === "order") {
        const itemIds = q.items.map((it) => it.id);
        const itemIdSet = new Set(itemIds);
        if (itemIdSet.size !== itemIds.length) {
          ctx.addIssue({
            code: "custom",
            path: ["questions", i, "items"],
            message: `question "${q.id}" has duplicate item ids`,
          });
        }
        const orderSet = new Set(q.correctOrder);
        const sameLength = q.correctOrder.length === itemIds.length;
        const sameSet =
          orderSet.size === itemIdSet.size && [...orderSet].every((cid) => itemIdSet.has(cid));
        if (!sameLength || !sameSet) {
          ctx.addIssue({
            code: "custom",
            path: ["questions", i, "correctOrder"],
            message: `question "${q.id}": correctOrder must be a permutation of items' ids`,
          });
        }
      }
    });
  });

export type Quiz = z.infer<typeof QuizSchema>;

/**
 * Parse + validate a quiz. Returns a readable, multi-line error message
 * (file-and-field-scoped) on failure rather than a raw ZodError — used by
 * both the build-time validation script and (later) the app's quiz loader.
 */
export function parseQuiz(data: unknown, label: string): Quiz {
  const result = QuizSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid quiz "${label}":\n${issues}`);
  }
  return result.data;
}
