import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { colors, radii, typography } from "../tokens/theme";
import { TokenItem } from "../types/pipeline";

interface TokenInspectorProps {
  token: TokenItem | null;
  visible: boolean;
  onClose: () => void;
  onSelectCandidate?: (candidateKannada: string) => void;
}

export const TokenInspector: React.FC<TokenInspectorProps> = ({
  token,
  visible,
  onClose,
  onSelectCandidate,
}) => {
  if (!token) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          {/* Header handle */}
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.label}>TOKEN INSPECTOR</Text>
              <Text style={styles.sourceWord}>"{token.source}"</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeIconBtn}>
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            {/* Primary Chosen Representation */}
            <View style={styles.primaryBox}>
              <Text style={styles.kannadaDisplay} accessibilityLanguage="kn">
                {token.kannada}
              </Text>

              {/* Source pills in 'link' blue inline */}
              <View style={styles.pillsRow}>
                {token.origin.map((org, i) => (
                  <View key={i} style={styles.sourcePill}>
                    <Text style={styles.sourcePillText}>{org}</Text>
                  </View>
                ))}
                {!token.confident && (
                  <View style={styles.attentionPill}>
                    <Text style={styles.attentionPillText}>▲ LOW CONFIDENCE</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Candidate Breakdown Table (P, L, X) */}
            <Text style={styles.subHeader}>RANKED CANDIDATES & WEIGHTED FORMULATION</Text>
            <Text style={styles.formulaNote}>
              Score = α·P + β·L + γ·X (α=0.5, β=0.5, γ=0.0)
            </Text>

            {token.candidates.map((cand, idx) => {
              const isSelected = cand.kannada === token.kannada;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.candidateCard, isSelected && styles.selectedCandidateCard]}
                  onPress={() => onSelectCandidate && onSelectCandidate(cand.kannada)}
                  activeOpacity={0.7}
                >
                  <View style={styles.candTopRow}>
                    <View style={styles.candNameRow}>
                      <Text style={styles.candRank}>#{idx + 1}</Text>
                      <Text style={styles.candKannada} accessibilityLanguage="kn">
                        {cand.kannada}
                      </Text>
                      {isSelected && <Text style={styles.activeCheck}>✓ Active</Text>}
                    </View>

                    <Text style={styles.candScore}>
                      {cand.rawScore !== undefined ? `Raw: ${cand.rawScore} · ` : ""}
                      {(cand.score * 100).toFixed(0)}%
                    </Text>
                  </View>

                  {/* Factor Breakdown */}
                  <View style={styles.factorsRow}>
                    <View style={styles.factorCol}>
                      <Text style={styles.factorLabel}>PHONETIC (P)</Text>
                      <Text style={styles.factorVal}>{cand.P.toFixed(2)}</Text>
                    </View>
                    <View style={styles.factorCol}>
                      <Text style={styles.factorLabel}>LEXICAL (L)</Text>
                      <Text style={styles.factorVal}>{cand.L.toFixed(2)}</Text>
                    </View>
                    <View style={styles.factorCol}>
                      <Text style={styles.factorLabel}>CONTEXT (X)</Text>
                      <Text style={styles.factorVal}>{cand.X.toFixed(2)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 26, 23, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    maxHeight: "82%",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: colors.inkBorder,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(28, 26, 23, 0.2)",
    alignSelf: "center",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.inkMuted,
    letterSpacing: 1,
  },
  sourceWord: {
    fontFamily: typography.section.fontFamily,
    fontSize: 20,
    color: colors.ink,
    marginTop: 2,
  },
  closeIconBtn: {
    padding: 6,
  },
  closeIconText: {
    fontSize: 18,
    color: colors.inkMuted,
  },
  scrollArea: {
    marginBottom: 10,
  },
  primaryBox: {
    backgroundColor: colors.paper,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
  },
  kannadaDisplay: {
    fontFamily: typography.kannada.fontFamily,
    fontSize: 34,
    color: colors.ink,
    lineHeight: 46,
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  sourcePill: {
    backgroundColor: "rgba(47, 111, 235, 0.10)",
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sourcePillText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.link,
    fontWeight: "600",
  },
  attentionPill: {
    backgroundColor: "rgba(180, 118, 31, 0.12)",
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  attentionPillText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.attention,
    fontWeight: "700",
  },
  subHeader: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  formulaNote: {
    fontFamily: typography.code.fontFamily,
    fontSize: 11,
    color: colors.inkMuted,
    marginBottom: 12,
  },
  candidateCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    borderRadius: radii.card,
    padding: 12,
    marginBottom: 8,
  },
  selectedCandidateCard: {
    borderColor: colors.protected,
    backgroundColor: "rgba(63, 125, 92, 0.04)",
  },
  candTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  candNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  candRank: {
    fontFamily: typography.code.fontFamily,
    fontSize: 12,
    color: colors.inkMuted,
    marginRight: 6,
  },
  candKannada: {
    fontFamily: typography.kannada.fontFamily,
    fontSize: 18,
    color: colors.ink,
    fontWeight: "600",
    marginRight: 8,
  },
  activeCheck: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.protected,
    fontWeight: "700",
  },
  candScore: {
    fontFamily: typography.code.fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  factorsRow: {
    flexDirection: "row",
    backgroundColor: colors.code,
    borderRadius: 8,
    padding: 8,
    justifyContent: "space-around",
  },
  factorCol: {
    alignItems: "center",
  },
  factorLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 9,
    color: colors.inkMuted,
  },
  factorVal: {
    fontFamily: typography.code.fontFamily,
    fontSize: 12,
    color: colors.ink,
    fontWeight: "600",
  },
});
