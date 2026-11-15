/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F5F1EA",       // Page, app canvas background
        card: "#FBF9F5",        // Replies, sections, sheets
        code: "#EFEBE2",        // Protected spans, mono content
        ink: {
          DEFAULT: "#1C1A17",   // All text (never pure black)
          muted: "rgba(28, 26, 23, 0.60)",
          border: "rgba(28, 26, 23, 0.08)",
        },
        accent: "#C8553D",      // Primary action & active state ONLY
        link: "#2F6FEB",        // Source citations & dictionary pills
        protected: "#3F7D5C",   // Verified byte-exact safe spans
        attention: "#B4761F",   // Uncertain tokens, fail-closed amber
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["Geist", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
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
