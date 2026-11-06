import { href } from "../../router";
import type { SessionRecord } from "../progress/store";

interface SessionGridProps {
  deckId: string;
  size: number;
  sessions: string[][];
  records: (SessionRecord | undefined)[];
}

/** Sessions drawn as a grid world: the agent stands on the next unfinished cell, G is the goal. */
export const SessionGrid = ({ deckId, size, sessions, records }: SessionGridProps) => {
  const agentIndex = records.findIndex((r) => !r?.done);
  const allDone = agentIndex === -1;

  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5" aria-label="Các session">
      {sessions.map((ids, index) => {
        const record = records[index];
        const solved = record?.state.solved.length ?? 0;
        const isAgent = index === agentIndex;
        const status = record?.done ? "done" : record && record.state.attempts > 0 ? "progress" : "new";
        const from = index * size + 1;
        const to = from + ids.length - 1;
        return (
          <li key={index}>
            <a
              href={href({ name: "session", deckId, size, index })}
              className={`relative flex aspect-[5/4] flex-col justify-between rounded-xl border p-3 transition-colors ${
                status === "done"
                  ? "border-sage bg-sage-soft"
                  : isAgent
                    ? "border-ink bg-panel shadow-[0_0_0_3px_var(--sage-soft)]"
                    : "border-line bg-panel hover:border-sage"
              }`}
            >
              <span className="flex items-start justify-between">
                <span className="font-display text-2xl leading-none">{index + 1}</span>
                {status === "done" && <span className="rounded-md bg-reward px-1.5 text-sm font-semibold text-paper">+1</span>}
                {isAgent && (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs font-bold text-paper" title="Bạn đang ở đây">
                    A
                  </span>
                )}
              </span>
              <span className="text-xs text-muted">
                Câu {from}–{to}
                <span className="block text-ink">
                  {status === "done"
                    ? record?.bestWrong
                      ? `Xong, sai ${record.bestWrong} lần`
                      : "Xong, không sai câu nào"
                    : status === "progress"
                      ? `Đúng ${solved}/${ids.length}`
                      : isAgent
                        ? "Bắt đầu ở đây"
                        : "Chưa làm"}
                </span>
              </span>
            </a>
          </li>
        );
      })}
      <li>
        <div
          className={`flex aspect-[5/4] flex-col justify-between rounded-xl border-2 border-dashed p-3 ${
            allDone ? "border-reward bg-reward-soft" : "border-line"
          }`}
        >
          <span className="font-display text-2xl leading-none text-reward">G</span>
          <span className="text-xs text-muted">{allDone ? "Đã tới đích: xong cả bộ" : "Đích: hoàn thành mọi session"}</span>
        </div>
      </li>
    </ol>
  );
};
