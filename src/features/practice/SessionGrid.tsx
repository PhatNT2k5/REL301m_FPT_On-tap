import { href } from "../../router";
import type { SessionRecord } from "../progress/store";

interface SessionGridProps {
  deckId: string;
  size: number;
  sessions: string[][];
  records: (SessionRecord | undefined)[];
}

type Status = "done" | "progress" | "new";

const statusOf = (record: SessionRecord | undefined): Status =>
  record?.done ? "done" : record && record.state.attempts > 0 ? "progress" : "new";

const BADGE: Record<Status, string> = { new: "Đề mới", progress: "Đang làm", done: "Đã xong" };

const statusLine = (status: Status, record: SessionRecord | undefined, total: number, isNext: boolean): string => {
  if (status === "done") return record?.bestWrong ? `Xong · sai ${record.bestWrong} lần` : "Xong · không sai câu nào";
  if (status === "progress") return `Đúng ${record?.state.solved.length ?? 0}/${total}`;
  return isNext ? "Sẵn sàng bắt đầu" : "Chưa bắt đầu";
};

/** One card per session; the first unfinished session is highlighted as the next one to do. */
export const SessionGrid = ({ deckId, size, sessions, records }: SessionGridProps) => {
  const nextIndex = records.findIndex((r) => !r?.done);

  return (
    <ol className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-label="Các session">
      {sessions.map((ids, index) => {
        const record = records[index];
        const status = statusOf(record);
        const isNext = index === nextIndex;
        const from = index * size + 1;
        const to = from + ids.length - 1;
        return (
          <li key={index}>
            <a
              href={href({ name: "session", deckId, size, index })}
              aria-label={`Session ${index + 1}, câu ${from} đến ${to}`}
              className={`group relative flex h-full flex-col rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${
                isNext
                  ? "border-sage bg-sage-soft shadow-[0_4px_0_0_var(--sage)]"
                  : status === "done"
                    ? "border-line bg-panel opacity-90"
                    : "border-line bg-panel hover:border-sage"
              }`}
            >
              {isNext && <span className="absolute inset-y-4 left-0 w-1 rounded-r bg-sage" aria-hidden />}
              <span className="flex items-center gap-3">
                <span className="text-sm tabular-nums text-muted">{String(index + 1).padStart(2, "0")}</span>
                <span
                  className={`mr-auto rounded-md px-1.5 py-0.5 text-xs font-medium ${
                    status === "done" ? "bg-reward-soft text-reward" : "bg-sage-soft text-sage"
                  }`}
                >
                  {BADGE[status]}
                </span>
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg bg-paper text-sm text-muted transition-colors group-hover:text-ink"
                  aria-hidden
                >
                  ↗
                </span>
              </span>
              <span className="mt-6 text-2xl font-bold leading-tight">Session {index + 1}</span>
              <span className="mt-1 text-muted">
                Câu {from}–{to}
              </span>
              <span className={`mt-4 text-sm font-semibold ${status === "done" ? "text-reward" : "text-sage"}`}>
                {statusLine(status, record, ids.length, isNext)}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
};
