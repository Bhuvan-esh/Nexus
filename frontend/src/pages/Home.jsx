import React from "react";
import { StarterChips } from "../components/StarterChips";

export function Home({ onSelectExample }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 animate-fade-in">
      <div className="text-center max-w-xl mx-auto mb-4">
        <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-ink mb-3">
          Sounds arrive. Kannada returns.
        </h1>
        <p className="text-sm text-ink/70 leading-relaxed max-w-md mx-auto">
          An NLP-driven English-to-Kannada phonetic transliteration system with byte-exact sacred content preservation.
        </p>
      </div>

      <StarterChips onSelectChip={onSelectExample} />
    </div>
  );
}
