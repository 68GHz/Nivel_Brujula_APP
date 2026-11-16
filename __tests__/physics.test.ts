import {
  calculateAnglesFromGravity,
  lowPassFilter,
  isLevel,
  applyCalibration,
  getCardinalDirection,
  calculateAltitudeFromPressure,
} from "../src/services/physics.service";

describe("Criterio 11 - Pruebas de Lógica Pura y Física de Sensores", () => {
  describe("1. Cálculo de ángulos a partir del vector de gravedad", () => {
    it("Calcula correctamente ángulos para teléfono plano sobre una mesa (gravedad en Z = 9.8)", () => {
      const flat = { x: 0, y: 0, z: 9.8 };
      const { pitch, roll } = calculateAnglesFromGravity(flat);
      expect(Math.abs(pitch)).toBeLessThanOrEqual(0.1);
      expect(Math.abs(roll)).toBeLessThanOrEqual(0.1);
      expect(isLevel(pitch, roll)).toBe(true);
    });

    it("Calcula ángulos para inclinación aproximada de 45°", () => {
      // Inclinación de 45° sobre eje Y (roll)
      const inclined = { x: -6.93, y: 0, z: 6.93 };
      const { roll } = calculateAnglesFromGravity(inclined);
      expect(roll).toBeCloseTo(45, 0);
    });

    it("Calcula ángulos para teléfono en posición vertical (gravedad en Y = 9.8)", () => {
      const vertical = { x: 0, y: 9.8, z: 0 };
      const { pitch } = calculateAnglesFromGravity(vertical);
      expect(pitch).toBeCloseTo(90, 0);
    });
  });

  describe("2. Filtro paso bajo (suavizado de ruido)", () => {
    it("amortigua saltos abruptos de ruido en lecturas consecutivas", () => {
      const previous = 0.0;
      const noisySpike = 10.0;
      const alpha = 0.2; // 20% de la nueva lectura
      const filtered = lowPassFilter(noisySpike, previous, alpha);

      expect(filtered).toBe(2.0); // 0 + 0.2*(10 - 0) = 2.0
      expect(filtered).toBeLessThan(noisySpike);
    });
  });

  describe("3. Tolerancia de Nivelado (RF-02)", () => {
    it("detecta nivelado cuando ambos ángulos están dentro de ±0.5°", () => {
      expect(isLevel(0.2, -0.4)).toBe(true);
      expect(isLevel(0.5, 0.5)).toBe(true);
      expect(isLevel(0.6, 0.0)).toBe(false);
      expect(isLevel(0.0, -0.7)).toBe(false);
    });
  });

  describe("4. Calibración y persistencia de offsets (RF-03)", () => {
    it("resta el offset calibrado haciendo que la posición inclinada marque 0°", () => {
      const currentAngles = { pitch: 2.0, roll: -1.5 };
      const calibration = { offsetX: 2.0, offsetY: -1.5 };
      const calibrated = applyCalibration(currentAngles, calibration);

      expect(calibrated.pitch).toBe(0.0);
      expect(calibrated.roll).toBe(0.0);
      expect(isLevel(calibrated.pitch, calibrated.roll)).toBe(true);
    });
  });

  describe("5. Puntos cardinales y fórmula barométrica", () => {
    it("asigna puntos cardinales exactos", () => {
      expect(getCardinalDirection(0)).toBe("N");
      expect(getCardinalDirection(90)).toBe("E");
      expect(getCardinalDirection(180)).toBe("S");
      expect(getCardinalDirection(270)).toBe("O");
    });

    it("calcula altitud a partir de presión barométrica estándar", () => {
      expect(calculateAltitudeFromPressure(1013.25)).toBe(0);
      // A menor presión, mayor altitud
      const altitude = calculateAltitudeFromPressure(900);
      expect(altitude).toBeGreaterThan(900);
      expect(altitude).toBeLessThan(1200);
    });
  });
});
