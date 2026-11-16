import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Star,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  CheckCircle2,
  Clock
} from "lucide-react";

export function Sidebar({
  conversations = [],
  activeId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePin,
  isOpen,
  onToggle,
  currentUser,
  onOpenSettings,
  savedPhrases = [],
  onSelectSavedPhrase,
  corrections = [],
  onSelectExample,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [isRail, setIsRail] = useState(false); // Desktop icon rail toggle
  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "saved" | "examples" | "corrections"

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

  // Group conversations by Date (Today, Yesterday, Earlier) and Pinned
  const groups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = conversations.filter((c) => {
      if (!query) return true;
      const titleMatch = (c.title || "").toLowerCase().includes(query);
      const messagesMatch = (c.messages || []).some((m) =>
        (m.text || "").toLowerCase().includes(query)
      );
      return titleMatch || messagesMatch;
    });

    const pinned = filtered.filter((c) => c.isPinned);
    const unpinned = filtered.filter((c) => !c.isPinned);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;

    const today = [];
    const yesterday = [];
    const earlier = [];

    unpinned.forEach((c) => {
      const time = c.timestamp || Date.now();
      if (time >= todayStart) {
        today.push(c);
      } else if (time >= yesterdayStart) {
        yesterday.push(c);
      } else {
        earlier.push(c);
      }
    });

    return { pinned, today, yesterday, earlier };
  }, [conversations, searchQuery]);

  // Test examples matrix (§3.F.3)
  const EXAMPLE_MATRIX = [
    {
      group: "Names",
      items: [
        { en: "Bhuvanesh", kn: "ಭುವನೇಶ್" },
        { en: "Bangalore", kn: "ಬ್ಯಾಂಗಲೋರ್" },
      ],
    },
    {
      group: "Tech terms",
      items: [
        { en: "Machine learning", kn: "ಮಷೀನ್ ಲರ್ನಿಂಗ್" },
        { en: "Computer", kn: "ಕಂಪ್ಯೂಟರ್" },
      ],
    },
    {
      group: "Sentences",
      items: [
        { en: "Hello", kn: "ಹೆಲ್ಲೋ" },
        { en: "Good morning", kn: "ಗುಡ್ ಮಾರ್ನಿಂಗ್" },
      ],
    },
    {
      group: "URLs / Protected Spans",
      items: [
        { en: "https://example.com", kn: "https://example.com" },
        { en: "bhuvanj06@gmail.com", kn: "bhuvanj06@gmail.com" },
      ],
    },
  ];

  const renderChatItem = (chat) => {
    const isActive = chat.id === activeId;
    const isEditing = chat.id === editingId;

    return (
      <div
        key={chat.id}
        onClick={() => onSelectChat(chat.id)}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all ${
          isActive
            ? "bg-paper text-ink font-semibold border-l-2 border-accent shadow-xs pl-2"
            : "text-ink/75 hover:bg-paper/70 hover:text-ink"
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
            <button onClick={(e) => saveEditing(chat.id, e)} className="p-0.5 text-protected hover:opacity-80">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={cancelEditing} className="p-0.5 text-ink/40 hover:text-ink">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <>
            <div className="truncate flex-1 pr-1 flex items-center gap-2">
              {chat.isPinned ? (
                <Pin className="w-3 h-3 text-accent flex-shrink-0 fill-accent/20" />
              ) : (
                <MessageSquare className="w-3 h-3 text-ink/30 flex-shrink-0" />
              )}
              <span className="truncate text-[12px]">{chat.title || "Untitled"}</span>
            </div>

            {/* Hover Actions: Pin, Rename, Delete */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTogglePin) onTogglePin(chat.id);
                }}
                className={`p-1 rounded hover:bg-card ${
                  chat.isPinned ? "text-accent" : "text-ink/40 hover:text-ink"
                }`}
                title={chat.isPinned ? "Unpin chat" : "Pin chat to top"}
              >
                <Pin className={`w-3 h-3 ${chat.isPinned ? "fill-accent" : ""}`} />
              </button>

              <button
                onClick={(e) => startEditing(chat, e)}
                className="p-1 rounded text-ink/40 hover:text-ink hover:bg-card"
                title="Rename"
              >
                <Edit2 className="w-3 h-3" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="p-1 rounded text-ink/40 hover:text-accent hover:bg-card"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderSection = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-0.5 pt-2">
        <span className="block px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-ink/40 mb-1">
          {title}
        </span>
        <div className="space-y-0.5">{items.map(renderChatItem)}</div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-20 bg-ink/20 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Sidebar: Desktop Collapsible Rail (w-16) or Full (w-64); Mobile Drawer */}
      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-30 bg-card border-r border-ink/8 flex flex-col transition-all duration-300 ${
          isRail ? "md:w-16" : "md:w-64"
        } ${
          isOpen ? "translate-x-0 w-64 shadow-xl md:shadow-none" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* ================================================================= */}
        {/* ==================== 1. ICON RAIL (COLLAPSED) =================== */}
        {/* ================================================================= */}
        {isRail ? (
          <div className="hidden md:flex flex-col items-center justify-between h-full py-3 px-2">
            <div className="space-y-3 flex flex-col items-center">
              {/* Brand Logo / Expand Trigger */}
              <button
                onClick={() => setIsRail(false)}
                className="w-10 h-10 rounded-xl bg-paper border border-ink/8 flex items-center justify-center shadow-xs hover:border-accent/40"
                title="Expand Sidebar"
              >
                <span className="font-serif font-bold text-accent text-base">A</span>
                <span className="font-kannada font-bold text-ink text-xs ml-0.5">ಕ</span>
              </button>

              {/* Ink/Outlined New Chat Button as per §3.A.3 */}
              <button
                onClick={onNewChat}
                className="w-10 h-10 rounded-xl border border-ink/15 text-ink hover:border-ink/30 hover:bg-paper shadow-2xs flex items-center justify-center transition-all"
                title="New Transliteration"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Search Trigger */}
              <button
                onClick={() => {
                  setIsRail(false);
                  setActiveTab("chats");
                }}
                className="w-9 h-9 rounded-lg text-ink/50 hover:text-ink hover:bg-paper flex items-center justify-center transition-colors"
                title="Search Chats"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Saved Phrasebook Trigger */}
              <button
                onClick={() => {
                  setIsRail(false);
                  setActiveTab("saved");
                }}
                className="w-9 h-9 rounded-lg text-ink/50 hover:text-ink hover:bg-paper flex items-center justify-center transition-colors"
                title="Saved Phrasebook"
              >
                <Star className="w-4 h-4" />
              </button>

              {/* Examples Trigger */}
              <button
                onClick={() => {
                  setIsRail(false);
                  setActiveTab("examples");
                }}
                className="w-9 h-9 rounded-lg text-ink/50 hover:text-ink hover:bg-paper flex items-center justify-center transition-colors"
                title="Test Matrix Examples"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Rail Actions */}
            <div className="space-y-2 flex flex-col items-center">
              <button
                onClick={() => setIsRail(false)}
                className="p-2 text-ink/40 hover:text-ink transition-colors"
                title="Expand Sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSettings}
                className="w-8 h-8 rounded-full bg-accent/15 text-accent font-bold text-xs flex items-center justify-center hover:scale-105 transition-transform"
                title="Settings & Profile"
              >
                {currentUser?.username?.[0]?.toUpperCase() || "U"}
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* ==================== 2. FULL EXPANDED SIDEBAR ==================== */
          /* ================================================================= */
          <div className="flex flex-col h-full">
            {/* Header: Brand + Rail Collapse Button */}
            <div className="h-14 px-3.5 border-b border-ink/8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-paper border border-ink/8 shadow-xs flex items-center justify-center">
                  <span className="font-serif font-bold text-accent text-sm">A</span>
                  <span className="font-kannada font-bold text-ink text-xs ml-0.5">ಕ</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-sm tracking-tight text-ink leading-tight">
                    NEXUS
                  </span>
                  <span className="text-[9px] font-mono text-ink/40 tracking-wider uppercase">
                    Phonetic Engine
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Desktop Icon Rail Collapse Toggle */}
                <button
                  onClick={() => setIsRail(true)}
                  className="hidden md:flex p-1.5 rounded-lg text-ink/40 hover:text-ink hover:bg-paper transition-colors"
                  title="Collapse to Icon Rail"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>

                {/* Mobile Close Button */}
                <button
                  onClick={onToggle}
                  className="md:hidden p-1.5 rounded-lg text-ink/40 hover:text-ink"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Top Action Area: INK/OUTLINED NEW CHAT (§3.A.3) */}
            <div className="p-3 pb-2 space-y-2.5">
              <button
                onClick={onNewChat}
                className="w-full py-2 px-3 border border-ink/15 text-ink bg-card hover:bg-paper hover:border-ink/30 rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>

              {/* Sub-Navigation Tabs: Chats, Saved, Examples, Corrections */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-paper rounded-lg border border-ink/8 text-[10px] font-mono">
                {[
                  { id: "chats", label: "Chats", icon: MessageSquare },
                  { id: "saved", label: "Saved", icon: Star },
                  { id: "examples", label: "Seed", icon: Sparkles },
                  { id: "corrections", label: "Review", icon: ClipboardList },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`py-1 rounded flex flex-col items-center gap-0.5 transition-colors ${
                        isActive
                          ? "bg-card text-ink font-bold shadow-2xs"
                          : "text-ink/50 hover:text-ink"
                      }`}
                      title={t.label}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* History Search (Filters by English or Kannada text) */}
              {activeTab === "chats" && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-ink/40 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search history (English / ಕನ್ನಡ)..."
                    className="w-full bg-paper border border-ink/8 rounded-xl py-1.5 pl-8 pr-7 text-xs text-ink placeholder:text-ink/40 focus:outline-none focus:border-accent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2 text-ink/30 hover:text-ink"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable Middle Content Area */}
            <div className="flex-1 overflow-y-auto px-3 py-1 space-y-2">
              {/* TAB 1: CONVERSATIONS */}
              {activeTab === "chats" && (
                <>
                  {renderSection("Pinned", groups.pinned)}
                  {renderSection("Today", groups.today)}
                  {renderSection("Yesterday", groups.yesterday)}
                  {renderSection("Earlier", groups.earlier)}

                  {conversations.length === 0 && (
                    <div className="p-6 text-center text-xs text-ink/40">
                      No conversations yet. Type in the composer to start!
                    </div>
                  )}

                  {conversations.length > 0 &&
                    groups.pinned.length === 0 &&
                    groups.today.length === 0 &&
                    groups.yesterday.length === 0 &&
                    groups.earlier.length === 0 && (
                      <div className="p-4 text-center text-xs text-ink/40">
                        No results for "{searchQuery}"
                      </div>
                    )}
                </>
              )}

              {/* TAB 2: SAVED PHRASEBOOK (§3.F.2) */}
              {activeTab === "saved" && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink/40">
                      Saved Phrasebook
                    </span>
                    <span className="text-[10px] font-mono text-ink/40">
                      {savedPhrases.length} items
                    </span>
                  </div>

                  {savedPhrases.length === 0 ? (
                    <div className="p-6 text-center text-xs text-ink/40 space-y-1">
                      <Star className="w-4 h-4 mx-auto text-ink/30" />
                      <p>No starred phrases yet.</p>
                      <p className="text-[10px] text-ink/30">
                        Click the star on any transliteration to save it here.
                      </p>
                    </div>
                  ) : (
                    savedPhrases.map((phrase, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectSavedPhrase && onSelectSavedPhrase(phrase)}
                        className="p-2 rounded-lg bg-paper border border-ink/8 hover:border-accent/40 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] text-ink/50 font-serif italic truncate">
                            {phrase.source}
                          </span>
                          <Star className="w-3 h-3 text-accent fill-accent" />
                        </div>
                        <span className="font-kannada text-base font-semibold text-ink block">
                          {phrase.kannada}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: TEST EXAMPLES MATRIX (§3.F.3) */}
              {activeTab === "examples" && (
                <div className="space-y-3 pt-1">
                  <span className="block px-1 text-[10px] font-mono font-bold uppercase tracking-wider text-ink/40">
                    Test Matrix Examples
                  </span>

                  {EXAMPLE_MATRIX.map((grp, i) => (
                    <div key={i} className="space-y-1">
                      <span className="text-[10px] font-mono text-ink/50 uppercase block px-1">
                        {grp.group}
                      </span>
                      <div className="space-y-1">
                        {grp.items.map((item, j) => (
                          <button
                            key={j}
                            onClick={() => onSelectExample && onSelectExample(item.en)}
                            className="w-full text-left p-2 rounded-lg bg-paper border border-ink/8 hover:border-accent/40 hover:bg-card transition-all flex items-center justify-between group"
                          >
                            <span className="text-xs text-ink/80 group-hover:text-ink font-medium truncate">
                              {item.en}
                            </span>
                            <span className="font-kannada text-xs font-semibold text-ink/60 group-hover:text-ink">
                              {item.kn}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: MY CORRECTIONS (§3.F.4) */}
              {activeTab === "corrections" && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink/40">
                      My Corrections
                    </span>
                    <span className="text-[10px] font-mono text-ink/40">
                      {corrections.length} submitted
                    </span>
                  </div>

                  {corrections.length === 0 ? (
                    <div className="p-6 text-center text-xs text-ink/40 space-y-1">
                      <ClipboardList className="w-4 h-4 mx-auto text-ink/30" />
                      <p>No submitted corrections.</p>
                      <p className="text-[10px] text-ink/30">
                        Use "Suggest correction" on any message to track spelling feedback.
                      </p>
                    </div>
                  ) : (
                    corrections.map((corr, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-paper border border-ink/8 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-ink truncate">
                            {corr.source}
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-attention/15 text-attention border border-attention/30">
                            <Clock className="w-2.5 h-2.5" />
                            Pending review
                          </span>
                        </div>
                        <div className="text-[11px] font-kannada text-ink/80">
                          Suggested: <span className="font-bold text-ink">{corr.suggested}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Bottom Area: Profile */}
            <div className="border-t border-ink/8 p-3 bg-paper/30">
              {/* User Profile Card with Settings Button */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-ink/8 shadow-xs">
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-2.5 min-w-0 flex-1 text-left group"
                  title="Open Settings & Profile"
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

                <button
                  onClick={onOpenSettings}
                  className="p-1.5 rounded-lg text-ink/40 hover:text-ink hover:bg-paper transition-colors"
                  title="Settings & Log Out"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
