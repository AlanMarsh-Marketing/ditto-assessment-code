"use server";

import { getNotionClient, getPrimaryDataSourceId, withRetry } from "@/lib/notion";
import { buildAnswerProperties, buildResponseProperties } from "@/lib/notion-write";
import { mapWithConcurrency } from "@/lib/concurrency";
import { loadQuiz } from "@/lib/quizzes";
import { deriveIdentitySummary, scoreQuiz, type AnswerResponse } from "@/lib/scoring";
import { SubmissionSchema, type SubmitResult } from "@/lib/submission";

/**
 * Creates the Response page, then one Answer page per question (concurrency-
 * limited, each retried), relating them back. Never trusts a client-sent
 * score — recomputes it from the quiz JSON and the raw answers (see
 * lib/scoring.ts). On any failure, logs the complete submission as
 * structured JSON (this is the only place a lost response is recorded —
 * there's no dashboard or alerting) and returns a short reference code for
 * the discreet failure line on the score screen. `maxDuration` for this
 * action is set on ./page.tsx, per Next's Server Actions docs.
 */
export async function submitQuizAttempt(raw: unknown): Promise<SubmitResult> {
  const parsed = SubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, referenceCode: logFailure("quiz-submission-invalid", { issues: parsed.error.issues, raw }) };
  }
  const submission = parsed.data;

  let quiz;
  try {
    quiz = loadQuiz(submission.quizSlug);
  } catch (err) {
    return {
      ok: false,
      referenceCode: logFailure("quiz-submission-unknown-quiz", {
        quizSlug: submission.quizSlug,
        error: describeError(err),
      }),
    };
  }

  if (quiz.status === "draft") {
    // Defence in depth — the client already refuses to call this in preview mode.
    return {
      ok: false,
      referenceCode: logFailure("quiz-submission-draft-rejected", { quizSlug: submission.quizSlug }),
    };
  }

  const responsesByQuestionId: Record<string, AnswerResponse> = {};
  for (const answer of submission.answers) responsesByQuestionId[answer.questionId] = answer;

  const result = scoreQuiz(quiz, responsesByQuestionId);
  const submittedAt = new Date(submission.submittedAt);
  const { respondent } = deriveIdentitySummary(quiz, submission.identity);

  let responsePageId: string;
  try {
    const notion = getNotionClient();
    const responsesDataSourceId = await getPrimaryDataSourceId(requireEnv("NOTION_RESPONSES_DB_ID"));
    const responsePage = await withRetry(() =>
      notion.pages.create({
        parent: { type: "data_source_id", data_source_id: responsesDataSourceId },
        properties: buildResponseProperties({
          quiz,
          identity: submission.identity,
          result,
          durationSeconds: submission.durationSeconds,
          submittedAt,
        }),
      })
    );
    responsePageId = responsePage.id;
  } catch (err) {
    return {
      ok: false,
      referenceCode: logFailure("quiz-response-write-failed", { submission, error: describeError(err) }),
    };
  }

  const failures: Array<{ questionId: string; error: string }> = [];
  try {
    const notion = getNotionClient();
    const answersDataSourceId = await getPrimaryDataSourceId(requireEnv("NOTION_ANSWERS_DB_ID"));

    await mapWithConcurrency(quiz.questions, 3, async (question) => {
      try {
        await withRetry(() =>
          notion.pages.create({
            parent: { type: "data_source_id", data_source_id: answersDataSourceId },
            properties: buildAnswerProperties({
              quiz,
              question,
              response: responsesByQuestionId[question.id],
              respondent,
              responsePageId,
            }),
          })
        );
      } catch (err) {
        failures.push({ questionId: question.id, error: describeError(err) });
      }
    });
  } catch (err) {
    // Something broke before per-question writes even started (e.g. env var missing).
    return {
      ok: false,
      referenceCode: logFailure("quiz-answers-write-failed", {
        submission,
        responsePageId,
        error: describeError(err),
      }),
    };
  }

  if (failures.length > 0) {
    return {
      ok: false,
      referenceCode: logFailure("quiz-answers-write-partial-failure", { submission, responsePageId, failures }),
    };
  }

  return { ok: true };
}

/** Logs a structured, complete record of a failed write and returns a short code to show the taker. */
function logFailure(event: string, details: Record<string, unknown>): string {
  const referenceCode = crypto.randomUUID().slice(0, 8).toUpperCase();
  console.error(JSON.stringify({ event, referenceCode, ...details }));
  return referenceCode;
}

function describeError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}
