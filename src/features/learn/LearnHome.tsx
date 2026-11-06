import { CHAPTERS } from "../../data/chapters";
import { QUESTIONS } from "../../data/questions";
import { href } from "../../router";
import { useProgress } from "../progress/store";

export const LearnHome = () => {
  const [progress] = useProgress();
  const lessonCount = CHAPTERS.reduce((n, c) => n + c.lessons.length, 0);

  return (
    <div>
      <section className="max-w-3xl py-6 sm:py-10">
        <h1 className="font-display text-4xl leading-[1.08] sm:text-6xl">
          Đi từ bandit tới actor-critic, từng trạng thái một.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          {lessonCount} bài slide của REL301m được gộp lại thành {CHAPTERS.length} video bài giảng. Slide tiếng Anh, lời giảng tiếng Việt. Xem
          xong chương nào thì luyện ngay {QUESTIONS.length > 0 ? `trong ${QUESTIONS.length} câu hỏi` : "câu hỏi"} của chương đó.
        </p>
      </section>

      <ol className="relative mt-2 border-l-2 border-dashed border-line pl-6 sm:pl-10">
        {CHAPTERS.map((chapter) => {
          const watched = progress.watched[chapter.number] ?? 0;
          const count = QUESTIONS.filter((q) => q.chapter === chapter.number).length;
          return (
            <li key={chapter.number} className="relative pb-5">
              <span
                className={`absolute -left-[2.15rem] top-5 grid h-7 w-7 place-items-center rounded-md border text-xs font-semibold sm:-left-[3.15rem] ${
                  watched > 30 ? "border-sage bg-sage text-paper" : "border-line bg-panel text-muted"
                }`}
                aria-hidden
              >
                S{chapter.number}
              </span>
              <a
                href={href({ name: "chapter", chapter: chapter.number })}
                className="group block rounded-2xl border border-line bg-panel px-5 py-4 hover:border-sage"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-sm text-muted">Chương {chapter.number}</span>
                  <h2 className="font-display text-xl group-hover:text-sage sm:text-2xl">{chapter.title}</h2>
                </div>
                <p className="mt-1 text-muted">{chapter.titleVi}</p>
                <p className="mt-3 text-sm text-muted">
                  Bài {chapter.lessons.map((l) => l.id).join(", ")}
                  {count > 0 && <> · {count} câu luyện tập</>}
                  {watched > 30 && <> · đã xem {Math.round(watched / 60)} phút</>}
                </p>
              </a>
            </li>
          );
        })}
        <li className="relative">
          <span className="absolute -left-[2.15rem] top-1 grid h-7 w-7 place-items-center rounded-md bg-reward text-xs font-bold text-paper sm:-left-[3.15rem]" aria-hidden>
            G
          </span>
          <a href={href({ name: "practice", deckId: "all" })} className="inline-block py-1 font-medium text-sage hover:underline">
            Tới trạng thái kết thúc: luyện toàn bộ câu hỏi
          </a>
        </li>
      </ol>
    </div>
  );
};
