import { z } from "zod";
import { isScoredQuestion, type Question, type Quiz } from "./quiz-schema";

/**
 * Pure scoring/formatting logic, shared by the client (instant score-screen
 * render from local state) and the submit-quiz server action (authoritative
 * recomputation from the same quiz JSON for the Notion record). Neither side
 * trusts a client-sent score — only raw per-question answers — so the two
 * can never drift apart and there's nothing to fake by tampering with the
 * request payload.
 */

const nonNegNumber = z.number().nonnegative();

export const AnswerResponseSchema = z.discriminatedUnion("type", [
  z.object({
    questionId: z.string(),
    type: z.literal("single"),
    selectedOptionId: z.string().nullable(),
    timeTakenSeconds: nonNegNumber,
  }),
  z.object({
    questionId: z.string(),
    type: z.literal("multi"),
    selectedOptionIds: z.array(z.string()),
    timeTakenSeconds: nonNegNumber,
  }),
  z.object({
    questionId: z.string(),
    type: z.literal("trueFalse"),
    value: z.boolean().nullable(),
    timeTakenSeconds: nonNegNumber,
  }),
  z.object({
    questionId: z.string(),
    type: z.literal("order"),
    orderedItemIds: z.array(z.string()),
    timeTakenSeconds: nonNegNumber,
  }),
  z.object({
    questionId: z.string(),
    type: z.literal("shortText"),
    text: z.string(),
    timeTakenSeconds: nonNegNumber,
  }),
  z.object({
    questionId: z.string(),
    type: z.literal("confidence"),
    value: z.number().min(1).max(5).nullable(),
    timeTakenSeconds: nonNegNumber,
  }),
]);
export type AnswerResponse = z.infer<typeof AnswerResponseSchema>;

/** Omit that distributes over a union, so each discriminated-union member keeps its own remaining fields. */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** True if the response is scored correct. Always false for unscored types (shortText/confidence). */
export function isAnswerCorrect(question: Question, response: AnswerResponse | undefined): boolean {
  if (!response || response.questionId !== question.id) return false;

  switch (question.type) {
    case "single":
      return response.type === "single" && response.selectedOptionId === question.correctOptionId;

    case "multi": {
      if (response.type !== "multi") return false;
      const given = new Set(response.selectedOptionIds);
      const correct = question.correctOptionIds;
      return given.size === correct.length && correct.every((id) => given.has(id));
    }

    case "trueFalse":
      return response.type === "trueFalse" && response.value === question.correctAnswer;

    case "order": {
      if (response.type !== "order") return false;
      const { orderedItemIds } = response;
      return (
        orderedItemIds.length === question.correctOrder.length &&
        orderedItemIds.every((id, i) => id === question.correctOrder[i])
      );
    }

    case "shortText":
    case "confidence":
      return false;
  }
}

/** Human-readable answer text for the Notion "Answer" column — never an index or raw id. */
export function formatAnswerText(question: Question, response: AnswerResponse | undefined): string {
  const NO_ANSWER = "(no answer)";
  if (!response || response.questionId !== question.id) return NO_ANSWER;

  switch (question.type) {
    case "single": {
      if (response.type !== "single" || !response.selectedOptionId) return NO_ANSWER;
      return question.options.find((o) => o.id === response.selectedOptionId)?.label ?? NO_ANSWER;
    }

    case "multi": {
      if (response.type !== "multi" || response.selectedOptionIds.length === 0) return NO_ANSWER;
      const labels = question.options
        .filter((o) => response.selectedOptionIds.includes(o.id))
        .map((o) => o.label);
      return labels.length > 0 ? labels.join("; ") : NO_ANSWER;
    }

    case "trueFalse":
      if (response.type !== "trueFalse" || response.value === null) return NO_ANSWER;
      return response.value ? "True" : "False";

    case "order": {
      if (response.type !== "order" || response.orderedItemIds.length === 0) return NO_ANSWER;
      return response.orderedItemIds
        .map((id) => question.items.find((it) => it.id === id)?.label ?? "?")
        .join(" → "); // →
    }

    case "shortText":
      return response.type === "shortText" && response.text.trim() ? response.text.trim() : NO_ANSWER;

    case "confidence":
      return response.type === "confidence" && response.value != null ? String(response.value) : NO_ANSWER;
  }
}

