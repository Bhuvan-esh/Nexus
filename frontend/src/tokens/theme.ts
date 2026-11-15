/**
 * NEXUS Design Tokens
 * Source: Frontend Design Brief ("Warm paper, living voice"), adapted for NEXUS.
 * Strict rule: No raw hex values or arbitrary radii in components.
 */

export const colors = {
  paper: "#F5F1EA",       // Page, app canvas background (60%)
  card: "#FBF9F5",        // Replies, sections, sheets (30%)
  code: "#EFEBE2",        // Protected spans, mono sacred content
  ink: "#1C1A17",         // Primary text (never pure black)
  inkMuted: "rgba(28, 26, 23, 0.60)", // Labels, secondary text (60%)
  inkBorder: "rgba(28, 26, 23, 0.08)", // 1px borders at 8% ink
  accent: "#C8553D",      // Primary action & active state ONLY (~10%)
  link: "#2F6FEB",        // Source citations & dictionary pills
  protected: "#3F7D5C",   // Verified, byte-exact, preserved spans
  attention: "#B4761F",   // Uncertain tokens, fail-closed amber
} as const;

export const radii = {
  card: 14,
  input: 10,
  pill: 999,
} as const;

export const shadows = {
  soft: "0 8px 24px rgba(28, 26, 23, 0.06)",
  border: "0 0 0 1px rgba(28, 26, 23, 0.08)",
} as const;

export const typography = {
  display: {
    fontFamily: "Newsreader, Georgia, serif",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "500",
  },
  section: {
    fontFamily: "Newsreader, Georgia, serif",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "500",
    letterSpacing: -0.17,
  },
  body: {
    fontFamily: "Geist, system-ui, sans-serif",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
    maxWidthCh: 64,
  },
  label: {
    fontFamily: "Geist, system-ui, sans-serif",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    letterSpacing: 1.1,
    textTransform: "uppercase" as const,
  },
  code: {
    fontFamily: "JetBrains Mono, monospace",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },
  kannada: {
    fontFamily: "Noto Sans Kannada, sans-serif",
    lineHeightMultiplier: 1.7, // extra vertical room for conjuncts & diacritics
  },
} as const;

export const motion = {
  spring: {
    damping: 20,
    stiffness: 120,
  },
  staggerMs: 40,
  risePx: 6,
  microMs: 180,
  entranceMs: 380,
} as const;
