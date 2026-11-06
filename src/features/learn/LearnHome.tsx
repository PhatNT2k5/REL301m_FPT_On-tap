import { CHAPTERS } from "../../data/chapters";
import { QUESTIONS } from "../../data/questions";
import { href } from "../../router";
import { useProgress } from "../progress/store";

export const LearnHome = () => {
  const [progress] = useProgress();
  const lessonCount = CHAPTERS.reduce((n, c) => n + c.lessons.length, 0);

  return (
    <div>
      <section className="grid items-end gap-6 py-4 sm:py-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl leading-[1.08] sm:text-6xl">Đi từ bandit tới actor-critic, từng trạng thái một.</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {lessonCount} bài slide của REL301m được gộp thành {CHAPTERS.length} video bài giảng. Slide tiếng Anh, lời giảng tiếng Việt. Xem xong chương nào
            thì luyện ngay phần câu hỏi của chương đó.
          </p>
        </div>
        <a
          href={href({ name: "practice", deckId: "all" })}
          className="rounded-xl bg-sage px-5 py-3 text-center font-medium text-paper hover:opacity-90"
        >
          Luyện toàn bộ {QUESTIONS.length} câu
        </a>
      </section>

      <ol className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CHAPTERS.map((chapter) => {
          const watched = progress.watched[chapter.number] ?? 0;
          const count = QUESTIONS.filter((q) => q.chapter === chapter.number).length;
          return (
            <li key={chapter.number}>
              <a
                href={href({ name: "chapter", chapter: chapter.number })}
                className="group flex h-full gap-4 rounded-2xl border border-line bg-panel px-5 py-4 hover:border-sage"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-semibold ${
                    watched > 30 ? "bg-sage text-paper" : "bg-sage-soft text-ink"
                  }`}
                  aria-hidden
                >
                  {chapter.number}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-xl leading-snug group-hover:text-sage">{chapter.title}</span>
                  <span className="mt-1 block text-sm text-muted">{chapter.titleVi}</span>
                  <span className="mt-3 block text-xs text-muted">
                    Bài {chapter.lessons.map((l) => l.id).join(", ")}
                    {count > 0 && <> · {count} câu</>}
                    {watched > 30 && <> · đã xem {Math.round(watched / 60)} phút</>}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
