import { listQuizSlugs } from "@/lib/quizzes";
import { resolveQuizOrNotFound } from "@/lib/quiz-request";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { ClosedScreen } from "@/components/quiz/ClosedScreen";
import { PageShell } from "@/components/quiz/PageShell";

// Generous headroom for the submit-quiz Server Action's Notion writes
// (queued, retried) — see app/q/[slug]/actions.ts.
export const maxDuration = 30;

export function generateStaticParams() {
  return listQuizSlugs().map((slug) => ({ slug }));
}

export default async function QuizPage(props: PageProps<"/q/[slug]">) {
  const { slug } = await props.params;
  const { preview } = await props.searchParams;
  const { quiz, isPreview } = resolveQuizOrNotFound(slug, preview);

  return (
    <PageShell quizTitle={quiz.title}>
      {quiz.status === "closed" ? <ClosedScreen quiz={quiz} /> : <QuizRunner quiz={quiz} isPreview={isPreview} />}
    </PageShell>
  );
}
