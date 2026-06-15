"use client";

import { ensureModelViewerLoaded } from "@/components/reveal/model-viewer-loader";
import { ChestPose, defaultChestPose } from "@/components/reveal/use-chest-pose";
import { HTMLAttributes, useEffect, useRef, useState } from "react";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "model-viewer": HTMLAttributes<HTMLElement> & {
          ref?: React.Ref<HTMLElement>;
          alt?: string;
          ar?: boolean | string;
          "auto-rotate"?: boolean | string;
          autoplay?: boolean | string;
          "camera-controls"?: boolean | string;
          "camera-orbit"?: string;
          orientation?: string;
          exposure?: string;
          interactionPrompt?: string;
          "interaction-prompt"?: string;
          rotationPerSecond?: string;
          "rotation-per-second"?: string;
          shadowIntensity?: string;
          "shadow-intensity"?: string;
          src?: string;
        };
      }
    }
  }
}

type ChestViewerProps = {
  className?: string;
  pose?: ChestPose;
  state?: "idle" | "opening" | "exiting";
};

type ModelViewerElement = HTMLElement & {
  pause?: () => void;
  play?: (options?: { repetitions?: number }) => void;
  currentTime?: number;
};

export function ChestViewer({
  className = "",
  pose = defaultChestPose,
  state = "idle"
}: ChestViewerProps) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    ensureModelViewerLoaded()
      .then(() => {
        if (mounted) {
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsLoaded(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const viewer = viewerRef.current;
    if (!viewer) return;

    if (state === "idle") {
      viewer.pause?.();
      viewer.currentTime = 0;
      return;
    }

    if (state === "opening") {
      viewer.currentTime = 0;
      viewer.play?.({ repetitions: 1 });
      return;
    }

    viewer.pause?.();
  }, [isLoaded, state]);

  return (
    <div className={`chest-viewer-shell chest-state-${state} ${className}`.trim()}>
      <div
        className="chest-model-stage"
        style={
          {
            "--chest-offset-x": `${pose.offsetX}px`,
            "--chest-offset-y": `${pose.offsetY}px`,
            "--chest-scale": pose.scale
          } as React.CSSProperties
        }
      >
        {!isLoaded ? <div className="chest-loading-poster" /> : null}
        <model-viewer
          ref={viewerRef}
          className="chest-model-viewer"
          src="/assets/minecraft_chest/scene.gltf"
          alt="Minecraft chest"
          shadow-intensity="1"
          exposure="1.1"
          camera-controls={false}
          interaction-prompt="none"
          camera-orbit={`${pose.orbitYaw}deg ${pose.orbitPitch}deg ${pose.orbitRadius}m`}
          orientation={`${pose.orientationX}deg ${pose.orientationY}deg ${pose.orientationZ}deg`}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
