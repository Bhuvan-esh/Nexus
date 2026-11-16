import React from "react";
import { ArrowUp, Check } from "lucide-react";

/**
 * Signature Element: The NEXUS Orb (§4)
 * - 72 pt (approx 72px) touch target
 * - Doubles as the Send button
 * - 4 states: idle, typing, thinking (7 orbiting stage particles), resolved
 */
export function Orb({ state = "idle", completedStages = 0, onClick, disabled = false }) {
  const TOTAL_STAGES = 7;

  return (
    <div className="relative w-[72px] h-[72px] flex items-center justify-center select-none">
      {/* State 2: Typing Cadence Ripple Ring */}
      {state === "typing" && (
        <div className="absolute inset-1.5 rounded-full border-2 border-accent/60 animate-ping opacity-60" />
      )}

      {/* State 4: Resolved Pulse */}
      {state === "resolved" && (
        <div className="absolute inset-0 rounded-full border-2 border-protected animate-ping opacity-80" />
      )}

      {/* State 3: Thinking Orbit with 7 Particles */}
      {state === "thinking" && (
        <div className="absolute inset-0 flex items-center justify-center animate-spin duration-[4000ms]">
          {Array.from({ length: TOTAL_STAGES }).map((_, i) => {
            const angle = (i * 2 * Math.PI) / TOTAL_STAGES;
            const radius = 30;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isCompleted = i < completedStages;

            return (
              <span
                key={i}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                className={`absolute w-2 h-2 rounded-full transition-colors duration-200 ${
                  isCompleted ? "bg-accent shadow-sm" : "bg-accent/20"
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Core Sphere Button */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || state === "thinking"}
        aria-label={`Send transliteration. Current state: ${state}`}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
          state === "idle"
            ? "bg-card border-ink/10 shadow-card hover:scale-105 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            : state === "typing"
            ? "bg-accent border-accent text-card shadow-orb scale-105"
            : state === "thinking"
            ? "bg-card border-ink/10 cursor-wait"
            : "bg-protected border-protected text-card scale-100"
        }`}
      >
        {state === "thinking" ? (
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
        ) : state === "resolved" ? (
          <Check className="w-5 h-5 stroke-[2.5]" />
        ) : (
          <ArrowUp
            className={`w-5 h-5 transition-transform duration-200 ${
              state === "typing" ? "text-card stroke-[2.5]" : "text-ink/70"
            }`}
          />
        )}
      </button>
    </div>
  );
}
