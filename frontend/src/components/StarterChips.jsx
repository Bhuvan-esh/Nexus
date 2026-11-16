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
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="flex flex-wrap justify-center gap-2.5">
        {STARTER_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectChip(chip.label)}
            className="flex flex-col items-center px-4 py-2 rounded-card bg-card border border-ink/8 shadow-2xs hover:border-accent/40 hover:shadow-card hover:-translate-y-0.5 transition-all text-left"
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
