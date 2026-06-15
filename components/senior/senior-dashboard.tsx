"use client";

import { PrimaryButton } from "@/components/shared/primary-button";
import { useToast } from "@/components/shared/toaster";
import { juniorRecordsByCode4, syncJuniorRecords } from "@/data/auth/juniors";
import { usePageTransition } from "@/components/layout/use-page-transition";
import { Clock, Home, LogOut, Shield, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

type JuniorAssignment = {
  junior_id: string;
  junior_code4: string;
  assigned_at: string;
};

const starterHints = [""];

export function SeniorDashboard() {
  const { navigate } = usePageTransition();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [greeting, setGreeting] = useState("");
  const [hints, setHints] = useState(starterHints);
  const [savedAt, setSavedAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState<JuniorAssignment[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  const filledHintCount = hints.filter((hint) => hint.trim()).length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        syncJuniorRecords();
        const [profileRes, assignRes] = await Promise.all([
          fetch("/api/senior/profile"),
          fetch("/api/senior/assignments"),
        ]);

        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile?.full_name) {
            setFullName(profile.full_name);
            setContact(profile.contact ?? "");
            setGreeting(profile.greeting ?? "");
            setHints(profile.hints?.length ? profile.hints : [""]);
            setIsAdmin(profile.is_admin ?? false);
            if (profile.updated_at) {
              setSavedAt(new Date(profile.updated_at).toLocaleString("th-TH"));
            }
          }
        }

        if (assignRes.ok) {
          const data = await assignRes.json();
          if (Array.isArray(data.assignments)) {
            setAssignments(data.assignments);
          }
        }
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
        setIsLoadingAssignments(false);
      }
    };
    fetchData();
  }, []);

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
          greeting: greeting.trim(),
          hints: hints.filter((hint) => hint.trim()),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.message ?? "บันทึกไม่สำเร็จ", "error");
        return;
      }

      toast("บันทึกสำเร็จ", "success");
      setSavedAt(new Date().toLocaleString("th-TH"));
    } catch {
      toast("บันทึกไม่สำเร็จ เซิร์ฟเวอร์มีปัญหา", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const juniorName = (code4: string) => {
    const record = juniorRecordsByCode4.get(code4);
    return record ? record.fullName.replace(/^(นาย|นางสาว)/, "").trim() : null;
  };

  if (isLoading) {
    return (
      <main className="page-shell">
        <section className="site-shell senior-shell">
          <div className="skeleton-card" style={{ marginBottom: "16px" }} />
          <div className="skeleton-line" style={{ width: "40%" }} />
          <div className="skeleton-line" />
          <div className="skeleton-line" style={{ width: "70%" }} />
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="site-shell senior-shell">
        <div className="senior-card">
          <div className="headline-stack compact">
            <p className="eyebrow warm">Senior Dashboard</p>
            <p> </p>
          </div>

          <div
            className={`senior-status-banner ${assignments.length > 0 ? "matched" : "waiting"}`}
          >
            {isLoadingAssignments ? (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div
                  className="skeleton-line"
                  style={{ width: "60%", height: "14px", margin: 0 }}
                />
              </div>
            ) : assignments.length > 0 ? (
              <>
                <UserCheck size={22} strokeWidth={2.4} />
                <div className="senior-status-text">
                  <strong>มีรุ่นน้องแล้ว!</strong>
                  <span>
                    {juniorName(assignments[0].junior_code4) ??
                      "น้องรหัส " + assignments[0].junior_code4}
                    {" (" + assignments[0].junior_id + ")"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Clock size={22} strokeWidth={2.4} />
                <div className="senior-status-text">
                  <strong>กำลังรอน้องมาหา...</strong>
                </div>
              </>
            )}
          </div>
          <h1>ตั้งค่าข้อมูลของคุณ (เพื่อแสดงตอนน้องทายชื่อถูก)</h1>
          <div className="senior-form-grid">
            <label className="senior-field">
              <span>ชื่อพี่รหัส(แก้ได้เป็นชื่อที่ไว้ให้น้องทาย)</span>
              <input
                className="senior-input"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder=""
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

          <div className="senior-field">
            <span>ข้อความต้อนรับน้อง</span>
            <textarea
              className="senior-textarea greeting"
              value={greeting}
              onChange={(event) => setGreeting(event.target.value)}
              placeholder="เช่น ยินดีต้อนรับนะครับ พี่รหัสคนใหม่!"
            />
          </div>

          <div className="senior-hints-panel">
            <div className="senior-hints-header">
              <h2>คำใบ้สำหรับน้อง</h2>
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
          </div>

          <div className="senior-actions">
            <PrimaryButton
              onClick={saveProfile}
              disabled={!fullName.trim() || filledHintCount < 1 || isSaving}
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูลรุ่นพี่"}
            </PrimaryButton>
            {savedAt ? (
              <p className="senior-saved-note">บันทึกล่าสุด {savedAt}</p>
            ) : null}
          </div>
        </div>

        <div className="senior-footer-actions">
          <button className="ghost-button" onClick={() => navigate("/")}>
            <Home size={18} strokeWidth={2} />
            กลับหน้าแรก
          </button>
          {isAdmin ? (
            <button className="ghost-button" onClick={() => navigate("/admin")}>
              <Shield size={18} strokeWidth={2} />
              เข้าสู่หน้าแอดมิน
            </button>
          ) : null}
          <button
            className="ghost-button danger"
            onClick={() => {
              window.location.href = "/logout";
            }}
          >
            <LogOut size={18} strokeWidth={2} />
            ออกจากระบบ
          </button>
        </div>
      </section>
    </main>
  );
}
