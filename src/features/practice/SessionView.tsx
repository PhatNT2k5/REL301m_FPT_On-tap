import { useCallback, useEffect, useMemo, useState } from "react";
import { MathText } from "../../components/MathText";
import { CHAPTERS } from "../../data/chapters";
import { LangToggle } from "../../components/LangToggle";
import { QUESTION_BY_ID, localizeQuestion, questionOrigin, relabelExplanation } from "../../data/questions";
import type { Question } from "../../data/types";
import { href, navigate } from "../../router";
import { playCue } from "../progress/sound";
import { toggleStar, updateProgress, useProgress, useSettings } from "../progress/store";
import { buildDecks, sessionKey } from "./decks";
import { ReviewPanel } from "./ReviewPanel";
import {
  answerQuestion,
  chunk,
  createSession,
  currentQuestionId,
  hashString,
  isAnswered,
  isComplete,
  seededShuffle,
  totalWrong,
  type SessionState,
} from "./engine";

interface Feedback {
  questionId: string;
  chosen: number[];
  correct: boolean;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

const sameIds = (a: string[], b: string[]): boolean => a.length === b.length && a.every((id, i) => id === b[i]);

export const SessionView = ({ deckId, size, index }: { deckId: string; size: number; index: number }) => {
  const [progress] = useProgress();
  const [settings] = useSettings();
  const decks = useMemo(() => buildDecks(progress), [progress]);
  const deck = decks.find((d) => d.id === deckId);
  const sessions = deck ? chunk(deck.questionIds, size) : [];
  const ids = sessions[index] ?? [];
  const key = sessionKey(deckId, size, index);

  const stored = progress.sessions[key];
  // Starred / hard decks change while you answer, so an existing session keeps its own question list there.
  const dynamicDeck = deck?.kind === "starred" || deck?.kind === "hard";
  const state: SessionState =
    stored && (dynamicDeck || sameIds(stored.state.questionIds, ids)) ? stored.state : createSession(ids);
  const done = isComplete(state);

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selection, setSelection] = useState<number[]>([]);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const shownId = feedback?.questionId ?? currentQuestionId(state);
  const question: Question | undefined = shownId ? QUESTION_BY_ID.get(shownId) : undefined;

  const orderFor = useCallback(
    (q: Question): number[] => {
      const order = q.options.map((_, i) => i);
      return settings.shuffleOptions ? seededShuffle(order, hashString(`${key}:${q.id}`)) : order;
    },
    [settings.shuffleOptions, key],
  );

  const optionOrder = useMemo(() => (question ? orderFor(question) : []), [question, orderFor]);

  // Questions answered at least once in this session, in session order, for the review panel.
  const answeredIds = useMemo(() => state.questionIds.filter((id) => isAnswered(state, id)), [state]);
  const reviewQuestion = reviewId ? QUESTION_BY_ID.get(reviewId) : undefined;

  // Leaving the session (or restarting it) closes any open review.
  useEffect(() => setReviewId(null), [key]);

  const persist = useCallback(
    (next: SessionState, wrongId?: string) => {
      updateProgress((p) => {
        const previous = p.sessions[key];
        const finished = isComplete(next);
        const wrong = totalWrong(next);
        return {
          ...p,
          sessions: {
            ...p.sessions,
            [key]: {
              state: next,
              done: finished || Boolean(previous?.done),
              bestWrong: finished ? Math.min(previous?.bestWrong ?? wrong, wrong) : previous?.bestWrong,
            },
          },
          wrongTotals: wrongId ? { ...p.wrongTotals, [wrongId]: (p.wrongTotals[wrongId] ?? 0) + 1 } : p.wrongTotals,
        };
      });
    },
    [key],
  );

  const submit = useCallback(
    (chosen: number[]) => {
      if (!question || feedback || chosen.length === 0) return;
      const result = answerQuestion(state, chosen, question.answers);
      persist(result.state, result.correct ? undefined : question.id);
      setFeedback({ questionId: question.id, chosen, correct: result.correct });
      if (settings.sound) playCue(!result.correct ? "wrong" : isComplete(result.state) ? "complete" : "correct");
    },
    [question, feedback, state, persist, settings.sound],
  );

  const goNext = useCallback(() => {
    setFeedback(null);
    setSelection([]);
  }, []);

  const restart = () => {
    persist(createSession(dynamicDeck ? state.questionIds : ids));
    setFeedback(null);
    setSelection([]);
    setReviewId(null);
  };

  const stepReview = useCallback(
    (delta: number) => {
      if (!reviewId) return;
      const next = answeredIds[answeredIds.indexOf(reviewId) + delta];
      if (next) setReviewId(next);
    },
    [reviewId, answeredIds],
  );

