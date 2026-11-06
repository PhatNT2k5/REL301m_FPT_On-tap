import { useState } from "react";
import { href, navigate } from "../../router";
import { resetSessions, useProgress, useSettings, type SessionSize } from "../progress/store";
import { buildDecks, sessionKey, type Deck } from "./decks";
import { chunk } from "./engine";
import { SessionGrid } from "./SessionGrid";

const DeckChip = ({ deck, active }: { deck: Deck; active: boolean }) => (
  <a
    href={href({ name: "practice", deckId: deck.id })}
    aria-current={active ? "true" : undefined}
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
      active ? "border-ink bg-ink text-paper" : "border-line bg-panel text-ink hover:border-sage"
    } ${deck.questionIds.length === 0 ? "opacity-50" : ""}`}
  >
    {deck.label}
    <span className={active ? "opacity-70" : "text-muted"}>{deck.questionIds.length}</span>
  </a>
);

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
    <input type="checkbox" className="h-4 w-4 accent-[var(--sage)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
);

export const PracticeHome = ({ deckId }: { deckId: string }) => {
  const [progress] = useProgress();
  const [settings, setSettings] = useSettings();
  const [confirmReset, setConfirmReset] = useState<"deck" | "all" | null>(null);

  const decks = buildDecks(progress);
  const deck = decks.find((d) => d.id === deckId) ?? decks[0];
  const size = settings.sessionSize;
  const sessions = chunk(deck.questionIds, size);
  const records = sessions.map((_, i) => progress.sessions[sessionKey(deck.id, size, i)]);
  const doneCount = records.filter((r) => r?.done).length;
  const nextIndex = records.findIndex((r) => !r?.done);

  const groups: { title: string; decks: Deck[] }[] = [
    { title: "Tổng hợp", decks: decks.filter((d) => d.kind === "all" || d.kind === "starred" || d.kind === "hard") },
    { title: "Theo chương", decks: decks.filter((d) => d.kind === "chapter") },
    { title: "Theo đề thi", decks: decks.filter((d) => d.kind === "exam") },
  ];

  return (
    <div>
      <section className="flex flex-wrap items-end justify-between gap-6 py-4 sm:py-8">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">Sai câu nào, gặp lại câu đó.</h1>
          <p className="mt-3 text-muted">
            Mỗi session có {size} câu. Câu trả lời sai sẽ được đưa xuống cuối lượt, và session chỉ hoàn thành khi bạn trả lời đúng hết.
          </p>
        </div>
        {sessions.length > 0 && (
          <button
            type="button"
            onClick={() => navigate({ name: "session", deckId: deck.id, size, index: nextIndex === -1 ? 0 : nextIndex })}
            className="rounded-xl bg-sage px-5 py-3 font-medium text-paper hover:opacity-90"
          >
            {nextIndex === -1 ? "Làm lại session 1" : `Làm session ${nextIndex + 1}`}
          </button>
        )}
      </section>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.title} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <h2 className="w-28 shrink-0 pt-1.5 text-sm font-semibold text-muted">{group.title}</h2>
            <div className="flex flex-wrap gap-2">
              {group.decks.map((d) => (
                <DeckChip key={d.id} deck={d} active={d.id === deck.id} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-panel px-4 py-3">
        <span className="inline-flex items-center gap-1 text-sm">
          Cỡ session
          {([10, 20] as SessionSize[]).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSettings({ sessionSize: n })}
              className={`ml-1 rounded-md px-2 py-0.5 ${n === size ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
              aria-pressed={n === size}
            >
              {n} câu
            </button>
          ))}
        </span>
        <Toggle label="Trộn thứ tự đáp án" checked={settings.shuffleOptions} onChange={(v) => setSettings({ shuffleOptions: v })} />
        <Toggle label="Tự chuyển câu khi đúng" checked={settings.autoAdvance} onChange={(v) => setSettings({ autoAdvance: v })} />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl">{deck.label}</h2>
          <span className="text-sm text-muted">
            {doneCount}/{sessions.length} session đã xong
          </span>
        </div>
        {sessions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-6 text-muted">
            {deck.kind === "starred"
              ? "Chưa có câu nào được đánh dấu. Bấm ☆ trong lúc làm bài để lưu câu muốn ôn lại."
              : deck.kind === "hard"
                ? "Câu nào bạn trả lời sai từ 2 lần trở lên sẽ xuất hiện ở đây."
                : "Bộ này chưa có câu hỏi."}
          </p>
        ) : (
          <SessionGrid deckId={deck.id} size={size} sessions={sessions} records={records} />
        )}
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
        {confirmReset ? (
          <>
            <span>{confirmReset === "deck" ? `Xoá tiến độ của "${deck.label}"?` : "Xoá toàn bộ tiến độ luyện tập?"} Câu đã đánh dấu vẫn được giữ.</span>
            <button
              type="button"
              className="rounded-md bg-penalty px-3 py-1 text-paper"
              onClick={() => {
                resetSessions(confirmReset === "deck" ? `${deck.id}:` : undefined);
                setConfirmReset(null);
              }}
            >
              Xoá tiến độ
            </button>
            <button type="button" className="text-muted hover:text-ink" onClick={() => setConfirmReset(null)}>
              Giữ lại
            </button>
          </>
        ) : (
          <>
            <button type="button" className="text-muted underline-offset-2 hover:text-ink hover:underline" onClick={() => setConfirmReset("deck")}>
              Làm lại bộ này từ đầu
            </button>
            <button type="button" className="text-muted underline-offset-2 hover:text-ink hover:underline" onClick={() => setConfirmReset("all")}>
              Xoá toàn bộ tiến độ
            </button>
          </>
        )}
      </div>
    </div>
  );
};
