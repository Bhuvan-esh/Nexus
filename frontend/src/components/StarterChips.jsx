import React from "react";

const STARTER_CHIPS = [
  { label: "Hello", type: "Common word" },
  { label: "Good morning", type: "Multi-word phrase" },
  { label: "Machine learning", type: "Technical vocabulary" },
  { label: "Bangalore", type: "Proper noun (City)" },
  { label: "Bhuvanesh", type: "Personal name" },
  { label: "https://example.com", type: "Protected span" },
];

export function StarterChips({ onSelectChip }) {
  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4 text-center">
      {/* Scope Guardrail Box */}
      <div className="mb-8 p-4 rounded-card bg-card border border-ink/8 shadow-card text-left">
        <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-accent mb-1">
          Critical Scope Guardrail
        </div>
        <p className="text-xs text-ink/80 leading-relaxed">
          NEXUS performs <strong>phonetic transliteration</strong>, NOT semantic translation.
          <span className="block mt-1 font-mono text-[11px] bg-code p-1.5 rounded border border-ink/8">
            "Hello" → <span className="font-kannada font-bold text-sm">ಹೆಲ್ಲೋ</span> (never "ನಮಸ್ಕಾರ")
          </span>
        </p>
      </div>

      <div className="text-[11px] font-mono tracking-wider uppercase text-ink/40 mb-3">
        Illustrative Transliteration Matrix
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        {STARTER_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectChip(chip.label)}
            className="flex flex-col items-center px-4 py-2 rounded-card bg-card border border-ink/8 shadow-sm hover:border-accent/40 hover:shadow-card hover:-translate-y-0.5 transition-all text-left"
          >
            <span className="text-sm font-medium text-ink">{chip.label}</span>
            <span className="text-[10px] font-mono text-ink/40 uppercase tracking-tight">
              {chip.type}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
