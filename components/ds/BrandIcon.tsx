import * as React from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ICONS_DIR = join(process.cwd(), "brand", "icons");

// Cache inlined SVG markup per icon name for the life of the server process —
// these are static files, safe to read once.
const cache = new Map<string, string>();

function loadIconSvg(name: string): string {
  const cached = cache.get(name);
  if (cached !== undefined) return cached;
  try {
    const svg = readFileSync(join(ICONS_DIR, `${name}.svg`), "utf8");
    cache.set(name, svg);
    return svg;
  } catch {
    // Missing icon — flag the gap rather than silently rendering nothing.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[BrandIcon] "${name}" not found in brand/icons/ — pick the closest brand icon instead of substituting a generic one.`
      );
    }
    cache.set(name, "");
    return "";
  }
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
 * Ditto brand icon — inlines one of the 84 SVGs from brand/icons/ so its
 * `fill: var(--icon-ink)` / `var(--icon-accent)` linework recolours via CSS
 * custom properties (the `on-purple` tone flips ink to white).
 *
 * Always use a Ditto brand icon — never Lucide/Font Awesome/Material/emoji.
 * `ui-*` names (ui-chevron-down, ui-back, ui-close, ui-tick, …) are UI-control
 * furniture only (dropdowns, back/close, checkbox ticks) — not content icons.
 * See brand/SKILL.md § Icons.
 */
export function BrandIcon({ name, size = 24, tone = "default", style, ...rest }: BrandIconProps) {
  const svg = loadIconSvg(name);
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
