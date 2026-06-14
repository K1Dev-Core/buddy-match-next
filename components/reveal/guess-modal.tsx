"use client";

type GuessModalProps = {
  errorMessage: string;
  guess: string;
  isOpen: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function GuessModal({
  errorMessage,
  guess,
  isOpen,
  onChange,
  onClose,
  onSubmit,
}: GuessModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guess-title"
    >
      <div className="guess-modal-card">
        <div className="guess-modal-copy">
          <p className="eyebrow warm">Guess Name</p>
          <h2 id="guess-title">พิมพ์ชื่อพี่รหัสที่คุณคิดว่าใช่</h2>
          <p className="guess-modal-lead">
            ใส่ชื่อเล่นหรือชื่อที่คุณเดาไว้
            ถ้าถูกเราจะเปิดคำทักทายของพี่รหัสให้ทันที
          </p>
        </div>
        <input
          autoFocus
          className="guess-input"
          value={guess}
          onChange={(event) => onChange(event.target.value)}
          placeholder=""
        />
        {errorMessage ? <p className="guess-error">{errorMessage}</p> : null}
        <div className="guess-modal-actions">
          <button className="ghost-button" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="primary-button guess-submit-button"
            onClick={onSubmit}
          >
            ตรวจคำตอบ
          </button>
        </div>
      </div>
    </div>
  );
}
