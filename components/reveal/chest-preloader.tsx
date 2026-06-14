"use client";

import { ensureModelViewerLoaded } from "@/components/reveal/model-viewer-loader";
import { useEffect } from "react";

const assetUrls = [
  "/assets/minecraft_chest/scene.gltf",
  "/assets/minecraft_chest/scene.bin",
  "/assets/minecraft_chest/textures/Material_baseColor.png",
  "/assets/minecraft_chest/textures/Material_metallicRoughness.png"
];

export function ChestPreloader() {
  useEffect(() => {
    ensureModelViewerLoaded();

    const links: HTMLLinkElement[] = [];
    assetUrls.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = url.endsWith(".png") ? "image" : "fetch";
      link.href = url;
      if (!url.endsWith(".png")) {
        link.crossOrigin = "anonymous";
      }
      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach((link) => link.remove());
    };
  }, []);

  return null;
}
