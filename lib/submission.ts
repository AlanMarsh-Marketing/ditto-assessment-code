import { z } from "zod";
import { AnswerResponseSchema } from "./scoring";

/**
 * What the client sends to the submitQuizAttempt server action. Deliberately
 * carries only raw per-question answers and timing, never a score or
 * correctness flag — see lib/scoring.ts's header comment for why.
 */
export const SubmissionSchema = z.object({
  quizSlug: z.string(),
  identity: z.record(z.string(), z.string()),
  startedAt: z.string(),
  submittedAt: z.string(),
  durationSeconds: z.number().nonnegative(),
  answers: z.array(AnswerResponseSchema),
});
export type Submission = z.infer<typeof SubmissionSchema>;

export type SubmitResult = { ok: true } | { ok: false; referenceCode: string };
