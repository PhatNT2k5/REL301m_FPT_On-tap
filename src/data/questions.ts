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
