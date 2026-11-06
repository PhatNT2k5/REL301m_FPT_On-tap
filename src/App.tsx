import { useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { ChapterPage } from "./features/learn/ChapterPage";
import { LearnHome } from "./features/learn/LearnHome";
import { PracticeHome } from "./features/practice/PracticeHome";
import { SessionView } from "./features/practice/SessionView";
import { isStorageAvailable, useSettings } from "./features/progress/store";
import { useRoute } from "./router";

export const App = () => {
  const route = useRoute();
  const [settings] = useSettings();

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  return (
    <div className="min-h-screen">
      <TopBar route={route} />
      {!isStorageAvailable() && (
        <p className="mx-auto max-w-6xl px-4 pt-3 text-sm text-penalty">
          Trình duyệt đang chặn lưu dữ liệu, tiến độ chỉ giữ trong lần mở này.
        </p>
      )}
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6">
        {route.name === "learn" && <LearnHome />}
        {route.name === "chapter" && <ChapterPage chapter={route.chapter} />}
        {route.name === "practice" && <PracticeHome deckId={route.deckId} />}
        {route.name === "session" && (
          <SessionView key={`${route.deckId}:${route.size}:${route.index}`} deckId={route.deckId} size={route.size} index={route.index} />
        )}
      </main>
    </div>
  );
};
