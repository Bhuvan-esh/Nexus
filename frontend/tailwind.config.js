/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper, #F5F1EA)",
        card: "var(--color-card, #FBF9F5)",
        code: "var(--color-code, #EFEBE2)",
        ink: {
          DEFAULT: "var(--color-ink, #1C1A17)",
          muted: "rgba(28, 26, 23, 0.60)",
          border: "rgba(28, 26, 23, 0.08)",
        },
        accent: "var(--color-accent, #C8553D)",
        link: "var(--color-link, #2F6FEB)",
        protected: "var(--color-protected, #3F7D5C)",
        attention: "var(--color-attention, #B4761F)",
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["Geist", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        kannada: ["Noto Sans Kannada", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        input: "10px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(28, 26, 23, 0.06)",
        card: "0 2px 8px rgba(28, 26, 23, 0.04), 0 8px 24px rgba(28, 26, 23, 0.06)",
        orb: "0 10px 30px rgba(200, 85, 61, 0.25)",
      },
    },
  },
  plugins: [],
};
