import React, { useState } from "react";
import { Copy, Check, RotateCw, Star, Shuffle, MessageSquarePlus, X } from "lucide-react";
import { InterlinearView } from "./InterlinearView";
import { HonestyStrip } from "./HonestyStrip";

export function ChatMessage({
  message,
  onOpenProof,
  onSelectToken,
  onRegenerate,
  onSavePhrase,
  isSaved = false,
  onUseAlternate,
  onSuggestCorrection,
}) {
  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [justSwapped, setJustSwapped] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionInput, setCorrectionInput] = useState("");

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleSave = () => {
    if (onSavePhrase && message.text) {
      onSavePhrase({
        source: message.sourceText || message.text,
        kannada: message.text,
        timestamp: Date.now(),
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  const handleAlternate = () => {
    if (onUseAlternate) {
      onUseAlternate(message);
      setJustSwapped(true);
      setTimeout(() => setJustSwapped(false), 1800);
    }
  };

  const handleSendCorrection = (e) => {
    e.preventDefault();
    if (!correctionInput.trim() || !onSuggestCorrection) return;
    onSuggestCorrection({
      source: message.sourceText || message.text,
      current: message.text,
      suggested: correctionInput.trim(),
      timestamp: Date.now(),
    });
    setCorrectionInput("");
    setShowCorrectionModal(false);
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end my-4 animate-fade-in">
        <div className="max-w-[85%] sm:max-w-xl bg-code border border-ink/8 rounded-card px-4 py-3 shadow-2xs">
          <span className="block text-[9px] font-mono tracking-wider uppercase text-ink/40 mb-1">
            Source English
          </span>
          <p className="text-[15px] text-ink leading-relaxed whitespace-pre-wrap font-sans">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  // NEXUS Transliteration Response Card
  return (
    <div className="flex justify-start my-4 animate-fade-in w-full">
      <div className="w-full max-w-2xl bg-card border border-ink/8 rounded-card p-5 shadow-card hover:border-ink/15 transition-all">
        {/* Header with Animated Brand Mark (A -> ಕ) & Actions */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-ink/6">
          <div className="flex items-center gap-2">
            {/* Animated Brand Mark (§3.G: A -> ಕ ~300ms) */}
            <div className="w-6 h-6 rounded-md bg-paper border border-ink/8 flex items-center justify-center font-bold text-xs select-none">
              <span className="font-serif text-accent animate-pulse">A</span>
              <span className="font-kannada text-ink text-[11px] ml-0.5">ಕ</span>
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-ink/60">
              Kannada Output
            </span>
          </div>

          {/* Action Toolbar (§3.G) */}
          <div className="flex items-center gap-1">
            {/* 1. Copy (Kannada only) */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-mono text-ink/60 hover:text-ink px-2 py-1 rounded hover:bg-paper transition-colors"
              title="Copy Kannada Script"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-protected" />
                  <span className="text-protected font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* 2. Regenerate */}
            {onRegenerate && (
              <button
                onClick={() => onRegenerate(message)}
                className="flex items-center gap-1 text-[11px] font-mono text-ink/60 hover:text-ink px-2 py-1 rounded hover:bg-paper transition-colors"
                title="Regenerate Transliteration"
              >
                <RotateCw className="w-3 h-3" />
                <span>Rerun</span>
              </button>
            )}

            {/* 3. Use Alternate Candidate */}
            {onUseAlternate && message.tokens?.some((t) => t.candidates?.length > 1) && (
              <button
                onClick={handleAlternate}
                className="flex items-center gap-1 text-[11px] font-mono text-ink/60 hover:text-ink px-2 py-1 rounded hover:bg-paper transition-colors"
                title="Swap to next-ranked phonetic candidate"
              >
                {justSwapped ? (
                  <>
                    <Check className="w-3 h-3 text-protected" />
                    <span className="text-protected">Swapped</span>
                  </>
                ) : (
                  <>
                    <Shuffle className="w-3 h-3" />
                    <span>Alternate</span>
                  </>
                )}
              </button>
            )}

            {/* 4. Save to Phrasebook */}
            <button
              onClick={handleSave}
              className={`p-1 rounded hover:bg-paper transition-colors ${
                isSaved || justSaved ? "text-accent" : "text-ink/40 hover:text-ink"
              }`}
              title="Save to Personal Phrasebook"
            >
              <Star className={`w-3.5 h-3.5 ${isSaved || justSaved ? "fill-accent" : ""}`} />
            </button>

            {/* 5. Suggest Correction */}
            <button
              onClick={() => setShowCorrectionModal(true)}
              className="p-1 rounded text-ink/40 hover:text-ink hover:bg-paper transition-colors"
              title="Suggest Correction (Feedback)"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Display-size Kannada First Line (Noto Sans Kannada with generous line-height) */}
        <div className="font-kannada text-3xl font-medium text-ink my-2.5 leading-[1.8] break-words">
          {message.text || (message.isStreaming ? (
            <span className="text-ink/30 italic text-xl font-sans">Resolving phonetics...</span>
          ) : "")}
        </div>

        {/* Interlinear View (English tokens aligned above Kannada tokens below) */}
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

      {/* Suggest Correction Modal */}
      {showCorrectionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowCorrectionModal(false)}
        >
          <div
            className="bg-card border border-ink/10 rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-ink/8">
              <span className="font-serif font-semibold text-sm text-ink">
                Suggest Correction
              </span>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="p-1 rounded text-ink/40 hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-ink/70">
              Submit an alternative Kannada spelling for "{message.sourceText || message.text}". This will be saved under "My Corrections" for review.
            </p>

            <form onSubmit={handleSendCorrection} className="space-y-3">
              <input
                type="text"
                required
                value={correctionInput}
                onChange={(e) => setCorrectionInput(e.target.value)}
                placeholder="Enter suggested Kannada spelling..."
                className="w-full bg-paper border border-ink/10 rounded-input py-2 px-3 text-sm font-kannada text-ink focus:outline-none focus:border-accent"
                autoFocus
              />

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-3 py-1.5 text-xs text-ink/60 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-accent text-card text-xs font-semibold rounded-input hover:opacity-90 shadow-2xs"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
