import * as React from "react";

/**
 * Ditto crop registry — the correct focal crop for each library photo.
 * `object-fit:cover` alone centres a photo and drifts the subject out of the
 * aperture, so every photo has a hand-tuned position (and occasional scale).
 * Keyed by bare filename; keep in sync with brand/readme.md § 06 Imagery.
 */
export const APERTURE_CROPS: Record<string, { objectPosition: string; scale?: number }> = {
  "woman-phone-city.jpeg": { objectPosition: "0% 25%" },
  "person-trading-phone.jpg": { objectPosition: "50% 30%" },
  "couple-phone-street.jpg": { objectPosition: "40% 25%" },
  "woman-phone-city-night.jpg": { objectPosition: "50% 20%" },
  "woman-earbuds-orange-jacket.jpg": { objectPosition: "75% 20%", scale: 1.15 },
  "man-phone-urban.jpg": { objectPosition: "30% 10%" },
  "man-shared-workspace.jpg": { objectPosition: "50% 15%" },
  "man-walking-phone.jpg": { objectPosition: "40% 15%" },
  "couple-working-office.jpg": { objectPosition: "50% 20%" },
};

/**
 * Build a pixel-exact aperture clip-path for a given box.
 * ONE fixed orientation: notch cut from the top-left, only the bottom-left
 * corner rounded — the signature Ditto shape. Aperture photos are for
 * presentation/cover contexts only — never inside the quiz-taking flow
 * (see brand/../quiz-assessment-ui-brief.md).
 */
export function apertureClipPath(w: number, h: number): string {
  const P = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`;
  const p = {
    tr: [w, 0] as const,
    br: [w, h] as const,
    notchOut: [w * 0.179, h] as const,
    arcEnd: [0, h * 0.835] as const,
    arcC1: [w * 0.073, h * 0.998] as const,
    arcC2: [w * 0.007, h * 0.946] as const,
    inTop: [0, h * 0.172] as const,
    inCorner: [w * 0.255, h * 0.172] as const,
    inUp: [w * 0.255, 0] as const,
  };
  return (
    `path("M ${P(...p.tr)} L ${P(...p.br)} L ${P(...p.notchOut)} ` +
    `C ${P(...p.arcC1)} ${P(...p.arcC2)} ${P(...p.arcEnd)} ` +
    `L ${P(...p.inTop)} L ${P(...p.inCorner)} L ${P(...p.inUp)} Z")`
  );
}

export interface ApertureImageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  /** Library photo filename (e.g. `"man-phone-urban.jpg"`) — its baked crop is applied automatically. */
  photo?: string;
  /** Explicit image src; overrides `photo` path resolution. */
  src?: string;
  width?: number;
  height?: number;
  /** Override the focal crop for a photo not in the registry. */
  objectPosition?: string;
  /** Override the zoom for a photo not in the registry. */
  scale?: number;
  /** Folder photos live in (default `/brand/photos/`). */
  basePath?: string;
  alt?: string;
  style?: React.CSSProperties;
  /** Extra styles on the inner <img>. */
  imgStyle?: React.CSSProperties;
}

/**
 * Ditto ApertureImage — a cover photo cropped inside the signature aperture
 * shape, with the correct focal crop baked in per filename. Cover-only:
 * place on the right half of a slide/cover, flush to top/right/bottom edges.
 */
export function ApertureImage({
  photo,
  src,
  width = 180,
  height = 200,
  objectPosition,
  scale,
  basePath = "/brand/photos/",
  alt = "",
  style,
  imgStyle,
  ...rest
}: ApertureImageProps) {
  const file = (photo || src || "").split("/").pop() || "";
  const crop = APERTURE_CROPS[file] || {};
  const pos = objectPosition || crop.objectPosition || "50% 50%";
  const zoom = scale != null ? scale : crop.scale;
  const resolvedSrc = src || (photo && (photo.includes("/") ? photo : basePath + photo));

  return (
    <div
      style={{
        width,
        height,
        clipPath: apertureClipPath(width, height),
        overflow: "hidden",
        flex: "none",
        ...style,
      }}
      {...rest}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: pos,
          display: "block",
          ...(zoom ? { transform: `scale(${zoom})`, transformOrigin: pos } : null),
          ...imgStyle,
        }}
      />
    </div>
  );
}
