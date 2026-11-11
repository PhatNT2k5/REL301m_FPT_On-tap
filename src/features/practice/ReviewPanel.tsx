import { MathText } from "../../components/MathText";
import { CHAPTERS } from "../../data/chapters";
import { LangToggle } from "../../components/LangToggle";
import { SOURCE_LABEL, localizeQuestion } from "../../data/questions";
import type { Question } from "../../data/types";
import { toggleStar, useSettings } from "../progress/store";
import { answersFor, type SessionState } from "./engine";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

interface ReviewPanelProps {
  question: Question;
  number: number;
  state: SessionState;
  optionOrder: number[];
  starred: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  onStep: (delta: number) => void;
  onClose: () => void;
  closeLabel: string;
}

/** Read-only view of a question already answered in this session: correct answer, your picks, explanation. */
export const ReviewPanel = ({
  question,
  number,
  state,
  optionOrder,
  starred,
  hasPrevious,
  hasNext,
  onStep,
  onClose,
  closeLabel,
}: ReviewPanelProps) => {
  const [settings] = useSettings();
  const text = localizeQuestion(question, settings.contentLang);
  const attempts = answersFor(state, question.id);
  const lastChosen = attempts.at(-1)?.chosen ?? [];
  const solved = state.solved.includes(question.id);
  const wrongCount = state.wrongCounts[question.id] ?? 0;
  const chapter = CHAPTERS.find((c) => c.number === question.chapter);
  const letterOf = (original: number): string => LETTERS[optionOrder.indexOf(original)] ?? "?";

  const status = solved
    ? wrongCount === 0
      ? { text: "Đúng ngay lần đầu", tone: "border-sage bg-sage-soft" }
      : { text: `Đúng sau ${wrongCount} lần sai`, tone: "border-reward bg-reward-soft" }
    : { text: `Đã sai ${wrongCount} lần, đang chờ làm lại`, tone: "border-penalty bg-penalty-soft" };

  return (
    <section className="rounded-2xl border border-ink bg-panel p-5 sm:p-7" aria-label={`Xem lại câu ${number}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-md bg-ink px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-paper">
          Xem lại câu {number}
        </p>
        <button type="button" onClick={onClose} className="text-sm text-muted hover:text-ink">
          ✕ Đóng
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 text-sm text-muted">
        <span>
          {SOURCE_LABEL[question.source]}
          {question.examNo ? ` câu ${question.examNo}` : ""} · Ch.{question.chapter}
          {chapter ? ` ${chapter.title}` : ""} · slide {question.sourceLesson}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <LangToggle />
          <button
            type="button"
            onClick={() => toggleStar(question.id)}
            className={`rounded-md px-2 py-0.5 ${starred ? "text-reward" : "hover:text-ink"}`}
            aria-pressed={starred}
          >
            {starred ? "★ Đã lưu" : "☆ Lưu câu"}
          </button>
        </span>
      </div>

      <MathText as="div" text={text.question} className="mt-4 text-lg font-medium leading-relaxed sm:text-xl" />

      <div className="mt-5 space-y-2.5">
        {optionOrder.map((original, position) => {
          const isAnswer = question.answers.includes(original);
          const picked = lastChosen.includes(original);
          const tone = isAnswer
            ? "border-sage bg-sage-soft"
            : picked
              ? "border-penalty bg-penalty-soft"
              : "border-line opacity-60";
          return (
            <div key={original} className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 ${tone}`}>
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-sm font-semibold ${
                  picked ? "bg-ink text-paper" : "bg-sage-soft text-ink"
                }`}
              >
                {LETTERS[position]}
              </span>
              <MathText text={text.options[original]} className="flex-1 pt-0.5" />
              {(isAnswer || picked) && (
                <span className="shrink-0 pt-0.5 text-xs font-semibold text-muted">
                  {isAnswer && picked ? "Bạn chọn · Đúng" : isAnswer ? "Đáp án đúng" : "Bạn chọn"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className={`mt-6 rounded-xl border-l-4 p-4 ${status.tone}`}>
        <p className="font-semibold">{status.text}</p>
        {attempts.length > 0 ? (
          <ol className="mt-2 flex flex-wrap gap-2 text-sm">
            {attempts.map((attempt, i) => (
              <li
                key={i}
                className={`rounded-md px-2 py-0.5 ${attempt.correct ? "bg-sage text-paper" : "bg-penalty text-paper"}`}
              >
                Lần {i + 1}: {attempt.chosen.map(letterOf).sort().join(", ")} {attempt.correct ? "✓" : "✗"}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-1 text-xs text-muted">Câu này làm trước khi có tính năng xem lại nên không lưu đáp án bạn đã chọn.</p>
        )}
        <MathText as="p" text={text.explanation} className="mt-3 leading-relaxed" />
        {question.answerSource === "verified-by-slides" && question.source !== "Extra" && (
          <p className="mt-2 text-xs text-muted">Đề không kèm đáp án, đáp án này được đối chiếu với slide.</p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={() => onStep(-1)}
          className="rounded-xl border border-line px-4 py-2.5 disabled:opacity-40"
        >
          ← Câu trước
        </button>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onStep(1)}
          className="rounded-xl border border-line px-4 py-2.5 disabled:opacity-40"
        >
          Câu sau →
        </button>
        <button type="button" onClick={onClose} className="ml-auto rounded-xl bg-ink px-5 py-2.5 font-medium text-paper">
          {closeLabel}
        </button>
      </div>
    </section>
  );
};
