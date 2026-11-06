import { useEffect, useState } from "react";

export type Route =
  | { name: "learn" }
  | { name: "chapter"; chapter: number }
  | { name: "practice"; deckId: string }
  | { name: "session"; deckId: string; size: number; index: number };

export const parseHash = (hash: string): Route => {
  const [path, query = ""] = hash.replace(/^#\/?/, "").split("?");
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams(query);
  if (parts[0] === "learn" && parts[1]) return { name: "chapter", chapter: Number(parts[1]) };
  if (parts[0] === "practice" && parts.length >= 4) {
    return { name: "session", deckId: decodeURIComponent(parts[1]), size: Number(parts[2]), index: Number(parts[3]) };
  }
  if (parts[0] === "practice") return { name: "practice", deckId: params.get("deck") ?? "all" };
  return { name: "learn" };
};

export const href = (route: Route): string => {
  switch (route.name) {
    case "learn":
      return "#/learn";
    case "chapter":
      return `#/learn/${route.chapter}`;
    case "practice":
      return `#/practice?deck=${encodeURIComponent(route.deckId)}`;
    case "session":
      return `#/practice/${encodeURIComponent(route.deckId)}/${route.size}/${route.index}`;
  }
};

export const navigate = (route: Route): void => {
  window.location.hash = href(route);
};

export const useRoute = (): Route => {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
};
