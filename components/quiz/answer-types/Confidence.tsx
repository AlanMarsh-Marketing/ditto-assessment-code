import type { ConfidenceQuestionSchema } from "@/lib/quiz-schema";
import type { z } from "zod";
import { AnswerTile } from "../AnswerTile";

type ConfidenceQuestion = z.infer<typeof ConfidenceQuestionSchema>;

/** Fixed 1–5 scale, unscored — a self-assessment, not marked right/wrong. */
export function Confidence({
  question,
  value,
  onChange,
  locked,
}: {
  question: ConfidenceQuestion;
  value: number | null;
  onChange: (v: number) => void;
  locked: boolean;
}) {
  return (
    <div>
      <div style={{ display: "flex", gap: 10 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <AnswerTile key={n} state={value === n ? "selected" : "idle"} disabled={locked} onClick={() => onChange(n)}>
            <span style={{ display: "block", textAlign: "center", width: "100%" }}>{n}</span>
          </AnswerTile>
        ))}
      </div>
      {question.lowLabel || question.highLabel ? (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            justifyContent: "space-between",
            fontSize: "var(--fs-caption)",
            color: "var(--text-muted)",
          }}
        >
          <span>{question.lowLabel}</span>
          <span>{question.highLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
