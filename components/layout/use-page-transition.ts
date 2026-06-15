"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function usePageTransition() {
  const router = useRouter();

  const navigate = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  return { navigate };
}
