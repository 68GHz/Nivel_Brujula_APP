export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface OrientationAngles {
  pitch: number; // Ángulo X en grados (-90 a 90)
  roll: number;  // Ángulo Y en grados (-90 a 90)
}

const RAD_TO_DEG = 180 / Math.PI;

/**
 * Calcula los ángulos de inclinación (pitch y roll) a partir del vector de aceleración/gravedad.
 * pitch: inclinación sobre el eje X
 * roll: inclinación sobre el eje Y
 */
export function calculateAnglesFromGravity(gravity: Vector3D): OrientationAngles {
  const { x, y, z } = gravity;

  // Pitch (eje X): rotación alrededor de X
  const pitchRad = Math.atan2(y, Math.sqrt(x * x + z * z));
  // Roll (eje Y): rotación alrededor de Y
  const rollRad = Math.atan2(-x, Math.sqrt(y * y + z * z));

  const pitch = pitchRad * RAD_TO_DEG;
  const roll = rollRad * RAD_TO_DEG;

  return {
    pitch: Math.max(-90, Math.min(90, parseFloat(pitch.toFixed(1)))),
    roll: Math.max(-90, Math.min(90, parseFloat(roll.toFixed(1)))),
  };
}

/**
 * Filtro paso bajo (Low-Pass Filter) para suavizar las lecturas y reducir ruido de vibración
 * @param current Valor instantáneo recibido del sensor
 * @param previous Valor anterior filtrado
 * @param alpha Factor de suavizado entre 0 (sin cambio) y 1 (sin filtro). Recomendado: 0.15 a 0.25
 */
export function lowPassFilter(current: number, previous: number, alpha = 0.2): number {
  const filtered = previous + alpha * (current - previous);
  return parseFloat(filtered.toFixed(2));
}

/**
 * Determina si la superficie se encuentra nivelada dentro del umbral de tolerancia
 * @param pitch Ángulo X calibrado
 * @param roll Ángulo Y calibrado
 * @param threshold Tolerancia en grados (por defecto ±0.5°)
 */
export function isLevel(pitch: number, roll: number, threshold = 0.5): boolean {
  return Math.abs(pitch) <= threshold && Math.abs(roll) <= threshold;
}

/**
 * Aplica el offset de calibración a los ángulos medidos
 */
export function applyCalibration(
  angles: OrientationAngles,
  offsets: { offsetX: number; offsetY: number }
): OrientationAngles {
  const calibratedPitch = angles.pitch - offsets.offsetX;
  const calibratedRoll = angles.roll - offsets.offsetY;

  return {
    pitch: Math.max(-90, Math.min(90, parseFloat(calibratedPitch.toFixed(1)))),
    roll: Math.max(-90, Math.min(90, parseFloat(calibratedRoll.toFixed(1)))),
  };
}

/**
 * Obtiene el punto cardinal a partir del rumbo magnético (0..360°)
 */
export function getCardinalDirection(heading: number): string {
  const normalized = ((heading % 360) + 360) % 360;
  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"
  ];
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index] || "N";
}

/**
 * Calcula la altitud en metros a partir de la presión atmosférica (hPa) usando la fórmula barométrica estándar
 * P0 = 1013.25 hPa a nivel del mar
 */
export function calculateAltitudeFromPressure(pressureHpa: number, seaLevelHpa = 1013.25): number {
  if (pressureHpa <= 0) return 0;
  // Fórmula hipsométrica estándar de la OACI
  const altitude = 44330 * (1 - Math.pow(pressureHpa / seaLevelHpa, 1 / 5.255));
  return Math.round(altitude);
}
