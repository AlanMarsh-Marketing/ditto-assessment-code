"use client";

import * as React from "react";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children?: React.ReactNode;
  /** `primary` = orange, `secondary` = purple fill, `outline` = purple outline, `ghost` = text-only. */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Ditto Button — the primary call-to-action element.
 * Orange is the brand's energy colour; use `primary` for the main action,
 * `secondary` (purple) for alternatives, `ghost` for low-emphasis.
 * Never add glows or drop shadows — see brand/SKILL.md.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  disabled = false,
  type = "button",
  onClick,
  style,
  ...rest
}: ButtonProps) {
  const sizes = {
    sm: { fontSize: 14, padding: "8px 18px", gap: 8, icon: 16, radius: 6 },
    md: { fontSize: 16, padding: "12px 24px", gap: 10, icon: 18, radius: 6 },
    lg: { fontSize: 18, padding: "15px 32px", gap: 12, icon: 20, radius: 8 },
  } as const;
  const s = sizes[size] || sizes.md;

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--action-primary)",
      color: "var(--text-on-brand)",
      border: "2px solid transparent",
    },
    secondary: {
      background: "var(--ditto-purple)",
      color: "#fff",
      border: "2px solid transparent",
    },
    outline: {
      background: "transparent",
      color: "var(--ditto-purple)",
      border: "2px solid var(--ditto-purple)",
    },
    ghost: {
      background: "transparent",
      color: "var(--ditto-orange)",
      border: "2px solid transparent",
    },
  };
  const v = variants[variant] || variants.primary;

  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const hoverBg: Record<string, string> = {
    primary: "var(--action-primary-hover)",
    secondary: "var(--action-secondary-hover)",
    outline: "var(--purple-050)",
    ghost: "var(--orange-050)",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--fw-semibold)",
        fontSize: s.fontSize,
        lineHeight: 1,
        padding: s.padding,
        borderRadius: s.radius,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition:
          "background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)",
        transform: active && !disabled ? "scale(0.97)" : "scale(1)",
        ...v,
        ...(hover && !disabled ? { background: hoverBg[variant] } : null),
        ...style,
      }}
      {...rest}
    >
      {iconLeft ? (
        <span style={{ display: "inline-flex", width: s.icon, height: s.icon }}>{iconLeft}</span>
      ) : null}
      {children}
      {iconRight ? (
        <span style={{ display: "inline-flex", width: s.icon, height: s.icon }}>{iconRight}</span>
      ) : null}
    </button>
  );
}
