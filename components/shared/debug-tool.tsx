"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function DebugTool() {
  const searchParams = useSearchParams();
  const loaded = useRef(false);

  useEffect(() => {
    const enabled =
      searchParams.get("debug") === "1" ||
      localStorage.getItem("bm-debug") === "1";

    if (!enabled || loaded.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    script.onload = () => {
      const eruda = (window as unknown as Record<string, unknown>).eruda as {
        init: () => void;
      };
      eruda?.init();
    };
    document.head.appendChild(script);
  }, [searchParams]);

  return null;
}
