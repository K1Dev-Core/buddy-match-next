"use client";

import { useRouter } from "next/navigation";

export function usePageTransition() {
  const router = useRouter();

  return {
    navigate: (href: string) => {
      document.body.classList.add("page-is-transitioning");
      window.setTimeout(() => {
        router.push(href);
      }, 260);
    }
  };
}
