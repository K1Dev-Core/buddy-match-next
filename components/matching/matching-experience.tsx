"use client";

import { usePageTransition } from "@/components/layout/use-page-transition";
import { encodeCode } from "@/lib/token";
import { getBuddyFromCode } from "@/lib/match";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type MatchingExperienceProps = {
  code: string | null;
  juniorId: string | null;
};

export function MatchingExperience({ code, juniorId }: MatchingExperienceProps) {
  const { navigate } = usePageTransition();
  const { buddy, code: safeCode } = useMemo(() => getBuddyFromCode(code), [code]);
  const [progress, setProgress] = useState(0);
  const hasNavigatedRef = useRef(false);

  const progressRadius = 132;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const progressOffset =
    progressCircumference - (progress / 100) * progressCircumference;

  const loadingCopy = "Finding the perfect senior buddy to help you navigate campus life.";

  useEffect(() => {
    const target = 100;
    let frame = 0;
    let startedAt = 0;

    const animate = (timestamp: number) => {
      if (!startedAt) {
        startedAt = timestamp;
      }

      const elapsed = timestamp - startedAt;
      const duration = 7600;
      const ratio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - ratio, 3);
      const next = Math.round(target * eased);

      setProgress(next);

      if (ratio < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    frame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (progress < 100 || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;

    const timer = window.setTimeout(() => {
      const ct = encodeCode(safeCode);
      navigate(`/reveal?t=${ct}`);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [juniorId, navigate, progress, safeCode]);

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
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={34}
                    height={34}
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
