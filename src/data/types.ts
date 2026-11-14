export type QuestionSource = "SP26-FE" | "SP26-RE" | "SU26-FE" | "Quizlet" | "Extra" | "Bank300" | "BankExplained";

export interface Question {
  id: string;
  chapter: number;
  sourceLesson: string;
  source: QuestionSource;
  examNo?: number;
  /** Exam number inside a multi-exam bank (Bank300, BankExplained). */
  examSet?: number;
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

export type ContentLang = "en" | "vi";

/** Fills in the language a question is not written in. Option order matches Question.options. */
export interface QuestionTranslation {
  questionVi?: string;
  optionsVi?: string[];
  explanationEn?: string;
}

export interface LocalizedQuestion {
  question: string;
  options: string[];
  explanation: string;
}
