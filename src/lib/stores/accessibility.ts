"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AccessibilityState = {
  micOptional: boolean;
  setMicOptional: (v: boolean) => void;
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      micOptional: false,
      setMicOptional: (v) => set({ micOptional: v }),
    }),
    {
      name: "bvt-accessibility-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            }
          : localStorage,
      ),
    },
  ),
);

export function useAccessibilityHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(useAccessibilityStore.persist.hasHydrated());
    const unsub = useAccessibilityStore.persist.onFinishHydration(() => setHydrated(true));
    return () => {
      unsub();
    };
  }, []);
  return hydrated;
}

export function useEffectiveMicOptional(): boolean {
  const hydrated = useAccessibilityHydrated();
  const micOptional = useAccessibilityStore((s) => s.micOptional);
  return hydrated && micOptional;
}
