import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { colors, radii, shadows, typography } from "../tokens/theme";
import { Orb, OrbState } from "./Orb";

interface ComposerProps {
  onSend: (text: string) => void;
  isProcessing: boolean;
  completedStages: number;
}

const MAX_CHAR_LIMIT = 500;

export const Composer: React.FC<ComposerProps> = ({
  onSend,
  isProcessing,
  completedStages,
}) => {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Validate on change
  const handleChange = (val: string) => {
    setText(val);

    if (!val.trim()) {
      setError(null);
      return;
    }

    // Check non-Latin characters (allowing standard punctuation, digits, symbols, whitespace)
    const nonLatinRegex = /[^\u0000-\u007F\u00A0-\u00FF]/;
    if (nonLatinRegex.test(val)) {
      setError("NEXUS accepts English text in Latin script only.");
      return;
    }

    if (val.length > MAX_CHAR_LIMIT) {
      setError(`Input exceeds limit of ${MAX_CHAR_LIMIT} characters.`);
      return;
    }

    setError(null);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter English text to transliterate.");
      return;
    }
    if (error) return;

    onSend(trimmed);
    setText("");
    setError(null);
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (Platform.OS === "web") {
      const nativeEvent = e.nativeEvent as any;
      if (nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
        nativeEvent.preventDefault();
        handleSend();
      }
    }
  };

  // Determine Orb State
  let orbState: OrbState = "idle";
  if (isProcessing) {
    orbState = "thinking";
  } else if (text.trim().length > 0) {
    orbState = "typing";
  }

  const charCount = text.length;
  const isNearLimit = charCount > MAX_CHAR_LIMIT * 0.85;

  return (
    <View style={styles.outerContainer}>
      {/* Inline Validation Warning in 'attention' amber with glyph */}
      {error && (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text style={styles.errorGlyph}>▲</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        {/* Multiline Composer */}
        <TextInput
          style={styles.textInput}
          placeholder="Type English text to transliterate into Kannada..."
          placeholderTextColor={colors.inkMuted}
          multiline
          maxLength={MAX_CHAR_LIMIT + 50}
          value={text}
          onChangeText={handleChange}
          onKeyPress={handleKeyPress}
          editable={!isProcessing}
          accessibilityLabel="English input"
        />

        {/* Character Counter & Orb Send Target */}
        <View style={styles.actionRow}>
          <Text
            style={[
              styles.charCounter,
              isNearLimit && { color: colors.attention },
              charCount > MAX_CHAR_LIMIT && { color: colors.accent },
            ]}
          >
            {charCount}/{MAX_CHAR_LIMIT}
          </Text>

          <Orb
            state={orbState}
            completedStages={completedStages}
            onPress={handleSend}
            disabled={isProcessing || !!error || !text.trim()}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: "transparent",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF5E6",
    borderColor: colors.attention,
    borderWidth: 1,
    borderRadius: radii.input,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  errorGlyph: {
    color: colors.attention,
    fontSize: 12,
    marginRight: 6,
  },
  errorText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.ink,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.inkBorder,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  textInput: {
    flex: 1,
    minHeight: 52,
    maxHeight: 120,
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
    paddingTop: 14,
    paddingBottom: 14,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  charCounter: {
    fontFamily: typography.code.fontFamily,
    fontSize: 11,
    color: colors.inkMuted,
    marginRight: 4,
  },
});
