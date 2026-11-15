/**
 * NEXUS Pipeline Types & Contracts (§7)
 */

export interface CandidateBreakdown {
  kannada: string;
  score: number;       // normalized score [0, 1]
  rawScore?: number;   // legacy raw score e.g. 150
  P: number;           // Phonetic correspondence [0, 1]
  L: number;           // Lexical evidence score [0, 1]
  X: number;           // Contextual fit score [0, 1]
}

export interface PipelineStageEvent {
  type: "stage";
  name:
    | "validation"
    | "normalization"
    | "tokenization"
    | "pronunciation"
    | "candidate_generation"
    | "candidate_selection"
    | "postprocessing";
  label?: string;
  output: string | string[] | Record<string, unknown>;
  ms: number;
}

export interface PipelineTokenEvent {
  type: "token";
  index: number;
  source: string;
  kannada: string;
  score: number;
  rawScore?: number;
  confident: boolean;
  origin: string[];    // e.g. ["dictionary", "phonetic_rules"]
  candidates: CandidateBreakdown[];
}

export interface PipelineSpanEvent {
  type: "span";
  index: number;
  kind: "url" | "email" | "code" | "acronym";
  text: string;
  protected: true;
  sha256?: string;
}

export interface HonestySummary {
  tokens: number;
  protected: number;
  altered: number;
  low_confidence: number;
}

export interface PipelineDoneEvent {
  type: "done";
  final: string;
  total_ms: number;
  summary: HonestySummary;
  traceStages?: PipelineStageEvent[];
}

export type PipelineStreamEvent =
  | PipelineStageEvent
  | PipelineTokenEvent
  | PipelineSpanEvent
  | PipelineDoneEvent;

export interface TokenItem {
  id: string;
  source: string;
  kannada: string;
  score: number;
  confident: boolean;
  origin: string[];
  candidates: CandidateBreakdown[];
  isProtected?: boolean;
  kind?: "word" | "url" | "email" | "code" | "acronym" | "punctuation";
  sha256Source?: string;
  sha256Output?: string;
}

export interface MessageItem {
  id: string;
  role: "user" | "nexus";
  text: string;
  createdAt: number;
  cached?: boolean;
  tokens?: TokenItem[];
  spans?: PipelineSpanEvent[];
  stages?: PipelineStageEvent[];
  summary?: HonestySummary;
  totalMs?: number;
  isStreaming?: boolean;
}
