import { GLOSSARY } from "./glossary";

const MATH_SEGMENT = /(\$\$[^$]+\$\$|\$[^$]+\$)/;

const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isAcronym = (term: string): boolean => term === term.toUpperCase();

interface TermPattern {
  key: string;
  gloss: string;
  regex: RegExp;
}

// Longest terms first so "target policy" wins over "target" and "policy".
const buildPatterns = (glossary: Record<string, string>): TermPattern[] =>
  Object.entries(glossary)
    .sort(([a], [b]) => b.length - a.length)
    .map(([key, gloss]) => ({
      key,
      gloss,
      // Unicode-aware boundaries so Vietnamese letters next to the term do not count as part of it.
      regex: new RegExp(`(?<![\\p{L}\\p{N}_-])${escapeRegex(key)}(?![\\p{L}\\p{N}_-])`, isAcronym(key) ? "gu" : "giu"),
    }));

const PATTERNS = buildPatterns(GLOSSARY);

interface Hit {
  start: number;
  end: number;
  gloss: string;
}

const overlaps = (hit: Hit, taken: Hit[]): boolean => taken.some((t) => hit.start < t.end && t.start < hit.end);

/** A term already explained in place, e.g. "...vùng (receptive field)" or "coarse coding (...)". */
const alreadyGlossed = (text: string, start: number, end: number): boolean =>
  /^\s*\(/.test(text.slice(end)) || (text[start - 1] === "(" && text[end] === ")");

const annotateSegment = (text: string, seen: Set<string>): string => {
  const hits: Hit[] = [];
  for (const { key, gloss, regex } of PATTERNS) {
    if (seen.has(key)) continue;
    for (const match of text.matchAll(regex)) {
      const start = match.index ?? 0;
      const hit = { start, end: start + match[0].length, gloss };
      if (overlaps(hit, hits)) continue;
      hits.push(hit);
      seen.add(key);
      if (!alreadyGlossed(text, hit.start, hit.end)) break;
      // Keep the hit (so shorter terms inside it are skipped) but do not add a second gloss.
      hit.gloss = "";
      break;
    }
  }
  return hits
    .sort((a, b) => b.start - a.start)
    .reduce((out, { end, gloss }) => (gloss ? `${out.slice(0, end)} (${gloss})${out.slice(end)}` : out), text);
};

/**
 * Adds a Vietnamese gloss after the first occurrence of each English RL term,
 * e.g. "coarse coding" -> "coarse coding (mã hoá thô bằng các vùng chồng lấn)". LaTeX is left untouched.
 */
export const annotateTerms = (text: string): string => {
  const seen = new Set<string>();
  return text
    .split(MATH_SEGMENT)
    // split() with a capture group puts the math segments at odd indices.
    .map((part, i) => (i % 2 === 1 ? part : annotateSegment(part, seen)))
    .join("");
};
