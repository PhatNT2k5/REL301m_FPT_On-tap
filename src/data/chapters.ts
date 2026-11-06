import type { Chapter } from "./types";

export const CHAPTERS: Chapter[] = [
  {
    number: 1,
    title: "Multi-armed Bandits",
    titleVi: "Phần thưởng, giá trị hành động, khám phá và khai thác",
    lessons: [
      { id: "1.1", title: "The K-Armed Bandit Problem" },
      { id: "1.2", title: "Estimating Action Values" },
      { id: "1.3", title: "Exploration vs. Exploitation Tradeoff" },
    ],
    keyPoints: [
      "$q_*(a) = \\mathbb{E}[R_t \\mid A_t = a]$ is the expected reward of an action",
      "Sample-average estimate $Q_t(a)$ converges to $q_*(a)$",
      "Incremental update: $Q_{n+1} = Q_n + \\frac{1}{n}[R_n - Q_n]$",
      "$\\epsilon$-greedy: P(greedy) $= 1 - \\epsilon + \\epsilon/k$",
    ],
  },
  {
    number: 2,
    title: "Markov Decision Processes",
    titleVi: "Trạng thái, dynamics, mục tiêu, episodic và continuing task",
    lessons: [
      { id: "1.4", title: "Introduction to Markov Decision Processes" },
      { id: "1.5", title: "Goal of Reinforcement Learning" },
      { id: "1.6", title: "Continuing Tasks" },
    ],
    keyPoints: [
      "Dynamics $p(s', r \\mid s, a)$ sum to 1 over all $(s', r)$",
      "Markov property: the present state is sufficient",
      "Goal: maximize the expected return $\\mathbb{E}[G_t]$",
      "Discounting: $G_t = R_{t+1} + \\gamma G_{t+1}$, $0 \\le \\gamma < 1$",
    ],
  },
  {
    number: 3,
    title: "Policies, Value Functions & Bellman Equations",
    titleVi: "Policy, hàm giá trị, phương trình Bellman và tính tối ưu",
    lessons: [
      { id: "1.7", title: "Policies and Value Functions" },
      { id: "1.8", title: "Bellman Equations" },
      { id: "1.9", title: "Optimal Policies & Value Functions" },
    ],
    keyPoints: [
      "$v_\\pi(s) = \\mathbb{E}_\\pi[G_t \\mid S_t = s]$, $q_\\pi(s,a) = \\mathbb{E}_\\pi[G_t \\mid S_t = s, A_t = a]$",
      "Bellman expectation: average over $\\pi$ and $p$",
      "Bellman optimality: replace the average over $\\pi$ by $\\max_a$",
      "$\\pi_* = \\arg\\max_a q_*(s, a)$ (no model needed)",
    ],
  },
  {
    number: 4,
    title: "Dynamic Programming",
    titleVi: "Policy evaluation, policy iteration, value iteration và GPI",
    lessons: [
      { id: "1.10", title: "Policy Evaluation (Prediction)" },
      { id: "1.11", title: "Policy Iteration (Control)" },
      { id: "1.12", title: "Generalized Policy Iteration" },
    ],
    keyPoints: [
      "DP needs a complete model of the environment",
      "Iterative policy evaluation converges to $v_\\pi$ for any $v_0$",
      "Policy iteration: evaluate → greedify → repeat",
      "Value iteration uses the Bellman optimality update (max)",
    ],
  },
  {
    number: 5,
    title: "Monte Carlo Methods",
    titleVi: "Dự đoán, điều khiển, khám phá và học off-policy",
    lessons: [
      { id: "2.1", title: "Introduction to Monte-Carlo Methods" },
      { id: "2.2", title: "Monte-Carlo for Control" },
      { id: "2.3", title: "Exploration Methods for Monte-Carlo" },
      { id: "2.4", title: "Off-policy learning for prediction" },
    ],
    keyPoints: [
      "Average complete-episode returns; no model, no bootstrapping",
      "Exploring starts or $\\epsilon$-soft policies keep exploring",
      "Off-policy: behavior $b$ must cover target $\\pi$",
      "Importance sampling ratio $\\rho = \\prod \\pi(A|S)/b(A|S)$",
    ],
  },
  {
    number: 6,
    title: "Temporal Difference Learning",
    titleVi: "TD error, TD(0) và ưu điểm so với MC và DP",
    lessons: [
      { id: "2.5", title: "Introduction to Temporal Difference Learning" },
      { id: "2.6", title: "Advantages of Temporal Difference" },
    ],
    keyPoints: [
      "TD target: $R_{t+1} + \\gamma V(S_{t+1})$",
      "TD error: $\\delta_t = R_{t+1} + \\gamma V(S_{t+1}) - V(S_t)$",
      "Bootstraps like DP, model-free like MC",
      "Online, lower variance, usually faster than MC",
    ],
  },
  {
    number: 7,
    title: "TD Control: Sarsa, Q-learning, Expected Sarsa",
    titleVi: "Sarsa (on-policy), Q-learning (off-policy) và Expected Sarsa",
    lessons: [
      { id: "2.7", title: "Temporal Difference for Control" },
      { id: "2.8", title: "Off-policy TD Control: Q-learning" },
      { id: "2.9", title: "Expected Sarsa" },
    ],
    keyPoints: [
      "Sarsa target: $R + \\gamma Q(S', A')$ (on-policy)",
      "Q-learning target: $R + \\gamma \\max_a Q(S', a)$ (off-policy)",
      "Expected Sarsa: $R + \\gamma \\sum_{a'} \\pi(a'|S') Q(S', a')$",
      "Expected Sarsa with greedy target policy = Q-learning",
    ],
  },
  {
    number: 8,
    title: "Models, Planning & Dyna",
    titleVi: "Mô hình, lập kế hoạch, Dyna-Q và Dyna-Q+",
    lessons: [
      { id: "2.10", title: "Define model in Reinforcement Learning" },
      { id: "2.11", title: "Define Planning in Reinforcement Learning" },
      { id: "2.12", title: "Dyna as a formalism for planning" },
      { id: "2.13", title: "Dealing with inaccurate models" },
    ],
    keyPoints: [
      "Sample model vs. distribution model",
      "Planning: improve the policy with simulated experience",
      "Dyna-Q: direct RL + model learning + $n$ planning steps",
      "Dyna-Q+ bonus: $r + \\kappa\\sqrt{\\tau}$",
    ],
  },
  {
    number: 9,
    title: "On-policy Prediction with Function Approximation",
    titleVi: "VE, gradient MC, semi-gradient TD, linear TD, tile coding",
    lessons: [
      { id: "3.1", title: "Estimating Value Functions as Supervised Learning" },
      { id: "3.2", title: "The Objective for On-policy Prediction" },
      { id: "3.3", title: "The Objective for Temporal Difference" },
      { id: "3.4", title: "Linear Temporal Difference" },
      { id: "3.5", title: "Feature Construction for Linear Methods" },
    ],
    keyPoints: [
      "$\\overline{VE} = \\sum_s \\mu(s)[v_\\pi(s) - \\hat{v}(s, \\mathbf{w})]^2$",
      "Gradient MC is unbiased; semi-gradient TD is biased but faster",
      "Linear TD converges to $\\mathbf{w}_{TD} = \\mathbf{A}^{-1}\\mathbf{b}$",
      "Tabular TD and state aggregation are special cases of linear TD",
    ],
  },
  {
    number: 10,
    title: "Control with Function Approximation & Average Reward",
    titleVi: "Semi-gradient Sarsa, khám phá khi xấp xỉ hàm, average reward",
    lessons: [
      { id: "3.6", title: "Episodic Sarsa with Function Approximation" },
      { id: "3.7", title: "Exploration under Function Approximation" },
      { id: "3.8", title: "Understand Average Reward" },
    ],
    keyPoints: [
      "Stacked features for $\\hat{q}(s, a, \\mathbf{w})$",
      "Optimistic init is hard with FA; $\\epsilon$-greedy always works",
      "Average reward $r(\\pi)$ replaces discounting in continuing tasks",
      "Differential TD error: $R - \\bar{R} + \\hat{q}(S', A') - \\hat{q}(S, A)$",
    ],
  },
  {
    number: 11,
    title: "Policy Gradient & Actor-Critic",
    titleVi: "Softmax policy, policy gradient theorem, actor-critic, Gaussian policy",
    lessons: [
      { id: "3.9", title: "Learning Parameterized Policies" },
      { id: "3.10", title: "Policy Gradient for Continuing Tasks" },
      { id: "3.11", title: "Actor-Critic for Continuing Tasks" },
      { id: "3.12", title: "Policy Parameterizations" },
    ],
    keyPoints: [
      "Softmax over action preferences $h(s, a, \\boldsymbol{\\theta})$",
      "$\\nabla r(\\pi) = \\sum_s \\mu(s) \\sum_a \\nabla\\pi(a|s)\\, q_\\pi(s,a)$",
      "Actor uses the critic's TD error: $\\boldsymbol{\\theta} \\leftarrow \\boldsymbol{\\theta} + \\alpha\\delta\\nabla\\ln\\pi$",
      "Gaussian policy: $\\mu(s)$ and $\\sigma(s) > 0$ for continuous actions",
    ],
  },
];

export const chapterLabel = (n: number): string => `Ch.${n}`;

export const videoSrc = (n: number): string => `/videos/ch${String(n).padStart(2, "0")}.mp4`;
export const subtitleSrc = (n: number): string => `/videos/ch${String(n).padStart(2, "0")}.vtt`;
export const scenesSrc = (n: number): string => `/videos/ch${String(n).padStart(2, "0")}.chapters.vtt`;
