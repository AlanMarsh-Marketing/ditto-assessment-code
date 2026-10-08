"use client";

import * as React from "react";
import type { Quiz } from "@/lib/quiz-schema";
import { scoreQuiz, type AnswerResponse, type QuizResult } from "@/lib/scoring";
import { clearQuizSession, loadQuizSession, saveQuizSession } from "@/lib/quiz-storage";
import { shuffleArray } from "@/lib/shuffle";
import type { Submission } from "@/lib/submission";
import { submitQuizAttempt } from "@/app/q/[slug]/actions";
import { IntroScreen } from "./IntroScreen";
import { QuestionScreen } from "./QuestionScreen";
import { EndScreen, type SubmissionState } from "./EndScreen";

interface RunnerSession {
  identity: Record<string, string>;
  order: string[];
  currentIndex: number;
  responses: Record<string, AnswerResponse>;
  attemptStartedAt: number;
}

interface UiState {
  phase: "intro" | "question" | "end";
  order: string[];
  currentIndex: number;
  /** attemptStartedAt of the current attempt — seeds per-attempt shuffles. */
  attemptSeed: number;
  result: QuizResult | null;
  submissionState: SubmissionState;
  referenceCode?: string;
}

const INITIAL_UI: UiState = {
  phase: "intro",
  order: [],
  currentIndex: 0,
  attemptSeed: 0,
  result: null,
  submissionState: "skipped",
};

/**
 * Owns the whole taking experience: intro → one question per screen → end,
 * resume-safe via localStorage, one submission per attempt. `sessionRef` is
 * the single source of truth for identity/responses/timing, read and
 * written by every handler below — `ui` state exists only to trigger
 * re-renders (order/currentIndex are mirrored into it for that reason).
 * Nothing here depends on a setState closure being fresh when two handlers
 * fire in the same tick (e.g. answering and advancing on the same click,
 * for shortText/confidence) because sessionRef updates are synchronous.
 */
