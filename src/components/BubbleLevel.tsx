import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface BubbleLevelProps {
  pitch: number; // Inclinación en X (-90 a 90)
  roll: number;  // Inclinación en Y (-90 a 90)
  isLevel: boolean;
  size?: number;
}

export const BubbleLevel: React.FC<BubbleLevelProps> = ({
  pitch,
  roll,
  isLevel,
  size = 280,
}) => {
  const radius = size / 2;
  const bubbleSize = 56;
  const maxDisplacement = radius - bubbleSize / 2 - 10;

  // Mapear grados (-90 a 90) a posición pixel (-max a max)
  const posX = Math.max(-maxDisplacement, Math.min(maxDisplacement, (roll / 45) * maxDisplacement));
  const posY = Math.max(-maxDisplacement, Math.min(maxDisplacement, (pitch / 45) * maxDisplacement));

  const animatedBubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withSpring(posX, { damping: 15 }) },
        { translateY: withSpring(posY, { damping: 15 }) },
      ],
    };
  }, [posX, posY]);

  return (
    <View
      accessible={true}
      accessibilityLabel={`Nivel de burbuja. Inclinación X: ${pitch} grados, Inclinación Y: ${roll} grados. ${
        isLevel ? "La superficie está nivelada" : "Superficie no nivelada"
      }`}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: radius },
        isLevel ? styles.levelBorder : styles.unlevelBorder,
      ]}
    >
      {/* Guías centrales */}
      <View style={styles.crosshairH} />
      <View style={styles.crosshairV} />
      <View style={[styles.targetCircle, { width: bubbleSize + 16, height: bubbleSize + 16, borderRadius: (bubbleSize + 16) / 2 }]} />

      {/* Burbuja animada */}
      <Animated.View
        style={[
          styles.bubble,
          { width: bubbleSize, height: bubbleSize, borderRadius: bubbleSize / 2 },
          isLevel ? styles.bubbleLevel : styles.bubbleNormal,
          animatedBubbleStyle,
        ]}
      />

      {/* Indicador de estado */}
      <View style={[styles.statusBadge, isLevel ? styles.statusLevel : styles.statusUnlevel]}>
        <Text style={styles.statusText}>{isLevel ? "✓ NIVELADO" : "NO NIVELADO"}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    overflow: "hidden",
    position: "relative",
  },
  levelBorder: {
    borderColor: "#10B981",
  },
  unlevelBorder: {
    borderColor: "#475569",
  },
  crosshairH: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  crosshairV: {
    position: "absolute",
    height: "100%",
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  targetCircle: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
  },
  bubble: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  bubbleNormal: {
    backgroundColor: "#38BDF8",
  },
  bubbleLevel: {
    backgroundColor: "#10B981",
  },
  statusBadge: {
    position: "absolute",
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusLevel: {
    backgroundColor: "#065F46",
  },
  statusUnlevel: {
    backgroundColor: "#334155",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
