import { annotateTerms } from "./annotateTerms";
import raw from "./questions.json";
import rawTranslations from "./translations.json";
import type { ContentLang, LocalizedQuestion, Question, QuestionSource, QuestionTranslation } from "./types";

export const QUESTIONS: Question[] = raw as Question[];

export const QUESTION_BY_ID: Map<string, Question> = new Map(QUESTIONS.map((q) => [q.id, q]));

const TRANSLATIONS: Record<string, QuestionTranslation> = rawTranslations as Record<string, QuestionTranslation>;

/**
 * Question text and options are written in English, explanations in Vietnamese.
 * The language toggle only switches the question and options; the explanation always stays
 * in Vietnamese, with English RL terms glossed in Vietnamese.
 */
export const localizeQuestion = (q: Question, lang: ContentLang): LocalizedQuestion => {
  const explanation = annotateTerms(q.explanation);
  if (lang === "en") {
    return { question: q.question, options: q.options, explanation };
  }
  const t = TRANSLATIONS[q.id];
  const optionsVi = t?.optionsVi?.length === q.options.length ? t.optionsVi : q.options;
  return { question: t?.questionVi ?? q.question, options: optionsVi, explanation };
};

export interface ExamDeckSpec {
  id: string;
  source: QuestionSource;
  examSet?: number;
  label: string;
}

const OPTION_LETTERS = "ABCDEFGH";

/**
 * Explanations refer to options by letter ("Phương án B"). When options are shown shuffled,
 * rewrite those letters to the displayed positions. order[displayed] = original index.
 */
export const relabelExplanation = (explanation: string, order: number[]): string => {
  const displayedOf = new Map(order.map((original, displayed) => [OPTION_LETTERS[original], OPTION_LETTERS[displayed]]));
  return explanation.replace(
    /(Phương án|phương án|Đáp án|đáp án) ([A-H])(?![\p{L}\p{N}])/gu,
    (match, word: string, letter: string) => (displayedOf.has(letter) ? `${word} ${displayedOf.get(letter)}` : match),
  );
};

export const EXAMS: ExamDeckSpec[] = [
  { id: "SP26-FE", source: "SP26-FE", label: "FE SP26" },
  { id: "SP26-RE", source: "SP26-RE", label: "RE SP26" },
  { id: "SU26-FE", source: "SU26-FE", label: "FE SU26" },
  ...[1, 2, 3, 4, 5].map((n) => ({ id: `Bank300-${n}`, source: "Bank300" as const, examSet: n, label: `Đề luyện ${n}` })),
  { id: "BankExplained", source: "BankExplained", label: "Bộ có giải thích chi tiết" },
];

export const SOURCE_LABEL: Record<QuestionSource, string> = {
  "SP26-FE": "Đề SP26 FE",
  "SP26-RE": "Đề SP26 RE",
  "SU26-FE": "Đề SU26 FE",
  Quizlet: "Quizlet",
  Extra: "Bổ sung từ slide",
  Bank300: "Đề luyện",
  BankExplained: "Bộ có giải thích",
};

/** "Đề SP26 FE câu 12", "Đề luyện 3 câu 41", "Quizlet". */
export const questionOrigin = (q: Question): string => {
  const base = q.source === "Bank300" && q.examSet ? `${SOURCE_LABEL.Bank300} ${q.examSet}` : SOURCE_LABEL[q.source];
  const showNumber = q.examNo !== undefined && q.source !== "BankExplained";
  return showNumber ? `${base} câu ${q.examNo}` : base;
};
