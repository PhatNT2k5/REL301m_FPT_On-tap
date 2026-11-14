import { describe, expect, it } from "vitest";
import { renderScripts } from "./MathText";

describe("renderScripts", () => {
  it("renders braced and bare sub/superscripts", () => {
    expect(renderScripts("G_t = Σ_{k=0}^{T-t-1} γ^k · R_{t+k+1}")).toBe(
      "G<sub>t</sub> = Σ<sub>k=0</sub><sup>T-t-1</sup> γ<sup>k</sup> · R<sub>t+k+1</sub>",
    );
  });

  it("handles nested scripts and chained sub/sup", () => {
    expect(renderScripts("∇_{π_θ} x_i^2")).toBe("∇<sub>π<sub>θ</sub></sub> x<sub>i</sub><sup>2</sup>");
  });

  it("renders _bar as an overline", () => {
    expect(renderScripts("R_bar_t")).toBe("R̄<sub>t</sub>");
  });

  it("does not touch blanks or exponents followed by operators", () => {
    expect(renderScripts("fill ____ here")).toBe("fill ____ here");
    expect(renderScripts("γ^2*R")).toBe("γ<sup>2</sup>*R");
    expect(renderScripts("policy_stable == True")).toBe("policy_stable == True");
  });
});
