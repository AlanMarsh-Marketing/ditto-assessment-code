/** Circular countdown — orange stroke depleting on a hairline track, for timed questions. */
export function CountdownRing({ secondsRemaining, totalSeconds }: { secondsRemaining: number; totalSeconds: number }) {
  const size = 56;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = totalSeconds > 0 ? Math.max(0, secondsRemaining / totalSeconds) : 0;
  const urgent = secondsRemaining <= 5;

  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={urgent ? "var(--danger)" : "var(--ditto-orange)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          style={{ transition: "stroke-dashoffset var(--dur-fast) linear, stroke var(--dur-normal) var(--ease-standard)" }}
        />
      </svg>
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "var(--fs-sm)",
          fontWeight: "var(--fw-semibold)",
          color: urgent ? "var(--danger)" : "var(--ditto-purple)",
        }}
      >
        {Math.ceil(secondsRemaining)}
      </span>
    </div>
  );
}
