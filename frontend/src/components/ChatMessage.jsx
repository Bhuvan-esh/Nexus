import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { InterlinearView } from "./InterlinearView";
import { HonestyStrip } from "./HonestyStrip";

export function ChatMessage({ message, onOpenProof, onSelectToken }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end my-4 animate-fade-in">
        <div className="max-w-[85%] sm:max-w-xl bg-code border border-ink/8 rounded-card px-4 py-3 shadow-sm">
          <span className="block text-[9px] font-mono tracking-wider uppercase text-ink/40 mb-1">
            Source English
          </span>
          <p className="text-[15px] text-ink leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  // NEXUS Response Card
  return (
    <div className="flex justify-start my-4 animate-fade-in w-full">
      <div className="w-full max-w-2xl bg-card border border-ink/8 rounded-card p-5 shadow-card hover:border-ink/15 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-ink/6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-accent">
              Kannada Output
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-mono text-ink/50 hover:text-ink px-2 py-0.5 rounded hover:bg-paper transition-colors"
            title="Copy Kannada Script"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-protected" />
                <span className="text-protected">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Display-size Kannada First Line */}
        <div className="font-kannada text-3xl font-medium text-ink my-2 leading-relaxed">
          {message.text || (message.isStreaming ? (
            <span className="text-ink/30 italic text-xl">Resolving phonetics...</span>
          ) : "")}
        </div>

        {/* Interlinear View (English tokens above, Kannada tokens below) */}
        {message.tokens && message.tokens.length > 0 && (
          <InterlinearView
            tokens={message.tokens}
            onSelectToken={onSelectToken}
          />
        )}

        {/* Quiet Honesty Strip */}
        {!message.isStreaming && (
          <HonestyStrip
            summary={message.summary}
            totalMs={message.totalMs}
            cached={message.cached}
            onOpenProof={onOpenProof}
          />
        )}
      </div>
    </div>
  );
}
