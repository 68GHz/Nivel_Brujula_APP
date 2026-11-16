import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0F172A" },
        headerTintColor: "#F8FAFC",
        tabBarStyle: {
          backgroundColor: "#0F172A",
          borderTopColor: "#334155",
        },
        tabBarActiveTintColor: "#38BDF8",
        tabBarInactiveTintColor: "#64748B",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Nivel de Burbuja",
          tabBarLabel: "Nivel",
          headerTitle: "Nivel de Burbuja",
        }}
      />
      <Tabs.Screen
        name="brujula"
        options={{
          title: "Brújula y Altitud",
          tabBarLabel: "Brújula",
          headerTitle: "Brújula y Altitud",
        }}
      />
      <Tabs.Screen
        name="mediciones"
        options={{
          title: "Historial de Mediciones",
          tabBarLabel: "Historial",
          headerTitle: "Historial",
        }}
      />
    </Tabs>
  );
}
