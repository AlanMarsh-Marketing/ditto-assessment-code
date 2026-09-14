import type { ShortTextQuestionSchema } from "@/lib/quiz-schema";
import type { z } from "zod";

type ShortTextQuestion = z.infer<typeof ShortTextQuestionSchema>;

/** Free text, unscored — captured for analysis, never marked right/wrong. */
export function ShortText({
  question,
  value,
  onChange,
}: {
  question: ShortTextQuestion;
  value: string;
  onChange: (text: string) => void;
}) {
  const max = question.maxLength;
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(max ? e.target.value.slice(0, max) : e.target.value)}
        placeholder={question.placeholder}
        rows={4}
        style={{
          width: "100%",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--fs-body)",
          color: "var(--text-body)",
          background: "var(--surface-card)",
          border: "1.5px solid var(--border-subtle)",
          borderRadius: "var(--radius-xs)",
          padding: "14px 16px",
          outline: "none",
          resize: "vertical",
        }}
      />
      {max ? (
        <p style={{ marginTop: 6, textAlign: "right", fontSize: "var(--fs-caption)", color: "var(--text-muted)" }}>
          {value.length}/{max}
        </p>
      ) : null}
    </div>
  );
}
