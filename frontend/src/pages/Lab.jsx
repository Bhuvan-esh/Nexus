import React, { useState } from "react";
import { Sliders, RefreshCw } from "lucide-react";

export function Lab() {
  const [alpha, setAlpha] = useState(0.5);
  const [beta, setBeta] = useState(0.5);
  const [gamma, setGamma] = useState(0.0);
  const [tau, setTau] = useState(0.70);
  const [testWord, setTestWord] = useState("Hello");

  // Adjust beta when alpha changes if gamma is 0 (constraint: alpha + beta = 1)
  const handleAlphaChange = (val) => {
    const a = parseFloat(val);
    setAlpha(a);
    if (gamma === 0) {
      setBeta(parseFloat((1.0 - a).toFixed(2)));
    }
  };

  const handleGammaChange = (val) => {
    const g = parseFloat(val);
    setGamma(g);
  };

  // Mock score computation for testWord
  const P = 0.95;
  const L = 1.0;
  const X = 0.0;
  const computedScore = alpha * P + beta * L + gamma * X;
  const isConfident = computedScore >= tau;

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="w-5 h-5 text-accent" />
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Parameter Tuning Lab (F16)
          </h2>
        </div>
        <p className="text-sm text-ink/70">
          Interactively tune candidate selection weights and the fail-closed confidence threshold τ.
        </p>
      </div>

      <div className="bg-card rounded-card border border-ink/8 p-6 shadow-card space-y-6">
        {/* Mathematical formulation banner */}
        <div className="p-3 bg-code rounded-lg font-mono text-xs text-ink/80 border border-ink/8">
          Score(k | w, ctx) = α·P(k, w) + β·L(k, w) + γ·X(k, ctx)
          <span className="block mt-1 text-[11px] text-ink/50">
            Constraint: α + β = 1.0 (when γ = 0 for context-free baseline)
          </span>
        </div>

        {/* Alpha Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="font-semibold text-ink">Phonetic Weight (α)</span>
            <span className="text-accent font-bold">{alpha.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={alpha}
            onChange={(e) => handleAlphaChange(e.target.value)}
            className="w-full accent-accent cursor-pointer"
          />
        </div>

        {/* Beta Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="font-semibold text-ink">Lexical Weight (β)</span>
            <span className="text-accent font-bold">{beta.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={beta}
            onChange={(e) => setBeta(parseFloat(e.target.value))}
            className="w-full accent-accent cursor-pointer"
          />
        </div>

        {/* Gamma Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="font-semibold text-ink">Contextual Weight (γ)</span>
            <span className="text-accent font-bold">{gamma.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={gamma}
            onChange={(e) => handleGammaChange(e.target.value)}
            className="w-full accent-accent cursor-pointer"
          />
        </div>

        {/* Tau Slider */}
        <div className="space-y-2 pt-2 border-t border-ink/8">
          <div className="flex justify-between text-xs font-mono">
            <span className="font-semibold text-ink">Confidence Threshold (τ)</span>
            <span className="text-attention font-bold">{tau.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="0.95"
            step="0.05"
            value={tau}
            onChange={(e) => setTau(parseFloat(e.target.value))}
            className="w-full accent-attention cursor-pointer"
          />
          <p className="text-[11px] text-ink/50">
            Tokens scoring below τ trigger the fail-closed amber warning flag.
          </p>
        </div>

        {/* Live Simulation Card */}
        <div className="p-4 rounded-card bg-paper border border-ink/8 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink/50 block">
            Live Formulation Preview
          </span>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={testWord}
              onChange={(e) => setTestWord(e.target.value)}
              className="bg-card border border-ink/15 rounded-input px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
              placeholder="Test English word..."
            />
            <span className="text-ink/40">➔</span>
            <span className="font-kannada text-2xl font-semibold text-ink">ಹೆಲ್ಲೋ</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-ink/6">
            <span>Calculated Score:</span>
            <span className="font-bold text-ink">{(computedScore * 100).toFixed(1)}%</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span>Status:</span>
            {isConfident ? (
              <span className="text-protected font-bold">✓ Confident (≥ τ)</span>
            ) : (
              <span className="text-attention font-bold">▲ Fail-Closed Amber (&lt; τ)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
