import { isAllowedSeniorEmail } from "@/lib/auth/senior-allowlist";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const contact = String(body.contact ?? "").trim();
    const hints = (body.hints ?? []) as string[];

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

    const { error } = await supabase.from("seniors").upsert(
      {
        id: seniorId,
        full_name: fullName,
        contact,
        hints,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );

    if (error) {
      return NextResponse.json(
        { message: "บันทึกไม่สำเร็จ", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json(
      { message: "เซิร์ฟเวอร์มีปัญหา" },
      { status: 500 }
    );
  }
}
