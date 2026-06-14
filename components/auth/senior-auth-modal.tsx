"use client";

import { GoogleMark } from "@/components/auth/google-mark";

type SeniorAuthModalProps = {
  description: string;
  errorMessage: string;
  isLoading: boolean;
  isOpen: boolean;
  isSignedIn: boolean;
  onClose: () => void;
  onLogout: () => void;
  onLogin: () => void;
  userEmail: string;
};

export function SeniorAuthModal({
  description,
  errorMessage,
  isLoading,
  isOpen,
  isSignedIn,
  onClose,
  onLogout,
  onLogin,
  userEmail
}: SeniorAuthModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="senior-auth-title">
      <div className="auth-modal-card">
        <div className="guess-modal-copy">
          <p className="eyebrow warm">Senior Auth</p>
          <h2 id="senior-auth-title">เข้าสู่ระบบสำหรับรุ่นพี่</h2>
          <p className="guess-modal-lead">{description}</p>
        </div>
        {errorMessage ? <p className="guess-error">{errorMessage}</p> : null}
        {isSignedIn ? (
          <div className="signed-in-panel">
            <p className="signed-in-email">{userEmail}</p>
            <div className="guess-modal-actions">
              <button className="ghost-button" onClick={onClose}>
                ปิด
              </button>
              <button className="primary-button guess-submit-button" onClick={onLogout}>
                ออกจากระบบ
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-modal-actions">
            <button className="google-login-button" onClick={onLogin} disabled={isLoading}>
              <GoogleMark />
              <span>{isLoading ? "กำลังพาไป Google..." : "เข้าสู่ระบบด้วย Google"}</span>
            </button>
            <button className="ghost-button" onClick={onClose}>
              ยกเลิก
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