export function QuizRunner({
  quiz,
  isPreview,
  embed = false,
}: {
  quiz: Quiz;
  isPreview: boolean;
  /** Rendered inside an iframe (/embed/[slug]) — swaps full-viewport centering for a compact, top-aligned layout. */
  embed?: boolean;
}) {
  const [ui, setUi] = React.useState<UiState>(INITIAL_UI);

  const sessionRef = React.useRef<RunnerSession>({
    identity: {},
    order: [],
    currentIndex: 0,
    responses: {},
    attemptStartedAt: 0,
  });

  const questionsById = React.useMemo(() => new Map(quiz.questions.map((q) => [q.id, q])), [quiz]);

  // Resume (or re-show a completed attempt's own result) on first mount —
  // one functional setUi call so there's a single re-render, not a cascade.
  //
  // This deliberately reads localStorage (a browser-only API) after mount,
  // not via a lazy useState initializer, so the server-rendered HTML and
  // the client's first hydration pass both start from the same "intro"
  // shell — reading it during the initializer would make the client's
  // very first render diverge from the server's and trigger a hydration
  // mismatch.
  React.useEffect(() => {
    const saved = loadQuizSession(quiz.slug);
    if (!saved) return;
    sessionRef.current = {
      identity: saved.identity,
      order: saved.order,
      currentIndex: saved.currentIndex,
      responses: saved.responses,
      attemptStartedAt: saved.attemptStartedAt,
    };

    if (saved.status === "completed") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only external-storage bootstrap, see comment above the effect; the equivalent `else` branch below doesn't trip this rule but this one does, for reasons that aren't clear from the rule's own heuristic
      setUi((prev) => ({
        ...prev,
        phase: "end",
        order: saved.order,
        currentIndex: saved.currentIndex,
        attemptSeed: saved.attemptStartedAt,
        result: scoreQuiz(quiz, saved.responses),
        submissionState: "skipped", // no live signal for a past attempt — nothing to report
      }));
    } else {
      setUi((prev) => ({
        ...prev,
        phase: "question",
        order: saved.order,
        currentIndex: saved.currentIndex,
        attemptSeed: saved.attemptStartedAt,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(status: "in-progress" | "completed") {
    saveQuizSession(quiz.slug, { version: 1, status, ...sessionRef.current });
  }

  function handleStart(identityValues: Record<string, string>) {
    const ids = quiz.questions.map((q) => q.id);
    // pinToEnd questions stay after the shuffled ones, in file order.
    const free = quiz.questions.filter((q) => !q.pinToEnd).map((q) => q.id);
    const pinned = quiz.questions.filter((q) => q.pinToEnd).map((q) => q.id);
    const shuffled = quiz.settings.shuffleQuestions ? [...shuffleArray(free), ...pinned] : ids;
    const attemptStartedAt = Date.now();
    sessionRef.current = { identity: identityValues, order: shuffled, currentIndex: 0, responses: {}, attemptStartedAt };
    persist("in-progress");
    setUi((prev) => ({ ...prev, phase: "question", order: shuffled, currentIndex: 0, attemptSeed: attemptStartedAt }));
  }

  function handleAnswer(response: AnswerResponse) {
    sessionRef.current = {
      ...sessionRef.current,
      responses: { ...sessionRef.current.responses, [response.questionId]: response },
    };
    persist("in-progress");
  }

  function handleNext() {
    const nextIndex = sessionRef.current.currentIndex + 1;
    if (nextIndex >= sessionRef.current.order.length) {
      finishQuiz();
      return;
    }
    sessionRef.current = { ...sessionRef.current, currentIndex: nextIndex };
    persist("in-progress");
    setUi((prev) => ({ ...prev, currentIndex: nextIndex }));
  }

  function finishQuiz() {
    const { identity: finalIdentity, responses: finalResponses, attemptStartedAt } = sessionRef.current;
    const finalResult = scoreQuiz(quiz, finalResponses);
    const submittedAt = new Date();
    const durationSeconds = (submittedAt.getTime() - attemptStartedAt) / 1000;

    persist("completed");
    setUi((prev) => ({
      ...prev,
      phase: "end",
      result: finalResult,
      submissionState: isPreview ? "skipped" : "saving",
    }));

    if (isPreview) return;

    const payload: Submission = {
      quizSlug: quiz.slug,
      identity: finalIdentity,
      startedAt: new Date(attemptStartedAt).toISOString(),
      submittedAt: submittedAt.toISOString(),
      durationSeconds,
      answers: Object.values(finalResponses),
    };
    submitQuizAttempt(payload)
      .then((res) => {
        setUi((prev) =>
          res.ok
            ? { ...prev, submissionState: "saved" }
            : { ...prev, submissionState: "failed", referenceCode: res.referenceCode }
        );
      })
      .catch(() => setUi((prev) => ({ ...prev, submissionState: "failed" })));
  }

  function handleRetake() {
    clearQuizSession(quiz.slug);
    sessionRef.current = { identity: {}, order: [], currentIndex: 0, responses: {}, attemptStartedAt: 0 };
    setUi(INITIAL_UI);
  }

  if (ui.phase === "intro") {
    return <IntroScreen quiz={quiz} isPreview={isPreview} embed={embed} onStart={handleStart} />;
  }

  if (ui.phase === "end" && ui.result) {
    return (
      <EndScreen
        quiz={quiz}
        result={ui.result}
        isPreview={isPreview}
        embed={embed}
        submissionState={ui.submissionState}
        referenceCode={ui.referenceCode}
        onRetake={handleRetake}
      />
    );
  }

  const currentQuestion = questionsById.get(ui.order[ui.currentIndex]);
  if (!currentQuestion) return null;

  return (
    <QuestionScreen
      key={currentQuestion.id}
      quiz={quiz}
      question={currentQuestion}
      questionNumber={ui.currentIndex + 1}
      totalQuestions={ui.order.length}
      isLast={ui.currentIndex + 1 >= ui.order.length}
      attemptSeed={ui.attemptSeed}
      onAnswer={handleAnswer}
      onNext={handleNext}
    />
  );
}
