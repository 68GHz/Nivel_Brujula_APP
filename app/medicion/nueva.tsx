import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import { MedicionRepository } from "../../src/repositories/medicion.repository";

export default function NuevaMedicionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    tipo: "nivel" | "rumbo" | "altitud";
    valor: string;
    unidad: string;
  }>();

  const [nota, setNota] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          setCoords({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
        }
      } catch {
        // Fallback: continúa sin ubicación
      }
    }
    fetchLocation();
  }, []);

  const handleGuardar = async () => {
    if (!params.tipo || !params.valor || !params.unidad) {
      Alert.alert("Error", "Faltan datos de la medición");
      return;
    }

    setIsSaving(true);
    try {
      const id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      await MedicionRepository.insert({
        id,
        tipo: params.tipo,
        valor: parseFloat(params.valor),
        unidad: params.unidad,
        nota: nota.trim() || null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        medida_en: new Date().toISOString(),
      });

      Alert.alert("Éxito", "Medición guardada en la base de datos local", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch {
      Alert.alert("Error", "No se pudo guardar la medición");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>LECTURA ACTUAL</Text>
        <Text style={styles.summaryValue}>
          {params.valor} {params.unidad}
        </Text>
        <Text style={styles.summaryType}>Tipo: {params.tipo?.toUpperCase()}</Text>
        {coords && (
          <Text style={styles.summaryGeo}>
            📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </Text>
        )}
      </View>

      <Text style={styles.inputLabel}>Nota o ubicación descriptiva:</Text>
      <TextInput
        accessible={true}
        accessibilityLabel="Campo de texto para nota o descripción de la medición"
        style={styles.textInput}
        placeholder="Ej. Pared de la cocina, Estante taller..."
        placeholderTextColor="#64748B"
        value={nota}
        onChangeText={setNota}
        maxLength={200}
      />

      <TouchableOpacity
        accessible={true}
        accessibilityLabel="Confirmar y guardar medición en base de datos local"
        style={styles.saveBtn}
        disabled={isSaving}
        onPress={handleGuardar}
      >
        <Text style={styles.saveBtnText}>
          {isSaving ? "Guardando..." : "Confirmar y Guardar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 16,
  },
  summaryCard: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  summaryTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  summaryType: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  summaryGeo: {
    color: "#10B981",
    fontSize: 12,
    marginTop: 6,
  },
  inputLabel: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    color: "#FFFFFF",
    padding: 14,
    fontSize: 15,
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
