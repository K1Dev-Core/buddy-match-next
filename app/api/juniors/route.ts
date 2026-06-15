import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendWebhook } from "@/lib/webhook";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from("juniors")
      .select("id, student_id, full_name, code4")
      .order("code4");
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isAllowedSeniorEmail(user.email, supabase))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const adminId = user.email.replace("@msu.ac.th", "");
    const { data: adminCheck } = await supabase.from("seniors").select("is_admin").eq("id", adminId).maybeSingle();
    if (!adminCheck?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const studentId = String(body.studentId ?? "").trim();
    const fullName = String(body.fullName ?? "").trim();
    const code4 = String(body.code4 ?? "").trim();

    if (!studentId || !fullName || !code4 || !/^\d{11}$/.test(studentId) || !/^\d{4}$/.test(code4)) {
      return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง (รหัส 11 หลัก, ชื่อ, เลข 4 ตัว)" }, { status: 400 });
    }

    const { error } = await supabase.from("juniors").upsert(
      { id: studentId, student_id: studentId, full_name: fullName, code4 },
      { onConflict: "id" }
    );
    if (error) return NextResponse.json({ error: "Server error" }, { status: 500 });

    sendWebhook("📚 แอดมินเพิ่ม/แก้ไขข้อมูลรุ่นน้อง", [
      { name: "แอดมิน", value: adminId, inline: true },
      { name: "รหัสน้อง", value: studentId, inline: true },
      { name: "ชื่อ", value: fullName, inline: true },
      { name: "รหัส 4 หลัก", value: code4, inline: true },
    ], 0x3498db);

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isAllowedSeniorEmail(user.email, supabase))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const adminId = user.email.replace("@msu.ac.th", "");
    const { data: adminCheck } = await supabase.from("seniors").select("is_admin").eq("id", adminId).maybeSingle();
    if (!adminCheck?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const code4 = searchParams.get("code");
    if (!code4) return NextResponse.json({ error: "Missing code4" }, { status: 400 });

    const { error } = await supabase.from("juniors").delete().eq("code4", code4);
    if (error) return NextResponse.json({ error: "Server error" }, { status: 500 });

    sendWebhook("🗑️ แอดมินลบข้อมูลรุ่นน้อง", [
      { name: "แอดมิน", value: adminId, inline: true },
      { name: "รหัส 4 หลัก", value: code4, inline: true },
    ], 0xe74c3c);

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
