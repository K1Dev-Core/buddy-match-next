"use client";

import { CodeBackdrop } from "@/components/layout/code-backdrop";
import { DecorLayer } from "@/components/layout/decor-layer";
import { PrimaryButton } from "@/components/shared/primary-button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <CodeBackdrop />
      <DecorLayer mode="home" />
      <main className="page-shell">
        <section className="site-shell" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="matching-empty-card">
            <p className="eyebrow warm">ระบบมีปัญหา</p>
            <h1>เกิดข้อผิดพลาด</h1>
            <p className="lead">กรุณาลองใหม่อีกครั้ง หรือกลับหน้าแรก</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <PrimaryButton onClick={reset} fullWidth>ลองอีกครั้ง</PrimaryButton>
              <button className="ghost-button" onClick={() => { window.location.href = "/"; }} style={{ justifyContent: "center" }}>
                กลับหน้าแรก
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
