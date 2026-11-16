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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  PanelLeftClose,
  PanelLeft
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
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [isRail, setIsRail] = useState(false); // Desktop icon rail toggle

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

  const renderChatItem = (chat) => {
    const isActive = chat.id === activeId;
    const isEditing = chat.id === editingId;

    return (
      <div
        key={chat.id}
        onClick={() => onSelectChat(chat.id)}
        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
          isActive
            ? "bg-paper text-ink font-semibold border border-ink/8 shadow-xs"
            : "text-ink/70 hover:bg-paper/70 hover:text-ink"
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
              <span className="truncate text-[11px]">{chat.title || "Untitled"}</span>
            </div>

            {/* Action Tools on Hover: Pin, Rename, Delete */}
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
              {/* Logo / Expand Trigger */}
              <button
                onClick={() => setIsRail(false)}
                className="w-10 h-10 rounded-xl bg-paper border border-ink/8 flex items-center justify-center shadow-xs hover:border-accent/40"
                title="Expand Sidebar"
              >
                <span className="font-serif font-bold text-accent text-base">A</span>
                <span className="font-kannada font-bold text-ink text-xs ml-0.5">ಕ</span>
              </button>

              {/* One Accent-Coloured Action: New Chat Button */}
              <button
                onClick={onNewChat}
                className="w-10 h-10 rounded-xl bg-accent text-card shadow-sm hover:opacity-90 flex items-center justify-center transition-opacity"
                title="New Transliteration"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Search Trigger */}
              <button
                onClick={() => setIsRail(false)}
                className="w-9 h-9 rounded-lg text-ink/50 hover:text-ink hover:bg-paper flex items-center justify-center transition-colors"
                title="Search Chats"
              >
                <Search className="w-4 h-4" />
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
                <span className="font-serif font-bold text-sm tracking-tight text-ink">
                  NEXUS
                </span>
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

            {/* Top Action Area: ONE ACCENT-COLOURED ACTION (New Chat) */}
            <div className="p-3 pb-2 space-y-2.5">
              <button
                onClick={onNewChat}
                className="w-full py-2.5 px-3 bg-accent text-card rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>

              {/* History Search (Filters by English or Kannada text) */}
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
            </div>

            {/* Middle Scrollable History: Pinned, Today, Yesterday, Earlier */}
            <div className="flex-1 overflow-y-auto px-3 py-1 space-y-2">
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
            </div>

            {/* Bottom Area: GitHub Link + User Profile & Settings */}
            <div className="border-t border-ink/8 p-3 bg-paper/30 space-y-2">
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
                  <span>GitHub</span>
                </div>
                <ExternalLink className="w-3 h-3 text-ink/40" />
              </a>

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
