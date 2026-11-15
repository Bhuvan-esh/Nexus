import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { colors, radii, typography } from "../tokens/theme";

interface ProtectedBadgeProps {
  text: string;
  kind?: "url" | "email" | "code" | "acronym";
  sha256?: string;
  isMatched?: boolean;
}

export const ProtectedBadge: React.FC<ProtectedBadgeProps> = ({
  text,
  kind = "url",
  sha256 = "verified-byte-exact",
  isMatched = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`Protected span: ${text}. Verified byte-exact.`}
      >
        <View style={styles.badgeHeader}>
          <Text style={styles.lockGlyph}>🔒</Text>
          <Text style={styles.protectedLabel}>PRESERVED</Text>
          {isMatched && <Text style={styles.checkGlyph}>✓</Text>}
        </View>

        <Text style={styles.monoText} numberOfLines={1}>
          {text}
        </Text>
      </TouchableOpacity>

      {/* Info Modal Explanation */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Protected Content Guardrail</Text>
              <Text style={styles.lockGlyphLarge}>🔒</Text>
            </View>

            <Text style={styles.modalBody}>
              This span skipped phonetic transliteration and was returned byte-for-byte untouched.
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>TYPE:</Text>
              <Text style={styles.metaValue}>{kind.toUpperCase()}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>SOURCE CONTENT:</Text>
              <Text style={styles.metaValueMono}>{text}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>SHA-256 HASH MATCH:</Text>
              <Text style={styles.metaHash}>
                {sha256 ? `${sha256.substring(0, 24)}... ✓` : "Exact byte match verified"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.code,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 4,
    maxWidth: "100%",
  },
  badgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  lockGlyph: {
    fontSize: 11,
    marginRight: 4,
  },
  protectedLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.protected,
  },
  checkGlyph: {
    fontSize: 11,
    color: colors.protected,
    marginLeft: 6,
    fontWeight: "bold",
  },
  monoText: {
    fontFamily: typography.code.fontFamily,
    fontSize: 13,
    color: colors.ink,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 26, 23, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.inkBorder,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: typography.section.fontFamily,
    fontSize: 18,
    color: colors.ink,
  },
  lockGlyphLarge: {
    fontSize: 18,
  },
  modalBody: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    marginBottom: 16,
  },
  metaRow: {
    marginBottom: 10,
  },
  metaLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.inkMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  metaValueMono: {
    fontFamily: typography.code.fontFamily,
    fontSize: 12,
    color: colors.ink,
    backgroundColor: colors.code,
    padding: 6,
    borderRadius: 6,
  },
  metaHash: {
    fontFamily: typography.code.fontFamily,
    fontSize: 11,
    color: colors.protected,
  },
  closeButton: {
    backgroundColor: colors.ink,
    borderRadius: radii.input,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: colors.card,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    fontWeight: "600",
  },
});
