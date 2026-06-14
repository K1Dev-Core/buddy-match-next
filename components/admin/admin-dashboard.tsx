"use client";

import { PrimaryButton } from "@/components/shared/primary-button";
import { usePageTransition } from "@/components/layout/use-page-transition";
import { juniorRecordsByCode4 } from "@/data/auth/juniors";
import { useToast } from "@/components/shared/toaster";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Home, Lock, Search, Shield, Trash2, Unlock, UserCheck, UserX, Users } from "lucide-react";

type SeniorInfo = {
  id: string;
  fullName: string;
  contact: string;
  hints: string[];
  greeting: string;
  updatedAt: string | null;
  isAdmin: boolean;
  assignmentCap: number;
  currentCount: number;
  juniorId: string | null;
  juniorCode4: string | null;
  assignedAt: string | null;
};

type AdminStats = {
  totalSeniors: number;
  assignedSeniors: number;
  unassignedSeniors: number;
};

export function AdminDashboard() {
  const { navigate } = usePageTransition();
  const { toast } = useToast();
  const [seniors, setSeniors] = useState<SeniorInfo[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSenior, setSelectedSenior] = useState<SeniorInfo | null>(null);
  const [clearingId, setClearingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "assigned" | "free">("all");
  const [matchingOpen, setMatchingOpen] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const loadData = async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    try {
      const [seniorsRes, statsRes, statusRes] = await Promise.all([
        fetch("/api/admin/seniors"),
        fetch("/api/admin/stats"),
        fetch("/api/admin/matching-status"),
      ]);

      if (statusRes.ok) {
        const d = await statusRes.json();
        setMatchingOpen(d.open);
      }

      if (seniorsRes.ok) {
        const data = await seniorsRes.json();
        setSeniors(Array.isArray(data) ? data : []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch {
      toast("โหลดข้อมูลไม่สำเร็จ", "error");
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const clearAssignment = async (seniorId: string) => {
    setClearingId(seniorId);
    try {
      const res = await fetch("/api/admin/clear", {
        body: JSON.stringify({ seniorId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!res.ok) {
        toast("ลบไม่สำเร็จ", "error");
        return;
      }

      toast("ลบการมอบหมายสำเร็จ", "success");
      loadData(false);
      if (selectedSenior?.id === seniorId) {
        setSelectedSenior(null);
      }
    } catch {
      toast("ลบไม่สำเร็จ", "error");
    } finally {
      setClearingId(null);
    }
  };

  const juniorName = (code4: string | null) => {
    if (!code4) return null;
    const record = juniorRecordsByCode4.get(code4);
    if (!record) return null;
    return record.fullName.replace(/^(นาย|นางสาว)/, "").trim();
  };

  const toggleMatching = async () => {
    setTogglingStatus(true);
    try {
      const res = await fetch("/api/admin/matching-status", {
        body: JSON.stringify({ open: !matchingOpen }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (res.ok) {
        const d = await res.json();
        setMatchingOpen(d.open);
        toast(d.open ? "เปิดระบบสุ่มพี่รหัสแล้ว" : "ปิดระบบสุ่มพี่รหัสแล้ว", "success");
      } else {
        toast("เปลี่ยนสถานะไม่สำเร็จ", "error");
      }
    } catch {
      toast("เปลี่ยนสถานะไม่สำเร็จ", "error");
    } finally {
      setTogglingStatus(false);
    }
  };

  const hintCount = (hints: string[]) =>
    hints.filter((h) => h.trim()).length;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const filteredSeniors = useMemo(() => {
    let result = seniors;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((s) => s.id.toLowerCase().includes(q) || s.fullName.toLowerCase().includes(q));
    }

    if (filterStatus === "assigned") {
      result = result.filter((s) => s.juniorId);
    } else if (filterStatus === "free") {
      result = result.filter((s) => !s.juniorId);
    }

    return result;
  }, [seniors, searchQuery, filterStatus]);

  const assignedCount = seniors.filter((s) => s.juniorId).length;
  const unassignedCount = seniors.filter((s) => !s.juniorId).length;

  const exportCsv = () => {
    const a = document.createElement("a");
    a.href = "/api/admin/export";
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="admin-page-shell">
      <section className="site-shell admin-content">
        <div className="admin-header">
          <button className="icon-button" onClick={() => navigate("/senior")}>
            <ArrowLeft size={20} strokeWidth={2.3} />
          </button>
          <div>
            <p className="eyebrow warm">Admin Panel</p>
            <h1>แดชบอร์ดแอดมิน</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="admin-loading">กำลังโหลดข้อมูล...</div>
        ) : (
          <>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <Users size={24} strokeWidth={2.2} />
                <div>
                  <span className="admin-stat-value">{stats?.totalSeniors ?? seniors.length}</span>
                  <span className="admin-stat-label">พี่รหัสทั้งหมด</span>
                </div>
              </div>
              <div className="admin-stat-card">
                <UserCheck size={24} strokeWidth={2.2} />
                <div>
                  <span className="admin-stat-value">{assignedCount}</span>
                  <span className="admin-stat-label">มีน้องแล้ว</span>
                </div>
              </div>
              <div className="admin-stat-card">
                <UserX size={24} strokeWidth={2.2} />
                <div>
                  <span className="admin-stat-value">{unassignedCount}</span>
                  <span className="admin-stat-label">ยังไม่มีน้อง</span>
                </div>
              </div>
            </div>

            <div className="admin-status-toggle">
              <div className="admin-toggle-info">
                <span className="admin-toggle-label">ระบบสุ่มพี่รหัส</span>
                <span className={`admin-toggle-badge ${matchingOpen ? "open" : "closed"}`}>
                  {matchingOpen ? "เปิด" : "ปิด"}
                </span>
              </div>
              <button
                className={`admin-toggle-switch ${matchingOpen ? "is-on" : "is-off"}`}
                disabled={togglingStatus}
                onClick={toggleMatching}
                role="switch"
                aria-checked={matchingOpen}
              >
                <span className="admin-toggle-knob" />
              </button>
            </div>

            <div className="admin-tip">
              <Shield size={16} strokeWidth={2.2} />
              <span>คลิกที่รายชื่อพี่รหัสเพื่อดูข้อมูลเต็ม (คำใบ้ ข้อความต้อนรับ ช่องทางติดต่อ) — กดปุ่ม <span className="admin-tip-highlight">ลบ</span> เพื่อลบน้องรหัสออก ทำให้พี่คนนั้นกลับมาว่างอีกครั้ง</span>
            </div>

            <div className="admin-toolbar">
              <div className="admin-search">
                <Search size={16} strokeWidth={2.2} />
                <input
                  className="admin-search-input"
                  placeholder="ค้นหาตามรหัสนิสิตหรือชื่อ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="ghost-button small" onClick={exportCsv}>
                <Download size={16} strokeWidth={2} />
                Export CSV
              </button>
              <div className="admin-filter-tabs">
                <button
                  className={`admin-filter-tab ${filterStatus === "all" ? "active" : ""}`}
                  onClick={() => setFilterStatus("all")}
                >
                  ทั้งหมด
                </button>
                <button
                  className={`admin-filter-tab ${filterStatus === "free" ? "active" : ""}`}
                  onClick={() => setFilterStatus("free")}
                >
                  ว่าง
                </button>
                <button
                  className={`admin-filter-tab ${filterStatus === "assigned" ? "active" : ""}`}
                  onClick={() => setFilterStatus("assigned")}
                >
                  มีน้องแล้ว
                </button>
              </div>
            </div>

            <div className="admin-senior-list">
              {filteredSeniors.length === 0 ? (
                <div className="admin-empty">
                  <p>{seniors.length === 0 ? "ยังไม่มีข้อมูลรุ่นพี่" : "ไม่พบรายชื่อที่ค้นหา"}</p>
                </div>
              ) : (
                filteredSeniors.map((senior) => (
                  <div
                    key={senior.id}
                    className={`admin-senior-row ${selectedSenior?.id === senior.id ? "is-selected" : ""}`}
                  >
                    <div
                      className="admin-senior-info"
                      onClick={() =>
                        setSelectedSenior(
                          selectedSenior?.id === senior.id ? null : senior
                        )
                      }
                    >
                      <div className="admin-senior-main">
                        <span className="admin-senior-name">
                          {senior.fullName}
                          {senior.isAdmin ? (
                            <Shield size={14} strokeWidth={2.5} className="admin-badge-icon" />
                          ) : null}
                        </span>
                        <span className="admin-senior-id">{senior.id}</span>
                      </div>
                      <div className="admin-senior-meta">
                        <span className={`admin-status-pill ${senior.juniorId ? "assigned" : "free"}`}>
                          {senior.juniorId ? "มีน้อง" : "ว่าง"}
                        </span>
                        <span className="admin-hint-count">
                          คำใบ้ {hintCount(senior.hints)} ข้อ
                        </span>
                      </div>
                    </div>

                    {senior.juniorId ? (
                      <button
                        className="ghost-button danger small"
                        disabled={clearingId === senior.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAssignment(senior.id);
                        }}
                      >
                        <Trash2 size={16} strokeWidth={2} />
                        {clearingId === senior.id ? "กำลังลบ..." : "ลบ"}
                      </button>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            {selectedSenior ? (
              <div className="modal-overlay" onClick={() => setSelectedSenior(null)}>
                <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="admin-detail-header">
                    <h2>{selectedSenior.fullName}</h2>
                    <button className="ghost-button small" onClick={() => setSelectedSenior(null)}>
                      ปิด
                    </button>
                  </div>
                  {selectedSenior.isAdmin ? (
                    <span className="admin-badge">แอดมิน</span>
                  ) : null}
                  <div className="admin-detail-grid">
                    <div className="admin-detail-field">
                      <span className="admin-detail-label">รหัสนักศึกษา</span>
                      <span className="admin-detail-value">{selectedSenior.id}</span>
                    </div>
                    <div className="admin-detail-field">
                      <span className="admin-detail-label">ช่องทางติดต่อ</span>
                      <span className="admin-detail-value">
                        {selectedSenior.contact || "-"}
                      </span>
                    </div>
                    <div className="admin-detail-field">
                      <span className="admin-detail-label">ข้อความต้อนรับ</span>
                      <span className="admin-detail-value">
                        {selectedSenior.greeting || "-"}
                      </span>
                    </div>
                    <div className="admin-detail-field">
                      <span className="admin-detail-label">สถานะ</span>
                      <span className="admin-detail-value">
                        {selectedSenior.juniorId
                          ? `มีน้องแล้ว ${juniorName(selectedSenior.juniorCode4) ?? "รหัส " + selectedSenior.juniorCode4} (${selectedSenior.juniorId})`
                          : "ยังไม่มีน้อง"}
                      </span>
                    </div>
                    <div className="admin-detail-field">
                      <span className="admin-detail-label">อัปเดตล่าสุด</span>
                      <span className="admin-detail-value">{formatDate(selectedSenior.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="admin-detail-hints">
                    <span className="admin-detail-label">คำใบ้ ({hintCount(selectedSenior.hints)} ข้อ)</span>
                    <div className="admin-hint-list">
                      {selectedSenior.hints.filter((h) => h.trim()).map((hint, i) => (
                        <div key={i} className="admin-hint-item">{hint}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

      </section>
      <div className="admin-footer">
        <button className="ghost-button" onClick={() => navigate("/")}>
          <Home size={18} strokeWidth={2} />
          กลับหน้าแรก
        </button>
      </div>
    </main>
  );
}
