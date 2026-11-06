import { describe, expect, it } from "vitest";
import {
  answerQuestion,
  chunk,
  createSession,
  currentQuestionId,
  isComplete,
  isCorrectChoice,
  seededShuffle,
  totalWrong,
} from "./engine";

describe("quiz engine", () => {
  it("advances on a correct answer", () => {
    const s0 = createSession(["a", "b"]);
    const { state, correct } = answerQuestion(s0, [1], [1]);
    expect(correct).toBe(true);
    expect(currentQuestionId(state)).toBe("b");
    expect(state.solved).toEqual(["a"]);
  });

  it("sends a wrong question to the end of the queue", () => {
    const s0 = createSession(["a", "b", "c"]);
    const { state, correct } = answerQuestion(s0, [0], [2]);
    expect(correct).toBe(false);
    expect(state.queue).toEqual(["b", "c", "a"]);
    expect(state.wrongCounts).toEqual({ a: 1 });
  });

  it("completes only when every question was answered correctly", () => {
    let s = createSession(["a", "b"]);
    s = answerQuestion(s, [0], [1]).state; // a wrong -> [b, a]
    s = answerQuestion(s, [1], [1]).state; // b right -> [a]
    expect(isComplete(s)).toBe(false);
    s = answerQuestion(s, [0], [1]).state; // a wrong again -> [a]
    expect(isComplete(s)).toBe(false);
    s = answerQuestion(s, [1], [1]).state; // a right
    expect(isComplete(s)).toBe(true);
    expect(totalWrong(s)).toBe(2);
    expect(s.attempts).toBe(4);
  });

  it("requires the exact set for multi-answer questions", () => {
    expect(isCorrectChoice([0, 2], [2, 0])).toBe(true);
    expect(isCorrectChoice([0], [0, 2])).toBe(false);
    expect(isCorrectChoice([0, 1, 2], [0, 2])).toBe(false);
  });

  it("ignores answers after the session is finished", () => {
    const done = answerQuestion(createSession(["a"]), [0], [0]).state;
    const after = answerQuestion(done, [1], [0]);
    expect(after.state).toBe(done);
  });

  it("chunks and shuffles deterministically", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    const items = Array.from({ length: 20 }, (_, i) => i);
    expect(seededShuffle(items, 7)).toEqual(seededShuffle(items, 7));
    expect([...seededShuffle(items, 7)].sort((a, b) => a - b)).toEqual(items);
  });
});