/**
 * Human-readable *correct* answer text for the Notion "Correct answer"
 * column — independent of what the taker actually submitted, so a reviewer
 * can see what was expected right alongside what was given. Blank for
 * shortText/confidence, which have no "correct" answer at all.
 */
export function formatCorrectAnswerText(question: Question): string {
  switch (question.type) {
    case "single":
      return question.options.find((o) => o.id === question.correctOptionId)?.label ?? "";

    case "multi": {
      const labels = question.options
        .filter((o) => question.correctOptionIds.includes(o.id))
        .map((o) => o.label);
      return labels.join("; ");
    }

    case "trueFalse":
      return question.correctAnswer ? "True" : "False";

    case "order":
      return question.correctOrder
        .map((id) => question.items.find((it) => it.id === id)?.label ?? "?")
        .join(" → "); // →

    case "shortText":
    case "confidence":
      return "";
  }
}

export interface TagBreakdownEntry {
  tag: string;
  correct: number;
  total: number;
}

export interface QuizResult {
  score: number;
  maxScore: number;
  /** Rounded 0–100. */
  percentage: number;
  /** null when the quiz has no passMark. */
  passed: boolean | null;
  tagBreakdown: TagBreakdownEntry[];
}

/** Authoritative scoring for a whole attempt — the only place Score/Percentage/Passed are computed. */
export function scoreQuiz(quiz: Quiz, responsesByQuestionId: Record<string, AnswerResponse>): QuizResult {
  let score = 0;
  let maxScore = 0;
  const tagStats = new Map<string, TagBreakdownEntry>();

  for (const question of quiz.questions) {
    if (!isScoredQuestion(question.type)) continue;
    maxScore += 1;
    const correct = isAnswerCorrect(question, responsesByQuestionId[question.id]);
    if (correct) score += 1;

    for (const tag of question.tags ?? []) {
      const entry = tagStats.get(tag) ?? { tag, correct: 0, total: 0 };
      entry.total += 1;
      if (correct) entry.correct += 1;
      tagStats.set(tag, entry);
    }
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed = quiz.settings.passMark == null ? null : percentage >= quiz.settings.passMark;

  return { score, maxScore, percentage, passed, tagBreakdown: [...tagStats.values()] };
}

/**
 * Best-effort mapping from the fully config-driven identityFields onto the
 * Notion Responses database's fixed Respondent/Email/Partner columns — see
 * CLAUDE.md's "Notion conventions" for the convention this relies on.
 * "Identity (raw)" (the full JSON dump) is the reliable source; these three
 * are a convenience, and simply come back blank when a quiz has no matching
 * field.
 */
export function deriveIdentitySummary(quiz: Quiz, identity: Record<string, string>) {
  const first = quiz.identityFields[0];
  const respondent = first ? (identity[first.key] ?? "").trim() : "";

  const emailField = quiz.identityFields.find((f) => f.type === "email");
  const email = emailField ? identity[emailField.key] : undefined;

  const partnerField = quiz.identityFields.find(
    (f) => /partner|company/i.test(f.key) || /partner|company/i.test(f.label)
  );
  const partner = partnerField ? identity[partnerField.key] : undefined;

  return { respondent, email, partner };
}

/** Notion Response page title: "{quiz title} — {first identity field value} — {date}". */
export function buildResponseTitle(quiz: Quiz, respondent: string, submittedAt: Date): string {
  const date = submittedAt.toISOString().slice(0, 10);
  return `${quiz.title} — ${respondent || "Anonymous"} — ${date}`;
}
