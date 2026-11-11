import type { ContentLang } from "../data/types";
import { useSettings } from "../features/progress/store";

const LANGS: { value: ContentLang; label: string; title: string }[] = [
  { value: "en", label: "EN", title: "Câu hỏi và lời giải bằng tiếng Anh" },
  { value: "vi", label: "VI", title: "Câu hỏi và lời giải bằng tiếng Việt" },
];

/** Switches the language of questions, options and explanations. */
export const LangToggle = ({ className = "" }: { className?: string }) => {
  const [settings, setSettings] = useSettings();
  return (
    <div
      role="group"
      aria-label="Ngôn ngữ câu hỏi"
      className={`inline-flex items-center rounded-full border border-line bg-panel p-0.5 text-xs font-semibold ${className}`}
    >
      {LANGS.map(({ value, label, title }) => {
        const active = settings.contentLang === value;
        return (
          <button
            key={value}
            type="button"
            title={title}
            aria-pressed={active}
            onClick={() => setSettings({ contentLang: value })}
            className={`rounded-full px-2.5 py-1 transition-colors ${active ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
