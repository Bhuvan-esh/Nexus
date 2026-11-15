import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  AccessibilityInfo,
  Text,
} from "react-native";
import { colors } from "../tokens/theme";

export type OrbState = "idle" | "typing" | "thinking" | "resolved";

interface OrbProps {
  state: OrbState;
  completedStages?: number; // 0 to 7
  onPress: () => void;
  disabled?: boolean;
}

const TOTAL_PARTICLES = 7;

/**
 * Signature Element: The NEXUS Orb (§4)
 * - 72 pt tap target
 * - Four states: Idle (4s breath), Typing (accent ring ripple),
 *   Thinking (7 orbiting stage particles), Resolved (green pulse)
 * - Doubles as the primary Send action
 */
export const Orb: React.FC<OrbProps> = ({
  state,
  completedStages = 0,
  onPress,
  disabled = false,
}) => {
  // Animations
  const breathAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Idle Breathing Loop (4 s cycle)
  useEffect(() => {
    let breathLoop: Animated.CompositeAnimation | null = null;
    if (state === "idle") {
      breathLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathAnim, {
            toValue: 1.06,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(breathAnim, {
            toValue: 1.0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      breathLoop.start();
    } else {
      breathAnim.setValue(1);
    }

    return () => {
      if (breathLoop) breathLoop.stop();
    };
  }, [state]);

  // Orbit Rotation for Thinking state
  useEffect(() => {
    let orbitLoop: Animated.CompositeAnimation | null = null;
    if (state === "thinking") {
      rotateAnim.setValue(0);
      orbitLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        })
      );
      orbitLoop.start();
    }
    return () => {
      if (orbitLoop) orbitLoop.stop();
    };
  }, [state]);

  // Resolved Pulse
  useEffect(() => {
    if (state === "resolved") {
      pulseAnim.setValue(0);
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state]);

  // Accessibility Announcements
  useEffect(() => {
    const announcements: Record<OrbState, string> = {
      idle: "Ready to transliterate",
      typing: "Typing detected",
      thinking: `Processing pipeline. Stage ${completedStages} of 7.`,
      resolved: "Transliteration resolved successfully",
    };
    AccessibilityInfo.announceForAccessibility(announcements[state]);
  }, [state, completedStages]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || state === "thinking"}
      style={styles.touchTarget}
      accessibilityRole="button"
      accessibilityLabel={`Send and transliterate. Current state: ${state}`}
    >
      <View style={styles.container}>
        {/* State: Typing Accent Ring */}
        {state === "typing" && <View style={styles.typingRing} />}

        {/* State: Resolved Pulse Ring */}
        {state === "resolved" && (
          <Animated.View
            style={[
              styles.resolvedRing,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.4],
                    }),
                  },
                ],
              },
            ]}
          />
        )}

        {/* State: Thinking 7 Orbiting Particles */}
        {state === "thinking" && (
          <Animated.View
            style={[
              styles.particleOrbit,
              { transform: [{ rotate: spin }] },
            ]}
          >
            {Array.from({ length: TOTAL_PARTICLES }).map((_, i) => {
              const angle = (i * 2 * Math.PI) / TOTAL_PARTICLES;
              const radius = 32;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isStageDone = i < completedStages;

              return (
                <View
                  key={i}
                  style={[
                    styles.particle,
                    {
                      transform: [{ translateX: x }, { translateY: y }],
                      backgroundColor: isStageDone ? colors.accent : "rgba(200, 85, 61, 0.25)",
                    },
                  ]}
                />
              );
            })}
          </Animated.View>
        )}

        {/* Central Core Sphere */}
        <Animated.View
          style={[
            styles.coreSphere,
            state === "idle" && { transform: [{ scale: breathAnim }] },
            state === "typing" && styles.coreTyping,
            state === "thinking" && styles.coreThinking,
            state === "resolved" && styles.coreResolved,
          ]}
        >
          {/* Subtle inner arrow / dot glyph */}
          <Text
            style={[
              styles.arrowGlyph,
              state === "typing" && { color: colors.card },
              state === "resolved" && { color: "#FFFFFF" },
            ]}
          >
            {state === "thinking" ? "•" : state === "resolved" ? "✓" : "↑"}
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchTarget: {
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  coreSphere: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  coreTyping: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  coreThinking: {
    backgroundColor: colors.card,
    borderColor: colors.inkBorder,
  },
  coreResolved: {
    backgroundColor: colors.protected,
    borderColor: colors.protected,
  },
  typingRing: {
    position: "absolute",
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    borderColor: colors.accent,
    opacity: 0.6,
  },
  resolvedRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.protected,
  },
  particleOrbit: {
    position: "absolute",
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  arrowGlyph: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.ink,
  },
});
