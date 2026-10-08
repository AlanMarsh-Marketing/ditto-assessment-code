"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrderQuestionSchema } from "@/lib/quiz-schema";
import type { z } from "zod";
import { seededShuffle } from "@/lib/shuffle";
import { BrandIcon } from "@/components/ds";

type OrderQuestion = z.infer<typeof OrderQuestionSchema>;

/**
 * "Drag into correct sequence" implemented as tap-to-build rather than
 * literal drag-and-drop — more reliable at the 375px phone widths the brief
 * calls out, and needs no drag library. Tap a pooled item to place it next;
 * tap a placed item to send it back to the pool.
 */
export function OrderPicker({
  question,
  value,
  onChange,
  revealed,
  locked,
  onLock,
  shuffleSeed,
}: {
  question: OrderQuestion;
  /** Varies per attempt (stable within one, incl. across a reload) so the pool order isn't the same for everyone. */
  shuffleSeed: number;
  value: string[];
  onChange: (orderedItemIds: string[]) => void;
  revealed: boolean;
  locked: boolean;
  /** Called with the just-completed sequence — not read back from `value`, which
   *  would still be one tap stale in the same synchronous call as onChange. */
  onLock: (finalOrder: string[]) => void;
}) {
  const shuffledItems = React.useMemo(() => {
    // Never present the items already in the correct order — retry with a
    // salted seed until the shuffle differs (always possible for ≥2 items).
    let result = question.items;
    for (let salt = 0; salt < 50; salt++) {
      result = seededShuffle(question.items, `${shuffleSeed}:${question.id}:${salt}`);
      if (result.some((it, i) => it.id !== question.correctOrder[i])) break;
    }
    return result;
  }, [question, shuffleSeed]);
  const itemsById = React.useMemo(() => new Map(question.items.map((it) => [it.id, it])), [question]);
  const pool = shuffledItems.filter((it) => !value.includes(it.id));

  function place(id: string) {
    if (locked) return;
    const next = [...value, id];
    onChange(next);
    if (next.length === question.items.length) onLock(next);
  }

  function unplace(id: string) {
    if (locked) return;
    onChange(value.filter((existing) => existing !== id));
  }

  return (
    <div>
      <p style={{ marginBottom: 12, fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>
        {locked ? "Your order:" : "Tap items below in the order you think is correct."}
      </p>

      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <AnimatePresence initial={false}>
          {value.map((id, index) => {
            const item = itemsById.get(id);
            const isCorrectPosition = revealed && question.correctOrder[index] === id;
            const isWrongPosition = revealed && question.correctOrder[index] !== id;
            return (
              <motion.li
                key={id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid",
                  borderColor: isCorrectPosition ? "var(--success)" : isWrongPosition ? "var(--danger)" : "var(--ditto-orange)",
                  background: isCorrectPosition ? "#EAF7EF" : isWrongPosition ? "#FDECEA" : "var(--orange-050)",
                  cursor: locked ? "default" : "pointer",
                }}
                onClick={() => unplace(id)}
              >
                <span
                  style={{
                    flex: "none",
                    width: 24,
                    height: 24,
                    borderRadius: "var(--radius-circle)",
                    background: "var(--ditto-purple)",
                    color: "#fff",
                    fontSize: "var(--fs-caption)",
                    fontWeight: "var(--fw-semibold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {index + 1}
                </span>
                <span style={{ flex: 1, fontSize: "var(--fs-body)" }}>{item?.label}</span>
                {revealed ? <BrandIcon name={isCorrectPosition ? "tick-filled" : "cross-filled"} size={20} /> : null}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>

      {pool.length > 0 ? (
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {pool.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => place(item.id)}
              disabled={locked}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--fs-body)",
                color: "var(--text-body)",
                background: "var(--surface-card)",
                border: "1.5px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                cursor: locked ? "default" : "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
