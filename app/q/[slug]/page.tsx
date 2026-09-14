import { notFound } from "next/navigation";
import { loadQuiz, listQuizSlugs } from "@/lib/quizzes";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { ClosedScreen } from "@/components/quiz/ClosedScreen";

// Generous headroom for the submit-quiz Server Action's Notion writes
// (queued, retried) — see app/q/[slug]/actions.ts.
export const maxDuration = 30;

export function generateStaticParams() {
  return listQuizSlugs().map((slug) => ({ slug }));
}

export default async function QuizPage(props: PageProps<"/q/[slug]">) {
  const { slug } = await props.params;
  const { preview } = await props.searchParams;

  let quiz;
  try {
    quiz = loadQuiz(slug);
  } catch {
    notFound();
  }

  // draft is reachable only with ?preview=1, and never writes to Notion.
  const isPreview = quiz.status === "draft";
  if (isPreview && preview !== "1") {
    notFound();
  }

  if (quiz.status === "closed") {
    return <ClosedScreen quiz={quiz} />;
  }

  return <QuizRunner quiz={quiz} isPreview={isPreview} />;
}
