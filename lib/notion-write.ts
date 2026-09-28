import { isScoredQuestion, type Quiz, type Question } from "./quiz-schema";
import {
  buildResponseTitle,
  deriveIdentitySummary,
  formatAnswerText,
  formatCorrectAnswerText,
  isAnswerCorrect,
  type AnswerResponse,
  type QuizResult,
} from "./scoring";

const richText = (content: string) => [{ type: "text" as const, text: { content } }];

/** Notion property values for one Responses page. */
export function buildResponseProperties(params: {
  quiz: Quiz;
  identity: Record<string, string>;
  result: QuizResult;
  durationSeconds: number;
  submittedAt: Date;
}) {
  const { quiz, identity, result, durationSeconds, submittedAt } = params;
  const { respondent, email, partner } = deriveIdentitySummary(quiz, identity);

  return {
    Name: { type: "title" as const, title: richText(buildResponseTitle(quiz, respondent, submittedAt)) },
    Quiz: { type: "select" as const, select: { name: quiz.title } },
    Audience: { type: "select" as const, select: { name: quiz.audience } },
    Respondent: { type: "rich_text" as const, rich_text: richText(respondent) },
    ...(email ? { Email: { type: "email" as const, email } } : {}),
    ...(partner ? { Partner: { type: "rich_text" as const, rich_text: richText(partner) } } : {}),
    "Identity (raw)": { type: "rich_text" as const, rich_text: richText(JSON.stringify(identity)) },
    Score: { type: "number" as const, number: result.score },
    "Max score": { type: "number" as const, number: result.maxScore },
    Passed: { type: "checkbox" as const, checkbox: result.passed ?? false },
    "Duration (s)": { type: "number" as const, number: Math.round(durationSeconds) },
    Submitted: { type: "date" as const, date: { start: submittedAt.toISOString() } },
  };
}

/** Notion property values for one Answers page, relating it back to `responsePageId`. */
export function buildAnswerProperties(params: {
  quiz: Quiz;
  question: Question;
  response: AnswerResponse | undefined;
  respondent: string;
  responsePageId: string;
}) {
  const { quiz, question, response, respondent, responsePageId } = params;
  const unscored = !isScoredQuestion(question.type);

  return {
    Name: { type: "title" as const, title: richText(`${question.id} — ${respondent || "Anonymous"}`) },
    Response: { type: "relation" as const, relation: [{ id: responsePageId }] },
    Quiz: { type: "select" as const, select: { name: quiz.title } },
    "Question ID": { type: "rich_text" as const, rich_text: richText(question.id) },
    Question: { type: "rich_text" as const, rich_text: richText(question.prompt) },
    Type: { type: "select" as const, select: { name: question.type } },
    Tags: { type: "multi_select" as const, multi_select: (question.tags ?? []).map((name) => ({ name })) },
    Answer: { type: "rich_text" as const, rich_text: richText(formatAnswerText(question, response)) },
    "Correct answer": { type: "rich_text" as const, rich_text: richText(formatCorrectAnswerText(question)) },
    Correct: { type: "checkbox" as const, checkbox: unscored ? false : isAnswerCorrect(question, response) },
    Unscored: { type: "checkbox" as const, checkbox: unscored },
    "Time taken (s)": { type: "number" as const, number: Math.round(response?.timeTakenSeconds ?? 0) },
  };
}
