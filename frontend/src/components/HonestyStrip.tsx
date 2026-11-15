import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, typography } from "../tokens/theme";
import { HonestySummary } from "../types/pipeline";

interface HonestyStripProps {
  summary?: HonestySummary;
  totalMs?: number;
  cached?: boolean;
  onOpenProof: () => void;
}

export const HonestyStrip: React.FC<HonestyStripProps> = ({
  summary = { tokens: 0, protected: 0, altered: 0, low_confidence: 0 },
  totalMs = 0,
  cached = false,
  onOpenProof,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onOpenProof}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`Honesty metrics: ${summary.tokens} tokens, ${summary.protected} protected, ${summary.altered} altered, ${summary.low_confidence} low confidence, ${totalMs} milliseconds. Tap to open pipeline proof.`}
    >
      <View style={styles.metricsRow}>
        <Text style={styles.monoStat}>{summary.tokens} tokens</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.monoStat}>{summary.protected} protected</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.monoStat}>{summary.altered} altered</Text>
        <Text style={styles.dot}>·</Text>
        <Text
          style={[
            styles.monoStat,
            summary.low_confidence > 0 && { color: colors.attention, fontWeight: "600" },
          ]}
        >
          {summary.low_confidence} low conf
        </Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.monoStat}>{totalMs} ms</Text>
      </View>

      <View style={styles.rightAction}>
        {cached && (
          <View style={styles.cachedChip}>
            <Text style={styles.cachedText}>Offline · cached</Text>
          </View>
        )}
        <Text style={styles.proofLink}>Proof ➔</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.inkBorder,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
  },
  monoStat: {
    fontFamily: typography.code.fontFamily,
    fontSize: 11,
    color: colors.inkMuted,
  },
  dot: {
    marginHorizontal: 4,
    color: colors.inkBorder,
    fontSize: 10,
  },
  rightAction: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  cachedChip: {
    backgroundColor: "rgba(63, 125, 92, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  cachedText: {
    fontFamily: typography.code.fontFamily,
    fontSize: 9,
    color: colors.protected,
    fontWeight: "600",
  },
  proofLink: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.accent,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
