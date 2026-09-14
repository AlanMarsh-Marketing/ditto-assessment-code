import { listQuizSlugs } from "@/lib/quizzes";
import { resolveQuizOrNotFound } from "@/lib/quiz-request";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { ClosedScreen } from "@/components/quiz/ClosedScreen";
import { EmbedResizeReporter, EMBED_CONTENT_ID } from "@/components/quiz/EmbedResizeReporter";

// Same reasoning as app/q/[slug]/page.tsx — submitQuizAttempt runs here too.
export const maxDuration = 30;

export function generateStaticParams() {
  return listQuizSlugs().map((slug) => ({ slug }));
}

/**
 * Renders the same taking experience as /q/[slug] without site chrome or
 * full-viewport centering, for use inside the iframe public/embed.js
 * creates. EmbedResizeReporter tells that iframe how tall to be.
 */
export default async function EmbedQuizPage(props: PageProps<"/embed/[slug]">) {
  const { slug } = await props.params;
  const { preview } = await props.searchParams;
  const { quiz, isPreview } = resolveQuizOrNotFound(slug, preview);

  return (
    <>
      <EmbedResizeReporter />
      <div id={EMBED_CONTENT_ID}>
        {quiz.status === "closed" ? (
          <ClosedScreen quiz={quiz} embed />
        ) : (
          <QuizRunner quiz={quiz} isPreview={isPreview} embed />
        )}
      </div>
    </>
  );
}
