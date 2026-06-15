"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ChestPose = {
  orbitYaw: number;
  orbitPitch: number;
  orbitRadius: number;
  orientationX: number;
  orientationY: number;
  orientationZ: number;
  offsetX: number;
  offsetY: number;
  scale: number;
};

export const defaultChestPose: ChestPose = {
  orbitYaw: 89,
  orbitPitch: 88,
  orbitRadius: 2.4,
  orientationX: 0,
  orientationY: 0,
  orientationZ: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 0.74
};

const storageKey = "buddy-match-next-chest-pose-v5";

export function useChestPose() {
  const [pose, setPose] = useState<ChestPose>(defaultChestPose);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<ChestPose>;
        setPose({ ...defaultChestPose, ...parsed });
      } catch {}
    }
    setReady(true);
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!ready) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(pose));
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pose, ready]);

  const exportValue = useMemo(() => JSON.stringify(pose, null, 2), [pose]);

  return {
    exportValue,
    pose,
    ready,
    resetPose: () => setPose(defaultChestPose),
    setPose
  };
}
