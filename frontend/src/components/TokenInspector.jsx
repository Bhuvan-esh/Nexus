import React from "react";
import { X, Check } from "lucide-react";
import { SourcePill } from "./SourcePill";

export function TokenInspector({ token, isOpen, onClose, onSelectCandidate }) {
  if (!isOpen || !token) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card border border-ink/10 rounded-t-2xl sm:rounded-card p-6 max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ink/8">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink/50 block">
              Token Inspector
            </span>
            <h3 className="font-serif text-xl font-semibold text-ink">
              "{token.source}"
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink/40 hover:text-ink hover:bg-paper"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Selected Word */}
        <div className="py-4 text-center bg-paper rounded-card border border-ink/8 my-3">
          <span className="font-kannada text-4xl text-ink font-semibold block mb-2">
            {token.kannada}
          </span>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {(token.origin || ["Phonetic rules"]).map((org, i) => (
              <SourcePill key={i} label={org} />
            ))}
            {!token.confident && (
              <span className="px-2 py-0.5 rounded-pill bg-attention/15 text-attention text-[10px] font-mono font-bold uppercase border border-attention/30">
                Low Confidence
              </span>
            )}
          </div>
        </div>

        {/* Formula Explainer */}
        <div className="text-[11px] font-mono text-ink/50 mb-2">
          Score = α·P + β·L + γ·X (α=0.5, β=0.5, γ=0.0)
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {(token.candidates || []).map((cand, idx) => {
            const isSelected = cand.kannada === token.kannada;

            return (
              <div
                key={idx}
                onClick={() => onSelectCandidate && onSelectCandidate(cand.kannada)}
                className={`p-3 rounded-card border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-protected/5 border-protected/40 shadow-sm"
                    : "bg-paper hover:border-ink/20 border-ink/8"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-ink/40">#{idx + 1}</span>
                    <span className="font-kannada text-xl font-semibold text-ink">
                      {cand.kannada}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-semibold text-protected flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[3]" /> Active
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-xs font-bold text-ink">
                    {cand.rawScore !== undefined ? `Raw ${cand.rawScore} · ` : ""}
                    {(cand.score * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Breakdown P, L, X */}
                <div className="grid grid-cols-3 gap-1 bg-code p-1.5 rounded-lg text-center font-mono text-[10px]">
                  <div>
                    <span className="text-ink/40 block text-[9px]">PHONETIC (P)</span>
                    <span className="font-semibold text-ink">{cand.P.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-ink/40 block text-[9px]">LEXICAL (L)</span>
                    <span className="font-semibold text-ink">{cand.L.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-ink/40 block text-[9px]">CONTEXT (X)</span>
                    <span className="font-semibold text-ink">{cand.X.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-ink/8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-ink text-card rounded-input text-xs font-semibold hover:bg-ink/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
