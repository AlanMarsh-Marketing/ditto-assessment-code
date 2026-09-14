"use client";

import * as React from "react";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  children?: React.ReactNode;
  /** Surface tone — one of the five permitted card styles. See brand/SKILL.md. */
  tone?: "white" | "subtle" | "purple" | "orange" | "dark";
  /** Lift slightly on hover. */
  interactive?: boolean;
  /** Apply default card padding (28px). Turn off for full-bleed media. */
  padded?: boolean;
  style?: React.CSSProperties;
}

/**
 * Ditto Card — a flat surface container, defined by fill + hairline border.
 * `tone` switches the surface: white (default), subtle grey, purple, or
 * orange brand fill. Hover lift is opt-in via `interactive`.
 */
export function Card({
  children,
  tone = "white",
  interactive = false,
  padded = true,
  style,
  ...rest
}: CardProps) {
  const tones: Record<string, React.CSSProperties> = {
    white: {
      background: "var(--surface-card)",
      color: "var(--text-body)",
      border: "1px solid var(--border-subtle)",
    },
    subtle: {
      background: "var(--surface-subtle)",
      color: "var(--text-body)",
      border: "1px solid transparent",
    },
    purple: { background: "var(--ditto-purple)", color: "#fff", border: "1px solid transparent" },
    orange: { background: "var(--ditto-orange)", color: "#fff", border: "1px solid transparent" },
    dark: { background: "var(--ditto-black)", color: "#fff", border: "1px solid transparent" },
  };
  const t = tones[tone] || tones.white;
  const [hover, setHover] = React.useState(false);

  return (
    <div
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        borderRadius: "var(--radius-md)",
        padding: padded ? "var(--pad-card)" : 0,
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "transform var(--dur-normal) var(--ease-standard)",
        cursor: interactive ? "pointer" : "default",
        ...t,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
