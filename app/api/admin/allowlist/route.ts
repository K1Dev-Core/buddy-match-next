import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendWebhook } from "@/lib/webhook";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await isAllowedSeniorEmail(user.email, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const adminId = user.email.replace("@msu.ac.th", "");
    const { data: adminCheck } = await supabase
      .from("seniors").select("is_admin").eq("id", adminId).maybeSingle();
    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data } = await supabase
      .from("senior_allowlist")
      .select("id")
      .order("id");

    return NextResponse.json(Array.isArray(data) ? data.map(r => r.id) : []);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await isAllowedSeniorEmail(user.email, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const adminId = user.email.replace("@msu.ac.th", "");
    const { data: adminCheck } = await supabase
      .from("seniors").select("is_admin").eq("id", adminId).maybeSingle();
    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const targetId = String(body.seniorId ?? "").trim();
    if (!targetId || !/^\d{11}$/.test(targetId)) {
      return NextResponse.json({ error: "รูปแบบรหัสนิสิตไม่ถูกต้อง" }, { status: 400 });
    }

    const { error } = await supabase.rpc("add_senior_allowlist", { p_id: targetId });
    if (error) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    sendWebhook("✅ แอดมินเพิ่มรุ่นพี่ใน allowlist", [
      { name: "แอดมิน", value: adminId, inline: true },
      { name: "รหัสที่เพิ่ม", value: targetId, inline: true },
    ], 0x2ecc71);

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await isAllowedSeniorEmail(user.email, supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const adminId = user.email.replace("@msu.ac.th", "");
    const { data: adminCheck } = await supabase
      .from("seniors").select("is_admin").eq("id", adminId).maybeSingle();
    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const targetId = String(body.seniorId ?? "").trim();
    if (!targetId) {
      return NextResponse.json({ error: "Missing seniorId" }, { status: 400 });
    }

    const { error } = await supabase.rpc("remove_senior_allowlist", { p_id: targetId });
    if (error) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    sendWebhook("❌ แอดมินลบรุ่นพี่จาก allowlist", [
      { name: "แอดมิน", value: adminId, inline: true },
      { name: "รหัสที่ลบ", value: targetId, inline: true },
    ], 0xe74c3c);

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
