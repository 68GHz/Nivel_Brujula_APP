import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { getCardinalDirection } from "../services/physics.service";

export function useCompass() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [cardinal, setCardinal] = useState<string>("N");
  const [accuracy, setAccuracy] = useState<number>(0);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    async function initCompass() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setIsAvailable(false);
          return;
        }

        const headingAvailable = await Location.hasServicesEnabledAsync();
        setIsAvailable(headingAvailable);

        subscription = await Location.watchHeadingAsync((data) => {
          const deg = Math.round(data.trueHeading >= 0 ? data.trueHeading : data.magHeading);
          setHeading(deg);
          setCardinal(getCardinalDirection(deg));
          setAccuracy(data.accuracy);
        });
      } catch {
        setIsAvailable(false);
      }
    }

    initCompass();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return {
    isAvailable,
    heading,
    cardinal,
    accuracy,
  };
}
