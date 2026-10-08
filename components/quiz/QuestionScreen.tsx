"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { Question, Quiz } from "@/lib/quiz-schema";
import type { AnswerResponse, DistributiveOmit } from "@/lib/scoring";
import { Button, Card, BrandIcon } from "@/components/ds";
import { ProgressBar } from "./ProgressBar";
import { CountdownRing } from "./CountdownRing";
import { SingleChoice } from "./answer-types/SingleChoice";
import { TrueFalse } from "./answer-types/TrueFalse";
import { MultiChoice } from "./answer-types/MultiChoice";
import { OrderPicker } from "./answer-types/OrderPicker";
import { ShortText } from "./answer-types/ShortText";
import { Confidence } from "./answer-types/Confidence";

/**
 * One question, one screen. Mounted with `key={question.id}` by QuizRunner
 * so every internal useState resets cleanly on question change — no manual
 * reset effects needed.
 */
export function QuestionScreen({
  quiz,
  question,
  questionNumber,
  totalQuestions,
  isLast,
  attemptSeed,
  onAnswer,
  onNext,
}: {
  quiz: Quiz;
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  isLast: boolean;
  /** Per-attempt seed (the attempt's start time) — varies the order-question pool between attempts. */
  attemptSeed: number;
  onAnswer: (response: AnswerResponse) => void;
  onNext: () => void;
}) {
  const [answered, setAnswered] = React.useState(false);
  const [startedAt] = React.useState(() => Date.now());
  const totalSeconds = quiz.settings.timePerQuestionSeconds ?? 0;
  const [secondsRemaining, setSecondsRemaining] = React.useState(totalSeconds);

  const [singleValue, setSingleValue] = React.useState<string | null>(null);
  const [multiValue, setMultiValue] = React.useState<string[]>([]);
  const [boolValue, setBoolValue] = React.useState<boolean | null>(null);
  const [orderValue, setOrderValue] = React.useState<string[]>([]);
  const [textValue, setTextValue] = React.useState("");
  const [confidenceValue, setConfidenceValue] = React.useState<number | null>(null);

  const finalize = React.useCallback(
    (partial: DistributiveOmit<AnswerResponse, "questionId" | "timeTakenSeconds">) => {
      setAnswered((already) => {
        if (already) return already;
        const timeTakenSeconds = (Date.now() - startedAt) / 1000;
        onAnswer({ ...partial, questionId: question.id, timeTakenSeconds } as AnswerResponse);
        return true;
      });
    },
    [onAnswer, question.id, startedAt]
  );

  const finalizeOnTimeout = React.useCallback(() => {
    switch (question.type) {
      case "single":
        finalize({ type: "single", selectedOptionId: singleValue });
        break;
      case "multi":
        finalize({ type: "multi", selectedOptionIds: multiValue });
        break;
      case "trueFalse":
        finalize({ type: "trueFalse", value: boolValue });
        break;
      case "order":
        finalize({ type: "order", orderedItemIds: orderValue });
        break;
      case "shortText":
        finalize({ type: "shortText", text: textValue });
        break;
      case "confidence":
        finalize({ type: "confidence", value: confidenceValue });
        break;
    }
  }, [finalize, question.type, singleValue, multiValue, boolValue, orderValue, textValue, confidenceValue]);

  // Per-question countdown — one interval for the question's lifetime
  // (rather than re-scheduling on every tick); auto-locks whatever's
  // selected (or nothing) when it reaches zero, then auto-advances after a
  // short pause so feedback (if enabled) is still readable. `answeredRef`
  // lets the tick bail out once the taker answers manually without having
  // to recreate the interval (which would need `answered` in the deps).
  const answeredRef = React.useRef(answered);
  React.useEffect(() => {
    answeredRef.current = answered;
  }, [answered]);

  React.useEffect(() => {
    if (!totalSeconds) return;
    const interval = setInterval(() => {
      if (answeredRef.current) return;
      setSecondsRemaining((s) => {
        if (s <= 1) {
          finalizeOnTimeout();
          const delay = quiz.settings.showFeedbackImmediately ? 2500 : 900;
          setTimeout(onNext, delay);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds, finalizeOnTimeout, onNext, quiz.settings.showFeedbackImmediately]);

  function handleNextClick() {
    if (!answered) {
      // Only shortText/confidence reach Next unanswered — see showBottomNext below.
      if (question.type === "shortText") finalize({ type: "shortText", text: textValue });
      else if (question.type === "confidence") finalize({ type: "confidence", value: confidenceValue });
    }
    onNext();
  }

  const revealed = answered && quiz.settings.showFeedbackImmediately;
  const showBottomNext = answered || question.type === "shortText" || question.type === "confidence";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
        <div style={{ flex: 1 }}>
          <ProgressBar current={questionNumber} total={totalQuestions} />
        </div>
        {totalSeconds > 0 && !answered ? (
          <CountdownRing secondsRemaining={secondsRemaining} totalSeconds={totalSeconds} />
        ) : null}
      </div>

      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        {question.context ? (
          <Card tone="subtle" style={{ marginBottom: 20, background: "var(--tint-cyan)" }}>
            <p style={{ fontSize: "var(--fs-body)", color: "var(--text-body)", fontStyle: "normal" }}>
              {question.context}
            </p>
          </Card>
        ) : null}

        <h2 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-medium)", color: "var(--text-strong)", marginBottom: 24 }}>
          {question.prompt}
        </h2>

        {question.type === "single" && (
          <SingleChoice
            question={question}
            value={singleValue}
            revealed={revealed}
            locked={answered}
            onChange={(id) => {
              setSingleValue(id);
              finalize({ type: "single", selectedOptionId: id });
            }}
          />
        )}
        {question.type === "trueFalse" && (
          <TrueFalse
            question={question}
            value={boolValue}
            revealed={revealed}
            locked={answered}
            onChange={(v) => {
              setBoolValue(v);
              finalize({ type: "trueFalse", value: v });
            }}
          />
        )}
        {question.type === "multi" && (
          <MultiChoice
            question={question}
            value={multiValue}
            revealed={revealed}
            locked={answered}
            onChange={setMultiValue}
            onLock={() => finalize({ type: "multi", selectedOptionIds: multiValue })}
          />
        )}
        {question.type === "order" && (
          <OrderPicker
            question={question}
            value={orderValue}
            revealed={revealed}
            locked={answered}
            shuffleSeed={attemptSeed}
            onChange={setOrderValue}
            onLock={(finalOrder) => finalize({ type: "order", orderedItemIds: finalOrder })}
          />
        )}
        {question.type === "shortText" && (
          <ShortText question={question} value={textValue} onChange={setTextValue} />
        )}
        {question.type === "confidence" && (
          <Confidence question={question} value={confidenceValue} locked={false} onChange={setConfidenceValue} />
        )}

        {revealed && question.explanation ? (
          <Card tone="subtle" style={{ marginTop: 20, background: "var(--purple-050)" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <BrandIcon name="info-filled" size={20} style={{ marginTop: 2 }} />
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-body)" }}>{question.explanation}</p>
            </div>
          </Card>
        ) : null}

        {showBottomNext ? (
          <div style={{ marginTop: 24 }}>
            <Button variant="primary" onClick={handleNextClick}>
              {isLast ? "See results" : "Next"}
            </Button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
