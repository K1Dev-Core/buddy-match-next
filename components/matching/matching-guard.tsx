"use client";

import { usePageTransition } from "@/components/layout/use-page-transition";
import { MatchingExperience } from "@/components/matching/matching-experience";
import { decodeToken, encodeCode } from "@/lib/token";
import { useEffect, useState } from "react";

type MatchingGuardProps = {
  token: string | null;
};

type MatchingState =
  | { status: "loading" }
  | { status: "ready" }
  | { message: string; status: "empty" | "exhausted" | "error" };

export function MatchingGuard({ token }: MatchingGuardProps) {
  const { navigate } = usePageTransition();
  const [matchingState, setMatchingState] = useState<MatchingState>({ status: "loading" });

  const decoded = token ? decodeToken(token) : null;
  const code = decoded?.code ?? null;
  const juniorId = decoded?.juniorId ?? null;

  useEffect(() => {
    if (!juniorId || !code) {
      setMatchingState({
        message: "ยังไม่ได้ยืนยันตัวตนของน้องก่อนเข้าสุ่ม",
        status: "error"
      });
      return;
    }

    const run = async () => {
      try {
        const response = await fetch("/api/match/assign", {
          body: JSON.stringify({ juniorCode4: code, juniorId }),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        });

        const payload = await response.json();

        if (response.ok && payload?.assignment) {
          setMatchingState({ status: "ready" });
          return;
        }

        if (response.ok && payload?.status === "existing" && payload?.assignment) {
          const ct = encodeCode(code);
          navigate(`/reveal?t=${ct}`);
          return;
        }

        setMatchingState({
          message:
            payload?.status === "exhausted"
              ? "พี่รหัสถูกสุ่มหมดแล้ว"
              : payload?.status === "empty"
                ? "ยังไม่มีพี่รหัสเปิดรับน้อง"
                : "ระบบสุ่มพี่รหัสมีปัญหา ลองใหม่อีกครั้ง",
          status:
            payload?.status === "exhausted" || payload?.status === "empty"
              ? payload.status
              : "error"
        });
      } catch {
        setMatchingState({
          message: "ระบบสุ่มพี่รหัสมีปัญหา ลองใหม่อีกครั้ง",
          status: "error"
        });
      }
    };

    run();
  }, [code, juniorId, navigate]);

  if (matchingState.status === "loading") {
    return null;
  }

  if (matchingState.status !== "ready") {
    return (
      <section className="matching-empty-shell">
        <div className="matching-empty-card">
          <p className="eyebrow warm">
            {matchingState.status === "exhausted"
              ? "สุ่มครบแล้ว"
              : "ยังสุ่มไม่ได้"}
          </p>
          <h1>
            {matchingState.status === "exhausted"
              ? "ตอนนี้ไม่มีพี่รหัสเหลือแล้ว"
              : "ตอนนี้ยังสุ่มพี่รหัสให้ไม่ได้"}
          </h1>
          <p className="lead">{matchingState.message}</p>
          <button className="primary-button" onClick={() => navigate("/")}>
            กลับหน้าแรก
          </button>
        </div>
      </section>
    );
  }

  return <MatchingExperience code={code} juniorId={juniorId} />;
}
