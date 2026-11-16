# Bitácora de Configuración de IA - Nivel_Brujula_APP

## 1. Propósito
Establecer las restricciones de seguridad, gobernanza y reglas de codificación para el asistente de IA en el repositorio de la aplicación móvil (`Nivel_Brujula_APP`), cumpliendo con la Sección 14 de las especificaciones del proyecto y `AGENTS.md`.

## 2. Restricciones Verificadas
1. **Ausencia Total de Credenciales:** La app cliente jamás debe contener llaves privadas, API keys de Firebase Admin ni secretos. `EXPO_PUBLIC_API_URL` es la única variable expuesta.
2. **Tokens Seguros:** Los tokens de sesión (ID token y refresh token) se almacenan exclusivamente en `expo-secure-store`, prohibiendo `AsyncStorage`.
3. **Resiliencia de Sensores:** Todos los sensores (`DeviceMotion`, `Magnetometer`, `Barometer`) cuentan con comprobación previa `isAvailableAsync()` y alternativas por botones accesibles.
4. **Offline-First:** Persistencia primaria en SQLite local antes de sincronizar con la API en Vercel.

## 3. Decisiones de Arquitectura
- Framework: Expo (React Native) + Expo Router con TypeScript estricto.
- Base de datos local: `expo-sqlite` con control de migraciones y banderas de sincronización (`pending`, `updated_at`, `deleted`).
- Sensores y Gestos: `expo-sensors`, `react-native-gesture-handler` y `react-native-reanimated`.
- Accesibilidad: Cada acción realizada por gestos tiene su botón alternativo con `accessibilityLabel`.
