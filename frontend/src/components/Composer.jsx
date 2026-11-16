import React, { useState, useRef, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Orb } from "./Orb";

const MAX_CHAR_LIMIT = 500;

export function Composer({ onSend, isProcessing, completedStages = 0 }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea up to ~5 lines
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 130)}px`;
    }
  }, [text]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (!val.trim()) {
      setError(null);
      return;
    }

    // Reject non-Latin characters (Devanagari, Kannada, Kanji, Arabic, etc.)
    const nonLatinRegex = /[^\u0000-\u007F\u00A0-\u00FF]/;
    if (nonLatinRegex.test(val)) {
      setError("NEXUS accepts English text in Latin script only.");
      return;
    }

    if (val.length > MAX_CHAR_LIMIT) {
      setError(`Input exceeds the maximum limit of ${MAX_CHAR_LIMIT} characters.`);
      return;
    }

    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isProcessing || error) return;
    onSend(trimmed);
    setText("");
    setError(null);
  };

  let orbState = "idle";
  if (isProcessing) {
    orbState = "thinking";
  } else if (text.trim().length > 0) {
    orbState = "typing";
  }

  const charCount = text.length;
  const isNearLimit = charCount > MAX_CHAR_LIMIT * 0.85;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
      {/* Inline Validation Alert in 'attention' amber with glyph */}
      {error && (
        <div
          role="alert"
          className="mb-2 flex items-center gap-2 px-3 py-2 rounded-input bg-attention/10 border border-attention/30 text-ink text-xs font-medium"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-attention flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative flex items-end gap-2 bg-card rounded-card border border-ink/8 p-2 pl-4 shadow-card focus-within:border-accent/40 focus-within:shadow-md transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type English text to transliterate into Kannada script..."
          rows={1}
          disabled={isProcessing}
          className="flex-1 bg-transparent border-0 resize-none py-2 text-[15px] leading-relaxed text-ink placeholder:text-ink/40 focus:outline-none focus:ring-0 max-h-32"
        />

        <div className="flex items-center gap-2 pb-0.5">
          {/* Character counter */}
          <span
            className={`text-[11px] font-mono tracking-tight transition-colors ${
              charCount > MAX_CHAR_LIMIT
                ? "text-accent font-semibold"
                : isNearLimit
                ? "text-attention font-medium"
                : "text-ink/40"
            }`}
          >
            {charCount}/{MAX_CHAR_LIMIT}
          </span>

          {/* Primary 72pt Orb */}
          <Orb
            state={orbState}
            completedStages={completedStages}
            onClick={handleSubmit}
            disabled={isProcessing || !text.trim() || !!error}
          />
        </div>
      </div>
    </div>
  );
}
