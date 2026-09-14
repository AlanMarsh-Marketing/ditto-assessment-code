"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BrandIcon } from "@/components/ds";

export type TileState = "idle" | "selected" | "correct" | "incorrect" | "correct-reveal";

const STATE_STYLE: Record<TileState, React.CSSProperties> = {
  idle: { background: "var(--surface-card)", borderColor: "var(--border-subtle)" },
  selected: { background: "var(--orange-050)", borderColor: "var(--ditto-orange)" },
  correct: { background: "#EAF7EF", borderColor: "var(--success)" },
  incorrect: { background: "#FDECEA", borderColor: "var(--danger)" },
  "correct-reveal": { background: "var(--surface-card)", borderColor: "var(--success)" },
};

export interface AnswerTileProps {
  children: React.ReactNode;
  state: TileState;
  onClick?: () => void;
  disabled?: boolean;
  /** Left-side marker: a radio dot (single/trueFalse) or a checkbox (multi). */
  marker?: "radio" | "checkbox";
}

/**
 * One answer option — a large, tappable full-bleed tile (the "Kahoot energy
 * within Ditto's palette" the brief calls for). Flat, 1.5px border, no
 * shadow; feedback uses the brand's four semantic tint+border pairs, never
 * an edge stripe.
 */
export function AnswerTile({ children, state, onClick, disabled, marker }: AnswerTileProps) {
  const icon =
    state === "correct" ? "tick-filled" : state === "incorrect" ? "cross-filled" : state === "correct-reveal" ? "approved" : null;
  // Once revealed, the tick/cross/approved icon on the right already carries
  // the result — showing the radio/checkbox marker too would mean two
  // indicators disagreeing on colour (marker orange, tile green/red).
  const showMarker = state === "idle" || state === "selected";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        textAlign: "left",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--fs-body)",
        fontWeight: "var(--fw-medium)",
        color: "var(--text-body)",
        border: "1.5px solid",
        borderRadius: "var(--radius-md)",
        padding: "18px 20px",
        cursor: disabled ? "default" : "pointer",
        transition: "background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)",
        ...STATE_STYLE[state],
      }}
    >
      {marker === "radio" && showMarker ? (
        <span
          aria-hidden
          style={{
            flex: "none",
            width: 20,
            height: 20,
            borderRadius: "var(--radius-circle)",
            border: `2px solid ${state === "selected" ? "var(--ditto-orange)" : "var(--border-subtle)"}`,
            background: state === "selected" ? "var(--ditto-orange)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {state === "selected" ? (
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
          ) : null}
        </span>
      ) : null}

      {marker === "checkbox" && showMarker ? (
        <span
          aria-hidden
          style={{
            flex: "none",
            width: 20,
            height: 20,
            borderRadius: "var(--radius-xs)",
            border: `2px solid ${state === "selected" ? "var(--ditto-orange)" : "var(--border-subtle)"}`,
            background: state === "selected" ? "var(--ditto-orange)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {state === "selected" ? <BrandIcon name="ui-tick" size={14} style={{ "--icon-ink": "#fff" } as React.CSSProperties} /> : null}
        </span>
      ) : null}

      <span style={{ flex: 1 }}>{children}</span>

      {icon ? <BrandIcon name={icon} size={22} style={{ flex: "none" }} /> : null}
    </motion.button>
  );
}
