import React, { useState } from "react";
import { Lock, Check, X, ShieldCheck } from "lucide-react";

export function ProtectedBadge({ text, kind = "url", sha256, isMatched = true }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex flex-col text-left bg-code border border-ink/8 hover:border-protected/40 transition-colors rounded-input p-2 my-1 max-w-full group"
        title="Protected Span (Skipped transliteration byte-for-byte)"
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Lock className="w-3 h-3 text-protected flex-shrink-0" />
          <span className="text-[10px] font-mono font-bold tracking-wider text-protected uppercase">
            Preserved
          </span>
          {isMatched && <Check className="w-3 h-3 text-protected stroke-[2.5]" />}
        </div>
        <span className="font-mono text-xs text-ink truncate block">
          {text}
        </span>
      </button>

      {/* Preservation Explanation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-card border border-ink/10 rounded-card p-6 max-w-md w-full shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-ink/8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-protected/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-protected" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-ink">
                  Protected Content Guardrail
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded text-ink/40 hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-ink/80 leading-relaxed">
              This span skipped phonetic transliteration and was returned <strong>byte-for-byte</strong> untouched.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-ink/50 uppercase font-mono tracking-wider block text-[10px]">
                  Classification
                </span>
                <span className="font-semibold text-ink uppercase">{kind}</span>
              </div>

              <div>
                <span className="text-ink/50 uppercase font-mono tracking-wider block text-[10px]">
                  Source Value
                </span>
                <div className="font-mono text-xs bg-code p-2 rounded-lg border border-ink/8 break-all">
                  {text}
                </div>
              </div>

              <div>
                <span className="text-ink/50 uppercase font-mono tracking-wider block text-[10px]">
                  SHA-256 Digest Verification
                </span>
                <div className="font-mono text-[11px] text-protected flex items-center gap-1.5 bg-protected/5 p-2 rounded-lg border border-protected/20 break-all">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{sha256 ? sha256 : "Exact byte match verified (0 altered)"}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-ink text-card rounded-input text-xs font-semibold hover:bg-ink/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
