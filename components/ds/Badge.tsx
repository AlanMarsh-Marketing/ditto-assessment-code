import * as React from "react";

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  children?: React.ReactNode;
  /** Brand tone — solid: white text on colour; soft: 050 tint bg + brand colour text. */
  tone?: "orange" | "purple";
  /** Use the pale 050 tint with brand-colour text instead of a solid fill. */
  soft?: boolean;
  style?: React.CSSProperties;
}

/**
 * Ditto Badge — a small label for status, categories, or proof points.
 * Use sparingly. Allowed treatments only: solid orange or purple with white
 * text, or `soft` (050 tint background with the brand colour as text).
 */
export function Badge({ children, tone = "orange", soft = false, style, ...rest }: BadgeProps) {
  const solid: Record<string, { bg: string; fg: string }> = {
    orange: { bg: "var(--ditto-orange)", fg: "#fff" },
    purple: { bg: "var(--ditto-purple)", fg: "#fff" },
  };
  const softMap: Record<string, { bg: string; fg: string }> = {
    orange: { bg: "var(--orange-050)", fg: "var(--ditto-orange)" },
    purple: { bg: "var(--purple-050)", fg: "var(--ditto-purple)" },
  };
  const c = (soft ? softMap : solid)[tone] || (soft ? softMap.orange : solid.orange);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--fw-semibold)",
        fontSize: 12,
        lineHeight: 1,
        letterSpacing: "0.01em",
        padding: "6px 12px",
        borderRadius: 6,
        background: c.bg,
        color: c.fg,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
