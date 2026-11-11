import { describe, expect, it } from "vitest";
import { annotateTerms } from "./annotateTerms";
import { localizeQuestion, QUESTIONS } from "./questions";

describe("annotateTerms", () => {
  it("glosses only the first occurrence of a term", () => {
    expect(annotateTerms("Policy tốt hơn khi policy greedy.")).toBe(
      "Policy (chiến lược chọn hành động) tốt hơn khi policy greedy (tham lam).",
    );
  });

  it("prefers the longest matching term", () => {
    expect(annotateTerms("Dùng target policy.")).toBe("Dùng target policy (policy cần học/đánh giá).");
  });

  it("leaves LaTeX untouched", () => {
    expect(annotateTerms("$\\pi$ là policy, $\\text{policy}$")).toBe(
      "$\\pi$ là policy (chiến lược chọn hành động), $\\text{policy}$",
    );
  });

  it("skips terms already explained in parentheses", () => {
    expect(annotateTerms("gom vào các vùng (receptive field)")).toBe("gom vào các vùng (receptive field)");
  });

  it("does not match acronyms inside other words or in lowercase", () => {
    expect(annotateTerms("TDX dùng td")).toBe("TDX dùng td");
  });
});

describe("localizeQuestion", () => {
  it("keeps the explanation in Vietnamese for both languages", () => {
    const q = QUESTIONS[0];
    expect(localizeQuestion(q, "en").explanation).toBe(localizeQuestion(q, "vi").explanation);
  });
});
