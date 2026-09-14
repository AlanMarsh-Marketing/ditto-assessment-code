/**
 * Validates every /quizzes/<slug>.json file against QuizSchema. Run via
 * `npm run validate:quizzes`, and automatically before `npm run build`
 * (see the `prebuild` script in package.json) — a bad quiz file fails the
 * build loudly instead of shipping broken content.
 */
import { listQuizSlugs, loadQuiz } from "../lib/quizzes";

const slugs = listQuizSlugs();

if (slugs.length === 0) {
  console.error("✗ No quiz files found in /quizzes — expected at least one *.json file.");
  process.exit(1);
}

let failed = 0;
for (const slug of slugs) {
  try {
    const quiz = loadQuiz(slug);
    console.log(
      `✓ ${slug}.json — "${quiz.title}" (${quiz.status}, ${quiz.questions.length} questions)`
    );
  } catch (err) {
    failed++;
    console.error(`✗ ${(err as Error).message}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} of ${slugs.length} quiz file(s) failed validation.`);
  process.exit(1);
}

console.log(`\nAll ${slugs.length} quiz file(s) valid.`);
