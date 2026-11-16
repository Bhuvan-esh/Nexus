import React, { useState, useEffect } from "react";
import { Sparkles, Sliders, BarChart2, MessageSquare } from "lucide-react";

export function Navbar({ activePage, onNavigate, onNewChat, hasMessages }) {
  const [glyph, setGlyph] = useState("A");
  const [morphing, setMorphing] = useState(false);

  // Periodic subtle morph A -> ಕ
  const handleMorph = () => {
    setMorphing(true);
    setTimeout(() => {
      setGlyph((prev) => (prev === "A" ? "ಕ" : "A"));
      setMorphing(false);
    }, 150);
  };

  return (
    <header className="h-16 border-b border-ink/8 px-6 flex items-center justify-between bg-card/60 backdrop-blur-md sticky top-0 z-30">
      {/* Brand & Animated Glyph Mark */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleMorph}
          className="w-9 h-9 rounded-lg bg-card border border-ink/8 flex items-center justify-center shadow-card hover:border-accent/40 transition-colors"
          title="NEXUS Brand Mark (Click to toggle A ➔ ಕ)"
        >
          <span
            className={`font-serif text-lg font-bold text-accent transition-opacity duration-150 ${
              morphing ? "opacity-0" : "opacity-100"
            }`}
          >
            {glyph}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-serif text-xl font-semibold tracking-wide text-ink">
            NEXUS
          </span>
          <span className="text-[10px] font-mono tracking-wider uppercase bg-code text-ink/70 px-2 py-0.5 rounded-full border border-ink/8">
            Phonetic Engine
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 bg-code/50 p-1 rounded-xl border border-ink/8">
        <button
          onClick={() => onNavigate("chat")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activePage === "chat" || activePage === "home"
              ? "bg-card text-ink shadow-sm"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat
        </button>
        <button
          onClick={() => onNavigate("lab")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activePage === "lab"
              ? "bg-card text-ink shadow-sm"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Lab
        </button>
        <button
          onClick={() => onNavigate("evaluation")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activePage === "evaluation"
              ? "bg-card text-ink shadow-sm"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Benchmark
        </button>
      </nav>

      {/* Quick Action */}
      <div className="flex items-center gap-2">
        {hasMessages && (
          <button
            onClick={onNewChat}
            className="text-xs font-medium px-3 py-1.5 rounded-pill bg-card border border-ink/8 text-ink hover:bg-paper transition-colors"
          >
            New Transliteration
          </button>
        )}
      </div>
    </header>
  );
}
