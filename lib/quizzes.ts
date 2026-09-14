import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseQuiz, type Quiz } from "./quiz-schema";

export const QUIZZES_DIR = join(process.cwd(), "quizzes");

/** Bare slugs (filename without .json) of every quiz file in /quizzes. */
export function listQuizSlugs(): string[] {
  return readdirSync(QUIZZES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

/**
 * Load and validate one quiz by its filename slug. Throws (with a readable,
 * field-scoped message) if the file is missing, isn't valid JSON, fails
 * QuizSchema, or its `slug` field doesn't match the filename — a mismatch
 * would silently break the `/q/[slug]` route later, so it's caught here.
 */
export function loadQuiz(fileSlug: string): Quiz {
  const path = join(QUIZZES_DIR, `${fileSlug}.json`);
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    throw new Error(`Quiz file not found: quizzes/${fileSlug}.json`);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`quizzes/${fileSlug}.json is not valid JSON: ${(err as Error).message}`);
  }

  const quiz = parseQuiz(data, `quizzes/${fileSlug}.json`);
  if (quiz.slug !== fileSlug) {
    throw new Error(
      `quizzes/${fileSlug}.json: "slug" field is "${quiz.slug}" but the filename is "${fileSlug}.json" — they must match`
    );
  }
  return quiz;
}

/** Load and validate every quiz in /quizzes. Throws on the first invalid file. */
export function loadAllQuizzes(): Quiz[] {
  return listQuizSlugs().map(loadQuiz);
}
