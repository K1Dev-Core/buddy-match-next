"use client";

import { usePageTransition } from "@/components/layout/use-page-transition";
import { encodeCode, encodeToken } from "@/lib/token";
import { getBuddyFromCode } from "@/lib/match";
import { useEffect, useMemo, useRef, useState } from "react";

type MatchingExperienceProps = {
  code: string | null;
  juniorId: string | null;
};

export function MatchingExperience({ code, juniorId }: MatchingExperienceProps) {
  const { navigate } = usePageTransition();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const { buddy, code: safeCode } = useMemo(() => getBuddyFromCode(code), [code]);
  const [progress, setProgress] = useState(0);

  const progressRadius = 132;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const progressOffset =
    progressCircumference - (progress / 100) * progressCircumference;

  const loadingCopy = "Finding the perfect senior buddy to help you navigate campus life.";

  useEffect(() => {
    const startTime = performance.now();
    const duration = 7600;
    let hasNavigated = false;
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - ratio, 3);
      const next = Math.round(100 * eased);
      setProgress(next);

      if (next >= 100 && !hasNavigated) {
        hasNavigated = true;
        setTimeout(() => {
          const ct = juniorId ? encodeToken(safeCode, juniorId) : encodeCode(safeCode);
          navigateRef.current(`/reveal?t=${ct}`);
        }, 450);
        return;
      }

      if (ratio < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [safeCode]);

  return (
    <section className="matching-shell">
      <div className="matching-visual">
        <div className="matching-visual-stage">
          <div className="matching-orbit-ring">
            <div className="matching-orbit-track" />
          </div>

          <div className="matching-orbit-field">
            {buddy.orbitLogos.map((logo, index) => (
              <div
                key={`${logo.alt}-${index}`}
                className={`matching-orbit-floater matching-orbit-floater-${index + 1}`}
              >
                <div className="matching-orbit-chip">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    width="34"
                    height="34"
                    className="matching-orbit-logo"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="matching-core">
            <svg
              className="matching-progress-ring"
              viewBox="0 0 320 320"
              aria-hidden="true"
            >
              <circle
                className="matching-progress-base"
                cx="160"
                cy="160"
                r={progressRadius}
              />
              <circle
                className="matching-progress-value"
                cx="160"
                cy="160"
                r={progressRadius}
                style={{
                  stroke: buddy.palette.outline,
                  strokeDasharray: progressCircumference,
                  strokeDashoffset: progressOffset
                }}
              />
            </svg>

            <div className="matching-core-image-shell">
              <span className="matching-question-mark">?</span>
            </div>

            <div
              className="matching-score-pill"
              style={{
                background: buddy.palette.outline
              }}
            >
              {progress}%
            </div>
          </div>
        </div>
      </div>

      <div className="matching-copy">
        <h1>กำลังสุ่มหาพี่สายรหัสของคุณ...</h1>
        <p>{loadingCopy}</p>
      </div>
    </section>
  );
}
