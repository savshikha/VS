import { useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Meaning({ number, content, synonyms, example }) {
  const { colors } = useTheme();
  const muted = colors.text + "A6";

  return (
    <View style={styles.block}>
      <View style={styles.container}>
        <Text style={[styles.type, styles.count, { color: colors.text }]}>
          {number}.
        </Text>
        <View style={styles.body}>
          <Text style={[styles.type, { color: colors.text }]}>{content}</Text>
          {example ? (
            <Text style={[styles.example, { color: muted }]}>“{example}”</Text>
          ) : null}
          {synonyms && synonyms.length > 0 ? (
            <Text style={[styles.synonyms, { color: muted }]}>
              <Text style={styles.synonymsLabel}>Synonyms: </Text>
              {synonyms.join(", ")}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 15,
  },
  container: {
    flex: 1,
    flexDirection: "row",
  },
  body: {
    width: "93%",
  },
  count: {
    width: "7%",
    paddingTop: 1,
  },
  type: {
    fontFamily: "iA Writer Quattro",
    fontWeight: "400",
    lineHeight: 18,
    fontSize: 14,
    letterSpacing: -0.02,
    color: "#000000",
  },
  example: {
    fontFamily: "iA Writer Quattro Italic",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    fontStyle: "italic",
  },
  synonyms: {
    fontFamily: "iA Writer Quattro",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  synonymsLabel: {
    fontWeight: "600",
  },
});
