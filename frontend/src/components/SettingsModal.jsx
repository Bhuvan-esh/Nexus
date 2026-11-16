import React, { useState } from "react";
import { X, User, Mail, ShieldCheck, Database, LogOut, Check, AlertTriangle, Key } from "lucide-react";
import { updateUserProfile } from "../services/api";

export function SettingsModal({
  isOpen,
  onClose,
  currentUser,
  authToken,
  onUpdateUser,
  onLogout,
}) {
  const [username, setUsername] = useState(currentUser?.username || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }

    if (username.trim() === currentUser?.username) {
      setSuccess("Username unchanged.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await updateUserProfile(authToken, username.trim());
      setSuccess("Profile updated successfully!");
      if (onUpdateUser && res.user) {
        onUpdateUser(res.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-ink/10 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/8 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold text-sm">
              ⚙
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink">
                Settings & Profile
              </h3>
              <p className="text-[11px] text-ink/50">
                Manage your NEXUS account, database sync, and active session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink/40 hover:text-ink hover:bg-paper transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-attention/10 border border-attention/30 text-xs text-ink font-medium">
            <AlertTriangle className="w-4 h-4 text-attention flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-protected/10 border border-protected/30 text-xs text-ink font-medium">
            <Check className="w-4 h-4 text-protected flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* 1. Profile Section */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-paper rounded-xl border border-ink/8">
            <div className="w-12 h-12 rounded-full bg-accent text-card font-serif font-bold text-xl flex items-center justify-center shadow-sm">
              {currentUser?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-ink block truncate">
                {currentUser?.username || "NEXUS User"}
              </span>
              <span className="text-[11px] text-ink/50 font-mono block truncate">
                {currentUser?.email || "user@example.com"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-protected bg-protected/10 border border-protected/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-ink/70 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-paper border border-ink/10 rounded-input py-2 pl-9 pr-3 text-xs text-ink focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink/70 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ""}
                  className="w-full bg-paper/50 border border-ink/10 rounded-input py-2 pl-9 pr-3 text-xs text-ink/60 cursor-not-allowed font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent text-card text-xs font-semibold rounded-input hover:opacity-90 shadow-sm transition-opacity"
            >
              {loading ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </form>

        {/* 2. System Architecture Card */}
        <div className="p-3 bg-code/50 rounded-xl border border-ink/8 space-y-2 text-[11px] font-mono text-ink/70">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-ink">
              <Database className="w-3.5 h-3.5 text-accent" />
              Database
            </span>
            <span className="text-protected font-bold">Supabase PostgreSQL 17</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-ink">
              <Mail className="w-3.5 h-3.5 text-accent" />
              Email Dispatch
            </span>
            <span className="text-protected font-bold">Gmail SMTP (Active)</span>
          </div>
        </div>

        {/* 3. Session & Logout Area (as requested: inside settings) */}
        <div className="pt-3 border-t border-ink/8 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-ink block">Session Actions</span>
            <span className="text-[10px] text-ink/40">Log out of your current account on this device</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-input bg-attention/10 text-attention hover:bg-attention/20 text-xs font-semibold transition-colors border border-attention/20 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
