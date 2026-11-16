import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Clock, ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";

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
  onLogout,
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

  return (
    <>
      {/* Toggle button on border for mobile / collapse */}
      <button
        onClick={onToggle}
        className={`fixed top-20 z-20 transition-all duration-300 p-1.5 rounded-r-lg bg-card border border-l-0 border-ink/8 shadow-sm hover:bg-paper ${
          isOpen ? "left-64" : "left-0"
        }`}
        title={isOpen ? "Collapse Sidebar" : "Open History"}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4 text-ink/60" /> : <ChevronRight className="w-4 h-4 text-ink/60" />}
      </button>

      {/* Slide-out Drawer */}
      <aside
        className={`fixed md:relative top-16 md:top-0 bottom-0 left-0 z-20 w-64 bg-card border-r border-ink/8 flex flex-col transition-all duration-300 ${
          isOpen ? "translate-x-0 shadow-lg md:shadow-none" : "-translate-x-full md:translate-x-0 md:w-64"
        }`}
      >
        {/* Header with New Chat */}
        <div className="p-3 border-b border-ink/8 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase text-ink/60 tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            Transliterations
          </div>
          <button
            onClick={onNewChat}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-pill bg-paper border border-ink/8 text-ink hover:border-accent/40 hover:text-accent transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink/40">
              No conversations yet. Start typing in the center conversation bar!
            </div>
          ) : (
            conversations.map((chat) => {
              const isActive = chat.id === activeId;
              const isEditing = chat.id === editingId;

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-card text-xs cursor-pointer transition-all ${
                    isActive
                      ? "bg-paper font-semibold text-ink border border-ink/8 shadow-sm"
                      : "text-ink/70 hover:bg-paper/60 hover:text-ink"
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
                      <button onClick={(e) => saveEditing(chat.id, e)} className="p-1 text-protected hover:opacity-80">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={cancelEditing} className="p-1 text-ink/40 hover:text-ink">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="truncate flex-1 pr-2">
                        <p className="truncate font-medium">{chat.title || "Untitled"}</p>
                        <p className="text-[10px] text-ink/40 font-mono">
                          {new Date(chat.timestamp).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={(e) => startEditing(chat, e)}
                          className="p-1 text-ink/40 hover:text-ink"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          className="p-1 text-ink/40 hover:text-accent"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-ink/8 bg-code/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate pr-2">
              <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                {currentUser?.username?.[0]?.toUpperCase() || <User className="w-3.5 h-3.5" />}
              </div>
              <div className="truncate">
                <span className="block text-xs font-semibold text-ink truncate">
                  {currentUser?.username || "Verified User"}
                </span>
                <span className="block text-[10px] text-ink/50 font-mono truncate">
                  {currentUser?.email || ""}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-ink/40 hover:text-accent hover:bg-paper transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
