import React, { useState } from "react";
import {
  Home,
  BookOpen,
  Mic,
  ShieldCheck,
  Search,
  Sliders,
  BarChart2,
  BookMarked,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  ExternalLink,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderOpen
} from "lucide-react";

export function Sidebar({
  conversations = [],
  activeId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onToggle,
  currentUser,
  activeFeature = "home",
  onSelectFeature,
  onOpenSettings,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (chat, e) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEditing = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Structured Core Features List (styled like the attached design)
  const coreFeatures = [
    { id: "home", label: "Home Studio", icon: Home, badge: null },
    { id: "reader", label: "Smart Reader", icon: BookOpen, badge: "Docs" },
    { id: "voice", label: "Living Voice", icon: Mic, badge: "Live" },
    { id: "proof", label: "Proof Trace", icon: ShieldCheck, badge: "7-Stage" },
    { id: "inspector", label: "Token Inspector", icon: Search, badge: "P/L/X" },
    { id: "lab", label: "Selection Lab", icon: Sliders, badge: "α,β,τ" },
    { id: "evaluation", label: "Benchmarks", icon: BarChart2, badge: "CER/WER" },
    { id: "lexicon", label: "Preserved Lexicon", icon: BookMarked, badge: "Rules" },
  ];

  return (
    <>
      {/* Mobile Collapse Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-20 z-20 transition-all duration-300 p-1.5 rounded-r-lg bg-card border border-l-0 border-ink/8 shadow-sm hover:bg-paper md:hidden ${
          isOpen ? "left-64" : "left-0"
        }`}
        title={isOpen ? "Collapse Sidebar" : "Open Navigation"}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4 text-ink/60" /> : <ChevronRight className="w-4 h-4 text-ink/60" />}
      </button>

      {/* Main Left Navigation Sidebar */}
      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-30 w-64 bg-card border-r border-ink/8 flex flex-col transition-all duration-300 ${
          isOpen ? "translate-x-0 shadow-lg md:shadow-none" : "-translate-x-full md:translate-x-0 md:w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-ink/8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-paper border border-ink/8 shadow-sm flex items-center justify-center">
              <span className="font-serif font-bold text-accent text-lg">A</span>
              <span className="font-kannada font-bold text-ink text-sm ml-0.5">ಕ</span>
            </div>
            <div>
              <span className="font-serif font-bold text-base tracking-tight text-ink block leading-none">
                NEXUS
              </span>
              <span className="text-[10px] font-mono text-accent font-semibold tracking-wider uppercase">
                Living Voice
              </span>
            </div>
          </div>

          <button
            onClick={onNewChat}
            className="p-1.5 rounded-lg bg-paper border border-ink/8 text-ink hover:text-accent hover:border-accent/40 shadow-sm transition-all"
            title="Start New Transliteration"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Middle: Features & Sessions */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {/* Section 1: Structured Workspace Features */}
          <div>
            <span className="block px-2 text-[10px] font-mono font-bold tracking-wider uppercase text-ink/40 mb-1.5">
              Workspace Features
            </span>
            <div className="space-y-0.5">
              {coreFeatures.map((feat) => {
                const IconComponent = feat.icon;
                const isActive = activeFeature === feat.id;

                return (
                  <button
                    key={feat.id}
                    onClick={() => onSelectFeature(feat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-accent/10 text-accent font-semibold shadow-xs"
                        : "text-ink/70 hover:bg-paper hover:text-ink"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? "text-accent" : "text-ink/50"
                        }`}
                      />
                      <span className="truncate">{feat.label}</span>
                    </div>

                    {feat.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                          isActive
                            ? "bg-accent/20 text-accent font-bold"
                            : "bg-ink/5 text-ink/40"
                        }`}
                      >
                        {feat.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Transliteration Sessions History */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-ink/40">
                Recent Sessions
              </span>
              <span className="text-[9px] font-mono text-ink/40 bg-code px-1.5 py-0.5 rounded">
                {conversations.length}
              </span>
            </div>

            <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
              {conversations.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-ink/40 italic">
                  No saved sessions yet
                </div>
              ) : (
                conversations.map((chat) => {
                  const isActive = chat.id === activeId && activeFeature === "home";
                  const isEditing = chat.id === editingId;

                  return (
                    <div
                      key={chat.id}
                      onClick={() => onSelectChat(chat.id)}
                      className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                        isActive
                          ? "bg-paper text-ink font-semibold border border-ink/8 shadow-xs"
                          : "text-ink/65 hover:bg-paper/70 hover:text-ink"
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 bg-card border border-ink/20 rounded px-1.5 py-0.5 text-xs text-ink focus:outline-none focus:border-accent"
                            autoFocus
                          />
                          <button onClick={(e) => saveEditing(chat.id, e)} className="p-1 text-protected">
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={cancelEditing} className="p-1 text-ink/40">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="truncate flex-1 pr-1 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-ink/30 flex-shrink-0" />
                            <span className="truncate text-[11px]">{chat.title || "Untitled"}</span>
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={(e) => startEditing(chat, e)}
                              className="p-0.5 text-ink/40 hover:text-ink"
                              title="Rename"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChat(chat.id);
                              }}
                              className="p-0.5 text-ink/40 hover:text-accent"
                              title="Delete"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Sidebar: GitHub Link + User Profile with Settings Gear */}
        <div className="border-t border-ink/8 p-3 space-y-2 bg-paper/40">
          {/* GitHub link (like in OpenDocs Voice screenshot) */}
          <a
            href="https://github.com/Bhuvan-esh/Nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink/60 hover:text-ink hover:bg-paper transition-all"
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub Repository</span>
            </div>
            <ExternalLink className="w-3 h-3 text-ink/40" />
          </a>

          {/* User Profile Card with Settings Button */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-ink/8 shadow-xs">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left group"
              title="Click to Open Settings & Profile"
            >
              <div className="w-7 h-7 rounded-full bg-accent text-card font-serif font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                {currentUser?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="truncate min-w-0">
                <span className="block text-xs font-semibold text-ink truncate group-hover:text-accent transition-colors">
                  {currentUser?.username || "NEXUS User"}
                </span>
                <span className="block text-[10px] text-ink/40 font-mono truncate">
                  {currentUser?.email || ""}
                </span>
              </div>
            </button>

            {/* Gear Button to Open Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-ink/40 hover:text-ink hover:bg-paper transition-colors"
              title="Account Settings & Log Out"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
