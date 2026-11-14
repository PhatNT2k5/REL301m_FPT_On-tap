import katex from "katex";
import { useMemo } from "react";

const MATH_PATTERN = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");

// `_{...}` / `^{...}` (one level of nested braces) or a short bare token like `_t`, `_TD`, `^2`.
// The marker must follow a non-space, non-underscore char so blanks like "____" stay as text,
// and bare tokens longer than 3 chars are identifiers ("policy_stable"), not scripts.
const SCRIPT_PATTERN = /(?<=[^\s_])([_^])(?:\{((?:[^{}]|\{[^{}]*\})*)\}|([\p{L}\p{N}'∞]{1,3})(?![\p{L}\p{N}_]))/gu;

/**
 * Plain-text formulas ("G_t = Σ_{k=0}^{T-t-1} γ^k · R_{t+k+1}") rendered with real
 * sub/superscripts. Expects already HTML-escaped text.
 */
export const renderScripts = (html: string): string =>
  html
    .replace(/(\p{L})_bar(?![\p{L}\p{N}])/gu, "$1̄")
    .replace(SCRIPT_PATTERN, (_match, marker: string, braced: string | undefined, bare: string | undefined) => {
      const tag = marker === "_" ? "sub" : "sup";
      return `<${tag}>${renderScripts(braced ?? bare ?? "")}</${tag}>`;
    });

const renderPlain = (text: string): string => renderScripts(escapeHtml(text));

/** Render plain text containing $inline$ or $$display$$ LaTeX, plus plain-text sub/superscripts. */
export const renderMath = (text: string): string => {
  let html = "";
  let last = 0;
  for (const match of text.matchAll(MATH_PATTERN)) {
    const index = match.index ?? 0;
    html += renderPlain(text.slice(last, index));
    const display = match[1] !== undefined;
    const tex = match[1] ?? match[2] ?? "";
    html += katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: "ignore" });
    last = index + match[0].length;
  }
  return html + renderPlain(text.slice(last));
};

interface MathTextProps {
  text: string;
  className?: string;
  as?: "span" | "div" | "p";
}

export const MathText = ({ text, className, as = "span" }: MathTextProps) => {
  const html = useMemo(() => renderMath(text), [text]);
  const Tag = as;
  return <Tag className={`math-text ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: html }} />;
};
