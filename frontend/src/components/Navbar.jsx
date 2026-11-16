import React from "react";
import { Search, Bell } from "lucide-react";

export function Navbar({
  currentUser,
  onOpenSettings,
  onOpenCommandPalette,
  activeBreadcrumb = "NEXUS Living Voice",
  notificationCount = 0,
}) {
  const userTag = currentUser?.username ? currentUser.username.substring(0, 2).toLowerCase() : "nx";

  return (
    <header className="h-14 border-b border-ink/8 px-4 sm:px-6 flex items-center justify-between bg-card/70 backdrop-blur-md sticky top-0 z-20">
      {/* 1. Search Bar with Shortcut (Styled like OpenDocs Voice) */}
      <div className="flex items-center gap-3 w-72 sm:w-80">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="relative w-full text-left flex items-center bg-paper border border-ink/8 hover:border-ink/20 rounded-xl py-1.5 pl-8 pr-14 text-xs text-ink/50 transition-colors shadow-2xs group"
          title="Open Command Palette (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-ink/40 absolute left-3 top-2.5 group-hover:text-ink/60 transition-colors" />
          <span className="truncate">Search commands, history...</span>
          <kbd className="absolute right-2.5 top-2 text-[9px] font-mono text-ink/40 bg-card border border-ink/8 px-1.5 py-0.5 rounded shadow-xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* 2. Center/Right Breadcrumb */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-ink/50 font-medium">
        <span>Workspace</span>
        <span>/</span>
        <span className="text-ink font-semibold">{activeBreadcrumb}</span>
      </div>

      {/* 3. Notifications & User Avatar Button */}
      <div className="flex items-center gap-3">
        {/* Notification Bell (Badge hidden when count is 0 as per §3.A.3) */}
        <button
          className="relative p-1.5 rounded-lg text-ink/50 hover:text-ink hover:bg-paper transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-accent text-card text-[9px] font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Avatar Circle (Opens Settings on click) */}
        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full bg-accent/15 text-accent border border-accent/25 flex items-center justify-center font-bold text-xs hover:scale-105 transition-transform shadow-xs"
          title="Account Settings & Profile"
        >
          {userTag}
        </button>
      </div>
    </header>
  );
}
