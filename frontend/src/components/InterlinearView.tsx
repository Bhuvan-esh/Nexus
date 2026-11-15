import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radii, typography } from "../tokens/theme";
import { TokenItem } from "../types/pipeline";
import { ProtectedBadge } from "./ProtectedBadge";

interface InterlinearViewProps {
  tokens: TokenItem[];
  onSelectToken: (token: TokenItem) => void;
  isStreaming?: boolean;
}

export const InterlinearView: React.FC<InterlinearViewProps> = ({
  tokens,
  onSelectToken,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.viewHeader}>INTERLINEAR RESOLVE-ALONG</Text>
      
      <View style={styles.tokenFlow}>
        {tokens.map((tok, idx) => {
          if (tok.isProtected) {
            return (
              <View key={tok.id || idx} style={styles.protectedWrapper}>
                <ProtectedBadge
                  text={tok.source}
                  kind={(tok.kind as any) || "url"}
                  sha256={tok.sha256Source}
                  isMatched={tok.sha256Source === tok.sha256Output}
                />
              </View>
            );
          }

          const isAmber = !tok.confident;

          return (
            <TouchableOpacity
              key={tok.id || idx}
              style={[styles.pairBox, isAmber && styles.pairBoxAmber]}
              activeOpacity={0.7}
              onPress={() => onSelectToken(tok)}
              accessibilityRole="button"
              accessibilityLabel={`Source: ${tok.source}, Kannada: ${tok.kannada}. ${isAmber ? "Low confidence flag." : ""}`}
            >
              {/* English Source Token */}
              <Text style={styles.sourceText}>{tok.source}</Text>

              {/* Kannada Target Token (Display Size for first line or prominent) */}
              <View style={styles.kannadaWrapper}>
                <Text
                  style={[
                    styles.kannadaText,
                    isAmber && styles.kannadaTextAmber,
                  ]}
                  lang="kn"
                >
                  {tok.kannada}
                </Text>

                {/* Fail-closed amber flag: underline + triangle glyph + label (F5) */}
                {isAmber && (
                  <View style={styles.amberFlagRow}>
                    <Text style={styles.amberTriangle}>▲</Text>
                    <Text style={styles.amberLabel}>LOW CONF</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  viewHeader: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.inkMuted,
    marginBottom: 8,
  },
  tokenFlow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 8,
  },
  protectedWrapper: {
    marginVertical: 2,
  },
  pairBox: {
    backgroundColor: "transparent",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
  },
  pairBoxAmber: {
    backgroundColor: "rgba(180, 118, 31, 0.06)",
    borderColor: "rgba(180, 118, 31, 0.3)",
  },
  sourceText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: 4,
    textAlign: "center",
  },
  kannadaWrapper: {
    alignItems: "center",
  },
  kannadaText: {
    fontFamily: typography.kannada.fontFamily,
    fontSize: 22,
    lineHeight: 32,
    color: colors.ink,
    textAlign: "center",
  },
  kannadaTextAmber: {
    color: colors.attention,
  },
  amberFlagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  amberTriangle: {
    fontSize: 8,
    color: colors.attention,
    marginRight: 2,
  },
  amberLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 8,
    color: colors.attention,
    fontWeight: "700",
  },
});
