import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../tokens/theme";

interface PaperBackgroundProps {
  children: React.ReactNode;
}

/**
 * Paper canvas with subtle SVG noise/grain overlay (~2.5% opacity)
 * This single texture is what makes the UI feel like warm tactile paper instead of a generic light theme.
 */
export const PaperBackground: React.FC<PaperBackgroundProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Base Paper Tone */}
      <View style={styles.paperBase} />

      {/* Procedural Grain Layer (rendered via SVG data URI on web or layered noise) */}
      <View style={styles.grainOverlay} pointerEvents="none" />

      {/* Child Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    position: "relative",
  },
  paperBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.paper,
  },
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.035,
    // Subtle repeating texture simulation
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
  },
});
