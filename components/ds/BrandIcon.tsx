"use client";

import * as React from "react";

// Module-level cache (persists for the page's lifetime) — these are static
// files, fetched once per icon name regardless of how many times/where
// <BrandIcon> is used. Mirrors brand/icons/ditto-icon.js's own approach,
// adapted to a React component so it works inside Client Components (most
// of the quiz UI) as well as when rendered from a Server Component.
const cache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

function loadIconSvg(name: string): Promise<string> {
  const cached = cache.get(name);
  if (cached !== undefined) return Promise.resolve(cached);

  const pending = inFlight.get(name);
  if (pending) return pending;

  const promise = fetch(`/brand/icons/${encodeURIComponent(name)}.svg`)
    .then((res) => (res.ok ? res.text() : ""))
    .catch(() => "")
    .then((svg) => {
      if (!svg && process.env.NODE_ENV !== "production") {
        console.warn(
          `[BrandIcon] "${name}" not found in brand/icons/ — pick the closest brand icon instead of substituting a generic one.`
        );
      }
      cache.set(name, svg);
      inFlight.delete(name);
      return svg;
    });
  inFlight.set(name, promise);
  return promise;
}

export interface BrandIconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  /** Bare filename (no extension) from brand/icons/, e.g. "approved", "ui-tick". */
  name: string;
  /** Render size in px (both dimensions). Default 24. */
  size?: number;
  /** `on-purple` flips --icon-ink to white for use on a purple/dark surface. */
  tone?: "default" | "on-purple";
  style?: React.CSSProperties;
}

/**
 * Ditto brand icon — inlines one of the 84 SVGs from brand/icons/ (served
 * from public/brand/icons/) so its `fill: var(--icon-ink)` /
 * `var(--icon-accent)` linework recolours via CSS custom properties (the
 * `on-purple` tone flips ink to white).
 *
 * Always use a Ditto brand icon — never Lucide/Font Awesome/Material/emoji.
 * `ui-*` names (ui-chevron-down, ui-back, ui-close, ui-tick, …) are UI-control
 * furniture only (dropdowns, back/close, checkbox ticks) — not content icons.
 * See brand/SKILL.md § Icons.
 */
export function BrandIcon({ name, size = 24, tone = "default", style, ...rest }: BrandIconProps) {
  const [svg, setSvg] = React.useState<string>(() => cache.get(name) ?? "");

  React.useEffect(() => {
    let cancelled = false;
    loadIconSvg(name).then((result) => {
      if (!cancelled) setSvg(result);
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  return (
    <span
      aria-hidden={rest["aria-label"] ? undefined : true}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        lineHeight: 0,
        flex: "none",
        ...(tone === "on-purple" ? ({ ["--icon-ink" as string]: "#fff" } as React.CSSProperties) : null),
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
      {...rest}
    />
  );
}
