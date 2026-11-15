import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography } from "../tokens/theme";

interface MorphingMarkProps {
  triggerResolve?: boolean;
}

export const MorphingMark: React.FC<MorphingMarkProps> = ({ triggerResolve }) => {
  const [glyph, setGlyph] = useState<"A" | "ಕ">("A");
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const playMorph = () => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setGlyph((prev) => (prev === "A" ? "ಕ" : "A"));
    }, 150);
  };

  useEffect(() => {
    // Morph on trigger
    if (triggerResolve) {
      playMorph();
    }
  }, [triggerResolve]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={playMorph}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="NEXUS glyph mark. Latin A morphing to Kannada Ka."
    >
      <Animated.View style={[styles.markBox, { opacity: opacityAnim }]}>
        <Text style={[styles.glyphText, glyph === "ಕ" && styles.kannadaGlyph]}>
          {glyph}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  markBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  glyphText: {
    fontFamily: typography.display.fontFamily,
    fontSize: 18,
    fontWeight: "600",
    color: colors.accent,
  },
  kannadaGlyph: {
    fontFamily: typography.kannada.fontFamily,
    fontSize: 18,
  },
});
