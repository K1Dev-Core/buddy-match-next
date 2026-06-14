"use client";

declare global {
  interface Window {
    __modelViewerLoader?: Promise<void>;
  }
}

export function ensureModelViewerLoaded() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (customElements.get("model-viewer")) {
    return Promise.resolve();
  }

  if (!window.__modelViewerLoader) {
    window.__modelViewerLoader = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[data-model-viewer-loader="true"]'
      ) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://unpkg.com/@google/model-viewer@4.3.1/dist/model-viewer.min.js";
      script.dataset.modelViewerLoader = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load model-viewer"));
      document.head.appendChild(script);
    });
  }

  return window.__modelViewerLoader;
}
