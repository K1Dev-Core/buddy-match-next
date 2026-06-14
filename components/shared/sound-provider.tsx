"use client";

import { playSound } from "@/lib/sound";
import { useEffect } from "react";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, .open-box-button, .primary-button, .ghost-button, .icon-button, .google-login-button, .admin-filter-tab")) {
        playSound("/assets/sfx/3.wav");
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return <>{children}</>;
}
