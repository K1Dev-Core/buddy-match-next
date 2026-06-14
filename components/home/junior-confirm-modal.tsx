"use client";

import { JuniorRecord } from "@/data/auth/juniors";
import { PrimaryButton } from "@/components/shared/primary-button";

type JuniorConfirmModalProps = {
  candidate: JuniorRecord | null;
  code4: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function getFirstName(fullName: string): string {
  const first = fullName.split(" ")[0];
  const titles = ["นาย", "นางสาว", "นาง", "ด.ช.", "ด.ญ."];
  for (const t of titles) {
    if (first.startsWith(t)) return first.slice(t.length);
  }
  return first;
}

export function JuniorConfirmModal({
  candidate,
  code4,
  isOpen,
  onClose,
  onConfirm
}: JuniorConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="junior-confirm-title">
      <div className="guess-modal-card junior-confirm-card">
        <div className="guess-modal-copy">
          <p className="eyebrow warm">ยืนยันตัวตน</p>
          <h2 id="junior-confirm-title">นี่คือคุณใช่ไหม?</h2>
          <p className="guess-modal-lead">
            ระบบกำลังตรวจสอบเลขท้าย 4 ตัวของรหัสนักศึกษา
          </p>
        </div>
        <div className="junior-confirm-result">
          {candidate ? (
            <>
              <p className="junior-code4">รหัสท้าย {code4}</p>
              <h3>{getFirstName(candidate.fullName)}</h3>
              <p>กดยืนยันเพื่อสุ่มพี่รหัสของคุณ</p>
            </>
          ) : (
            <>
              <h3>ไม่พบข้อมูล</h3>
              <p>ยังไม่มีรายชื่อน้องที่ตรงกับเลขท้าย 4 ตัวนี้</p>
            </>
          )}
        </div>
        <div className="guess-modal-actions">
          <button className="ghost-button" onClick={onClose}>
            กลับไปแก้
          </button>
          {candidate ? (
            <PrimaryButton className="guess-submit-button" onClick={onConfirm}>
              ยืนยัน
            </PrimaryButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
