import { useCallback, useEffect, useState } from "react";
import type { ContentLang } from "../../data/types";
import type { SessionState } from "../practice/engine";

export type Theme = "light" | "dark";
export type SessionSize = 10 | 20;

export interface Settings {
  theme: Theme;
  sessionSize: SessionSize;
  shuffleOptions: boolean;
  autoAdvance: boolean;
  sound: boolean;
  contentLang: ContentLang;
}

export interface SessionRecord {
  state: SessionState;
  done: boolean;
  bestWrong?: number;
}

export interface Progress {
  settings: Settings;
  sessions: Record<string, SessionRecord>;
  starred: string[];
  wrongTotals: Record<string, number>;
  watched: Record<number, number>; // chapter -> furthest second watched
}

const STORAGE_KEY = "rel301m-ontap-v1";

const defaultTheme = (): Theme =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const defaults = (): Progress => ({
  settings: { theme: defaultTheme(), sessionSize: 10, shuffleOptions: true, autoAdvance: false, sound: true, contentLang: "en" },
  sessions: {},
  starred: [],
  wrongTotals: {},
  watched: {},
});

// In-memory fallback when localStorage is blocked (private mode, disabled storage).
let memory: Progress | null = null;
let storageAvailable = true;

const load = (): Progress => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const base = defaults();
    return { ...base, ...parsed, settings: { ...base.settings, ...parsed.settings } };
  } catch {
    storageAvailable = false;
    return memory ?? defaults();
  }
};

const save = (progress: Progress): void => {
  memory = progress;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    storageAvailable = false;
  }
};

export const isStorageAvailable = (): boolean => storageAvailable;

type Listener = (p: Progress) => void;
const listeners = new Set<Listener>();
let current: Progress | null = null;

const getProgress = (): Progress => {
  if (!current) current = load();
  return current;
};

export const updateProgress = (updater: (p: Progress) => Progress): void => {
  current = updater(getProgress());
  save(current);
  listeners.forEach((listener) => listener(current as Progress));
};

export const useProgress = (): [Progress, typeof updateProgress] => {
  const [progress, setProgress] = useState<Progress>(getProgress);
  useEffect(() => {
    listeners.add(setProgress);
    return () => {
      listeners.delete(setProgress);
    };
  }, []);
  return [progress, updateProgress];
};

export const useSettings = (): [Settings, (patch: Partial<Settings>) => void] => {
  const [progress] = useProgress();
  const set = useCallback((patch: Partial<Settings>) => {
    updateProgress((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  }, []);
  return [progress.settings, set];
};

export const toggleStar = (id: string): void =>
  updateProgress((p) => ({
    ...p,
    starred: p.starred.includes(id) ? p.starred.filter((s) => s !== id) : [...p.starred, id],
  }));

export const resetSessions = (keyPrefix?: string): void =>
  updateProgress((p) => ({
    ...p,
    sessions: keyPrefix
      ? Object.fromEntries(Object.entries(p.sessions).filter(([key]) => !key.startsWith(keyPrefix)))
      : {},
    wrongTotals: keyPrefix ? p.wrongTotals : {},
  }));
