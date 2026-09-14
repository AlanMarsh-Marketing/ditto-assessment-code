import * as React from "react";

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  src?: string;
  alt?: string;
  size?: number;
  /** Add a white ring around the portrait. */
  ring?: boolean;
  style?: React.CSSProperties;
}

/** Ditto Avatar — circular portrait for candidate/reviewer identity. */
export function Avatar({ src, alt = "", size = 64, ring = false, style, ...rest }: AvatarProps) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "var(--radius-circle)",
        overflow: "hidden",
        background: "var(--grey-100)",
        boxShadow: ring ? "0 0 0 3px #fff" : "none",
        flex: "none",
        ...style,
      }}
      {...rest}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : null}
    </span>
  );
}
