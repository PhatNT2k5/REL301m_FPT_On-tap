import katex from "katex";
import { useMemo } from "react";

const MATH_PATTERN = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");

/** Render plain text containing $inline$ or $$display$$ LaTeX. */
export const renderMath = (text: string): string => {
  let html = "";
  let last = 0;
  for (const match of text.matchAll(MATH_PATTERN)) {
    const index = match.index ?? 0;
    html += escapeHtml(text.slice(last, index));
    const display = match[1] !== undefined;
    const tex = match[1] ?? match[2] ?? "";
    html += katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: "ignore" });
    last = index + match[0].length;
  }
  return html + escapeHtml(text.slice(last));
};

interface MathTextProps {
  text: string;
  className?: string;
  as?: "span" | "div" | "p";
}

export const MathText = ({ text, className, as = "span" }: MathTextProps) => {
  const html = useMemo(() => renderMath(text), [text]);
  const Tag = as;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
