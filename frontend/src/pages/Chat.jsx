import React, { useRef, useEffect, useState } from "react";
import { ChatMessage } from "../components/ChatMessage";
import { Composer } from "../components/Composer";
import { StarterChips } from "../components/StarterChips";
import { FeaturesPanel } from "../components/FeaturesPanel";
import { Globe, ArrowRight, Sparkles } from "lucide-react";

export function Chat({
  messages = [],
  isProcessing,
  completedStages,
  onSend,
  inspectedToken,
  setInspectedToken,
  onSelectCandidate,
  tuningParams,
  onUpdateTuningParams,
  selectedFeature = "home",
  onSelectFeature,
}) {
  const bottomRef = useRef(null);
  const [quickInput, setQuickInput] = useState("");

  // Latest NEXUS message for the features proof panel
  const latestNexusMsg = messages
    .slice()
    .reverse()
    .find((m) => m.role === "nexus") || null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onSend(quickInput.trim());
      setQuickInput("");
    }
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden relative">
      {/* ---------------- CENTER COLUMN: HERO & CONVERSATION ---------------- */}
      <section className="flex-1 flex flex-col h-full overflow-hidden bg-paper relative">
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-3xl w-full mx-auto">
          {/* Hero Header (Styled like the attached OpenDocs Voice structure) */}
          <div className="text-center pt-2 pb-4 space-y-3">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phonetic voice without losing the meaning</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
              One Language to Another. <span className="text-accent italic">In your voice.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-ink/60 max-w-xl mx-auto leading-relaxed">
              Read, listen, and transliterate English sounds into living Kannada script with code-safe AI preservation and verified 7-stage proof.
            </p>
          </div>

          {/* Centered Structured Action Card (Exactly like the attached screenshot's card) */}
          {messages.length === 0 && (
            <div className="bg-card border border-ink/10 rounded-2xl p-6 sm:p-7 shadow-card space-y-4 max-w-lg mx-auto">
              <form onSubmit={handleQuickSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1.5">
                    Phonetic English Text
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={quickInput}
                      onChange={(e) => setQuickInput(e.target.value)}
                      placeholder="e.g. namaskara, bengaluru, python https://docs.python.org"
                      className="w-full bg-paper border border-ink/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-ink placeholder:text-ink/40 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1.5">
                    Transliterate into
                  </label>
                  <select
                    disabled
                    className="w-full bg-paper border border-ink/10 rounded-xl py-2.5 px-3 text-xs text-ink focus:outline-none cursor-default font-medium"
                  >
                    <option>Kannada — ಕನ್ನಡ</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-accent text-card rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? "Transliterating..." : "Start Transliterating"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Status indicator */}
              <div className="text-center pt-1">
                <span className="text-[11px] font-mono text-ink/40 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-protected" />
                  Supabase PostgreSQL Connected · Active SMTP
                </span>
              </div>
            </div>
          )}

          {/* Starter Chips (When thread is empty) */}
          {messages.length === 0 && (
            <div className="pt-2">
              <StarterChips onSelectChip={onSend} />
            </div>
          )}

          {/* Message Thread (When messages exist) */}
          {messages.length > 0 && (
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onOpenProof={() => onSelectFeature && onSelectFeature("proof")}
                  onSelectToken={(token) => {
                    setInspectedToken(token);
                    if (onSelectFeature) onSelectFeature("inspector");
                  }}
                />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Conversation Bar at Center Bottom */}
        <div className="border-t border-ink/8 bg-card/60 backdrop-blur-md">
          <Composer
            onSend={onSend}
            isProcessing={isProcessing}
            completedStages={completedStages}
          />
        </div>
      </section>

      {/* ---------------- RIGHT SIDE: FEATURES PANEL ---------------- */}
      <FeaturesPanel
        activeProofMsg={latestNexusMsg}
        inspectedToken={inspectedToken}
        onCloseToken={() => setInspectedToken(null)}
        alpha={tuningParams.alpha}
        beta={tuningParams.beta}
        gamma={tuningParams.gamma}
        tau={tuningParams.tau}
        onUpdateParams={onUpdateTuningParams}
        selectedTab={selectedFeature === "home" ? "proof" : selectedFeature}
        onTabChange={(tab) => onSelectFeature && onSelectFeature(tab)}
      />
    </div>
  );
}
