import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { CompassRose } from "../../src/components/CompassRose";
import { useCompass } from "../../src/sensors/use-compass";
import { useAltitude } from "../../src/sensors/use-altitude";

export default function BrujulaScreen() {
  const router = useRouter();
  const { isAvailable, heading, cardinal } = useCompass();
  const { pressure, altitude, source } = useAltitude();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isAvailable === false && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            Sensor magnetómetro no disponible en este dispositivo.
          </Text>
        </View>
      )}

      {/* Rosa de los vientos */}
      <View style={styles.compassContainer}>
        <CompassRose heading={heading} cardinal={cardinal} />
      </View>

      {/* Tarjeta de rumbo */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>RUMBO MAGNÉTICO</Text>
        <Text style={styles.headingValue}>
          {heading}° <Text style={styles.cardinalValue}>({cardinal})</Text>
        </Text>
      </View>

      {/* Tarjeta de altitud y barómetro */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ALTITUD ESTIMADA ({source.toUpperCase()})</Text>
        <Text style={styles.altValue}>
          {altitude !== null ? `${altitude} m` : "Calculando..."}
        </Text>
        {pressure !== null && (
          <Text style={styles.pressureSub}>Presión barométrica: {pressure} hPa</Text>
        )}
      </View>

      {/* Botones para guardar mediciones */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          accessible={true}
          accessibilityLabel="Guardar lectura de rumbo actual"
          style={[styles.saveBtn, { backgroundColor: "#0284C7" }]}
          onPress={() => {
            router.push({
              pathname: "/medicion/nueva",
              params: {
                tipo: "rumbo",
                valor: heading.toString(),
                unidad: "grados",
              },
            });
          }}
        >
          <Text style={styles.saveBtnText}>Guardar Rumbo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessible={true}
          accessibilityLabel="Guardar lectura de altitud actual"
          style={[styles.saveBtn, { backgroundColor: "#10B981" }]}
          disabled={altitude === null}
          onPress={() => {
            if (altitude !== null) {
              router.push({
                pathname: "/medicion/nueva",
                params: {
                  tipo: "altitud",
                  valor: altitude.toString(),
                  unidad: "metros",
                },
              });
            }
          }}
        >
          <Text style={styles.saveBtnText}>Guardar Altitud</Text>
        </TouchableOpacity>
      </View>
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
  compassContainer: {
    marginVertical: 16,
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  headingValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  cardinalValue: {
    color: "#38BDF8",
    fontSize: 20,
  },
  altValue: {
    color: "#10B981",
    fontSize: 28,
    fontWeight: "bold",
  },
  pressureSub: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