  // Auto-advance after a correct answer when enabled.
  useEffect(() => {
    if (!feedback?.correct || !settings.autoAdvance) return;
    const timer = window.setTimeout(goNext, 900);
    return () => window.clearTimeout(timer);
  }, [feedback, settings.autoAdvance, goNext]);

  const choose = useCallback(
    (original: number) => {
      if (!question || feedback) return;
      if (question.multi) {
        setSelection((s) => (s.includes(original) ? s.filter((x) => x !== original) : [...s, original]));
      } else {
        submit([original]);
      }
    },
    [question, feedback, submit],
  );

  // Keyboard: 1-4 / A-D to choose, Enter to check or continue.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.metaKey || event.ctrlKey) return;
      if (reviewId) {
        if (event.key === "Escape" || event.key === "Enter") setReviewId(null);
        else if (event.key === "ArrowLeft") stepReview(-1);
        else if (event.key === "ArrowRight") stepReview(1);
        return;
      }
      if (event.key === "Enter") {
        if (feedback) goNext();
        else if (question?.multi) submit(selection);
        return;
      }
      const position = "1234".indexOf(event.key) !== -1 ? Number(event.key) - 1 : "abcd".indexOf(event.key.toLowerCase());
      if (position >= 0 && position < optionOrder.length) choose(optionOrder[position]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, question, selection, optionOrder, choose, goNext, submit, reviewId, stepReview]);

  if (!deck || ids.length === 0) {
    return (
      <p>
        Không tìm thấy session này. <a className="text-sage underline" href={href({ name: "practice", deckId })}>Về danh sách session</a>
      </p>
    );
  }

  const backHref = href({ name: "practice", deckId });
  const starred = question ? progress.starred.includes(question.id) : false;
  const chapter = question ? CHAPTERS.find((c) => c.number === question.chapter) : undefined;
  const wrongSoFar = totalWrong(state);
  const hasNext = index + 1 < sessions.length;
  const text = question ? localizeQuestion(question, settings.contentLang) : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-line bg-panel p-4 lg:sticky lg:top-20">
        <a href={backHref} className="text-sm text-muted hover:text-ink">
          {deck.label}
        </a>
        <h1 className="mt-1 font-display text-2xl">Session {index + 1}</h1>
        <p className="text-sm text-muted">
          {state.solved.length}/{ids.length} câu đúng · sai {wrongSoFar} lần
        </p>

        <ol className="mt-4 grid grid-cols-5 gap-1.5" aria-label="Tiến độ session">
          {state.questionIds.map((id, i) => {
            const solved = state.solved.includes(id);
            const missed = (state.wrongCounts[id] ?? 0) > 0;
            const current = id === shownId && !done && !reviewId;
            const reviewable = solved || missed;
            const reviewing = id === reviewId;
            return (
              <li key={id}>
                <button
                  type="button"
                  disabled={!reviewable}
                  onClick={() => setReviewId(reviewing ? null : id)}
                  title={reviewable ? `Xem lại câu ${i + 1}` : `Câu ${i + 1} (chưa làm)`}
                  aria-pressed={reviewing}
                  className={`grid aspect-square w-full place-items-center rounded-md text-xs font-semibold transition-transform enabled:cursor-pointer enabled:hover:scale-110 disabled:cursor-default ${
                  solved
                    ? missed
                      ? "bg-reward text-paper"
                      : "bg-sage text-paper"
                    : missed
                      ? "bg-penalty text-paper"
                      : "bg-line text-muted"
                } ${current || reviewing ? "ring-2 ring-ink ring-offset-2 ring-offset-panel" : ""}`}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ol>
        <ul className="mt-4 space-y-1 text-xs text-muted">
          <li>Xanh: đúng ngay lần đầu</li>
          <li>Vàng: đúng sau khi làm lại</li>
          <li>Đỏ: đang chờ làm lại</li>
          <li className="pt-1 text-ink">Bấm vào ô đã làm để xem lại câu đó.</li>
        </ul>
        <p className="mt-4 hidden border-t border-line pt-3 text-xs text-muted lg:block">
          Phím tắt: 1–4 hoặc A–D để chọn, Enter để tiếp tục. Khi xem lại: ← → để chuyển câu, Esc để đóng.
        </p>
      </aside>

      <div className="min-w-0">
      {reviewQuestion && reviewId ? (
        <ReviewPanel
          question={reviewQuestion}
          number={state.questionIds.indexOf(reviewId) + 1}
          state={state}
          optionOrder={orderFor(reviewQuestion)}
          starred={progress.starred.includes(reviewQuestion.id)}
          hasPrevious={answeredIds.indexOf(reviewId) > 0}
          hasNext={answeredIds.indexOf(reviewId) < answeredIds.length - 1}
          onStep={stepReview}
          onClose={() => setReviewId(null)}
          closeLabel={done && !feedback ? "Về kết quả session" : "Tiếp tục làm bài"}
        />
      ) : done && !feedback ? (
        <section className="rounded-2xl border border-sage bg-panel p-6 sm:p-8">
          <p className="font-display text-5xl text-reward">+1</p>
          <h1 className="mt-2 font-display text-3xl">Xong session {index + 1}</h1>
          <p className="mt-2 text-muted">
            {wrongSoFar === 0
              ? `Bạn trả lời đúng cả ${ids.length} câu ngay từ lần đầu.`
              : `Bạn đã sửa hết ${Object.keys(state.wrongCounts).length} câu từng sai, tổng cộng ${wrongSoFar} lần trả lời sai.`}
          </p>
          <p className="mt-2 text-sm text-muted">Bấm vào các ô số để xem lại từng câu và đáp án bạn đã chọn.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {state.questionIds[0] && (
              <button
                type="button"
                className="rounded-xl border border-ink px-5 py-2.5 font-medium"
                onClick={() => setReviewId(state.questionIds[0])}
              >
                Xem lại bài làm
              </button>
            )}
            {hasNext && (
              <button
                type="button"
                className="rounded-xl bg-sage px-5 py-2.5 font-medium text-paper"
                onClick={() => navigate({ name: "session", deckId, size, index: index + 1 })}
              >
                Làm session {index + 2}
              </button>
            )}
            <button type="button" className="rounded-xl border border-line px-5 py-2.5" onClick={restart}>
              Làm lại session này
            </button>
            <a href={backHref} className="rounded-xl px-5 py-2.5 text-muted hover:text-ink">
              Về danh sách session
            </a>
          </div>
        </section>
      ) : (
        question && text && (
          <section className="rounded-2xl border border-line bg-panel p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3 text-sm text-muted">
              <span>
                {questionOrigin(question)} · Ch.{question.chapter}
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
            {question.multi && <p className="mt-2 text-sm text-muted">Chọn {question.answers.length} đáp án, rồi bấm Kiểm tra.</p>}

            <div className="mt-5 space-y-2.5">
              {optionOrder.map((original, position) => {
                const isAnswer = question.answers.includes(original);
                const picked = feedback ? feedback.chosen.includes(original) : selection.includes(original);
                let tone = "border-line hover:border-sage";
                if (feedback) {
                  if (isAnswer) tone = "border-sage bg-sage-soft";
                  else if (picked) tone = "border-penalty bg-penalty-soft";
                  else tone = "border-line opacity-60";
                } else if (picked) {
                  tone = "border-ink bg-sage-soft";
                }
                return (
                  <button
                    key={original}
                    type="button"
                    disabled={Boolean(feedback)}
                    onClick={() => choose(original)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${tone}`}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-sm font-semibold ${
                        picked ? "bg-ink text-paper" : "bg-sage-soft text-ink"
                      }`}
                    >
                      {LETTERS[position]}
                    </span>
                    <MathText text={text.options[original]} className="pt-0.5" />
                  </button>
                );
              })}
            </div>

            {question.multi && !feedback && (
              <button
                type="button"
                disabled={selection.length === 0}
                onClick={() => submit(selection)}
                className="mt-4 rounded-xl bg-ink px-5 py-2.5 font-medium text-paper disabled:opacity-40"
              >
                Kiểm tra
              </button>
            )}

            {feedback && (
              <div
                className={`mt-6 rounded-xl border-l-4 p-4 ${feedback.correct ? "border-sage bg-sage-soft" : "border-penalty bg-penalty-soft"}`}
                role="status"
              >
                <p className="font-semibold">
                  {feedback.correct ? "Chính xác. +1" : "Chưa đúng. Câu này sẽ quay lại ở cuối lượt."}
                </p>
                <MathText as="p" text={relabelExplanation(text.explanation, optionOrder)} className="mt-2 leading-relaxed" />
                {question.answerSource === "verified-by-slides" && question.source !== "Extra" && (
                  <p className="mt-2 text-xs text-muted">Đề không kèm đáp án, đáp án này được đối chiếu với slide.</p>
                )}
                <button type="button" onClick={goNext} className="mt-4 rounded-xl bg-ink px-5 py-2.5 font-medium text-paper">
                  {isComplete(state) ? "Xem kết quả" : "Câu tiếp theo"}
                </button>
              </div>
            )}
          </section>
        )
      )}
      </div>
    </div>
  );
};
