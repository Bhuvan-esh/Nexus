import { MessageItem } from "../types/pipeline";

/**
 * Pre-seeded Golden Paths (F13)
 * Provides instant, zero-spinner evaluation demo.
 * Displays "Offline · cached" chip when served from cache.
 */
export const GOLDEN_PATHS: Record<string, MessageItem> = {
  hello: {
    id: "cached-hello",
    role: "nexus",
    text: "ಹೆಲ್ಲೋ",
    createdAt: Date.now(),
    cached: true,
    totalMs: 38,
    summary: {
      tokens: 1,
      protected: 0,
      altered: 0,
      low_confidence: 0,
    },
    tokens: [
      {
        id: "tok-0",
        source: "hello",
        kannada: "ಹೆಲ್ಲೋ",
        score: 0.95,
        confident: true,
        origin: ["Dictionary", "Phonetic rules"],
        candidates: [
          { kannada: "ಹೆಲ್ಲೋ", score: 0.95, rawScore: 150, P: 0.94, L: 1.0, X: 0.0 },
          { kannada: "ಹಲೋ", score: 0.82, rawScore: 120, P: 0.88, L: 0.8, X: 0.0 },
          { kannada: "ಹೆಲೋ", score: 0.75, rawScore: 105, P: 0.80, L: 0.7, X: 0.0 },
        ],
      },
    ],
    stages: [
      { type: "stage", name: "validation", label: "Validation", output: "Input accepted (Latin script)", ms: 1 },
      { type: "stage", name: "normalization", label: "Normalization", output: "hello", ms: 2 },
      { type: "stage", name: "tokenization", label: "Tokenization", output: ["hello"], ms: 2 },
      { type: "stage", name: "pronunciation", label: "Pronunciation Analysis", output: "HH AH0 L OW1 (CMU / G2P)", ms: 14 },
      { type: "stage", name: "candidate_generation", label: "Candidate Generation", output: "Synthesized 3 Kannada candidates", ms: 8 },
      { type: "stage", name: "candidate_selection", label: "Candidate Selection", output: "Selected 'ಹೆಲ್ಲೋ' (Score: 0.95, α=0.5, β=0.5)", ms: 7 },
      { type: "stage", name: "postprocessing", label: "Post-Processing", output: "Unicode NFC normalized (U+0CB9 U+0CC6...)", ms: 4 },
    ],
  },
  "the school is open.": {
    id: "cached-school",
    role: "nexus",
    text: "ದ ಸ್ಕೂಲ್ ಈಸ್ ಓಪನ್.",
    createdAt: Date.now(),
    cached: true,
    totalMs: 74,
    summary: {
      tokens: 4,
      protected: 0,
      altered: 0,
      low_confidence: 0,
    },
    tokens: [
      {
        id: "tok-0",
        source: "The",
        kannada: "ದ",
        score: 0.96,
        confident: true,
        origin: ["Dictionary", "Phonetic rules"],
        candidates: [{ kannada: "ದ", score: 0.96, P: 0.95, L: 1.0, X: 0.0 }],
      },
      {
        id: "tok-1",
        source: "school",
        kannada: "ಸ್ಕೂಲ್",
        score: 0.94,
        confident: true,
        origin: ["Dictionary", "Phonetic rules"],
        candidates: [{ kannada: "ಸ್ಕೂಲ್", score: 0.94, P: 0.92, L: 1.0, X: 0.0 }],
      },
      {
        id: "tok-2",
        source: "is",
        kannada: "ಈಸ್",
        score: 0.93,
        confident: true,
        origin: ["Dictionary", "Phonetic rules"],
        candidates: [{ kannada: "ಈಸ್", score: 0.93, P: 0.91, L: 1.0, X: 0.0 }],
      },
      {
        id: "tok-3",
        source: "open.",
        kannada: "ಓಪನ್.",
        score: 0.91,
        confident: true,
        origin: ["Phonetic rules"],
        candidates: [{ kannada: "ಓಪನ್.", score: 0.91, P: 0.90, L: 0.9, X: 0.0 }],
      },
    ],
    stages: [
      { type: "stage", name: "validation", label: "Validation", output: "Sentence accepted (4 tokens)", ms: 2 },
      { type: "stage", name: "normalization", label: "Normalization", output: "The school is open.", ms: 3 },
      { type: "stage", name: "tokenization", label: "Tokenization", output: ["The", "school", "is", "open."], ms: 3 },
      { type: "stage", name: "pronunciation", label: "Pronunciation Analysis", output: "DH AH0, S K UW1 L, IH1 Z, OW1 P AH0 N", ms: 32 },
      { type: "stage", name: "candidate_generation", label: "Candidate Generation", output: "Candidates generated for 4 words", ms: 18 },
      { type: "stage", name: "candidate_selection", label: "Candidate Selection", output: "Max-score selection across sequences", ms: 11 },
      { type: "stage", name: "postprocessing", label: "Post-Processing", output: "Spacing & punctuation structure preserved", ms: 5 },
    ],
  },
  "https://example.com": {
    id: "cached-url",
    role: "nexus",
    text: "https://example.com",
    createdAt: Date.now(),
    cached: true,
    totalMs: 12,
    summary: {
      tokens: 0,
      protected: 1,
      altered: 0,
      low_confidence: 0,
    },
    spans: [
      {
        type: "span",
        index: 0,
        kind: "url",
        text: "https://example.com",
        protected: true,
        sha256: "ea8fac7c65fb589b0d53560f5251f74f9e9b243478dcb6b3ea79b5e36449c8d9",
      },
    ],
    tokens: [
      {
        id: "tok-0",
        source: "https://example.com",
        kannada: "https://example.com",
        score: 1.0,
        confident: true,
        isProtected: true,
        kind: "url",
        origin: ["Protected Span"],
        candidates: [],
        sha256Source: "ea8fac7c65fb589b0d53560f5251f74f9e9b243478dcb6b3ea79b5e36449c8d9",
        sha256Output: "ea8fac7c65fb589b0d53560f5251f74f9e9b243478dcb6b3ea79b5e36449c8d9",
      },
    ],
    stages: [
      { type: "stage", name: "validation", label: "Validation", output: "Input accepted", ms: 1 },
      { type: "stage", name: "normalization", label: "Normalization", output: "https://example.com", ms: 1 },
      { type: "stage", name: "tokenization", label: "Tokenization", output: "Protected span identified: URL", ms: 2 },
      { type: "stage", name: "pronunciation", label: "Pronunciation Analysis", output: "Bypassed: Sacred protected span", ms: 1 },
      { type: "stage", name: "candidate_generation", label: "Candidate Generation", output: "Bypassed: Preserved byte-for-byte", ms: 1 },
      { type: "stage", name: "candidate_selection", label: "Candidate Selection", output: "Bypassed", ms: 1 },
      { type: "stage", name: "postprocessing", label: "Post-Processing", output: "SHA-256 match confirmed", ms: 5 },
    ],
  },
};

export function getCachedResponse(input: string): MessageItem | null {
  const normalized = input.trim().toLowerCase();
  return GOLDEN_PATHS[normalized] || null;
}
