export type QuestionSource = "SP26-FE" | "SP26-RE" | "SU26-FE" | "Quizlet" | "Extra";

export interface Question {
  id: string;
  chapter: number;
  sourceLesson: string;
  source: QuestionSource;
  examNo?: number;
  question: string;
  options: string[];
  answers: number[];
  multi: boolean;
  answerSource: "official" | "verified-by-slides";
  explanation: string;
  formula?: string;
}

export interface Chapter {
  number: number;
  title: string;
  titleVi: string;
  lessons: { id: string; title: string }[];
  keyPoints: string[];
}
