import { CHAPTERS } from "../../data/chapters";
import { EXAMS, QUESTIONS } from "../../data/questions";
import type { Question } from "../../data/types";
import type { Progress } from "../progress/store";

export type DeckKind = "all" | "chapter" | "exam" | "starred" | "hard";

export interface Deck {
  id: string;
  kind: DeckKind;
  label: string;
  questionIds: string[];
}

const SOURCE_ORDER = ["SP26-FE", "SP26-RE", "SU26-FE", "Quizlet", "Extra"];

const byChapterThenSource = (a: Question, b: Question): number =>
  a.chapter - b.chapter ||
  SOURCE_ORDER.indexOf(a.source) - SOURCE_ORDER.indexOf(b.source) ||
  a.id.localeCompare(b.id, undefined, { numeric: true });

export const buildDecks = (progress: Progress): Deck[] => {
  const sorted = [...QUESTIONS].sort(byChapterThenSource);
  const hard = Object.entries(progress.wrongTotals)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .filter((id) => QUESTIONS.some((q) => q.id === id));
  return [
    { id: "all", kind: "all", label: "Tất cả", questionIds: sorted.map((q) => q.id) },
    { id: "starred", kind: "starred", label: "Đã đánh dấu", questionIds: sorted.filter((q) => progress.starred.includes(q.id)).map((q) => q.id) },
    { id: "hard", kind: "hard", label: "Hay sai", questionIds: hard },
    ...CHAPTERS.map<Deck>((c) => ({
      id: `ch-${c.number}`,
      kind: "chapter",
      label: `Ch.${c.number} ${c.title}`,
      questionIds: sorted.filter((q) => q.chapter === c.number).map((q) => q.id),
    })),
    ...EXAMS.map<Deck>((e) => ({
      id: `exam-${e.source}`,
      kind: "exam",
      label: e.label,
      questionIds: QUESTIONS.filter((q) => q.source === e.source)
        .sort((a, b) => (a.examNo ?? 0) - (b.examNo ?? 0))
        .map((q) => q.id),
    })),
  ];
};

export const sessionKey = (deckId: string, size: number, index: number): string => `${deckId}:${size}:${index}`;
