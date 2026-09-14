import type { Quiz } from "@/lib/quiz-schema";
import type { QuizResult } from "@/lib/scoring";
import { Card, Badge, StatCallout, Logo } from "@/components/ds";

export type SubmissionState = "skipped" | "saving" | "saved" | "failed";

/** Score, pass/fail, per-tag breakdown — screenshot-friendly, no cross-person leaderboard. */
export function EndScreen({
  quiz,
  result,
  isPreview,
  embed = false,
  submissionState,
  referenceCode,
}: {
  quiz: Quiz;
  result: QuizResult;
  isPreview: boolean;
  embed?: boolean;
  submissionState: SubmissionState;
  referenceCode?: string;
}) {
  return (
    <div
      style={
        embed
          ? { display: "flex", justifyContent: "center", padding: "24px 20px" }
          : { minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }
      }
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Logo variant="color" height={28} />
        </div>

        <Card style={{ textAlign: "center" }}>
          <p className="ditto-eyebrow" style={{ textAlign: "center" }}>
            {quiz.title}
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <StatCallout value={result.percentage} unit="%" align="center" size="xl" />
          </div>
          <p style={{ marginTop: 8, fontSize: "var(--fs-body)", color: "var(--text-muted)" }}>
            {result.score} of {result.maxScore} scored questions correct
          </p>

          {result.passed !== null ? (
            <div style={{ marginTop: 16 }}>
              <Badge tone={result.passed ? "orange" : "purple"} soft={!result.passed}>
                {result.passed ? "Passed" : "Not yet — retake with your manager"}
              </Badge>
            </div>
          ) : null}
        </Card>

        {result.tagBreakdown.length > 0 ? (
          <Card style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: "var(--fs-h4)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>
              By topic
            </h2>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {result.tagBreakdown.map((entry) => (
                <div key={entry.tag} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-body)" }}>{entry.tag}</span>
                  <span style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", color: "var(--ditto-orange)" }}>
                    {entry.correct}/{entry.total}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <p style={{ marginTop: 20, textAlign: "center", fontSize: "var(--fs-caption)", color: "var(--text-muted)" }}>
          {isPreview
            ? "Preview mode — this attempt was not saved."
            : submissionState === "saving"
              ? "Saving your result…"
              : submissionState === "saved"
                ? "Result saved."
                : submissionState === "failed"
                  ? `Your result couldn't be saved. Please report this reference code: ${referenceCode}`
                  : ""}
        </p>
      </div>
    </div>
  );
}
