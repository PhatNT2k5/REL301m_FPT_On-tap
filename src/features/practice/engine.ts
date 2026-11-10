/**
 * Pure quiz-session engine: a wrong answer sends the question to the back of the queue,
 * and a session is complete only when every question has been answered correctly.
 */

export interface AnswerRecord {
  questionId: string;
  chosen: number[];
  correct: boolean;
}

export interface SessionState {
  questionIds: string[];
  queue: string[];
  solved: string[];
  wrongCounts: Record<string, number>;
  attempts: number;
  /** Every answer given, in order. Optional because sessions saved before this field existed lack it. */
  history?: AnswerRecord[];
}

export interface AnswerResult {
  state: SessionState;
  correct: boolean;
}

export const createSession = (questionIds: string[]): SessionState => ({
  questionIds: [...questionIds],
  queue: [...questionIds],
  solved: [],
  wrongCounts: {},
  attempts: 0,
  history: [],
});

export const currentQuestionId = (state: SessionState): string | undefined => state.queue[0];

export const isCorrectChoice = (chosen: number[], answers: number[]): boolean => {
  if (chosen.length !== answers.length) return false;
  const expected = new Set(answers);
  return chosen.every((index) => expected.has(index));
};

export const answerQuestion = (state: SessionState, chosen: number[], answers: number[]): AnswerResult => {
  const [head, ...rest] = state.queue;
  if (head === undefined) return { state, correct: false };
  const correct = isCorrectChoice(chosen, answers);
  const history = [...(state.history ?? []), { questionId: head, chosen: [...chosen], correct }];
  if (correct) {
    return {
      correct,
      state: { ...state, queue: rest, solved: [...state.solved, head], attempts: state.attempts + 1, history },
    };
  }
  return {
    correct,
    state: {
      ...state,
      history,
      queue: [...rest, head],
      wrongCounts: { ...state.wrongCounts, [head]: (state.wrongCounts[head] ?? 0) + 1 },
      attempts: state.attempts + 1,
    },
  };
};

export const isComplete = (state: SessionState): boolean =>
  state.queue.length === 0 && state.solved.length === state.questionIds.length;

/** Answers given to one question, oldest first. */
export const answersFor = (state: SessionState, questionId: string): AnswerRecord[] =>
  (state.history ?? []).filter((record) => record.questionId === questionId);

/** A question can be reviewed once it has been answered at least once in this session. */
export const isAnswered = (state: SessionState, questionId: string): boolean =>
  state.solved.includes(questionId) || (state.wrongCounts[questionId] ?? 0) > 0;

export const totalWrong = (state: SessionState): number =>
  Object.values(state.wrongCounts).reduce((sum, n) => sum + n, 0);

/** Split an ordered list of ids into fixed-size sessions. */
export const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

/** Deterministic shuffle (mulberry32) so a session keeps its order across reloads. */
export const seededShuffle = <T,>(items: T[], seed: number): T[] => {
  let t = seed >>> 0;
  const random = (): number => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
