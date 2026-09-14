import type { SingleQuestionSchema } from "@/lib/quiz-schema";
import type { z } from "zod";
import { AnswerTile, type TileState } from "../AnswerTile";

type SingleQuestion = z.infer<typeof SingleQuestionSchema>;

export function SingleChoice({
  question,
  value,
  onChange,
  revealed,
  locked,
}: {
  question: SingleQuestion;
  value: string | null;
  onChange: (optionId: string) => void;
  revealed: boolean;
  locked: boolean;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
      {question.options.map((option) => {
        const isSelected = value === option.id;
        const isCorrectOption = option.id === question.correctOptionId;
        let state: TileState = isSelected ? "selected" : "idle";
        if (revealed) {
          if (isSelected && isCorrectOption) state = "correct";
          else if (isSelected && !isCorrectOption) state = "incorrect";
          else if (!isSelected && isCorrectOption) state = "correct-reveal";
        }
        return (
          <AnswerTile
            key={option.id}
            state={state}
            marker="radio"
            disabled={locked}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </AnswerTile>
        );
      })}
    </div>
  );
}
