import { useState, useEffect } from "react";
import { Barometer, BarometerMeasurement } from "expo-sensors";
import * as Location from "expo-location";
import { calculateAltitudeFromPressure } from "../services/physics.service";

export function useAltitude() {
  const [pressure, setPressure] = useState<number | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [source, setSource] = useState<"barometer" | "gps" | "none">("none");

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    async function initAltitude() {
      try {
        const barometerAvailable = await Barometer.isAvailableAsync();
        if (barometerAvailable) {
          subscription = Barometer.addListener((data: BarometerMeasurement) => {
            const hpa = parseFloat(data.pressure.toFixed(1));
            setPressure(hpa);
            const calculatedAlt = calculateAltitudeFromPressure(hpa);
            setAltitude(calculatedAlt);
            setSource("barometer");
          });
          return;
        }

        // Fallback: GPS Location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          if (loc.coords.altitude !== null) {
            setAltitude(Math.round(loc.coords.altitude));
            setSource("gps");
          }
        }
      } catch {
        setSource("none");
      }
    }

    initAltitude();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return {
    pressure,
    altitude,
    source,
  };
}
