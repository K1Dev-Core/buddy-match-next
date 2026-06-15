"use client";

import { syncJuniorRecords } from "@/data/auth/juniors";
import { usePageTransition } from "@/components/layout/use-page-transition";
import { useToast } from "@/components/shared/toaster";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Home, Plus, Search, Trash2, Users, GraduationCap } from "lucide-react";

export function AdminSettings() {
  const { navigate } = usePageTransition();
  const { toast } = useToast();
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [allowlistInput, setAllowlistInput] = useState("");
  const [allowlistLoading, setAllowlistLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [allowlistSearch, setAllowlistSearch] = useState("");
  const [juniors, setJuniors] = useState<{ id: string; studentId: string; fullName: string; code4: string }[]>([]);
  const [juniorsLoading, setJuniorsLoading] = useState(false);
  const [juniorForm, setJuniorForm] = useState({ studentId: "", fullName: "", code4: "" });
  const [juniorFormLoading, setJuniorFormLoading] = useState(false);
  const [juniorSearch, setJuniorSearch] = useState("");

  const filteredAllowlist = useMemo(() => {
    if (!allowlistSearch.trim()) return allowlist;
    const q = allowlistSearch.trim().toLowerCase();
    return allowlist.filter(id => id.toLowerCase().includes(q));
  }, [allowlist, allowlistSearch]);

  const filteredJuniors = useMemo(() => {
    if (!juniorSearch.trim()) return juniors;
    const q = juniorSearch.trim().toLowerCase();
    return juniors.filter(j =>
      j.fullName.toLowerCase().includes(q) ||
      j.code4.toLowerCase().includes(q) ||
      j.studentId.toLowerCase().includes(q)
    );
  }, [juniors, juniorSearch]);

  const fetchAllowlist = async () => {
    setAllowlistLoading(true);
    try {
      const res = await fetch("/api/admin/allowlist");
      if (res.ok) setAllowlist(await res.json());
    } catch {} finally {
      setAllowlistLoading(false);
    }
  };

  const addToAllowlist = async () => {
    const id = allowlistInput.trim();
    if (!id || !/^\d{11}$/.test(id)) {
      toast("กรุณากรอกรหัสนิสิต 11 หลัก", "error");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seniorId: id }),
      });
      if (res.ok) {
        toast("เพิ่มรุ่นพี่เรียบร้อย", "success");
        setAllowlistInput("");
        fetchAllowlist();
      } else {
        const d = await res.json();
        toast(d?.error || "เพิ่มไม่สำเร็จ", "error");
      }
    } catch {
      toast("เพิ่มไม่สำเร็จ", "error");
    } finally {
      setAddLoading(false);
    }
  };

  const removeFromAllowlist = async (id: string) => {
    try {
      const res = await fetch("/api/admin/allowlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seniorId: id }),
      });
      if (res.ok) {
        toast("ลบรุ่นพี่ออกจาก allowlist แล้ว", "success");
        fetchAllowlist();
      } else {
        toast("ลบไม่สำเร็จ", "error");
      }
    } catch {
      toast("ลบไม่สำเร็จ", "error");
    }
  };

  const fetchJuniors = async () => {
    setJuniorsLoading(true);
    try {
      const res = await fetch("/api/juniors");
      if (res.ok) {
        const raw = await res.json();
        setJuniors(raw.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          studentId: r.student_id as string,
          fullName: r.full_name as string,
          code4: r.code4 as string,
        })));
      }
    } catch {} finally {
      setJuniorsLoading(false);
    }
  };

  const addJunior = async () => {
    const { studentId, fullName, code4 } = juniorForm;
    if (!studentId || !fullName || !code4) {
      toast("กรุณากรอกข้อมูลให้ครบ", "error");
      return;
    }
    if (!/^\d{11}$/.test(studentId)) {
      toast("รหัสนิสิตต้อง 11 หลัก", "error");
      return;
    }
    if (!/^\d{4}$/.test(code4)) {
      toast("เลขท้ายต้อง 4 หลัก", "error");
      return;
    }
    setJuniorFormLoading(true);
    try {
      const res = await fetch("/api/juniors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, fullName, code4 }),
      });
      if (res.ok) {
        toast("เพิ่ม/แก้ไขข้อมูลรุ่นน้องสำเร็จ", "success");
        setJuniorForm({ studentId: "", fullName: "", code4: "" });
        fetchJuniors();
        syncJuniorRecords();
      } else {
        const d = await res.json();
        toast(d?.error || "บันทึกไม่สำเร็จ", "error");
      }
    } catch {
      toast("บันทึกไม่สำเร็จ", "error");
    } finally {
      setJuniorFormLoading(false);
    }
  };

  const deleteJunior = async (code4: string) => {
    try {
      const res = await fetch(`/api/juniors?code=${encodeURIComponent(code4)}`, { method: "DELETE" });
      if (res.ok) {
        toast("ลบข้อมูลรุ่นน้องแล้ว", "success");
        fetchJuniors();
        syncJuniorRecords();
      } else {
        toast("ลบไม่สำเร็จ", "error");
      }
    } catch {
      toast("ลบไม่สำเร็จ", "error");
    }
  };

  useEffect(() => {
    fetchAllowlist();
    fetchJuniors();
  }, []);

  return (
    <main className="admin-page-shell">
      <section className="site-shell admin-content">
        <div className="admin-header">
          <button className="icon-button" onClick={() => navigate("/admin")}>
            <ArrowLeft size={20} strokeWidth={2.3} />
          </button>
          <div>
            <p className="eyebrow warm">Admin Settings</p>
            <h1>ตั้งค่าระบบ</h1>
          </div>
        </div>

        <details className="admin-allowlist-section">
          <summary className="admin-allowlist-summary">
            <Users size={16} strokeWidth={2.2} />
            จัดการรายชื่อรุ่นพี่ที่อนุญาต ({allowlist.length} คน)
          </summary>
          <div className="admin-allowlist-body">
            <div className="admin-allowlist-input-row">
              <input
                className="admin-search-input"
                placeholder="รหัสนิสิต 11 หลัก..."
                value={allowlistInput}
                onChange={(e) => setAllowlistInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addToAllowlist()}
              />
              <button className="ghost-button small" onClick={addToAllowlist} disabled={addLoading}>
                <Plus size={16} strokeWidth={2} />
                {addLoading ? "กำลังเพิ่ม..." : "เพิ่ม"}
              </button>
            </div>
            {allowlist.length > 0 && (
              <div className="admin-search" style={{ marginTop: "8px" }}>
                <Search size={16} strokeWidth={2.2} />
                <input
                  className="admin-search-input"
                  placeholder="ค้นหารหัสรุ่นพี่..."
                  value={allowlistSearch}
                  onChange={(e) => setAllowlistSearch(e.target.value)}
                />
              </div>
            )}
            {allowlistLoading ? (
              <div className="admin-loading" style={{ padding: "8px 0" }}>กำลังโหลด...</div>
            ) : filteredAllowlist.length === 0 ? (
              <p className="admin-allowlist-empty">
                {allowlist.length === 0 ? "ยังไม่มีรายชื่อใน allowlist (ใช้เฉพาะ hardcoded list)" : "ไม่พบรายชื่อที่ค้นหา"}
              </p>
            ) : (
              <div className="admin-allowlist-list">
                {filteredAllowlist.map((id) => (
                  <div key={id} className="admin-allowlist-item">
                    <span>{id}</span>
                    <button className="ghost-button danger small" onClick={() => removeFromAllowlist(id)}>
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>

        <details className="admin-allowlist-section">
          <summary className="admin-allowlist-summary">
            <GraduationCap size={16} strokeWidth={2.2} />
            จัดการข้อมูลรุ่นน้อง ({juniors.length} คน)
          </summary>
          <div className="admin-allowlist-body">
            <div className="admin-allowlist-input-row" style={{ flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", gap: "8px", width: "100%", flexWrap: "wrap" }}>
                <input
                  className="admin-search-input"
                  placeholder="รหัสนิสิต 11 หลัก..."
                  value={juniorForm.studentId}
                  onChange={(e) => setJuniorForm(f => ({ ...f, studentId: e.target.value }))}
                  style={{ flex: 1, minWidth: "160px" }}
                />
                <input
                  className="admin-search-input"
                  placeholder="เลขท้าย 4 หลัก..."
                  value={juniorForm.code4}
                  onChange={(e) => setJuniorForm(f => ({ ...f, code4: e.target.value }))}
                  style={{ flex: 0, width: "130px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                <input
                  className="admin-search-input"
                  placeholder="ชื่อ-นามสกุล..."
                  value={juniorForm.fullName}
                  onChange={(e) => setJuniorForm(f => ({ ...f, fullName: e.target.value }))}
                  style={{ flex: 1 }}
                  onKeyDown={(e) => e.key === "Enter" && addJunior()}
                />
                <button className="ghost-button small" onClick={addJunior} disabled={juniorFormLoading}>
                  <Plus size={16} strokeWidth={2} />
                  {juniorFormLoading ? "กำลังบันทึก..." : "เพิ่ม/แก้ไข"}
                </button>
              </div>
            </div>
            {juniors.length > 0 && (
              <div className="admin-search" style={{ marginTop: "8px" }}>
                <Search size={16} strokeWidth={2.2} />
                <input
                  className="admin-search-input"
                  placeholder="ค้นหาชื่อ รหัสนิสิต หรือเลขท้าย..."
                  value={juniorSearch}
                  onChange={(e) => setJuniorSearch(e.target.value)}
                />
              </div>
            )}
            {juniorsLoading ? (
              <div className="admin-loading" style={{ padding: "8px 0" }}>กำลังโหลด...</div>
            ) : filteredJuniors.length === 0 ? (
              <p className="admin-allowlist-empty">
                {juniors.length === 0 ? "ยังไม่มีข้อมูลรุ่นน้องในฐานข้อมูล" : "ไม่พบข้อมูลที่ค้นหา"}
              </p>
            ) : (
              <div className="admin-allowlist-list" style={{ maxHeight: "360px", overflowY: "auto" }}>
                {filteredJuniors.map((j) => (
                  <div key={j.id} className="admin-allowlist-item">
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                      <span style={{ fontWeight: 600 }}>{j.fullName}</span>
                      <span style={{ fontSize: "0.8em", opacity: 0.6 }}>{j.studentId} · {j.code4}</span>
                    </div>
                    <button
                      className="ghost-button danger small"
                      onClick={() => {
                        if (confirm(`ลบข้อมูล ${j.fullName}?`)) deleteJunior(j.code4);
                      }}
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="admin-allowlist-empty" style={{ marginTop: "6px", fontSize: "0.85em" }}>
              ใช้ปุ่ม "เพิ่ม/แก้ไข" เพื่อเพิ่มน้องใหม่ หรือแก้ไขข้อมูลน้องที่มีรหัส 11 หลักซ้ำกัน
            </p>
          </div>
        </details>
      </section>
      <div className="admin-footer">
        <button className="ghost-button" onClick={() => navigate("/admin")}>
          <Home size={18} strokeWidth={2} />
          กลับไปแดชบอร์ด
        </button>
      </div>
    </main>
  );
}
