import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import { BubbleLevel } from "../../src/components/BubbleLevel";
import { useDeviceMotionLevel } from "../../src/sensors/use-device-motion";

export default function NivelScreen() {
  const router = useRouter();
  const {
    isAvailable,
    pitch,
    roll,
    isLevel,
    isFrozen,
    offsets,
    calibrateZero,
    adjustFine,
    toggleFreeze,
  } = useDeviceMotionLevel();

  // 1. Gesto de Doble Toque: Congelar/descongelar lectura
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      toggleFreeze();
    });

  // 2. Gesto de Mantener Presionado: Calibrar a cero
  const longPressGesture = Gesture.LongPress()
    .minDuration(800)
    .onEnd(() => {
      calibrateZero();
    });

  // 3. Gesto de Arrastre Vertical (Pan): Ajuste fino de calibración en pasos de 0.1°
  const panGesture = Gesture.Pan().onEnd((e) => {
    if (e.translationY < -20) {
      adjustFine(0.1, 0); // Deslizar arriba: +0.1° en X
    } else if (e.translationY > 20) {
      adjustFine(-0.1, 0); // Deslizar abajo: -0.1° en X
    }
  });

  const composedGestures = Gesture.Simultaneous(
    doubleTapGesture,
    longPressGesture,
    panGesture
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isAvailable === false && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            Sensor de movimiento no disponible. Modo simulación activo.
          </Text>
        </View>
      )}

      {/* Área interactiva con gestos */}
      <GestureDetector gesture={composedGestures}>
        <View style={styles.bubbleArea}>
          <BubbleLevel pitch={pitch} roll={roll} isLevel={isLevel} />
          {isFrozen && (
            <View style={styles.freezeBadge}>
              <Text style={styles.freezeText}>LECTURA CONGELADA</Text>
            </View>
          )}
        </View>
      </GestureDetector>

      {/* Lecturas numéricas accesibles */}
      <View style={styles.readingsCard}>
        <View style={styles.readingCol}>
          <Text style={styles.readingLabel}>ÁNGULO X (Pitch)</Text>
          <Text style={styles.readingValue}>{pitch}°</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.readingCol}>
          <Text style={styles.readingLabel}>ÁNGULO Y (Roll)</Text>
          <Text style={styles.readingValue}>{roll}°</Text>
        </View>
      </View>

      {/* Ajustes de calibración activos */}
      <View style={styles.offsetsRow}>
        <Text style={styles.offsetText}>
          Calibración activa: X: {offsets.offsetX}° | Y: {offsets.offsetY}°
        </Text>
      </View>

      {/* Alternativas por botones accesibles (Cumplimiento de accesibilidad) */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          accessible={true}
          accessibilityLabel={isFrozen ? "Descongelar lectura" : "Congelar lectura"}
          style={[styles.actionButton, isFrozen ? styles.btnActive : styles.btnSecondary]}
          onPress={toggleFreeze}
        >
          <Text style={styles.btnText}>{isFrozen ? "Descongelar" : "Congelar (Doble toque)"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessible={true}
          accessibilityLabel="Calibrar el cero sobre la posición actual"
          style={[styles.actionButton, styles.btnPrimary]}
          onPress={calibrateZero}
        >
          <Text style={styles.btnTextPrimary}>Calibrar Cero (Mantener)</Text>
        </TouchableOpacity>
      </View>

      {/* Ajuste fino accesible */}
      <View style={styles.fineTuneRow}>
        <Text style={styles.fineTuneLabel}>Ajuste fino (±0.1°):</Text>
        <TouchableOpacity
          accessibilityLabel="Ajustar inclinación X más 0.1 grados"
          style={styles.tuneBtn}
          onPress={() => adjustFine(0.1, 0)}
        >
          <Text style={styles.tuneBtnText}>+0.1° X</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Ajustar inclinación X menos 0.1 grados"
          style={styles.tuneBtn}
          onPress={() => adjustFine(-0.1, 0)}
        >
          <Text style={styles.tuneBtnText}>-0.1° X</Text>
        </TouchableOpacity>
      </View>

      {/* Botón para guardar medición */}
      <TouchableOpacity
        accessible={true}
        accessibilityLabel="Guardar esta medición de nivel con nota y lugar"
        style={styles.saveBtn}
        onPress={() => {
          router.push({
            pathname: "/medicion/nueva",
            params: {
              tipo: "nivel",
              valor: pitch.toString(),
              unidad: "grados",
            },
          });
        }}
      >
        <Text style={styles.saveBtnText}>Guardar Medición</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#0F172A",
    minHeight: "100%",
  },
  warningBanner: {
    backgroundColor: "#B45309",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
  },
  warningText: {
    color: "#FEF3C7",
    textAlign: "center",
    fontSize: 12,
  },
  bubbleArea: {
    marginVertical: 16,
    alignItems: "center",
    position: "relative",
  },
  freezeBadge: {
    position: "absolute",
    top: 10,
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  freezeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 11,
  },
  readingsCard: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  readingCol: {
    alignItems: "center",
  },
  readingLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  readingValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  divider: {
    width: 1,
    height: "80%",
    backgroundColor: "#334155",
  },
  offsetsRow: {
    marginBottom: 12,
  },
  offsetText: {
    color: "#64748B",
    fontSize: 12,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondary: {
    backgroundColor: "#334155",
  },
  btnActive: {
    backgroundColor: "#DC2626",
  },
  btnPrimary: {
    backgroundColor: "#0284C7",
  },
  btnText: {
    color: "#F8FAFC",
    fontWeight: "600",
    fontSize: 13,
  },
  btnTextPrimary: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  fineTuneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  fineTuneLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },
  tuneBtn: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#475569",
  },
  tuneBtnText: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "bold",
  },
  saveBtn: {
    backgroundColor: "#10B981",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});
