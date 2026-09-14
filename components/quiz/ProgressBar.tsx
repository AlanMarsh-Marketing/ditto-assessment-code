/** Orange fill on a hairline track, paired with a "Question X of Y" label — brand/readme.md's Navigation › Progress pattern. */
export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div>
      <div
        style={{
          height: 6,
          borderRadius: "var(--radius-pill)",
          background: "var(--border-subtle)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--ditto-orange)",
            borderRadius: "var(--radius-pill)",
            transition: "width var(--dur-normal) var(--ease-standard)",
          }}
        />
      </div>
      <p style={{ marginTop: 8, fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>
        Question {current} of {total}
      </p>
    </div>
  );
}
