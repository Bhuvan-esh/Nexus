import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  MessageSquare,
  Sliders,
  ShieldCheck,
  BarChart2,
  BookMarked,
  Settings,
  Sparkles,
  CornerDownLeft,
  X
} from "lucide-react";

export function CommandPalette({
  isOpen,
  onClose,
  conversations = [],
  onSelectChat,
  onNewChat,
  onSelectFeature,
  onSelectExample,
  onOpenSettings,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(false); // Can be toggled from App
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const staticActions = [
    {
      id: "new-chat",
      category: "Actions",
      title: "New Transliteration",
      subtitle: "Start a fresh Kannada transliteration session",
      icon: Plus,
      run: () => {
        onNewChat();
        onClose();
      },
    },
    {
      id: "tab-proof",
      category: "Features",
      title: "Open 7-Stage Proof Trace",
      subtitle: "Inspect pipeline execution stages and intermediate outputs",
      icon: ShieldCheck,
      run: () => {
        onSelectFeature("proof");
        onClose();
      },
    },
    {
      id: "tab-inspector",
      category: "Features",
      title: "Open Token Factor Inspector",
      subtitle: "View P, L, X scores and candidate lattice rankings",
      icon: Sparkles,
      run: () => {
        onSelectFeature("inspector");
        onClose();
      },
    },
    {
      id: "tab-tuning",
      category: "Features",
      title: "Open Tuning Lab",
      subtitle: "Adjust α, β, γ weights and confidence threshold τ",
      icon: Sliders,
      run: () => {
        onSelectFeature("lab");
        onClose();
      },
    },
    {
      id: "tab-metrics",
      category: "Features",
      title: "Open Empirical Metrics",
      subtitle: "Review CER, WER, and latency benchmark scores",
      icon: BarChart2,
      run: () => {
        onSelectFeature("evaluation");
        onClose();
      },
    },
    {
      id: "tab-lexicon",
      category: "Features",
      title: "Open Preserved Lexicon",
      subtitle: "Search protected entities, code spans, and dictionary terms",
      icon: BookMarked,
      run: () => {
        onSelectFeature("lexicon");
        onClose();
      },
    },
    {
      id: "open-settings",
      category: "Settings",
      title: "Settings & Profile",
      subtitle: "Update username, view DB status, or sign out",
      icon: Settings,
      run: () => {
        onOpenSettings();
        onClose();
      },
    },
  ];

  const exampleActions = [
    { label: "Hello", desc: "Common greeting → ಹೆಲ್ಲೋ" },
    { label: "Good morning", desc: "Compound phrase → ಗುಡ್ ಮಾರ್ನಿಂಗ್" },
    { label: "Machine learning", desc: "Technical term → ಮಷೀನ್ ಲರ್ನಿಂಗ್" },
    { label: "Bangalore", desc: "Proper noun → ಬ್ಯಾಂಗಲೋರ್" },
    { label: "Bhuvanesh", desc: "Personal name → ಭುವನೇಶ್" },
    { label: "https://example.com", desc: "Protected URL → Preserved byte-exact" },
  ].map((ex) => ({
    id: `ex-${ex.label}`,
    category: "Starter Examples",
    title: `Transliterate "${ex.label}"`,
    subtitle: ex.desc,
    icon: Sparkles,
    run: () => {
      onSelectExample(ex.label);
      onClose();
    },
  }));

  const chatActions = conversations.map((c) => ({
    id: `chat-${c.id}`,
    category: "Recent Chats",
    title: c.title || "Untitled Chat",
    subtitle: new Date(c.timestamp || Date.now()).toLocaleDateString(),
    icon: MessageSquare,
    run: () => {
      onSelectChat(c.id);
      onClose();
    },
  }));

  const allItems = [...staticActions, ...exampleActions, ...chatActions];
  const q = query.trim().toLowerCase();
  const filtered = q
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      )
    : allItems;

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].run();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-ink/30 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-card border border-ink/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-ink/8 gap-3 bg-paper/50">
          <Search className="w-4 h-4 text-ink/40 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, search history, or choose an example..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-ink/40 bg-card border border-ink/10 px-1.5 py-0.5 rounded shadow-xs">
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 rounded text-ink/30 hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-ink/40">
              No matching commands or chats for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.run}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-paper text-ink border border-ink/8 font-medium shadow-xs"
                      : "text-ink/70 hover:bg-paper/50 hover:text-ink"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-accent/10 text-accent" : "bg-ink/5 text-ink/50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="truncate text-ink font-semibold flex items-center gap-1.5">
                        <span>{item.title}</span>
                        <span className="text-[9px] font-mono font-normal uppercase text-ink/40 px-1.5 py-0.2 rounded bg-ink/5">
                          {item.category}
                        </span>
                      </div>
                      <div className="truncate text-[11px] text-ink/50">{item.subtitle}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <CornerDownLeft className="w-3.5 h-3.5 text-accent flex-shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-paper/60 border-t border-ink/8 flex items-center justify-between text-[10px] font-mono text-ink/40">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>NEXUS Quick Palette</span>
        </div>
      </div>
    </div>
  );
}
