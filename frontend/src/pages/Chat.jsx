import React, { useRef, useEffect } from "react";
import { ChatMessage } from "../components/ChatMessage";
import { Composer } from "../components/Composer";
import { StarterChips } from "../components/StarterChips";
import { PipelineSheet } from "../components/PipelineSheet";
import { TokenInspector } from "../components/TokenInspector";

export function Chat({
  messages = [],
  isProcessing,
  completedStages,
  onSend,
  selectedProofMsg,
  setSelectedProofMsg,
  inspectedToken,
  setInspectedToken,
  onSelectCandidate,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <StarterChips onSelectChip={onSend} />
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onOpenProof={() => setSelectedProofMsg(msg)}
              onSelectToken={(token) => setInspectedToken(token)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer at Bottom */}
      <div className="border-t border-ink/8 bg-card/40 backdrop-blur-sm">
        <Composer
          onSend={onSend}
          isProcessing={isProcessing}
          completedStages={completedStages}
        />
      </div>

      {/* Pipeline Proof Sheet Modal */}
      <PipelineSheet
        isOpen={Boolean(selectedProofMsg)}
        message={selectedProofMsg}
        onClose={() => setSelectedProofMsg(null)}
      />

      {/* Token Inspector Modal */}
      <TokenInspector
        isOpen={Boolean(inspectedToken)}
        token={inspectedToken}
        onClose={() => setInspectedToken(null)}
        onSelectCandidate={onSelectCandidate}
      />
    </div>
  );
}
