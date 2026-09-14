import * as React from "react";

export interface IconFeatureProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "style" | "title"> {
  /** A Ditto brand icon node, e.g. <BrandIcon name="protected" />. */
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** `stack` = icon above text; `row` = icon to the left. */
  layout?: "stack" | "row";
  iconSize?: number;
  /** Set true on purple/black surfaces. */
  onDark?: boolean;
  style?: React.CSSProperties;
}

/** Ditto IconFeature — an icon-led feature/benefit point. */
export function IconFeature({
  icon,
  title,
  children,
  layout = "stack",
  iconSize = 56,
  onDark = false,
  style,
  ...rest
}: IconFeatureProps) {
  const isRow = layout === "row";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isRow ? "row" : "column",
        gap: isRow ? 16 : 14,
        alignItems: "flex-start",
        fontFamily: "var(--font-sans)",
        ...style,
      }}
      {...rest}
    >
      <div style={{ flex: "none", width: iconSize, height: iconSize, display: "inline-flex" }}>
        {icon}
      </div>
      <div>
        {title ? (
          <h4
            style={{
              margin: 0,
              fontSize: 19,
              fontWeight: "var(--fw-semibold)",
              color: onDark ? "#fff" : "var(--text-strong)",
            }}
          >
            {title}
          </h4>
        ) : null}
        {children ? (
          <p
            style={{
              margin: title ? "6px 0 0" : 0,
              fontSize: 15,
              lineHeight: 1.5,
              color: onDark ? "rgba(255,255,255,0.78)" : "var(--text-body)",
            }}
          >
            {children}
          </p>
        ) : null}
      </div>
    </div>
  );
}
