import raw from "./questions.json";
import type { Question, QuestionSource } from "./types";

export const QUESTIONS: Question[] = raw as Question[];

export const QUESTION_BY_ID: Map<string, Question> = new Map(QUESTIONS.map((q) => [q.id, q]));

export const EXAMS: { source: QuestionSource; label: string }[] = [
  { source: "SP26-FE", label: "Đề FE Spring 2026" },
  { source: "SP26-RE", label: "Đề RE Spring 2026" },
  { source: "SU26-FE", label: "Đề FE Summer 2026" },
];

export const SOURCE_LABEL: Record<QuestionSource, string> = {
  "SP26-FE": "Đề SP26 FE",
  "SP26-RE": "Đề SP26 RE",
  "SU26-FE": "Đề SU26 FE",
  Quizlet: "Quizlet",
  Extra: "Bổ sung từ slide",
};
