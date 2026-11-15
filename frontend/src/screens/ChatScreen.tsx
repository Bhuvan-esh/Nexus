import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Clipboard,
} from "react-native";
import { colors, radii, shadows, typography } from "../tokens/theme";
import { MessageItem, TokenItem, PipelineStreamEvent } from "../types/pipeline";
import { TransliterationService } from "../services/api";
import { PaperBackground } from "../components/PaperBackground";
import { Composer } from "../components/Composer";
import { StarterChips } from "../components/StarterChips";
import { InterlinearView } from "../components/InterlinearView";
import { HonestyStrip } from "../components/HonestyStrip";
import { PipelineSheet } from "../components/PipelineSheet";
import { TokenInspector } from "../components/TokenInspector";
import { MorphingMark } from "../components/MorphingMark";

const service = new TransliterationService();

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedStages, setCompletedStages] = useState(0);
  const [selectedProofMsg, setSelectedProofMsg] = useState<MessageItem | null>(null);
  const [inspectedToken, setInspectedToken] = useState<TokenItem | null>(null);
  const [lastResolvedTime, setLastResolvedTime] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

  const handleSend = (text: string) => {
    const userMsgId = `user-${Date.now()}`;
    const nexusMsgId = `nexus-${Date.now()}`;

    const userMsg: MessageItem = {
      id: userMsgId,
      role: "user",
      text,
      createdAt: Date.now(),
    };

    const initialNexusMsg: MessageItem = {
      id: nexusMsgId,
      role: "nexus",
      text: "",
      createdAt: Date.now(),
      isStreaming: true,
      tokens: [],
      spans: [],
      stages: [],
      summary: { tokens: 0, protected: 0, altered: 0, low_confidence: 0 },
    };

    setMessages((prev) => [...prev, userMsg, initialNexusMsg]);
    setIsProcessing(true);
    setCompletedStages(0);
    scrollToBottom();

    // Start streaming from backend / fallback service
    service.stream(text, {
      onEvent: (event: PipelineStreamEvent) => {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== nexusMsgId) return msg;

            if (event.type === "stage") {
              const currentStages = msg.stages || [];
              const exists = currentStages.some((s) => s.name === event.name);
              const updatedStages = exists ? currentStages : [...currentStages, event];
              setCompletedStages(updatedStages.length);
              return { ...msg, stages: updatedStages };
            }

            if (event.type === "token") {
              const currentTokens = msg.tokens || [];
              const newToken: TokenItem = {
                id: `tok-${event.index}`,
                source: event.source,
                kannada: event.kannada,
                score: event.score,
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
              const newSpanToken: TokenItem = {
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
                sha256Output: event.sha256,
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
                isStreaming: false,
              };
            }

            return msg;
          })
        );
        scrollToBottom();
      },
      onError: (err) => {
        setIsProcessing(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === nexusMsgId
              ? { ...msg, text: `Transliteration error: ${err}`, isStreaming: false }
              : msg
          )
        );
      },
      onClose: () => {
        setIsProcessing(false);
        setLastResolvedTime(Date.now());
      },
    });
  };

  const handleCopy = (id: string, text: string) => {
    Clipboard.setString(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <PaperBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <View style={styles.brandGroup}>
            <MorphingMark triggerResolve={Boolean(lastResolvedTime)} />
            <Text style={styles.navTitle}>NEXUS</Text>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>Phonetic Engine</Text>
            </View>
          </View>

          {messages.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.newChatBtn}>
              <Text style={styles.newChatText}>New Transliteration</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Message Thread */}
        <ScrollView
          ref={scrollRef}
          style={styles.thread}
          contentContainerStyle={styles.threadContent}
        >
          {messages.length === 0 ? (
            <StarterChips onSelectChip={handleSend} />
          ) : (
            messages.map((msg) => {
              if (msg.role === "user") {
                return (
                  <View key={msg.id} style={styles.userBubbleWrapper}>
                    <View style={styles.userBubble}>
                      <Text style={styles.userLabel}>SOURCE ENGLISH</Text>
                      <Text style={styles.userText}>{msg.text}</Text>
                    </View>
                  </View>
                );
              }

              // NEXUS Card Response
              return (
                <View key={msg.id} style={styles.nexusCardWrapper}>
                  <View style={styles.nexusCard}>
                    {/* Header line */}
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardLabel}>KANNADA SCRIPT</Text>
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          onPress={() => handleCopy(msg.id, msg.text)}
                          style={styles.actionBtn}
                        >
                          <Text style={styles.actionBtnText}>
                            {copiedId === msg.id ? "✓ Copied" : "Copy"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Display-size primary output in Noto Sans Kannada */}
                    <Text style={styles.displayKannada} accessibilityLanguage="kn">
                      {msg.text || (msg.isStreaming ? "Resolving sounds..." : "")}
                    </Text>

                    {/* Interlinear resolve-along tokens */}
                    {msg.tokens && msg.tokens.length > 0 && (
                      <InterlinearView
                        tokens={msg.tokens}
                        onSelectToken={(tok) => setInspectedToken(tok)}
                        isStreaming={msg.isStreaming}
                      />
                    )}

                    {/* Honesty Strip & Proof Link */}
                    {!msg.isStreaming && (
                      <HonestyStrip
                        summary={msg.summary}
                        totalMs={msg.totalMs}
                        cached={msg.cached}
                        onOpenProof={() => setSelectedProofMsg(msg)}
                      />
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Bottom Composer with 72pt Orb */}
        <Composer
          onSend={handleSend}
          isProcessing={isProcessing}
          completedStages={completedStages}
        />

        {/* Proof Sheet (Pipeline Stages) */}
        <PipelineSheet
          visible={Boolean(selectedProofMsg)}
          message={selectedProofMsg}
          onClose={() => setSelectedProofMsg(null)}
        />

        {/* Token Inspector Sheet */}
        <TokenInspector
          visible={Boolean(inspectedToken)}
          token={inspectedToken}
          onClose={() => setInspectedToken(null)}
        />
      </SafeAreaView>
    </PaperBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  navBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkBorder,
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  navTitle: {
    fontFamily: typography.display.fontFamily,
    fontSize: 20,
    fontWeight: "600",
    color: colors.ink,
    marginLeft: 8,
    letterSpacing: 1.5,
  },
  tagBadge: {
    backgroundColor: colors.code,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    marginLeft: 10,
  },
  tagText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 9,
    color: colors.inkMuted,
    fontWeight: "700",
  },
  newChatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.inkBorder,
  },
  newChatText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: colors.ink,
    fontWeight: "500",
  },
  thread: {
    flex: 1,
  },
  threadContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  userBubbleWrapper: {
    alignItems: "flex-end",
    marginTop: 18,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: colors.code,
    borderRadius: radii.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "85%",
    borderWidth: 1,
    borderColor: colors.inkBorder,
  },
  userLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  userText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
  },
  nexusCardWrapper: {
    marginTop: 4,
    marginBottom: 14,
  },
  nexusCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    padding: 18,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.accent,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cardActions: {
    flexDirection: "row",
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionBtnText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
    fontWeight: "600",
  },
  displayKannada: {
    fontFamily: typography.kannada.fontFamily,
    fontSize: typography.display.fontSize,
    lineHeight: 40,
    color: colors.ink,
    fontWeight: "500",
    marginBottom: 6,
  },
});
