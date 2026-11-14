import { describe, expect, it } from "vitest";
import { relabelExplanation } from "./questions";

describe("relabelExplanation", () => {
  it("rewrites option letters to their displayed positions", () => {
    // Displayed order: original C, A, B, D.
    const text = "- Phương án A (Sai): x\n- Phương án C (Sai): y\nĐáp án D đúng.";
    expect(relabelExplanation(text, [2, 0, 1, 3])).toBe("- Phương án B (Sai): x\n- Phương án A (Sai): y\nĐáp án D đúng.");
  });

  it("leaves text without letter references unchanged", () => {
    expect(relabelExplanation("A là Monte Carlo.", [1, 0])).toBe("A là Monte Carlo.");
  });
});
