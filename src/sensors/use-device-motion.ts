import { useState, useEffect, useRef } from "react";
import { DeviceMotion, DeviceMotionMeasurement } from "expo-sensors";
import * as Haptics from "expo-haptics";
import {
  calculateAnglesFromGravity,
  lowPassFilter,
  isLevel,
  applyCalibration,
  OrientationAngles,
} from "../services/physics.service";
import { CalibracionRepository } from "../repositories/medicion.repository";

export function useDeviceMotionLevel() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [angles, setAngles] = useState<OrientationAngles>({ pitch: 0, roll: 0 });
  const [calibratedAngles, setCalibratedAngles] = useState<OrientationAngles>({ pitch: 0, roll: 0 });
  const [offsets, setOffsets] = useState<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });
  const [levelStatus, setLevelStatus] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);

  const prevFilteredPitch = useRef(0);
  const prevFilteredRoll = useRef(0);
  const wasLevelRef = useRef(false);

  // Cargar calibración persistida
  useEffect(() => {
    CalibracionRepository.get().then((saved) => {
      setOffsets(saved);
    });
  }, []);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    async function initSensor() {
      const available = await DeviceMotion.isAvailableAsync();
      setIsAvailable(available);

      if (!available) return;

      DeviceMotion.setUpdateInterval(50); // 20 Hz
      subscription = DeviceMotion.addListener((measurement: DeviceMotionMeasurement) => {
        if (isFrozen) return;

        const grav = measurement.accelerationIncludingGravity || measurement.acceleration;
        if (!grav) return;

        const raw = calculateAnglesFromGravity({
          x: grav.x,
          y: grav.y,
          z: grav.z,
        });

        // Aplicar filtro de paso bajo
        const smoothPitch = lowPassFilter(raw.pitch, prevFilteredPitch.current, 0.25);
        const smoothRoll = lowPassFilter(raw.roll, prevFilteredRoll.current, 0.25);
        prevFilteredPitch.current = smoothPitch;
        prevFilteredRoll.current = smoothRoll;

        const currentAngles = { pitch: smoothPitch, roll: smoothRoll };
        setAngles(currentAngles);

        const calibrated = applyCalibration(currentAngles, offsets);
        setCalibratedAngles(calibrated);

        const currentIsLevel = isLevel(calibrated.pitch, calibrated.roll);
        setLevelStatus(currentIsLevel);

        // Feedback háptico al quedar nivelado
        if (currentIsLevel && !wasLevelRef.current) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        wasLevelRef.current = currentIsLevel;
      });
    }

    initSensor();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isFrozen, offsets]);

  // Calibrar el cero
  const calibrateZero = async () => {
    const newOffsets = {
      offsetX: angles.pitch,
      offsetY: angles.roll,
    };
    setOffsets(newOffsets);
    await CalibracionRepository.save(newOffsets.offsetX, newOffsets.offsetY);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };

  // Ajuste fino en pasos de 0.1°
  const adjustFine = async (deltaPitch: number, deltaRoll: number) => {
    const newOffsets = {
      offsetX: parseFloat((offsets.offsetX + deltaPitch).toFixed(1)),
      offsetY: parseFloat((offsets.offsetY + deltaRoll).toFixed(1)),
    };
    // Restricción: ajuste no mayor a ±10°
    if (Math.abs(newOffsets.offsetX) <= 10 && Math.abs(newOffsets.offsetY) <= 10) {
      setOffsets(newOffsets);
      await CalibracionRepository.save(newOffsets.offsetX, newOffsets.offsetY);
    }
  };

  const toggleFreeze = () => {
    setIsFrozen((prev) => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  return {
    isAvailable,
    pitch: calibratedAngles.pitch,
    roll: calibratedAngles.roll,
    isLevel: levelStatus,
    isFrozen,
    offsets,
    calibrateZero,
    adjustFine,
    toggleFreeze,
  };
}
