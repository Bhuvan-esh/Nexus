import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radii, typography } from "../tokens/theme";

interface StarterChipsProps {
  onSelectChip: (text: string) => void;
}

const STARTER_CHIPS = [
  { label: "Hello", type: "Common word" },
  { label: "Good morning", type: "Multi-word phrase" },
  { label: "Machine learning", type: "Technical vocabulary" },
  { label: "Bangalore", type: "Proper noun (City)" },
  { label: "Bhuvanesh", type: "Personal name" },
  { label: "https://example.com", type: "Protected span" },
];

export const StarterChips: React.FC<StarterChipsProps> = ({ onSelectChip }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>NEXUS</Text>
      
      {/* Scope Guardrail Line */}
      <View style={styles.scopeBox}>
        <Text style={styles.scopeText}>
          <Text style={styles.boldText}>Scope Guardrail:</Text> NEXUS transliterates pronunciation into Kannada script, it does not translate meaning.{" "}
          <Text style={styles.exampleText}>"Hello" → ಹೆಲ್ಲೋ</Text> (never ನಮಸ್ಕಾರ).
        </Text>
      </View>

      <Text style={styles.chipsLabel}>EXPLORE ILLUSTRATIVE EXAMPLES</Text>

      <View style={styles.chipsGrid}>
        {STARTER_CHIPS.map((chip, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.chip}
            activeOpacity={0.7}
            onPress={() => onSelectChip(chip.label)}
            accessibilityRole="button"
            accessibilityLabel={`Try example: ${chip.label}`}
          >
            <Text style={styles.chipText}>{chip.label}</Text>
            <Text style={styles.chipCategory}>{chip.type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.display.fontFamily,
    fontSize: typography.display.fontSize,
    lineHeight: typography.display.lineHeight,
    fontWeight: "500",
    color: colors.ink,
    letterSpacing: 2,
    marginBottom: 12,
  },
  scopeBox: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 540,
    marginBottom: 28,
  },
  scopeText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    textAlign: "center",
  },
  boldText: {
    fontWeight: "600",
    color: colors.accent,
  },
  exampleText: {
    fontFamily: typography.code.fontFamily,
    backgroundColor: colors.code,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  chipsLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: typography.label.fontSize,
    letterSpacing: typography.label.letterSpacing,
    color: colors.inkMuted,
    marginBottom: 14,
  },
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    maxWidth: 580,
  },
  chip: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  chipText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    fontWeight: "500",
    color: colors.ink,
    marginBottom: 2,
  },
  chipCategory: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.inkMuted,
    textTransform: "uppercase",
  },
});
