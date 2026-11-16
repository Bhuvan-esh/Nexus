/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper, #F5F1EA)",
        card: "var(--card, #FBF9F5)",
        code: "var(--code, #EFEBE2)",
        ink: {
          DEFAULT: "var(--ink, #1C1A17)",
          muted: "var(--ink-muted, rgba(28, 26, 23, 0.60))",
          border: "var(--ink-border, rgba(28, 26, 23, 0.08))",
        },
        accent: "var(--accent, #C8553D)",
        link: "var(--link, #2F6FEB)",
        protected: "var(--protected, #3F7D5C)",
        attention: "var(--attention, #B4761F)",
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
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
