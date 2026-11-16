import React, { useRef, useEffect } from "react";
import { ChatMessage } from "../components/ChatMessage";
import { Composer } from "../components/Composer";
import { StarterChips } from "../components/StarterChips";
import { FeaturesPanel } from "../components/FeaturesPanel";

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
  selectedFeature = "proof",
  onSelectFeature,
  onRegenerate,
  onSavePhrase,
  savedPhrases = [],
  onUseAlternate,
  onSuggestCorrection,
  displayPreferences = {
    showPipeline: true,
    showConfidenceFlags: true,
    showInterlinear: true,
    kannadaTextSize: "normal",
  },
}) {
  const bottomRef = useRef(null);

  // Latest NEXUS message for the features proof panel
  const latestNexusMsg = messages
    .slice()
    .reverse()
    .find((m) => m.role === "nexus") || null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden relative">
      {/* ---------------- CENTER COLUMN: CONVERSATION & EMPTY STATE ---------------- */}
      <section className="flex-1 flex flex-col h-full overflow-hidden bg-paper relative">
        {/* Scrollable conversation thread; pb-36 ensures 140px clearance above bottom composer (§3.A.2) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-3xl w-full mx-auto pb-36 space-y-6">
          {/* EMPTY STATE (Only visible when no messages exist) */}
          {messages.length === 0 ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 my-auto">
              {/* Direction Indicator Pill (English -> Kannada only, §1) */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-card border border-ink/10 shadow-xs">
                <span className="type-label">English</span>
                <span className="text-accent font-bold text-xs">➔</span>
                <span className="font-kannada font-semibold text-xs text-ink">ಕನ್ನಡ</span>
              </div>

              {/* Strict Non-Audio Hero Headline (§3.A.5) */}
              <div className="space-y-2 max-w-xl">
                <h1 className="type-display text-ink tracking-tight">
                  Write English sounds. Get Kannada script.
                </h1>
                <p className="type-body text-ink/70 mx-auto">
                  Anything that shouldn't change comes back untouched.
                </p>
              </div>

              {/* Starter Chips: Quick seed examples */}
              <div className="w-full max-w-lg pt-4">
                <StarterChips onSelectChip={onSend} />
              </div>
            </div>
          ) : (
            /* ACTIVE CONVERSATION THREAD */
            <div className="space-y-5 animate-fade-in">
              {messages.map((msg) => {
                const isSaved = savedPhrases.some(
                  (p) => p.kannada === msg.text || (msg.sourceText && p.source === msg.sourceText)
                );
                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isSaved={isSaved}
                    onOpenProof={() => onSelectFeature && onSelectFeature("proof")}
                    onSelectToken={(token) => {
                      setInspectedToken(token);
                      if (onSelectFeature) onSelectFeature("inspector");
                    }}
                    onRegenerate={onRegenerate}
                    onSavePhrase={onSavePhrase}
                    onUseAlternate={onUseAlternate}
                    onSuggestCorrection={onSuggestCorrection}
                  />
                );
              })}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* SINGLE INPUT: Fixed Bottom Composer Box (§3.A.1) */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-ink/8 bg-paper/85 backdrop-blur-md z-10">
          <Composer
            onSend={onSend}
            isProcessing={isProcessing}
            completedStages={completedStages}
          />
        </div>
      </section>

      {/* ---------------- RIGHT SIDE: DOCKED FEATURES PANEL ---------------- */}
      {displayPreferences.showPipeline && (
        <FeaturesPanel
          activeProofMsg={latestNexusMsg}
          inspectedToken={inspectedToken}
          onCloseToken={() => setInspectedToken(null)}
          onSelectCandidate={onSelectCandidate}
          alpha={tuningParams.alpha}
          beta={tuningParams.beta}
          gamma={tuningParams.gamma}
          tau={tuningParams.tau}
          onUpdateParams={onUpdateTuningParams}
          selectedTab={selectedFeature}
          onTabChange={(tab) => onSelectFeature && onSelectFeature(tab)}
        />
      )}
    </div>
  );
}
