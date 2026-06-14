"use client";

import { PrimaryButton } from "@/components/shared/primary-button";
import { getSupabaseBrowserClient, hasSupabaseBrowserEnv } from "@/lib/supabase/browser";
import { useMemo, useState } from "react";

const starterHints = [""];

export function SeniorDashboard() {
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [hints, setHints] = useState(starterHints);
  const [savedAt, setSavedAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filledHintCount = useMemo(
    () => hints.filter((hint) => hint.trim()).length,
    [hints]
  );

  const saveProfile = async () => {
    if (!fullName.trim() || filledHintCount < 1 || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/senior/profile", {
        body: JSON.stringify({
          fullName: fullName.trim(),
          contact: contact.trim(),
          hints: hints.filter((hint) => hint.trim())
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "บันทึกไม่สำเร็จ");
        return;
      }

      setSavedAt(new Date().toLocaleString("th-TH"));
    } catch {
      alert("บันทึกไม่สำเร็จ เซิร์ฟเวอร์มีปัญหา");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="site-shell senior-shell">
        <div className="senior-card">
          <div className="headline-stack compact">
            <p className="eyebrow warm">Senior Dashboard</p>
            <h1>ตั้งค่าข้อมูลรุ่นพี่ของคุณ</h1>
            <p className="lead">
              ใส่ชื่อพี่รหัส คำใบ้ 1 ข้อ และช่องทางติดต่อ เมื่อน้องทายถูก ระบบจะใช้ข้อมูลนี้แสดงทันที
            </p>
          </div>

          <div className="senior-form-grid">
            <label className="senior-field">
              <span>ชื่อพี่รหัส</span>
              <input
                className="senior-input"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="เช่น พี่โมริ"
              />
            </label>

            <label className="senior-field">
              <span>ช่องทางติดต่อ</span>
              <input
                className="senior-input"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="เช่น Line, Instagram, Discord หรือข้อความติดต่อ"
              />
            </label>
          </div>

          <div className="senior-hints-panel">
            <div className="senior-hints-header">
              <h2>คำใบ้สำหรับน้อง</h2>
              <p>ขั้นต่ำ 1 คำใบ้ ตอนนี้กรอกแล้ว {filledHintCount} คำ</p>
            </div>
            <div className="senior-hint-list">
              {hints.map((hint, index) => (
                <textarea
                  key={index}
                  className="senior-textarea"
                  value={hint}
                  onChange={(event) => {
                    const next = [...hints];
                    next[index] = event.target.value;
                    setHints(next);
                  }}
                  placeholder={`คำใบ้ข้อที่ ${index + 1}`}
                />
              ))}
            </div>
            <button
              className="ghost-button"
              onClick={() => setHints((current) => [...current, ""])}
              type="button"
            >
              เพิ่มคำใบ้อีกข้อ
            </button>
          </div>

          <div className="senior-actions">
            <PrimaryButton
              onClick={saveProfile}
              disabled={!fullName.trim() || filledHintCount < 1 || isSaving}
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูลรุ่นพี่"}
            </PrimaryButton>
            {savedAt ? <p className="senior-saved-note">บันทึกล่าสุด {savedAt}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
