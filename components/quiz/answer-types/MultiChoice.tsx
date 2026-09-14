import type { MultiQuestionSchema } from "@/lib/quiz-schema";
import type { z } from "zod";
import { AnswerTile, type TileState } from "../AnswerTile";
import { Button } from "@/components/ds";

type MultiQuestion = z.infer<typeof MultiQuestionSchema>;

export function MultiChoice({
  question,
  value,
  onChange,
  revealed,
  locked,
  onLock,
}: {
  question: MultiQuestion;
  value: string[];
  onChange: (optionIds: string[]) => void;
  revealed: boolean;
  locked: boolean;
  /** Locks the current selection in — multi needs an explicit confirm since several tiles toggle before it's final. */
  onLock: () => void;
}) {
  function toggle(optionId: string) {
    if (locked) return;
    onChange(value.includes(optionId) ? value.filter((id) => id !== optionId) : [...value, optionId]);
  }

  return (
    <div>
      <p style={{ marginBottom: 10, fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>Select all that apply.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {question.options.map((option) => {
          const isSelected = value.includes(option.id);
          const isCorrectOption = question.correctOptionIds.includes(option.id);
          let state: TileState = isSelected ? "selected" : "idle";
          if (revealed) {
            if (isSelected && isCorrectOption) state = "correct";
            else if (isSelected && !isCorrectOption) state = "incorrect";
            else if (!isSelected && isCorrectOption) state = "correct-reveal";
          }
          return (
            <AnswerTile key={option.id} state={state} marker="checkbox" disabled={locked} onClick={() => toggle(option.id)}>
              {option.label}
            </AnswerTile>
          );
        })}
      </div>
      {!locked ? (
        <div style={{ marginTop: 16 }}>
          <Button variant="primary" disabled={value.length === 0} onClick={onLock}>
            Submit answer
          </Button>
        </div>
      ) : null}
    </div>
  );
}
