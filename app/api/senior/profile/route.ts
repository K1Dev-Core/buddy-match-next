import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendWebhook } from "@/lib/webhook";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json(null, { status: 401 });
    }

    const email = user.email;
    if (!isAllowedSeniorEmail(email)) {
      return NextResponse.json(null, { status: 403 });
    }

    const seniorId = email.replace("@msu.ac.th", "");
    const { data, error } = await supabase
      .from("seniors")
      .select("full_name, contact, hints, greeting, updated_at, is_admin")
      .eq("id", seniorId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(null, { status: 500 });
    }

    return NextResponse.json(data ?? null);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const contact = String(body.contact ?? "").trim();
    const hints = (body.hints ?? []) as string[];
    const greeting = String(body.greeting ?? "").trim();

    if (!fullName || hints.length === 0) {
      return NextResponse.json(
        { message: "กรุณากรอกชื่อและคำใบ้" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง" },
        { status: 401 }
      );
    }

    const email = user.email;

    if (!isAllowedSeniorEmail(email)) {
      return NextResponse.json(
        { message: "บัญชีนี้ไม่มีสิทธิ์ใช้ระบบรุ่นพี่" },
        { status: 403 }
      );
    }

    const seniorId = email.replace("@msu.ac.th", "");

    const { error } = await supabase.rpc("upsert_senior_profile", {
      p_id: seniorId,
      p_full_name: fullName,
      p_contact: contact,
      p_hints: hints,
      p_greeting: greeting
    });

    if (error) {
      return NextResponse.json(
        { message: "บันทึกไม่สำเร็จ", error: error.message },
        { status: 500 }
      );
    }

    sendWebhook("📝 รุ่นพี่บันทึกข้อมูล", [
      { name: "รหัสรุ่นพี่", value: seniorId, inline: true },
      { name: "ชื่อ", value: fullName, inline: true },
      { name: "คำใบ้", value: hints.join(", ") || "(ไม่มี)", inline: false }
    ]);

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json(
      { message: "เซิร์ฟเวอร์มีปัญหา" },
      { status: 500 }
    );
  }
}
