import type { TrueFalseQuestionSchema } from "@/lib/quiz-schema";
import type { z } from "zod";
import { AnswerTile, type TileState } from "../AnswerTile";

type TrueFalseQuestion = z.infer<typeof TrueFalseQuestionSchema>;

export function TrueFalse({
  question,
  value,
  onChange,
  revealed,
  locked,
}: {
  question: TrueFalseQuestion;
  value: boolean | null;
  onChange: (v: boolean) => void;
  revealed: boolean;
  locked: boolean;
}) {
  const options: Array<{ id: "true" | "false"; label: string; boolValue: boolean }> = [
    { id: "true", label: "True", boolValue: true },
    { id: "false", label: "False", boolValue: false },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
      {options.map((option) => {
        const isSelected = value === option.boolValue;
        const isCorrectOption = option.boolValue === question.correctAnswer;
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
            onClick={() => onChange(option.boolValue)}
          >
            {option.label}
          </AnswerTile>
        );
      })}
    </div>
  );
}
