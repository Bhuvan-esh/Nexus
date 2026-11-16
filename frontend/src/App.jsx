import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { SettingsModal } from "./components/SettingsModal";
import { CommandPalette } from "./components/CommandPalette";
import { Chat } from "./pages/Chat";
import { Lab } from "./pages/Lab";
import { Evaluation } from "./pages/Evaluation";
import { Auth } from "./pages/Auth";
import { streamTransliteration } from "./services/stream";
import { getCurrentUser } from "./services/api";

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("nexus_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem("nexus_auth_token") || null;
  });

  // Settings & Command Palette Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Active feature section (e.g. "proof", "inspector", "lab", "evaluation", "lexicon")
  const [activeFeature, setActiveFeature] = useState("proof");

  // Display Preferences (§3.F.5)
  const [displayPreferences, setDisplayPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem("nexus_display_prefs");
      return saved
        ? JSON.parse(saved)
        : {
            showPipeline: true,
            showConfidenceFlags: true,
            showInterlinear: true,
            kannadaTextSize: "normal",
          };
    } catch {
      return {
        showPipeline: true,
        showConfidenceFlags: true,
        showInterlinear: true,
        kannadaTextSize: "normal",
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("nexus_display_prefs", JSON.stringify(displayPreferences));
    } catch {}
  }, [displayPreferences]);

  // Saved phrasebook (§3.F.2)
  const [savedPhrases, setSavedPhrases] = useState(() => {
    try {
      const saved = localStorage.getItem("nexus_saved_phrases");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("nexus_saved_phrases", JSON.stringify(savedPhrases));
    } catch {}
  }, [savedPhrases]);

  // My Corrections tracker (§3.F.4)
  const [corrections, setCorrections] = useState(() => {
    try {
      const saved = localStorage.getItem("nexus_corrections");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("nexus_corrections", JSON.stringify(corrections));
    } catch {}
  }, [corrections]);

  // Verify auth session on load
  useEffect(() => {
    if (authToken && !currentUser) {
      getCurrentUser(authToken).then((res) => {
        if (res?.user) {
          setCurrentUser(res.user);
          localStorage.setItem("nexus_user", JSON.stringify(res.user));
        } else {
          handleLogout();
        }
      }).catch(() => {
        handleLogout();
      });
    }
  }, [authToken]);

  // App Navigation & History
  const [activePage, setActivePage] = useState("chat");
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem("nexus_chats");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedStages, setCompletedStages] = useState(0);
  const [inspectedToken, setInspectedToken] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Tuning Parameters
  const [tuningParams, setTuningParams] = useState({
    alpha: 0.5,
    beta: 0.5,
    gamma: 0.0,
    tau: 0.70,
  });

  // Sync chats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("nexus_chats", JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  // Load active chat
  useEffect(() => {
    if (activeChatId) {
      const chat = conversations.find((c) => c.id === activeChatId);
      if (chat) {
        setMessages(chat.messages || []);
      }
    }
  }, [activeChatId]);

  const handleAuthSuccess = (data) => {
    const user = { username: data.username, email: data.email };
    setCurrentUser(user);
    setAuthToken(data.token);
    localStorage.setItem("nexus_user", JSON.stringify(user));
    localStorage.setItem("nexus_auth_token", data.token);
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("nexus_user", JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem("nexus_user");
    localStorage.removeItem("nexus_auth_token");
    setMessages([]);
    setActiveChatId(null);
    setIsSettingsOpen(false);
  };

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newChat = {
      id: newId,
      title: "New Chat",
      timestamp: Date.now(),
      isPinned: false,
      messages: [],
    };
    setConversations((prev) => [newChat, ...prev]);
    setActiveChatId(newId);
    setMessages([]);
    setActivePage("chat");
    setActiveFeature("proof");
  };

  const handleDeleteChat = (id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
      setMessages([]);
    }
  };

  const handleRenameChat = (id, newTitle) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  const handleTogglePin = (id) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setActivePage("chat");
    setActiveFeature("proof");
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectFeature = (featId) => {
    setActiveFeature(featId);
    if (featId === "lab") {
      setActivePage("lab");
    } else if (featId === "evaluation") {
      setActivePage("evaluation");
    } else {
      setActivePage("chat");
    }
  };

  const handleSavePhrase = (phrase) => {
    setSavedPhrases((prev) => {
      const exists = prev.some((p) => p.kannada === phrase.kannada && p.source === phrase.source);
      if (exists) {
        return prev.filter((p) => !(p.kannada === phrase.kannada && p.source === phrase.source));
      }
      return [phrase, ...prev];
    });
  };

  const handleSuggestCorrection = (correction) => {
    setCorrections((prev) => [correction, ...prev]);
  };

  const handleUseAlternate = (message) => {
    if (!message || !message.tokens) return;
    const tokenWithAlts = message.tokens.find((t) => t.candidates && t.candidates.length > 1);
    if (!tokenWithAlts) return;

    // Find next candidate
    const currentIndex = tokenWithAlts.candidates.findIndex((c) => c.kannada === tokenWithAlts.kannada);
    const nextIndex = (currentIndex + 1) % tokenWithAlts.candidates.length;
    const nextCandidate = tokenWithAlts.candidates[nextIndex];

    const updatedTokens = message.tokens.map((tok) =>
      tok.id === tokenWithAlts.id ? { ...tok, kannada: nextCandidate.kannada } : tok
    );
    const newText = updatedTokens.map((t) => t.kannada).join(" ");

    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, tokens: updatedTokens, text: newText } : m))
    );

    if (activeChatId) {
      setConversations((all) =>
        all.map((c) =>
          c.id === activeChatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === message.id ? { ...m, tokens: updatedTokens, text: newText } : m
                ),
              }
            : c
        )
      );
    }
  };

  const handleRegenerate = (message) => {
    const textToRun = message.sourceText || message.text;
    if (textToRun) {
      handleSend(textToRun);
    }
  };

  const handleSend = (text) => {
    let chatId = activeChatId;
    if (!chatId) {
      chatId = `chat-${Date.now()}`;
      const newChat = {
        id: chatId,
        title: text.length > 28 ? text.substring(0, 28) + "..." : text,
        timestamp: Date.now(),
        isPinned: false,
        messages: [],
      };
      setConversations((prev) => [newChat, ...prev]);
      setActiveChatId(chatId);
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === chatId && (!c.title || c.title === "New Chat" || c.title === "New Transliteration")
            ? { ...c, title: text.length > 28 ? text.substring(0, 28) + "..." : text }
            : c
        )
      );
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: Date.now(),
    };

    const nexusMsgId = `nexus-${Date.now()}`;
    const initialNexusMsg = {
      id: nexusMsgId,
      role: "nexus",
      text: "",
      sourceText: text,
      isStreaming: true,
      timestamp: Date.now(),
      tokens: [],
      spans: [],
      stages: [],
      summary: { tokens: 0, protected: 0, altered: 0, low_confidence: 0 },
    };

    const updated = [...messages, userMsg, initialNexusMsg];
    setMessages(updated);
    setIsProcessing(true);
    setCompletedStages(0);

    // Stream real-time pipeline events
    streamTransliteration(
      text,
      (event) => {
        setMessages((prev) => {
          const next = prev.map((msg) => {
            if (msg.id !== nexusMsgId) return msg;

            if (event.type === "stage") {
              const stages = msg.stages || [];
              const exists = stages.some((s) => s.name === event.name);
              const nextStages = exists ? stages : [...stages, event];
              setCompletedStages(nextStages.length);
              return { ...msg, stages: nextStages };
            }

            if (event.type === "token") {
              const currentTokens = msg.tokens || [];
              const newToken = {
                id: `tok-${event.index}`,
                source: event.source,
                kannada: event.kannada,
                score: event.score,
                rawScore: event.raw_score,
                confident: event.confident,
                origin: event.origin,
                candidates: event.candidates,
              };
              return {
                ...msg,
                tokens: [...currentTokens, newToken],
                text: msg.text ? `${msg.text} ${event.kannada}` : event.kannada,
              };
            }

            if (event.type === "span") {
              const currentTokens = msg.tokens || [];
              const currentSpans = msg.spans || [];
              const newSpanToken = {
                id: `span-${event.index}`,
                source: event.text,
                kannada: event.text,
                score: 1.0,
                confident: true,
                isProtected: true,
                kind: event.kind,
                origin: ["Protected Span"],
                candidates: [],
                sha256Source: event.sha256,
              };
              return {
                ...msg,
                tokens: [...currentTokens, newSpanToken],
                spans: [...currentSpans, event],
                text: msg.text ? `${msg.text} ${event.text}` : event.text,
              };
            }

            if (event.type === "done") {
              return {
                ...msg,
                text: event.final,
                totalMs: event.total_ms,
                summary: event.summary,
                cached: event.cached,
                isStreaming: false,
              };
            }

            return msg;
          });

          setConversations((all) =>
            all.map((c) => (c.id === chatId ? { ...c, messages: next } : c))
          );
          return next;
        });
      },
      (err) => {
        setIsProcessing(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === nexusMsgId
              ? { ...msg, text: `Error: ${err}`, isStreaming: false }
              : msg
          )
        );
      },
      () => {
        setIsProcessing(false);
      }
    );
  };

  const handleSelectCandidate = (candidateKannada) => {
    if (!inspectedToken) return;
    setMessages((prev) =>
      prev.map((msg) => {
        if (!msg.tokens) return msg;
        const updatedTokens = msg.tokens.map((tok) =>
          tok.id === inspectedToken.id ? { ...tok, kannada: candidateKannada } : tok
        );
        const reconstructed = updatedTokens.map((t) => t.kannada).join(" ");
        return { ...msg, tokens: updatedTokens, text: reconstructed };
      })
    );
    setInspectedToken((prev) => (prev ? { ...prev, kannada: candidateKannada } : null));
  };

  // If user is not authenticated, show real login / signup
  if (!currentUser || !authToken) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen flex bg-paper text-ink relative overflow-hidden">
      {/* 1. Left Structured Navigation Sidebar (§3.F) */}
      <Sidebar
        conversations={conversations}
        activeId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePin={handleTogglePin}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((v) => !v)}
        currentUser={currentUser}
        activeFeature={activeFeature}
        onSelectFeature={handleSelectFeature}
        onOpenSettings={() => setIsSettingsOpen(true)}
        savedPhrases={savedPhrases}
        onSelectSavedPhrase={(p) => handleSend(p.source)}
        corrections={corrections}
        onSelectExample={(text) => handleSend(text)}
      />

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar (§3.A.3 & §3.A.4) */}
        <Navbar
          currentUser={currentUser}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          activeBreadcrumb={
            activeFeature === "proof"
              ? "NEXUS Living Voice"
              : activeFeature.charAt(0).toUpperCase() + activeFeature.slice(1)
          }
          notificationCount={0}
        />

        {/* Dynamic Center Page */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {activePage === "chat" && (
            <Chat
              messages={messages}
              isProcessing={isProcessing}
              completedStages={completedStages}
              onSend={handleSend}
              inspectedToken={inspectedToken}
              setInspectedToken={setInspectedToken}
              onSelectCandidate={handleSelectCandidate}
              tuningParams={tuningParams}
              onUpdateTuningParams={(updates) =>
                setTuningParams((prev) => ({ ...prev, ...updates }))
              }
              selectedFeature={activeFeature}
              onSelectFeature={handleSelectFeature}
              onRegenerate={handleRegenerate}
              onSavePhrase={handleSavePhrase}
              savedPhrases={savedPhrases}
              onUseAlternate={handleUseAlternate}
              onSuggestCorrection={handleSuggestCorrection}
              displayPreferences={displayPreferences}
            />
          )}

          {activePage === "lab" && <Lab />}

          {activePage === "evaluation" && <Evaluation />}
        </main>
      </div>

      {/* 3. Command Palette Modal (Ctrl+K, §3.A.4) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        conversations={conversations}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onSelectFeature={handleSelectFeature}
        onSelectExample={(text) => handleSend(text)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 4. Settings & Profile Modal (§3.F.5) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        authToken={authToken}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        displayPreferences={displayPreferences}
        onUpdateDisplayPreferences={setDisplayPreferences}
      />
    </div>
  );
}
