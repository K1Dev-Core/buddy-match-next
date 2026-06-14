import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json(null, { status: 401 });
    }

    const seniorId = user.email.replace("@msu.ac.th", "");
    const { data: adminCheck } = await supabase
      .from("seniors")
      .select("is_admin")
      .eq("id", seniorId)
      .maybeSingle();

    if (!adminCheck?.is_admin) {
      return NextResponse.json(null, { status: 403 });
    }

    const { data: seniors } = await supabase.rpc("get_all_seniors");

    if (!Array.isArray(seniors)) {
      return new NextResponse("No data", { status: 500 });
    }

    const header = "รหัสนักศึกษา,ชื่อ,ช่องทางติดต่อ,คำใบ้,ข้อความต้อนรับ,แอดมิน,สถานะ,รหัสน้อง,เลขท้ายน้อง,วันที่มอบหมาย";
    const rows = seniors.map((s: Record<string, unknown>) => {
      const hints = Array.isArray(s.hints) ? (s.hints as string[]).filter(Boolean).join("; ") : "";
      const status = s.juniorId ? "มีน้อง" : "ว่าง";
      return [
        escapeCsv(String(s.id ?? "")),
        escapeCsv(String(s.fullName ?? "")),
        escapeCsv(String(s.contact ?? "")),
        escapeCsv(hints),
        escapeCsv(String(s.greeting ?? "")),
        s.isAdmin ? "ใช่" : "",
        status,
        escapeCsv(String(s.juniorId ?? "")),
        escapeCsv(String(s.juniorCode4 ?? "")),
        escapeCsv(String(s.assignedAt ?? "")),
      ].join(",");
    });

    const csv = "\ufeff" + header + "\n" + rows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="buddy-match-seniors-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch {
    return new NextResponse("Server error", { status: 500 });
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
