"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function usePageTransition() {
  const router = useRouter();

  const navigate = useCallback((href: string) => {
    document.body.classList.add("page-is-transitioning");
    window.setTimeout(() => {
      router.push(href);
    }, 260);
  }, [router]);

  return { navigate };
}
