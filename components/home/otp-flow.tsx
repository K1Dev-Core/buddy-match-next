"use client";

import { PrimaryButton } from "@/components/shared/primary-button";
import { usePageTransition } from "@/components/layout/use-page-transition";
import { Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const demoCode = "2408";

export function OtpFlow() {
  const { navigate } = usePageTransition();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const joinedCode = useMemo(() => digits.join(""), [digits]);
  const isReady = joinedCode.length === 4;

  const updateDigit = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextValue;
    setDigits(nextDigits);
    if (nextValue && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submit = (code: string) => {
    navigate(`/matching?code=${code}`);
  };

  return (
    <div className="entry-panel">
      <div className="headline-stack">
        <p className="eyebrow">Buddy Finder</p>
        <h1>กรอกรหัสสี่ตัวท้ายเพื่อหาพี่รหัส</h1>
        <p className="lead">
          เชื่อมต่อกับรุ่นพี่ในคณะของคุณ เพื่อเริ่มต้นการผจญภัยในรั้วมหาวิทยาลัยไปด้วยกัน
        </p>
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
          disabled={!isReady}
          fullWidth
          icon={<Search size={18} strokeWidth={2.4} />}
        >
          Confirm
        </PrimaryButton>
        <button className="text-button" onClick={() => submit(demoCode)}>
          ลองเดโมด้วยรหัส {demoCode}
        </button>
      </div>
    </div>
  );
}
