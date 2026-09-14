import type { Quiz } from "@/lib/quiz-schema";
import { Card, Logo } from "@/components/ds";

/** Branded message for `status: "closed"` — no questions rendered, nothing writes to Notion. */
export function ClosedScreen({ quiz }: { quiz: Quiz }) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Logo variant="color" height={28} />
        </div>
        <Card tone="purple">
          <h1 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-medium)", color: "#fff" }}>
            {quiz.title} is now closed
          </h1>
          <p style={{ marginTop: 12, fontSize: "var(--fs-body)", color: "rgba(255,255,255,0.85)" }}>
            This assessment is no longer accepting responses.
          </p>
        </Card>
      </div>
    </div>
  );
}
