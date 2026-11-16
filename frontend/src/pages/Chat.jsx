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
    <div className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden relative">
      {/* ---------------- CENTER: LLM CONVERSATION COLUMN ---------------- */}
      <section className="flex-1 flex flex-col h-full overflow-hidden bg-paper relative">
        {/* Banner above conversation: "One Language to Another, Without Losing the Meaning" */}
        <div className="py-2.5 px-6 border-b border-ink/6 bg-card/40 backdrop-blur-sm text-center">
          <p className="font-serif text-sm sm:text-base font-medium italic text-ink tracking-tight">
            "One Language to Another, Without Losing the Meaning"
          </p>
          <span className="text-[10px] font-mono text-ink/40 tracking-wider uppercase block mt-0.5">
            Strict Phonetic Transliteration · Sacred Spans Preserved Byte-for-Byte
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-4 max-w-3xl w-full mx-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-6">
              <StarterChips onSelectChip={onSend} />
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onOpenProof={() => {}}
                onSelectToken={(token) => setInspectedToken(token)}
              />
            ))
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
      />
    </div>
  );
}
