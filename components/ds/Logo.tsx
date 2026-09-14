import * as React from "react";

export interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "style"> {
  /** `color` for light backgrounds, `purple` for purple/dark at standard+ sizes, `white` for small-scale on dark. */
  variant?: "color" | "purple" | "white";
  /** Rendered height in px (width auto). */
  height?: number;
  src?: string;
  alt?: string;
  style?: React.CSSProperties;
}

const DEFAULT_SRC: Record<string, string> = {
  color: "/brand/logos/ditto-logo.png",
  purple: "/brand/logos/ditto-logo-orange-white-dots.png",
  white: "/brand/logos/ditto-logo-white.png",
};

/**
 * Ditto Logo — renders the official wordmark image.
 * `variant="color"` (orange wordmark, purple dots) for light surfaces;
 * `variant="purple"` (orange wordmark, white dots) for purple/dark surfaces;
 * `variant="white"` (white wordmark, orange dots) for small-scale on dark.
 */
export function Logo({ variant = "color", height = 36, src, alt = "Ditto", style, ...rest }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || DEFAULT_SRC[variant] || DEFAULT_SRC.color}
      alt={alt}
      style={{ height, width: "auto", display: "block", ...style }}
      {...rest}
    />
  );
}
