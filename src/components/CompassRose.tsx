import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface CompassRoseProps {
  heading: number; // 0 a 360
  cardinal: string;
  size?: number;
}

export const CompassRose: React.FC<CompassRoseProps> = ({
  heading,
  cardinal,
  size = 280,
}) => {
  const animatedRoseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(`${-heading}deg`, { duration: 150 }) }],
    };
  }, [heading]);

  return (
    <View
      accessible={true}
      accessibilityLabel={`Brújula de orientación. Rumbo: ${heading} grados, Dirección cardinal: ${cardinal}`}
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {/* Marcador fijo Norte del dispositivo */}
      <View style={styles.fixedNeedle} />

      {/* Disco giratorio con los puntos cardinales */}
      <Animated.View style={[styles.dial, animatedRoseStyle]}>
        <Text style={[styles.pointText, styles.pointN]}>N</Text>
        <Text style={[styles.pointText, styles.pointE]}>E</Text>
        <Text style={[styles.pointText, styles.pointS]}>S</Text>
        <Text style={[styles.pointText, styles.pointO]}>O</Text>

        <View style={styles.needleNorth} />
        <View style={styles.needleSouth} />
      </Animated.View>

      {/* Lectura en el centro */}
      <View style={styles.centerBadge}>
        <Text style={styles.headingValue}>{heading}°</Text>
        <Text style={styles.cardinalValue}>{cardinal}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#334155",
    position: "relative",
  },
  fixedNeedle: {
    position: "absolute",
    top: 6,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#EF4444",
    zIndex: 10,
  },
  dial: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pointText: {
    position: "absolute",
    fontWeight: "bold",
    fontSize: 18,
    color: "#E2E8F0",
  },
  pointN: {
    top: 24,
    color: "#EF4444",
  },
  pointE: {
    right: 24,
  },
  pointS: {
    bottom: 24,
  },
  pointO: {
    left: 24,
  },
  needleNorth: {
    position: "absolute",
    top: 50,
    width: 4,
    height: 60,
    backgroundColor: "#EF4444",
  },
  needleSouth: {
    position: "absolute",
    bottom: 50,
    width: 4,
    height: 60,
    backgroundColor: "#94A3B8",
  },
  centerBadge: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1E293B",
    borderWidth: 2,
    borderColor: "#475569",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  headingValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  cardinalValue: {
    fontSize: 12,
    color: "#38BDF8",
    fontWeight: "600",
  },
});
