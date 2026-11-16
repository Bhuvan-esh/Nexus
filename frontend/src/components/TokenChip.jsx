import React from "react";
import { AlertTriangle } from "lucide-react";

export function TokenChip({ token, onSelectToken }) {
  const isAmber = !token.confident;

  return (
    <button
      type="button"
      onClick={() => onSelectToken(token)}
      className={`group relative inline-flex flex-col items-center px-2 py-1 rounded-lg transition-all text-center ${
        isAmber
          ? "bg-attention/10 border border-attention/30 hover:border-attention"
          : "hover:bg-paper border border-transparent hover:border-ink/8"
      }`}
      title={`Token: ${token.source} ➔ ${token.kannada} (Score: ${(token.score * 100).toFixed(0)}%)`}
    >
      {/* English source word on top */}
      <span className="text-[11px] text-ink/50 font-normal leading-tight group-hover:text-ink/80 transition-colors">
        {token.source}
      </span>

      {/* Kannada target token below */}
      <span
        className={`font-kannada text-2xl font-medium tracking-normal ${
          isAmber ? "text-attention" : "text-ink"
        }`}
      >
        {token.kannada}
      </span>

      {/* Fail-closed Amber Warning (F5) */}
      {isAmber && (
        <span className="flex items-center gap-0.5 mt-0.5 text-[8px] font-mono font-bold text-attention tracking-wider uppercase">
          <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
          Low Conf
        </span>
      )}
    </button>
  );
}
