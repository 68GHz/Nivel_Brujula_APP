import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  MedicionEntity,
  MedicionRepository,
} from "../../src/repositories/medicion.repository";
import { apiFetch } from "../../src/api/client";

export default function MedicionesScreen() {
  const [mediciones, setMediciones] = useState<MedicionEntity[]>([]);
  const [filtro, setFiltro] = useState<string>("todos");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const cargarMediciones = async () => {
    const items = await MedicionRepository.getAll(filtro);
    setMediciones(items);
  };

  useEffect(() => {
    cargarMediciones();
  }, [filtro]);

  // Sincronización offline-first con la API
  const syncWithApi = async () => {
    setIsSyncing(true);
    try {
      const pending = await MedicionRepository.getPending();
      for (const item of pending) {
        if (item.deleted === 1) {
          await apiFetch(`/api/mediciones/${item.id}`, { method: "DELETE" });
        } else {
          await apiFetch(`/api/mediciones/${item.id}`, {
            method: "PUT",
            body: JSON.stringify({
              id: item.id,
              tipo: item.tipo,
              valor: item.valor,
              unidad: item.unidad,
              nota: item.nota,
              lat: item.lat,
              lng: item.lng,
              medida_en: item.medida_en,
            }),
          });
        }
        await MedicionRepository.markAsSynced(item.id, new Date().toISOString());
      }
      await cargarMediciones();
      Alert.alert("Sincronización", "Mediciones sincronizadas con éxito");
    } catch {
      Alert.alert("Aviso", "No se pudo sincronizar con la API. Modo offline.");
    } finally {
      setIsSyncing(false);
    }
  };

  const eliminarMedicion = async (id: string) => {
    await MedicionRepository.softDelete(id);
    await cargarMediciones();
  };

  return (
    <View style={styles.container}>
      {/* Barra de filtros */}
      <View style={styles.filterBar}>
        {["todos", "nivel", "rumbo", "altitud"].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            accessible={true}
            accessibilityLabel={`Filtrar por ${tipo}`}
            style={[styles.filterBtn, filtro === tipo && styles.filterBtnActive]}
            onPress={() => setFiltro(tipo)}
          >
            <Text
              style={[
                styles.filterText,
                filtro === tipo && styles.filterTextActive,
              ]}
            >
              {tipo.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón de Sincronización */}
      <TouchableOpacity
        accessible={true}
        accessibilityLabel="Sincronizar mediciones pendientes con el servidor"
        style={styles.syncBtn}
        disabled={isSyncing}
        onPress={syncWithApi}
      >
        <Text style={styles.syncBtnText}>
          {isSyncing ? "Sincronizando..." : "🔄 Sincronizar con Servidor"}
        </Text>
      </TouchableOpacity>

      {/* Lista de mediciones */}
      <FlatList
        data={mediciones}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay mediciones guardadas.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            accessible={true}
            accessibilityLabel={`Medición de ${item.tipo}, valor ${item.valor} ${item.unidad}, nota: ${item.nota || "sin nota"}`}
            style={styles.itemCard}
          >
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemType}>{item.tipo.toUpperCase()}</Text>
                <Text style={styles.itemDate}>
                  {new Date(item.medida_en).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.itemValue}>
                {item.valor} {item.unidad}
              </Text>
              {item.nota && <Text style={styles.itemNota}>{item.nota}</Text>}
              {item.lat !== null && item.lng !== null && (
                <Text style={styles.itemGeo}>
                  📍 {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                </Text>
              )}
            </View>

            {/* Alternativa por botón para eliminar accesible */}
            <TouchableOpacity
              accessible={true}
              accessibilityLabel={`Eliminar medición de ${item.tipo}`}
              style={styles.deleteBtn}
              onPress={() => eliminarMedicion(item.id)}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 16,
  },
  filterBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#1E293B",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  filterBtnActive: {
    backgroundColor: "#0284C7",
    borderColor: "#38BDF8",
  },
  filterText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "bold",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  syncBtn: {
    backgroundColor: "#334155",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  syncBtnText: {
    color: "#38BDF8",
    fontWeight: "600",
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 24,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemType: {
    color: "#38BDF8",
    fontWeight: "bold",
    fontSize: 12,
  },
  itemDate: {
    color: "#64748B",
    fontSize: 11,
  },
  itemValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemNota: {
    color: "#CBD5E1",
    fontSize: 13,
    marginBottom: 2,
  },
  itemGeo: {
    color: "#64748B",
    fontSize: 11,
  },
  deleteBtn: {
    backgroundColor: "#7F1D1D",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  deleteBtnText: {
    color: "#FCA5A5",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
  },
});
