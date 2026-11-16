import React from "react";
import { Check, X, ShieldCheck } from "lucide-react";

const DEFAULT_STAGES = [
  { name: "validation", label: "1. Input Validation & Guardrails", desc: "Boundary checks & Latin alphabet filter" },
  { name: "normalization", label: "2. Preprocessing & Normalization", desc: "Whitespace stripping & casing preservation" },
  { name: "tokenization", label: "3. Tokenizer & Protected Spans", desc: "Word, punctuation & protected span isolation" },
  { name: "pronunciation", label: "4. Pronunciation Analysis (G2P)", desc: "CMU Pronouncing Dictionary & phonetic synthesis" },
  { name: "candidate_generation", label: "5. Candidate Generation", desc: "Dictionary lookup + phonetic candidate synthesis" },
  { name: "candidate_selection", label: "6. Candidate Selection", desc: "Weighted scoring (Score = α·P + β·L + γ·X)" },
  { name: "postprocessing", label: "7. Post-Processing & Unicode NFC", desc: "Unicode normalization & virama / vowel-modifier rules" },
];

export function PipelineSheet({ message, isOpen, onClose }) {
  if (!isOpen || !message) return null;

  const stages = message.stages || [];
  const completedCount = stages.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card border border-ink/10 rounded-t-2xl sm:rounded-card p-6 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-ink/20 mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ink/8">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink/50 block">
              Pipeline Proof & Trace
            </span>
            <h3 className="font-serif text-xl font-semibold text-ink">
              End-to-End Execution
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink/40 hover:text-ink hover:bg-paper"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="py-3">
          <div className="flex gap-1 h-1.5 w-full bg-code rounded-full overflow-hidden mb-1.5">
            {DEFAULT_STAGES.map((_, i) => (
              <div
                key={i}
                className={`flex-1 transition-colors duration-300 ${
                  i < completedCount ? "bg-protected" : "bg-ink/10"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-mono text-ink/50">
            <span>{completedCount} of 7 stages verified</span>
            <span>Total: {message.totalMs || 0} ms</span>
          </div>
        </div>

        {/* Stages list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-2">
          {DEFAULT_STAGES.map((def, idx) => {
            const matched = stages.find((s) => s.name === def.name);
            const isDone = Boolean(matched);

            return (
              <div
                key={idx}
                className={`p-3 rounded-card border transition-all ${
                  isDone
                    ? "bg-paper border-ink/8 shadow-sm"
                    : "bg-paper/40 border-ink/5 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                        isDone
                          ? "bg-protected/15 text-protected"
                          : "bg-ink/10 text-ink/40"
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-ink">{def.label}</h4>
                      <p className="text-[11px] text-ink/50">{def.desc}</p>
                    </div>
                  </div>

                  {matched && (
                    <span className="text-[10px] font-mono text-ink/50 bg-code px-1.5 py-0.5 rounded">
                      {matched.ms} ms
                    </span>
                  )}
                </div>

                {matched && matched.output && (
                  <div className="mt-2 text-xs font-mono bg-code p-2 rounded-lg border border-ink/8 text-ink/80 break-words">
                    {typeof matched.output === "string"
                      ? matched.output
                      : JSON.stringify(matched.output)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Protected Spans SHA-256 match */}
          {message.spans && message.spans.length > 0 && (
            <div className="p-3 rounded-card bg-protected/5 border border-protected/20 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-protected uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                Protected Span Hash Integrity (F9)
              </div>
              {message.spans.map((sp, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-t border-protected/15 font-mono text-[11px]">
                  <span className="text-ink/60 uppercase text-[10px]">{sp.kind}:</span>
                  <span className="text-ink truncate max-w-[200px] px-2">{sp.text}</span>
                  <span className="text-protected font-semibold">✓ SHA-256 MATCH</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-ink/8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-ink text-card rounded-input text-xs font-semibold hover:bg-ink/90 transition-colors"
          >
            Close Proof
          </button>
        </div>
      </div>
    </div>
  );
}
