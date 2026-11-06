import { useEffect, useRef, useState } from "react";
import { MathText } from "../../components/MathText";
import { CHAPTERS, scenesSrc, subtitleSrc, videoSrc } from "../../data/chapters";
import { QUESTIONS } from "../../data/questions";
import { href } from "../../router";
import { updateProgress } from "../progress/store";

interface Cue {
  start: number;
  title: string;
}

const toSeconds = (stamp: string): number => {
  const [h, m, s] = stamp.split(":");
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

const parseChaptersVtt = (text: string): Cue[] => {
  const cues: Cue[] = [];
  const blocks = text.replace(/\r/g, "").split("\n\n");
  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    const timing = lines.findIndex((l) => l.includes("-->"));
    if (timing === -1) continue;
    cues.push({ start: toSeconds(lines[timing].split("-->")[0].trim()), title: lines.slice(timing + 1).join(" ") });
  }
  return cues;
};

const formatTime = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export const ChapterPage = ({ chapter: number }: { chapter: number }) => {
  const chapter = CHAPTERS.find((c) => c.number === number);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cues, setCues] = useState<Cue[]>([]);
  const [videoMissing, setVideoMissing] = useState(false);
  const [time, setTime] = useState(0);
  const lastSaved = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(scenesSrc(number));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        if (!cancelled && text.startsWith("WEBVTT")) setCues(parseChaptersVtt(text));
      } catch {
        if (!cancelled) setCues([]);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [number]);

  if (!chapter) {
    return (
      <p>
        Không có chương {number}. <a href={href({ name: "learn" })} className="text-sage underline">Quay lại danh sách chương</a>
      </p>
    );
  }

  const questionCount = QUESTIONS.filter((q) => q.chapter === number).length;
  const prev = CHAPTERS.find((c) => c.number === number - 1);
  const next = CHAPTERS.find((c) => c.number === number + 1);
  const activeCue = cues.reduce<number>((active, cue, i) => (cue.start <= time + 0.2 ? i : active), -1);

  const onTimeUpdate = () => {
    const current = videoRef.current?.currentTime ?? 0;
    setTime(current);
    if (current - lastSaved.current > 10) {
      lastSaved.current = current;
      updateProgress((p) => ({ ...p, watched: { ...p.watched, [number]: Math.max(p.watched[number] ?? 0, current) } }));
    }
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = seconds;
    void video.play().catch(() => undefined);
  };

  return (
    <div>
      <a href={href({ name: "learn" })} className="text-sm text-muted hover:text-ink">
        Tất cả chương
      </a>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-4">
        <span className="text-muted">Chương {chapter.number}</span>
        <h1 className="font-display text-3xl sm:text-4xl">{chapter.title}</h1>
      </div>
      <p className="mt-2 text-muted">{chapter.titleVi}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-line bg-black">
            {videoMissing ? (
              <div className="grid aspect-video place-items-center bg-panel p-6 text-center text-muted">
                <p>
                  Video chương này chưa được render.
                  <br />
                  Chạy <code className="rounded bg-sage-soft px-1.5 py-0.5 text-ink">python render_video.py {number}</code> trong thư mục pipeline.
                </p>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="aspect-video w-full"
                controls
                preload="metadata"
                onTimeUpdate={onTimeUpdate}
                onError={() => setVideoMissing(true)}
              >
                <source src={videoSrc(number)} type="video/mp4" onError={() => setVideoMissing(true)} />
                <track kind="subtitles" src={subtitleSrc(number)} srcLang="vi" label="Tiếng Việt" default />
              </video>
            )}
          </div>

          <section className="mt-6 rounded-2xl border border-line bg-panel p-5">
            <h2 className="font-display text-xl">Ý chính cần nhớ</h2>
            <ul className="mt-3 space-y-2">
              {chapter.keyPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-sm bg-sage" aria-hidden />
                  <MathText text={point} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          {questionCount > 0 && (
            <a
              href={href({ name: "practice", deckId: `ch-${number}` })}
              className="block rounded-2xl bg-sage px-5 py-4 font-medium text-paper hover:opacity-90"
            >
              Luyện chương này
              <span className="block text-sm font-normal opacity-80">{questionCount} câu, chia session 10 câu</span>
            </a>
          )}

          {cues.length > 0 && (
            <nav className="rounded-2xl border border-line bg-panel p-3" aria-label="Mục lục video">
              <h2 className="px-2 pb-2 pt-1 text-sm font-semibold">Mục lục video</h2>
              <ol>
                {cues.map((cue, i) => (
                  <li key={cue.start}>
                    <button
                      type="button"
                      onClick={() => seek(cue.start)}
                      className={`flex w-full gap-3 rounded-lg px-2 py-1.5 text-left text-sm ${
                        i === activeCue ? "bg-sage-soft text-ink" : "text-muted hover:text-ink"
                      }`}
                    >
                      <span className="w-10 shrink-0 tabular-nums">{formatTime(cue.start)}</span>
                      <span>{cue.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="text-sm font-semibold">Bài slide gốc</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              {chapter.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <span className="font-medium text-ink">{lesson.id}</span> {lesson.title}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <div className="mt-8 flex justify-between gap-4 border-t border-line pt-5 text-sm">
        {prev ? (
          <a href={href({ name: "chapter", chapter: prev.number })} className="text-muted hover:text-ink">
            Chương {prev.number}: {prev.title}
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a href={href({ name: "chapter", chapter: next.number })} className="text-right font-medium text-sage hover:underline">
            Chương {next.number}: {next.title}
          </a>
        )}
      </div>
    </div>
  );
};
