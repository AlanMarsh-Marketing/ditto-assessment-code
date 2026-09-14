import * as React from "react";

export interface StatCalloutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** The headline figure, e.g. "450" or "99.9%". */
  value: React.ReactNode;
  /** Optional small unit beside the number, e.g. "mil", "+". */
  unit?: React.ReactNode;
  /** Supporting label below. */
  label?: React.ReactNode;
  /** Dims the label for use on a dark background. The number is always brand orange. */
  onDark?: boolean;
  align?: "left" | "center";
  size?: "md" | "lg" | "xl";
  style?: React.CSSProperties;
}

/**
 * Ditto StatCallout — the signature big-number proof point (score, pass
 * rate, time taken). The number is always brand orange in Regular weight.
 * Never invent the figure it displays — see brand/SKILL.md's hallucination rule.
 */
export function StatCallout({
  value,
  unit,
  label,
  onDark = false,
  align = "left",
  size = "lg",
  style,
  ...rest
}: StatCalloutProps) {
  const sizes = { md: 48, lg: 72, xl: 104 } as const;
  const fs = sizes[size] || sizes.lg;
  const c = "var(--ditto-orange)";

  return (
    <div style={{ textAlign: align, fontFamily: "var(--font-sans)", ...style }} {...rest}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: align === "center" ? "center" : "flex-start",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: fs,
            fontWeight: "var(--fw-regular)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: c,
          }}
        >
          {value}
        </span>
        {unit ? (
          <span style={{ fontSize: fs * 0.34, fontWeight: "var(--fw-regular)", color: c }}>
            {unit}
          </span>
        ) : null}
      </div>
      {label ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 16,
            fontWeight: "var(--fw-medium)",
            color: onDark ? "rgba(255,255,255,0.8)" : "var(--text-muted)",
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}
