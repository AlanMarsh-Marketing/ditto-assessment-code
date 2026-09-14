import { notFound } from "next/navigation";
import { loadQuiz } from "./quizzes";
import type { Quiz } from "./quiz-schema";

/**
 * Shared by /q/[slug] and /embed/[slug]: loads the quiz, 404s if it doesn't
 * exist, and enforces `draft` → only reachable with ?preview=1 (and never
 * writes to Notion — QuizRunner checks `isPreview` again before submitting,
 * so this gate isn't the only thing standing between a draft and a write).
 */
export function resolveQuizOrNotFound(
  slug: string,
  previewParam: string | string[] | undefined
): { quiz: Quiz; isPreview: boolean } {
  let quiz: Quiz;
  try {
    quiz = loadQuiz(slug);
  } catch {
    notFound();
  }

  const isPreview = quiz.status === "draft";
  if (isPreview && previewParam !== "1") {
    notFound();
  }

  return { quiz, isPreview };
}
