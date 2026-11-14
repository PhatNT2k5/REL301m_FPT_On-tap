import { CHAPTERS } from "../../data/chapters";
import { EXAMS, QUESTIONS } from "../../data/questions";
import type { Question } from "../../data/types";
import type { Progress } from "../progress/store";

export type DeckKind = "all" | "chapter" | "exam" | "starred" | "hard";

export interface Deck {
  id: string;
  kind: DeckKind;
  label: string;
  /** Compact label for the deck chips. */
  shortLabel: string;
  questionIds: string[];
}

const SOURCE_ORDER = ["SP26-FE", "SP26-RE", "SU26-FE", "Quizlet", "Extra", "BankExplained", "Bank300"];

const byChapterThenSource = (a: Question, b: Question): number =>
  a.chapter - b.chapter ||
  SOURCE_ORDER.indexOf(a.source) - SOURCE_ORDER.indexOf(b.source) ||
  a.id.localeCompare(b.id, undefined, { numeric: true });

const CHAPTER_SHORT: Record<number, string> = {
  1: "Bandits",
  2: "MDP",
  3: "Bellman",
  4: "Quy hoạch động",
  5: "Monte Carlo",
  6: "TD",
  7: "Sarsa & Q-learning",
  8: "Dyna & planning",
  9: "Xấp xỉ hàm",
  10: "Average reward",
  11: "Policy gradient",
};

const normalizeText = (text: string): string => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/** Drops questions whose wording repeats an earlier one (the practice exams reuse a few word for word). */
const withoutRepeats = (questions: Question[]): Question[] => {
  const seen = new Set<string>();
  return questions.filter((q) => {
    const key = normalizeText(q.question);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const examOrder = (a: Question, b: Question): number =>
  (a.examSet ?? 0) - (b.examSet ?? 0) || (a.examNo ?? 0) - (b.examNo ?? 0);

export const buildDecks = (progress: Progress): Deck[] => {
  const sorted = withoutRepeats([...QUESTIONS].sort(byChapterThenSource));
  const hard = Object.entries(progress.wrongTotals)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .filter((id) => QUESTIONS.some((q) => q.id === id));
  return [
    { id: "all", kind: "all", label: "Tất cả", shortLabel: "Tất cả", questionIds: sorted.map((q) => q.id) },
    {
      id: "starred",
      kind: "starred",
      label: "Đã đánh dấu",
      shortLabel: "★ Đã đánh dấu",
      questionIds: sorted.filter((q) => progress.starred.includes(q.id)).map((q) => q.id),
    },
    { id: "hard", kind: "hard", label: "Hay sai", shortLabel: "Hay sai", questionIds: hard },
    ...CHAPTERS.map<Deck>((c) => ({
      id: `ch-${c.number}`,
      kind: "chapter",
      label: `Ch.${c.number} ${c.title}`,
      shortLabel: `Ch.${c.number} ${CHAPTER_SHORT[c.number] ?? c.title}`,
      questionIds: sorted.filter((q) => q.chapter === c.number).map((q) => q.id),
    })),
    ...EXAMS.map<Deck>((e) => ({
      id: `exam-${e.id}`,
      kind: "exam",
      label: e.label,
      shortLabel: e.label,
      questionIds: QUESTIONS.filter((q) => q.source === e.source && (e.examSet === undefined || q.examSet === e.examSet))
        .sort(examOrder)
        .map((q) => q.id),
    })),
  ];
};

export const sessionKey = (deckId: string, size: number, index: number): string => `${deckId}:${size}:${index}`;
