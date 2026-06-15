"use client";

import { juniorRecordsByCode4 } from "@/data/auth/juniors";
import { JuniorConfirmModal } from "@/components/home/junior-confirm-modal";
import { PrimaryButton } from "@/components/shared/primary-button";
import { SeniorCountBadge } from "@/components/home/senior-count-badge";
import { usePageTransition } from "@/components/layout/use-page-transition";
import { encodeToken } from "@/lib/token";
import { playSound } from "@/lib/sound";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export function OtpFlow() {
  const { navigate } = usePageTransition();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [matchingOpen, setMatchingOpen] = useState<boolean | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const soundThrottleRef = useRef(0);

  const playSoundThrottled = (path: string) => {
    const now = Date.now();
    if (now - soundThrottleRef.current < 100) return;
    soundThrottleRef.current = now;
    playSound(path);
  };

  const joinedCode = useMemo(() => digits.join(""), [digits]);
  const isReady = joinedCode.length === 4;

  useEffect(() => {
    fetch("/api/match/status")
      .then((r) => r.json())
      .then((d) => setMatchingOpen(d.open !== false))
      .catch(() => setMatchingOpen(true));
  }, []);
  const candidate = useMemo(
    () => juniorRecordsByCode4.get(joinedCode) ?? null,
    [joinedCode],
  );

  const updateDigit = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextValue;
    setDigits(nextDigits);
    if (nextValue) {
      playSoundThrottled("/assets/sfx/4.wav");
      if (index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      playSoundThrottled("/assets/sfx/4.wav");
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submit = (code: string) => {
    setIsConfirmOpen(true);
  };

  const confirmIdentity = async () => {
    if (!candidate) return;
    setIsLoading(true);

    const token = encodeToken(joinedCode, candidate.studentId);

    try {
      const res = await fetch(
        `/api/match/lookup?juniorId=${encodeURIComponent(candidate.studentId)}`,
      );
      const data = await res.json();

      if (data && data.assignment) {
        sessionStorage.setItem("bm-senior", JSON.stringify(data));
        navigate(`/reveal?t=${encodeToken(joinedCode, candidate.studentId)}`);
      } else {
        navigate(`/matching?t=${token}`);
      }
    } catch {
      navigate(`/matching?t=${token}`);
    }
  };

  return (
    <>
      <div className="entry-panel">
        <div className="headline-stack">
          <h1>กรอกรหัสสี่ตัวท้ายเพื่อหาพี่รหัส</h1>
        </div>
        <div className="otp-row">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                inputRefs.current[index] = node;
              }}
              className="otp-input"
              value={digit}
              onChange={(event) => updateDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>
        <div className="action-stack">
          <PrimaryButton
            onClick={() => submit(joinedCode)}
            disabled={!isReady || isLoading || matchingOpen === false}
            fullWidth
            icon={<Search size={18} strokeWidth={2.4} />}
          >
            {isLoading ? "กำลังตรวจสอบ..." : matchingOpen === null ? "กำลังโหลด..." : matchingOpen ? "ค้นหา" : "ระบบปิดอยู่"}
          </PrimaryButton>
        </div>
        <SeniorCountBadge />
      </div>
      <JuniorConfirmModal
        candidate={candidate}
        code4={joinedCode}
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmIdentity}
      />
    </>
  );
}
