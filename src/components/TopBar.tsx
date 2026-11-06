import { useSettings } from "../features/progress/store";
import { href, type Route } from "../router";

const isLearn = (route: Route): boolean => route.name === "learn" || route.name === "chapter";

export const TopBar = ({ route }: { route: Route }) => {
  const [settings, setSettings] = useSettings();
  const tabClass = (active: boolean): string =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-ink text-paper" : "text-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <a href={href({ name: "learn" })} className="mr-auto flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sage text-sm font-bold text-paper">RL</span>
          <span className="leading-tight">
            <span className="block font-display text-lg">REL301m</span>
            <span className="block text-xs text-muted">Ôn tập Reinforcement Learning</span>
          </span>
        </a>
        <nav className="flex items-center gap-1 rounded-full border border-line bg-panel p-1" aria-label="Chế độ">
          <a href={href({ name: "learn" })} className={tabClass(isLearn(route))} aria-current={isLearn(route) ? "page" : undefined}>
            Học
          </a>
          <a
            href={href({ name: "practice", deckId: "all" })}
            className={tabClass(!isLearn(route))}
            aria-current={!isLearn(route) ? "page" : undefined}
          >
            Luyện tập
          </a>
        </nav>
        <button
          type="button"
          onClick={() => setSettings({ theme: settings.theme === "dark" ? "light" : "dark" })}
          className="rounded-full border border-line bg-panel px-3 py-1.5 text-sm text-muted hover:text-ink"
          aria-label="Đổi giao diện sáng/tối"
        >
          {settings.theme === "dark" ? "Sáng" : "Tối"}
        </button>
      </div>
    </header>
  );
};
