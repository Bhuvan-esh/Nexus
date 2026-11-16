import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Chat } from "./pages/Chat";
import { Lab } from "./pages/Lab";
import { Evaluation } from "./pages/Evaluation";
import { streamTransliteration } from "./services/stream";

export default function App() {
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
  const [selectedProofMsg, setSelectedProofMsg] = useState(null);
  const [inspectedToken, setInspectedToken] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("nexus_chats", JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  // Load active chat messages
  useEffect(() => {
    if (activeChatId) {
      const chat = conversations.find((c) => c.id === activeChatId);
      if (chat) {
        setMessages(chat.messages || []);
      }
    }
  }, [activeChatId]);

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newChat = {
      id: newId,
      title: "New Transliteration",
      timestamp: Date.now(),
      messages: [],
    };
    setConversations((prev) => [newChat, ...prev]);
    setActiveChatId(newId);
    setMessages([]);
    setActivePage("chat");
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

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setActivePage("chat");
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSend = (text) => {
    // Ensure active chat exists
    let chatId = activeChatId;
    if (!chatId) {
      chatId = `chat-${Date.now()}`;
      const newChat = {
        id: chatId,
        title: text.length > 24 ? text.substring(0, 24) + "..." : text,
        timestamp: Date.now(),
        messages: [],
      };
      setConversations((prev) => [newChat, ...prev]);
      setActiveChatId(chatId);
    } else {
      // Update title if first message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === chatId && c.title === "New Transliteration"
            ? { ...c, title: text.length > 24 ? text.substring(0, 24) + "..." : text }
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

    // Stream pipeline events
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

          // Sync back to current conversation
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

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink relative">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        onNewChat={handleNewChat}
        hasMessages={messages.length > 0}
      />

      <div className="flex-1 flex relative">
        {/* Slide-out Sidebar History */}
        <Sidebar
          conversations={conversations}
          activeId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((v) => !v)}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarOpen ? "md:ml-64" : "ml-0"
          }`}
        >
          {activePage === "chat" && (
            <Chat
              messages={messages}
              isProcessing={isProcessing}
              completedStages={completedStages}
              onSend={handleSend}
              selectedProofMsg={selectedProofMsg}
              setSelectedProofMsg={setSelectedProofMsg}
              inspectedToken={inspectedToken}
              setInspectedToken={setInspectedToken}
              onSelectCandidate={handleSelectCandidate}
            />
          )}

          {activePage === "lab" && <Lab />}

          {activePage === "evaluation" && <Evaluation />}
        </main>
      </div>
    </div>
  );
}
