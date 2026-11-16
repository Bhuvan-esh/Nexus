import React from "react";
import { ArrowRight } from "lucide-react";

export function HonestyStrip({
  summary = { tokens: 0, protected: 0, altered: 0, low_confidence: 0 },
  totalMs = 0,
  cached = false,
  onOpenProof,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-3 border-t border-ink/8 text-[11px] font-mono text-ink/60">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span>{summary.tokens || 0} tokens</span>
        <span className="text-ink/20">·</span>
        <span>{summary.protected || 0} protected</span>
        <span className="text-ink/20">·</span>
        <span>{summary.altered || 0} altered</span>
        <span className="text-ink/20">·</span>
        <span
          className={
            summary.low_confidence > 0 ? "text-attention font-semibold" : ""
          }
        >
          {summary.low_confidence || 0} low conf
        </span>
        <span className="text-ink/20">·</span>
        <span>{totalMs || 0} ms</span>
      </div>

      <div className="flex items-center gap-2">
        {cached && (
          <span className="bg-protected/10 text-protected text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-protected/20">
            Offline · cached
          </span>
        )}

        <button
          onClick={onOpenProof}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline focus:outline-none"
        >
          <span>Proof</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
