/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        panel: "var(--panel)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        sage: "var(--sage)",
        "sage-soft": "var(--sage-soft)",
        reward: "var(--reward)",
        "reward-soft": "var(--reward-soft)",
        penalty: "var(--penalty)",
        "penalty-soft": "var(--penalty-soft)",
      },
      fontFamily: {
        display: ['"Be Vietnam Pro"', "system-ui", "sans-serif"],
        sans: ['"Be Vietnam Pro"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
