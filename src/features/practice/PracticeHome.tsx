import { useState } from "react";
import { href } from "../../router";
import {
  ADVANCE_DELAYS,
  resetSessions,
  useProgress,
  useSettings,
  type AdvanceDelay,
  type SessionSize,
} from "../progress/store";
import { buildDecks, sessionKey, type Deck } from "./decks";
import { chunk } from "./engine";
import { SessionGrid } from "./SessionGrid";

const DeckChip = ({ deck, active }: { deck: Deck; active: boolean }) => (
  <a
    href={href({ name: "practice", deckId: deck.id })}
    aria-current={active ? "true" : undefined}
    className={`inline-flex items-baseline gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active ? "border-sage bg-sage text-paper" : "border-line bg-panel text-ink hover:border-sage"
    } ${deck.questionIds.length === 0 && !active ? "opacity-60" : ""}`}
  >
    {deck.shortLabel}
    <span className={`text-xs tabular-nums ${active ? "opacity-75" : "text-muted"}`}>{deck.questionIds.length}</span>
  </a>
);

const ChipRow = ({ title, decks, activeId }: { title: string; decks: Deck[]; activeId: string }) => (
  <div className="flex flex-wrap items-center gap-2">
    <h2 className="mr-1 text-xs font-bold uppercase tracking-wider text-muted">{title}</h2>
    {decks.map((d) => (
      <DeckChip key={d.id} deck={d} active={d.id === activeId} />
    ))}
  </div>
);

const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex cursor-pointer items-center gap-2">
    <input type="checkbox" className="h-4 w-4 accent-[var(--sage)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
);

const SizeToggle = ({ size, onChange }: { size: SessionSize; onChange: (n: SessionSize) => void }) => (
  <div className="flex rounded-xl border border-line bg-panel p-1" role="group" aria-label="Số câu mỗi session">
    {([10, 20] as SessionSize[]).map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        aria-pressed={n === size}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          n === size ? "bg-paper text-ink shadow-sm" : "text-muted hover:text-ink"
        }`}
      >
        {n} câu
      </button>
    ))}
  </div>
);

const DelayToggle = ({
  delay,
  disabled,
  onChange,
}: {
  delay: AdvanceDelay;
  disabled: boolean;
  onChange: (d: AdvanceDelay) => void;
}) => (
  <div
    className={`flex rounded-lg border border-line bg-panel p-0.5 ${disabled ? "opacity-50" : ""}`}
    role="group"
    aria-label="Thời gian chờ trước khi chuyển câu"
  >
    {ADVANCE_DELAYS.map((d) => (
      <button
        key={d}
        type="button"
        disabled={disabled}
        onClick={() => onChange(d)}
        aria-pressed={d === delay}
        className={`rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors disabled:cursor-not-allowed ${
          d === delay ? "bg-paper text-ink shadow-sm" : "text-muted enabled:hover:text-ink"
        }`}
      >
        {d / 1000}s
      </button>
    ))}
  </div>
);

const emptyMessage = (deck: Deck): string =>
  deck.kind === "starred"
    ? "Chưa có câu nào được đánh dấu. Bấm ☆ trong lúc làm bài để lưu câu muốn ôn lại."
    : deck.kind === "hard"
      ? "Câu nào bạn trả lời sai từ 2 lần trở lên sẽ xuất hiện ở đây."
      : "Bộ này chưa có câu hỏi.";

export const PracticeHome = ({ deckId }: { deckId: string }) => {
  const [progress] = useProgress();
  const [settings, setSettings] = useSettings();
  const [confirmReset, setConfirmReset] = useState(false);

  const decks = buildDecks(progress);
  const deck = decks.find((d) => d.id === deckId) ?? decks[0];
  const size = settings.sessionSize;
  const sessions = chunk(deck.questionIds, size);
  const records = sessions.map((_, i) => progress.sessions[sessionKey(deck.id, size, i)]);
  const doneCount = records.filter((r) => r?.done).length;

  const topicDecks = decks.filter((d) => d.kind !== "exam" && (d.kind !== "hard" || d.questionIds.length > 0 || d.id === deck.id));
  const examDecks = decks.filter((d) => d.kind === "exam");

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">Các session ôn tập</h1>
          <p className="mt-1 text-muted">Chọn một phần để bắt đầu.</p>
          <div className="mt-2 text-sm">
            {confirmReset ? (
              <span className="flex flex-wrap items-center gap-3">
                Xoá toàn bộ tiến độ luyện tập? Câu đã đánh dấu vẫn được giữ.
                <button
                  type="button"
                  className="rounded-md bg-penalty px-3 py-1 font-medium text-paper"
                  onClick={() => {
                    resetSessions();
                    setConfirmReset(false);
                  }}
                >
                  Xoá tiến độ
                </button>
                <button type="button" className="text-muted hover:text-ink" onClick={() => setConfirmReset(false)}>
                  Giữ lại
                </button>
              </span>
            ) : (
              <button type="button" className="text-ink underline underline-offset-4 hover:text-sage" onClick={() => setConfirmReset(true)}>
                ↺ Reset toàn bộ tiến độ
              </button>
            )}
          </div>
        </div>
        <SizeToggle size={size} onChange={(n) => setSettings({ sessionSize: n })} />
      </header>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Checkbox label="Trộn thứ tự đáp án" checked={settings.shuffleOptions} onChange={(v) => setSettings({ shuffleOptions: v })} />
        <div className="flex items-center gap-2">
          <Checkbox label="Tự chuyển khi đúng" checked={settings.autoAdvance} onChange={(v) => setSettings({ autoAdvance: v })} />
          <DelayToggle
            delay={settings.advanceDelay}
            disabled={!settings.autoAdvance}
            onChange={(d) => setSettings({ advanceDelay: d })}
          />
        </div>
        <span className="text-sm text-muted">Câu sai sẽ được hỏi lại cuối lượt.</span>
      </div>

      <div className="space-y-3">
        <ChipRow title="Ôn theo" decks={topicDecks} activeId={deck.id} />
        <ChipRow title="Theo đề" decks={examDecks} activeId={deck.id} />
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold">{deck.label}</h2>
          {sessions.length > 0 && (
            <span className="text-sm text-muted">
              {doneCount}/{sessions.length} session đã xong
            </span>
          )}
        </div>
        {sessions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-6 text-muted">{emptyMessage(deck)}</p>
        ) : (
          <SessionGrid deckId={deck.id} size={size} sessions={sessions} records={records} />
        )}
      </section>
    </div>
  );
};
